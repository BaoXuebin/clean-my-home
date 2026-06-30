import { useMemo } from 'react';
import { useScanData } from './useScanData';
import { useScanStore } from '@/store/useScanStore';
import type { Agent, AgentMeta, DataResponse } from '@/types';

/** Merge the cached model with live (in-flight) accumulators — mirrors the
 *  original effectiveAgents(): provisional agents appear with meta-derived
 *  name/colour; zero-byte agents are dropped. */
function effectiveAgents(
  data: DataResponse | undefined,
  live: Record<string, { bytes: number; files: number }>,
  agentMeta: Record<string, AgentMeta>
): Agent[] {
  const modelAgents = data?.status === 'ready' ? data.agents : [];
  const byId = new Map<string, Agent>();
  for (const a of modelAgents) byId.set(a.id, { ...a });
  for (const id in live) {
    const lv = live[id];
    const m = agentMeta[id] || ({ name: id, color: '#64748B', vendor: '', category: 'residual' } as AgentMeta);
    const cur = byId.get(id);
    if (cur) {
      cur.bytes = lv.bytes;
      cur.files = lv.files;
    } else {
      byId.set(id, {
        id,
        name: m.name,
        color: m.color,
        vendor: m.vendor,
        category: m.category,
        bytes: lv.bytes,
        files: lv.files,
        paths: [],
        provisional: true,
      });
    }
  }
  return [...byId.values()].filter((a) => a.bytes > 0);
}

export interface Dashboard {
  data: DataResponse | undefined;
  agents: Agent[];
  totalBytes: number;
  totalFiles: number;
  scanning: boolean;
  target: number;
  done: number;
  currentId: string | null;
  agentMeta: Record<string, AgentMeta>;
  hasData: boolean;
  scannedAt: number | null;
  fresh: boolean;
  scanDurationMs: number;
  home: string;
  /** Counts by category — the true "agents" stat excludes cache/residual. */
  counts: { agent: number; cache: number; residual: number };
}

const AGENT_CATS = new Set(['cli', 'extension', 'ide']);

export function useDashboard(): Dashboard {
  const { data } = useScanData();
  const live = useScanStore((s) => s.live);
  const agentMeta = useScanStore((s) => s.agentMeta);
  const scanning = useScanStore((s) => s.scanning);
  const target = useScanStore((s) => s.target);
  const done = useScanStore((s) => s.done);
  const currentId = useScanStore((s) => s.currentId);

  const agents = useMemo(() => effectiveAgents(data, live, agentMeta), [data, live, agentMeta]);
  const totalBytes = useMemo(() => agents.reduce((s, a) => s + a.bytes, 0), [agents]);
  const totalFiles = useMemo(() => agents.reduce((s, a) => s + (a.files || 0), 0), [agents]);
  const counts = useMemo(() => {
    let agent = 0, cache = 0, residual = 0;
    for (const a of agents) {
      if (AGENT_CATS.has(a.category)) agent++;
      else if (a.category === 'cache') cache++;
      else residual++;
    }
    return { agent, cache, residual };
  }, [agents]);

  return {
    data,
    agents,
    totalBytes,
    totalFiles,
    scanning,
    target,
    done,
    currentId,
    agentMeta,
    hasData: agents.length > 0 || data?.status === 'ready',
    scannedAt: data?.status === 'ready' ? data.scannedAt : null,
    fresh: data?.status === 'ready' ? data.fresh : false,
    scanDurationMs: data?.status === 'ready' ? data.scanDurationMs : 0,
    home: data?.status === 'ready' ? data.home : '',
    counts,
  };
}
