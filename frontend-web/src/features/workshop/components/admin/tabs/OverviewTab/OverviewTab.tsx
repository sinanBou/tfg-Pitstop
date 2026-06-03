import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Users, Clock } from '@/assets/icons';
import { WelcomeHeader } from './WelcomeHeader';
import { WorkshopProfileCard } from './WorkshopProfileCard';
import { WorkingDaysSelector } from './WorkingDaysSelector';

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
      <WelcomeHeader 
        employeeProfile={employeeProfile} 
        userName={userName} 
        userRoleLabel={userRoleLabel} 
      />

      {/* Workshop Profile Card */}
      <WorkshopProfileCard workshopData={workshopData} userRole={userRole || employeeProfile?.role} />
         
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Active Vehicles Card */}
         <Card variant="neutral" glow={false} border={false} padding="lg" className="lg:col-span-1 relative overflow-hidden group !rounded-2xl">
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-red-500 mb-2">Estado del Taller</p>
                  <p className="text-7xl font-black text-white tracking-tighter drop-shadow-xl">{workshopData?.vehiclesCurrentCount || 0}</p>
               </div>
               <div className="mt-8">
                  <p className="text-sm font-black text-white tracking-widest uppercase">Vehículos en Taller</p>
               </div>
            </div>
         </Card>

         <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Employees Summary Card */}
               <Card variant="neutral" glow={false} border={false} padding="md" className="h-[160px] flex flex-col justify-between transition-all duration-300 group !rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800/60 text-neutral-400 flex items-center justify-center group-hover:bg-red-600/10 group-hover:text-red-500 transition-all duration-300">
                      <Users className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                     <p className="text-5xl font-black text-white tracking-tighter">{workshopData?.totalEmployees || 0}</p>
                     <p className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-500 mt-2">Plantilla Registrada</p>
                  </div>
               </Card>

               {/* Schedule Brief Card */}
               <Card variant="neutral" glow={false} border={false} padding="md" className="h-[160px] flex flex-col justify-between transition-all duration-300 group !rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800/60 text-neutral-400 flex items-center justify-center group-hover:bg-red-600/10 group-hover:text-red-500 transition-all duration-300">
                      <Clock className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                     <p className="text-3xl font-black text-white font-mono tracking-tight">
                       {workshopData?.openTime?.slice(0,5) || '--'} <span className="text-neutral-600 font-sans text-sm mx-1">a</span> {workshopData?.closeTime?.slice(0,5) || '--'}
                     </p>
                     <p className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-500 mt-2">Horario Apertura</p>
                  </div>
               </Card>
            </div>

            {/* Working Days Card */}
            <WorkingDaysSelector workshopData={workshopData} diasSemana={diasSemana} />
         </div>
      </div>
    </div>
  );
};
