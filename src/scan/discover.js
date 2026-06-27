// Auto-discovery of "Other" candidate directories in the home folder.
// We only look at IMMEDIATE children (never deep-walk on a hunch) and exclude
// obvious OS / runtime / IDE-config / cloud folders so the "Other" bucket stays
// meaningful rather than dominated by .gradle / .m2 / AppData etc.

import { readdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { home } from '../util/paths.js';

// Matched case-insensitively against the directory base name.
const EXCLUDE = new Set([
  // --- Windows user folders + legacy junctions (most are symlinks, skipped anyway) ---
  'appdata', 'application data', 'cookies', 'desktop', 'documents', 'downloads',
  'music', 'pictures', 'videos', 'favorites', 'links', 'searches', '3d objects',
  'contacts', 'saved games', 'onedrive', 'nethood', 'printhood', 'recent', 'sendto',
  'templates', 'local settings', 'my documents', 'start menu', 'microsoft',
  '「开始」菜单', 'wps cloud files', 'wpsdrive', 'openvpn', 'intelgraphicsprofiles',
  // --- macOS ---
  'library', 'movies', 'public', 'applications',
  // --- Linux / general ---
  'snap',
  // --- Editors / IDE support (not agents themselves) ---
  '.vscode', '.vscode-shared', '.idea', '.idealibsources', '.redhat', '.sts4',
  '.jdks', '.android', '.alibabacloudidea', '.expo', '.easy_api', '.gk',
  '.chelper', '.lemminx', 'ideasnapshots',
  '.biome', '.icube-remote-ssh',
  // --- Programming runtimes / package managers / build caches ---
  '.npm', '.npm-cache', '.yarn', '.pnpm-store', '.pnpm', '.bun', '.cargo', '.rustup',
  '.nvm', '.pyenv', '.rbenv', '.sdkman', '.conda', '.dotnet', '.java', '.m2', '.gradle',
  '.javacpp', '.dlv', '.influxdbv2', '.h2', '.redisinsight-app', '.redisinsight-v2',
  '.degit', '.pm2', '.pi', 'go', 'npm-cache', 'nacos', 'tongtech', 'sangfor',
  '.testcontainers.properties', '.windows-build-tools',
  // --- System / cache / credentials / shells ---
  '.cache', '.config', '.local', '.ssh', '.gnupg', '.docker', '.kube', '.aws', '.gcp',
  '.ms-ad', '.bash_history', '.bash_profile', '.bashrc', '.zshrc', '.profile',
  '.gitconfig', '.npmrc', '.yarnrc', '.editorconfig', '.lesshst', '.viminfo', '.vim',
  '.node_repl_history', '.rediscli_history', '.mysql_history', '.python_history',
  // --- Cloud sync / misc large non-agent ---
  'logs', 'library',
]);

// Directories whose name STARTS WITH one of these (case-insensitive) are excluded too.
const PREFIX_EXCLUDE = ['creative cloud files'];

/**
 * @param {string[]} claimedPaths absolute paths already owned by catalog agents
 * @returns {Promise<{name:string, path:string}[]>} discovered candidate dirs
 */
export async function discoverCandidates(claimedPaths = []) {
  const claimed = new Set(
    claimedPaths.map((p) => path.resolve(p).toLowerCase())
  );
  const out = [];
  let entries;
  try {
    entries = await readdir(home(), { withFileTypes: true });
  } catch {
    return out;
  }

  await Promise.all(
    entries.map(async (ent) => {
      const name = ent.name;
      if (!name) return;
      const full = path.join(home(), name);
      if (claimed.has(path.resolve(full).toLowerCase())) return;
      const lower = name.toLowerCase();
      if (EXCLUDE.has(lower)) return;
      if (PREFIX_EXCLUDE.some((p) => lower.startsWith(p))) return;
      // Must be a real directory and NOT a symlink (skip OS legacy links).
      try {
        const st = await lstat(full);
        if (st.isSymbolicLink() || !st.isDirectory()) return;
      } catch {
        return;
      }
      out.push({ name, path: full });
    })
  );

  out.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  return out;
}
