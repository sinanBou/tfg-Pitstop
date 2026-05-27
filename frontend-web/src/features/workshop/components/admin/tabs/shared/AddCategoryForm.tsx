import React from 'react';
import { InputField } from '@/components/common/Input';

interface AddCategoryFormProps {
  title: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  colorVariant?: 'red' | 'blue';
}

export const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
  title,
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  colorVariant = 'red'
}) => {
  const btnColorClass = colorVariant === 'red'
    ? 'bg-red-600 hover:bg-red-500'
    : 'bg-blue-600 hover:bg-blue-500';

  return (
    <form onSubmit={onSubmit} className="bg-neutral-900/80 border border-neutral-800/40 rounded-2xl p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <p className="text-xs font-black text-red-500 uppercase tracking-widest">{title}</p>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <InputField
            label={label}
            required
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
          />
        </div>
        <div className="flex gap-2 pb-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50 cursor-pointer ${btnColorClass}`}
          >
            {submitting ? 'Creando...' : 'Crear Categoría'}
          </button>
        </div>
      </div>
    </form>
  );
};
