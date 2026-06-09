/**
 * Propiedades del componente ProgressBar.
 */
export interface ProgressBarProps {
  /** Título descriptivo superior izquierdo (ej. "MATERIALES"). */
  label: string;
  /** Subtexto monoespacio aclaratorio de menor tamaño (opcional). */
  sublabel?: string;
  /** Valor numérico o texto a mostrar en el extremo superior derecho (ej. "450,00€"). */
  valueText: string;
  /** Porcentaje de llenado de la barra (de 0 a 100). */
  percentage: number;
}

