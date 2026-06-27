#!/usr/bin/env node
// Thin entry so `npm i -g` creates the right bin shim.
import { run } from './src/cli.js';

run();
