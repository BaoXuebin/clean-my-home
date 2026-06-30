// Build the list of things to scan: catalog agents that exist on this machine
// plus one scan item per auto-discovered non-agent directory (build caches and
// app residuals). Each discovered directory is its own item so users can spot
// individual leftovers rather than a single aggregated "Other" bucket.

import { AGENTS, colorForResidual } from './catalog.js';
import { resolvePaths, pathExists, home } from '../util/paths.js';
import { discoverCandidates } from './discover.js';
import type { ScanItem } from '../types.js';
import path from 'node:path';

/** Stable id for a discovered dir: `<kind>:<relpath>` with separators normalised. */
function residualId(kind: 'cache' | 'residual', absPath: string): string {
  let rel = path.relative(home(), absPath);
  if (!rel || rel.startsWith('..')) rel = absPath; // outside home — fall back to absolute
  const norm = rel.toLowerCase().replace(/[\\/]+/g, '__');
  return `${kind}:${norm}`;
}

export async function buildScanPlan(): Promise<ScanItem[]> {
  const items: ScanItem[] = [];
  const claimed: string[] = [];

  for (const agent of AGENTS) {
    const paths = resolvePaths(agent);
    claimed.push(...paths);
    // Include the agent if at least one of its paths exists on this OS.
    if (paths.some((p) => pathExists(p))) {
      items.push({ ...agent, paths });
    }
  }

  const candidates = await discoverCandidates(claimed);
  for (const c of candidates) {
    items.push({
      id: residualId(c.kind, c.path),
      name: c.name,
      vendor: '',
      category: c.kind,
      color: colorForResidual(c.name),
      paths: [c.path],
    });
  }

  return items;
}
