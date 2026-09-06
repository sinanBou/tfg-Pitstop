import { useState, useMemo, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { getBrandLogo } from '@/assets/BrandLogos';
import { FileText } from '@/assets/icons';
import { MonthSelector } from '@/components/common/MonthSelector/MonthSelector';
import { MetricCard } from '@/components/common/MetricCard/MetricCard';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import { printInvoicePDF } from '@/utils/InvoicePdfPrinter';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n';


interface ClientReportsTabProps {
  history: any[];
  vehicles: any[];
  appointments: any[];
}

/**
 * ── SUB-COMPONENTE: INDICADORES CLAVE (KPIs) ──
 */
interface ClientKpisGridProps {
  totalSpent: number;
  totalAppointments: number;
  totalVehicles: number;
  avgCost: number;
}

function ClientKpisGrid({ totalSpent, totalAppointments, totalVehicles, avgCost }: ClientKpisGridProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <MetricCard 
        label={t('clientReports.accumulatedSpent')} 
        value={`${totalSpent.toFixed(2)}€`} 
      />
      <MetricCard 
        label={t('clientReports.totalAppointments')} 
        value={totalAppointments} 
      />
      <MetricCard 
        label={t('clientReports.myFleet')} 
        value={`${totalVehicles} ${totalVehicles === 1 ? t('common.vehicle') : t('clientDashboard.activeVehicles')}`} 
      />
      <MetricCard 
        label={t('clientReports.avgPrice')} 
        value={`${avgCost.toFixed(2)}€`} 
      />
    </div>
  );
}

/**
 * ── SUB-COMPONENTE: ANÁLISIS DE GASTO POR VEHÍCULO ──
 */
interface VehicleSpendAnalysisProps {
  statsByVehicle: any[];
}

function VehicleSpendAnalysis({ statsByVehicle }: VehicleSpendAnalysisProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900 rounded-[1.5rem] p-6 md:p-8 space-y-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-900 pb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-neutral-200">
          {t('clientReports.expensesByVehicle')}
        </h3>
        <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono">{t('clientReports.detailedInvestment')}</span>
      </div>

      {statsByVehicle.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-neutral-500 italic py-6 text-center">{t('clientReports.noVehiclesRegistered')}</p>
      ) : (
        <div className="space-y-5">
          {statsByVehicle.map((v, idx) => {
            const maxSpent = Math.max(...statsByVehicle.map(item => item.spent), 1);
            const percent = (v.spent / maxSpent) * 100;

            return (
              <ProgressBar
                key={idx}
                label={`${v.brand} ${v.model}`}
                sublabel={v.licensePlate}
                valueText={`${v.spent.toFixed(2)}€ (${v.count})`}
                percentage={percent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * ── SUB-COMPONENTE: HISTORIAL DE FACTURAS ──
 */
interface RecentInvoicesListProps {
  invoices: any[];
  downloadingId: string | null;
  onDownload: (id: string) => void;
  translateServiceCodes: (serviceType: string | undefined, defaultDesc: string) => string;
  formatToDDMMYYYY: (dateStr: string) => string;
}

function RecentInvoicesList({ invoices, downloadingId, onDownload, translateServiceCodes, formatToDDMMYYYY }: RecentInvoicesListProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900 rounded-[1.5rem] p-6 md:p-8 space-y-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-900 pb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-neutral-200">
            {t('clientReports.latestInvoices')}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-neutral-500 mt-1">{t('clientReports.quickPrintSub')}</p>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono">{t('clientReports.maxRecords')}</span>
      </div>

      {invoices.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-neutral-500 italic py-6 text-center">{t('clientReports.noInvoicesPeriod')}</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv, idx) => (
            <div 
              key={idx}
              className="bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900/60 hover:border-slate-300 dark:hover:border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 [&_div]:w-6 [&_div]:h-6 [&_div]:text-[10px] text-slate-500 dark:text-neutral-400">
                  {getBrandLogo((inv.vehicleName || '').split(' ')[0])}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">{inv.vehicleName}</h4>
                  <p className="text-[10px] text-slate-600 dark:text-neutral-400 mt-0.5">{translateServiceCodes(inv.serviceType, inv.description)}</p>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-neutral-500">{formatToDDMMYYYY(inv.finishDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <span className="text-xs font-black font-mono text-slate-900 dark:text-neutral-300">{inv.totalCost.toFixed(2)}€</span>
                <button
                  onClick={() => onDownload(inv.id)}
                  disabled={downloadingId === inv.id}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-700 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50 font-mono"
                >
                  {downloadingId === inv.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-800 dark:border-neutral-400/30 dark:border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ── COMPONENTE PRINCIPAL: CLIENT REPORTS TAB ──
 */
export function ClientReportsTab({ history = [], vehicles = [], appointments = [] }: ClientReportsTabProps) {
  const { t } = useTranslation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [catalogMap, setCatalogMap] = useState<Map<string, string>>(new Map());
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

  const formatToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '---';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // 1. Filtrar los trabajos finalizados
  const completedWork = useMemo(() => {
    return history.filter(h => h.status === 'COMPLETED' || h.status === 'PICKED_UP');
  }, [history]);

  // 2. Filtrar por el mes seleccionado
  const filteredCompletedWork = useMemo(() => {
    return completedWork.filter(h => {
      if (selectedMonth === 'all') return true;
      const dateStr = h.finishDate || h.createdAt;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return month === selectedMonth;
    });
  }, [completedWork, selectedMonth]);

  // 3. Calcular KPIs Clave
  const kpis = useMemo(() => {
    const totalSpent = filteredCompletedWork.reduce((sum, h) => sum + (h.totalCost || 0), 0);
    const totalAppointments = appointments.length + history.length;
    const totalVehicles = vehicles.length;
    const avgCost = filteredCompletedWork.length > 0 ? totalSpent / filteredCompletedWork.length : 0;

    return {
      totalSpent,
      totalAppointments,
      totalVehicles,
      avgCost
    };
  }, [filteredCompletedWork, appointments, history, vehicles]);

  // 4. Desglose de gastos por vehículo registrado
  const statsByVehicle = useMemo(() => {
    return vehicles.map(v => {
      const vehicleWork = filteredCompletedWork.filter(h => {
        const hVehicle = (h.vehicleName || '').toLowerCase();
        const vBrand = (v.brand || '').toLowerCase();
        const vModel = (v.model || '').toLowerCase();
        const vPlate = (v.licensePlate || '').toLowerCase();

        return (
          hVehicle.includes(vPlate) ||
          (hVehicle.includes(vBrand) && hVehicle.includes(vModel))
        );
      });

      const spent = vehicleWork.reduce((sum, h) => sum + (h.totalCost || 0), 0);
      const count = vehicleWork.length;

      return {
        ...v,
        spent,
        count
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [vehicles, filteredCompletedWork]);

  // 5. Historial reciente de facturación para el cliente
  const recentInvoices = useMemo(() => {
    return filteredCompletedWork.slice(0, 5);
  }, [filteredCompletedWork]);

  // Descarga remota del objeto Factura y llamada a la impresora nativa PDF
  const handleDownloadInvoice = async (appointmentId: string) => {
    setDownloadingId(appointmentId);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/invoices/appointment/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo encontrar la factura de este trabajo.');
      const inv = await res.json();
      const translated = translateServiceCodes(inv.serviceType || inv.description, inv.description);
      printInvoicePDF(inv, translated, (msg) => toast.warning(msg));
    } catch (err: any) {
      toast.error(err.message || 'Error al descargar la factura.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Cabecera y Selector de Mes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-900 pb-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-neutral-500">{t('clientReports.subtitle')}</span>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">{t('clientReports.title')}</h2>
        </div>
        <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* 1. SECCIÓN DE METRICAS (KPI CARDS) */}
      <ClientKpisGrid 
        totalSpent={kpis.totalSpent} 
        totalAppointments={kpis.totalAppointments} 
        totalVehicles={kpis.totalVehicles} 
        avgCost={kpis.avgCost} 
      />

      {/* 2. CONTENEDOR: ANALÍTICAS GRÁFICAS DE FLOTA */}
      <VehicleSpendAnalysis statsByVehicle={statsByVehicle} />

      {/* 3. HISTORIAL DE FACTURACIÓN (ÚLTIMAS 5 FACTURAS) */}
      <RecentInvoicesList 
        invoices={recentInvoices} 
        downloadingId={downloadingId} 
        onDownload={handleDownloadInvoice} 
        translateServiceCodes={translateServiceCodes}
        formatToDDMMYYYY={formatToDDMMYYYY}
      />

      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
