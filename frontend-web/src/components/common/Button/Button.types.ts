import React from 'react';

/**
 * Propiedades del botón común del sistema.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Estilo visual del botón. Por defecto 'primary'. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'custom';
  /** Activa un efecto de sombra o brillo dinámico (opcional). */
  glow?: boolean;
}

