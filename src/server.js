// HTTP server: one static HTML page + a tiny JSON/SSE API. Zero deps.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as state from './state.js';
import { isFresh, cachePath } from './scan/cache.js';
import { VERSION } from './version.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, '..', 'public', 'index.html');

let htmlCache = null;
async function getHtml() {
  if (!htmlCache) htmlCache = await readFile(HTML_PATH, 'utf8');
  return htmlCache;
}

function send(res, status, contentType, body) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
  });
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, 'application/json; charset=utf-8', JSON.stringify(obj));
}

/** Shape a cached payload for the client: agents sorted by bytes desc + freshness flag. */
function shapeData(payload) {
  const agents = [...(payload.agents || [])].sort((a, b) => b.bytes - a.bytes);
  return {
    scannedAt: payload.scannedAt,
    home: payload.home,
    scanDurationMs: payload.scanDurationMs,
    total: payload.total,
    agents,
    fresh: isFresh(payload),
  };
}

export async function createServer({ concurrency } = {}) {
  state.setOptions({ concurrency });
  await state.init();
  return http.createServer(handler);
}

async function handler(req, res) {
  const { pathname } = new URL(req.url, 'http://127.0.0.1');

  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    return send(res, 200, 'text/html; charset=utf-8', await getHtml());
  }

  if (req.method === 'GET' && pathname === '/api/data') {
    const cached = state.getCached();
    if (!cached) return sendJson(res, 200, { status: 'none', running: state.isRunning() });
    return sendJson(res, 200, { status: 'ready', running: state.isRunning(), ...shapeData(cached) });
  }

  if (req.method === 'GET' && pathname === '/api/meta') {
    return sendJson(res, 200, {
      version: VERSION,
      cachePath: cachePath(),
      running: state.isRunning(),
    });
  }

  if (req.method === 'GET' && pathname === '/api/progress') {
    return handleSse(req, res);
  }

  if (req.method === 'POST' && (pathname === '/api/scan' || pathname === '/api/refresh')) {
    const result = state.startScan();
    return sendJson(res, 200, { progressUrl: '/api/progress', ...result });
  }

  return sendJson(res, 404, { error: 'Not found', path: pathname });
}

function handleSse(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const write = (event) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  write(state.snapshot());
  const unsub = state.subscribe(write);
  const keepalive = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      /* gone */
    }
  }, 15000);

  req.on('close', () => {
    unsub();
    clearInterval(keepalive);
    try {
      res.end();
    } catch {
      /* already closed */
    }
  });
}
