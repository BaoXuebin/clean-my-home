// Frontend domain types (mirror of the backend shapes that cross the wire).

export type Category = 'cli' | 'extension' | 'ide' | 'cache' | 'residual';

export interface PathBreakdown {
  path: string;
  exists: boolean;
  bytes: number;
  files: number;
  isLink?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  vendor: string;
  category: Category;
  color: string;
  bytes: number;
  files: number;
  dirs?: number;
  skipped?: number;
  paths: PathBreakdown[];
  provisional?: boolean; // shown during a live scan before agent-done arrives
}

export interface ByteTotal {
  bytes: number;
  files: number;
}

export interface ScanPayload {
  version: 1;
  scannedAt: number;
  home: string;
  scanDurationMs: number;
  total: ByteTotal;
  agents: Agent[];
  fresh?: boolean;
}

export type DataResponse =
  | { status: 'none'; running: boolean }
  | {
      status: 'ready';
      running: boolean;
      scannedAt: number;
      home: string;
      scanDurationMs: number;
      total: ByteTotal;
      agents: Agent[];
      fresh: boolean;
    };

export interface MetaResponse {
  version: string;
  cachePath: string;
  running: boolean;
}

// Socket event payloads (the server strips the `type` field; the channel name discriminates).
export interface SnapshotPayload {
  running: boolean;
  startedAt: number | null;
  count: number;
  done: number;
  current: string | null;
  live: Record<string, { bytes: number; files: number }>;
  hasCache: boolean;
}
export interface ScanStartPayload {
  startedAt: number;
  count: number;
  ids: string[];
}
export interface AgentStartPayload {
  id: string;
  name: string;
  color: string;
}
export interface AgentProgressPayload {
  id: string;
  bytes: number;
  files: number;
}
export type AgentDonePayload = Agent;
export interface ScanDonePayload {
  payload: ScanPayload;
}

export interface AgentMeta {
  name: string;
  color: string;
  vendor: string;
  category: Category;
}
