// Cross-platform path helpers. Pure (no filesystem IO) except resolveExisting()/pathExists().

import os from 'node:os';
import path from 'node:path';
import { lstatSync } from 'node:fs';
import type { AgentPaths } from '../types.js';

/** The user's home directory. */
export function home(): string {
  return os.homedir();
}

/** Normalised platform key: 'win' | 'mac' | 'linux'. */
export function platform(): 'win' | 'mac' | 'linux' {
  const p = process.platform;
  if (p === 'win32') return 'win';
  if (p === 'darwin') return 'mac';
  return 'linux';
}

const ENV_RE = /%([A-Za-z0-9_]+)%/g;

/**
 * Expand a catalog path spec into an absolute path:
 *  - `%APPDATA%` / `%LOCALAPPDATA%` etc. are substituted from process.env (Windows).
 *  - a leading `~` is expanded against home().
 *  - anything else is treated as relative to home().
 *  - already-absolute paths are normalised in place.
 */
export function expandPath(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let s = String(raw).replace(ENV_RE, (_m, name: string) =>
    process.env[name] != null ? (process.env[name] as string) : `%${name}%`
  );
  if (s.startsWith('~')) {
    s = path.join(home(), s.slice(1));
  }
  if (path.isAbsolute(s)) return path.normalize(s);
  return path.normalize(path.join(home(), s));
}

/**
 * Resolve a catalog entry's path specs to concrete absolute paths for the
 * current OS (merging `any` + the platform-specific list, de-duplicated).
 * Does NOT touch the filesystem.
 */
export function resolvePaths(entry: { paths?: AgentPaths }): string[] {
  const plat = platform();
  const raws = [...(entry.paths?.any ?? []), ...(entry.paths?.[plat] ?? [])];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raws) {
    const abs = expandPath(r);
    if (!abs || seen.has(abs)) continue;
    seen.add(abs);
    out.push(abs);
  }
  return out;
}

/**
 * Filter to the resolved paths that actually exist on disk.
 * Each item: { path, exists, isLink }. Used by the detail drawer.
 */
export function resolveExisting(entry: { paths?: AgentPaths }): { path: string; exists: boolean; isLink: boolean }[] {
  return resolvePaths(entry).map((p) => {
    try {
      const st = lstatSync(p);
      return { path: p, exists: true, isLink: st.isSymbolicLink() };
    } catch {
      return { path: p, exists: false, isLink: false };
    }
  });
}

/** True if a path exists (file or directory), following nothing. */
export function pathExists(p: string): boolean {
  try {
    lstatSync(p);
    return true;
  } catch {
    return false;
  }
}
