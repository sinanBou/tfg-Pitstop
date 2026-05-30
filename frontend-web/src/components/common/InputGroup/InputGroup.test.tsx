import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InputGroup from './InputGroup';

describe('InputGroup', () => {
  it('renders input element correctly with label and placeholder', () => {
    const handleChange = vi.fn();
    render(
      <InputGroup
        label="Usuario"
        name="username"
        value=""
        onChange={handleChange}
        placeholder="Tu nombre de usuario"
      />
    );

    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu nombre de usuario')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(
      <InputGroup
        label="Usuario"
        name="username"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'sinan' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is provided', () => {
    const handleChange = vi.fn();
    render(
      <InputGroup
        label="Usuario"
        name="username"
        value=""
        onChange={handleChange}
        error="El usuario ya existe"
      />
    );

    expect(screen.getByText('El usuario ya existe')).toBeInTheDocument();
  });
});
