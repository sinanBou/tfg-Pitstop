interface BottomNavProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
  theme: 'client' | 'workshop';
}

export function BottomNav({ tabs, activeTab, onTabChange, theme }: BottomNavProps) {
  const isClient = theme === 'client';
  
  const navBorderClass = isClient ? 'border-blue-900/30' : 'border-red-900/30';
  const activeBgClass = isClient ? 'bg-blue-600' : 'bg-red-600';
  const activeShadowClass = isClient ? 'shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'shadow-[0_0_20px_rgba(220,38,38,0.4)]';

  return (
    <nav className={`fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 bg-neutral-950/90 backdrop-blur-xl border ${navBorderClass} p-2 rounded-[2rem] flex gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50`}>
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => onTabChange(index)}
          className={`px-4 md:px-6 py-3.5 md:py-4 rounded-3xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
            activeTab === index 
              ? `${activeBgClass} text-white ${activeShadowClass} scale-100` 
              : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50 scale-95 hover:scale-100'
          }`}
        >
          {activeTab === index && <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay"></div>}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </nav>
  );
}
