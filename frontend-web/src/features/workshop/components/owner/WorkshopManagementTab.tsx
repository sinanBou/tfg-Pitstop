import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, MapPin, Shield, ArrowRight, Trash } from '@/assets/icons';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/ImagePreviewModal';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { useTranslation } from '@/i18n';

interface WorkshopManagementTabProps {
  workshops: any[];
  onAddWorkshop: () => void;
  onDeleteWorkshop: (id: string) => Promise<void>;
}

const WorkshopIcon = () => (
  <Building className="w-6 h-6 text-red-500" strokeWidth={1.5} />
);

export function WorkshopManagementTab({ workshops, onAddWorkshop, onDeleteWorkshop }: WorkshopManagementTabProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Estados para el flujo de eliminación segura
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await onDeleteWorkshop(confirmDeleteId);
      setConfirmDeleteId(null);
      setConfirmDeleteName('');
    } catch (err) {
      console.error('Error deleting workshop:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <p className="text-neutral-500 text-sm font-medium">{t('ownerDashboard.activeBranchesManagement')}</p>
         <Button 
            variant="secondary"
            onClick={onAddWorkshop}
            className="!px-6 !py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-2"
         >
            <Plus className="w-4 h-4" />
            {t('ownerDashboard.newWorkshopBtn')}
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {workshops.map((workshop: any) => (
            <Card 
               key={workshop.id} 
               variant="neutral"
               border={false}
               padding="none"
               rounded="2xl"
               className="bg-neutral-900/40 p-6 md:p-8 border border-neutral-800 relative overflow-hidden group hover:border-red-500/40 transition-all duration-300 flex flex-col hover:shadow-2xl hover:-translate-y-1"
            >
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500">
                  <Building className="w-32 h-32 text-red-500" strokeWidth={0.5} />
               </div>
               
               <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-neutral-950 border border-neutral-800 text-red-500 flex items-center justify-center shadow-inner overflow-hidden">
                         {workshop.logoPictureUrl ? (
                            <img 
                               src={workshop.logoPictureUrl} 
                               alt="Logo" 
                               onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewUrl(workshop.logoPictureUrl);
                                  setPreviewTitle(workshop.companyName);
                                  setPreviewOpen(true);
                               }}
                               className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-300"
                            />
                         ) : (
                            <WorkshopIcon />
                         )}
                      </div>
                      <h3 className="text-xl font-black uppercase text-white leading-tight tracking-tighter flex-1">{workshop.companyName}</h3>
                  </div>
                  
                  <div className="space-y-3 mb-8 bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                     <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-neutral-800/50 rounded-lg text-neutral-400 shrink-0 border border-neutral-700/50">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-neutral-300 leading-snug">{workshop.address}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400 shrink-0 border border-red-500/20">
                            <Shield className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-black text-red-400 font-mono tracking-widest">{workshop.cif}</p>
                     </div>
                  </div>
               </div>
               
               <div className="flex gap-3 mt-auto relative z-10 w-full">
                  <Button 
                     onClick={() => navigate(`/workshop/${workshop.id}`)} 
                     className="flex-1 !py-4 bg-neutral-800/50 border border-neutral-700/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:border-red-500 transition-all shadow-sm group/btn overflow-hidden"
                  >
                     <span className="flex items-center justify-center gap-2 relative z-10">
                        {t('ownerDashboard.manageWorkshopBtn')}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                     </span>
                  </Button>
                  
                  <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(workshop.id);
                        setConfirmDeleteName(workshop.companyName);
                     }}
                     className="p-4 bg-red-950/20 hover:bg-red-600 border border-red-900/40 hover:border-red-500 text-red-500 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center group/trash"
                     title={t('ownerDashboard.deleteWorkshopTitle')}
                  >
                     <Trash className="w-4 h-4 group-hover/trash:scale-110 transition-transform" />
                  </button>
               </div>
            </Card>
         ))}
      </div>

      {previewOpen && (
         <ImagePreviewModal
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            imageUrl={previewUrl}
            title={previewTitle}
         />
      )}

      {/* MODAL DE CONFIRMACIÓN REUTILIZABLE */}
      <ConfirmCardModal
         isOpen={!!confirmDeleteId}
         onClose={() => {
            setConfirmDeleteId(null);
            setConfirmDeleteName('');
         }}
         onConfirm={handleDeleteConfirm}
         title={t('ownerDashboard.deleteWorkshopModalTitle')}
         description={t('ownerDashboard.deleteWorkshopModalDesc', { name: confirmDeleteName })}
         confirmText={t('ownerDashboard.confirmDeleteBtn')}
         cancelText={t('common.cancel')}
         theme="red"
         isLoading={isDeleting}
      />
    </div>
  );
}
