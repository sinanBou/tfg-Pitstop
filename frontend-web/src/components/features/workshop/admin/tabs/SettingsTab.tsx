import React from 'react';

interface SettingsTabProps {
  settingsForm: any;
  setSettingsForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  diasSemana: Array<{value: string, label: string}>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settingsForm, setSettingsForm, onSubmit, diasSemana }) => {
  return (
    <div className="bg-neutral-900/40 border border-neutral-800 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group animate-fade-in-up">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] -z-10 group-hover:bg-red-600/10 transition-all duration-700 pointer-events-none"></div>

      <header className="mb-12 relative z-10 border-b border-white/5 pb-8">
        <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Configuración de Operativa
        </p>
        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">
          Ajustes del Taller
        </h3>
      </header>
      
      <form onSubmit={onSubmit} className="relative z-10 space-y-10">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Apertura</label>
              <input type="time" value={settingsForm.openTime} onChange={e => setSettingsForm({...settingsForm, openTime: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Cierre</label>
              <input type="time" value={settingsForm.closeTime} onChange={e => setSettingsForm({...settingsForm, closeTime: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Duración Cita (Min)</label>
              <input type="number" value={settingsForm.slotDurationMinutes} onChange={e => setSettingsForm({...settingsForm, slotDurationMinutes: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Precio Mano de Obra (€/h)</label>
              <input type="number" step="0.01" value={settingsForm.hourlyRate} onChange={e => setSettingsForm({...settingsForm, hourlyRate: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
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
                      ? settingsForm.workingDays.filter((d:any) => d !== dia.value)
                      : [...settingsForm.workingDays, dia.value];
                    setSettingsForm({ ...settingsForm, workingDays });
                  }}
                  className={`px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${settingsForm.workingDays.includes(dia.value) ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.25)]' : 'bg-black/40 border-white/5 hover:border-white/10 text-neutral-500 hover:text-white'}`}
                >
                  {dia.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button type="submit" className="w-full md:w-auto px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3 group active:scale-[0.98]">
            Guardar Cambios
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};
