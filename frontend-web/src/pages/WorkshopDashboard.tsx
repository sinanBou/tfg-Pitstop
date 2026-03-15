import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:9091/api';

// Iconos


const WorkshopIcon = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function WorkshopDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    cif: '',
    companyName: '',
    address: '',
    workingDays: [] as string[],
    openTime: '09:00',
    closeTime: '18:00',
  });

  const diasSemana = [
    { value: 'LUNES', label: 'Lunes' },
    { value: 'MARTES', label: 'Martes' },
    { value: 'MIERCOLES', label: 'Miércoles' },
    { value: 'JUEVES', label: 'Jueves' },
    { value: 'VIERNES', label: 'Viernes' },
    { value: 'SABADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' },
  ];

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No autenticado");
      const data = await res.json();
      
      setOwnerId(data.employeeId);
      
      const wRes = await fetch(`${API_URL}/workshops/owner/${data.employeeId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (wRes.ok) {
        const wData = await wRes.json();
        setWorkshops(wData);
      }
    } catch (err) {
      console.error(err);
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleDiasCambio = (dia: string) => {
    setForm(prev => {
      const workingDays = prev.workingDays.includes(dia)
        ? prev.workingDays.filter(d => d !== dia)
        : [...prev.workingDays, dia];
      return { ...prev, workingDays };
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const prevValue = form[name as keyof typeof form] as string;
    if (value.length < prevValue.length) {
      setForm({ ...form, [name]: value });
      return;
    }
    let v = value.replace(/\D/g, '');
    if (v.length >= 1 && parseInt(v[0]) > 2) v = '2';
    if (v.length >= 2) {
      const hour = parseInt(v.slice(0, 2));
      if (hour > 23) v = '23' + v.slice(2);
    }
    if (v.length >= 3) {
      const minDecena = parseInt(v[2]);
      if (minDecena > 5) v = v.slice(0, 2) + '5';
    }
    let formatted = v;
    if (v.length >= 3) {
      formatted = v.slice(0, 2) + ':' + v.slice(2, 4);
    } else {
      formatted = v.slice(0, 2);
    }
    setForm({ ...form, [name]: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.workingDays.length === 0) {
      alert("Debes seleccionar al menos un día de trabajo");
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      const payload = {
        ...form,
        slotDurationMinutes: 60,
        workingDays: form.workingDays.join(','),
        ownerId: ownerId,
      };

      const res = await fetch(`${API_URL}/workshops`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Taller creado con éxito.");
      setIsModalOpen(false);
      setForm({
        cif: '',
        companyName: '',
        address: '',
        workingDays: [],
        openTime: '09:00',
        closeTime: '18:00',
      });
      fetchData(); // Recargar datos
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const [activeTab, setActiveTab] = useState(0);
  const SECCIONES = ['TALLERES', 'REPORTES'];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-black italic tracking-widest animate-pulse uppercase text-xs">Sincronizando taller...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-24">
      
      {/* Fondo Glow Animado Global */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neutral-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-[pulse_4s_infinite] pointer-events-none"></div>

      {/* Top Header Light */}
      <header className="px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-20 sticky top-0 bg-transparent">
        <div>
           <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">PitStop</h2>
           <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] mt-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">Dueño de Taller</p>
        </div>
        <button 
           onClick={() => { localStorage.clear(); navigate('/login'); }}
           className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-neutral-900/50 border border-neutral-800"
           title="Cerrar Sesión"
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </header>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 scrollbar-hide">
         
         <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
            
            <header className="flex justify-between items-end border-b border-neutral-800/60 pb-6 mb-8">
               <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">
                     {SECCIONES[activeTab]}
                  </h1>
               </div>
            </header>

            {/* TAB CONTENT: TALLERES */}
            {activeTab === 0 && (
               <div>
                  <div className="flex justify-between items-center mb-8">
                     <p className="text-neutral-500 text-sm font-medium">Gestión de sucursales activas</p>
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-2"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Nuevo Taller
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {workshops.map((workshop: any) => (
                        <div key={workshop.id} className="bg-neutral-900/40 border border-neutral-800 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:border-red-500/40 transition-all duration-300 flex flex-col hover:shadow-2xl hover:-translate-y-1">
                           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500">
                              <svg className="w-32 h-32 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                           </div>
                           
                           <div className="relative z-10 flex-1">
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/20 border border-red-500/20 text-red-500 flex items-center justify-center shadow-inner">
                                     <WorkshopIcon />
                                  </div>
                                  <h3 className="text-xl font-black uppercase text-white leading-tight tracking-tighter flex-1">{workshop.companyName}</h3>
                              </div>
                              
                              <div className="space-y-3 mb-8 bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                                 <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-neutral-800/50 rounded-lg text-neutral-400 mt-0.5 shrink-0 border border-neutral-700/50">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <p className="text-sm font-medium text-neutral-300 leading-snug">{workshop.address}</p>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400 shrink-0 border border-red-500/20">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <p className="text-sm font-black text-red-400 font-mono tracking-widest">{workshop.cif}</p>
                                 </div>
                              </div>
                           </div>
                           
                           <button className="w-full py-4 bg-neutral-800/50 border border-neutral-700/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:border-red-500 transition-all shadow-sm relative z-10 group/btn mt-auto overflow-hidden">
                              <span className="flex items-center justify-center gap-2 relative z-10">
                                 Gestionar Taller
                                 <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                              </span>
                           </button>
                        </div>
                     ))}
                     
                     {/* Empty Slot Card */}
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-neutral-900/20 border-2 border-dashed border-neutral-800 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-red-500/50 hover:bg-neutral-900/60 transition-all group shadow-sm hover:shadow-2xl relative overflow-hidden min-h-[320px]"
                     >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 border border-neutral-700 group-hover:border-red-500/50 group-hover:bg-red-500/10 flex items-center justify-center text-neutral-500 group-hover:text-red-500 transition-all relative z-10 group-hover:scale-110 duration-300">
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <div className="text-center relative z-10 mt-2">
                           <span className="block text-sm font-black uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">Añadir Taller</span>
                           <span className="block text-[11px] text-neutral-600 mt-2 font-medium tracking-wide">Pulsa para configurar</span>
                        </div>
                     </button>
                  </div>
               </div>
            )}

            {/* TAB CONTENT: RECORD */}
            {activeTab === 1 && (
               <div className="py-20 flex flex-col items-center justify-center opacity-40 text-center">
                  <svg className="w-12 h-12 text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  <p className="text-neutral-500 font-black uppercase tracking-[0.3em] font-mono">Reportes Globales</p>
                  <p className="text-xs text-neutral-600 mt-2 max-w-sm font-mono">Próximamente... Analíticas gráficas sobre el rendimiento de tus talleres, ocupación de slots y satisfacción del cliente.</p>
               </div>
            )}
         </div>
      </main>

      {/* --- FLOATING BOTTOM NAV --- */}
      <nav className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 bg-neutral-950/90 backdrop-blur-xl border border-red-900/30 p-2 rounded-[2rem] flex gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50">
        {SECCIONES.map((seccion, index) => (
          <button
            key={seccion}
            onClick={() => setActiveTab(index)}
            className={`px-4 md:px-6 py-3.5 md:py-4 rounded-3xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
              activeTab === index 
                ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-100' 
                : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50 scale-95 hover:scale-100'
            }`}
          >
            {activeTab === index && <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay"></div>}
            <span className="relative z-10">{seccion}</span>
          </button>
        ))}
      </nav>


      {/* MODAL DE CREACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay con desenfoque */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
             <div className="flex flex-col h-full max-h-[90vh]">
                
                 {/* Cabecera del Modal */}
                 <div className="relative p-6 px-8 border-b border-neutral-800/50 bg-neutral-950/50 flex justify-between items-center z-10 shrink-0">
                   <div>
                     <h2 className="text-white text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                       Nuevo Taller
                       <span className="flex h-2 w-2 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                       </span>
                     </h2>
                     <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase">Configuración de Negocio</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 </div>

                 {/* Fondo decorativo interno */}
                 <div className="absolute inset-0 pointer-events-none overflow-hidden object-cover">
                    <div className="absolute -top-[40%] -right-[40%] w-full h-full bg-red-600/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
                 </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                   <form onSubmit={handleSubmit} className="space-y-8">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Nombre Comercial *</label>
                            <input type="text" required value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all font-bold placeholder-neutral-700" placeholder="Ej. Talleres Motosport" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">CIF *</label>
                            <input type="text" required value={form.cif} onChange={e => setForm({...form, cif: e.target.value})} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all font-mono font-bold placeholder-neutral-700" placeholder="B12345678" />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Sede Física (Dirección) *</label>
                         <input type="text" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all font-bold placeholder-neutral-700" placeholder="C/ Gran Vía 12, Madrid" />
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Días Operativos *</label>
                         <div className="flex flex-wrap gap-2">
                            {diasSemana.map(dia => (
                               <button 
                                  type="button" 
                                  key={dia.value}
                                  onClick={() => handleDiasCambio(dia.value)}
                                  className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${form.workingDays.includes(dia.value) ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}
                               >
                                  {dia.label}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Apertura (HH:mm)</label>
                            <input type="text" name="openTime" required value={form.openTime} onChange={handleTimeChange} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all text-center font-mono text-xl font-bold" maxLength={5} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block ml-1">Cierre (HH:mm)</label>
                            <input type="text" name="closeTime" required value={form.closeTime} onChange={handleTimeChange} className="w-full bg-neutral-900/50 border border-neutral-800 text-white p-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all text-center font-mono text-xl font-bold" maxLength={5} />
                         </div>
                      </div>

                      <button type="submit" className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all flex justify-center items-center gap-3 group active:scale-[0.98]">
                         Activar Taller
                         <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                   </form>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* ESTILOS INLINE PARA CUSTOM SCROLLBAR Y ANIMATIONS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        
        @keyframes fade-in-up {
           0% { opacity: 0; transform: translateY(20px); }
           100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
           animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           opacity: 0;
        }
      `}</style>
    </div>
  );
}