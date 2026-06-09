/**
 * Propiedades del botón de retorno común (BackButton).
 */
export interface BackButtonProps {
  /** Función callback ejecutada al presionar el botón. */
  onClick: () => void;
  /** Texto descriptivo del botón para accesibilidad (tooltip/title). Por defecto 'Volver'. */
  title?: string;
  /** Esquema de color para los efectos interactivos y dot indicador. Por defecto 'blue'. */
  theme?: 'blue' | 'red';
  /** Muestra un pequeño punto de acento de color flotando sobre el botón (opcional). */
  showDot?: boolean;
}

