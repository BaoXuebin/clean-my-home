// HTTP server factory: Express REST + Socket.io realtime + optional static SPA.
// Not listened here — the CLI entry (cli.ts) binds the port with fallback.

import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { createServer as createHttpServer } from 'node:http';
import { config } from './config.js';
import { logger } from './logger.js';
import * as scanner from './services/scanner.js';
import { dataRouter } from './routes/data.js';
import { metaRouter } from './routes/meta.js';
import { scanRouter } from './routes/scan.js';
import { setupSocketIO } from './socket/index.js';

export interface ServerHandle {
  httpServer: import('node:http').Server;
  app: express.Express;
}

export async function createServer(opts: { concurrency?: number; publicDir?: string } = {}): Promise<ServerHandle> {
  const publicDir = opts.publicDir ?? config.publicDir;

  scanner.setOptions({ concurrency: opts.concurrency ?? config.concurrency });
  await scanner.init();
  logger.info('Scanner ready', { publicDir: publicDir || '(dev — Vite owns UI)' });

  const app = express();
  const httpServer = createHttpServer(app);

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // REST API
  app.use('/api/data', dataRouter);
  app.use('/api/meta', metaRouter);
  app.use('/api/scan', scanRouter);
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // Serve the prebuilt frontend in production (published artifact).
  if (publicDir) {
    app.use(express.static(publicDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) return next();
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  // Realtime scan progress
  setupSocketIO(httpServer);

  return { httpServer, app };
}
