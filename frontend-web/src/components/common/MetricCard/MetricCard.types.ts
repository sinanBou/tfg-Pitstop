/**
 * Propiedades del componente MetricCard.
 */
export interface MetricCardProps {
  /** Título descriptivo de la métrica (ej. "INGRESOS TOTALES"). */
  label: string;
  /** Valor principal numérico o textual a destacar en grande. */
  value: string | number;
  /** Texto aclaratorio de tamaño menor que acompaña la métrica (opcional). */
  subtext?: string;
}

