import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeMode } from '@/types/theme';
import {
  containerStyles,
  buttonBaseStyles,
  buttonActiveStyles,
  buttonInactiveStyles,
} from './ThemeSelector.styles';

export interface ThemeSelectorProps {
  className?: string;
}

interface ThemeOption {
  readonly mode: ThemeMode;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { mode: 'light', label: 'Modo claro', icon: Sun },
  { mode: 'dark', label: 'Modo oscuro', icon: Moon },
  { mode: 'system', label: 'Automático según sistema', icon: Monitor },
];

/**
 * Botón individual para cada opción de tema (Modular y accesible).
 */
const ThemeButton: React.FC<{
  option: ThemeOption;
  isSelected: boolean;
  onSelect: (mode: ThemeMode) => void;
}> = ({ option, isSelected, onSelect }) => {
  const Icon = option.icon;
  const stateClass = isSelected ? buttonActiveStyles : buttonInactiveStyles;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={option.label}
      title={option.label}
      onClick={() => onSelect(option.mode)}
      className={`${buttonBaseStyles} ${stateClass}`}
    >
      <Icon className="w-4 h-4" />
      <span className="sr-only">{option.label}</span>
    </button>
  );
};

/**
 * Componente selector de tema accesible (Theme Switcher) con soporte para light, dark y system.
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Selección de tema visual"
      className={`${containerStyles} ${className}`}
    >
      {THEME_OPTIONS.map((opt) => (
        <ThemeButton
          key={opt.mode}
          option={opt}
          isSelected={theme === opt.mode}
          onSelect={setTheme}
        />
      ))}
    </div>
  );
};

export default ThemeSelector;
