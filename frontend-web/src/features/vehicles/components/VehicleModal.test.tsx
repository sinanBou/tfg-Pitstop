import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VehicleModal } from './VehicleModal';

describe('VehicleModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn().mockResolvedValue(true);
  const mockFetchMakes = vi.fn().mockResolvedValue(['BMW', 'Audi']);
  const mockFetchModels = vi.fn().mockResolvedValue(['Serie 3', 'A4']);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <VehicleModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
        fetchMakes={mockFetchMakes} 
        fetchModels={mockFetchModels} 
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el formulario correctamente cuando isOpen es true', async () => {
    await act(async () => {
      render(
        <VehicleModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSubmit={mockOnSubmit} 
          fetchMakes={mockFetchMakes} 
          fetchModels={mockFetchModels} 
        />
      );
    });

    expect(screen.getByRole('heading', { name: /Nuevo Vehículo/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0000XXX')).toBeInTheDocument();
  });

  it('debe enviar los datos del formulario al hacer submit', async () => {
    await act(async () => {
      render(
        <VehicleModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSubmit={mockOnSubmit} 
          fetchMakes={mockFetchMakes} 
          fetchModels={mockFetchModels} 
        />
      );
    });

    const plateInput = screen.getByPlaceholderText('0000XXX');
    const yearInput = screen.getByDisplayValue(new Date().getFullYear().toString());
    const colorInput = screen.getByPlaceholderText('Ej: Negro Mate');

    await act(async () => {
      fireEvent.change(plateInput, { target: { value: '1234ABC' } });
      fireEvent.change(yearInput, { target: { value: '2020' } });
      fireEvent.change(colorInput, { target: { value: 'Azul' } });
    });

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();

    await act(async () => {
      fireEvent.submit(form!);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      brand: '',
      model: '',
      licensePlate: '1234ABC',
      vin: '',
      year: 2020,
      color: 'Azul'
    });
  });
});
