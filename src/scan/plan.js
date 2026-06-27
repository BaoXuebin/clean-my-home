// Build the list of things to scan: catalog agents that exist on this machine
// plus the synthetic "other" group of auto-discovered directories.

import { AGENTS, OTHER_META } from './catalog.js';
import { resolvePaths, pathExists } from '../util/paths.js';
import { discoverCandidates } from './discover.js';

export async function buildScanPlan() {
  const items = [];
  const claimed = [];

  for (const agent of AGENTS) {
    const paths = resolvePaths(agent);
    claimed.push(...paths);
    // Include the agent if at least one of its paths exists on this OS.
    if (paths.some((p) => pathExists(p))) {
      items.push({ ...agent, paths });
    }
  }

  const candidates = await discoverCandidates(claimed);
  if (candidates.length) {
    items.push({
      ...OTHER_META,
      paths: candidates.map((c) => c.path),
    });
  }

  return items;
}
