import React from 'react';
import type { WorkshopMinDTO } from '@/features/client';
import { ChevronLeft, ChevronRight, Calendar, Info } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface ScheduleStepProps {
  viewDate: Date;
  setViewDate: (date: Date) => void;
  selectedWorkshopId: string;
  workshops: WorkshopMinDTO[];
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  availableSlots: string[];
  isLoadingSlots: boolean;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  viewDate,
  setViewDate,
  selectedWorkshopId,
  workshops,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  availableSlots,
  isLoadingSlots
}) => {
  const { t, language } = useTranslation();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  // Nombres de meses y días
  const monthNames = language === 'en'
    ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    : ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const daysOfWeek = language === 'en'
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["L", "M", "X", "J", "V", "S", "D"];

  // Calcular días del mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sab)
  
  // Ajustar para que Lunes sea 0
  const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedWorkshop = workshops.find(w => w.id === selectedWorkshopId);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
      <div className="space-y-6 flex-1">
        
        <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
                   {/* CALENDARIO PERSONALIZADO (Izquierda) */}
          <div className="bg-slate-100 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 p-4 rounded-3xl w-full md:w-[450px] shrink-0">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                {monthNames[month]} <span className="text-blue-600">{year}</span>
              </h3>
              <div className="flex gap-1">
                <button type="button" onClick={prevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-xl transition-colors text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={nextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-xl transition-colors text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {daysOfWeek.map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-500 dark:text-neutral-500 py-2">{d}</div>
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
                const isSelected = selectedDate === dateStr;
                const isPast = dateObj < today;
                
                // Verificar si el taller abre este día
                const dayName = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"][dateObj.getDay()];
                const isClosedManual = selectedWorkshop?.workingDays && !selectedWorkshop.workingDays.includes(dayName);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => onSelectDate(dateStr)}
                    className={`
                      aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative group cursor-pointer
                      ${isPast ? 'text-slate-400 dark:text-neutral-700 cursor-not-allowed' : 
                        isSelected ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 
                        isClosedManual ? 'bg-slate-200/40 dark:bg-neutral-900/30 text-slate-400 dark:text-neutral-600 hover:bg-slate-200 dark:hover:bg-neutral-800' : 
                        'bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-300 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-white'}
                    `}
                  >
                    {day}
                    {isClosedManual && !isPast && !isSelected && (
                      <div className="absolute bottom-1 w-1 h-1 bg-blue-500/40 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* HORAS DISPONIBLES (Derecha) */}
          <div className="flex-1 w-full min-h-[250px] bg-slate-100/70 dark:bg-neutral-900/30 border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6">
            {!selectedDate ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Calendar className="w-12 h-12 text-slate-400 dark:text-neutral-600 mb-3" strokeWidth={1.5} />
                <p className="text-slate-500 dark:text-neutral-500 text-xs font-black uppercase tracking-widest leading-relaxed">
                  {t('appointmentModal.selectDayPrompt')}
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                {isLoadingSlots ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 opacity-70">
                     <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                     <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">{t('appointmentModal.syncingSchedule')}</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-neutral-500 block mb-4 ml-1">
                      {t('appointmentModal.slotsForDate', { date: selectedDate.split('-').reverse().join('/') })}
                    </label>
                    <div className="grid grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                      {availableSlots.length > 0 ? (
                        availableSlots.map(hora => (
                          <button
                            key={hora}
                            type="button"
                            onClick={() => onSelectTime(hora)}
                            className={`p-3 rounded-xl text-sm font-mono font-bold transition-all relative overflow-hidden group cursor-pointer ${
                              selectedTime === hora 
                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-500' 
                                : 'bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-400 hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-blue-600 dark:hover:text-white'
                            }`}
                          >
                            {selectedTime !== hora && <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors"></div>}
                            <span className="relative z-10">{hora}</span>
                          </button>
                        ))
                      ) : (
                        (() => {
                          let isClosed = false;
                          if (selectedDate && selectedWorkshopId) {
                            const selectedWorkshop = workshops.find(w => w.id === selectedWorkshopId);
                            if (selectedWorkshop && selectedWorkshop.workingDays) {
                              const [year, month, day] = selectedDate.split('-').map(Number);
                              const dateObj = new Date(year, month - 1, day);
                              const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
                              const dayName = dias[dateObj.getDay()];
                              if (!selectedWorkshop.workingDays.includes(dayName)) {
                                isClosed = true;
                              }
                            }
                          }

                          return isClosed ? (
                            <div className="col-span-3 py-12 text-center border border-dashed border-blue-900/50 bg-blue-900/10 rounded-2xl flex flex-col items-center justify-center gap-2">
                              <Info className="w-8 h-8 text-blue-500/70" strokeWidth={1.5} />
                              <p className="text-blue-400/80 text-[10px] font-black uppercase tracking-widest">{t('appointmentModal.workshopClosed')}</p>
                            </div>
                          ) : (
                            <div className="col-span-3 py-12 text-center border border-dashed border-slate-200 dark:border-neutral-800 bg-slate-100/50 dark:bg-neutral-900/30 rounded-2xl flex flex-col items-center justify-center gap-2">
                              <Info className="w-8 h-8 text-slate-400 dark:text-neutral-600" strokeWidth={1.5} />
                              <p className="text-slate-600 dark:text-neutral-400 text-[10px] font-black uppercase tracking-widest">{t('appointmentModal.noSlotsAvailable')}</p>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
