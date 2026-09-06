import React, { useState } from 'react';
import { Card } from '@/components/common/Card/Card';
import { MapPin } from '@/assets/icons';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/ImagePreviewModal';
import { useTranslation } from '@/i18n';

interface WorkshopProfileCardProps {
  workshopData: any;
  userRole?: string;
}

export const WorkshopProfileCard: React.FC<WorkshopProfileCardProps> = ({ workshopData, userRole }) => {
  const { t } = useTranslation();
  const [isLogoPreviewOpen, setIsLogoPreviewOpen] = useState(false);
  const showCif = userRole === 'WORKSHOP_OWNER';

  return (
    <>
      <Card variant="neutral" glow={false} border={false} padding="lg" className="!rounded-2xl border border-slate-200 dark:border-neutral-800/80 shadow-sm dark:shadow-none bg-white dark:bg-neutral-900/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {workshopData?.logoPictureUrl && (
              <div 
                onClick={() => setIsLogoPreviewOpen(true)}
                className="w-20 h-20 bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-[2rem] overflow-hidden shrink-0 shadow-sm dark:shadow-2xl cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
              >
                <img src={workshopData.logoPictureUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-white dark:to-neutral-500 mb-3 leading-none">
                {workshopData?.companyName}
              </h2>
              <p className="text-slate-600 dark:text-neutral-400 font-mono flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                {workshopData?.address}
              </p>
            </div>
          </div>
          {showCif && workshopData?.cif && (
            <div className="bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-850 px-8 py-4 rounded-2xl flex flex-col items-center shadow-sm dark:shadow-2xl shrink-0">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-neutral-500 font-black mb-1">{t('overviewTab.taxIdLabel')}</span>
              <span className="text-slate-900 dark:text-white font-mono font-black tracking-[0.2em] text-lg">{workshopData?.cif}</span>
            </div>
          )}
        </div>
      </Card>

      {isLogoPreviewOpen && workshopData?.logoPictureUrl && (
        <ImagePreviewModal
          isOpen={isLogoPreviewOpen}
          onClose={() => setIsLogoPreviewOpen(false)}
          imageUrl={workshopData.logoPictureUrl}
          title={workshopData.companyName}
        />
      )}
    </>
  );
};
