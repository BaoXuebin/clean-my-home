import { create } from 'zustand';
import type { QueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import type {
  SnapshotPayload,
  ScanStartPayload,
  AgentStartPayload,
  AgentProgressPayload,
  AgentDonePayload,
  AgentMeta,
} from '@/types';

// Ephemeral scan-progress state, fed by Socket.io. The connection + listeners
// are wired once (setupScanSocket) in main.tsx; components only read selectors.
interface ScanProgressState {
  scanning: boolean;
  target: number;
  done: number;
  currentId: string | null;
  live: Record<string, { bytes: number; files: number }>;
  agentMeta: Record<string, AgentMeta>;
}

export const useScanStore = create<ScanProgressState>(() => ({
  scanning: false,
  target: 0,
  done: 0,
  currentId: null,
  live: {},
  agentMeta: {},
}));

let wired = false;

/** Attach the Socket.io listeners once. Idempotent. */
export function setupScanSocket(queryClient: QueryClient): void {
  if (wired) return;
  wired = true;
  const socket = getSocket();

  socket.on('scan:snapshot', (d: SnapshotPayload) => {
    useScanStore.setState({
      scanning: d.running,
      target: d.count,
      done: d.done,
      currentId: d.current,
      live: d.running ? d.live : {},
    });
  });

  socket.on('scan:start', (d: ScanStartPayload) => {
    useScanStore.setState({ scanning: true, target: d.count, done: 0, currentId: null, live: {} });
  });

  socket.on('scan:agent-start', (d: AgentStartPayload) => {
    const s = useScanStore.getState();
    const prev = s.agentMeta[d.id] || ({} as AgentMeta);
    useScanStore.setState({
      currentId: d.id,
      agentMeta: { ...s.agentMeta, [d.id]: { ...prev, name: d.name, color: d.color } },
    });
  });

  socket.on('scan:agent-progress', (d: AgentProgressPayload) => {
    const s = useScanStore.getState();
    useScanStore.setState({ live: { ...s.live, [d.id]: { bytes: d.bytes, files: d.files } } });
  });

  socket.on('scan:agent-done', (d: AgentDonePayload) => {
    const s = useScanStore.getState();
    useScanStore.setState({
      currentId: null,
      done: s.done + 1,
      live: { ...s.live, [d.id]: { bytes: d.bytes, files: d.files } },
      agentMeta: {
        ...s.agentMeta,
        [d.id]: { name: d.name, color: d.color, vendor: d.vendor, category: d.category },
      },
    });
  });

  socket.on('scan:done', () => {
    useScanStore.setState({ scanning: false, live: {}, currentId: null });
    // The final payload is persisted server-side; refetch the cached snapshot.
    queryClient.invalidateQueries({ queryKey: ['data'] });
  });
}
