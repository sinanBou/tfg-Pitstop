import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:9091/api';

// Iconos
const PlusIcon = () => (
  <svg className="w-12 h-12 text-neutral-600 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-black italic tracking-widest animate-pulse uppercase text-xs">Sincronizando taller...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black">
      
      {/* HEADER */}
      <header className="mt-4 mx-6 p-6 border border-white/10 rounded-3xl flex justify-between items-center bg-black/20 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Dashboard <span className="text-red-600">Owner</span>
          </h1>
          <p className="text-[10px] font-mono tracking-[0.3em] text-neutral-500 uppercase mt-1">Gestión Central de Operaciones</p>
        </div>
        <button 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 hover:text-white hover:border-red-500 transition-all uppercase text-[10px] font-black tracking-widest flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Desconectar
        </button>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {/* SECCIÓN DE TALLERES */}
        <div className="mb-12">
           <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 bg-red-600 rounded-full"></div>
              <h2 className="text-xl font-black uppercase italic tracking-wider">Mis Talleres</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((workshop: any) => (
                <div key={workshop.id} className="bg-neutral-900/50 border border-red-900/30 p-8 rounded-[2.5rem] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <WorkshopIcon />
                   </div>
                   <h3 className="text-2xl font-black uppercase text-white mb-2">{workshop.companyName}</h3>
                   <div className="space-y-2 mb-6">
                      <p className="text-xs text-neutral-400 flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {workshop.address}
                      </p>
                      <p className="text-xs text-neutral-400 flex items-center gap-2 font-mono">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        CIF: {workshop.cif}
                      </p>
                   </div>
                   <button className="w-full py-3 bg-red-600/10 border border-red-600/30 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                      Gestionar Taller
                   </button>
                </div>
              ))}
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-neutral-900/30 border-2 border-dashed border-neutral-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-red-600/50 hover:bg-red-600/5 transition-all group min-h-[250px]"
              >
                <PlusIcon />
                <div className="text-center">
                  <span className="block text-sm font-black uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">Añadir Taller</span>
                  <span className="block text-[10px] font-mono text-neutral-600 mt-1 uppercase tracking-tighter">Expande tu negocio</span>
                </div>
              </button>
           </div>
        </div>

      </main>

      {/* MODAL DE CREACIÓN (Similar al del cliente) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-neutral-950 border border-neutral-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
             <div className="flex flex-col h-full max-h-[90vh]">
                
                <header className="p-8 border-b border-neutral-900 flex justify-between items-center">
                   <div>
                      <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Configuración Inicial</p>
                      <h3 className="text-2xl font-black uppercase italic text-white leading-none">Nuevo Taller</h3>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-3 bg-neutral-900 text-neutral-500 hover:text-white rounded-2xl transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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

      {/* ESTILOS INLINE PARA CUSTOM SCROLLBAR */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}