import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initTheme, toggleTheme, getTheme } from '../theme';

function mockMatchMedia(prefersLight: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: prefersLight && query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('initTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    mockMatchMedia(false);
  });

  it('defaults to dark (no data-theme attribute) when system is dark and no storage', () => {
    mockMatchMedia(false);
    initTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('sets data-theme="light" when system prefers light and no stored preference', () => {
    mockMatchMedia(true);
    initTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('uses stored "dark" over light system preference', () => {
    localStorage.setItem('theme', 'dark');
    mockMatchMedia(true);
    initTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('uses stored "light" over dark system preference', () => {
    localStorage.setItem('theme', 'light');
    mockMatchMedia(false);
    initTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('toggleTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('switches from dark to light', () => {
    toggleTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('switches from light back to dark', () => {
    document.documentElement.dataset.theme = 'light';
    toggleTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});

describe('getTheme', () => {
  it('returns "dark" when no data-theme attribute', () => {
    delete document.documentElement.dataset.theme;
    expect(getTheme()).toBe('dark');
  });

  it('returns "light" when data-theme is "light"', () => {
    document.documentElement.dataset.theme = 'light';
    expect(getTheme()).toBe('light');
    delete document.documentElement.dataset.theme;
  });
});
