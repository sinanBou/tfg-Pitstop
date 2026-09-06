import { useState, useMemo, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { Card } from '@/components/common/Card/Card';
import { printInvoicePDF as importPrintInvoicePDF } from '@/utils/InvoicePdfPrinter';
import { useToast } from '@/hooks/useToast';
import { getBrandLogo } from '@/assets/BrandLogos';
import { Calendar, Check, FileText, X, Clock, Wrench } from '@/assets/icons';
import { useTranslation } from '@/i18n';

interface NotificationItem {
  id: string;
  type: 'confirm' | 'complete' | 'invoice' | 'cancel';
  title: string;
  message: string;
  dateTime: Date;
  appointmentId: string;
}

interface ClientHistoryTabProps {
  history: any[];
  appointments: any[];
}

export function ClientHistoryTab({ history, appointments }: ClientHistoryTabProps) {
  const { t } = useTranslation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [catalogMap, setCatalogMap] = useState<Map<string, string>>(new Map());
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'notifications'>('jobs');
  const toast = useToast();

  useEffect(() => {
    const workshopIds = new Set<string>();
    (appointments || []).forEach(a => { if (a.workshopId) workshopIds.add(a.workshopId); });
    (history || []).forEach(h => { if (h.workshopId) workshopIds.add(h.workshopId); });

    if (workshopIds.size === 0) return;

    const token = localStorage.getItem('jwt_token');
    const promises = Array.from(workshopIds).map(workshopId => 
      fetch(`${API_BASE_URL}/catalog/workshop/${workshopId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    );

    Promise.all(promises).then(results => {
      const map = new Map<string, string>();
      results.forEach(catalogList => {
        if (Array.isArray(catalogList)) {
          catalogList.forEach(cat => {
            (cat.tasks || []).forEach((t: any) => {
              map.set(t.code, t.name);
            });
          });
        }
      });
      setCatalogMap(map);
    });
  }, [appointments, history]);

  const translateServiceCodes = (serviceType: string | undefined, defaultDesc: string) => {
    if (!serviceType) return defaultDesc || 'Mantenimiento General';
    const codes = serviceType.split(',').map(c => c.trim()).filter(Boolean);
    const translated = codes.map(code => catalogMap.get(code) || code);
    if (translated.length === 0) return defaultDesc || 'Mantenimiento General';
    return translated.join(', ');
  };

  const completedJobs = useMemo(() => {
    const all = [...(appointments || []), ...(history || [])];
    const seen = new Set<string>();
    const unique = all.filter(app => {
      if (!app?.id || seen.has(app.id)) return false;
      seen.add(app.id);
      return true;
    });

    return unique
      .filter(app => ['COMPLETED', 'PICKED_UP'].includes(app.status))
      .sort((a, b) => {
        const dateA = new Date(a.actualEndTime || a.dateTime || a.date || 0).getTime();
        const dateB = new Date(b.actualEndTime || b.dateTime || b.date || 0).getTime();
        return dateB - dateA;
      });
  }, [appointments, history]);

  const notifications = useMemo(() => {
    const list: NotificationItem[] = [];
    const all = [...(appointments || []), ...(history || [])];
    
    const seen = new Set<string>();
    const uniqueApps = all.filter(app => {
      if (!app?.id || seen.has(app.id)) return false;
      seen.add(app.id);
      return true;
    });

    uniqueApps.forEach(app => {
      const vehicleDisplay = app.vehicleDisplay || app.vehicleName || t('common.vehicle');
      const appDate = app.dateTime ? new Date(app.dateTime) : null;
      if (!appDate) return;

      if (app.status === 'CANCELLED') {
        const cancelDate = app.actualEndTime ? new Date(app.actualEndTime) : app.confirmedAt ? new Date(app.confirmedAt) : new Date(appDate.getTime());
        list.push({ id: `${app.id}-cancel`, type: 'cancel', title: t('clientHistory.notifCancelledTitle'), message: `${t('clientHistory.notifCancelledMsg')} (${vehicleDisplay})`, dateTime: cancelDate, appointmentId: app.id });
      }

      if (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'PICKED_UP'].includes(app.status)) {
        const confirmDate = app.confirmedAt ? new Date(app.confirmedAt) : new Date(appDate.getTime() - 24 * 3600 * 1000);
        list.push({ id: `${app.id}-confirm`, type: 'confirm', title: t('clientHistory.notifConfirmedTitle'), message: `${t('clientHistory.notifConfirmedMsg')} (${vehicleDisplay})`, dateTime: confirmDate, appointmentId: app.id });
      }

      if (['COMPLETED', 'PICKED_UP'].includes(app.status)) {
        const completeDate = app.actualEndTime ? new Date(app.actualEndTime) : new Date(appDate.getTime() + 2 * 3600 * 1000);
        list.push({ id: `${app.id}-complete`, type: 'complete', title: t('clientHistory.notifCompletedTitle'), message: `${t('clientHistory.notifCompletedMsg')} (${vehicleDisplay})`, dateTime: completeDate, appointmentId: app.id });

        const invoiceDate = app.actualEndTime ? new Date(new Date(app.actualEndTime).getTime() + 60 * 1000) : new Date(appDate.getTime() + 2 * 3600 * 1000 + 60 * 1000);
        list.push({ id: `${app.id}-invoice`, type: 'invoice', title: t('clientHistory.notifInvoiceTitle'), message: `${t('clientHistory.notifInvoiceMsg')} (${vehicleDisplay})`, dateTime: invoiceDate, appointmentId: app.id });
      }
    });

    return list.sort((a, b) => {
      const diff = b.dateTime.getTime() - a.dateTime.getTime();
      if (diff !== 0) return diff;
      const weights: Record<string, number> = { invoice: 3, complete: 2, confirm: 1, cancel: 0 };
      return weights[b.type] - weights[a.type];
    });
  }, [appointments, history, t]);

  const printInvoicePDF = (inv: any, translated?: string) => {
    importPrintInvoicePDF(inv, translated, (msg) => toast.warning(msg));
  };

  const handleDownloadInvoice = async (appointmentId: string) => {
    setDownloadingId(appointmentId);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/invoices/appointment/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo encontrar la factura.');
      const inv = await res.json();
      const translated = translateServiceCodes(inv.serviceType || inv.description, inv.description);
      printInvoicePDF(inv, translated);
    } catch (err: any) {
      toast.error(err.message || 'Error al descargar.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveSubTab('jobs')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeSubTab === 'jobs' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'}`}>
            <Wrench className="w-3.5 h-3.5" />
            <span>Trabajos Realizados</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black ${activeSubTab === 'jobs' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-700'}`}>{completedJobs.length}</span>
          </button>
          <button onClick={() => setActiveSubTab('notifications')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeSubTab === 'notifications' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{t('clientHistory.activityNotifs')}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black ${activeSubTab === 'notifications' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-700'}`}>{notifications.length}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'jobs' && (
        <div className="space-y-4">
          {completedJobs.length === 0 ? (
            <Card variant="neutral" padding="none" rounded="2xl" className="p-12 text-center flex flex-col items-center">
              <Wrench className="w-6 h-6 mb-3 text-slate-400" />
              <p className="text-slate-700 dark:text-neutral-300 font-black uppercase tracking-widest text-xs">Sin intervenciones aún</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedJobs.map(job => {
                const formattedDate = new Date(job.actualEndTime || job.dateTime || job.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                return (
                  <div key={job.id} className="p-5 rounded-2xl bg-white/95 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800/80 shadow-sm hover:border-blue-500/30 transition-all flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 [&_svg]:w-6 [&_svg]:h-6 [&_div]:w-6 [&_div]:h-6 [&_div]:text-[10px]">
                          {getBrandLogo((job.vehicleDisplay || job.vehiclePlate || '').split(' ')[0])}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{job.vehicleDisplay || job.vehiclePlate || t('common.vehicle')}</h4>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">{job.workshopName}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-[9px] font-black uppercase tracking-wider shrink-0">
                        ✓ {job.status === 'PICKED_UP' ? 'Entregado' : 'Finalizado'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50/80 dark:bg-neutral-950/50 rounded-xl border border-slate-200/60 dark:border-white/5">
                      <p className="text-xs font-bold text-slate-800 dark:text-neutral-200">{translateServiceCodes(job.serviceType || job.description, job.description)}</p>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 block mt-0.5">Fecha: {formattedDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{Number(job.totalPrice || 0).toFixed(2)}€</span>
                      <button onClick={() => handleDownloadInvoice(job.id)} disabled={downloadingId === job.id} className="ml-auto px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50">
                        {downloadingId === job.id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FileText className="w-3.5 h-3.5" /> PDF</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card variant="neutral" padding="none" rounded="2xl" className="p-10 text-center text-xs text-slate-500 dark:text-neutral-400">{t('clientHistory.noNotifs')}</Card>
          ) : (
            notifications.map(notif => {
              const formattedTime = notif.dateTime.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              let icon = <Calendar className="w-4 h-4" />;
              if (notif.type === 'complete') icon = <Check className="w-4 h-4" />;
              else if (notif.type === 'invoice') icon = <FileText className="w-4 h-4" />;
              else if (notif.type === 'cancel') icon = <X className="w-4 h-4" />;
              return (
                <div key={notif.id} className="border border-slate-200/80 dark:border-neutral-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 bg-white/95 dark:bg-neutral-900/90 shadow-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-blue-500/20 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">{icon}</div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-xs font-black uppercase text-slate-900 dark:text-white">{notif.title}</span><span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">{formattedTime}</span></div>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">{notif.message}</p>
                    </div>
                  </div>
                  {notif.type === 'invoice' && (
                    <button onClick={() => handleDownloadInvoice(notif.appointmentId)} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase cursor-pointer transition-all shadow-sm">PDF</button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
