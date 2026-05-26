import React, { useState } from 'react';
import { Card } from '../../../../common/Card/index';
import { ImagePreviewModal } from '../../../../common/ImagePreviewModal/index';

interface OverviewTabProps {
  workshopData: any;
  diasSemana: Array<{value: string, label: string}>;
  employeeProfile?: any;
  userRole?: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ 
  workshopData, 
  diasSemana,
  employeeProfile,
  userRole
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getRoleLabel = (role: string) => {
    if (role === 'WORKSHOP_OWNER') return 'Dueño';
    if (role === 'WORKSHOP_MANAGER') return 'Gerente';
    if (role === 'WORKSHOP_STAFF') return 'Mecánico';
    return role || 'Personal';
  };

  const userName = employeeProfile ? `${employeeProfile.firstname} ${employeeProfile.lastname}` : 'Cargando...';
  const userRoleLabel = getRoleLabel(userRole || employeeProfile?.role || '');

  return (
    <div className="space-y-6">
      {/* Welcome & Session Header Card */}
      <Card variant="neutral" glow={true} padding="sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div 
                className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center font-black text-xl font-mono shadow-[0_0_20px_rgba(255,255,255,0.05)] overflow-hidden shrink-0 ${employeeProfile?.profilePictureUrl ? 'cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-300' : ''}`}
                onClick={employeeProfile?.profilePictureUrl ? () => setIsPreviewOpen(true) : undefined}
              >
                {employeeProfile?.profilePictureUrl ? (
                  <img src={employeeProfile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  employeeProfile?.firstname?.slice(0, 1) || 'P'
                )}
              </div>
              <h3 className="text-lg font-black text-white">{userName}</h3>
            </div>
            
            {/* Role Badge with full white border */}
            <div className="self-start md:self-auto">
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] border border-white bg-black/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                {userRoleLabel}
              </span>
            </div>
         </div>
      </Card>

      {/* Workshop Profile Card */}
      <Card variant="neutral" glow={true} padding="lg">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div>
               <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2 font-black">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Panel Dinámico
               </p>
               <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500 mb-3">{workshopData?.companyName}</h2>
               <p className="text-neutral-400 font-mono flex items-center gap-2 text-sm font-medium">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {workshopData?.address}
               </p>
            </div>
            <div className="bg-black/40 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center shadow-lg">
               <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-black mb-1">Identificador Fiscal</span>
               <span className="text-white font-mono font-black tracking-[0.2em] text-lg">{workshopData?.cif}</span>
            </div>
         </div>
      </Card>
         
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Active Vehicles Card */}
         <Card variant="neutral" glow={true} padding="lg" className="lg:col-span-1">
            <div className="absolute -bottom-6 -right-6 text-neutral-500/10 group-hover:text-red-500/10 transition-colors duration-500">
               <svg className="w-48 h-48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-red-500 mb-2">Taller Activo</p>
                  <p className="text-7xl font-black text-white tracking-tighter drop-shadow-xl">{workshopData?.vehiclesCurrentCount || 0}</p>
               </div>
               <div className="mt-8">
                  <p className="text-sm font-black text-white tracking-widest uppercase">Vehículos</p>
                  <p className="text-[10px] text-red-400 font-mono mt-1 font-bold">OPERACIONES EN CURSO</p>
               </div>
            </div>
         </Card>

         <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Employees Summary Card */}
               <Card variant="neutral" glow={true} padding="md" className="h-[160px] flex flex-col justify-between hover:border-white/20">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 text-neutral-400 flex items-center justify-center group-hover:bg-red-600/10 group-hover:text-red-500 transition-all duration-300">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                     <p className="text-5xl font-black text-white tracking-tighter">{workshopData?.totalEmployees || 0}</p>
                     <p className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-500 mt-2">Plantilla Registrada</p>
                  </div>
               </Card>

               {/* Schedule Brief Card */}
               <Card variant="neutral" glow={true} padding="md" className="h-[160px] flex flex-col justify-between hover:border-white/20">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 text-neutral-400 flex items-center justify-center group-hover:bg-red-600/10 group-hover:text-red-500 transition-all duration-300">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                     <p className="text-3xl font-black text-white font-mono tracking-tight">{workshopData?.openTime?.slice(0,5) || '--'} <span className="text-neutral-600 font-sans text-sm mx-1">a</span> {workshopData?.closeTime?.slice(0,5) || '--'}</p>
                     <p className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-500 mt-2">Horario Apertura</p>
                  </div>
               </Card>
            </div>

            {/* Working Days Card */}
            <Card variant="neutral" glow={true} padding="lg" className="hover:border-white/20">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-neutral-400 flex items-center justify-center group-hover:bg-red-600/10 group-hover:text-red-500 transition-all duration-300">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-500">Días Laborables del Taller</p>
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
                              className={`px-5 py-4 flex-grow text-center rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-wider transition-all border ${
                                 isWorkingDay 
                                    ? 'bg-red-600/20 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.25)]' 
                                    : 'bg-black/20 border-white/5 text-neutral-600/40'
                              }`}
                           >
                              {dia.label}
                           </div>
                        );
                     });
                  })()}
               </div>
            </Card>
         </div>
      </div>
      {employeeProfile?.profilePictureUrl && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          imageUrl={employeeProfile.profilePictureUrl}
          title={userName}
        />
      )}
    </div>
  );
};
