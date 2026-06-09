import { useState, useEffect } from 'react';
import { type VehicleRequest } from '@/features/client';

/**
 * Propiedades de configuración para el hook useVehicleForm.
 */
interface UseVehicleFormProps {
  /** Indica si el formulario de registro de vehículo está visible/abierto. */
  isOpen: boolean;
  /** Callback para cerrar el modal o formulario. */
  onClose: () => void;
  /** Callback asíncrono para persistir la creación del vehículo. Devuelve true si la creación fue exitosa. */
  onSubmit: (data: VehicleRequest) => Promise<boolean>;
  /** Función asíncrona para obtener el catálogo de marcas. */
  fetchMakes: () => Promise<string[]>;
  /** Función asíncrona para obtener los modelos correspondientes a una marca. */
  fetchModels: (make: string) => Promise<string[]>;
}

/**
 * Hook personalizado para orquestar el comportamiento del formulario de registro de vehículos.
 * Gestiona el estado de carga, la sincronización en cascada de marca -> modelos,
 * el estado local del formulario (`formData`), y maneja el envío de datos de forma segura.
 */
export function useVehicleForm({ isOpen, onClose, onSubmit, fetchMakes, fetchModels }: UseVehicleFormProps) {
  /** Estado de carga durante el proceso de envío del formulario. */
  const [loading, setLoading] = useState(false);
  /** Listado de marcas disponibles cargadas para el selector. */
  const [makes, setMakes] = useState<string[]>([]);
  /** Listado de modelos filtrados disponibles para el selector. */
  const [models, setModels] = useState<string[]>([]);

  /** Estado reactivo con los datos del formulario de creación del vehículo. */
  const [formData, setFormData] = useState<VehicleRequest>({
    brand: '',
    model: '',
    licensePlate: '',
    vin: '',
    year: new Date().getFullYear(),
    color: ''
  });

  // Cargar marcas iniciales
  useEffect(() => {
    if (isOpen) {
      fetchMakes().then(setMakes);
    }
  }, [isOpen, fetchMakes]);

  // Cargar modelos cuando cambie la marca
  useEffect(() => {
    if (formData.brand) {
      fetchModels(formData.brand).then(setModels);
    } else {
      setModels([]);
    }
  }, [formData.brand, fetchModels]);

  /**
   * Manejador para el envío del formulario. Previene el comportamiento por defecto,
   * activa el spinner, invoca el callback onSubmit y limpia el formulario si tiene éxito.
   * @param e Evento de formulario de React.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        setFormData({
          brand: '',
          model: '',
          licensePlate: '',
          vin: '',
          year: new Date().getFullYear(),
          color: ''
        });
        onClose();
      }
    } catch (error) {
      console.error("Error al registrar vehículo:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    makes,
    models,
    formData,
    setFormData,
    handleSubmit
  };
}

