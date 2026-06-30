// Built-in catalog of well-known AI coding agents.
// Each entry: { id, name, vendor, category, color, paths: { any?, win?, mac?, linux? } }
//   - `any`: home-relative path specs (e.g. ".claude").
//   - platform keys: may use %APPDATA%/%LOCALAPPDATA% (win), ~/Library (mac), ~/.config (linux).
//   - a single agent may span multiple directories; their sizes are aggregated.
//
// Colours: a curated warm-carbon family (muted mid-tones) assigned per agent so
// the charts stay cohesive rather than a clash of saturated brand hues. Identity
// is carried by the monochrome brand SVG icons in the UI, not by brand colours.

import type { Agent } from '../types.js';

// Muted, equal-saturation/lightness hue-ring → distinct yet harmonised, so the
// charts stay calm against the neutral UI instead of clashing brand hues.
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type RawAgent = Omit<Agent, 'color'>;

const RAW_AGENTS: RawAgent[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    vendor: 'Anthropic',
    category: 'cli',
    paths: { any: ['.claude', '.claude.json'] },
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    vendor: 'OpenAI',
    category: 'cli',
    paths: { any: ['.codex'] },
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    vendor: 'Google',
    category: 'cli',
    paths: { any: ['.gemini'] },
  },
  {
    id: 'aider',
    name: 'Aider',
    vendor: 'Open Source',
    category: 'cli',
    paths: { any: ['.aider'] },
  },
  {
    id: 'kimi',
    name: 'Kimi',
    vendor: 'Moonshot',
    category: 'cli',
    paths: { any: ['.kimi', '.kimi-code'] },
  },
  {
    id: 'qoder',
    name: 'Qoder',
    vendor: 'Qoder',
    category: 'cli',
    paths: { any: ['.qoder', '.qoder-cli', '.qoderwork', '.qoderworkcn'] },
  },
  {
    id: 'coze',
    name: 'Coze',
    vendor: 'ByteDance',
    category: 'cli',
    paths: { any: ['Coze'] },
  },
  {
    id: 'continue',
    name: 'Continue',
    vendor: 'Continue Dev',
    category: 'extension',
    paths: {
      any: ['.continue'],
      win: ['%APPDATA%/Continue'],
      mac: ['~/Library/Application Support/Continue'],
    },
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    vendor: 'GitHub',
    category: 'extension',
    paths: {
      any: ['.copilot'],
      win: ['%LOCALAPPDATA%/GitHub Copilot'],
      mac: ['~/Library/Application Support/GitHub Copilot'],
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    vendor: 'Anysphere',
    category: 'ide',
    paths: {
      win: ['%APPDATA%/Cursor'],
      mac: ['~/Library/Application Support/Cursor'],
      linux: ['~/.config/Cursor'],
    },
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    vendor: 'Codeium',
    category: 'ide',
    paths: {
      any: ['.codeium', '.windsurf'],
      win: ['%APPDATA%/Windsurf'],
      mac: ['~/Library/Application Support/Windsurf'],
    },
  },
  {
    id: 'trae',
    name: 'Trae',
    vendor: 'ByteDance',
    category: 'ide',
    paths: {
      any: ['.trae'],
      win: ['%APPDATA%/Trae'],
      mac: ['~/Library/Application Support/Trae'],
    },
  },
  {
    id: 'zed',
    name: 'Zed',
    vendor: 'Zed Industries',
    category: 'ide',
    paths: {
      any: ['.zed'],
      mac: ['~/Library/Application Support/Zed'],
      linux: ['~/.local/share/zed'],
    },
  },
  {
    id: 'tabnine',
    name: 'Tabnine',
    vendor: 'Tabnine',
    category: 'extension',
    paths: { any: ['.tabnine', '.TabNine'] },
  },
  {
    id: 'cody',
    name: 'Sourcegraph Cody',
    vendor: 'Sourcegraph',
    category: 'extension',
    paths: { any: ['.sourcegraph'] },
  },
  {
    id: 'amazonq',
    name: 'Amazon Q',
    vendor: 'Amazon',
    category: 'cli',
    paths: { any: ['.amazonq'] },
  },
  {
    id: 'augment',
    name: 'Augment Code',
    vendor: 'Augment',
    category: 'extension',
    paths: { any: ['.augment'] },
  },
  {
    id: 'workbuddy',
    name: 'WorkBuddy',
    vendor: 'Genie',
    category: 'ide',
    paths: {
      any: ['.workbuddy', 'WorkBuddy', 'workbuddy_temp'],
      win: ['%LOCALAPPDATA%/@genieworkbuddy-desktop-updater', '%LOCALAPPDATA%/WorkBuddy'],
    },
  },
];

const PALETTE: string[] = RAW_AGENTS.map((_, i) => hslToHex(Math.round((i * 360) / RAW_AGENTS.length), 85, 48));

export const AGENTS: Agent[] = RAW_AGENTS.map((a, i) => ({ ...a, color: PALETTE[i % PALETTE.length] }));

// Neutral stone/slate palette for discovered (non-agent) directories — lower
// saturation than the agent hue-ring so residuals read as "not an agent" at a
// glance. A stable per-name hash picks the colour so re-scans stay consistent.
const RESIDUAL_PALETTE: string[] = [
  hslToHex(25, 18, 52), // warm stone
  hslToHex(30, 12, 48),
  hslToHex(210, 16, 50), // cool slate
  hslToHex(200, 14, 46),
  hslToHex(340, 14, 50), // muted rose
  hslToHex(280, 12, 48),
  hslToHex(160, 12, 46), // muted teal
  hslToHex(45, 16, 50),
];

/** Deterministic colour for a discovered directory, keyed by its name. */
export function colorForResidual(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return RESIDUAL_PALETTE[h % RESIDUAL_PALETTE.length];
}
