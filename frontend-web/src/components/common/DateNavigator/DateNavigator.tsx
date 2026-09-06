import React, { useState, useRef, useEffect } from 'react';
import type { DateNavigatorProps } from './DateNavigator.types';
import { ChevronLeft, ChevronRight } from '@/assets/icons';

export const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onChange, variant = 'red' }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onChange(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onChange(d);
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
       document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  // Mini-calendar calculations
  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate));
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adaptado a Lunes = 0, Domingo = 6
  };

  const daysInMonth = getDaysInMonth(viewMonth.getFullYear(), viewMonth.getMonth());
  const firstDay = getFirstDayOfMonth(viewMonth.getFullYear(), viewMonth.getMonth());
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const handleSelectDay = (day: number) => {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    onChange(d);
    setShowCalendar(false);
  };

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  const primaryColor = variant === 'red' ? 'text-red-500' : 'text-blue-500';
  const hoverBorderColor = variant === 'red' ? 'hover:border-red-500/30' : 'hover:border-blue-500/30';
  const activeBgColor = variant === 'red' ? 'bg-red-500' : 'bg-blue-500';
  const hoverBgColor = variant === 'red' ? 'hover:bg-red-500/20' : 'hover:bg-blue-500/20';

  return (
    <div className="relative" ref={calendarRef}>
       <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-black/40 border border-slate-300 dark:border-neutral-800 rounded-2xl px-2 h-[54px] backdrop-blur-md shadow-sm dark:shadow-none">
          <button 
             onClick={prevDay} 
             className={`p-3 bg-white dark:bg-black/40 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all border border-slate-200 dark:border-transparent ${hoverBorderColor} ${hoverBgColor} cursor-pointer`}
             data-testid="prev-day-btn"
          >
             <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
             onClick={() => setShowCalendar(!showCalendar)} 
             className="flex flex-col items-center px-2 min-w-[100px] hover:bg-slate-200/50 dark:hover:bg-white/5 py-2 rounded-xl transition-colors cursor-pointer"
             data-testid="calendar-toggle-btn"
          >
             <span className={`${primaryColor} font-black text-[10px] uppercase tracking-widest leading-none mb-1`}>
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'short' })}
             </span>
             <span className="text-slate-900 dark:text-white font-black text-sm tracking-tighter">
                {selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')}
             </span>
          </button>

          <button 
             onClick={nextDay} 
             className={`p-3 bg-white dark:bg-black/40 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all border border-slate-200 dark:border-transparent ${hoverBorderColor} ${hoverBgColor} cursor-pointer`}
             data-testid="next-day-btn"
          >
             <ChevronRight className="w-5 h-5" />
          </button>
       </div>

       {showCalendar && (
          <div className="absolute top-[110%] left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" data-testid="prev-month-btn">
                   <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-widest">
                   {viewMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" data-testid="next-month-btn">
                   <ChevronRight className="w-4 h-4" />
                </button>
             </div>
             
             <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                   <div key={d} className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase">{d}</div>
                ))}
             </div>
             
             <div className="grid grid-cols-7 gap-1">
                {emptyDays.map(d => <div key={`empty-${d}`} className="h-8" />)}
                {daysArray.map(day => {
                   const isSelected = day === selectedDate.getDate() && viewMonth.getMonth() === selectedDate.getMonth() && viewMonth.getFullYear() === selectedDate.getFullYear();
                   const isToday = day === new Date().getDate() && viewMonth.getMonth() === new Date().getMonth() && viewMonth.getFullYear() === new Date().getFullYear();
                   
                   return (
                      <button
                         key={day}
                         onClick={() => handleSelectDay(day)}
                         className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected ? `${activeBgColor} text-white` : 
                            isToday ? 'border border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/10' : 
                            'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/10'
                         }`}
                      >
                         {day}
                      </button>
                   );
                })}
             </div>
             
             <button 
                onClick={() => {
                   onChange(new Date());
                   setShowCalendar(false);
                }} 
                className={`w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-slate-200 dark:border-white/5 cursor-pointer`}
                data-testid="go-to-today-btn"
             >
                Ir a hoy
             </button>
          </div>
       )}
    </div>
  );
};
