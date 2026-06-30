import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PORT } from './version.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The prebuilt frontend lands at <root>/public. From src/ (dev) or dist/ (prod)
// that's two levels up. In dev the folder is absent, so publicDir stays empty
// and the Vite dev server owns the UI; in the published artifact it's served.
const candidatePublic = path.resolve(__dirname, '../../public');

export const config = {
  host: process.env.HOST || '127.0.0.1',
  port: parseInt(process.env.PORT || String(DEFAULT_PORT), 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  concurrency: parseInt(process.env.CONCURRENCY || '64', 10),
  publicDir: process.env.PUBLIC_DIR || (existsSync(candidatePublic) ? candidatePublic : ''),
};
