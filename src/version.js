// Shared build-time constants. Reads version straight from package.json.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const VERSION = require('../package.json').version;
export const DEFAULT_PORT = 7865;
