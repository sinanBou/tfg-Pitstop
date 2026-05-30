export interface SearchableSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  popularOptions?: string[];
  popularLabel?: string;
  restLabel?: string;
}
