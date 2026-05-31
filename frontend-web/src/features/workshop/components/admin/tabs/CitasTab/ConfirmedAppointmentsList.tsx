import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getBrandLogo } from '@/assets/BrandLogos';
import { Card } from '@/components/common/Card/Card';
import { InputField } from '@/components/common/InputField/InputField';
import { Button } from '@/components/common/Button/Button';
import { useToast } from '@/hooks/useToast';

interface ConfirmedAppointmentsListProps {
  appointments: any[];
  onDeleteAppointment: (id: string) => Promise<boolean | void>;
  onCheckInAppointment?: (id: string, kilometers: number, notes: string) => Promise<boolean>;
  onUpdateStatus?: (id: string, status: string) => Promise<boolean | void>;
}

export const ConfirmedAppointmentsList = ({ 
  appointments, 
  onDeleteAppointment,
  onCheckInAppointment,
  onUpdateStatus
}: ConfirmedAppointmentsListProps) => {
  const [confirmedSearch, setConfirmedSearch] = useState('');
  const toast = useToast();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [kilometers, setKilometers] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // All confirmed, in progress or delayed appointments with optional search
  const confirmedAppointments = useMemo(() => {
    const confirmed = appointments.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS' || a.status === 'DELAYED');
    if (!confirmedSearch.trim()) return confirmed;
    
    const search = confirmedSearch.toLowerCase();
    return confirmed.filter((a: any) => 
      (a.vehicleDisplay && a.vehicleDisplay.toLowerCase().includes(search)) ||
      (a.serviceType && a.serviceType.toLowerCase().includes(search)) ||
      (a.description && a.description.toLowerCase().includes(search))
    );
  }, [appointments, confirmedSearch]);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Deseas cancelar esta cita y todas las tareas relacionadas de forma permanente?")) {
      try {
        await onDeleteAppointment(id);
      } catch (err) {
        console.error("Error al cancelar la cita:", err);
        toast.error("No se pudo cancelar la cita. Puede que esté en un estado que no permite la cancelación.");
      }
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !onCheckInAppointment) return;

    const kmNum = parseInt(kilometers, 10);
    if (isNaN(kmNum) || kmNum < 0) {
      toast.warning("Por favor, introduce un número de kilómetros válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onCheckInAppointment(selectedAppId, kmNum, notes);
      if (success) {
        setIsModalOpen(false);
        setSelectedAppId(null);
        setKilometers('');
        setNotes('');
      } else {
        toast.error("Ocurrió un error al procesar la recepción.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAppointmentDetails = useMemo(() => {
    return appointments.find(a => a.id === selectedAppId);
  }, [appointments, selectedAppId]);

  if (confirmedAppointments.length === 0 && !confirmedSearch.trim()) {
    return null; // Ocultar si no hay citas y no se está buscando
  }

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
          Citas Confirmadas
          <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full text-[10px]">{confirmedAppointments.length}</span>
        </h3>
        
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Buscar por vehículo, servicio..."
            value={confirmedSearch}
            onChange={(e) => setConfirmedSearch(e.target.value)}
            className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <svg className="w-4 h-4 text-neutral-600 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {confirmedAppointments.map((app: any) => (
          <Card 
            key={app.id} 
            variant="neutral" 
            border={false}
            padding="none" 
            rounded="2xl"
            className="bg-emerald-500/5 p-5 border border-emerald-500/20 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40"
          >
            <div>
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{app.serviceType}</div>
                <div className="flex items-center gap-1.5">
                  {app.status === 'IN_PROGRESS' && (
                    <span className="bg-blue-500/10 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-blue-500/20">En Curso</span>
                  )}
                  {app.status === 'DELAYED' && (
                    <span className="bg-amber-500/10 text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-500/20 animate-pulse">Retrasada</span>
                  )}
                  {app.vehicleReceived && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">En Taller</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1.5 mb-1">
                <div className="w-6 h-6 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-emerald-500 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all [&_svg]:w-4 [&_svg]:h-4 [&_div]:w-4 [&_div]:h-4 [&_div]:text-[8px] flex-shrink-0">
                  {getBrandLogo(app.vehicleDisplay ? app.vehicleDisplay.split(' ')[0] : '')}
                </div>
                <div className="text-lg font-black text-white leading-none">{app.vehicleDisplay}</div>
              </div>
              {app.clientFullName && (
                <div className="text-neutral-400 text-xs font-bold mt-0.5">Cliente: <span className="text-neutral-200">{app.clientFullName}</span></div>
              )}
              <div className="text-neutral-400 text-xs font-mono mt-2 mb-2">
                {new Date(app.dateTime).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}{' '}
                {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}{' '}
                h
              </div>

              {/* Información de Recepción */}
              {app.vehicleReceived ? (
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Vehículo Recibido
                  </div>
                  {app.receptionKilometers !== null && (
                    <div className="text-[11px] font-bold text-neutral-300">
                      Kilómetros: <span className="font-mono text-white bg-black/30 px-1.5 py-0.5 rounded">{app.receptionKilometers.toLocaleString()} Km</span>
                    </div>
                  )}
                  {app.receptionNotes && (
                    <div className="text-[11px] text-neutral-400 font-medium leading-relaxed italic border-t border-emerald-500/10 pt-1.5 mt-1.5">
                      "{app.receptionNotes}"
                    </div>
                  )}
                </div>
              ) : (
                onCheckInAppointment && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setKilometers('');
                      setNotes('');
                      setIsModalOpen(true);
                    }}
                    className="w-full !px-4 !py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 flex items-center justify-center gap-1.5 mt-4 animate-pulse-subtle"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Recepcionar Vehículo
                  </Button>
                )
              )}
            </div>
            
            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity w-full">
              {onUpdateStatus && app.status !== 'DELAYED' && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    if (window.confirm("¿Seguro que deseas marcar esta cita como retrasada?")) {
                      await onUpdateStatus(app.id, 'DELAYED');
                    }
                  }}
                  className="flex-1 !px-3 !py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 flex items-center justify-center gap-1 font-bold text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Retrasar
                </Button>
              )}
              <Button 
                variant="danger"
                onClick={() => handleDelete(app.id)}
                className="flex-1 !px-3 !py-2"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        ))}
        {confirmedAppointments.length === 0 && confirmedSearch.trim() && (
          <div className="col-span-full py-8 text-center text-neutral-500 text-xs uppercase tracking-widest font-bold">
            No se encontraron citas confirmadas para "{confirmedSearch}".
          </div>
        )}
      </div>

      {/* Glassmorphism Reception Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card 
            variant="neutral" 
            rounded="2xl" 
            padding="lg"
            className="max-w-md w-full shadow-2xl relative animate-scale-in border-neutral-800"
          >
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 112-2h2a2 2 0 012 2" /></svg>
              Recepcionar Vehículo
            </h2>
            {selectedAppointmentDetails && (
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-6">
                Coche: <span className="text-white">{selectedAppointmentDetails.vehicleDisplay}</span>
              </p>
            )}

            <form onSubmit={handleCheckInSubmit} className="space-y-5">
              <div className="relative">
                <InputField
                  label="Kilómetros actuales"
                  type="number"
                  required
                  value={kilometers}
                  onChange={(e) => setKilometers(e.target.value)}
                  placeholder="Ej: 142000"
                  focusVariant="emerald"
                />
                <span className="absolute right-4 bottom-3.5 text-xs font-black uppercase text-neutral-600">Km</span>
              </div>

              <InputField
                label="Notas de recepción (Estado, desperfectos...)"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Desperfecto leve en el parachoques delantero izquierdo. Viene con rueda de repuesto puesta..."
                focusVariant="emerald"
              />

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedAppId(null);
                  }}
                  className="w-1/2 !py-3"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 !py-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    'Confirmar'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>,
        document.body
      )}
    </div>
  );
};
