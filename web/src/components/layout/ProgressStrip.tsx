import { useEffect, useState } from 'react';
import { useT } from '@/store/useUIStore';
import type { Dashboard } from '@/hooks/useDashboard';
import { fmtBytes, fmtDur } from '@/lib/format';

export function ProgressStrip({ dash }: { dash: Dashboard }) {
  const t = useT();
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState({ dur: 0, bytes: 0 });

  useEffect(() => {
    if (dash.scanning) {
      setShowSummary(false);
    } else {
      setShowSummary(true);
      setSummary({ dur: dash.scanDurationMs, bytes: dash.totalBytes });
      const id = setTimeout(() => setShowSummary(false), 1800);
      return () => clearTimeout(id);
    }
  }, [dash.scanning, dash.scanDurationMs, dash.totalBytes]);

  const visible = dash.scanning || showSummary;
  if (!visible) return null;

  const currentName = dash.currentId ? dash.agentMeta[dash.currentId]?.name : null;

  let text: string;
  if (dash.scanning) {
    text = currentName
      ? t('scanningNameBytes', { name: currentName, bytes: fmtBytes(dash.totalBytes) })
      : t('doneFrac', { done: dash.done, total: dash.target });
  } else {
    text = t('doneSummary', { dur: fmtDur(summary.dur), bytes: fmtBytes(summary.bytes) });
  }

  return (
    <div className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-2 md:px-6">
      <span className="whitespace-nowrap text-xs text-muted-foreground">{text}</span>
    </div>
  );
}
