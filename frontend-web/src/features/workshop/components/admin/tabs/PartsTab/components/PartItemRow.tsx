import React from 'react';
import type { WorkshopInventory } from '@/features/workshop';
import { Edit, Trash } from '@/assets/icons';
import { formatCurrency } from '@/utils/formatters';
import { useTranslation } from '@/i18n';

interface PartItemRowProps {
  item: WorkshopInventory;
  onStartEdit: () => void;
  onDelete: () => void;
}

export const PartItemRow: React.FC<PartItemRowProps> = ({
  item,
  onStartEdit,
  onDelete
}) => {
  const { t } = useTranslation();
  const isLowStock = item.stockQuantity <= item.avisoThreshold;

  return (
    <div
      className={`group px-4 py-3 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isLowStock 
          ? 'bg-amber-600/5 border-amber-500/20 hover:border-amber-500/30' 
          : 'bg-neutral-950 border-neutral-850 hover:border-neutral-800'
      }`}
    >
      <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
        <span className="text-[10px] font-black text-neutral-500 font-mono tracking-widest uppercase shrink-0 px-2 py-1 bg-neutral-900 rounded-lg">
          {item.part.oemReference || t('partsTab.noRef')}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-neutral-200 truncate">{item.part.name}</p>
            <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-neutral-400 font-mono font-bold">
              {item.part.manufacturer}
            </span>
          </div>
          {item.part.technicalSpecs && (
            <p className="text-[10px] text-neutral-500 font-medium truncate mt-0.5">
              Specs: {item.part.technicalSpecs}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {/* Stock Indicator */}
        <div className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 ${
          isLowStock
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
            : 'bg-green-500/5 border-green-500/15 text-green-400'
        }`}>
          {isLowStock && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
          {t('partsTab.stockQtyUnits', { count: item.stockQuantity })}
          {isLowStock && <span className="text-[8px] font-black uppercase text-amber-500/80">{t('partsTab.avisoSubText', { threshold: item.avisoThreshold })}</span>}
        </div>

        {/* Prices details */}
        <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] font-bold flex gap-3 text-neutral-400 font-mono">
          <div><span className="text-[8px] text-neutral-600 font-sans uppercase">{t('partsTab.costLabel')}</span> {formatCurrency(item.costPrice)}</div>
          <div className="border-l border-neutral-800 pl-3">
            <span className="text-[8px] text-neutral-600 font-sans uppercase">{t('partsTab.saleLabel')}</span> <span className="text-white font-bold">{formatCurrency(item.retailPrice)}</span>
          </div>
        </div>

        {/* Edit Action Button */}
        <button
          onClick={onStartEdit}
          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer"
          title={t('partsTab.modifyTooltip')}
        >
          <Edit className="w-4 h-4" />
        </button>

        {/* Delete Action Button */}
        <button
          onClick={onDelete}
          className="p-2 text-neutral-600 hover:text-red-500 hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer"
          title={t('partsTab.deleteTooltip')}
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

