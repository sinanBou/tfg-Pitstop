import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthFormFields from './AuthFormFields';

describe('AuthFormFields', () => {
  const defaultFormData = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    nif: '',
    phoneNumber: '',
  };

  const defaultProps = {
    formData: defaultFormData,
    onChange: vi.fn(),
    onAddressChange: vi.fn(),
    errors: {},
    isWorkshop: false,
  };

  it('renders standard fields with client specific placeholders when isWorkshop is false', () => {
    render(<AuthFormFields {...defaultProps} />);

    expect(screen.getByText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Carlos')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sainz')).toBeInTheDocument();
    expect(screen.getByText(/Dirección \(Opcional\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Calle, Número, Ciudad...')).toBeInTheDocument();
  });

  it('renders standard fields with owner specific placeholders when isWorkshop is true', () => {
    render(<AuthFormFields {...defaultProps} isWorkshop={true} />);

    expect(screen.getByText(/Nombre del Dueño/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Juan')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pérez')).toBeInTheDocument();
    expect(screen.getByText(/Dirección del Dueño \(Opcional\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Calle, Número, Ciudad...')).toBeInTheDocument();
  });

  it('displays validation error messages when errors are passed', () => {
    const errors = {
      firstname: 'El nombre es obligatorio.',
      nif: 'El DNI/NIF es obligatorio.',
    };

    render(<AuthFormFields {...defaultProps} errors={errors} />);

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El DNI/NIF es obligatorio.')).toBeInTheDocument();
  });

  it('calls onChange handler when typing in input fields', () => {
    const onChange = vi.fn();
    render(<AuthFormFields {...defaultProps} onChange={onChange} />);

    const firstnameInput = screen.getByPlaceholderText('Carlos');
    fireEvent.change(firstnameInput, { target: { value: 'Lucas' } });

    expect(onChange).toHaveBeenCalled();
  });
});
