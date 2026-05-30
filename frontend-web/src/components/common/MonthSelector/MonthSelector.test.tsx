import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthSelector } from './MonthSelector';

describe('MonthSelector', () => {
  it('renders all months options', () => {
    const handleChange = vi.fn();
    render(<MonthSelector selectedMonth="all" onChange={handleChange} />);

    expect(screen.getByLabelText(/Filtrar Periodo:/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('all');
    expect(screen.getByRole('option', { name: 'Enero' })).toBeInTheDocument();
  });

  it('calls onChange callback when an option is selected', () => {
    const handleChange = vi.fn();
    render(<MonthSelector selectedMonth="all" onChange={handleChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '05' } });
    expect(handleChange).toHaveBeenCalledWith('05');
  });
});
