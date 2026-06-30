import { Router } from 'express';
import * as scanner from '../services/scanner.js';
import { cachePath } from '../scan/cache.js';
import { VERSION } from '../version.js';

export const metaRouter = Router();

metaRouter.get('/', (_req, res) => {
  res.json({ version: VERSION, cachePath: cachePath(), running: scanner.isRunning() });
});
