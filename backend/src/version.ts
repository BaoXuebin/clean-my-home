// Shared build-time constants. Reads version straight from the root package.json.

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// `../../package.json` resolves to the repo root from both src/ (dev, via tsx)
// and dist/ (prod, compiled) since both sit two levels under the root.
export const VERSION: string = require('../../package.json').version;
export const DEFAULT_PORT = 7865;
