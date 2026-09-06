import React from 'react';
import { Box, Plus, Trash, ChevronDown } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface CategoryHeaderProps {
  displayName: string;
  itemCount: number;
  isExpanded: boolean;
  isAddingPart: boolean;
  onToggle: () => void;
  onToggleAddPart: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  // Customization props
  addLabel?: string;
  itemLabelSingle?: string;
  itemLabelPlural?: string;
  gender?: 'm' | 'f';
  icon?: React.ComponentType<{ className?: string }>;
  colorVariant?: 'red' | 'blue';
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  displayName,
  itemCount,
  isExpanded,
  isAddingPart,
  onToggle,
  onToggleAddPart,
  onDelete,
  addLabel,
  itemLabelSingle,
  itemLabelPlural,
  gender = 'm',
  icon: Icon = Box,
  colorVariant = 'red'
}) => {
  const { t } = useTranslation();

  const finalAddLabel = addLabel || t('shared.addPart');
  const finalItemSingle = itemLabelSingle || t('shared.partSingle');
  const finalItemPlural = itemLabelPlural || t('shared.partPlural');

  const registeredStatus = gender === 'm'
    ? (itemCount !== 1 ? t('shared.registeredMPlural') : t('shared.registeredM'))
    : (itemCount !== 1 ? t('shared.registeredFPlural') : t('shared.registeredF'));

  return (
    <div
      onClick={onToggle}
      className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-neutral-900/40 transition-all select-none"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/30 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${colorVariant === 'red' ? 'text-red-500' : 'text-blue-500'}`} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white tracking-tight uppercase text-sm tracking-wider">{displayName}</h3>
          <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 tracking-widest uppercase block mt-0.5">
            {itemCount} {itemCount === 1 ? finalItemSingle : finalItemPlural} {registeredStatus}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
        <button
          onClick={onToggleAddPart}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
            isAddingPart
              ? colorVariant === 'red'
                ? 'bg-red-600/10 border border-red-500/30 text-red-600 dark:text-red-400'
                : 'bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400'
              : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 dark:bg-neutral-850 dark:hover:bg-neutral-800 dark:border-neutral-800 dark:text-white'
          }`}
        >
          <Plus className={`w-3.5 h-3.5 ${colorVariant === 'red' ? 'text-red-500' : 'text-blue-500'} transition-transform duration-300 ${isAddingPart ? 'rotate-45' : ''}`} strokeWidth={2.5} />
          {isAddingPart ? t('shared.cancel') : finalAddLabel}
        </button>
        {itemCount === 0 && onDelete && (
          <button
            onClick={onDelete}
            className={`p-2 text-slate-400 dark:text-neutral-500 ${colorVariant === 'red' ? 'hover:text-red-500' : 'hover:text-blue-500'} hover:bg-slate-100 dark:hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer`}
            title={t('shared.deleteEmptyCategory')}
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
        <ChevronDown
          onClick={onToggle}
          className={`w-5 h-5 text-slate-400 dark:text-neutral-500 cursor-pointer transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
};
