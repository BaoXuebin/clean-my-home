// Monochrome agent icons. Well-known brands use their simple-icons glyph (a
// single solid path); the rest fall back to a category-based generic. All are
// rendered with `fill="currentColor"` so they pick up the surrounding ink/theme.

import {
  siAnthropic,
  siGooglegemini,
  siCursor,
  siWindsurf,
  siGithubcopilot,
  siCoze,
  siZedindustries,
  siMoonshotai,
} from 'simple-icons';
import type { Category } from '@/types';

interface IconData {
  path: string;
}

// Agent id → brand glyph (only the brands that exist in simple-icons).
const BRAND: Record<string, IconData> = {
  'claude-code': siAnthropic,
  'gemini-cli': siGooglegemini,
  cursor: siCursor,
  windsurf: siWindsurf,
  copilot: siGithubcopilot,
  coze: siCoze,
  zed: siZedindustries,
  kimi: siMoonshotai,
};

// Category fallbacks — hand-drawn solid silhouettes (24×24 viewBox).
// (cache/residual are routed through discoveredGlyph() in agentIconPath, so the
// static values here are only a last-resort fallback.)
const CATEGORY: Record<Category, string> = {
  cli: 'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm5.3 2.3a.9.9 0 0 0-.6 1.5L8.6 11l-1.9 2.2a.9.9 0 1 0 1.4 1.1l2.3-2.7a.9.9 0 0 0 0-1.2L8.1 7.6a.9.9 0 0 0-.8-.3zM12 13a.9.9 0 0 0 0 1.8h5a.9.9 0 0 0 0-1.8h-5z',
  ide: 'M9.5 6.5a1 1 0 0 1 .3 1.4L6.8 12l3 4.1a1 1 0 1 1-1.6 1.2l-3.4-4.7a1 1 0 0 1 0-1.2l3.4-4.7a1 1 0 0 1 1.3-.2zm5 0a1 1 0 0 1 1.3.2l3.4 4.7a1 1 0 0 1 0 1.2l-3.4 4.7a1 1 0 0 1-1.6-1.2l3-4.1-3-4.1a1 1 0 0 1 .3-1.4z',
  extension:
    'M9.5 3a2 2 0 0 1 4 0 2.5 2.5 0 0 1 2 2.5H18a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V18a2 2 0 0 1-2 2h-2.5a2.5 2.5 0 0 0-5 0H6a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5V9a2 2 0 0 1 2-2h.5A2.5 2.5 0 0 1 9.5 3z',
  cache:
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 2.5V12c0 1.7 3.6 3 8 3s8-1.3 8-3V8.5c0 1.7-3.6 3-8 3s-8-1.3-8-3zm0 6V18c0 1.7 3.6 3 8 3s8-1.3 8-3v-3.5c0 1.7-3.6 3-8 3s-8-1.3-8-3z',
  residual:
    'M3 6a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.5.7L12.2 6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z',
};

// Adaptive glyphs for discovered (non-agent) directories — picked from the
// directory's id/name so different dirs get distinct, meaningful icons instead
// of a single generic shape.

// package = stacked discs (npm/cargo/m2 …); build = bricks; runtime = gauge; default = database
const CACHE_GLYPHS = {
  package:
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 2.5V12c0 1.7 3.6 3 8 3s8-1.3 8-3V8.5c0 1.7-3.6 3-8 3s-8-1.3-8-3zm0 6V18c0 1.7 3.6 3 8 3s8-1.3 8-3v-3.5c0 1.7-3.6 3-8 3s-8-1.3-8-3z',
  build:
    'M3 4h7v7H3V4zm11 0h7v7h-7V4zM3 13h7v7H3v-7zm11 0h7v7h-7v-7z',
  runtime:
    'M12 13a4 4 0 0 0 4-4 4 4 0 0 0-8 0 4 4 0 0 0 4 4zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM5.6 18.4l2.8-2.8M18.4 18.4l-2.8-2.8M5.6 5.6l2.8 2.8M18.4 5.6l-2.8 2.8',
  default:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4a5 5 0 0 1 5 5h-2a3 3 0 0 0-3-3V7z',
};

// app = box (leftover app dir under app-data root); folder = generic top-level dir
const RESIDUAL_GLYPHS = {
  app: 'M3 6a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.5.7L12.2 6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z',
  folder:
    'M3 9l9-6 9 6M5 9v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M3 9h18',
};

// cache sub-type by basename (lowercased, leading dot stripped).
const CACHE_KIND: Record<string, keyof typeof CACHE_GLYPHS> = {
  '.npm': 'package', '.npm-cache': 'package', 'npm-cache': 'package', '.yarn': 'package',
  '.pnpm-store': 'package', '.pnpm': 'package', '.bun': 'package', '.m2': 'package',
  '.gradle': 'build', '.nuget': 'package', '.degit': 'package', '.cargo': 'package',
  '.rustup': 'runtime', '.nvm': 'runtime', '.pyenv': 'runtime', '.rbenv': 'runtime',
  '.sdkman': 'runtime', '.conda': 'runtime', '.dotnet': 'runtime', '.java': 'runtime',
  '.cache': 'default', '.docker': 'default', '.kube': 'default', '.pm2': 'runtime',
  go: 'runtime',
};

function basenameOf(id: string): string {
  // id shape: "<kind>:<relpath>" with "__" as separator → take last segment.
  const colon = id.indexOf(':');
  const rel = colon >= 0 ? id.slice(colon + 1) : id;
  const parts = rel.split('__');
  return parts[parts.length - 1];
}

/** Pick an adaptive glyph for a discovered directory (cache/residual). */
export function discoveredGlyph(id: string, category: Category): string {
  const name = basenameOf(id).toLowerCase();
  if (category === 'cache') {
    return CACHE_KIND[name] ? CACHE_GLYPHS[CACHE_KIND[name]] : CACHE_GLYPHS.default;
  }
  // residual: under an app-data root → app box; top-level → folder.
  const isAppData = /appdata|__local__|__roaming__|library__application|library__caches|__config__|__local__share/.test(id);
  return isAppData ? RESIDUAL_GLYPHS.app : RESIDUAL_GLYPHS.folder;
}

export function agentIconPath(id: string, category: Category): string {
  if (BRAND[id]) return BRAND[id].path;
  if (category === 'cache' || category === 'residual') return discoveredGlyph(id, category);
  return CATEGORY[category] ?? CATEGORY.residual;
}

export function AgentIcon({
  id,
  category,
  size = 16,
  className,
}: {
  id: string;
  category: Category;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={agentIconPath(id, category)} />
    </svg>
  );
}
