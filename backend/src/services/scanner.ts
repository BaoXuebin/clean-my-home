// In-memory scan state + pub/sub. Single in-flight scan at a time.
// Consumed by the Socket.io layer (replaces the old SSE handler in state.js).

import { buildScanPlan } from '../scan/plan.js';
import { scanAll } from '../scan/engine.js';
import { readCache, writeCache } from '../scan/cache.js';
import type { ScanPayload, ScanSnapshot, ScanEvent, LiveEntry } from '../types.js';

let concurrency = 64;
let lastResult: ScanPayload | null = null; // last completed payload (from scan or cache)
let scan: ScanState | null = null; // active scan state or null
let jobCounter = 0;

interface ScanState {
  jobId: string;
  startedAt: number;
  finished: boolean;
  totalAgents: number;
  doneCount: number;
  current: string | null;
  live: Map<string, LiveEntry>;
}

const subscribers = new Set<(event: ScanEvent | ScanSnapshot) => void>();

export function setOptions(opts: { concurrency?: number } = {}): void {
  if (opts.concurrency) concurrency = opts.concurrency;
}

/** Load cache at boot so the dashboard can render instantly. */
export async function init(): Promise<ScanPayload | null> {
  const cache = await readCache();
  if (cache) lastResult = cache;
  return cache;
}

export function getCached(): ScanPayload | null {
  return lastResult;
}

export function isRunning(): boolean {
  return !!scan && !scan.finished;
}

function broadcast(event: ScanEvent | ScanSnapshot): void {
  for (const fn of subscribers) {
    try {
      fn(event);
    } catch {
      /* a dead subscriber; the socket disconnect handler will clean up */
    }
  }
}

/** Subscribe to scan events. Immediately receives a snapshot of current state. */
export function subscribe(fn: (event: ScanEvent | ScanSnapshot) => void): () => void {
  subscribers.add(fn);
  fn(snapshot());
  return () => {
    subscribers.delete(fn);
  };
}

export function snapshot(): ScanSnapshot {
  return {
    type: 'snapshot',
    running: isRunning(),
    startedAt: scan ? scan.startedAt : null,
    count: scan ? scan.totalAgents : 0,
    done: scan ? scan.doneCount : 0,
    current: scan ? scan.current : null,
    live: scan ? Object.fromEntries(scan.live) : {},
    hasCache: !!lastResult,
  };
}

/** Start a scan. If one is already running, return its job id. */
export function startScan(): { jobId: string; status: string; reused?: boolean } {
  if (isRunning()) {
    return { jobId: scan!.jobId, status: 'running', reused: true };
  }
  const jobId = `scan_${Date.now()}_${++jobCounter}`;
  scan = {
    jobId,
    startedAt: Date.now(),
    finished: false,
    totalAgents: 0,
    doneCount: 0,
    current: null,
    live: new Map(),
  };
  runScan().catch(() => {
    if (scan) scan.finished = true;
  });
  return { jobId, status: 'started' };
}

async function runScan(): Promise<void> {
  const items = await buildScanPlan();
  scan!.totalAgents = items.length;
  broadcast({ type: 'scan-start', startedAt: scan!.startedAt, count: items.length, ids: items.map((i) => i.id) });

  const payload = await scanAll({
    items,
    concurrency,
    emit: (event) => {
      switch (event.type) {
        case 'agent-start':
          scan!.current = event.id;
          break;
        case 'agent-progress':
          scan!.live.set(event.id, { bytes: event.bytes, files: event.files });
          break;
        case 'agent-done':
          scan!.live.set(event.id, { bytes: event.bytes, files: event.files });
          scan!.doneCount++;
          scan!.current = null;
          break;
        default:
          break;
      }
      // scan-start / scan-done are emitted by scanAll too, but runScan
      // broadcasts the authoritative versions (scan-done after the cache is
      // written, so a client refetch sees fresh data). Avoid double-firing.
      if (
        event.type === 'agent-start' ||
        event.type === 'agent-progress' ||
        event.type === 'agent-done'
      ) {
        broadcast(event);
      }
    },
  });

  scan!.finished = true;
  lastResult = payload;
  await writeCache(payload);
  broadcast({ type: 'scan-done', payload });
}
