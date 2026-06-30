// On-disk scan cache. Fresh cache → dashboard renders instantly on restart;
// refresh is on-demand so we don't hammer the disk on every launch.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { home } from '../util/paths.js';
import type { ScanPayload } from '../types.js';

const MAX_AGE_MS = 1000 * 60 * 60 * 6; // 6 hours
const CACHE_DIR = path.join(home(), '.cache', 'clean-my-home');
const CACHE_FILE = path.join(CACHE_DIR, 'cache.json');

export function cachePath(): string {
  return CACHE_FILE;
}

export function maxAgeMs(): number {
  return MAX_AGE_MS;
}

export async function readCache(): Promise<ScanPayload | null> {
  try {
    const raw = await readFile(CACHE_FILE, 'utf8');
    const data = JSON.parse(raw) as ScanPayload;
    if (!data || data.version !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

export function isFresh(cache: ScanPayload | null): boolean {
  if (!cache || !cache.scannedAt) return false;
  return Date.now() - cache.scannedAt < MAX_AGE_MS;
}

export async function writeCache(payload: ScanPayload): Promise<boolean> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    const body = JSON.stringify(payload, null, 2);
    await writeFile(CACHE_FILE, body, 'utf8');
    return true;
  } catch {
    return false;
  }
}
