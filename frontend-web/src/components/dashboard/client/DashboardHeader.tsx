export const DashboardHeader = ({ title }: { title: string }) => (
  <header className="p-6 pb-2 bg-black z-10">
    <p className="text-red-600 font-bold text-[10px] tracking-[0.4em] uppercase mb-1 italic">Gestión de Taller</p>
    <h1 className="text-3xl font-black uppercase tracking-tighter italic">
      {title} <span className="text-blue-600">_</span>
    </h1>
  </header>
);