export interface MonthSelectorProps {
  selectedMonth: string; // 'all' | '01' | '02' | ... | '12'
  onChange: (month: string) => void;
}
