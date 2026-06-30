import { test, expect } from 'vitest';
import os from 'node:os';
import { join } from 'node:path';
import { formatBytes, formatPercent, formatNumber, formatEta, formatRelativeTime } from '../src/util/format.js';
import { expandPath, resolvePaths, platform } from '../src/util/paths.js';

test('formatBytes', () => {
  expect(formatBytes(0)).toBe('0 B');
  expect(formatBytes(512)).toBe('512 B');
  expect(formatBytes(1024)).toBe('1.0 KB');
  expect(formatBytes(1536)).toBe('1.5 KB');
  expect(formatBytes(1048576)).toBe('1.0 MB');
  expect(formatBytes(1073741824)).toBe('1.0 GB');
  expect(formatBytes(-1)).toBe('—');
});

test('formatPercent', () => {
  expect(formatPercent(0.25)).toBe('25.0%');
  expect(formatPercent(1)).toBe('100.0%');
  expect(formatPercent(0)).toBe('0.0%');
});

test('formatNumber', () => {
  expect(formatNumber(1234567)).toBe('1,234,567');
  expect(formatNumber(0)).toBe('0');
});

test('formatEta', () => {
  expect(formatEta(500)).toBe('<1s');
  expect(formatEta(1000)).toBe('1s');
  expect(formatEta(95000)).toBe('1m 35s');
});

test('formatRelativeTime', () => {
  const now = Date.now();
  expect(formatRelativeTime(now - 30 * 1000, now)).toBe('just now');
  expect(formatRelativeTime(now - 5 * 60 * 1000, now)).toBe('5m ago');
  expect(formatRelativeTime(now - 3 * 60 * 60 * 1000, now)).toBe('3h ago');
});

test('expandPath resolves home-relative and ~', () => {
  const home = os.homedir();
  expect(expandPath('.claude')).toBe(join(home, '.claude'));
  expect(expandPath('~/.foo')).toBe(join(home, '.foo'));
  expect(expandPath('Coze')).toBe(join(home, 'Coze'));
});

test('expandPath expands %ENV% when present', () => {
  process.env.CMH_FAKE = '/opt/fake';
  expect(expandPath('%CMH_FAKE%/sub')).toBe(join('/opt/fake', 'sub'));
  delete process.env.CMH_FAKE;
});

test('resolvePaths merges any + platform and de-dupes', () => {
  const paths = resolvePaths({ paths: { any: ['.claude'] } });
  expect(paths.length).toBeGreaterThanOrEqual(1);
  expect(paths.some((p) => p.endsWith('.claude'))).toBe(true);
});

test('resolvePaths returns platform-appropriate spec', () => {
  const plat = platform();
  const entry = {
    paths: {
      any: ['.codeium'],
      win: ['%APPDATA%/Windsurf'],
      mac: ['~/Library/Application Support/Windsurf'],
      linux: ['~/.config/Windsurf'],
    },
  };
  const paths = resolvePaths(entry);
  expect(paths.some((p) => p.endsWith('.codeium'))).toBe(true);
  if (plat === 'win') expect(paths.some((p) => p.includes('Windsurf'))).toBe(true);
});
