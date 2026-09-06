import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getBrandLogo } from '@/assets/BrandLogos';
import { Search, Check, Upload, Clock, FileText } from '@/assets/icons';
import { Card } from '@/components/common/Card/Card';
import { InputField } from '@/components/common/InputField/InputField';
import { Button } from '@/components/common/Button/Button';
import { useToast } from '@/hooks/useToast';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { useTranslation } from '@/i18n';

interface ConfirmedAppointmentsListProps {
  appointments: any[];
  onDeleteAppointment: (id: string) => Promise<boolean | void>;
  onCheckInAppointment?: (id: string, kilometers: number, notes: string) => Promise<boolean>;
  onUpdateStatus?: (id: string, status: string) => Promise<boolean | void>;
}

const extractLicensePlate = (text: string) => {
  if (!text) return null;
  const match = text.match(/\b([0-9]{4}\s?[- ]?[A-Z]{3}|[A-Z]{1,2}\s?[- ]?[0-9]{4}\s?[- ]?[A-Z]{1,2})\b/i);
  return match ? match[0].toUpperCase().replace(/\s+/g, '-') : null;
};

export const ConfirmedAppointmentsList = ({ 
  appointments, 
  onDeleteAppointment,
  onCheckInAppointment,
  onUpdateStatus
}: ConfirmedAppointmentsListProps) => {
  const { t, language } = useTranslation();
  const [confirmedSearch, setConfirmedSearch] = useState('');
  const toast = useToast();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [kilometers, setKilometers] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'delay' | null;
    appId: string | null;
    title: string;
    description: string;
    confirmText?: string;
    theme?: 'red' | 'blue' | 'green' | 'amber';
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmModal || !confirmModal.appId) return;
    const { type, appId } = confirmModal;
    setConfirmModal(null);

    if (type === 'cancel') {
      try {
        if (onUpdateStatus) {
          await onUpdateStatus(appId, 'CANCELLED');
        } else {
          await onDeleteAppointment(appId);
        }
      } catch (err) {
        console.error("Error al cancelar la cita:", err);
        toast.error("No se pudo cancelar la cita. Puede que esté en un estado que no permite la cancelación.");
      }
    } else if (type === 'delay' && onUpdateStatus) {
      await onUpdateStatus(appId, 'DELAYED');
    }
  };

  // All confirmed, in progress or delayed appointments with optional search
  const confirmedAppointments = useMemo(() => {
    const confirmed = appointments.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS' || a.status === 'DELAYED');
    if (!confirmedSearch.trim()) return confirmed;
    
    const search = confirmedSearch.toLowerCase();
    return confirmed.filter((a: any) => 
      (a.vehicleDisplay && a.vehicleDisplay.toLowerCase().includes(search)) ||
      (a.serviceType && a.serviceType.toLowerCase().includes(search)) ||
      (a.description && a.description.toLowerCase().includes(search))
    );
  }, [appointments, confirmedSearch]);

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'cancel',
      appId: id,
      title: t('citasTab.cancelModalTitle'),
      description: t('citasTab.cancelModalDesc'),
      confirmText: t('citasTab.cancelModalConfirm'),
      theme: 'red'
    });
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !onCheckInAppointment) return;

    const kmNum = parseInt(kilometers, 10);
    if (isNaN(kmNum) || kmNum < 0) {
      toast.warning("Por favor, introduce un número de kilómetros válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onCheckInAppointment(selectedAppId, kmNum, notes);
      if (success) {
        setIsModalOpen(false);
        setSelectedAppId(null);
        setKilometers('');
        setNotes('');
      } else {
        toast.error("Ocurrió un error al procesar la recepción.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAppointmentDetails = useMemo(() => {
    return appointments.find(a => a.id === selectedAppId);
  }, [appointments, selectedAppId]);

  if (confirmedAppointments.length === 0 && !confirmedSearch.trim()) {
    return null; // Ocultar si no hay citas y no se está buscando
  }

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
          {t('citasTab.confirmedTitle')}
          <span className="bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 px-2 py-0.5 rounded-full text-[10px]">{confirmedAppointments.length}</span>
        </h3>
        
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder={t('citasTab.searchPlaceholder')}
            value={confirmedSearch}
            onChange={(e) => setConfirmedSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 dark:text-neutral-600 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {confirmedAppointments.map((app: any) => {
          const plate = extractLicensePlate(app.vehicleDisplay || '');
          return (
            <Card 
              key={app.id} 
              variant="neutral" 
              border={false} 
              padding="none" 
              rounded="2xl" 
              className="bg-white dark:bg-neutral-900/40 p-5 border border-slate-200 dark:border-neutral-800/80 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]"
            >
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">{app.serviceType}</span>
                    {plate && (
                      <div className="inline-flex items-stretch border border-slate-300 dark:border-neutral-700 rounded overflow-hidden shadow-xs text-[9px] font-mono font-black h-4.5">
                        <div className="bg-blue-600 text-white px-1 flex items-center justify-center text-[7px] font-sans font-black">
                          E
                        </div>
                        <div className="bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 px-1.5 flex items-center tracking-wider">
                          {plate}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {app.status === 'IN_PROGRESS' && (
                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-blue-500/20">{t('citasTab.inCourseBadge')}</span>
                    )}
                    {app.status === 'DELAYED' && (
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-500/20 animate-pulse">{t('citasTab.delayedBadge')}</span>
                    )}
                    {app.vehicleReceived && (
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">{t('citasTab.inWorkshopBadge')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 mb-1">
                  <div className="w-7 h-7 bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all [&_svg]:w-4.5 [&_svg]:h-4.5 [&_div]:w-4.5 [&_div]:text-[8px] flex-shrink-0">
                    {getBrandLogo(app.vehicleDisplay ? app.vehicleDisplay.split(' ')[0] : '')}
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white leading-tight">{app.vehicleDisplay}</div>
                </div>
              {app.clientFullName && (
                <div className="text-slate-500 dark:text-neutral-400 text-xs font-bold mt-0.5">{t('avisosTab.clientLabel')}: <span className="text-slate-800 dark:text-neutral-200">{app.clientFullName}</span></div>
              )}
              <div className="text-slate-500 dark:text-neutral-400 text-xs font-mono mt-2 mb-2">
                {new Date(app.dateTime).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: '2-digit' })}{' '}
                {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}{' '}
                h
              </div>

              {/* Información de Recepción */}
              {app.vehicleReceived ? (
                <div className="mt-3 p-3 bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-[9px] uppercase tracking-widest">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    {t('citasTab.vehicleReceivedTitle')}
                  </div>
                  {app.receptionKilometers !== null && (
                    <div className="text-[11px] font-bold text-slate-700 dark:text-neutral-300">
                      {t('citasTab.kilometersLabel')}: <span className="font-mono text-slate-900 dark:text-white bg-slate-200/80 dark:bg-black/30 px-1.5 py-0.5 rounded">{app.receptionKilometers.toLocaleString()} Km</span>
                    </div>
                  )}
                  {app.receptionNotes && (
                    <div className="text-[11px] text-slate-600 dark:text-neutral-400 font-medium leading-relaxed italic border-t border-emerald-200 dark:border-emerald-500/10 pt-1.5 mt-1.5">
                      "{app.receptionNotes}"
                    </div>
                  )}
                </div>
              ) : (
                onCheckInAppointment && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setKilometers('');
                      setNotes('');
                      setIsModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 mt-4 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {t('citasTab.checkInVehicleBtn')}
                  </button>
                )
              )}
            </div>
            
            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity w-full">
              {onUpdateStatus && app.status !== 'DELAYED' && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      type: 'delay',
                      appId: app.id,
                      title: t('citasTab.delayModalTitle'),
                      description: t('citasTab.delayModalDesc'),
                      confirmText: t('citasTab.delayModalConfirm'),
                      theme: 'amber'
                    });
                  }}
                  className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {t('citasTab.delayBtn')}
                </button>
              )}
              <Button 
                variant="danger"
                onClick={() => handleDelete(app.id)}
                className="flex-1 !px-3 !py-2"
              >
                {t('citasTab.cancelBtn')}
              </Button>
            </div>
          </Card>
          );
        })}
        {confirmedAppointments.length === 0 && confirmedSearch.trim() && (
          <div className="col-span-full py-8 text-center text-slate-400 dark:text-neutral-500 text-xs uppercase tracking-widest font-bold">
            {t('citasTab.noConfirmedFound', { search: confirmedSearch })}
          </div>
        )}
      </div>

      {/* Glassmorphism Reception Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card 
            variant="neutral" 
            rounded="2xl" 
            padding="lg"
            className="max-w-md w-full shadow-2xl relative animate-scale-in border-slate-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-slate-900 dark:text-white"
          >
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
              {t('citasTab.checkInModalTitle')}
            </h2>
            {selectedAppointmentDetails && (
              <p className="text-slate-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-widest mb-6">
                {t('common.vehicle')}: <span className="text-slate-900 dark:text-white">{selectedAppointmentDetails.vehicleDisplay}</span>
              </p>
            )}

            <form onSubmit={handleCheckInSubmit} className="space-y-5">
              <div className="relative">
                <InputField
                  label={t('citasTab.currentKmLabel')}
                  type="number"
                  required
                  value={kilometers}
                  onChange={(e) => setKilometers(e.target.value)}
                  placeholder={t('citasTab.receptionKmPlaceholder')}
                  focusVariant="emerald"
                />
                <span className="absolute right-4 bottom-3.5 text-xs font-black uppercase text-neutral-600">Km</span>
              </div>

              <InputField
                label={t('citasTab.receptionNotesLabel')}
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('citasTab.receptionNotesPlaceholder')}
                focusVariant="emerald"
              />

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedAppId(null);
                  }}
                  className="w-1/2 !py-3"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 !py-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    t('common.confirm')
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>,
        document.body
      )}
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
