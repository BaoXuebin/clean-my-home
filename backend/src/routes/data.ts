import { Router } from 'express';
import * as scanner from '../services/scanner.js';
import { isFresh } from '../scan/cache.js';
import type { ScanPayload } from '../types.js';

export const dataRouter = Router();

/** Shape a cached payload for the client: agents sorted by bytes desc + freshness flag. */
function shapeData(payload: ScanPayload) {
  const agents = [...payload.agents].sort((a, b) => b.bytes - a.bytes);
  return {
    scannedAt: payload.scannedAt,
    home: payload.home,
    scanDurationMs: payload.scanDurationMs,
    total: payload.total,
    agents,
    fresh: isFresh(payload),
  };
}

dataRouter.get('/', (_req, res) => {
  const cached = scanner.getCached();
  if (!cached) return res.json({ status: 'none', running: scanner.isRunning() });
  res.json({ status: 'ready', running: scanner.isRunning(), ...shapeData(cached) });
});
