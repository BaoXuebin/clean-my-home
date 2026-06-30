import { FolderSearch, RefreshCw } from 'lucide-react';
import { useStartScan } from '@/hooks/useStartScan';
import { useT } from '@/store/useUIStore';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  const t = useT();
  const startScan = useStartScan();
  return (
    <div className="flex h-full items-center justify-center p-4 md:p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FolderSearch className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{t('noScanTitle')}</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{t('noScanDesc')}</p>
        <Button className="mt-5" onClick={() => startScan.mutate()}>
          <RefreshCw />
          {t('scanNow')}
        </Button>
      </div>
    </div>
  );
}
