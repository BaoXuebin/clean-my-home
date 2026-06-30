// Shared domain types for the scan engine + API.

export type Category = 'cli' | 'extension' | 'ide' | 'cache' | 'residual';

/** Platform-specific path specs for a catalog agent. */
export interface AgentPaths {
  any?: string[];
  win?: string[];
  mac?: string[];
  linux?: string[];
}

/** A built-in agent definition (catalog). */
export interface Agent {
  id: string;
  name: string;
  vendor: string;
  category: Category;
  color: string;
  paths: AgentPaths;
}

/** An item to scan: a catalog agent existing on this OS, or a discovered cache/residual directory. */
export interface ScanItem {
  id: string;
  name: string;
  vendor: string;
  category: Category;
  color: string;
  paths: string[]; // resolved absolute paths
}

/** One path within an agent's breakdown. */
export interface PathBreakdown {
  path: string;
  exists: boolean;
  bytes: number;
  files: number;
  isLink?: boolean;
}

/** Aggregated result for one scanned agent. */
export interface AgentResult {
  id: string;
  name: string;
  vendor: string;
  category: Category;
  color: string;
  bytes: number;
  files: number;
  dirs: number;
  skipped: number;
  paths: PathBreakdown[];
}

export interface ByteTotal {
  bytes: number;
  files: number;
}

/** The full cached/returned payload (cache shape, version 1). */
export interface ScanPayload {
  version: 1;
  scannedAt: number;
  home: string;
  scanDurationMs: number;
  total: ByteTotal;
  agents: AgentResult[];
}

/** Live per-agent accumulator during a scan. */
export interface LiveEntry {
  bytes: number;
  files: number;
}

/** Snapshot sent on socket connect (and as the initial progress frame). */
export interface ScanSnapshot {
  type: 'snapshot';
  running: boolean;
  startedAt: number | null;
  count: number;
  done: number;
  current: string | null;
  live: Record<string, LiveEntry>;
  hasCache: boolean;
}

export interface ScanStartEvent {
  type: 'scan-start';
  startedAt: number;
  count: number;
  ids: string[];
}
export interface AgentStartEvent {
  type: 'agent-start';
  id: string;
  name: string;
  color: string;
}
export interface AgentProgressEvent {
  type: 'agent-progress';
  id: string;
  bytes: number;
  files: number;
}
export type AgentDoneEvent = { type: 'agent-done' } & AgentResult;
export interface ScanDoneEvent {
  type: 'scan-done';
  payload: ScanPayload;
}

export type ScanEvent =
  | ScanStartEvent
  | AgentStartEvent
  | AgentProgressEvent
  | AgentDoneEvent
  | ScanDoneEvent;
