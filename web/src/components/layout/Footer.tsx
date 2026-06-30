import { useMeta } from '@/hooks/useMeta';
import { useT } from '@/store/useUIStore';

export function Footer() {
  const t = useT();
  const { data: meta } = useMeta();
  const cachePath = meta?.cachePath ?? '~/.cache/clean-my-home/';

  return (
    <footer className="flex shrink-0 flex-wrap gap-2 px-4 py-2 text-[11px] text-muted-foreground md:px-6">
      <span>{t('localAddr')}</span>
      <span>·</span>
      <span>{t('privacy')}</span>
      <span>·</span>
      <span className="truncate">{t('cacheLabel', { path: cachePath })}</span>
    </footer>
  );
}
