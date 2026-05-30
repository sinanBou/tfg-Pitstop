import { useRef, useEffect, useState } from 'react';
import type { BottomNavProps } from './BottomNav.types';

export function BottomNav({ tabs, activeTab, onTabChange, theme }: BottomNavProps) {
  const isClient = theme === 'client';
  
  const navBorderClass = isClient ? 'border-blue-500/30' : 'border-red-500/30';
  const activeBgClass = isClient ? 'bg-blue-600' : 'bg-red-600';
  const activeShadowClass = isClient ? 'shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'shadow-[0_0_20px_rgba(220,38,38,0.4)]';

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    function updateIndicator() {
      const activeEl = tabsRef.current[activeTab];
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        });
      }
    }
    
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, tabs]);

  return (
    <div className="fixed bottom-0 left-0 w-full h-32 md:h-40 bg-gradient-to-t from-black via-zinc-950/90 to-transparent pointer-events-none z-50 flex items-end justify-center pb-6 md:pb-10">
      <nav className={`relative pointer-events-auto bg-neutral-950/80 backdrop-blur-2xl border ${navBorderClass} ring-1 ring-white/5 p-2 rounded-[2rem] flex gap-1 shadow-[0_10px_50px_rgba(0,0,0,1)] hover:shadow-[0_10px_60px_rgba(0,0,0,1)] transition-shadow duration-500`}>
        
        {/* Animated Backing Indicator */}
        <div 
           className={`absolute top-2 bottom-2 rounded-[1.5rem] transition-all duration-500 ease-out overflow-hidden flex items-center justify-center ${activeBgClass} ${activeShadowClass}`}
           style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        >
            <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay"></div>
        </div>

        {tabs.map((tab, index) => (
          <button
            key={tab}
            ref={el => { tabsRef.current[index] = el; }}
            onClick={() => onTabChange(index)}
            className={`px-5 md:px-8 py-3.5 md:py-4 rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10 flex items-center justify-center ${
              activeTab === index 
                ? 'text-white scale-100' 
                : 'text-neutral-500 hover:text-white hover:bg-white/5 scale-95 hover:scale-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
