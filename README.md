# 🏠 clean-my-home

> See which AI coding agents are eating your home-directory disk space — a local dashboard, not another cloud thing.

Install it globally, run one command, and get a beautiful **treemap + donut + ranked bars** view of how much room Claude Code, Cursor, Codex, Copilot, Continue, Windsurf, Kimi, Qoder and friends are taking up on your machine. Everything runs locally on `127.0.0.1`; no data ever leaves your computer.

![dashboard](docs/screenshot.png)

## ✨ Features

- **At-a-glance proportions** — a squarified treemap where tile area ∝ bytes, plus a donut and a sortable, searchable ranking.
- **Knows the usual suspects** — a built-in catalog of well-known agents, each with a name, vendor and color.
- **And discovers the rest** — anything else in your home folder that isn't an obvious runtime/OS folder is auto-detected and grouped under **Other**.
- **Fast & non-blocking** — a concurrency-limited async walk with **live progress over SSE**. Results are cached for 6h, so restarts are instant; refresh is one click.
- **Safe by design** — never follows symlinks (so Windows junctions like `Application Data` can't loop or double-count), swallows permission errors gracefully, and reports logical bytes.
- **Zero runtime dependencies** — only Node's built-ins. Small install, tiny attack surface, works offline.
- **Cross-platform** — Windows, macOS, Linux.

## 📦 Install

```bash
npm install -g clean-my-home
```

Then run:

```bash
clean-my-home
```

Your browser opens to the dashboard. Press `Ctrl+C` in the terminal to stop.

## 🚀 Usage

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

## 🧠 Supported agents (built-in)

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

## 🔧 How it works

1. `clean-my-home` boots a tiny `http` server on `127.0.0.1` and serves a single self-contained HTML dashboard.
2. It builds a scan plan from the built-in catalog (existing paths only) + auto-discovered "Other" folders.
3. A concurrency-limited walk (`lstat`, never following symlinks) sums logical bytes per folder, streaming progress to the browser over SSE.
4. The result is cached to disk so the next launch renders instantly.

## 🔒 Privacy

100% local. The server binds to `127.0.0.1` only, there are no telemetry calls, no external fonts or CDNs, and the only thing written to disk is your own cache file. Nothing is uploaded anywhere.

## 🧰 Develop

```bash
git clone https://github.com/BaoXuebin/clean-my-home
cd clean-my-home
npm test            # node --test
node bin.js         # run locally without global install
npm install -g .    # install the local checkout globally
```

No build step — the dashboard is a single hand-written HTML file.

## 🗑️ Uninstall

```bash
npm rm -g clean-my-home
rm -rf ~/.cache/clean-my-home   # optional: remove the cache
```

## License

MIT © BaoXuebin
