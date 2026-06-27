// Built-in catalog of well-known AI coding agents.
// Each entry: { id, name, vendor, category, emoji, color, paths: { any?, win?, mac?, linux? } }
//   - `any`: home-relative path specs (e.g. ".claude").
//   - platform keys: may use %APPDATA%/%LOCALAPPDATA% (win), ~/Library (mac), ~/.config (linux).
//   - a single agent may span multiple directories; their sizes are aggregated.

export const AGENTS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    vendor: 'Anthropic',
    category: 'cli',
    emoji: '🧠',
    color: '#E08A5A',
    paths: { any: ['.claude', '.claude.json'] },
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    vendor: 'OpenAI',
    category: 'cli',
    emoji: '🟢',
    color: '#10A37F',
    paths: { any: ['.codex'] },
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    vendor: 'Google',
    category: 'cli',
    emoji: '♊',
    color: '#4285F4',
    paths: { any: ['.gemini'] },
  },
  {
    id: 'aider',
    name: 'Aider',
    vendor: 'Open Source',
    category: 'cli',
    emoji: '🤝',
    color: '#22C55E',
    paths: { any: ['.aider'] },
  },
  {
    id: 'kimi',
    name: 'Kimi',
    vendor: 'Moonshot',
    category: 'cli',
    emoji: '🌙',
    color: '#6366F1',
    paths: { any: ['.kimi', '.kimi-code'] },
  },
  {
    id: 'qoder',
    name: 'Qoder',
    vendor: 'Qoder',
    category: 'cli',
    emoji: '🗂️',
    color: '#F59E0B',
    paths: { any: ['.qoder', '.qoder-cli', '.qoderwork', '.qoderworkcn'] },
  },
  {
    id: 'coze',
    name: 'Coze',
    vendor: 'ByteDance',
    category: 'cli',
    emoji: '🧩',
    color: '#3B82F6',
    paths: { any: ['Coze'] },
  },
  {
    id: 'continue',
    name: 'Continue',
    vendor: 'Continue Dev',
    category: 'extension',
    emoji: '⏵️',
    color: '#7C3AED',
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
    emoji: '🐙',
    color: '#C77DFF',
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
    emoji: '▶️',
    color: '#CBD5E1',
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
    emoji: '🌊',
    color: '#06B6D4',
    paths: {
      any: ['.codeium', '.windsurf'],
      win: ['%APPDATA%/Windsurf'],
      mac: ['~/Library/Application Support/Windsurf'],
    },
  },
];

// Synthetic group for auto-discovered directories not in the catalog above.
export const OTHER_META = {
  id: 'other',
  name: 'Other',
  vendor: 'auto-discovered',
  category: 'other',
  emoji: '📦',
  color: '#64748B',
};
