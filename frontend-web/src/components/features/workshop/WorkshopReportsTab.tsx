export function WorkshopReportsTab() {
  return (
    <div className="py-20 flex flex-col items-center justify-center opacity-40 text-center">
      <svg className="w-12 h-12 text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      <p className="text-neutral-500 font-black uppercase tracking-[0.3em] font-mono">Reportes Globales</p>
      <p className="text-xs text-neutral-600 mt-2 max-w-sm font-mono">Próximamente... Analíticas gráficas sobre el rendimiento de tus talleres, ocupación de slots y satisfacción del cliente.</p>
    </div>
  );
}
