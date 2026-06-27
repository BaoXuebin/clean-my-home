// CLI entry: parse args, boot the local server, open the browser, handle shutdown.

import { createServer } from './server.js';
import { openBrowser } from './openBrowser.js';
import { VERSION, DEFAULT_PORT } from './version.js';

const HELP = `
  clean-my-home v${VERSION}

  See which AI coding agents are eating your home-directory disk space.
  Starts a local dashboard in your browser.

  Usage:
    clean-my-home [options]

  Options:
    -p, --port <n>        Port to serve on (default ${DEFAULT_PORT}, auto-falls-forward if busy)
        --no-open         Do not open the browser, just print the URL
    -c, --concurrency <n> Directory-walk parallelism (default 64)
        --no-color        (reserved)
    -v, --version         Print version and exit
    -h, --help            Show this help

  Everything runs locally on 127.0.0.1; no data leaves your machine.
  Scan results are cached for 6h at ~/.cache/clean-my-home/cache.json.
`.trim();

export async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(HELP + '\n');
    return;
  }
  if (args.version) {
    process.stdout.write(VERSION + '\n');
    return;
  }
  await boot(args);
}

function parseArgs(argv) {
  const args = { port: DEFAULT_PORT, open: true, concurrency: 64 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '-h':
      case '--help':
        args.help = true;
        break;
      case '-v':
      case '--version':
        args.version = true;
        break;
      case '--no-open':
        args.open = false;
        break;
      case '-p':
      case '--port':
        args.port = Number(argv[++i]);
        break;
      case '-c':
      case '--concurrency':
        args.concurrency = Number(argv[++i]);
        break;
      default:
        if (a.startsWith('--port=')) args.port = Number(a.slice(7));
        else if (a.startsWith('--concurrency=')) args.concurrency = Number(a.slice(14));
        else if (!a.startsWith('-')) {
          // ignore positional
        } else {
          // unknown flag — ignore quietly
        }
    }
  }
  if (!Number.isFinite(args.port) || args.port < 1) args.port = DEFAULT_PORT;
  if (!Number.isFinite(args.concurrency) || args.concurrency < 1) args.concurrency = 64;
  return args;
}

async function boot(args) {
  let server;
  try {
    server = await createServer({ concurrency: args.concurrency });
  } catch (err) {
    process.stderr.write(`Failed to start: ${err.message}\n`);
    process.exit(1);
  }

  const port = await listenWithFallback(server, args.port);

  server.on('error', (err) => {
    process.stderr.write(`Server error: ${err.message}\n`);
  });

  const url = `http://127.0.0.1:${port}`;
  process.stdout.write(`\n  🏠 clean-my-home v${VERSION}\n`);
  process.stdout.write(`  Dashboard ready → ${url}\n\n`);

  if (args.open) openBrowser(url);

  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    process.stdout.write('\n  Shutting down…\n');
    try {
      server.close(() => process.exit(0));
    } catch {
      process.exit(0);
    }
    // hard exit if close hangs
    setTimeout(() => process.exit(0), 1000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

/** Listen on `port`; if busy, try port+1 … up to 20 times. */
function listenWithFallback(server, port) {
  return new Promise((resolve, reject) => {
    const MAX_TRIES = 20;
    let attempt = 0;
    const tryPort = (p) => {
      const onError = (err) => {
        if (err.code === 'EADDRINUSE' && attempt < MAX_TRIES) {
          attempt++;
          tryPort(port + attempt);
        } else {
          reject(err);
        }
      };
      server.once('error', onError);
      server.listen(p, '127.0.0.1', () => {
        server.removeListener('error', onError);
        resolve(p);
      });
    };
    tryPort(port);
  });
}
