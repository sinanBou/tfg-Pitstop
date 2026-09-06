import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { ThemeProvider, useThemeContext } from './ThemeContext';
import { THEME_STORAGE_KEY } from '@/utils/theme';

describe('ThemeContext & ThemeProvider', () => {
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
    
    // Mock matchMedia
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
  );

  it('throws error when useThemeContext is used outside ThemeProvider', () => {
    // Suppress console.error during expected throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useThemeContext())).toThrow(
      'useTheme debe ser utilizado dentro de un ThemeProvider'
    );
    spy.mockRestore();
  });

  it('provides default theme and updates state and storage on setTheme', () => {
    const { result } = renderHook(() => useThemeContext(), { wrapper });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(store[THEME_STORAGE_KEY]).toBe('dark');
  });
});
