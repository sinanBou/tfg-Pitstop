import React from 'react';
import AddressAutocomplete from '../../../../common/AddressAutocomplete';

interface TeamTabProps {
  employeeForm: any;
  setEmployeeForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
  employees: any[];
}

export const TeamTab: React.FC<TeamTabProps> = ({ employeeForm, setEmployeeForm, onSubmit, onDelete, employees }) => {
  const [selectedEmp, setSelectedEmp] = React.useState<any>(null);

  return (
    <div className="space-y-10 relative">
      {/* PANEL DE DETALLE (MODAL OVERLAY) */}
      {selectedEmp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 overflow-hidden">
              {/* Decoración de Fondo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

              <button 
                onClick={() => setSelectedEmp(null)}
                className="absolute top-8 right-8 p-3 bg-black/40 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded-2xl transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="flex flex-col items-center text-center space-y-6 relative">
                 <div className="w-24 h-24 bg-neutral-950 border-2 border-red-600/20 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                    {selectedEmp.firstname.charAt(0)}
                 </div>
                 
                 <div>
                    <h2 className="text-3xl font-black uppercase tracking-widest text-white">{selectedEmp.firstname} {selectedEmp.lastname}</h2>
                    <div className="mt-2 text-red-500 font-black uppercase text-xs tracking-[0.3em]">
                       {selectedEmp.role === 'WORKSHOP_MANAGER' ? 'Gerente General' : 'Mecánico de Plantilla'}
                    </div>
                 </div>

                 <div className="w-full grid grid-cols-1 gap-4 pt-4">
                    <div className="bg-black/40 border border-neutral-800 p-6 rounded-3xl text-left space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 italic">Correo Electrónico</p>
                       <p className="text-lg font-black text-white selection:bg-red-500">{selectedEmp.email}</p>
                    </div>

                    <div className="bg-black/40 border border-neutral-800 p-6 rounded-3xl text-left space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 italic">Dirección de Residencia</p>
                       <p className="text-sm font-bold text-neutral-300 leading-relaxed">{selectedEmp.address || 'No especificada'}</p>
                    </div>

                    <div className="bg-black/40 border border-neutral-800 p-6 rounded-3xl text-left space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 italic">Identificador de Empleado</p>
                       <p className="text-[10px] font-mono text-neutral-500">{selectedEmp.id}</p>
                    </div>
                 </div>

                 <button 
                   onClick={() => { onDelete(selectedEmp.id); setSelectedEmp(null); }}
                   className="mt-6 px-10 py-5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto"
                 >
                   Dar de baja permanente
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* FORMULARIO DE ALTA */}
      <div className="bg-neutral-900/20 border border-neutral-800 p-10 rounded-[2.5rem] backdrop-blur-sm shadow-xl relative z-10 transition-opacity duration-300">
        <h3 className="text-xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3">
          <div className="p-2 bg-red-600/10 rounded-lg">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          Añadir Miembro al Equipo
        </h3>
        
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Nombre</label>
              <input required type="text" value={employeeForm.firstname} onChange={e => setEmployeeForm({...employeeForm, firstname: e.target.value})} className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-red-600 outline-none transition-all font-bold placeholder:text-neutral-700" placeholder="Ej: Juan" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Apellidos</label>
              <input required type="text" value={employeeForm.lastname} onChange={e => setEmployeeForm({...employeeForm, lastname: e.target.value})} className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-red-600 outline-none transition-all font-bold placeholder:text-neutral-700" placeholder="Ej: Pérez" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Email Profesional</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input required type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="w-full bg-black/40 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-white focus:border-red-600 outline-none transition-all font-bold placeholder:text-neutral-700" placeholder="juan@taller.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Contraseña de Acceso</label>
              <input required type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-red-600 outline-none transition-all font-bold placeholder:text-neutral-700" placeholder="••••••••" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Rango Organizativo</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setEmployeeForm({...employeeForm, role: 'WORKSHOP_STAFF'})}
                  className={`p-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest ${employeeForm.role === 'WORKSHOP_STAFF' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}
                >
                  Mecánico
                </button>
                <button 
                  type="button" 
                  onClick={() => setEmployeeForm({...employeeForm, role: 'WORKSHOP_MANAGER'})}
                  className={`p-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest ${employeeForm.role === 'WORKSHOP_MANAGER' ? 'bg-white border-white text-black shadow-lg shadow-white/10' : 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}
                >
                  Gerente / Mánager
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
               <AddressAutocomplete 
                  label="Localización / Residencia" 
                  name="address" 
                  value={employeeForm.address || ''} 
                  onChange={(val: string) => setEmployeeForm({...employeeForm, address: val})} 
                  placeholder="Calle, ciudad..." 
               />
            </div>
          </div>
          <button type="submit" className="w-full md:w-auto px-12 py-5 bg-red-600 hover:bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/10 active:scale-95">
            Dar de Alta en Plantilla
          </button>
        </form>
      </div>

      {/* PLANTILLA ACTUAL */}
      <div>
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Miembros de la Plantilla ({employees.length})
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.map(emp => (
            <div 
              key={emp.id} 
              onClick={() => setSelectedEmp(emp)}
              className="group relative bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2.5rem] hover:bg-neutral-900/60 hover:border-neutral-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl overflow-hidden"
            >
              {/* Decoración de Hover */}
              <div className="absolute top-0 right-0 w-2 h-full bg-red-600 translate-x-full group-hover:translate-x-0 transition-transform"></div>

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-white font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    {emp.firstname.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-black uppercase text-base tracking-widest leading-none mb-2">{emp.firstname} {emp.lastname}</h4>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${emp.role === 'WORKSHOP_MANAGER' ? 'bg-white text-black' : 'bg-red-600/10 text-red-500'}`}>
                      {emp.role === 'WORKSHOP_MANAGER' ? 'Gerente' : 'Mecánico'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(emp.id); }}
                  className="p-3 bg-black/40 hover:bg-red-600 text-neutral-600 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-800/50 space-y-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Contacto</p>
                  <p className="text-sm font-black text-white break-words transition-colors group-hover:text-red-500">{emp.email}</p>
                </div>
                {emp.address && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Localidad</p>
                    <p className="text-[11px] font-bold text-neutral-400 leading-relaxed break-words">{emp.address}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
