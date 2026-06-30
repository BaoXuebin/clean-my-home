// Theme handling. The no-FOUC inline script in index.html applies the class
// before first paint; these helpers keep the toggle and persisted state in sync.

export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function applyTheme(th: Theme): void {
  document.documentElement.classList.toggle('dark', th === 'dark');
  try {
    localStorage.setItem('cmh-theme', th);
  } catch {
    /* ignore */
  }
}

export function detectTheme(): Theme {
  try {
    const t = localStorage.getItem('cmh-theme');
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* ignore */
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
