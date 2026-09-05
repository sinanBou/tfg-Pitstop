import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { AlertTriangle } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface DeleteAccountSectionProps {
  onDeleteAccount: () => Promise<void>;
  isLoading?: boolean;
  isDisabled?: boolean;
  disabledMessage?: string;
  warningMessage?: string;
}

export const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({
  onDeleteAccount,
  isLoading = false,
  isDisabled = false,
  disabledMessage,
  warningMessage,
}) => {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const effectiveDisabledMsg = disabledMessage || t('profile.ownerDeleteRestriction');
  const effectiveWarningMsg = warningMessage || t('profile.deleteAccountWarningClient');

  const handleConfirm = async () => {
    setIsConfirmOpen(false);
    await onDeleteAccount();
  };

  return (
    <div className="relative border border-red-500/20 bg-red-500/5 rounded-2xl p-6 space-y-4 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-start gap-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-black uppercase tracking-wider text-red-400">
            {t('profile.criticalActionsHeader')}
          </h4>
          <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
            {isDisabled ? effectiveDisabledMsg : effectiveWarningMsg}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2 relative z-10">
        {isDisabled ? (
          <div className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-950/40 border border-red-900/40 px-4 py-2.5 rounded-xl select-none">
            {t('profile.actionDisabled')}
          </div>
        ) : (
          <Button
            type="button"
            variant="danger"
            disabled={isLoading}
            onClick={() => setIsConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/50"
          >
            {isLoading ? t('profile.deletingAccount') : t('profile.deleteAccountTitle')}
          </Button>
        )}
      </div>

      <ConfirmCardModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={t('profile.modalDeleteTitle')}
        description={t('profile.modalDeleteDesc')}
        confirmText={t('profile.modalDeleteConfirm')}
        cancelText={t('common.cancel')}
        theme="red"
        isLoading={isLoading}
      />
    </div>
  );
};
