import React from 'react';
import AddressAutocomplete from '@/components/common/AddressAutocomplete/AddressAutocomplete';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/ImagePreviewModal';
import { BaseModal } from '@/components/common/BaseModal/BaseModal';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Badge } from '@/components/common/Badge/Badge';
import { InputField } from '@/components/common/InputField/InputField';
import { API_BASE_URL } from '@/config/api';
import { useToast } from '@/hooks/useToast';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { Check, Plus, ChevronsUp, ChevronsDown, UserPlus } from '@/assets/icons';

interface TeamTabProps {
  employeeForm: any;
  setEmployeeForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  employees: any[];
  onRefreshEmployees?: () => void;
}

export const TeamTab: React.FC<TeamTabProps> = ({ 
  employeeForm, 
  setEmployeeForm, 
  onSubmit, 
  onDelete, 
  onPromote, 
  onDemote, 
  employees,
  onRefreshEmployees 
}) => {
  const [selectedEmp, setSelectedEmp] = React.useState<any>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = React.useState<string>('');
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    type: 'delete' | 'promote' | 'demote' | null;
    employeeId: string;
    title: string;
    description: string;
    confirmText?: string;
    theme?: 'red' | 'blue' | 'green';
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const { type, employeeId } = confirmModal;
    setConfirmModal(null);
    setSelectedEmp(null);

    if (type === 'delete') {
      await onDelete(employeeId);
    } else if (type === 'promote') {
      await onPromote(employeeId);
    } else if (type === 'demote') {
      await onDemote(employeeId);
    }
  };

  const userRole = localStorage.getItem('role');
  const toast = useToast();

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
        const updatedEmp = { ...selectedEmp, allowedSections: newAllowed.join(',') };
        setSelectedEmp(updatedEmp);
      } else {
        toast.error("Error al actualizar permisos");
      }
    } catch (err) {
      console.error("Error updating permissions:", err);
    }
  };

  return (
    <div className="space-y-10 relative">
      {/* PANEL DE DETALLE (MODAL REUTILIZABLE) */}
      <BaseModal
        isOpen={selectedEmp !== null}
        onClose={() => setSelectedEmp(null)}
        title="Perfil del Empleado"
        subtitle={selectedEmp ? `${selectedEmp.firstname} ${selectedEmp.lastname}` : ''}
        theme="red"
      >
        {selectedEmp && (
          <div className="flex flex-col items-center text-center space-y-6 overflow-y-auto pr-1 max-h-[460px] custom-scrollbar">
            <div 
              className={`w-24 h-24 bg-neutral-950 border-2 border-red-600/20 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-2xl overflow-hidden shrink-0 ${selectedEmp.profilePictureUrl ? 'cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-300' : ''}`}
              onClick={selectedEmp.profilePictureUrl ? () => { setPreviewUrl(selectedEmp.profilePictureUrl); setPreviewTitle(`${selectedEmp.firstname} ${selectedEmp.lastname}`); } : undefined}
            >
              {selectedEmp.profilePictureUrl ? (
                <img src={selectedEmp.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                selectedEmp.firstname.charAt(0)
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">{selectedEmp.firstname} {selectedEmp.lastname}</h2>
              <div className="mt-2">
                <Badge variant={selectedEmp.role === 'WORKSHOP_OWNER' ? 'danger' : selectedEmp.role === 'WORKSHOP_MANAGER' ? 'secondary' : 'neutral'}>
                  {selectedEmp.role === 'WORKSHOP_OWNER' ? 'Propietario' : selectedEmp.role === 'WORKSHOP_MANAGER' ? 'Gerente' : 'Mecánico'}
                </Badge>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 gap-4 pt-4">
              <div className="bg-black/40 border border-neutral-800 p-5 rounded-2xl text-left space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Correo Electrónico</p>
                <p className="text-sm font-black text-white selection:bg-red-500">{selectedEmp.email}</p>
              </div>

              <div className="bg-black/40 border border-neutral-800 p-5 rounded-2xl text-left space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Dirección de Residencia</p>
                <p className="text-xs font-semibold text-neutral-300 leading-relaxed">{selectedEmp.address || 'No especificada'}</p>
              </div>

              {/* Permisos de Acceso al Dashboard (Solo Mecánicos, no para Gerentes ni Propietarios) */}
              {selectedEmp.role === 'WORKSHOP_STAFF' && (
                <div className="bg-black/40 border border-neutral-800 p-5 rounded-2xl text-left space-y-3.5 w-full">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Permisos de Acceso al Dashboard</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { value: 'PLANIFICACIÓN', label: 'Planificación' },
                      { value: 'AVISOS', label: 'Avisos' },
                      { value: 'CITAS', label: 'Citas' },
                      { value: 'TAREAS', label: 'Tareas' },
                      { value: 'ALMACÉN', label: 'Almacén' },
                      { value: 'FINALIZADOS', label: 'Finalizados' },
                      { value: 'INFORMES', label: 'Informes' }
                    ].map((tab) => {
                      const allowedString = selectedEmp.allowedSections || '';
                      const currentAllowed = allowedString
                        ? allowedString.split(',').map((s: string) => s.trim()).filter(Boolean)
                        : [];
                      const isAllowed = currentAllowed.includes(tab.value);

                      return (
                        <Button
                          key={tab.value}
                          type="button"
                          onClick={() => handleTogglePermission(selectedEmp.id, currentAllowed, tab.value)}
                          variant={isAllowed ? 'danger' : 'ghost'}
                          className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1 border border-neutral-800/60 rounded-xl h-8 ${
                            isAllowed
                              ? 'bg-red-600/10 border-red-500/30 text-red-400'
                              : 'text-neutral-500 hover:text-white'
                          }`}
                        >
                          {isAllowed ? (
                            <Check className="w-3 h-3 text-red-400 shrink-0" strokeWidth={3} />
                          ) : (
                            <Plus className="w-3 h-3 text-neutral-600 shrink-0" strokeWidth={3} />
                          )}
                          {tab.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col gap-3 mt-6 pt-5 border-t border-neutral-800/60">
              {/* Botón de Ascenso (Solo Dueño y si el empleado es mecánico) */}
              {userRole === 'WORKSHOP_OWNER' && selectedEmp.role === 'WORKSHOP_STAFF' && (
                <Button 
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      type: 'promote',
                      employeeId: selectedEmp.id,
                      title: 'Ascender a Gerente',
                      description: `¿Estás seguro de ascender a ${selectedEmp.firstname} a Gerente? Obtendrá permisos de administración.`,
                      confirmText: 'Sí, Ascender',
                      theme: 'blue'
                    });
                  }}
                  variant="primary"
                  className="w-full h-12 uppercase tracking-widest text-[9px] font-black"
                >
                  <ChevronsUp className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Ascender a Gerente
                </Button>
              )}

              {/* Botón de Degradación (Solo Dueño y si el empleado es Gerente) */}
              {userRole === 'WORKSHOP_OWNER' && selectedEmp.role === 'WORKSHOP_MANAGER' && (
                <Button 
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      type: 'demote',
                      employeeId: selectedEmp.id,
                      title: 'Degradar a Mecánico',
                      description: `¿Seguro que quieres pasar a este Gerente a Mecánico de plantilla? Perderá privilegios de administración.`,
                      confirmText: 'Sí, Degradar',
                      theme: 'red'
                    });
                  }}
                  variant="secondary"
                  className="w-full h-12 uppercase tracking-widest text-[9px] font-black"
                >
                  <ChevronsDown className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Degradar a Mecánico
                </Button>
              )}

              {selectedEmp.role !== 'WORKSHOP_OWNER' && (
                <Button 
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      type: 'delete',
                      employeeId: selectedEmp.id,
                      title: 'Eliminar Empleado',
                      description: `¿Estás seguro de eliminar a ${selectedEmp.firstname}? Se borrará toda su información permanentemente.`,
                      confirmText: 'Sí, Eliminar',
                      theme: 'red'
                    });
                  }}
                  variant="danger"
                  className="w-full h-12 uppercase tracking-widest text-[9px] font-black"
                >
                  Dar de baja permanente
                </Button>
              )}
            </div>
          </div>
        )}
      </BaseModal>

      {/* FORMULARIO DE ALTA (TARJETA GLOBAL Y INPUTS MODULARES) */}
      <Card variant="neutral" padding="lg" className="!rounded-2xl">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3">
          <div className="p-2 bg-red-600/10 rounded-lg">
            <UserPlus className="w-4 h-4 text-red-500" strokeWidth={2.5} />
          </div>
          Añadir Miembro al Equipo
        </h3>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField 
              label="Nombre" 
              required 
              type="text" 
              value={employeeForm.firstname} 
              onChange={e => setEmployeeForm({...employeeForm, firstname: e.target.value})} 
              placeholder="Ej: Juan" 
            />
            <InputField 
              label="Apellidos" 
              required 
              type="text" 
              value={employeeForm.lastname} 
              onChange={e => setEmployeeForm({...employeeForm, lastname: e.target.value})} 
              placeholder="Ej: Pérez" 
            />
            <InputField 
              label="Email Profesional" 
              required 
              type="email" 
              value={employeeForm.email} 
              onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} 
              placeholder="juan@taller.com" 
            />
            <InputField 
              label="Contraseña Inicial" 
              required 
              type="text" 
              value={employeeForm.password} 
              onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} 
              placeholder="Contraseña de acceso" 
            />
            
            <div className="md:col-span-2 space-y-2 mt-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Rango Organizativo</label>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="button" 
                  onClick={() => setEmployeeForm({...employeeForm, role: 'WORKSHOP_STAFF'})}
                  variant={employeeForm.role === 'WORKSHOP_STAFF' ? 'primary' : 'ghost'}
                  className="py-4 font-black uppercase tracking-widest text-xs h-12"
                >
                  Mecánico
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setEmployeeForm({...employeeForm, role: 'WORKSHOP_MANAGER'})}
                  variant={employeeForm.role === 'WORKSHOP_MANAGER' ? 'secondary' : 'ghost'}
                  className="py-4 font-black uppercase tracking-widest text-xs h-12"
                >
                  Gerente / Mánager
                </Button>
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
          <Button 
            type="submit" 
            variant="primary" 
            glow={true} 
            className="w-full md:w-auto px-10 h-12 uppercase tracking-widest text-xs font-black"
          >
            Dar de Alta en Plantilla
          </Button>
        </form>
      </Card>

      {/* PLANTILLA ACTUAL (Tarjetas Limpias) */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
            Miembros de la Plantilla ({employees.length})
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.map(emp => (
            <Card 
              key={emp.id} 
              onClick={() => setSelectedEmp(emp)}
              variant="neutral"
              padding="sm"
              border={false}
              className="group relative transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl overflow-hidden !rounded-2xl"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div 
                    className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-white font-black text-2xl shadow-inner group-hover:scale-105 transition-transform overflow-hidden shrink-0"
                    onClick={emp.profilePictureUrl ? (e) => {
                      e.stopPropagation();
                      setPreviewUrl(emp.profilePictureUrl);
                      setPreviewTitle(`${emp.firstname} ${emp.lastname}`);
                    } : undefined}
                  >
                    {emp.profilePictureUrl ? (
                      <img src={emp.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover cursor-zoom-in" />
                    ) : (
                      emp.firstname.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-black uppercase text-base tracking-widest leading-none mb-2.5">{emp.firstname} {emp.lastname}</h4>
                    <Badge variant={emp.role === 'WORKSHOP_OWNER' ? 'danger' : emp.role === 'WORKSHOP_MANAGER' ? 'secondary' : 'neutral'}>
                      {emp.role === 'WORKSHOP_OWNER' ? 'Propietario' : emp.role === 'WORKSHOP_MANAGER' ? 'Gerente' : 'Mecánico'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-neutral-800/50 space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Contacto</p>
                  <p className="text-xs font-black text-white break-words transition-colors group-hover:text-red-500">{emp.email}</p>
                </div>
                {emp.address && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Localidad</p>
                    <p className="text-[11px] font-bold text-neutral-400 leading-relaxed break-words">{emp.address}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <ImagePreviewModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        imageUrl={previewUrl || ''}
        title={previewTitle}
      />
      {confirmModal && (
        <ConfirmCardModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleConfirmAction}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          theme={confirmModal.theme}
        />
      )}
    </div>
  );
};
