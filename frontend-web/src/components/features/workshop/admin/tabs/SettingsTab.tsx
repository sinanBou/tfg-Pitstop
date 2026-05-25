import React from 'react';
import { API_BASE_URL } from '../../../../../config/api';

interface SettingsTabProps {
  settingsForm: any;
  setSettingsForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  diasSemana: Array<{value: string, label: string}>;
  /** Perfil del empleado autenticado */
  employeeProfile?: any;
  /** Callback para guardar cambios del perfil */
  onProfileUpdate?: (profileData: { firstname: string; lastname: string; address: string }) => void;
  /** Muestra sección de perfil (false para mecánicos) */
  showProfileSection?: boolean;
  /** Muestra sección de taller (false para mecánicos) */
  showWorkshopSection?: boolean;
  /** Muestra sección de taller como solo lectura (true para mecánicos) */
  readOnlyWorkshop?: boolean;
  /** Lista de empleados del taller */
  employees?: any[];
  /** Callback para refrescar la lista de empleados */
  onRefreshEmployees?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ 
  settingsForm, setSettingsForm, onSubmit, diasSemana, 
  employeeProfile, onProfileUpdate, 
  showProfileSection = true, showWorkshopSection = true, readOnlyWorkshop = false,
  employees = [], onRefreshEmployees
}) => {
  const [profileForm, setProfileForm] = React.useState({
    firstname: '',
    lastname: '',
    address: ''
  });
  const [profileSaved, setProfileSaved] = React.useState(false);
  const [mechanicSearchTerm, setMechanicSearchTerm] = React.useState('');

  // Rastreo de valores iniciales para detectar cambios
  const initialSettings = React.useRef<any>(null);
  const initialProfile = React.useRef<any>(null);

  // Captura el estado original de los ajustes del taller
  React.useEffect(() => {
    if (!readOnlyWorkshop && settingsForm && !initialSettings.current) {
      initialSettings.current = JSON.stringify(settingsForm);
    }
  }, [settingsForm, readOnlyWorkshop]);

  // Sincroniza el formulario con el perfil al cargar
  React.useEffect(() => {
    if (employeeProfile) {
      const profile = {
        firstname: employeeProfile.firstname || '',
        lastname: employeeProfile.lastname || '',
        address: employeeProfile.address || ''
      };
      setProfileForm(profile);
      initialProfile.current = JSON.stringify(profile);
    }
  }, [employeeProfile]);

  // Detección de cambios
  const isSettingsDirty = initialSettings.current !== null && JSON.stringify(settingsForm) !== initialSettings.current;
  const isProfileDirty = initialProfile.current !== null && JSON.stringify(profileForm) !== initialProfile.current;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onProfileUpdate) {
      onProfileUpdate(profileForm);
      initialProfile.current = JSON.stringify(profileForm);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleWorkshopSubmit = (e: React.FormEvent) => {
    onSubmit(e);
    initialSettings.current = JSON.stringify(settingsForm);
  };

  const roleLabel = 
    employeeProfile?.role === 'WORKSHOP_OWNER' ? 'Propietario' :
    employeeProfile?.role === 'WORKSHOP_MANAGER' ? 'Gerente' :
    'Mecánico';

  return (
    <div className="space-y-10">
      {/* SECCIÓN 1: AJUSTES DEL TALLER */}
      {showWorkshopSection && (
      <div className="bg-neutral-900/40 border border-neutral-800 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group animate-fade-in-up">
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
        
        {readOnlyWorkshop ? (
          /* Vista solo lectura para mecánicos */
          <div className="relative z-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Apertura</label>
                <div className="bg-black/40 border border-white/5 text-white p-5 rounded-2xl font-mono text-lg font-bold">{settingsForm.openTime || '—'}</div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Cierre</label>
                <div className="bg-black/40 border border-white/5 text-white p-5 rounded-2xl font-mono text-lg font-bold">{settingsForm.closeTime || '—'}</div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Duración Cita (Min)</label>
                <div className="bg-black/40 border border-white/5 text-white p-5 rounded-2xl font-mono text-lg font-bold">{settingsForm.slotDurationMinutes || '—'}</div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Precio Mano de Obra (€/h)</label>
                <div className="bg-black/40 border border-white/5 text-white p-5 rounded-2xl font-mono text-lg font-bold">{settingsForm.hourlyRate || '—'}</div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Días Laborables</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <span 
                    key={dia.value}
                    className={`px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider border ${settingsForm.workingDays.includes(dia.value) ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.25)]' : 'bg-black/40 border-white/5 text-neutral-600'}`}
                  >
                    {dia.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Opción especial de planificación - Solo lectura */}
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-black/40 border border-white/5 rounded-3xl gap-4">
              <div className="space-y-1 text-left">
                <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${settingsForm.includeOwnerInPlanning ? "bg-red-500 animate-pulse" : "bg-neutral-600"}`}></span>
                  Propietario en la Planificación
                </h4>
                <p className="text-neutral-500 text-xs font-medium">
                  Configuración sobre si el propietario del taller se incorpora a la agenda de planificación general y recibe asignaciones.
                </p>
              </div>
              <div className="flex items-center">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${settingsForm.includeOwnerInPlanning ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-neutral-800 text-neutral-500"}`}>
                  {settingsForm.includeOwnerInPlanning ? "Activado" : "Desactivado"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Formulario editable para Owner/Manager */
          <form onSubmit={handleWorkshopSubmit} className="relative z-10 space-y-10">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Apertura</label>
                  <input type="time" value={settingsForm.openTime} onChange={e => setSettingsForm({...settingsForm, openTime: e.target.value})} style={{ colorScheme: 'dark' }} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Hora Cierre</label>
                  <input type="time" value={settingsForm.closeTime} onChange={e => setSettingsForm({...settingsForm, closeTime: e.target.value})} style={{ colorScheme: 'dark' }} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Duración Cita (Min)</label>
                  <input type="number" value={settingsForm.slotDurationMinutes} onChange={e => setSettingsForm({...settingsForm, slotDurationMinutes: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Precio Mano de Obra (€/h)</label>
                  <input type="number" step="0.01" value={settingsForm.hourlyRate} onChange={e => setSettingsForm({...settingsForm, hourlyRate: e.target.value})} className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all font-mono text-lg font-bold" />
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
                        const workingDays = settingsForm.workingDays.includes(dia.value)
                          ? settingsForm.workingDays.filter((d:any) => d !== dia.value)
                          : [...settingsForm.workingDays, dia.value];
                        setSettingsForm({ ...settingsForm, workingDays });
                      }}
                      className={`px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${settingsForm.workingDays.includes(dia.value) ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.25)]' : 'bg-black/40 border-white/5 hover:border-white/10 text-neutral-500 hover:text-white'}`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opción especial de planificación */}
              <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-black/40 border border-white/5 rounded-3xl gap-4">
                <div className="space-y-1 text-left">
                  <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    Añadir Dueño a la Planificación
                  </h4>
                  <p className="text-neutral-500 text-xs font-medium">
                    Si se activa esta opción, el propietario del taller se incorporará a la agenda de planificación general y se le podrán asignar citas y tareas igual que al resto de trabajadores.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, includeOwnerInPlanning: !settingsForm.includeOwnerInPlanning })}
                  className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                    settingsForm.includeOwnerInPlanning ? "bg-red-600" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                      settingsForm.includeOwnerInPlanning ? "translate-x-9" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={!isSettingsDirty}
                className={`w-full md:w-auto px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group active:scale-[0.98] ${
                  isSettingsDirty 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] cursor-pointer' 
                    : 'bg-neutral-800/50 text-neutral-600 cursor-not-allowed shadow-none'
                }`}
              >
                Guardar Cambios
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </form>
        )}
      </div>
      )}

      {/* SECCIÓN 2: AJUSTES DEL PERFIL (Solo Owner/Manager) */}
      {showProfileSection && employeeProfile && (
        <div className="bg-neutral-900/40 border border-neutral-800 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group animate-fade-in-up">
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] -z-10 group-hover:bg-red-600/10 transition-all duration-700 pointer-events-none"></div>

          <header className="mb-12 relative z-10 border-b border-white/5 pb-8">
            <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Datos Personales
            </p>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">
              Ajustes del Perfil
            </h3>
          </header>

          <form onSubmit={handleProfileSubmit} className="relative z-10 space-y-10">
            {/* Cabecera de identidad */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-8 border-b border-white/5">
              <div className="w-24 h-24 bg-neutral-950 border border-neutral-800 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shrink-0">
                {profileForm.firstname.charAt(0) || '?'}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-black text-white">{profileForm.firstname} {profileForm.lastname}</h4>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 ${
                  employeeProfile.role === 'WORKSHOP_OWNER' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  employeeProfile.role === 'WORKSHOP_MANAGER' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {roleLabel}
                </span>
                <p className="text-neutral-500 text-xs mt-2 font-mono">{employeeProfile.email}</p>
              </div>
            </div>

            {/* Campos editables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Nombre</label>
                <input 
                  type="text" 
                  required
                  value={profileForm.firstname} 
                  onChange={e => setProfileForm({...profileForm, firstname: e.target.value})}
                  className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all text-lg font-bold" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Apellido</label>
                <input 
                  type="text" 
                  required
                  value={profileForm.lastname} 
                  onChange={e => setProfileForm({...profileForm, lastname: e.target.value})}
                  className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all text-lg font-bold" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-2">Dirección</label>
              <input 
                type="text" 
                value={profileForm.address} 
                onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                placeholder="Introduce tu dirección de residencia..."
                className="bg-black/40 border border-white/5 hover:border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all text-lg font-bold placeholder:text-neutral-700" 
              />
            </div>

            <div className="pt-4 flex justify-end items-center gap-4">
              {profileSaved && (
                <span className="text-green-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Perfil actualizado
                </span>
              )}
              <button 
                type="submit" 
                disabled={!isProfileDirty}
                className={`w-full md:w-auto px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group active:scale-[0.98] ${
                  isProfileDirty 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] cursor-pointer' 
                    : 'bg-neutral-800/50 text-neutral-600 cursor-not-allowed shadow-none'
                }`}
              >
                Guardar Perfil
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECCIÓN 3: PERMISOS DE MECÁNICOS (Solo para Propietarios y Gerentes) */}
      {(employeeProfile?.role === 'WORKSHOP_OWNER' || employeeProfile?.role === 'WORKSHOP_MANAGER') && (
        <div className="bg-neutral-900/40 border border-neutral-800 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group animate-fade-in-up">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] -z-10 group-hover:bg-red-600/10 transition-all duration-700 pointer-events-none"></div>

          <header className="mb-12 relative z-10 border-b border-white/5 pb-8">
            <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Control de Accesos
            </p>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">
              Permisos de Mecánicos
            </h3>
          </header>

          {/* Barra de búsqueda de mecánicos */}
          <div className="relative z-10 mb-8 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={mechanicSearchTerm}
                onChange={(e) => setMechanicSearchTerm(e.target.value)}
                placeholder="Buscar mecánico por nombre o email..."
                className="w-full h-[52px] bg-black/40 hover:bg-black/60 focus:bg-black/80 border border-neutral-800 focus:border-red-500 rounded-2xl pl-12 pr-10 text-white text-xs font-medium tracking-wide focus:outline-none transition-all duration-300 placeholder:text-neutral-500"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              {mechanicSearchTerm && (
                <button
                  type="button"
                  onClick={() => setMechanicSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            {(() => {
              const allMechanics = (employees || []).filter((e: any) => e.role === 'WORKSHOP_STAFF');
              if (allMechanics.length === 0) {
                return (
                  <div className="py-12 text-center bg-black/20 border border-dashed border-neutral-800 rounded-3xl">
                    <p className="text-neutral-500 text-sm uppercase tracking-widest font-black">No hay mecánicos registrados en el taller</p>
                  </div>
                );
              }

              const filteredMechanics = allMechanics.filter((emp: any) => {
                const term = mechanicSearchTerm.toLowerCase().trim();
                if (!term) return true;
                const fullName = `${emp.firstname} ${emp.lastname}`.toLowerCase();
                const email = (emp.email || '').toLowerCase();
                return fullName.includes(term) || email.includes(term);
              });

              if (filteredMechanics.length === 0) {
                return (
                  <div className="py-12 text-center bg-black/20 border border-dashed border-neutral-800 rounded-3xl">
                    <p className="text-neutral-500 text-sm uppercase tracking-widest font-black">
                      No se encontraron mecánicos que coincidan con "{mechanicSearchTerm}"
                    </p>
                  </div>
                );
              }

              const TABS_DISPONIBLES = [
                { value: 'PLANIFICACIÓN', label: 'Planificación' },
                { value: 'AVISOS', label: 'Avisos' },
                { value: 'CITAS', label: 'Citas' },
                { value: 'TAREAS', label: 'Tareas' },
                { value: 'ALMACÉN', label: 'Almacén' },
                { value: 'FACTURAS', label: 'Facturas' }
              ];

              const handleTogglePermission = async (empId: string, currentAllowed: string[], tabValue: string) => {
                let newAllowed: string[];
                if (currentAllowed.includes(tabValue)) {
                  newAllowed = currentAllowed.filter(t => t !== tabValue);
                } else {
                  newAllowed = [...currentAllowed, tabValue];
                }
                
                const token = localStorage.getItem('jwt_token');
                try {
                  const res = await fetch(`${API_BASE_URL}/employees/${empId}/allowed-sections?allowedSections=${newAllowed.join(',')}`, {
                    method: 'PUT',
                    headers: { 
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  if (res.ok) {
                    if (onRefreshEmployees) onRefreshEmployees();
                  } else {
                    alert("Error al actualizar permisos");
                  }
                } catch (err) {
                  console.error("Error updating permissions:", err);
                }
              };

              return (
                <div className="grid grid-cols-1 gap-8">
                  {filteredMechanics.map((emp: any) => {
                    const allowedString = emp.allowedSections;
                    const currentAllowed = allowedString 
                      ? allowedString.split(',').map((s: string) => s.trim()).filter(Boolean)
                      : [];

                    return (
                      <div 
                        key={emp.id} 
                        className="bg-black/30 border border-neutral-800/80 p-6 md:p-8 rounded-3xl hover:border-neutral-700/80 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        {/* Identidad del Mecánico */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-600/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center font-black text-lg">
                            {emp.firstname.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white">{emp.firstname} {emp.lastname}</h4>
                            <p className="text-neutral-500 text-xs font-mono">{emp.email}</p>
                          </div>
                        </div>

                        {/* Selector de Pestañas Habilitadas */}
                        <div className="flex-1 flex flex-wrap gap-2 lg:justify-end">
                          {TABS_DISPONIBLES.map(tab => {
                            const isAllowed = currentAllowed.includes(tab.value);
                            return (
                              <button
                                type="button"
                                key={tab.value}
                                onClick={() => handleTogglePermission(emp.id, currentAllowed, tab.value)}
                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border ${
                                  isAllowed
                                    ? 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700'
                                }`}
                              >
                                {isAllowed ? (
                                  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <svg className="w-3 h-3 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                )}
                                {tab.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

