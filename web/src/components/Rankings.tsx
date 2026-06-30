import { useLayoutEffect, useMemo, useRef } from 'react';
import { Search } from 'lucide-react';
import type { Agent } from '@/types';
import { useUIStore, useT } from '@/store/useUIStore';
import type { SortBy, CategoryFilter } from '@/store/useUIStore';
import { fmtBytes, fmtPct } from '@/lib/format';
import { AgentIcon } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function BarRow({ agent, total, index, onOpen }: { agent: Agent; total: number; index: number; onOpen: (id: string) => void }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const pct = total ? (agent.bytes / total) * 100 : 0;
  const width = Math.max(pct, agent.bytes > 0 ? 1.5 : 0);

  // Mount: animate the fill 0 → width.
  useLayoutEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    el.style.width = '0%';
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => (el.style.width = `${width}%`)));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Updates (live scan / sort): set directly so the CSS transition animates.
  useLayoutEffect(() => {
    const el = fillRef.current;
    if (!el || first.current) {
      first.current = false;
      return;
    }
    el.style.width = `${width}%`;
  }, [width]);

  return (
    <div
      onClick={() => onOpen(agent.id)}
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-accent"
    >
      <AgentIcon id={agent.id} category={agent.category} size={16} className="w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="flex w-28 shrink-0 items-center gap-1 truncate text-sm md:w-36">
        {agent.name}
        {agent.provisional ? <span className="text-muted-foreground">…</span> : null}
      </span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          ref={fillRef}
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ background: agent.color || '#64748B', width: '0%' }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-sm tabular-nums">{fmtBytes(agent.bytes)}</span>
      <span className="hidden w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground md:block">{fmtPct(total ? agent.bytes / total : 0)}</span>
    </div>
  );
}

export function Rankings({ agents, total, onOpen }: { agents: Agent[]; total: number; onOpen: (id: string) => void }) {
  const t = useT();
  const sortBy = useUIStore((s) => s.sortBy);
  const setSortBy = useUIStore((s) => s.setSortBy);
  const categoryFilter = useUIStore((s) => s.categoryFilter);
  const setCategoryFilter = useUIStore((s) => s.setCategoryFilter);
  const filterText = useUIStore((s) => s.filterText);
  const setFilterText = useUIStore((s) => s.setFilterText);

  const arr = useMemo(() => {
    let a = agents.slice();
    if (categoryFilter !== 'all') {
      a = a.filter((x) =>
        categoryFilter === 'agent'
          ? x.category === 'cli' || x.category === 'extension' || x.category === 'ide'
          : x.category === categoryFilter
      );
    }
    if (filterText) {
      const f = filterText.toLowerCase();
      a = a.filter((x) => (x.name || '').toLowerCase().includes(f) || (x.id || '').includes(f));
    }
    a.sort((x, y) => {
      if (sortBy === 'name') return (x.name || '').localeCompare(y.name || '');
      if (sortBy === 'files') return (y.files || 0) - (x.files || 0);
      return y.bytes - x.bytes;
    });
    return a;
  }, [agents, categoryFilter, filterText, sortBy]);

  const SortBtn = ({ value, label }: { value: SortBy; label: string }) => (
    <button
      onClick={() => setSortBy(value)}
      className={cn(
        'rounded px-2 py-1 text-xs font-medium transition-colors',
        sortBy === value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  );

  const FilterBtn = ({ value, label }: { value: CategoryFilter; label: string }) => (
    <button
      onClick={() => setCategoryFilter(value)}
      className={cn(
        'rounded px-2 py-1 text-xs font-medium transition-colors',
        categoryFilter === value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-6">
          <h2 className="text-sm font-semibold">{t('rankings')}</h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
              <FilterBtn value="all" label={t('catAll')} />
              <FilterBtn value="agent" label={t('catAgent')} />
              <FilterBtn value="cache" label={t('catCache')} />
              <FilterBtn value="residual" label={t('catResidual')} />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-32 pl-8 text-xs md:w-40"
                placeholder={t('filterPh')}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
              <SortBtn value="bytes" label={t('size')} />
              <SortBtn value="files" label={t('files')} />
              <SortBtn value="name" label={t('name')} />
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-2 md:px-6">
          {arr.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-muted-foreground">{t('noMatch', { q: filterText })}</div>
          ) : (
            arr.map((a, i) => <BarRow key={a.id} agent={a} total={total} index={i} onOpen={onOpen} />)
          )}
        </div>
      </div>
    </div>
  );
}
