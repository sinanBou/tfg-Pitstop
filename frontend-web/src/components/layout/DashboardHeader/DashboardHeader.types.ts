export interface DashboardHeaderProps {
  type: 'client' | 'workshop';
  profilePictureUrl?: string;
  onOpenProfile?: () => void;
  onOpenWorkshopSettings?: () => void;
}
