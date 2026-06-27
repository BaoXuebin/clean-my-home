// In-memory scan state + pub/sub for SSE. Single in-flight scan at a time.

import { buildScanPlan } from './scan/plan.js';
import { scanAll } from './scan/engine.js';
import { readCache, writeCache } from './scan/cache.js';

let concurrency = 64;
let lastResult = null; // last completed payload (from scan or cache)
let scan = null; // active scan state or null
let jobCounter = 0;

const subscribers = new Set(); // Set<(event)=>void>

export function setOptions(opts = {}) {
  if (opts.concurrency) concurrency = opts.concurrency;
}

/** Load cache at boot so the dashboard can render instantly. */
export async function init() {
  const cache = await readCache();
  if (cache) lastResult = cache;
  return cache;
}

export function getCached() {
  return lastResult;
}

export function isRunning() {
  return !!scan && !scan.finished;
}

function broadcast(event) {
  for (const fn of subscribers) {
    try {
      fn(event);
    } catch {
      /* a dead subscriber; the req close handler will clean up */
    }
  }
}

/** Subscribe to scan events. Immediately receives a snapshot of current state. */
export function subscribe(fn) {
  subscribers.add(fn);
  fn(snapshot());
  return () => subscribers.delete(fn);
}

export function snapshot() {
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
export function startScan() {
  if (isRunning()) {
    return { jobId: scan.jobId, status: 'running', reused: true };
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
  runScan(jobId).catch(() => {
    if (scan) scan.finished = true;
  });
  return { jobId, status: 'started' };
}

async function runScan(jobId) {
  const items = await buildScanPlan();
  scan.totalAgents = items.length;
  broadcast({ type: 'scan-start', startedAt: scan.startedAt, count: items.length, ids: items.map((i) => i.id) });

  const payload = await scanAll({
    items,
    concurrency,
    emit: (event) => {
      switch (event.type) {
        case 'agent-start':
          scan.current = event.id;
          break;
        case 'agent-progress':
          scan.live.set(event.id, { bytes: event.bytes, files: event.files });
          break;
        case 'agent-done':
          scan.live.set(event.id, { bytes: event.bytes, files: event.files });
          scan.doneCount++;
          scan.current = null;
          break;
        default:
          break;
      }
      broadcast(event);
    },
  });

  scan.finished = true;
  lastResult = payload;
  await writeCache(payload);
  broadcast({ type: 'scan-done', payload });
}
