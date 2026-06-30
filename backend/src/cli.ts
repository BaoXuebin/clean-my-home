// CLI entry: parse args, boot the local server, open the browser, handle shutdown.

import type { Server } from 'node:http';
import { createServer } from './server.js';
import { openBrowser } from './openBrowser.js';
import { VERSION, DEFAULT_PORT } from './version.js';
import { detectLocale, getStrings } from './i18n.js';

interface CliArgs {
  help?: boolean;
  version?: boolean;
  open: boolean;
  port: number;
  concurrency: number;
}

export async function run(): Promise<void> {
  const i18n = getStrings(detectLocale());
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(i18n.help(VERSION, DEFAULT_PORT) + '\n');
    return;
  }
  if (args.version) {
    process.stdout.write(VERSION + '\n');
    return;
  }
  await boot(args, i18n);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { port: DEFAULT_PORT, open: true, concurrency: 64 };
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

async function boot(args: CliArgs, i18n: ReturnType<typeof getStrings>): Promise<void> {
  let server: Server;
  try {
    const handle = await createServer({ concurrency: args.concurrency });
    server = handle.httpServer;
  } catch (err) {
    process.stderr.write(i18n.failed((err as Error).message) + '\n');
    process.exit(1);
  }

  const port = await listenWithFallback(server, args.port);

  server.on('error', (err) => {
    process.stderr.write(i18n.serverErr(err.message) + '\n');
  });

  const url = `http://127.0.0.1:${port}`;
  process.stdout.write(`\n  clean-my-home v${VERSION}\n`);
  process.stdout.write(`  ${i18n.ready(url)}\n\n`);

  if (args.open) openBrowser(url);

  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    process.stdout.write('\n  ' + i18n.shutting + '\n');
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
function listenWithFallback(server: Server, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const MAX_TRIES = 20;
    let attempt = 0;
    const tryPort = (p: number) => {
      const onError = (err: NodeJS.ErrnoException) => {
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
