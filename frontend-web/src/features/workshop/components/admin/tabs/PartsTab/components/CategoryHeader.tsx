import React from 'react';

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
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
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
          <svg className={`w-3.5 h-3.5 text-red-500 transition-transform duration-300 ${isAddingPart ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {isAddingPart ? 'Cancelar' : 'Añadir Repuesto'}
        </button>
        {itemCount === 0 && onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer"
            title="Eliminar Categoría Vacía"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <svg
          onClick={onToggle}
          className={`w-5 h-5 text-neutral-500 cursor-pointer transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
