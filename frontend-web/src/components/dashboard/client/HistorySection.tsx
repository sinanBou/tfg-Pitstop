// Interfaz para el registro histórico
interface HistoryDTO {
  id: string;
  finishDate: string;
  vehicleName: string;
  description: string;
  totalCost: number;
}

interface HistorySectionProps {
  history: HistoryDTO[];
}

export const HistorySection = ({ history }: HistorySectionProps) => {
  return (
    <section className="w-1/4 h-full p-6 overflow-y-auto pb-32 space-y-4">

      <div className="space-y-4">
        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className="p-5 bg-neutral-900 border-l-2 border-l-blue-600 rounded-r-2xl border-y border-r border-neutral-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                 <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /></svg>
              </div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-mono text-gray-500">{item.finishDate}</span>
                <span className="text-sm font-black text-white">{item.totalCost.toFixed(2)}€</span>
              </div>
              <h4 className="text-xs font-black uppercase italic text-blue-400">{item.vehicleName}</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{item.description}</p>
              <button className="mt-3 text-[9px] font-black uppercase text-blue-500 hover:text-white transition-colors">
                Descargar Factura PDF
              </button>
            </div>
          ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center opacity-20">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
               <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-black uppercase tracking-[0.5em]">Sin registros</p>
          </div>
        )}
      </div>
    </section>
  );
};