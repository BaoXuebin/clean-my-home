// Dev entry. `tsx watch src/index.ts` boots the CLI (parses argv, listens on
// 127.0.0.1, opens the browser). In production this file is compiled to
// dist/index.js and launched by the root bin.js.

import { run } from './cli.js';

run();
