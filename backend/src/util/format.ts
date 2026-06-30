// Pure formatting helpers. No IO, no side effects — safe to unit test.

const BYTES_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/** Human-readable byte size, e.g. 1234567 -> "1.2 MB". */
export function formatBytes(bytes: number, digits = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTES_UNITS.length - 1);
  const value = bytes / Math.pow(1024, i);
  const d = i === 0 ? 0 : digits;
  return `${value.toFixed(d)} ${BYTES_UNITS[i]}`;
}

/** Locale-formatted integer, e.g. 1234567 -> "1,234,567". */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('en-US');
}

/** Percent from a fraction, e.g. 0.251 -> "25.1%". */
export function formatPercent(fraction: number, digits = 1): string {
  if (!Number.isFinite(fraction)) return '—';
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Duration from ms, e.g. 950 -> "<1s", 12500 -> "13s", 95000 -> "1m 35s". */
export function formatEta(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  if (ms < 1000) return '<1s';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs}s`;
}

/** Relative time from a timestamp, e.g. "2h ago". */
export function formatRelativeTime(ts: number | null | undefined, now: number = Date.now()): string {
  if (!ts) return '';
  const diff = now - ts;
  if (diff < 0) return 'just now';
  const s = Math.round(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
