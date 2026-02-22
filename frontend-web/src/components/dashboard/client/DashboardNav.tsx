import { DashboardIcon } from '../ui/Icons';

interface DashboardNavProps {
  secciones: string[];
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const DashboardNav = ({ secciones, activeTab, setActiveTab }: DashboardNavProps) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-sm z-50">
    <nav className="bg-neutral-900/95 backdrop-blur-2xl border border-white/5 rounded-3xl p-1.5 shadow-2xl">
      <div className="flex justify-between items-center px-4">
        {secciones.map((label, index) => (
          <button
            key={label}
            onClick={() => setActiveTab(index)}
            className={`relative py-3 flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === index ? 'scale-105' : 'opacity-30'
            }`}
          >
            {activeTab === index && (
              <div className="absolute top-0 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_#2563eb]"></div>
            )}
            <DashboardIcon tipo={index} active={activeTab === index} />
            <span className={`text-[8px] font-black uppercase tracking-tighter ${
              activeTab === index ? 'text-blue-500' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  </div>
);