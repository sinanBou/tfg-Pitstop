import React from 'react';
import InputGroup from '@/components/common/InputGroup/InputGroup';
import AddressAutocomplete from '@/components/common/AddressAutocomplete/AddressAutocomplete';

export interface AuthFormFieldsProps {
  formData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    address: string;
    nif: string;
    phoneNumber: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (val: string) => void;
  errors: Record<string, string>;
  isWorkshop: boolean;
}

export default function AuthFormFields({
  formData,
  onChange,
  onAddressChange,
  errors,
  isWorkshop,
}: AuthFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputGroup 
          label="Nombre" 
          name="firstname" 
          value={formData.firstname} 
          onChange={onChange} 
          error={errors.firstname} 
          placeholder={isWorkshop ? "Juan" : "Carlos"} 
        />
        <InputGroup 
          label="Apellidos" 
          name="lastname" 
          value={formData.lastname} 
          onChange={onChange} 
          error={errors.lastname} 
          placeholder={isWorkshop ? "Pérez" : "Sainz"} 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputGroup 
          label="DNI / NIF" 
          name="nif" 
          value={formData.nif} 
          onChange={onChange} 
          error={errors.nif} 
          placeholder="12345678Z" 
        />
        <InputGroup 
          label="Teléfono" 
          name="phoneNumber" 
          value={formData.phoneNumber} 
          onChange={onChange} 
          error={errors.phoneNumber} 
          placeholder="600123456" 
        />
      </div>

      <AddressAutocomplete 
        label={isWorkshop ? "Dirección del Dueño" : "Dirección (Opcional)"} 
        name="address" 
        value={formData.address || ''} 
        onChange={onAddressChange} 
        error={errors.address} 
        placeholder={isWorkshop ? "Tu dirección personal..." : "Madrid, Calle..."} 
      />

      <div className="border-t border-neutral-800/50 my-2 pt-6 flex flex-col gap-5 relative">
        <InputGroup 
          label="Correo Electrónico" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={onChange} 
          error={errors.email} 
          placeholder="tu@email.com" 
        />
        <InputGroup 
          label="Contraseña" 
          name="password" 
          type="password" 
          value={formData.password} 
          onChange={onChange} 
          error={errors.password} 
          placeholder="Mín 8 car, 1 Mayús, 1 Núm" 
        />
      </div>
    </>
  );
}
