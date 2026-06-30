import { useMemo } from 'react';
import { useScanData } from '@/hooks/useScanData';
import { useScanStore } from '@/store/useScanStore';
import { useUIStore, useT } from '@/store/useUIStore';
import type { Agent, AgentMeta, DataResponse } from '@/types';
import { fmtBytes, fmtNum } from '@/lib/format';
import { AgentIcon } from '@/lib/icons';
import { textOn } from '@/lib/color';
import { cn } from '@/lib/utils';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function findAgent(
  id: string | null,
  data: DataResponse | undefined,
  live: Record<string, { bytes: number; files: number }>,
  agentMeta: Record<string, AgentMeta>
): Agent | null {
  if (!id) return null;
  const modelAgents = data?.status === 'ready' ? data.agents : [];
  const found = modelAgents.find((a) => a.id === id);
  if (found) return found;
  if (live[id]) {
    const m = agentMeta[id] || ({ name: id, color: '#64748B', vendor: '', category: 'residual' } as AgentMeta);
    return {
      id,
      name: m.name,
      color: m.color,
      vendor: m.vendor,
      category: m.category,
      bytes: live[id].bytes,
      files: live[id].files,
      paths: [],
      provisional: true,
    };
  }
  return null;
}

export function AgentDrawer() {
  const t = useT();
  const id = useUIStore((s) => s.drawerAgentId);
  const openDrawer = useUIStore((s) => s.openDrawer);
  const { data } = useScanData();
  const live = useScanStore((s) => s.live);
  const agentMeta = useScanStore((s) => s.agentMeta);

  const agent = useMemo(() => findAgent(id, data, live, agentMeta), [id, data, live, agentMeta]);
  const open = !!id && !!agent;

  if (!agent) {
    return <Dialog open={open} onOpenChange={(v) => !v && openDrawer(null)}>{null}</Dialog>;
  }

  const paths = (agent.paths || []).slice().sort((x, y) => y.bytes - x.bytes);
  const sub = agent.skipped
    ? t('drawerSub', { files: fmtNum(agent.files || 0), dirs: fmtNum(agent.dirs || 0), skipped: agent.skipped })
    : t('drawerSubNoSkip', { files: fmtNum(agent.files || 0), dirs: fmtNum(agent.dirs || 0) });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && openDrawer(null)}>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: agent.color || '#64748B', color: textOn(agent.color || '#64748B') }}
          >
            <AgentIcon id={agent.id} category={agent.category} size={20} />
          </span>
          <div className="min-w-0">
            <DialogTitle className="truncate">{agent.name}</DialogTitle>
            <DialogDescription className="truncate">{agent.vendor || ''}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="mt-3">
        <div className="text-3xl font-semibold tabular-nums tracking-tight">{fmtBytes(agent.bytes)}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
        <Badge variant="secondary" className="mt-3 uppercase tracking-wide">{t('cat_' + agent.category)}</Badge>
      </div>

      <Separator className="my-4" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t('pathsHead', { n: paths.length })}</div>
        {paths.length ? (
          paths.map((p) => (
            <div
              key={p.path}
              className="grid grid-cols-[12px_1fr_auto] items-start gap-2.5 border-b border-dashed border-border py-2.5 last:border-0"
            >
              <span
                className={cn(
                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                  p.isLink ? 'bg-muted-foreground' : p.exists ? 'bg-emerald-500' : 'bg-destructive'
                )}
                title={p.isLink ? 'symlink' : p.exists ? 'exists' : 'missing'}
              />
              <span className="break-all text-xs text-muted-foreground" title={p.path}>
                {p.path}
              </span>
              <span className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                {p.exists ? fmtBytes(p.bytes) : t('missing')}
              </span>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">{t('pathsEmpty')}</div>
        )}
      </div>
    </Dialog>
  );
}
