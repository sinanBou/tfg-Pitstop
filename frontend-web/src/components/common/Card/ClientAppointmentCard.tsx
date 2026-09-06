import React, { useState } from 'react';
import { Card } from '@/components/common/Card/Card';
import { getBrandLogo } from '@/assets/BrandLogos';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { Calendar, Clock, CheckCircle, X, Check, MapPin } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface ClientAppointmentCardProps {
  appointment: any;
  deleteAppointment: (id: string) => void;
}

const formatDateToDDMMAA = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0].slice(-2)}`;
  }
  return dateString;
};

export const ClientAppointmentCard: React.FC<ClientAppointmentCardProps> = ({
  appointment,
  deleteAppointment,
}) => {
  const { t } = useTranslation();
  const isCancellable = !['IN_PROGRESS', 'DELAYED', 'COMPLETED', 'CANCELLED', 'PICKED_UP'].includes(appointment.status);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Determinar etapa actual en el ciclo de vida de la cita (1 al 4)
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'IN_PROGRESS':
      case 'DELAYED': return 3;
      case 'COMPLETED':
      case 'PICKED_UP': return 4;
      default: return 1;
    }
  };

  const currentStep = getStepIndex(appointment.status);
  const isCancelled = appointment.status === 'CANCELLED';

  // Configuración de borde izquierdo según estado
  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'border-l-4 border-l-green-500';
      case 'IN_PROGRESS': return 'border-l-4 border-l-blue-500';
      case 'CONFIRMED': return 'border-l-4 border-l-emerald-500';
      case 'DELAYED': return 'border-l-4 border-l-red-500';
      case 'CANCELLED': return 'border-l-4 border-l-slate-400';
      default: return 'border-l-4 border-l-amber-500';
    }
  };

  const steps = [
    { num: 1, label: 'Solicitada' },
    { num: 2, label: 'Confirmada' },
    { num: 3, label: 'En Taller' },
    { num: 4, label: 'Listo' },
  ];

  return (
    <Card 
      variant="neutral" 
      padding="none" 
      rounded="2xl" 
      className={`p-6 relative group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-500/40 flex flex-col justify-between ${getStatusBorder(appointment.status)}`}
    >
      {/* Icono de Fondo */}
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
        <Calendar className="w-32 h-32 text-blue-500" strokeWidth={0.5} />
      </div>

      <div className="relative z-10 flex flex-col h-full gap-5">
        {/* Cabecera: Vehículo + Estado */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 [&_svg]:w-6 [&_svg]:h-6 [&_div]:w-6 [&_div]:h-6 [&_div]:text-[10px]">
              {getBrandLogo((appointment.vehicleDisplay || appointment.vehiclePlate || '').split(' ')[0])}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white leading-tight">
                {appointment.vehicleDisplay || appointment.vehiclePlate || t('common.vehicle')}
              </h4>
              {appointment.vehiclePlate && (
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-neutral-400">
                  {appointment.vehiclePlate}
                </span>
              )}
            </div>
          </div>

          {/* Badge de Estado con alto contraste */}
          <span className={`shrink-0 text-[9px] font-black px-3 py-1 rounded-xl uppercase tracking-wider ${
            appointment.status === 'COMPLETED'
              ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
              : appointment.status === 'IN_PROGRESS'
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                : appointment.status === 'CONFIRMED'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : appointment.status === 'DELAYED'
                    ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                    : appointment.status === 'CANCELLED'
                      ? 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border border-slate-300 dark:border-neutral-700'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
          }`}>
            {appointment.status === 'COMPLETED' ? `✓ ${t('status.readyForPickup')}`
              : appointment.status === 'IN_PROGRESS' ? t('status.inProgress')
              : appointment.status === 'CONFIRMED' ? t('status.confirmed')
              : appointment.status === 'DELAYED' ? t('status.delayed')
              : appointment.status === 'CANCELLED' ? t('status.cancelled')
              : t('status.pending')}
          </span>
        </div>

        {/* Servicio y Fecha */}
        <div className="bg-slate-50/80 dark:bg-neutral-950/50 p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
              {appointment.serviceType || 'Servicio de Mantenimiento'}
            </h5>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-mono font-bold shrink-0">
              {appointment.estimatedDuration ? `${appointment.estimatedDuration}m` : '60m'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
              <span>{formatDateToDDMMAA(appointment.date)}</span>
            </div>
            {appointment.time && (
              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                <span>{appointment.time}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
              <span className="truncate">{appointment.workshopName}</span>
            </div>
          </div>
        </div>

        {/* ── STEPPER VISUAL DE CICLO DE VIDA DE LA CITA ── */}
        {!isCancelled ? (
          <div className="py-2">
            <div className="relative flex items-center justify-between">
              {/* Línea conectora base */}
              <div className="absolute left-3 right-3 top-3 h-0.5 bg-slate-200 dark:bg-neutral-800 -z-0" />
              
              {/* Línea conectora activa */}
              <div 
                className="absolute left-3 top-3 h-0.5 bg-blue-600 -z-0 transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, ((currentStep - 1) / 3) * 100))}%` }}
              />

              {steps.map((step) => {
                const isDone = currentStep > step.num;
                const isCurrent = currentStep === step.num;

                return (
                  <div key={step.num} className="flex flex-col items-center z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      isDone
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isCurrent
                          ? currentStep === 4
                            ? 'bg-green-600 text-white shadow-md shadow-green-600/30 ring-4 ring-green-500/20'
                            : 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-4 ring-blue-500/20 animate-pulse'
                          : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-500'
                    }`}>
                      {isDone || (isCurrent && currentStep === 4) ? (
                        <Check className="w-3 h-3" strokeWidth={3} />
                      ) : (
                        <span>{step.num}</span>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider mt-1.5 ${
                      isCurrent
                        ? currentStep === 4
                          ? 'text-green-700 dark:text-green-400 font-black'
                          : 'text-blue-600 dark:text-blue-400 font-black'
                        : isDone
                          ? 'text-slate-800 dark:text-neutral-300'
                          : 'text-slate-400 dark:text-neutral-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-2 text-center bg-slate-100 dark:bg-neutral-900/40 rounded-xl border border-slate-200 dark:border-neutral-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {t('appointmentCard.cancelledStatus')}
            </span>
          </div>
        )}

        {/* Banner de Vehículo Listo */}
        {appointment.status === 'COMPLETED' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl animate-pulse">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <div>
              <p className="text-green-700 dark:text-green-400 text-xs font-black uppercase tracking-wider">
                {t('appointmentCard.readyBannerTitle')}
              </p>
              <p className="text-green-700/80 dark:text-green-300/80 text-[10px] font-medium">
                {t('appointmentCard.readyBannerDesc')}
              </p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="pt-2 mt-auto flex items-center justify-end gap-3">
          {isCancellable && (
            <button
              onClick={() => setConfirmCancelOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('appointmentCard.cancelBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {confirmCancelOpen && (
        <ConfirmCardModal
          isOpen={confirmCancelOpen}
          onClose={() => setConfirmCancelOpen(false)}
          onConfirm={() => {
            setConfirmCancelOpen(false);
            deleteAppointment(appointment.id);
          }}
          title={t('appointmentCard.cancelTitle')}
          description={t('appointmentCard.cancelDesc')}
          confirmText={t('common.confirm')}
          cancelText={t('common.cancel')}
          theme="red"
        />
      )}
    </Card>
  );
};

