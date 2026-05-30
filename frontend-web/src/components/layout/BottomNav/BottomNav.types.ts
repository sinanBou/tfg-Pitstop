export interface BottomNavProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
  theme: 'client' | 'workshop';
}
