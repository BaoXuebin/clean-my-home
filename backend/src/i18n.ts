// CLI internationalisation. Detects the OS locale once and returns a string set.
// To add a language: add a key here and list it in LOCALES.

import { DEFAULT_PORT, VERSION } from './version.js';

type CliStrings = {
  help: (v: string, p: number) => string;
  ready: (url: string) => string;
  shutting: string;
  failed: (m: string) => string;
  serverErr: (m: string) => string;
};

const DICT: Record<string, CliStrings> = {
  en: {
    help: (v, p) => `clean-my-home v${v}

See which AI coding agents are eating your home-directory disk space.
Starts a local dashboard in your browser.

Usage:
  clean-my-home [options]

Options:
  -p, --port <n>        Port to serve on (default ${p}, auto-falls-forward if busy)
      --no-open         Do not open the browser, just print the URL
  -c, --concurrency <n> Directory-walk parallelism (default 64)
  -v, --version         Print version and exit
  -h, --help            Show this help

Everything runs locally on 127.0.0.1; no data leaves your machine.
Scan results are cached for 6h at ~/.cache/clean-my-home/cache.json.`,
    ready: (url) => `Dashboard ready → ${url}`,
    shutting: 'Shutting down…',
    failed: (m) => `Failed to start: ${m}`,
    serverErr: (m) => `Server error: ${m}`,
  },
  'zh-CN': {
    help: (v, p) => `clean-my-home v${v}

查看各 AI 编程 agent 在你的用户目录占用了多少磁盘空间。
会在浏览器中启动一个本地仪表盘。

用法：
  clean-my-home [选项]

选项：
  -p, --port <n>        监听端口（默认 ${p}，被占用时自动顺延）
      --no-open         不自动打开浏览器，仅打印地址
  -c, --concurrency <n> 目录遍历并发数（默认 64）
  -v, --version         打印版本号并退出
  -h, --help            显示此帮助

一切都在本地 127.0.0.1 运行；数据不会离开你的机器。
扫描结果缓存 6 小时，位于 ~/.cache/clean-my-home/cache.json。`,
    ready: (url) => `仪表盘已就绪 → ${url}`,
    shutting: '正在关闭…',
    failed: (m) => `启动失败：${m}`,
    serverErr: (m) => `服务器错误：${m}`,
  },
};

export const LOCALES = Object.keys(DICT);

/** Best-effort OS locale detection -> a DICT key. Env vars take priority,
 *  then the system ICU locale, then English. */
export function detectLocale(): string {
  const env = (process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '').toLowerCase();
  if (env.startsWith('zh')) return 'zh-CN';
  if (env.startsWith('en')) return 'en';
  try {
    const loc = (Intl.DateTimeFormat().resolvedOptions().locale || '').toLowerCase();
    if (loc.startsWith('zh')) return 'zh-CN';
  } catch {
    /* Intl unavailable */
  }
  return 'en';
}

export function getStrings(locale: string): CliStrings {
  return DICT[locale] || DICT.en;
}

/** Convenience for the CLI entry. */
export function cliStrings() {
  return getStrings(detectLocale());
}

export { VERSION, DEFAULT_PORT };
