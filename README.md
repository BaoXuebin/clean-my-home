# clean-my-home

> See which AI coding agents are eating your home-directory disk space — a local dashboard, not another cloud thing.

Install it globally, run one command, and get a beautiful **treemap + donut + ranked bars** view of how much room Claude Code, Cursor, Codex, Copilot, Continue, Windsurf, Kimi, Qoder and friends are taking up on your machine. Everything runs locally on `127.0.0.1`; no data ever leaves your computer.

## Features

- **At-a-glance proportions** — a squarified treemap where tile area ∝ bytes, plus a donut and a sortable, searchable ranking.
- **Knows the usual suspects** — a built-in catalog of well-known agents, each with a name, vendor and color.
- **And discovers the rest** — anything else in your home folder that isn't an obvious runtime/OS folder is auto-detected and grouped under **Other**.
- **Fast & non-blocking** — a concurrency-limited async walk with **live progress over Socket.io**. Results are cached for 6h, so restarts are instant; refresh is one click.
- **Safe by design** — never follows symlinks (so Windows junctions like `Application Data` can't loop or double-count), swallows permission errors gracefully, and reports logical bytes.
- **Cross-platform** — Windows, macOS, Linux.
- **Light & dark themes** — a warm-paper light mode and warm-carbon dark mode, one-click toggle, remembers your choice (and follows your OS setting at first run).
- **Bilingual UI (English / 中文)** — switch language from the header (remembered); CLI help and messages auto-follow your system locale.

## Architecture

A small monorepo (npm workspaces):

- **`backend/`** — TypeScript server ([Express](https://expressjs.com) + [Socket.io](https://socket.io) + [winston](https://github.com/winstonjs/winston)). Hosts the scan engine, a tiny REST API (`/api/data`, `/api/meta`, `/api/scan`), streams live scan progress over Socket.io, and serves the prebuilt frontend in production.
- **`web/`** — the dashboard: [React](https://react.dev) + [Vite](https://vitejs.dev) + TypeScript + [Tailwind CSS](https://tailwindcss.com) + shadcn/ui-style primitives. The treemap and donut are hand-drawn on `<canvas>`; state lives in [zustand](https://github.com/pmnd/zustand) + [React Query](https://tanstack.com/query).
- **`bin.js`** — the CLI entry (`clean-my-home`) that boots the compiled backend, binds `127.0.0.1`, and opens the browser.

The warm-carbon instrument theme is preserved verbatim from the original single-file dashboard (ported into Tailwind CSS variables).

## Install

```bash
npm install -g clean-my-home
```

Then run:

```bash
clean-my-home
```

Your browser opens to the dashboard. Press `Ctrl+C` in the terminal to stop.

## Usage

```text
clean-my-home [options]

Options:
  -p, --port <n>        Port to serve on (default 7865, auto-falls-forward if busy)
      --no-open         Do not open the browser, just print the URL
  -c, --concurrency <n> Directory-walk parallelism (default 64)
  -v, --version         Print version and exit
  -h, --help            Show help
```

Scan results are cached at `~/.cache/clean-my-home/cache.json` for 6 hours. Click **Refresh** to force a re-scan anytime.

## Supported agents (built-in)

| Agent | Vendor | Typical paths |
|---|---|---|
| Claude Code | Anthropic | `~/.claude`, `~/.claude.json` |
| Codex CLI | OpenAI | `~/.codex` |
| Gemini CLI | Google | `~/.gemini` |
| Aider | Open Source | `~/.aider` |
| Kimi | Moonshot | `~/.kimi`, `~/.kimi-code` |
| Qoder | Qoder | `~/.qoder`, `~/.qoder-cli`, `~/.qoderwork`, `~/.qoderworkcn` |
| Coze | ByteDance | `~/Coze` |
| Continue | Continue Dev | `~/.continue`, `%APPDATA%/Continue`, `~/Library/Application Support/Continue` |
| GitHub Copilot | GitHub | `~/.copilot`, `%LOCALAPPDATA%/GitHub Copilot`, … |
| Cursor | Anysphere | `%APPDATA%/Cursor`, `~/Library/Application Support/Cursor`, `~/.config/Cursor` |
| Windsurf | Codeium | `~/.codeium`, `~/.windsurf`, `%APPDATA%/Windsurf`, … |

Anything else in your home folder that isn't a known runtime/OS folder (`.gradle`, `.m2`, `.npm`, `AppData`, `Library`, …) shows up under **Other**, expandable per folder.

## How it works

1. `clean-my-home` boots an Express server on `127.0.0.1` and serves the prebuilt React dashboard.
2. It builds a scan plan from the built-in catalog (existing paths only) + auto-discovered "Other" folders.
3. A concurrency-limited walk (`lstat`, never following symlinks) sums logical bytes per folder, streaming progress to the browser over Socket.io.
4. The result is cached to disk so the next launch renders instantly.

## Privacy

100% local. The server binds to `127.0.0.1` only, there are no telemetry calls, and the only thing written to disk is your own cache file. Nothing is uploaded anywhere.

## Develop

```bash
git clone https://github.com/BaoXuebin/clean-my-home
cd clean-my-home
npm install                 # installs both workspaces (backend, web)
npm run dev                 # backend (tsx watch, :7865) + web (Vite, :5173, proxies /api + /socket.io)
npm test                    # backend vitest
npm run build               # builds web → public/ and backend → backend/dist
npm start                   # run the compiled app (node bin.js)
npm install -g .            # install the local checkout globally
```

In dev, open the Vite URL (`http://localhost:5173`); it proxies API and Socket.io requests to the backend. The published artifact ships only `bin.js`, `backend/dist`, and the prebuilt `public/` — the TypeScript sources and `web/` build tooling are not included.

## Uninstall

```bash
npm rm -g clean-my-home
rm -rf ~/.cache/clean-my-home   # optional: remove the cache
```

## License

MIT © BaoXuebin
