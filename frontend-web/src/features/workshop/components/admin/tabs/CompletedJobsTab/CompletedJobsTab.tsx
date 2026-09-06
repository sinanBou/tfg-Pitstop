import React, { useState } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';
import { CheckCircle, Check, Archive } from '@/assets/icons';
import { getBrandLogo } from '@/assets/BrandLogos';
import { useTranslation } from '@/i18n';

const extractLicensePlate = (text: string) => {
  if (!text) return null;
  const match = text.match(/\b([0-9]{4}\s?[- ]?[A-Z]{3}|[A-Z]{1,2}\s?[- ]?[0-9]{4}\s?[- ]?[A-Z]{1,2})\b/i);
  return match ? match[0].toUpperCase().replace(/\s+/g, '-') : null;
};

interface CompletedJobsTabProps {
  readyJobs: any[];
  onCompleteJob: (job: any) => void;
  onMarkPickedUp: (appointmentId: string) => Promise<boolean>;
}

export const CompletedJobsTab: React.FC<CompletedJobsTabProps> = ({
  readyJobs,
  onCompleteJob,
  onMarkPickedUp,
}) => {
  const { t } = useTranslation();
  const [processingId, setProcessingId] = useState<string | null>(null);
  // Optimistic removal — hide cards instantly while API runs
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [confirmPickupId, setConfirmPickupId] = useState<string | null>(null);

  const handleComplete = (job: any) => {
    onCompleteJob(job);
  };

  const handleConfirmPickedUp = async () => {
    if (!confirmPickupId) return;
    const id = confirmPickupId;
    setConfirmPickupId(null);
    setProcessingId(id);
    setDismissedIds(prev => new Set(prev).add(id));
    await onMarkPickedUp(id);
    setProcessingId(null);
  };

  const handlePickedUp = (id: string) => {
    setConfirmPickupId(id);
  };

  // Filter out optimistically dismissed items
  const visibleJobs = readyJobs.filter(j => !dismissedIds.has(j.id));

  if (visibleJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 opacity-60 dark:opacity-40">
        <CheckCircle className="w-16 h-16 text-slate-400 dark:text-neutral-700 mb-4" strokeWidth={1.5} />
        <p className="text-slate-600 dark:text-neutral-500 text-sm font-black uppercase tracking-widest">
          {t('completedJobsTab.noJobsPendingApproval')}
        </p>
        <p className="text-slate-500 dark:text-neutral-600 text-xs mt-2">
          {t('completedJobsTab.noJobsSubtext')}
        </p>
      </div>
    );
  }

  // Separate into two groups
  const pendingApproval = visibleJobs.filter(j => j.status === 'IN_PROGRESS');
  const awaitingPickup = visibleJobs.filter(j => j.status === 'COMPLETED');

  return (
    <div className="space-y-8">
      {/* Section 1: Pending manager approval */}
      {pendingApproval.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-neutral-400">
              {pendingApproval.length === 1 
                ? t('completedJobsTab.pendingApprovalCount', { count: pendingApproval.length })
                : t('completedJobsTab.pendingApprovalCountPlural', { count: pendingApproval.length })
              }
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingApproval.map(job => (
              <JobCard
                key={job.id}
                job={job}
                phase="approve"
                isProcessing={processingId === job.id}
                onAction={() => handleComplete(job)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Awaiting client pickup */}
      {awaitingPickup.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-neutral-400">
              {awaitingPickup.length === 1
                ? t('completedJobsTab.awaitingPickupCount', { count: awaitingPickup.length })
                : t('completedJobsTab.awaitingPickupCountPlural', { count: awaitingPickup.length })
              }
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {awaitingPickup.map(job => (
              <JobCard
                key={job.id}
                job={job}
                phase="pickup"
                isProcessing={processingId === job.id}
                onAction={() => handlePickedUp(job.id)}
              />
            ))}
          </div>
        </div>
      )}
      {confirmPickupId !== null && (
        <ConfirmCardModal
          isOpen={confirmPickupId !== null}
          onClose={() => setConfirmPickupId(null)}
          onConfirm={handleConfirmPickedUp}
          title={t('completedJobsTab.confirmPickupModalTitle')}
          description={t('completedJobsTab.confirmPickupModalDesc')}
          confirmText={t('completedJobsTab.confirmPickupModalConfirm')}
          theme="green"
        />
      )}
    </div>
  );
};

/* ── Reusable Job Card ── */
interface JobCardProps {
  job: any;
  phase: 'approve' | 'pickup';
  isProcessing: boolean;
  onAction: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, phase, isProcessing, onAction }) => {
  const { t, language } = useTranslation();
  const dateObj = new Date(job.dateTime);
  const isApprove = phase === 'approve';

  const plate = extractLicensePlate(job.vehicleDisplay || '');

  return (
    <Card
      variant="neutral"
      border={false}
      padding="none"
      rounded="2xl"
      className={`bg-white dark:bg-neutral-900/40 p-6 relative overflow-hidden group transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-[0_0_40px_rgba(34,197,94,0.1)] border ${
        isApprove
          ? 'border-amber-500/30 hover:border-amber-500/50'
          : 'border-green-500/30 hover:border-green-500/50'
      }`}
    >

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`px-2.5 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest ${
                isApprove
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
              }`}>
                {isApprove ? t('completedJobsTab.pendingApprovalBadge') : t('completedJobsTab.clientNotifiedBadge')}
              </span>
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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-lg flex items-center justify-center text-slate-700 dark:text-neutral-400 shadow-inner shrink-0 [&_svg]:w-4.5 [&_svg]:h-4.5 [&_div]:w-4.5 [&_div]:text-[8px]">
                {getBrandLogo(job.vehicleDisplay ? job.vehicleDisplay.split(' ')[0] : '')}
              </div>
              <h4 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                {job.vehicleDisplay}
              </h4>
            </div>
            <p className="text-slate-500 dark:text-neutral-400 text-xs font-bold mt-1">{job.clientFullName}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-slate-100 dark:bg-black/30 rounded-xl p-4 border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-neutral-400 text-[10px] font-black uppercase tracking-widest">{t('avisosTab.serviceLabel')}</span>
            <span className="text-slate-900 dark:text-white text-xs font-bold truncate max-w-[60%] text-right">{job.serviceType || job.description}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-neutral-400 text-[10px] font-black uppercase tracking-widest">{t('completedJobsTab.entryDateLabel')}</span>
            <span className="text-slate-900 dark:text-white text-xs font-mono">
              {dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
          {job.assignedEmployeeName && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-neutral-400 text-[10px] font-black uppercase tracking-widest">{t('common.mechanic')}</span>
              <span className="text-slate-900 dark:text-white text-xs font-bold">{job.assignedEmployeeName}</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <Button
          onClick={onAction}
          disabled={isProcessing}
          className={`w-full !py-4 shadow-none ${
            isApprove
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-transparent'
              : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] border border-transparent'
          }`}
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isApprove ? (
            <>
              <Check className="w-4 h-4" strokeWidth={2.5} />
              {t('completedJobsTab.completeJobBtn')}
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" strokeWidth={2} />
              {t('completedJobsTab.vehiclePickedUpBtn')}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

