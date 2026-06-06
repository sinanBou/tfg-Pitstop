/**
 * Utilidades de formateo estandarizadas para el frontend de PitStop.
 * Centraliza la representación de monedas, horas y fechas para asegurar
 * coherencia visual en la interfaz de usuario.
 */

/**
 * Formatea un valor numérico como euros con el estándar regional español (ej: 1250.5 -> 1.250,50 €).
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

/**
 * Formatea un número de horas decimales para su correcta representación de tiempos (ej: 2.5 -> 2.50h).
 */
export const formatHours = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0.00h';
  return `${value.toFixed(2)}h`;
};

/**
 * Convierte un string de fecha ISO o timestamp en un formato legible en español (ej: 2026-06-06 -> 06/06/2026).
 */
export const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
