import { useState, useEffect } from 'react';
import { type VehicleRequest } from '@/features/client';

interface UseVehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleRequest) => Promise<boolean>;
  fetchMakes: () => Promise<string[]>;
  fetchModels: (make: string) => Promise<string[]>;
}

export function useVehicleForm({ isOpen, onClose, onSubmit, fetchMakes, fetchModels }: UseVehicleFormProps) {
  const [loading, setLoading] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

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
