import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthSelector } from './MonthSelector';
import { LanguageProvider } from '@/i18n';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('MonthSelector', () => {
  it('renders all months options', () => {
    const handleChange = vi.fn();
    renderWithProvider(<MonthSelector selectedMonth="all" onChange={handleChange} />);

    expect(screen.getByLabelText(/Filter Period:|Filtrar Periodo:/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('all');
    expect(screen.getByRole('option', { name: /January|Enero/i })).toBeInTheDocument();
  });

  it('calls onChange callback when an option is selected', () => {
    const handleChange = vi.fn();
    renderWithProvider(<MonthSelector selectedMonth="all" onChange={handleChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '05' } });
    expect(handleChange).toHaveBeenCalledWith('05');
  });
});
