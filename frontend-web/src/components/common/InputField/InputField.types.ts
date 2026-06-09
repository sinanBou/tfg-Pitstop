import React from 'react';

/**
 * Propiedades del componente de entrada de texto InputField.
 */
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Etiqueta de texto superior descriptiva del campo. */
  label: string;
  /** Determina si se renderiza un elemento textarea en lugar de un input. Por defecto false. */
  multiline?: boolean;
  /** Número de filas iniciales para el textarea. Por defecto 3. */
  rows?: number;
  /** Mensaje de error de validación a renderizar abajo en rojo (opcional). */
  error?: string;
  /** Fuerza el uso de tipografía monoespacio (útil para matrículas o códigos). Por defecto false. */
  mono?: boolean;
  /** Variante cromática al enfocar el campo. Por defecto 'red'. */
  focusVariant?: 'red' | 'blue' | 'emerald' | 'neutral';
}

