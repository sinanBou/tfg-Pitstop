import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Check } from '@/assets/icons';
import { getBrandLogo } from '@/assets/BrandLogos';
import { useTranslation } from '@/i18n';

interface PendingAppointmentsListProps {
  appointments: any[];
  onConfirmAppointment: (id: string) => void;
  onRejectAppointment?: (id: string) => void;
}

/**
 * Premium modularized card list for appointments pending confirmation.
 */
const extractLicensePlate = (text: string) => {
  if (!text) return null;
  const match = text.match(/\b([0-9]{4}\s?[- ]?[A-Z]{3}|[A-Z]{1,2}\s?[- ]?[0-9]{4}\s?[- ]?[A-Z]{1,2})\b/i);
  return match ? match[0].toUpperCase().replace(/\s+/g, '-') : null;
};

export const PendingAppointmentsList: React.FC<PendingAppointmentsListProps> = ({
  appointments,
  onConfirmAppointment,
  onRejectAppointment
}) => {
  const { t, language } = useTranslation();

  return (
    <div className="space-y-6">
      <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
        {t('citasTab.pendingConfirmationTitle')}
        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
          {appointments.length}
        </span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length > 0 ? (
          appointments.map((app: any) => {
            const plate = extractLicensePlate(app.vehicleDisplay || '');
            return (
              <Card
                key={app.id}
                variant="neutral"
                border={false}
                padding="none"
                rounded="2xl"
                className="bg-white dark:bg-neutral-900/40 p-5 border border-slate-200 dark:border-neutral-800/80 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]"
              >
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest mb-1.5 flex items-center justify-between">
                    <span>{app.serviceType}</span>
                    {plate && (
                      <div className="inline-flex items-stretch border border-slate-300 dark:border-neutral-700 rounded overflow-hidden shadow-xs text-[9px] font-mono font-black h-4.5">
                        <div className="bg-blue-600 text-white px-1 flex items-center justify-center text-[7px] font-sans font-black">
                          E
                        </div>
                        <div className="bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 px-1.5 flex items-center tracking-wider">
                          {plate}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <div className="w-7 h-7 bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-lg flex items-center justify-center text-slate-700 dark:text-neutral-400 shadow-inner group-hover:bg-slate-200 dark:group-hover:bg-neutral-800 group-hover:text-slate-900 dark:group-hover:text-white transition-all [&_svg]:w-4.5 [&_svg]:h-4.5 [&_div]:w-4.5 [&_div]:text-[8px] flex-shrink-0">
                      {getBrandLogo(app.vehicleDisplay ? app.vehicleDisplay.split(' ')[0] : '')}
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {app.vehicleDisplay}
                    </div>
                  </div>

                  {app.clientFullName && (
                    <div className="text-slate-500 dark:text-neutral-400 text-xs font-bold mt-1">
                      {t('avisosTab.clientLabel')}: <span className="text-slate-800 dark:text-neutral-200">{app.clientFullName}</span>
                    </div>
                  )}

                  <div className="text-slate-500 dark:text-neutral-400 text-xs font-mono mt-3 mb-4">
                    {new Date(app.dateTime).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: '2-digit' })}{' '}
                    {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}{' '}
                    h
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-4">
                  <button
                    type="button"
                    onClick={() => onConfirmAppointment(app.id)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer px-2"
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                    {t('citasTab.confirmBtn')}
                  </button>
                  
                  {onRejectAppointment && (
                    <button
                      type="button"
                      onClick={() => onRejectAppointment(app.id)}
                      className="py-3 px-3.5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-500/20 hover:border-red-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
                      title={t('citasTab.rejectTitle')}
                    >
                      {t('citasTab.rejectBtn')}
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center text-slate-400 dark:text-neutral-500 text-xs uppercase tracking-widest font-bold">
            {t('citasTab.noPendingAppointments')}
          </div>
        )}
      </div>
    </div>
  );
};

