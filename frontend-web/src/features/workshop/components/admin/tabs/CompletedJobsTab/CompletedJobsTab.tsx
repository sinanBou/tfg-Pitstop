import React, { useState } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { ConfirmCardModal } from '@/components/common/ConfirmCardModal';

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
      <div className="flex flex-col items-center justify-center py-24 opacity-40">
        <svg className="w-16 h-16 text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-neutral-500 text-sm font-black uppercase tracking-widest">
          No hay trabajos pendientes de aprobación
        </p>
        <p className="text-neutral-600 text-xs mt-2">
          Cuando los mecánicos completen todas las tareas de una cita, aparecerán aquí.
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
            <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
              {pendingApproval.length} {pendingApproval.length === 1 ? 'trabajo pendiente' : 'trabajos pendientes'} de aprobación
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
            <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
              {awaitingPickup.length} {awaitingPickup.length === 1 ? 'vehículo esperando' : 'vehículos esperando'} recogida
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
          title="Confirmar Recogida"
          description="¿Confirmar que el cliente ha recogido su vehículo?"
          confirmText="Sí, Confirmar"
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
  const dateObj = new Date(job.dateTime);
  const isApprove = phase === 'approve';

  return (
    <Card
      variant="neutral"
      border={false}
      padding="none"
      rounded="2xl"
      className={`bg-neutral-900/40 p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,197,94,0.1)] ${
        isApprove
          ? 'border border-amber-500/20 hover:border-amber-500/40'
          : 'border border-green-500/20 hover:border-green-500/40'
      }`}
    >

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest ${
                isApprove
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-green-500/10 border-green-500/20 text-green-400'
              }`}>
                {isApprove ? 'Pendiente de Aprobación' : 'Cliente Avisado'}
              </span>
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight text-white truncate">
              {job.vehicleDisplay}
            </h4>
            <p className="text-neutral-500 text-xs font-bold mt-0.5">{job.clientFullName}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Servicio</span>
            <span className="text-white text-xs font-bold truncate max-w-[60%] text-right">{job.serviceType || job.description}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Fecha entrada</span>
            <span className="text-white text-xs font-mono">
              {dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
          {job.assignedEmployeeName && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Mecánico</span>
              <span className="text-white text-xs font-bold">{job.assignedEmployeeName}</span>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Completar Trabajo — Avisar al Cliente
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Vehículo Recogido
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
