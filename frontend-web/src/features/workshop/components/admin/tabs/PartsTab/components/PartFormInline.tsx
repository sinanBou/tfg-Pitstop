import React from 'react';
import { InputField } from '@/components/common/InputField/InputField';
import { useTranslation } from '@/i18n';

interface PartFormInlineProps {
  title: string;
  submitLabel: string;
  oemRef: string;
  setOemRef: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  manufacturer: string;
  setManufacturer: (val: string) => void;
  specs: string;
  setSpecs: (val: string) => void;
  stockQty: string;
  setStockQty: (val: string) => void;
  avisoThreshold: string;
  setAvisoThreshold: (val: string) => void;
  costPrice: string;
  setCostPrice: (val: string) => void;
  retailPrice: string;
  setRetailPrice: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
}

export const PartFormInline: React.FC<PartFormInlineProps> = ({
  title,
  submitLabel,
  oemRef,
  setOemRef,
  name,
  setName,
  manufacturer,
  setManufacturer,
  specs,
  setSpecs,
  stockQty,
  setStockQty,
  avisoThreshold,
  setAvisoThreshold,
  costPrice,
  setCostPrice,
  retailPrice,
  setRetailPrice,
  onSubmit,
  onCancel,
  submitting
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="p-5 bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800/40 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
      <p className="text-xs font-black text-red-500 uppercase tracking-widest">{title}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label={t('avisosTab.oemRefLabel')}
          value={oemRef}
          onChange={e => setOemRef(e.target.value)}
          placeholder="Ej: REF-1020 (Opcional)..."
        />
        <InputField
          label={t('avisosTab.partNameLabel')}
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Disco de freno delantero"
        />
        <InputField
          label={t('avisosTab.manufacturerLabel')}
          value={manufacturer}
          onChange={e => setManufacturer(e.target.value)}
          placeholder="Ej: Brembo, Bosch..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label={t('avisosTab.techSpecsLabel')}
          value={specs}
          onChange={e => setSpecs(e.target.value)}
          placeholder="Ej: Diámetro 280mm, ventilado..."
        />
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <InputField
              label={t('avisosTab.currentStockInput')}
              type="number"
              required
              value={stockQty}
              onChange={e => setStockQty(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <InputField
              label={t('avisosTab.avisoThresholdInput')}
              type="number"
              required
              value={avisoThreshold}
              onChange={e => setAvisoThreshold(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label={t('avisosTab.costPriceInput')}
          type="number"
          step="0.01"
          required
          value={costPrice}
          onChange={e => setCostPrice(e.target.value)}
          placeholder="0.00"
          mono
        />
        <InputField
          label={t('avisosTab.retailPriceInput')}
          type="number"
          step="0.01"
          required
          value={retailPrice}
          onChange={e => setRetailPrice(e.target.value)}
          placeholder="0.00"
          mono
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 rounded-xl border border-slate-300 hover:border-slate-400 dark:border-neutral-800 dark:hover:border-neutral-700 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 transition-all cursor-pointer"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          {submitting ? t('common.processing') : submitLabel}
        </button>
      </div>
    </form>
  );
};

