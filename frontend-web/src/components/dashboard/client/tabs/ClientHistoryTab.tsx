import React from 'react';

const HistoryIcon = () => (<svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

interface ClientHistoryTabProps {
  history: any[];
}

export function ClientHistoryTab({ history }: ClientHistoryTabProps) {
  return (
    <div className="max-w-3xl">
      <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
         {history.length > 0 ? (
            history.map(hist => (
               <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-black bg-neutral-600 group-hover:bg-blue-500 text-neutral-500 group-hover:text-blue-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute top-0 left-[-27px] md:relative md:top-auto md:left-auto md:mx-auto transition-colors duration-300"></div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 group-hover:border-blue-900/50 transition-colors shadow">
                     <div className="flex items-center justify-between mb-2">
                         <div className="font-bold text-white">{hist.vehicleName}</div>
                         <time className="font-mono text-xs font-bold text-neutral-500">{hist.finishDate}</time>
                     </div>
                     <div className="text-neutral-400 text-sm">{hist.description}</div>
                  </div>
               </div>
            ))
         ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
               <HistoryIcon />
               <p className="text-xs font-black uppercase tracking-[0.4em] text-neutral-500 font-mono mt-4">Log Vacío</p>
            </div>
         )}
      </div>
    </div>
  );
}
