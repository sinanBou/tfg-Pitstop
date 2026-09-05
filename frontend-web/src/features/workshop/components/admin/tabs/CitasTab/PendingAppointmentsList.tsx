import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Check } from '@/assets/icons';
import { Button } from '@/components/common/Button/Button';
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
export const PendingAppointmentsList: React.FC<PendingAppointmentsListProps> = ({
  appointments,
  onConfirmAppointment,
  onRejectAppointment
}) => {
  const { t, language } = useTranslation();

  return (
    <div className="space-y-6">
      <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
        {t('citasTab.pendingConfirmationTitle')}
        <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full text-[10px]">
          {appointments.length}
        </span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length > 0 ? (
          appointments.map((app: any) => (
            <Card
              key={app.id}
              variant="neutral"
              border={false}
              padding="none"
              rounded="2xl"
              className="bg-neutral-900/40 p-5 border border-neutral-800/80 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-neutral-700 hover:shadow-2xl"
            >
              <div>
                <div className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1.5">
                  {app.serviceType}
                </div>
                
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <div className="w-6 h-6 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-neutral-400 shadow-inner group-hover:bg-neutral-800 group-hover:text-white transition-all [&_svg]:w-4 [&_svg]:h-4 [&_div]:w-4 [&_div]:text-[8px] flex-shrink-0">
                    {getBrandLogo(app.vehicleDisplay ? app.vehicleDisplay.split(' ')[0] : '')}
                  </div>
                  <div className="text-lg font-black text-white leading-none">
                    {app.vehicleDisplay}
                  </div>
                </div>

                {app.clientFullName && (
                  <div className="text-neutral-400 text-xs font-bold mt-1">
                    {t('avisosTab.clientLabel')}: <span className="text-neutral-200">{app.clientFullName}</span>
                  </div>
                )}

                <div className="text-neutral-400 text-xs font-mono mt-3 mb-4">
                  {new Date(app.dateTime).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: '2-digit' })}{' '}
                  {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}{' '}
                  h
                </div>
              </div>

              <div className="flex gap-2 w-full mt-4">
                <Button
                  onClick={() => onConfirmAppointment(app.id)}
                  className="flex-1 !py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 group/btn !px-2 text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1 shrink-0" strokeWidth={2.5} />
                  {t('citasTab.confirmBtn')}
                </Button>
                
                {onRejectAppointment && (
                  <Button
                    onClick={() => onRejectAppointment(app.id)}
                    variant="danger"
                    glow={false}
                    className="!py-3 border border-red-500/20 hover:border-red-500/40 flex items-center justify-center font-bold text-xs !px-3 shrink-0"
                    title={t('citasTab.rejectTitle')}
                  >
                    {t('citasTab.rejectBtn')}
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-neutral-500 text-xs uppercase tracking-widest font-bold">
            {t('citasTab.noPendingAppointments')}
          </div>
        )}
      </div>
    </div>
  );
};

