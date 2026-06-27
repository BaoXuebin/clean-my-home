import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import { join } from 'node:path';
import { formatBytes, formatPercent, formatNumber, formatEta, formatRelativeTime } from '../src/util/format.js';
import { expandPath, resolvePaths, platform } from '../src/util/paths.js';

test('formatBytes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(1048576), '1.0 MB');
  assert.equal(formatBytes(1073741824), '1.0 GB');
  assert.equal(formatBytes(-1), '—');
});

test('formatPercent', () => {
  assert.equal(formatPercent(0.25), '25.0%');
  assert.equal(formatPercent(1), '100.0%');
  assert.equal(formatPercent(0), '0.0%');
});

test('formatNumber', () => {
  assert.equal(formatNumber(1234567), '1,234,567');
  assert.equal(formatNumber(0), '0');
});

test('formatEta', () => {
  assert.equal(formatEta(500), '<1s');
  assert.equal(formatEta(1000), '1s');
  assert.equal(formatEta(95000), '1m 35s');
});

test('formatRelativeTime', () => {
  const now = Date.now();
  assert.equal(formatRelativeTime(now - 30 * 1000, now), 'just now');
  assert.equal(formatRelativeTime(now - 5 * 60 * 1000, now), '5m ago');
  assert.equal(formatRelativeTime(now - 3 * 60 * 60 * 1000, now), '3h ago');
});

test('expandPath resolves home-relative and ~', () => {
  const home = os.homedir();
  assert.equal(expandPath('.claude'), join(home, '.claude'));
  assert.equal(expandPath('~/.foo'), join(home, '.foo'));
  assert.equal(expandPath('Coze'), join(home, 'Coze'));
});

test('expandPath expands %ENV% when present', () => {
  process.env.CMH_FAKE = '/opt/fake';
  assert.equal(expandPath('%CMH_FAKE%/sub'), join('/opt/fake', 'sub'));
  delete process.env.CMH_FAKE;
});

test('resolvePaths merges any + platform and de-dupes', () => {
  const paths = resolvePaths({ paths: { any: ['.claude'] } });
  assert.ok(paths.length >= 1);
  assert.ok(paths.some((p) => p.endsWith('.claude')));
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
  // `any` always present
  assert.ok(paths.some((p) => p.endsWith('.codeium')));
  // platform-specific present
  if (plat === 'win') assert.ok(paths.some((p) => p.includes('Windsurf')));
});
