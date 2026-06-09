/**
 * Propiedades del componente BottomNav.
 */
export interface BottomNavProps {
  /** Nombres de las pestañas del menú de navegación inferior. */
  tabs: string[];
  /** Índice de la pestaña actualmente activa (0-indexed). */
  activeTab: number;
  /** Callback ejecutado al pulsar o cambiar a otra pestaña. */
  onTabChange: (index: number) => void;
  /** Esquema cromático (azul para conductor, rojo para taller). */
  theme: 'client' | 'workshop';
}

