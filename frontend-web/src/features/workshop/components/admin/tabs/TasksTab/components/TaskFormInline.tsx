import React from 'react';
import { InputField } from '@/components/common/InputField/InputField';
import { useTranslation } from '@/i18n';

interface TaskFormInlineProps {
  title: string;
  submitLabel: string;
  name: string;
  setName: (val: string) => void;
  calcType: 'fixed' | 'cylinder' | 'wheel';
  setCalcType: (val: 'fixed' | 'cylinder' | 'wheel') => void;
  hours: string;
  setHours: (val: string) => void;
  hours4Cil: string;
  setHours4Cil: (val: string) => void;
  hoursCilExtra: string;
  setHoursCilExtra: (val: string) => void;
  hours1Rueda: string;
  setHours1Rueda: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
}

export const TaskFormInline: React.FC<TaskFormInlineProps> = ({
  title,
  submitLabel,
  name,
  setName,
  calcType,
  setCalcType,
  hours,
  setHours,
  hours4Cil,
  setHours4Cil,
  hoursCilExtra,
  setHoursCilExtra,
  hours1Rueda,
  setHours1Rueda,
  onSubmit,
  onCancel,
  submitting
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="p-5 bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800/40 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
      <p className="text-xs font-black text-red-500 uppercase tracking-widest">{title}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label={t('tasksTab.taskNameLabel')}
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('tasksTab.taskNamePlaceholder')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-600 dark:text-neutral-400 font-extrabold uppercase tracking-widest ml-1 mb-0.5">{t('tasksTab.calcTypeFixed')}</label>
          <select
            value={calcType}
            onChange={e => setCalcType(e.target.value as any)}
            className="bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-red-500/50 transition-all font-semibold cursor-pointer"
          >
            <option value="fixed">{t('tasksTab.calcTypeFixed')}</option>
            <option value="cylinder">{t('tasksTab.calcTypeCylinder')}</option>
            <option value="wheel">{t('tasksTab.calcTypeWheel')}</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-slate-100/70 dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800/30 rounded-xl">
        {calcType === 'fixed' && (
          <div className="max-w-[200px]">
            <InputField
              label={t('tasksTab.hoursLabel')}
              type="number"
              step="0.05"
              required
              value={hours}
              onChange={e => setHours(e.target.value)}
              mono
            />
          </div>
        )}
        {calcType === 'cylinder' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={t('tasksTab.hours4CilLabel')}
              type="number"
              step="0.05"
              required
              value={hours4Cil}
              onChange={e => setHours4Cil(e.target.value)}
              mono
            />
            <InputField
              label={t('tasksTab.hoursExtraCilLabel')}
              type="number"
              step="0.05"
              value={hoursCilExtra}
              onChange={e => setHoursCilExtra(e.target.value)}
              placeholder="0.25"
              mono
            />
          </div>
        )}
        {calcType === 'wheel' && (
          <div className="max-w-[200px]">
            <InputField
              label={t('tasksTab.hoursPerWheelLabel')}
              type="number"
              step="0.05"
              required
              value={hours1Rueda}
              onChange={e => setHours1Rueda(e.target.value)}
              mono
            />
          </div>
        )}
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

