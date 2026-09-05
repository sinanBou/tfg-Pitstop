import React from 'react';
import type { AppointmentRequest, WorkshopMinDTO } from '@/features/client';
import { Check } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface DetailsStepProps {
  formData: AppointmentRequest;
  workshops: WorkshopMinDTO[];
  onServiceTypeChange: (type: string) => void;
  onDescriptionChange: (desc: string) => void;
  onFinish: () => void;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({
  formData,
  workshops,
  onServiceTypeChange,
  onDescriptionChange,
  onFinish
}) => {
  const { t } = useTranslation();
  const selectedWorkshop = workshops.find(w => w.id === formData.workshopId);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Resumen Mini */}
          <div className="bg-black/40 border border-neutral-800 rounded-xl p-3 flex flex-col justify-center">
             <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">{t('appointmentModal.scheduledDate')}</p>
             <p className="text-white text-sm font-bold truncate">
               {formData.date ? formData.date.split('-').reverse().join('-') : ''} - {formData.time}h
             </p>
          </div>
          <div className="bg-black/40 border border-neutral-800 rounded-xl p-3 flex flex-col justify-center">
             <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">{t('appointmentModal.selectedWorkshop')}</p>
             <p className="text-white text-sm font-bold truncate">{selectedWorkshop?.companyName || t('common.workshop')}</p>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block mb-2 ml-1">
            {t('appointmentModal.serviceSubject')}
          </label>
          <input 
            type="text" 
            placeholder={t('appointmentModal.serviceSubjectPlaceholder')}
            value={formData.serviceType}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-white font-medium outline-none focus:border-blue-600 focus:bg-black transition-all placeholder-neutral-600"
            onChange={(e) => onServiceTypeChange(e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block mb-2 ml-1">
            {t('appointmentModal.additionalDetails')}
          </label>
          <textarea 
            placeholder={t('appointmentModal.additionalDetailsPlaceholder')}
            value={formData.description}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-600 focus:bg-black transition-all h-28 resize-none placeholder-neutral-600"
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end items-center bg-black/50 -mx-8 -mb-8 p-6 px-8 border-t border-neutral-800">
         <button 
          type="button"
          onClick={onFinish}
          disabled={!formData.serviceType}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:bg-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:hover:bg-blue-600 group"
        >
          {t('appointmentModal.confirmBooking')}
          <Check className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
