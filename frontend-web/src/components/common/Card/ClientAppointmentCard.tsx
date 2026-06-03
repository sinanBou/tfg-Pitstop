import React, { useState } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { getBrandLogo } from '@/assets/BrandLogos';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { Calendar, CheckCircle, X } from '@/assets/icons';

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
  const isCancellable = !['IN_PROGRESS', 'DELAYED', 'COMPLETED', 'CANCELLED'].includes(appointment.status);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  return (
    <Card 
      variant="neutral" 
      padding="md" 
      rounded="2xl" 
      className="hover:-translate-y-1 hover:border-blue-500/40"
    >
      {/* Icono de Fondo */}
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500 pointer-events-none">
        <Calendar className="w-32 h-32 text-blue-500" strokeWidth={0.5} />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Cabecera: Servicio, Fecha y Badge de Estado */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h5 className="text-xl text-blue-400 font-bold uppercase tracking-wider mb-3 leading-tight w-full pr-4" style={{ wordBreak: 'break-word' }}>
              {appointment.serviceType}
            </h5>
            <h4 className="text-2xl font-black text-white tracking-widest mb-1">
              {formatDateToDDMMAA(appointment.date)}
            </h4>
            <p className="text-neutral-400 font-mono text-sm">{appointment.time}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest ${
            appointment.status === 'COMPLETED'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : appointment.status === 'IN_PROGRESS'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : appointment.status === 'CONFIRMED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : appointment.status === 'DELAYED'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
          }`}>
            {appointment.status === 'COMPLETED' ? '✓ Listo'
              : appointment.status === 'IN_PROGRESS' ? 'En Proceso'
              : appointment.status === 'CONFIRMED' ? 'Confirmada'
              : appointment.status === 'DELAYED' ? 'Retrasada'
              : appointment.status === 'CANCELLED' ? 'Cancelada'
              : 'Pendiente'}
          </span>
        </div>

        {/* Banner de Vehículo Listo */}
        {appointment.status === 'COMPLETED' && (
          <div className="flex items-center gap-3 px-5 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl mb-4 animate-pulse">
            <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
            <div>
              <p className="text-green-400 text-xs font-black uppercase tracking-widest">Vehículo Listo</p>
              <p className="text-green-300/70 text-[11px] mt-0.5 font-bold">Tu coche está preparado. Ya puedes pasar a recogerlo.</p>
            </div>
          </div>
        )}

        {/* Ficha técnica del Vehículo y Taller */}
        <div className="space-y-3 mb-8 mt-auto bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Vehículo</span>
            <span className="text-white font-mono flex items-center gap-1.5">
              <span className="shrink-0 flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4 [&_div]:w-4 [&_div]:h-4 [&_div]:text-[8px]">
                {getBrandLogo((appointment.vehicleDisplay || appointment.vehiclePlate || '').split(' ')[0])}
              </span>
              <span>{appointment.vehicleDisplay || appointment.vehiclePlate}</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Taller</span>
            <span className="text-white font-mono">{appointment.workshopName}</span>
          </div>
        </div>

        {/* Botón de Acción Principal (Cancelar o Estado Estático) */}
        {isCancellable ? (
          <Button
            onClick={() => setConfirmCancelOpen(true)}
            variant="danger"
            glow={false}
            className="w-full !py-4 shadow-sm mt-auto"
          >
            Cancelar Cita
            <X className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </Button>
        ) : (
          <div className={`w-full py-4 border rounded-xl text-[10px] font-black uppercase tracking-widest text-center mt-auto cursor-not-allowed ${
            appointment.status === 'COMPLETED'
              ? 'bg-green-500/5 border-green-500/20 text-green-400'
              : 'bg-neutral-900/20 border-neutral-800/50 text-neutral-600'
          }`}>
            {appointment.status === 'COMPLETED' ? '✓ Vehículo Listo para Recoger' : appointment.status === 'CANCELLED' ? 'Cita Cancelada' : 'Cita en Proceso'}
          </div>
        )}
      </div>

      {confirmCancelOpen && (
        <ConfirmCardModal
          isOpen={confirmCancelOpen}
          onClose={() => setConfirmCancelOpen(false)}
          onConfirm={() => {
            setConfirmCancelOpen(false);
            deleteAppointment(appointment.id);
          }}
          title="Cancelar Cita"
          description="¿Deseas cancelar esta cita de forma permanente?"
          confirmText="Sí, Cancelar"
          theme="red"
        />
      )}
    </Card>
  );
};
