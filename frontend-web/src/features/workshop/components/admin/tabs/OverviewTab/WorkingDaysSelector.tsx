import React from 'react';
import { Card } from '@/components/common/Card/index';

interface WorkingDaysSelectorProps {
  workshopData: any;
  diasSemana: Array<{ value: string; label: string }>;
}

export const WorkingDaysSelector: React.FC<WorkingDaysSelectorProps> = ({
  workshopData,
  diasSemana
}) => {
  return (
    <Card variant="neutral" glow={false} border={false} padding="lg" className="transition-all duration-300 !rounded-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center group-hover:bg-red-600/10 group-hover:text-red-500 transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-500">Horario de Operaciones</p>
          <p className="text-xs font-black text-white uppercase mt-0.5">Días Laborables del Taller</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {(() => {
          const daysStr = workshopData?.workingDays || '';
          const daysArr = daysStr === 'LUNES-VIERNES' 
            ? ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] 
            : daysStr.split(/[,-]/).map((d: string) => d.trim()).filter(Boolean);
          
          return diasSemana.map((dia) => {
            const isWorkingDay = daysArr.includes(dia.value);
            return (
              <div 
                key={dia.value} 
                className={`px-5 py-4 flex-grow text-center rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                  isWorkingDay 
                    ? 'bg-red-600/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.15)] font-black' 
                    : 'bg-neutral-950/40 border-neutral-900 text-neutral-700/50'
                }`}
              >
                {dia.label}
              </div>
            );
          });
        })()}
      </div>
    </Card>
  );
};
