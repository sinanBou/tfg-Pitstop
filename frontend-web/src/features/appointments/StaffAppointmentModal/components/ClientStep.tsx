import React from 'react';
import { type ClientSearchDTO, type VehicleSearchDTO } from '@/features/client';
import { Search, ChevronRight, AlertTriangle } from '@/assets/icons';

interface ClientStepProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearch: (pageIdx?: number, isNewSearch?: boolean) => void;
  loading: boolean;
  searchResults: { clients: ClientSearchDTO[], vehicles: VehicleSearchDTO[] };
  currentPage: number;
  hasMore: boolean;
  onSelectClient: (c: ClientSearchDTO) => void;
  onSelectVehicle: (v: VehicleSearchDTO) => void;
  isNewClient: boolean;
  setIsNewClient: (b: boolean) => void;
  clientForm: { firstname: string, lastname: string, nif: string, phoneNumber: string, email: string };
  setClientForm: (f: any) => void;
  onCreateClient: () => void;
}

export const ClientStep: React.FC<ClientStepProps> = ({
  searchQuery, setSearchQuery, onSearch, loading, searchResults,
  currentPage, hasMore,
  onSelectClient, onSelectVehicle, isNewClient, setIsNewClient,
  clientForm, setClientForm, onCreateClient
}) => {
  return (
    <div className="space-y-8 min-h-[500px] flex flex-col">
      <div className="relative group z-50 shrink-0">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-3 block ml-2">Buscador de Clientes</label>
        <div className="relative">
          <input 
            placeholder="Nombre, NIF o Email del cliente..." 
            className="w-full bg-neutral-900/40 border border-neutral-800 p-6 rounded-[1.8rem] text-white outline-none focus:border-red-600 focus:bg-black/60 transition-all font-bold placeholder:text-neutral-700 shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(0, true)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
            {loading && <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
            <div className="w-px h-8 bg-neutral-800 mx-1"></div>
            <button 
              onClick={() => onSearch(0, true)}
              disabled={loading}
              className="p-3 bg-red-600 text-white hover:bg-neutral-900 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Search className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* CONTENEDOR DE RESULTADOS FLOTANTE MEJORADO */}
        {(searchResults.clients.length > 0 || searchResults.vehicles.length > 0 || (loading && searchQuery.length > 2)) && (
          <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-neutral-950 border border-neutral-800 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-3xl z-[60]">
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-3 space-y-2">
              
              {searchResults.vehicles.length > 0 && (
                <div className="pb-2 border-b border-neutral-800/50 mb-2">
                  <p className="px-4 py-2 text-[9px] font-black uppercase text-neutral-600 tracking-[0.2em]">Vehículos Detectados</p>
                  {searchResults.vehicles.map(v => (
                    <button key={v.id} onClick={() => onSelectVehicle(v)} className="w-full p-5 hover:bg-red-600/10 border border-transparent hover:border-red-600/20 rounded-2xl flex items-center justify-between group transition-all text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-xl shadow-red-600/30">{v.licensePlate.substring(0,2)}</div>
                        <div>
                          <p className="text-white font-black uppercase text-sm group-hover:text-red-500 transition-colors tracking-widest">{v.licensePlate}</p>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase">{v.brand} {v.model}</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-full border border-neutral-800 group-hover:border-red-600 transition-all group-hover:text-red-600 text-neutral-700">
                         <ChevronRight className="w-4 h-4" strokeWidth={3} />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.clients.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[9px] font-black uppercase text-neutral-600 tracking-[0.2em]">Clientes Coincidentes</p>
                  {searchResults.clients.map(c => (
                    <button key={c.id} onClick={() => onSelectClient(c)} className="w-full p-5 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 rounded-2xl flex items-center justify-between group transition-all text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-800 text-neutral-400 rounded-xl flex items-center justify-center font-black text-xs">{c.firstname.charAt(0)}</div>
                        <div>
                          <p className="text-white font-black uppercase text-sm tracking-widest">{c.firstname} {c.lastname}</p>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">NIF: {c.nif} • {c.email}</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-full border border-neutral-800 group-hover:border-blue-600 transition-all group-hover:text-blue-600 text-neutral-700">
                         <ChevronRight className="w-4 h-4" strokeWidth={3} />
                      </div>
                    </button>
                  ))}

                  {hasMore && (
                    <button 
                      onClick={() => onSearch(currentPage + 1, false)}
                      className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-white hover:bg-neutral-900 transition-all rounded-2xl mt-2 border border-dashed border-neutral-800"
                    >
                      {loading ? 'Consultando más registros...' : 'Ver más coincidencias en la base de datos'}
                    </button>
                  )}
                </div>
              )}

              {loading && searchResults.clients.length === 0 && searchResults.vehicles.length === 0 && (
                <div className="p-14 text-center flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 animate-pulse">Explorando Archivos...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {searchResults.clients.length === 0 && searchResults.vehicles.length === 0 && !loading && searchQuery.length > 3 && (
          <div className="mt-6 p-10 text-center bg-black/40 border border-dashed border-neutral-800 rounded-[2.5rem] animate-in zoom-in-95 duration-300">
             <div className="w-16 h-16 bg-neutral-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-700">
                <AlertTriangle className="w-8 h-8" strokeWidth={1.5} />
             </div>
             <p className="text-neutral-500 text-xs font-black uppercase tracking-widest mb-6 italic opacity-80 leading-relaxed">No se han encontrado registros para<br/><span className="text-white not-italic">"{searchQuery}"</span></p>
             <button onClick={() => setIsNewClient(true)} className="px-8 py-4 bg-red-600 text-white font-black uppercase text-xs rounded-2xl hover:bg-neutral-900 transition-all shadow-2xl shadow-red-600/20 active:scale-95">Registrar Cliente Nuevo</button>
          </div>
        )}
      </div>

      <div className="flex-1"></div>



      {isNewClient && (
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-[2rem] space-y-4 animate-in fade-in zoom-in-95">
           <h3 className="text-white font-black uppercase text-sm mb-4 flex items-center gap-2">
             <span className="w-4 h-4 bg-white rounded-md"></span>
             Nuevo Registro Presencial
           </h3>
           <div className="grid grid-cols-2 gap-3">
              <input placeholder="Nombre" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-xs outline-none focus:border-red-600 transition-all font-bold" value={clientForm.firstname} onChange={e => setClientForm({...clientForm, firstname: e.target.value})} />
              <input placeholder="Apellidos" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-xs outline-none focus:border-red-600 transition-all font-bold" value={clientForm.lastname} onChange={e => setClientForm({...clientForm, lastname: e.target.value})} />
              <input placeholder="NIF" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-xs outline-none focus:border-red-600 transition-all font-bold uppercase" value={clientForm.nif} onChange={e => setClientForm({...clientForm, nif: e.target.value.toUpperCase()})} />
              <input placeholder="Teléfono" className="bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-xs outline-none focus:border-red-600 transition-all font-bold" value={clientForm.phoneNumber} onChange={e => setClientForm({...clientForm, phoneNumber: e.target.value})} />
           </div>
           <input placeholder="Email (Opcional)" className="w-full bg-black/40 border border-neutral-800 p-4 rounded-xl text-white text-xs outline-none focus:border-red-600 transition-all font-bold" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} />
           <p className="text-[9px] text-neutral-600 font-medium px-2 italic text-center">Si el cliente no tiene email, el sistema generará una cuenta interna automáticamente.</p>
           <button onClick={onCreateClient} disabled={loading || !clientForm.nif || !clientForm.firstname} className="w-full py-4 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl disabled:opacity-50">
             {loading ? 'Registrando...' : 'Registrar Cliente y Continuar'}
           </button>
        </div>
      )}
    </div>
  );
};
