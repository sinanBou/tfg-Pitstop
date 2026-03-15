export const VehicleCard = ({ brand, plate, index }: { brand: string, plate: string, index: number }) => (
  <div className="bg-neutral-900/50 border border-blue-900/30 p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/50 transition-all flex justify-between items-center w-full shadow-lg">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
      <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    </div>
    <div className="relative z-10">
      <h3 className="font-black text-2xl uppercase text-white leading-none tracking-tighter mb-2">{brand}</h3>
      <p className="text-sm font-black text-blue-400 font-mono tracking-widest">{plate}</p>
    </div>
    <div className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center text-neutral-600 font-black text-xs relative z-10 group-hover:border-blue-500/30 group-hover:text-blue-500 transition-colors">
      {String(index + 1).padStart(2, '0')}
    </div>
  </div>
);