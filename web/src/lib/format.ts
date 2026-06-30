// Pure formatting helpers (mirrors backend/src/util/format.ts). No IO.

const BYTES = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/** Human-readable byte size, e.g. 1234567 -> "1.2 MB". */
export function fmtBytes(n: number, digits = 1): string {
  if (!isFinite(n) || n < 0) return '—';
  if (n === 0) return '0 B';
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), BYTES.length - 1);
  const v = n / Math.pow(1024, i);
  const value = i === 0 ? String(Math.round(v)) : v.toFixed(digits);
  return `${value} ${BYTES[i]}`;
}

/** Locale-formatted integer. */
export function fmtNum(n: number): string {
  return isFinite(n) ? Number(n).toLocaleString('en-US') : '0';
}

/** Percent from a fraction. */
export function fmtPct(f: number, digits = 1): string {
  return isFinite(f) ? `${(f * 100).toFixed(digits)}%` : '—';
}

/** Duration from ms. */
export function fmtDur(ms: number): string {
  if (!isFinite(ms) || ms < 0) return '—';
  if (ms < 1000) return '<1s';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export type T = (key: string, vars?: Record<string, string | number>) => string;

/** Relative time from a timestamp, localised via `t`. */
export function fmtAgo(ts: number | null | undefined, now: number, t: T): string {
  if (!ts) return '—';
  const diff = now - ts;
  if (diff < 0) return t('justNow');
  const s = Math.round(diff / 1000);
  if (s < 60) return t('justNow');
  const m = Math.floor(s / 60);
  if (m < 60) return t('mAgo', { m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('hAgo', { h });
  return t('dAgo', { d: Math.floor(h / 24) });
}
