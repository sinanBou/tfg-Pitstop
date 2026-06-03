import React from 'react';
import { Box, Plus, Trash, ChevronDown } from '@/assets/icons';

interface CategoryHeaderProps {
  displayName: string;
  itemCount: number;
  isExpanded: boolean;
  isAddingPart: boolean;
  onToggle: () => void;
  onToggleAddPart: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  displayName,
  itemCount,
  isExpanded,
  isAddingPart,
  onToggle,
  onToggleAddPart,
  onDelete
}) => {
  return (
    <div
      onClick={onToggle}
      className="p-5 flex justify-between items-center cursor-pointer hover:bg-neutral-900/40 transition-all select-none"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-neutral-800/50 border border-neutral-700/30 flex items-center justify-center">
          <Box className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-white tracking-tight uppercase text-sm tracking-wider">{displayName}</h3>
          <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase block mt-0.5">
            {itemCount} Repuesto{itemCount !== 1 ? 's' : ''} registrado{itemCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
        <button
          onClick={onToggleAddPart}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
            isAddingPart
              ? 'bg-red-600/10 border border-red-500/30 text-red-400'
              : 'bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 text-white'
          }`}
        >
          <Plus className={`w-3.5 h-3.5 text-red-500 transition-transform duration-300 ${isAddingPart ? 'rotate-45' : ''}`} strokeWidth={2.5} />
          {isAddingPart ? 'Cancelar' : 'Añadir Repuesto'}
        </button>
        {itemCount === 0 && onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer"
            title="Eliminar Categoría Vacía"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
        <ChevronDown
          onClick={onToggle}
          className={`w-5 h-5 text-neutral-500 cursor-pointer transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
};
