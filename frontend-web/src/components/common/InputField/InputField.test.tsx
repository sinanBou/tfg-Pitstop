import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField } from './InputField';

describe('InputField', () => {
  it('renders input element correctly with label', () => {
    render(<InputField label="Nombre" placeholder="Tu nombre" />);

    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
  });

  it('renders textarea when multiline is true', () => {
    render(<InputField label="Comentarios" multiline={true} placeholder="Escribe aquí" />);

    expect(screen.getByText('Comentarios')).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText('Escribe aquí');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('calls onChange when user types in the input', () => {
    const handleChange = vi.fn();
    render(<InputField label="Nombre" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Juan' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error is passed', () => {
    render(<InputField label="Email" error="El email es inválido" />);

    expect(screen.getByText('El email es inválido')).toBeInTheDocument();
  });
});
