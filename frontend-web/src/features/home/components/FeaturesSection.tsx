import React from 'react';
import { Card } from '@/components/common/Card/index';

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative z-10 w-full py-32 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-20 animate-fade-in">
        <h2 className="text-xs font-black uppercase tracking-[0.5em] text-neutral-600 mb-4">Arquitectura de Control</h2>
        <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">Un ecosistema, control total</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Taller Principal */}
        <Card variant="red" glow={true} padding="xl" className="col-span-1 md:col-span-2 group min-h-[400px]">
          <div className="absolute -bottom-12 -right-12 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:scale-110">
            <svg className="w-96 h-96 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-[2rem] bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(220,38,38,0.3)] animate-pulse">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h4 className="text-4xl font-black text-white uppercase italic tracking-widest mb-6">Gestión de Taller Pro</h4>
            <p className="text-neutral-400 font-medium leading-relaxed max-w-md text-lg opacity-80 group-hover:opacity-100 transition-opacity">Visualiza slots de citas, gestiona tu equipo y optimiza cada hora de trabajo. La digitalización definitiva del taller mecánico.</p>
          </div>
        </Card>

        {/* Feature secundaria 1 */}
        <Card variant="neutral" padding="lg" className="hover:border-white/20 flex flex-col justify-end min-h-[400px]">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-neutral-500 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h4 className="text-2xl font-black text-white uppercase italic mb-4">Historial Digital</h4>
          <p className="text-sm text-neutral-500 uppercase font-black tracking-widest leading-loose">Registro inmutable de todas las intervenciones. Transparencia total para el cliente.</p>
        </Card>

        {/* Feature secundaria 2 */}
        <Card variant="blue" padding="lg" className="hover:border-blue-500/20 flex flex-col justify-end min-h-[400px]">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-neutral-500 group-hover:text-blue-400 group-hover:-rotate-12 transition-all duration-500">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <h4 className="text-2xl font-black text-white uppercase italic mb-4">Tracking en Vivo</h4>
          <p className="text-sm text-neutral-500 uppercase font-black tracking-widest leading-loose">Notificaciones instantáneas sobre el progreso de la reparación.</p>
        </Card>

        {/* Cliente Principal */}
        <Card variant="blue" glow={true} padding="xl" className="col-span-1 md:col-span-2 group min-h-[400px]">
          <div className="absolute -bottom-12 -left-12 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:scale-110">
            <svg className="w-96 h-96 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div className="relative z-10 flex flex-col items-end text-right h-full justify-center">
            <div className="w-16 h-16 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(37,99,235,0.3)] animate-pulse">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14l1.5 4H3.5L5 10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 14v4h2v-4m10 0v4h2v-4M8 10V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
            </div>
            <h4 className="text-4xl font-black text-white uppercase italic tracking-widest mb-6">Dashboard de Conductor</h4>
            <p className="text-neutral-400 font-medium leading-relaxed max-w-md text-lg opacity-80 group-hover:opacity-100 transition-opacity">Visualiza toda tu flota, historial de ITV y presupuestos. La conexión perfecta entre el cliente y su taller de confianza.</p>
          </div>
        </Card>
      </div>
    </section>
  );
};
