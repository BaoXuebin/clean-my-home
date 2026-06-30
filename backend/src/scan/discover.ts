// Auto-discovery of non-agent directories in the user's home folder, so users
// can spot leftover files from uninstalled apps and reclaim disk space.
//
// We scan two scopes:
//   1. IMMEDIATE children of home (never deep-walk on a hunch).
//   2. IMMEDIATE children of the platform's app-data roots (AppData/Roaming,
//      ~/.config, ~/Library/Application Support, …) — this is where uninstalled
//      apps leave residuals behind.
//
// Each discovered directory becomes its own scan item (no longer collapsed into
// a single "Other" bucket). It is classified as either `cache` (regenerable
// build/runtime caches) or `residual` (everything else not owned by an agent).
//
// System / credential / OS-user folders are HARD-excluded and never shown, so
// users cannot mistake them for cleanable residuals.

import { readdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { home, platform, expandPath } from '../util/paths.js';

export type CandidateKind = 'cache' | 'residual';

export interface DiscoveredCandidate {
  name: string;
  path: string;
  kind: CandidateKind;
}

// Matched case-insensitively against the directory base name.
// Never shown — system / OS-user / credential folders (deleting these is unsafe
// or meaningless for "free disk space").
const HARD_EXCLUDE = new Set<string>([
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
  // --- System / cache-host / credentials / shells (NOT cleanable app residuals) ---
  // `.config` / `.local` are excluded as roots here; their per-app children are
  // enumerated separately via appDataRoots() so residuals stay granular.
  '.config', '.local', '.ssh', '.gnupg', '.aws', '.gcp', '.ms-ad',
  '.bash_history', '.bash_profile', '.bashrc', '.zshrc', '.profile',
  '.gitconfig', '.npmrc', '.yarnrc', '.editorconfig', '.lesshst', '.viminfo', '.vim',
  '.node_repl_history', '.rediscli_history', '.mysql_history', '.python_history',
  // --- Cloud sync / misc large non-agent that aren't safe "residuals" ---
  'logs',
]);

// Directories whose name STARTS WITH one of these (case-insensitive) are excluded too.
const PREFIX_EXCLUDE = ['creative cloud files'];

// Build caches / package stores / runtimes — regenerable, safe-ish to clean.
// Surfaced as their own `cache` rows rather than hidden.
const CACHE_NAMES = new Set<string>([
  '.npm', '.npm-cache', 'npm-cache', '.yarn', '.pnpm-store', '.pnpm', '.bun',
  '.cargo', '.rustup', '.nvm', '.pyenv', '.rbenv', '.sdkman', '.conda', '.dotnet',
  '.java', '.m2', '.gradle', '.javacpp', '.nuget', '.dlv', '.degit', '.pm2', '.pi',
  '.cache', '.docker', '.kube', '.h2', '.influxdbv2', '.redisinsight-app',
  '.redisinsight-v2', '.testcontainers.properties', '.windows-build-tools',
  'go', 'nacos', 'tongtech', 'sangfor',
]);

// Platform app-data roots whose CHILDREN are likely per-app residuals. The root
// itself is HARD_EXCLUDE'd; we enumerate one level deep here.
function appDataRoots(): string[] {
  const plat = platform();
  const specs: string[] =
    plat === 'win'
      ? ['%APPDATA%', '%LOCALAPPDATA%']
      : plat === 'mac'
        ? ['~/Library/Application Support', '~/Library/Caches']
        : ['~/.config', '~/.local/share'];
  const out: string[] = [];
  for (const s of specs) {
    const abs = expandPath(s);
    if (abs) out.push(abs);
  }
  return out;
}

function classify(name: string): CandidateKind | null {
  const lower = name.toLowerCase();
  if (HARD_EXCLUDE.has(lower)) return null;
  if (PREFIX_EXCLUDE.some((p) => lower.startsWith(p))) return null;
  if (CACHE_NAMES.has(lower)) return 'cache';
  return 'residual';
}

/** readdir that swallows errors (returns [] on missing/locked dir). */
async function safeRead(dir: string): Promise<import('node:fs').Dirent[]> {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/**
 * @param claimedPaths absolute paths already owned by catalog agents
 * @returns discovered candidate dirs (each becomes its own scan item)
 */
export async function discoverCandidates(claimedPaths: string[] = []): Promise<DiscoveredCandidate[]> {
  const claimed = new Set(claimedPaths.map((p) => path.resolve(p).toLowerCase()));
  const out: DiscoveredCandidate[] = [];
  const seen = new Set<string>(); // dedupe by lowercased absolute path

  const consider = async (full: string): Promise<void> => {
    const key = path.resolve(full).toLowerCase();
    if (seen.has(key) || claimed.has(key)) return;
    const name = path.basename(full);
    const kind = classify(name);
    if (!kind) return;
    // Must be a real directory and NOT a symlink (skip OS legacy links).
    try {
      const st = await lstat(full);
      if (st.isSymbolicLink() || !st.isDirectory()) return;
    } catch {
      return;
    }
    seen.add(key);
    out.push({ name, path: full, kind });
  };

  // Scope 1: immediate children of home.
  const homeEntries = await safeRead(home());
  await Promise.all(homeEntries.map((ent) => ent.name ? consider(path.join(home(), ent.name)) : Promise.resolve()));

  // Scope 2: one level deep into each platform app-data root.
  await Promise.all(
    appDataRoots().map(async (root) => {
      const entries = await safeRead(root);
      await Promise.all(entries.map((ent) => ent.name ? consider(path.join(root, ent.name)) : Promise.resolve()));
    })
  );

  out.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  return out;
}
