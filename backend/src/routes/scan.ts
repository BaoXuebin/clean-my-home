import { Router } from 'express';
import * as scanner from '../services/scanner.js';

export const scanRouter = Router();

/** Start a scan (idempotent: re-uses an in-flight scan's job id). */
scanRouter.post('/', (_req, res) => {
  const result = scanner.startScan();
  res.json(result);
});
