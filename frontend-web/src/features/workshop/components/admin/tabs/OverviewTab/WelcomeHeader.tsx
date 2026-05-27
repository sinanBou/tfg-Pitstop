import React, { useState } from 'react';
import { Card } from '@/components/common/Card/index';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal/index';

interface WelcomeHeaderProps {
  employeeProfile: any;
  userName: string;
  userRoleLabel: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  employeeProfile,
  userName,
  userRoleLabel
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <Card variant="neutral" glow={false} border={false} padding="sm" className="!rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div 
              className={`w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center font-black text-xl font-mono shadow-[0_0_20px_rgba(220,38,38,0.1)] overflow-hidden shrink-0 ${employeeProfile?.profilePictureUrl ? 'cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-300' : ''}`}
              onClick={employeeProfile?.profilePictureUrl ? () => setIsPreviewOpen(true) : undefined}
            >
              {employeeProfile?.profilePictureUrl ? (
                <img src={employeeProfile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                employeeProfile?.firstname?.slice(0, 1) || 'P'
              )}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">Sesión Activa</p>
              <h3 className="text-lg font-black text-white">{userName}</h3>
            </div>
          </div>
          
          <div className="self-start md:self-auto">
            <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] border border-red-600/30 bg-red-600/10 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
              {userRoleLabel}
            </span>
          </div>
        </div>
      </Card>

      {employeeProfile?.profilePictureUrl && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          imageUrl={employeeProfile.profilePictureUrl}
          title={userName}
        />
      )}
    </>
  );
};
