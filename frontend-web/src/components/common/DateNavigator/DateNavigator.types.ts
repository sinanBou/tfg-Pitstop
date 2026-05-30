export interface DateNavigatorProps {
  selectedDate: Date;
  onChange: (d: Date) => void;
  variant?: 'red' | 'blue';
}
