import React, { useState, useEffect } from 'react';

interface MechanicLiveTaskProps {
  appointment: any;
  onUpdateStatus: (id: string, status: string) => Promise<boolean>;
  onViewChecklist?: (item: any) => void;
}

export const MechanicLiveTask: React.FC<MechanicLiveTaskProps> = ({ appointment, onUpdateStatus, onViewChecklist }) => {
  const isVehicleReceived = appointment.vehicleReceived === true;
  const [isUpdating, setIsUpdating] = useState(false);
  const [elapsed, setElapsed] = useState<string>('00:00');

  // Cálculo de tiempo transcurrido si está en progreso
  useEffect(() => {
    let interval: any;
    if (appointment.status === 'IN_PROGRESS' && appointment.actualStartTime) {
      const startTime = new Date(appointment.actualStartTime).getTime();
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = now - startTime;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [appointment.status, appointment.actualStartTime]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
      case 'CONFIRMED': return { label: 'Confirmada', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
      case 'IN_PROGRESS': return { label: 'En Curso', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
      case 'DELAYED': return { label: 'Retrasada', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
      case 'COMPLETED': return { label: 'Finalizada', color: 'text-neutral-400', bg: 'bg-neutral-400/10', border: 'border-neutral-400/20' };
      default: return { label: status, color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' };
    }
  };

  const config = getStatusConfig(appointment.status);

  const handleAction = async () => {
    setIsUpdating(true);
    let nextStatus = '';
    if (appointment.status === 'PENDING') nextStatus = 'CONFIRMED';
    else if (appointment.status === 'CONFIRMED') nextStatus = 'IN_PROGRESS';
    else if (appointment.status === 'IN_PROGRESS') nextStatus = 'COMPLETED';

    if (nextStatus) {
      await onUpdateStatus(appointment.id, nextStatus);
    }
    setIsUpdating(false);
  };

  const markAsDelayed = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    await onUpdateStatus(appointment.id, 'DELAYED');
    setIsUpdating(false);
  };

  return (
    <div className={`p-6 bg-neutral-900/40 border ${config.border} rounded-[2rem] backdrop-blur-md transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] group relative overflow-hidden`}>
      <div className="space-y-6">
        {/* Info Coche */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-lg leading-tight tracking-tight">
              {appointment.vehicleDisplay}
            </h4>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-red-600 font-bold text-sm font-mono whitespace-nowrap">
                {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} h
              </span>
              <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
                | {new Date(appointment.dateTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')} | {appointment.clientFullName}
              </span>
            </div>
          </div>
        </div>

        {/* Detalles del Servicio */}
        {!isVehicleReceived && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <div>
              <p className="text-amber-400 font-black text-[10px] uppercase tracking-widest">Pendiente de Recepción</p>
              <p className="text-amber-500/60 text-[10px] mt-0.5">Recepciona el vehículo desde la pestaña de Citas para poder gestionar.</p>
            </div>
          </div>
        )}
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
          <p className="text-red-500 font-black text-[10px] uppercase tracking-tighter mb-1">Servicio</p>
          <p className="text-white font-bold text-sm mb-2">{appointment.serviceType}</p>
          <p className="text-neutral-400 text-xs line-clamp-2">{appointment.description}</p>
        </div>

        {/* Control de Tiempo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[9px] text-neutral-500 uppercase font-black block mb-1">Estimado</span>
            <span className="text-white font-mono text-sm">{appointment.estimatedDuration || '--'} min</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[9px] text-neutral-500 uppercase font-black block mb-1">Transcurrido</span>
            <span className={`font-mono text-sm ${appointment.status === 'IN_PROGRESS' ? 'text-green-400 animate-pulse' : 'text-neutral-600'}`}>
              {appointment.status === 'IN_PROGRESS' ? elapsed : '--:--'}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2">
          {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
            <button
              onClick={handleAction}
              disabled={isUpdating || !isVehicleReceived}
              className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                !isVehicleReceived ? 'bg-amber-950/30 text-amber-500/40 border border-amber-500/10 cursor-not-allowed' :
                isUpdating ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 
                'bg-white text-black hover:bg-red-600 hover:text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]'
              }`}
              title={!isVehicleReceived ? 'Recepciona el vehículo primero' : undefined}
            >
              {!isVehicleReceived ? 'Recepción Pendiente' :
               isUpdating ? 'Procesando...' : 
               appointment.status === 'PENDING' ? 'Confirmar' :
               appointment.status === 'CONFIRMED' ? 'Iniciar Trabajo' :
               appointment.status === 'DELAYED' ? 'Reanudar' :
               'Finalizar'}
            </button>
          )}

          {/* Botón Gestionar: abre el checklist de tareas y piezas (requiere recepción) */}
          {onViewChecklist && (appointment.status === 'IN_PROGRESS' || appointment.status === 'CONFIRMED') && (
            <button
              onClick={() => isVehicleReceived && onViewChecklist(appointment)}
              disabled={!isVehicleReceived}
              className={`px-4 py-4 rounded-2xl border transition-all ${
                isVehicleReceived 
                  ? 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-600/20 hover:border-blue-500'
                  : 'bg-amber-950/20 text-amber-500/40 border-amber-500/10 cursor-not-allowed'
              }`}
              title={isVehicleReceived ? 'Gestionar Tareas y Piezas' : 'Recepciona el vehículo primero'}
            >
              {isVehicleReceived ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              )}
            </button>
          )}

          {appointment.status === 'IN_PROGRESS' && (
            <button
              onClick={markAsDelayed}
              disabled={isUpdating}
              className="px-4 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl border border-red-600/20 transition-all group-hover:border-red-600"
              title="Informar Retraso"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
