import { create } from 'zustand';
import { useCallback } from 'react';
import { detectLang, translate, type Lang } from '@/lib/i18n';
import { detectTheme, type Theme } from '@/lib/theme';

export type SortBy = 'bytes' | 'files' | 'name';

export type CategoryFilter = 'all' | 'agent' | 'cache' | 'residual';

interface UIState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (c: CategoryFilter) => void;
  filterText: string;
  setFilterText: (s: string) => void;
  drawerAgentId: string | null;
  openDrawer: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: detectTheme(),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  lang: detectLang(),
  setLang: (lang) => {
    try {
      localStorage.setItem('cmh-lang', lang);
    } catch {
      /* ignore */
    }
    set({ lang });
  },
  sortBy: 'bytes',
  setSortBy: (sortBy) => set({ sortBy }),
  categoryFilter: 'all',
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  filterText: '',
  setFilterText: (filterText) => set({ filterText }),
  drawerAgentId: null,
  openDrawer: (drawerAgentId) => set({ drawerAgentId }),
}));

/** Bound translator — re-renders only when `lang` changes. */
export function useT() {
  const lang = useUIStore((s) => s.lang);
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );
}
