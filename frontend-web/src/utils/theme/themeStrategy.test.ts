import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isValidTheme,
  getStoredTheme,
  persistTheme,
  resolveThemeStrategy,
  applyThemeToDom,
  THEME_STORAGE_KEY,
} from './themeStrategy';

describe('themeStrategy utilities', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = String(value);
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
    vi.stubGlobal('localStorage', localStorageMock);
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  describe('isValidTheme', () => {
    it('returns true for valid theme strings', () => {
      expect(isValidTheme('light')).toBe(true);
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('system')).toBe(true);
    });

    it('returns false for invalid inputs (Security/Sanitization)', () => {
      expect(isValidTheme('invalid-theme')).toBe(false);
      expect(isValidTheme('<script>alert(1)</script>')).toBe(false);
      expect(isValidTheme(null)).toBe(false);
      expect(isValidTheme(123)).toBe(false);
    });
  });

  describe('getStoredTheme & persistTheme', () => {
    it('returns defaultTheme when nothing is stored', () => {
      expect(getStoredTheme('system')).toBe('system');
    });

    it('persists and retrieves valid theme from localStorage', () => {
      persistTheme('light');
      expect(getStoredTheme()).toBe('light');
    });

    it('falls back to default if stored value is tampered/corrupted', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'malicious_payload');
      expect(getStoredTheme('dark')).toBe('dark');
    });
  });

  describe('resolveThemeStrategy (Strategy Pattern)', () => {
    it('returns explicit mode when mode is light or dark', () => {
      expect(resolveThemeStrategy('light', 'dark')).toBe('light');
      expect(resolveThemeStrategy('dark', 'light')).toBe('dark');
    });

    it('resolves according to system preference when mode is system', () => {
      expect(resolveThemeStrategy('system', 'light')).toBe('light');
      expect(resolveThemeStrategy('system', 'dark')).toBe('dark');
    });
  });

  describe('applyThemeToDom', () => {
    it('adds dark class and dark color-scheme on dark theme', () => {
      applyThemeToDom('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('removes dark class and sets light color-scheme on light theme', () => {
      document.documentElement.classList.add('dark');
      applyThemeToDom('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe('light');
    });
  });
});
