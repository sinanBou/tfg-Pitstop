/**
 * Propiedades del componente DashboardHeader.
 */
export interface DashboardHeaderProps {
  /** Rol/área principal de la vista del usuario. */
  type: 'client' | 'workshop';
  /** URL de la foto de perfil del usuario activo (opcional). */
  profilePictureUrl?: string;
  /** Callback opcional que abre el modal/sección de perfil del usuario. */
  onOpenProfile?: () => void;
  /** Callback opcional que abre los ajustes o perfil del taller asociado. */
  onOpenWorkshopSettings?: () => void;
}

