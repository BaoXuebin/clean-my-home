import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Sun, Moon, HelpCircle } from 'lucide-react';
import { useMeta } from '@/hooks/useMeta';
import { useStartScan } from '@/hooks/useStartScan';
import { useCountUp } from '@/hooks/useCountUp';
import { useNow } from '@/hooks/useNow';
import { useUIStore, useT } from '@/store/useUIStore';
import type { Lang } from '@/lib/i18n';
import type { Dashboard } from '@/hooks/useDashboard';
import { fmtBytes, fmtNum, fmtAgo, fmtDur } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex flex-col items-center leading-tight">
      <span className={cn('text-sm font-semibold tabular-nums', muted ? 'text-muted-foreground' : 'text-foreground')}>{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

export function AppHeader({ dash }: { dash: Dashboard }) {
  const t = useT();
  const { data: meta } = useMeta();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const lang = useUIStore((s) => s.lang);
  const setLang = useUIStore((s) => s.setLang);
  const startScan = useStartScan();
  const animatedBytes = useCountUp(dash.totalBytes);
  const now = useNow();
  const [rulesOpen, setRulesOpen] = useState(false);

  const status = dash.scanning ? 'running' : dash.hasData ? 'idle' : 'empty';
  const statusText = dash.scanning ? t('scanning') : dash.hasData ? t('ready') : t('idle');
  const stale = !dash.scanning && !!dash.scannedAt && !dash.fresh;
  const scannedAgo = dash.scanning ? t('scanningEllipsis') : dash.scannedAt ? fmtAgo(dash.scannedAt, now, t) : '—';

  // Progress text: shows during scan and briefly after scan completes
  const [summary, setSummary] = useState({ dur: 0, bytes: 0 });
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (dash.scanning) {
      setShowProgress(true);
    } else {
      setSummary({ dur: dash.scanDurationMs, bytes: dash.totalBytes });
      setShowProgress(true);
      const id = setTimeout(() => setShowProgress(false), 1800);
      return () => clearTimeout(id);
    }
  }, [dash.scanning, dash.scanDurationMs, dash.totalBytes]);

  let progressText = '';
  if (showProgress) {
    if (dash.scanning) {
      const currentName = dash.currentId ? dash.agentMeta[dash.currentId]?.name : null;
      progressText = currentName
        ? t('scanningNameBytes', { name: currentName, bytes: fmtBytes(dash.totalBytes) })
        : t('doneFrac', { done: dash.done, total: dash.target });
    } else {
      progressText = t('doneSummary', { dur: fmtDur(summary.dur), bytes: fmtBytes(summary.bytes) });
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-base font-semibold tracking-tight md:text-lg shrink-0">clean-my-home</h1>
        <span className="hidden shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
          v{meta?.version ?? ''}
        </span>
        {progressText && (
          <span className="ml-2 truncate text-xs text-muted-foreground">{progressText}</span>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden items-center gap-5 xl:flex">
          <Stat label={t('total')} value={fmtBytes(animatedBytes)} />
          <Stat label={t('files')} value={fmtNum(dash.totalFiles)} />
          <Stat label={t('agents')} value={String(dash.counts.agent)} />
          <Stat label={t('lastScan')} value={scannedAgo} muted={stale} />
        </div>

        <Badge variant={status === 'running' ? 'default' : 'secondary'} className="gap-1.5 font-medium">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'running' ? 'animate-pulse bg-primary' : status === 'idle' ? 'bg-emerald-500' : 'bg-muted-foreground'
            )}
          />
          {statusText}
        </Badge>

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          aria-label={t('langTitle')}
          title={t('langTitle')}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs font-medium shadow-sm outline-none transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="en">EN</option>
          <option value="zh-CN">中文</option>
        </select>

        <Button variant="ghost" size="icon" onClick={() => setRulesOpen(true)} aria-label={t('rulesTitle')} title={t('rulesTitle')}>
          <HelpCircle />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t('themeToggle')} title={theme === 'dark' ? t('toLight') : t('toDark')}>
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>

        <Button variant="outline" size="sm" disabled={dash.scanning} onClick={() => startScan.mutate()}>
          <RefreshCw className={dash.scanning ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{t('refresh')}</span>
        </Button>
      </div>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('rulesTitle')}</DialogTitle>
          <DialogDescription>{t('rulesDesc')}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 min-h-0 flex-1 space-y-4 overflow-y-auto text-sm leading-relaxed text-foreground">
          <section>
            <h3 className="mb-1 font-semibold">{t('rulesAgentTitle')}</h3>
            <p className="text-muted-foreground">{t('rulesAgentBody')}</p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold">{t('rulesCacheTitle')}</h3>
            <p className="text-muted-foreground">{t('rulesCacheBody')}</p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold">{t('rulesResidualTitle')}</h3>
            <p className="text-muted-foreground">{t('rulesResidualBody')}</p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold">{t('rulesExcludeTitle')}</h3>
            <p className="text-muted-foreground">{t('rulesExcludeBody')}</p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold">{t('rulesScopeTitle')}</h3>
            <p className="text-muted-foreground">{t('rulesScopeBody')}</p>
          </section>
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">{t('rulesNote')}</p>
        </div>
      </Dialog>
    </header>
  );
}
