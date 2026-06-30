// UI internationalisation (English / 中文). Ported from the original dashboard.
// To add a language: add a key map here and list it in LOCALES.

export type Lang = 'en' | 'zh-CN';

type Dict = Record<string, string>;

const DICT: Record<Lang, Dict> = {
  en: {
    total: 'total', files: 'files', agents: 'agents', lastScan: 'last scan',
    refresh: 'Refresh', scanNow: 'Scan now',
    noScanTitle: 'No scan yet',
    noScanDesc: 'Measure how much disk space your AI coding agents occupy in your home directory. Everything stays on this machine.',
    shareByAgent: 'share by agent', donutSub: 'donut',
    diskMap: 'disk map', areaSub: 'area ∝ bytes',
    rankings: 'rankings', filterPh: 'filter…',
    size: 'size', name: 'name',
    catAll: 'all', catAgent: 'agent', catCache: 'cache', catResidual: 'residual',
    noData: 'no data',
    dcOne: 'total · 1 agent', dcMany: 'total · {n} agents',
    filesUnit: '{n} files', noMatch: 'no agents match “{q}”',
    pathsHead: 'paths ({n})', missing: 'missing',
    pathsEmpty: 'paths appear when this agent finishes scanning…',
    drawerSub: '{files} files · {dirs} dirs · {skipped} skipped',
    drawerSubNoSkip: '{files} files · {dirs} dirs',
    idle: 'idle', scanning: 'scanning', ready: 'ready', scanningEllipsis: 'scanning…',
    starting: 'starting…',
    scanningName: 'scanning ▸ {name}', scanningNameBytes: 'scanning ▸ {name} · {bytes}',
    doneFrac: '{done}/{total} done', resuming: 'resuming · {done}/{total}',
    doneSummary: 'done · {dur} · {bytes}',
    justNow: 'just now', mAgo: '{m}m ago', hAgo: '{h}h ago', dAgo: '{d}d ago',
    staleTitle: 'cache stale — refresh',
    localAddr: 'local · 127.0.0.1', privacy: 'no data leaves your machine', cacheLabel: 'cache: {path}',
    cat_cli: 'cli', cat_extension: 'extension', cat_ide: 'ide', cat_cache: 'cache', cat_residual: 'residual',
    langTitle: 'Language',
    themeToggle: 'Toggle theme', toLight: 'Switch to light theme', toDark: 'Switch to dark theme',
    rulesTitle: 'Classification rules',
    rulesDesc: 'How directories are classified into agents, caches, and residuals.',
    rulesAgentTitle: 'Agent',
    rulesAgentBody: 'Built-in catalog of well-known AI coding agents (CLI / extension / IDE). An agent is counted only when at least one of its known paths exists on this machine; those paths are then excluded from discovery to avoid double counting.',
    rulesCacheTitle: 'Cache',
    rulesCacheBody: 'Build caches and runtime/package stores whose names match the cache list (e.g. .npm, .gradle, .m2, .cargo, .pnpm-store, .bun, .cache, .docker, .nuget, go). Regenerable — usually safe to clean to reclaim space. Each directory is its own row.',
    rulesResidualTitle: 'Residual',
    rulesResidualBody: 'Any other discovered directory that is neither an agent nor a cache — often leftovers from uninstalled apps. Reviewed before deletion. Each directory is its own row so you can pinpoint large leftovers.',
    rulesExcludeTitle: 'Excluded',
    rulesExcludeBody: 'System, credential and OS-user folders (AppData root, Desktop, Documents, .ssh, .gnupg, .aws, Library, snap, editor configs, shell histories, …) are never shown — they are unsafe or meaningless to clean as "residuals".',
    rulesScopeTitle: 'Scan scope',
    rulesScopeBody: 'Only immediate children are scanned (no deep guessing): the top level of your home directory, plus one level deep into the platform app-data roots (Windows %APPDATA% / %LOCALAPPDATA%; Linux ~/.config / ~/.local/share; macOS ~/Library/Application Support / Caches). Symlinks are never followed.',
    rulesNote: 'Read-only measurement — this tool never deletes anything. Classification is by directory basename and is heuristic; verify before cleaning.',
  },
  'zh-CN': {
    total: '总量', files: '文件', agents: 'agent', lastScan: '上次扫描',
    refresh: '刷新', scanNow: '立即扫描',
    noScanTitle: '尚未扫描',
    noScanDesc: '查看各 AI 编程 agent 在你的用户目录占用了多少磁盘空间。所有数据都只在本机处理。',
    shareByAgent: '各 agent 占比', donutSub: '环形图',
    diskMap: '磁盘地图', areaSub: '面积 ∝ 字节',
    rankings: '排行', filterPh: '筛选…',
    size: '大小', name: '名称',
    catAll: '全部', catAgent: 'Agent', catCache: '缓存', catResidual: '残留',
    noData: '暂无数据',
    dcOne: '总量 · 1 个 agent', dcMany: '总量 · {n} 个 agent',
    filesUnit: '{n} 个文件', noMatch: '没有匹配“{q}”的 agent',
    pathsHead: '路径（{n}）', missing: '缺失',
    pathsEmpty: '该 agent 扫描完成后将显示路径…',
    drawerSub: '{files} 个文件 · {dirs} 个目录 · {skipped} 项跳过',
    drawerSubNoSkip: '{files} 个文件 · {dirs} 个目录',
    idle: '空闲', scanning: '扫描中', ready: '就绪', scanningEllipsis: '扫描中…',
    starting: '开始扫描…',
    scanningName: '扫描中 ▸ {name}', scanningNameBytes: '扫描中 ▸ {name} · {bytes}',
    doneFrac: '{done}/{total} 完成', resuming: '恢复中 · {done}/{total}',
    doneSummary: '完成 · {dur} · {bytes}',
    justNow: '刚刚', mAgo: '{m} 分钟前', hAgo: '{h} 小时前', dAgo: '{d} 天前',
    staleTitle: '缓存已过期 — 请刷新',
    localAddr: '本地 · 127.0.0.1', privacy: '数据不离开本机', cacheLabel: '缓存：{path}',
    cat_cli: '命令行', cat_extension: '插件', cat_ide: 'IDE', cat_cache: '缓存', cat_residual: '残留',
    langTitle: '语言',
    themeToggle: '切换主题', toLight: '切换到浅色主题', toDark: '切换到深色主题',
    rulesTitle: '分类规则',
    rulesDesc: '目录如何被划分为 agent、缓存与残留。',
    rulesAgentTitle: 'Agent',
    rulesAgentBody: '内置的已知 AI 编程 agent 目录（CLI / 插件 / IDE）。仅当某个 agent 的已知路径在本机至少存在一条时才计入扫描，且这些路径会从发现结果中排除，避免重复计数。',
    rulesCacheTitle: '缓存',
    rulesCacheBody: '名称命中缓存名单的构建缓存与运行时/包存储目录（如 .npm、.gradle、.m2、.cargo、.pnpm-store、.bun、.cache、.docker、.nuget、go）。可重建——通常可安全清理以释放空间。每个目录单独成行。',
    rulesResidualTitle: '残留',
    rulesResidualBody: '既非 agent、又非缓存的其他发现目录——常为已卸载应用留下的残留。清理前请确认。每个目录单独成行，便于定位占用较大的残留。',
    rulesExcludeTitle: '已排除',
    rulesExcludeBody: '系统、凭证与系统用户目录（AppData 根、桌面、文档、.ssh、.gnupg、.aws、Library、snap、编辑器配置、shell 历史等）永不显示——作为"残留"清理它们不安全或无意义。',
    rulesScopeTitle: '扫描范围',
    rulesScopeBody: '仅扫描直接子目录（不盲目深遍历）：用户目录顶层，以及平台应用数据根的一层子目录（Windows %APPDATA% / %LOCALAPPDATA%；Linux ~/.config / ~/.local/share；macOS ~/Library/Application Support / Caches）。符号链接永不跟随。',
    rulesNote: '只读测量——本工具绝不删除任何文件。分类按目录名启发式判定，清理前请自行核实。',
  },
};

export const LOCALES: Lang[] = ['en', 'zh-CN'];

export function detectLang(): Lang {
  try {
    const s = localStorage.getItem('cmh-lang');
    if (s === 'en' || s === 'zh-CN') return s;
  } catch {
    /* ignore */
  }
  const n = (navigator.language || 'en').toLowerCase();
  return n.startsWith('zh') ? 'zh-CN' : 'en';
}

/** Translate `key` for `lang`, interpolating `{var}` placeholders. */
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s = (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
  if (vars) {
    for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  }
  return s;
}
