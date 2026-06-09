import React from 'react';

/**
 * Propiedades del componente BaseModal.
 */
export interface BaseModalProps {
  /** Indica si el modal debe renderizarse en pantalla. */
  isOpen: boolean;
  /** Función callback que se ejecuta al presionar fuera del modal o en el botón de cerrar. */
  onClose: () => void;
  /** Título principal de la cabecera del modal (en mayúsculas). */
  title: string;
  /** Subtítulo de estilo monoespacio que acompaña al título (opcional). */
  subtitle?: string;
  /** Tema de color para los efectos visuales (glow, barra de progreso y dot). Por defecto 'blue'. */
  theme?: 'blue' | 'red' | 'neutral' | 'green';
  /** Ancho de la barra de progreso superior animada (ej. "33%", "100%") (opcional). */
  progressBarWidth?: string; 
  /** Indica si se dibuja un dot indicador de estado animado (ping) junto al título. Por defecto true. */
  showDot?: boolean;
  /** Contenido interno a renderizar en el cuerpo del modal. */
  children: React.ReactNode;
}

