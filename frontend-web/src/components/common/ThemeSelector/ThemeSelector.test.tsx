import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSelector } from './ThemeSelector';
import * as useThemeHook from '@/hooks/useTheme';

describe('ThemeSelector Component', () => {
  it('renders all three theme options (light, dark, system)', () => {
    const mockSetTheme = vi.fn();
    vi.spyOn(useThemeHook, 'useTheme').mockReturnValue({
      theme: 'system',
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeSelector />);

    expect(screen.getByRole('radiogroup', { name: /selección de tema visual/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /modo claro/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /modo oscuro/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /automático según sistema/i })).toBeInTheDocument();
  });

  it('indicates the currently selected theme via aria-checked', () => {
    const mockSetTheme = vi.fn();
    vi.spyOn(useThemeHook, 'useTheme').mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeSelector />);

    const lightOption = screen.getByRole('radio', { name: /modo claro/i });
    const darkOption = screen.getByRole('radio', { name: /modo oscuro/i });

    expect(lightOption).toHaveAttribute('aria-checked', 'true');
    expect(darkOption).toHaveAttribute('aria-checked', 'false');
  });

  it('calls setTheme with the expected mode when an option is clicked', () => {
    const mockSetTheme = vi.fn();
    vi.spyOn(useThemeHook, 'useTheme').mockReturnValue({
      theme: 'system',
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeSelector />);

    const darkButton = screen.getByRole('radio', { name: /modo oscuro/i });
    fireEvent.click(darkButton);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
