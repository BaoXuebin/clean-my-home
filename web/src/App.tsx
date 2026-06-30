import { useEffect } from 'react';
import { applyTheme } from '@/lib/theme';
import { useUIStore } from '@/store/useUIStore';
import { useDashboard } from '@/hooks/useDashboard';
import { AppHeader } from '@/components/layout/AppHeader';

import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/EmptyState';
import { Rankings } from '@/components/Rankings';
import { AgentDrawer } from '@/components/AgentDrawer';

function App() {
  const theme = useUIStore((s) => s.theme);
  const lang = useUIStore((s) => s.lang);
  const openDrawer = useUIStore((s) => s.openDrawer);
  const dash = useDashboard();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const showGrid = dash.hasData || dash.scanning;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader dash={dash} />
      <main className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full w-full">
          {showGrid ? (
            <Rankings agents={dash.agents} total={dash.totalBytes} onOpen={openDrawer} />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
      <Footer />
      <AgentDrawer />
    </div>
  );
}

export default App;
