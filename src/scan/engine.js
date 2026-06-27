// Scan engine: a concurrency-limited async directory walk + the multi-agent orchestrator.
//
// Correctness rules (cross-platform):
//   - ALWAYS use lstat (never stat) — we never follow symlinks. On Windows,
//     junctions (Application Data, Cookies, Recent, …) report isSymbolicLink(),
//     so they are dropped, preventing infinite loops and double counting.
//   - EPERM/EACCES/EBUSY/ENOENT on locked files (NTUSER.DAT*, pagefile…) are
//     swallowed and counted as `skipped`.

import { lstat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { home } from '../util/paths.js';

const LSTAT_CHUNK = 512; // bound concurrent lstat promises within a single directory

/** lstat every entry in `dir`, in chunks, never throwing. */
async function lstatAll(dir, entries) {
  const out = [];
  for (let i = 0; i < entries.length; i += LSTAT_CHUNK) {
    const slice = entries.slice(i, i + LSTAT_CHUNK);
    const res = await Promise.all(
      slice.map(async (ent) => {
        const full = path.join(dir, ent.name);
        try {
          return { full, st: await lstat(full) };
        } catch {
          return null; // permission / race / missing
        }
      })
    );
    for (const r of res) if (r) out.push(r);
  }
  return out;
}

/**
 * Walk a single directory subtree, summing logical bytes & file count.
 * @param {string} root absolute path to a directory
 * @param {{ concurrency?: number, onProgress?: (e:{bytes:number,files:number})=>void }} opts
 * @returns {Promise<{bytes:number,files:number,dirs:number,skipped:number}>}
 */
export async function walkTree(root, { concurrency = 64, onProgress } = {}) {
  const result = { bytes: 0, files: 0, dirs: 0, skipped: 0 };
  const queue = [root];
  let active = 0;
  let resolved = false;

  await new Promise((resolve) => {
    const tryFinish = () => {
      if (!resolved && queue.length === 0 && active === 0) {
        resolved = true;
        resolve();
      }
    };

    const processDir = async (dir) => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch {
        result.skipped++;
        return;
      }
      result.dirs++;
      const items = await lstatAll(dir, entries);
      for (const { st, full } of items) {
        if (st.isSymbolicLink()) continue; // never follow
        if (st.isDirectory()) {
          queue.push(full);
        } else if (st.isFile()) {
          result.bytes += st.size;
          result.files++;
          onProgress?.({ bytes: st.size, files: 1 });
        }
      }
    };

    const schedule = () => {
      while (active < concurrency && queue.length > 0) {
        const dir = queue.pop();
        active++;
        processDir(dir)
          .catch(() => {})
          .finally(() => {
            active--;
            schedule();
            tryFinish();
          });
      }
      tryFinish();
    };

    schedule();
  });

  return result;
}

/**
 * Scan a list of items (catalog agents + the synthetic "other" group), emitting
 * throttled progress events. Resolves to the full payload (also cache-shaped).
 *
 * @param {{items:Array, concurrency?:number, emit?:Function, signal?:AbortSignal}} args
 */
export async function scanAll({ items, concurrency = 64, emit, signal }) {
  const startedAt = Date.now();
  emit?.({ type: 'scan-start', startedAt, count: items.length, ids: items.map((i) => i.id) });

  const agentResults = [];

  for (const item of items) {
    if (signal?.aborted) break;
    emit?.({
      type: 'agent-start',
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      color: item.color,
    });

    let bytes = 0;
    let files = 0;
    let dirs = 0;
    let skipped = 0;
    let lastEmit = 0;
    const pathBreakdown = [];

    const maybeProgress = () => {
      const now = Date.now();
      if (now - lastEmit > 120) {
        lastEmit = now;
        emit?.({ type: 'agent-progress', id: item.id, bytes, files });
      }
    };

    for (const p of item.paths) {
      let st;
      try {
        st = await lstat(p);
      } catch {
        pathBreakdown.push({ path: p, exists: false, bytes: 0, files: 0 });
        continue;
      }

      if (st.isSymbolicLink()) {
        pathBreakdown.push({ path: p, exists: true, isLink: true, bytes: 0, files: 0 });
        continue;
      }

      if (st.isFile()) {
        bytes += st.size;
        files += 1;
        pathBreakdown.push({ path: p, exists: true, bytes: st.size, files: 1 });
        maybeProgress();
        continue;
      }

      if (st.isDirectory()) {
        const r = await walkTree(p, {
          concurrency,
          onProgress: ({ bytes: db, files: df }) => {
            bytes += db;
            files += df;
            maybeProgress();
          },
        });
        dirs += r.dirs;
        skipped += r.skipped;
        pathBreakdown.push({ path: p, exists: true, bytes: r.bytes, files: r.files });
      }
    }

    const result = {
      id: item.id,
      name: item.name,
      vendor: item.vendor,
      category: item.category,
      emoji: item.emoji,
      color: item.color,
      bytes,
      files,
      dirs,
      skipped,
      paths: pathBreakdown,
    };
    agentResults.push(result);
    emit?.({ type: 'agent-done', ...result });
  }

  const total = agentResults.reduce(
    (a, r) => ({ bytes: a.bytes + r.bytes, files: a.files + r.files }),
    { bytes: 0, files: 0 }
  );

  const payload = {
    version: 1,
    scannedAt: Date.now(),
    home: home(),
    scanDurationMs: Date.now() - startedAt,
    total,
    agents: agentResults,
  };

  emit?.({ type: 'scan-done', payload });
  return payload;
}
