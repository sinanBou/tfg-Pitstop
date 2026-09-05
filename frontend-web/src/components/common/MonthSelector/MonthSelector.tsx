import React from 'react';
import type { MonthSelectorProps } from './MonthSelector.types';
import { useTranslation } from '@/i18n';

export const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onChange }) => {
  const { t } = useTranslation();

  const months = [
    { value: 'all', label: t('monthSelector.allHistory') },
    { value: '01', label: t('monthSelector.january') },
    { value: '02', label: t('monthSelector.february') },
    { value: '03', label: t('monthSelector.march') },
    { value: '04', label: t('monthSelector.april') },
    { value: '05', label: t('monthSelector.may') },
    { value: '06', label: t('monthSelector.june') },
    { value: '07', label: t('monthSelector.july') },
    { value: '08', label: t('monthSelector.august') },
    { value: '09', label: t('monthSelector.september') },
    { value: '10', label: t('monthSelector.october') },
    { value: '11', label: t('monthSelector.november') },
    { value: '12', label: t('monthSelector.december') }
  ];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="month-select" className="text-[10px] font-black uppercase tracking-widest text-neutral-500 font-mono">
        {t('monthSelector.filterPeriod')}
      </label>
      <select
        id="month-select"
        value={selectedMonth}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 transition-all font-mono"
      >
        {months.map(m => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
};
