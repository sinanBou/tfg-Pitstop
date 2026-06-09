/**
 * Propiedades del componente SearchableSelect.
 */
export interface SearchableSelectProps {
  /** Etiqueta de texto superior (ej. "MARCA"). */
  label: string;
  /** Texto placeholder mostrado cuando no hay selección activa. */
  placeholder: string;
  /** Listado completo de opciones de texto disponibles. */
  options: string[];
  /** Valor de la opción actualmente seleccionada. */
  value: string;
  /** Callback ejecutado al seleccionar una opción del listado. */
  onChange: (value: string) => void;
  /** Deshabilita la interacción con el selector. Por defecto false. */
  disabled?: boolean;
  /** Subconjunto de opciones a destacar como populares al principio (opcional). */
  popularOptions?: string[];
  /** Título de la sección de opciones populares (opcional). Por defecto "Marcas más populares". */
  popularLabel?: string;
  /** Título de la sección para el resto de opciones (opcional). Por defecto "Resto de marcas". */
  restLabel?: string;
}

