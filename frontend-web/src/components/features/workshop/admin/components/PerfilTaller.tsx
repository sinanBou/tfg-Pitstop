import React from 'react';
import { createPortal } from 'react-dom';

interface PerfilTallerProps {
  isOpen: boolean;
  onClose: () => void;
  settingsForm: {
    openTime: string;
    closeTime: string;
    slotDurationMinutes: string | number;
    hourlyRate: string | number;
    workingDays: string[];
    includeOwnerInPlanning: boolean;
  };
  setSettingsForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const diasSemana = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' }
];

/**
 * Modal de configuración del taller reutilizable.
 * Se renderiza mediante portal para garantizar z-index correcto.
 */
export const PerfilTaller: React.FC<PerfilTallerProps> = ({
  isOpen,
  onClose,
  settingsForm,
  setSettingsForm,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-[3rem] relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

        {/* Botón cerrar — fuera del scroll container */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-black/40 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded-2xl transition-all z-50 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenido con scroll */}
        <div className="p-10 overflow-y-auto flex-1">
          <header className="mb-10 relative z-10 border-b border-white/5 pb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Operativa del Negocio
            </p>
            <h3 className="text-3xl font-black uppercase tracking-widest text-white">
              Perfil del Taller
            </h3>
          </header>

          <form onSubmit={onSubmit} className="relative z-10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Apertura</label>
                <input
                  type="time"
                  value={settingsForm.openTime}
                  onChange={e => setSettingsForm({ ...settingsForm, openTime: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                  className="bg-black/40 border border-neutral-800 text-white p-4 rounded-xl focus:outline-none focus:border-red-500 font-mono text-sm font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Cierre</label>
                <input
                  type="time"
                  value={settingsForm.closeTime}
                  onChange={e => setSettingsForm({ ...settingsForm, closeTime: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                  className="bg-black/40 border border-neutral-800 text-white p-4 rounded-xl focus:outline-none focus:border-red-500 font-mono text-sm font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Duración Cita (Min)</label>
                <input
                  type="number"
                  value={settingsForm.slotDurationMinutes}
                  onChange={e => setSettingsForm({ ...settingsForm, slotDurationMinutes: e.target.value })}
                  className="bg-black/40 border border-neutral-800 text-white p-4 rounded-xl focus:outline-none focus:border-red-500 text-sm font-bold font-mono"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Precio Mano de Obra (€/h)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.hourlyRate}
                  onChange={e => setSettingsForm({ ...settingsForm, hourlyRate: e.target.value })}
                  className="bg-black/40 border border-neutral-800 text-white p-4 rounded-xl focus:outline-none focus:border-red-500 text-sm font-bold font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Días Laborables</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <button
                    type="button"
                    key={dia.value}
                    onClick={() => {
                      const workingDays = settingsForm.workingDays.includes(dia.value)
                        ? settingsForm.workingDays.filter((d: any) => d !== dia.value)
                        : [...settingsForm.workingDays, dia.value];
                      setSettingsForm({ ...settingsForm, workingDays });
                    }}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      settingsForm.workingDays.includes(dia.value)
                        ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.25)]'
                        : 'bg-black/40 border-white/5 hover:border-white/10 text-neutral-500 hover:text-white'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-black/40 border border-neutral-800 rounded-3xl gap-4">
              <div className="space-y-1 text-left">
                <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  Añadir Dueño a la Planificación
                </h4>
                <p className="text-neutral-500 text-[10px] font-medium leading-relaxed">
                  Si se activa esta opción, el propietario del taller se incorporará a la agenda de planificación general y se le podrán asignar citas y tareas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsForm({ ...settingsForm, includeOwnerInPlanning: !settingsForm.includeOwnerInPlanning })}
                className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                  settingsForm.includeOwnerInPlanning ? "bg-red-600" : "bg-neutral-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                    settingsForm.includeOwnerInPlanning ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
              >
                Guardar Ajustes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
