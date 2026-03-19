import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BottomNav } from '../components/dashboard/BottomNav';
import { API_BASE_URL } from '../config/api';

const SECCIONES = ['RESUMEN', 'CITAS', 'AJUSTES', 'EQUIPO', 'FINANZAS'];

const diasSemana = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

export default function WorkshopAdminDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const [loading, setLoading] = useState(true);
  const [workshopData, setWorkshopData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [settingsForm, setSettingsForm] = useState({
    openTime: '',
    closeTime: '',
    slotDurationMinutes: '',
    workingDays: [] as string[]
  });

  const [employeeForm, setEmployeeForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'WORKSHOP_STAFF'
  });

  useEffect(() => {
    fetchWorkshopData();
  }, [id]);

  const fetchWorkshopData = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`${API_BASE_URL}/workshops/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setWorkshopData(data);

        let parsedDays: string[] = [];
        if (!data.workingDays || data.workingDays === 'LUNES-VIERNES') {
           parsedDays = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
        } else {
           parsedDays = data.workingDays.split(',').map((d: string) => d.trim()).filter(Boolean);
        }

        setSettingsForm({
          openTime: data.openTime || '09:00',
          closeTime: data.closeTime || '18:00',
          slotDurationMinutes: data.slotDurationMinutes || '30',
          workingDays: parsedDays
        });
      }

      // Fetch appointments for this workshop
      const appRes = await fetch(`${API_BASE_URL}/appointments/workshop/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(appRes.ok) {
        const appData = await appRes.json();
        setAppointments(appData);
      }

      // Fetch employees for this workshop
      const empRes = await fetch(`${API_BASE_URL}/employees/workshop/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsForm.workingDays.length === 0) {
      alert("Debes seleccionar al menos un día de trabajo");
      return;
    }
    const token = localStorage.getItem('jwt_token');
    
    try {
      const submitData = {
        ...settingsForm,
        workingDays: settingsForm.workingDays.join(',')
      };

      const res = await fetch(`${API_BASE_URL}/workshops/${id}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      if(res.ok) {
        alert("Ajustes actualizados correctamente");
        fetchWorkshopData();
      }
    } catch (e) {
      alert("Error actualizando ajustes");
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/employees/workshop/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeForm)
      });
      if (res.ok) {
        setEmployeeForm({ firstname: '', lastname: '', email: '', password: '', role: 'WORKSHOP_STAFF' });
        fetchWorkshopData();
      } else {
        const errObj = await res.text();
        alert("Error al añadir empleado: " + errObj);
      }
    } catch (e) {
      alert("Error de conexión al añadir empleado");
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black">CARGANDO TALLER...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black relative selection:bg-red-500/30 selection:text-white pb-24">
      
      {/* Fondo Glow Animado Global */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neutral-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-[pulse_4s_infinite] pointer-events-none"></div>

      {/* Top Header */}
      <DashboardHeader type="workshop" />

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 scrollbar-hide">
         <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
            
            <header className="flex justify-between items-end border-b border-neutral-800/60 pb-6 mb-8 relative z-50">
               <div>
                  {/* Boton para volver al listado de talleres */}
                  <button 
                     onClick={() => {
                        const role = localStorage.getItem('role');
                        if (role === 'WORKSHOP_MANAGER') {
                          navigate('/worker-dashboard');
                        } else {
                          navigate('/owner-dashboard');
                        }
                     }} 
                     className="text-neutral-500 hover:text-white mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                     Volver al Panel Principal
                  </button>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                     {SECCIONES[activeTab]}
                  </h1>
               </div>

               {activeTab === 1 && (
                  <div className="flex items-center gap-2 bg-neutral-900/40 p-2 rounded-2xl border border-neutral-800">
                     <button onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() - 1);
                        setSelectedDate(d);
                        setViewDate(d);
                     }} className="p-3 bg-black/40 hover:bg-red-500/20 text-neutral-400 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/30">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>
                     
                     <div className="relative">
                        <button onClick={() => setShowCalendar(!showCalendar)} className="flex flex-col items-center px-2 min-w-[100px] hover:bg-white/5 py-2 rounded-xl transition-colors">
                           <span className="text-white font-black uppercase tracking-widest text-sm text-center">
                              {selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')}
                           </span>
                           <span className="text-[9px] font-mono text-neutral-500 uppercase mt-0.5 tracking-widest">Cambiar Fecha</span>
                        </button>
                        
                        {/* CALENDAR SCRIPT */}
                        {showCalendar && (() => {
                           const year = viewDate.getFullYear();
                           const month = viewDate.getMonth();
                           const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                           const daysOfWeek = ["L", "M", "X", "J", "V", "S", "D"];
                           const daysInMonth = new Date(year, month + 1, 0).getDate();
                           const firstDayIndex = new Date(year, month, 1).getDay();
                           const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
                           const today = new Date();
                           today.setHours(0,0,0,0);

                           return (
                              <div className="absolute top-[calc(100%+16px)] right-1/2 translate-x-1/2 w-[300px] bg-neutral-950 border border-neutral-800 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95">
                                 <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white italic">
                                       {monthNames[month]} <span className="text-red-600">{year}</span>
                                    </h3>
                                    <div className="flex gap-1">
                                       <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                       </button>
                                       <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                       </button>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-7 gap-1 mb-2">
                                    {daysOfWeek.map(d => (
                                       <div key={d} className="text-center text-[10px] font-black text-neutral-500 py-1">{d}</div>
                                    ))}
                                 </div>
                                 <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: startingDay }).map((_, i) => (
                                       <div key={`empty-${i}`} className="aspect-square" />
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                       const day = i + 1;
                                       const cellDate = new Date(year, month, day);
                                       cellDate.setHours(0,0,0,0);
                                       const isSelected = selectedDate.getTime() === cellDate.getTime();
                                       const isPast = cellDate < today;

                                       return (
                                          <button
                                             key={day}
                                             onClick={() => {
                                                setSelectedDate(cellDate);
                                                setShowCalendar(false);
                                             }}
                                             className={`
                                                aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center
                                                ${isSelected ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 
                                                  isPast ? 'bg-transparent text-neutral-700 hover:bg-neutral-900/50 hover:text-neutral-500' :
                                                  'bg-neutral-900/50 border border-neutral-800 text-neutral-300 hover:border-red-500/50 hover:text-white'}
                                             `}
                                          >
                                             {day}
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>
                           );
                        })()}
                     </div>

                     <button onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() + 1);
                        setSelectedDate(d);
                        setViewDate(d);
                     }} className="p-3 bg-black/40 hover:bg-red-500/20 text-neutral-400 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/30">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                     </button>
                  </div>
               )}
            </header>

            {activeTab === 0 && (
               <div className="space-y-6">
                  <div className="bg-neutral-900/40 border border-neutral-800 p-8 md:p-10 rounded-[2rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[80px] -z-10 mix-blend-screen group-hover:bg-red-600/20 transition-all duration-700 pointer-events-none"></div>
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                        <div>
                           <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                              Panel Dinámico
                           </p>
                           <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500 mb-3">{workshopData?.companyName}</h2>
                           <p className="text-neutral-400 font-mono flex items-center gap-2">
                              <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {workshopData?.address}
                           </p>
                        </div>
                        <div className="bg-black/40 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                           <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Identificador Fiscal</span>
                           <span className="text-white font-mono font-bold tracking-[0.1em]">{workshopData?.cif}</span>
                        </div>
                     </div>
                  </div>
                     
                  {/* METRICS GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                     
                     {/* PRIMARY METRIC: COCHES */}
                     <div className="lg:col-span-1 bg-gradient-to-br from-red-600/20 to-black/40 border border-red-500/30 p-8 rounded-[2rem] hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] transition-all relative overflow-hidden group">
                        <div className="absolute -bottom-6 -right-6 text-red-500/10 group-hover:text-red-500/20 transition-colors">
                           <svg className="w-48 h-48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                           <div>
                              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-red-500 mb-2">Taller Activo</p>
                              <p className="text-6xl font-black text-white tracking-tighter drop-shadow-md">{workshopData?.vehiclesCurrentCount || 0}</p>
                           </div>
                           <div className="mt-8">
                              <p className="text-sm font-bold text-white tracking-widest uppercase">Vehículos</p>
                              <p className="text-[10px] text-red-400 font-mono mt-1">OPERACIONES EN CURSO</p>
                           </div>
                        </div>
                     </div>

                     {/* SECONDARY METRICS */}
                     <div className="lg:col-span-3 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* EMPLEADOS */}
                           <div className="bg-neutral-900/40 border border-white/5 hover:border-white/10 p-6 rounded-[2rem] transition-all flex flex-col justify-between group">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 text-neutral-400 flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                              </div>
                              <div>
                                 <p className="text-4xl font-black text-white">{workshopData?.totalEmployees || 0}</p>
                                 <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mt-2">Plantilla Registrada</p>
                              </div>
                           </div>

                           {/* HORARIO */}
                           <div className="bg-neutral-900/40 border border-white/5 hover:border-white/10 p-6 rounded-[2rem] transition-all flex flex-col justify-between group">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 text-neutral-400 flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <div>
                                 <p className="text-2xl font-black text-white font-mono tracking-tight">{workshopData?.openTime?.slice(0,5) || '--'} <span className="text-neutral-600 font-sans text-sm mx-1">a</span> {workshopData?.closeTime?.slice(0,5) || '--'}</p>
                                 <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mt-2">Horario Apertura</p>
                              </div>
                           </div>
                        </div>

                        {/* DÍAS LABORABLES */}
                        <div className="bg-neutral-900/40 border border-white/5 hover:border-white/10 p-6 md:p-8 rounded-[2rem] transition-all group">
                           <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-white/5 text-neutral-400 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                              <p className="text-xs uppercase font-bold tracking-widest text-neutral-500">Días Laborables</p>
                           </div>
                           
                           <div className="flex flex-wrap gap-2">
                              {(() => {
                                 const daysStr = workshopData?.workingDays || '';
                                 const daysArr = daysStr === 'LUNES-VIERNES' 
                                    ? ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] 
                                    : daysStr.split(/[,-]/).map((d: string) => d.trim()).filter(Boolean);
                                 
                                 return diasSemana.map((dia) => {
                                    const isWorkingDay = daysArr.includes(dia.value);
                                    return (
                                       <div 
                                          key={dia.value} 
                                          className={`px-4 lg:px-5 py-4 flex-grow text-center rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-wider transition-all border ${
                                             isWorkingDay 
                                                ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.25)]' 
                                                : 'bg-black/40 border-white/5 text-neutral-500/40'
                                          }`}
                                       >
                                          {dia.label}
                                       </div>
                                    );
                                 });
                              })()}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
            
            {activeTab === 1 && (() => {
               // FILTRAMOS LAS CITAS POR EL DÍA SELECCIONADO
               const filteredAppointments = appointments.filter(app => {
                  const appDate = new Date(app.dateTime);
                  return appDate.getFullYear() === selectedDate.getFullYear() &&
                         appDate.getMonth() === selectedDate.getMonth() &&
                         appDate.getDate() === selectedDate.getDate();
               });

               return (
               <div className="space-y-6">
                  {/* Se ha eliminado el H3 de agenda de citas conforme a la peticion */}
                  
                  {filteredAppointments.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {filteredAppointments.map((app, index) => (
                           <div key={app.id} className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] hover:border-red-500/40 transition-colors shadow-lg relative group overflow-hidden flex flex-col">
                              {/* Background Glow */}
                              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                                 <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                              <div className="relative z-10">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 font-black shrink-0">
                                       {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-black text-white uppercase tracking-wider">{app.serviceType}</h4>
                                       <p className="text-xs text-red-400 font-mono font-bold">
                                          {new Date(app.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(app.dateTime).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '-')}
                                       </p>
                                    </div>
                                 </div>
                                 
                                 <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3 mb-4 flex-1">
                                    <div className="flex items-start gap-2 text-neutral-400">
                                       <svg className="w-4 h-4 shrink-0 mt-0.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                       <p className="text-xs font-medium truncate">{app.clientFullName}</p>
                                    </div>
                                    <div className="flex items-start gap-2 text-neutral-400">
                                       <svg className="w-4 h-4 shrink-0 mt-0.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                       <p className="text-xs font-mono font-bold truncate">{app.vehicleDisplay}</p>
                                    </div>
                                 </div>
                                 <div className="text-xs text-neutral-500 line-clamp-2 h-8">"{app.description}"</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="border border-dashed border-neutral-800 bg-neutral-900/20 rounded-[2rem] p-12 text-center opacity-50 animate-in fade-in">
                        <svg className="w-12 h-12 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">No hay citas programadas para el día {selectedDate.toLocaleDateString()}</p>
                     </div>
                  )}
               </div>
               );
            })()}

            {activeTab === 2 && (
               <div className="bg-neutral-900/40 border border-neutral-800 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group animate-fade-in-up">
                  {/* Glow effect */}
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] -z-10 group-hover:bg-red-600/10 transition-all duration-700 pointer-events-none"></div>

                  <header className="mb-12 relative z-10 border-b border-white/5 pb-8">
                     <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Configuración de Operativa
                     </p>
                     <h3 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">
                        Ajustes del Taller
                     </h3>
                  </header>
                  
                  <form onSubmit={handleSettingsSubmit} className="relative z-10 space-y-10">
                     <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Apertura</label>
                              <input type="time" value={settingsForm.openTime} onChange={e => setSettingsForm({...settingsForm, openTime: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Cierre</label>
                              <input type="time" value={settingsForm.closeTime} onChange={e => setSettingsForm({...settingsForm, closeTime: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Duración Cita (Min)</label>
                              <input type="number" value={settingsForm.slotDurationMinutes} onChange={e => setSettingsForm({...settingsForm, slotDurationMinutes: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
                           </div>
                        </div>
                        <div className="flex flex-col gap-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Días Laborables</label>
                           <div className="flex flex-wrap gap-2">
                              {diasSemana.map(dia => (
                                 <button 
                                    type="button" 
                                    key={dia.value}
                                    onClick={() => {
                                       setSettingsForm(prev => {
                                          const workingDays = prev.workingDays.includes(dia.value)
                                             ? prev.workingDays.filter(d => d !== dia.value)
                                             : [...prev.workingDays, dia.value];
                                          return { ...prev, workingDays };
                                       });
                                    }}
                                    className={`px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${settingsForm.workingDays.includes(dia.value) ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.25)]' : 'bg-black/40 border-white/5 hover:border-white/10 text-neutral-500 hover:text-white'}`}
                                 >
                                    {dia.label}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="pt-4 flex justify-end">
                        <button type="submit" className="w-full md:w-auto px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3 group active:scale-[0.98]">
                           Guardar Cambios
                           <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                     </div>
                  </form>
               </div>
            )}
            
            {activeTab === 3 && (
               <div className="space-y-6">
                  <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2rem]">
                     <h3 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Añadir Nuevo Empleado
                     </h3>
                     
                     <form onSubmit={handleEmployeeSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Nombre</label>
                              <input required type="text" value={employeeForm.firstname} onChange={e => setEmployeeForm({...employeeForm, firstname: e.target.value})} className="bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Nombre del empleado" />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Apellidos</label>
                              <input required type="text" value={employeeForm.lastname} onChange={e => setEmployeeForm({...employeeForm, lastname: e.target.value})} className="bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Apellidos" />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Correo Electrónico</label>
                              <input required type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none font-mono" placeholder="correo@talleres.com" />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Contraseña Temporal</label>
                              <input required type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none font-mono" placeholder="••••••••" />
                           </div>
                           <div className="flex flex-col gap-2 md:col-span-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Rol del Empleado</label>
                              <select required value={employeeForm.role} onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})} className="bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none appearance-none">
                                 <option value="WORKSHOP_STAFF">MECÁNICO (Staff Regular)</option>
                                 <option value="WORKSHOP_MANAGER">ENCARGADO (Mánager)</option>
                              </select>
                           </div>
                        </div>
                        <button type="submit" className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                           Registrar Empleado
                        </button>
                     </form>
                  </div>
                  
                  {/* Lista de Empleados Actuales */}
                  <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2rem]">
                     <h3 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Plantilla Actual
                     </h3>
                     
                     {employees.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {employees.map(emp => (
                              <div key={emp.id} className="bg-black/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4 group">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black shrink-0 ${emp.role === 'WORKSHOP_MANAGER' || emp.role === 'WORKSHOP_OWNER' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {emp.firstname.charAt(0)}{emp.lastname.charAt(0)}
                                 </div>
                                 <div className="overflow-hidden">
                                    <h4 className="text-sm font-black text-white uppercase truncate">{emp.firstname} {emp.lastname}</h4>
                                    <p className="text-[10px] text-neutral-500 font-mono truncate">{emp.email}</p>
                                    <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${emp.role === 'WORKSHOP_MANAGER' || emp.role === 'WORKSHOP_OWNER' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                                       {emp.role === 'WORKSHOP_STAFF' ? 'Mecánico' : emp.role === 'WORKSHOP_OWNER' ? 'Dueño' : 'Encargado'}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">Aún no hay empleados registrados en este taller.</p>
                     )}
                  </div>
               </div>
            )}
            
            {activeTab === 4 && (
               <div className="border border-dashed border-neutral-800 bg-neutral-900/20 rounded-[2rem] p-12 text-center overflow-hidden relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 blur-[100px] rounded-full"></div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">Analítica Financiera</h3>
                  <p className="text-neutral-500 font-medium text-sm">Panel de contabilidad para exportación de excel en desarrollo.</p>
               </div>
            )}
            
         </div>
      </main>

      {/* --- FLOATING BOTTOM NAV --- */}
      <BottomNav tabs={SECCIONES} activeTab={activeTab} onTabChange={setActiveTab} theme="workshop" />

    </div>
  );
}
