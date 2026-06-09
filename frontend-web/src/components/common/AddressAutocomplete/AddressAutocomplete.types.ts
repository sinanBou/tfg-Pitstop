/**
 * Propiedades del componente AddressAutocomplete.
 */
export interface AddressAutocompleteProps {
  /** Etiqueta de texto superior para el campo. */
  label: string;
  /** Nombre identificador para el control de formularios. */
  name: string;
  /** Valor de la dirección actual formateada. */
  value: string;
  /** Callback ejecutado al cambiar y confirmar la dirección completa. */
  onChange: (value: string) => void;
  /** Mensaje de error a renderizar en la parte inferior (opcional). */
  error?: string;
  /** Texto placeholder de sugerencia de entrada (opcional). */
  placeholder?: string;
}

