export const VehicleCard = ({ brand, plate, index }: { brand: string, plate: string, index: number }) => (
  <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 flex justify-between items-center w-full">
    <div>
      <h3 className="font-bold text-lg uppercase italic text-white leading-none">{brand}</h3>
      <p className="text-xs text-blue-500 font-mono mt-1">{plate}</p>
    </div>
    <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center opacity-30 text-[10px]">
      {String(index + 1).padStart(2, '0')}
    </div>
  </div>
);