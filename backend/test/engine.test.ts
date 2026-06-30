import { test, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanAll, walkTree } from '../src/scan/engine.js';

function makeTree(): string {
  const root = mkdtempSync(join(tmpdir(), 'cmh-'));
  mkdirSync(join(root, 'sub', 'deep'), { recursive: true });
  writeFileSync(join(root, 'a.txt'), 'A'.repeat(100)); // 100
  writeFileSync(join(root, 'sub', 'b.bin'), Buffer.alloc(1024)); // 1024
  writeFileSync(join(root, 'sub', 'deep', 'c.log'), 'C'.repeat(50)); // 50
  return root;
}

test('walkTree sums bytes and counts files', async () => {
  const root = makeTree();
  try {
    const r = await walkTree(root);
    expect(r.bytes).toBe(100 + 1024 + 50);
    expect(r.files).toBe(3);
    expect(r.dirs).toBeGreaterThanOrEqual(3);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('walkTree handles missing root gracefully', async () => {
  const r = await walkTree(join(tmpdir(), 'cmh-does-not-exist-' + process.pid));
  expect(r.bytes).toBe(0);
  expect(r.files).toBe(0);
  expect(r.skipped).toBeGreaterThanOrEqual(1);
});

test('scanAll aggregates an item and emits scan-done', async () => {
  const root = makeTree();
  try {
    const events: { type: string }[] = [];
    const payload = await scanAll({
      items: [
        {
          id: 't',
          name: 'Test',
          vendor: 'x',
          category: 'cli',
          color: '#ffffff',
          paths: [root],
        },
      ],
      emit: (e) => events.push(e as { type: string }),
    });
    expect(payload.total.bytes).toBe(1174);
    expect(payload.agents[0].bytes).toBe(1174);
    expect(payload.agents[0].files).toBe(3);
    expect(payload.agents[0].paths[0].exists).toBe(true);
    expect(payload.agents[0].paths[0].bytes).toBe(1174);
    expect(events.some((e) => e.type === 'scan-done')).toBe(true);
    expect(events.some((e) => e.type === 'agent-done')).toBe(true);
    expect(events.some((e) => e.type === 'agent-start')).toBe(true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('scanAll aggregates multiple paths into one item', async () => {
  const rootA = mkdtempSync(join(tmpdir(), 'cmh-a-'));
  const rootB = mkdtempSync(join(tmpdir(), 'cmh-b-'));
  try {
    writeFileSync(join(rootA, 'f'), '0'.repeat(40));
    writeFileSync(join(rootB, 'g'), '0'.repeat(60));
    const payload = await scanAll({
      items: [{ id: 'm', name: 'M', vendor: 'x', category: 'cli', color: '#fff', paths: [rootA, rootB] }],
      emit: () => {},
    });
    expect(payload.agents[0].bytes).toBe(100);
    expect(payload.agents[0].paths.length).toBe(2);
  } finally {
    rmSync(rootA, { recursive: true, force: true });
    rmSync(rootB, { recursive: true, force: true });
  }
});

test('walkTree does not follow symlinks (no double count / no loop)', async () => {
  const root = mkdtempSync(join(tmpdir(), 'cmh-link-'));
  try {
    writeFileSync(join(root, 'real.txt'), 'X'.repeat(200));
    // A symlink to the root itself — would loop forever if followed.
    try {
      symlinkSync(root, join(root, 'selfloop'));
    } catch {
      // Creating symlinks may need privileges on some Windows setups; that's fine.
    }
    // A symlink to the file — must not be counted.
    try {
      symlinkSync(join(root, 'real.txt'), join(root, 'link.txt'));
    } catch {
      // see above
    }
    const r = await walkTree(root);
    expect(r.bytes).toBe(200);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
