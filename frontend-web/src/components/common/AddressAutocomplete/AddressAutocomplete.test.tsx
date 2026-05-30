import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AddressAutocomplete from './AddressAutocomplete';

describe('AddressAutocomplete', () => {
  it('renders correctly with label and placeholder', () => {
    const handleChange = vi.fn();
    render(
      <AddressAutocomplete
        label="Dirección"
        name="address"
        value=""
        onChange={handleChange}
        placeholder="Introduce tu dirección"
      />
    );

    expect(screen.getByText('Dirección')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Introduce tu dirección')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Piso/i)).toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    const handleChange = vi.fn();
    render(
      <AddressAutocomplete
        label="Dirección"
        name="address"
        value=""
        onChange={handleChange}
        error="La dirección es requerida"
      />
    );

    expect(screen.getByText('La dirección es requerida')).toBeInTheDocument();
  });
});
