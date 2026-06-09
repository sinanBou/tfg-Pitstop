import React from 'react';

/**
 * Propiedades del componente Badge.
 */
export interface BadgeProps {
  /** Contenido o etiqueta de texto a renderizar en el badge. */
  children: React.ReactNode;
  /** Estilo visual del badge que determina su color de fondo, texto y bordes. Por defecto 'neutral'. */
  variant?: 'primary' | 'secondary' | 'danger' | 'neutral' | 'warning';
  /** Clases CSS adicionales de Tailwind para sobreescribir estilos (opcional). */
  className?: string;
}

