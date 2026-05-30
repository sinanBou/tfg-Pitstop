import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchableSelect } from './SearchableSelect';

describe('SearchableSelect', () => {
  const options = ['AUDI', 'BMW', 'FORD', 'KIA'];

  it('renders correctly with default state', () => {
    const handleChange = vi.fn();
    render(
      <SearchableSelect 
        label="Marca" 
        placeholder="Selecciona marca" 
        options={options} 
        value="" 
        onChange={handleChange} 
      />
    );

    expect(screen.getByText('Marca')).toBeInTheDocument();
    expect(screen.getByText('Selecciona marca')).toBeInTheDocument();
  });

  it('opens dropdown options when trigger is clicked', () => {
    const handleChange = vi.fn();
    render(
      <SearchableSelect 
        label="Marca" 
        placeholder="Selecciona marca" 
        options={options} 
        value="" 
        onChange={handleChange} 
      />
    );

    const trigger = screen.getByTestId('select-trigger');
    fireEvent.click(trigger);

    // Options should be visible
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByText('BMW')).toBeInTheDocument();
  });

  it('filters options by search input query', () => {
    const handleChange = vi.fn();
    render(
      <SearchableSelect 
        label="Marca" 
        placeholder="Selecciona marca" 
        options={options} 
        value="" 
        onChange={handleChange} 
      />
    );

    const trigger = screen.getByTestId('select-trigger');
    fireEvent.click(trigger);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'BM' } });

    expect(screen.getByText('BMW')).toBeInTheDocument();
    expect(screen.queryByText('AUDI')).not.toBeInTheDocument();
  });

  it('triggers onChange when option is clicked', () => {
    const handleChange = vi.fn();
    render(
      <SearchableSelect 
        label="Marca" 
        placeholder="Selecciona marca" 
        options={options} 
        value="" 
        onChange={handleChange} 
      />
    );

    const trigger = screen.getByTestId('select-trigger');
    fireEvent.click(trigger);

    const optionBtn = screen.getByText('BMW');
    fireEvent.click(optionBtn);

    expect(handleChange).toHaveBeenCalledWith('BMW');
  });
});
