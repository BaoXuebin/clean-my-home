#!/usr/bin/env node
// Thin entry so `npm i -g` creates the right bin shim.
// Launches the compiled backend (dist/index.js boots the CLI, listens on
// 127.0.0.1, and opens the browser). Run `npm run build` first.
import './backend/dist/index.js';
