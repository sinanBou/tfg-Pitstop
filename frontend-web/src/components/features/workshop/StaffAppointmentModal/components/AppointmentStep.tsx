import React from 'react';
import { type VehicleSearchDTO } from '../../../../../types/client';

interface AppointmentStepProps {
  selectedVehicle: VehicleSearchDTO | null;
  appointmentForm: { 
    date: string, 
    time: string, 
    serviceType: string, 
    description: string,
    estimatedDuration: number,
    assignedEmployeeId: string
  };
  setAppointmentForm: (f: any) => void;
  availableSlots: string[];
  viewDate: Date;
  setViewDate: (d: Date) => void;
  workshopSettings: any;
  employees: any[];
  onPrev: () => void;
  onFinish: () => void;
  loading: boolean;
  onFetchSlots: (date: string) => void;
}

export const AppointmentStep: React.FC<AppointmentStepProps> = ({
  selectedVehicle, appointmentForm, setAppointmentForm, availableSlots,
  viewDate, setViewDate, workshopSettings, employees, onPrev, onFinish, loading, onFetchSlots
}) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const daysOfWeek = ["L", "M", "X", "J", "V", "S", "D"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between h-full">
      {/* Resumen Vehículo */}
      <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center gap-4 shrink-0">
        <div className="shrink-0 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-black">
          {selectedVehicle?.licensePlate.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">Vehículo Confirmado</p>
          <p className="text-white font-black uppercase text-sm">{selectedVehicle?.brand} {selectedVehicle?.model} • {selectedVehicle?.licensePlate}</p>
        </div>
        <button onClick={onPrev} className="text-neutral-500 hover:text-white transition-colors">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>

      {/* Grid Lateral: Calendario Izquierda, Detalles Derecha */}
      <div className="flex flex-col md:flex-row gap-6 items-start flex-1 min-h-0">
        {/* CALENDARIO (Izquierda) */}
        <div className="w-full md:w-[420px] bg-neutral-900/50 border border-neutral-800 p-5 rounded-3xl shrink-0">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-white italic">
              {monthNames[month]} <span className="text-red-600">{year}</span>
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white border border-transparent hover:border-neutral-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white border border-transparent hover:border-neutral-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {daysOfWeek.map(d => (
              <div key={d} className="text-center text-[9px] font-black text-neutral-500 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(year, month, day);
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = appointmentForm.date === dateStr;
              const isPast = dateObj < today;

              const diasNames = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
              const dayName = diasNames[dateObj.getDay()];
              
              let isClosed = false;
              if (workshopSettings?.workingDays) {
                 const workingDaysArr = workshopSettings.workingDays === 'LUNES-VIERNES' 
                     ? ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
                     : workshopSettings.workingDays.split(',').map((d:string) => d.trim());
                 
                 if (!workingDaysArr.includes(dayName)) {
                    isClosed = true;
                 }
              }

              return (
                <button
                  key={day}
                  disabled={isPast || isClosed}
                  onClick={() => {
                    setAppointmentForm({...appointmentForm, date: dateStr, time: ''});
                    onFetchSlots(dateStr);
                  }}
                  className={`
                    aspect-square rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative group
                    ${(isPast || isClosed) ? 'text-neutral-700 opacity-20 cursor-not-allowed' : 
                      isSelected ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 
                      'bg-neutral-800/40 border border-neutral-800 text-neutral-400 hover:border-red-500/50 hover:text-white'}
                  `}
                >
                  {day}
                  {isClosed && !isPast && (
                     <span className="absolute bottom-0.5 w-1 h-1 bg-red-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DETALLES DE CITA (Derecha) */}
        <div className="flex-1 w-full space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
          {/* Duración Estimada */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 ml-1 italic">Duración Estimada</label>
            <div className="flex items-center gap-4 bg-black/40 border border-neutral-800 p-3 rounded-xl">
              <input 
                type="range" min="15" max="240" step="15"
                className="flex-1 accent-red-600"
                value={appointmentForm.estimatedDuration}
                onChange={e => setAppointmentForm({...appointmentForm, estimatedDuration: parseInt(e.target.value)})}
              />
              <span className="text-white font-mono text-xs w-14 text-right">{appointmentForm.estimatedDuration}m</span>
            </div>
          </div>

          {/* Horas Disponibles */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block ml-1 italic">Horas Disponibles</label>
            {!appointmentForm.date ? (
              <div className="text-center py-4 bg-neutral-900/10 border border-neutral-800/60 rounded-2xl flex flex-col items-center justify-center p-4">
                <svg className="w-5 h-5 text-neutral-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider">Selecciona un día en el calendario</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAppointmentForm({...appointmentForm, time: s})}
                      className={`py-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                        appointmentForm.time === s 
                          ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                          : 'bg-black/40 border-neutral-800 text-neutral-400 hover:border-red-500/50 hover:text-white'
                      }`}
                    >
                      {s}h
                    </button>
                  ))
                ) : (
                  <p className="col-span-3 text-center py-4 bg-red-600/5 border border-red-600/10 rounded-xl text-[10px] font-black uppercase text-red-500 tracking-widest italic">No hay disponibilidad para este día</p>
                )}
              </div>
            )}
          </div>

          {/* Servicio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Servicio</label>
            <input 
              placeholder="Ej: Revisión Pre-ITV" 
              className="bg-black/40 border border-neutral-800 p-3.5 rounded-xl text-white outline-none focus:border-red-600 transition-all font-bold placeholder:text-neutral-700 text-xs" 
              value={appointmentForm.serviceType} 
              onChange={e => setAppointmentForm({...appointmentForm, serviceType: e.target.value})} 
            />
          </div>

          {/* Descripción / Notas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Descripción / Notas</label>
            <textarea 
              placeholder="Detalles extra del trabajo..." 
              className="bg-black/40 border border-neutral-800 p-3.5 rounded-xl text-white outline-none focus:border-red-600 min-h-[70px] resize-none transition-all placeholder:text-neutral-700 text-xs" 
              value={appointmentForm.description} 
              onChange={e => setAppointmentForm({...appointmentForm, description: e.target.value})} 
            />
          </div>
        </div>
      </div>

      {/* Footer / Registrar Cita */}
      <div className="mt-auto pt-6 border-t border-neutral-800/50 flex justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all active:scale-95"
        >
          Atrás
        </button>
        <button 
          onClick={onFinish} 
          disabled={!appointmentForm.time || !appointmentForm.serviceType || loading} 
          className="px-6 py-3.5 rounded-xl bg-red-600 text-white font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? 'Sincronizando Agenda...' : (
            <>
              Registrar Cita Presencial
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
