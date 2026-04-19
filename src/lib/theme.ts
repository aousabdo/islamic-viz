// src/lib/theme.ts
export type Theme = 'dark' | 'light';

/** Call once before ReactDOM.createRoot — reads localStorage then system pref. */
export function initTheme(): void {
  const stored = localStorage.getItem('theme') as Theme | null;
  const preferred: Theme = window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
  const theme = stored ?? preferred;
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
  }
}

/** Toggle between dark and light; persists selection to localStorage. */
export function toggleTheme(): void {
  const isLight = document.documentElement.dataset.theme === 'light';
  if (isLight) {
    delete document.documentElement.dataset.theme;
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.dataset.theme = 'light';
    localStorage.setItem('theme', 'light');
  }
}

/** Returns current active theme. */
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}
