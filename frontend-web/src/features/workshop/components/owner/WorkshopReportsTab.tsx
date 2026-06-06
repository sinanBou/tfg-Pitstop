import { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/config/api';
import { formatCurrency } from '@/utils/formatters';
import { ReportsTab } from '@/features/workshop/components/admin/tabs/ReportsTab';
import { MonthSelector } from '@/components/common/MonthSelector/MonthSelector';
import { MetricCard } from '@/components/common/MetricCard/MetricCard';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import { PartsStatsWidget } from '@/components/common/PartsStatsWidget/PartsStatsWidget';
import { BackButton } from '@/components/common/BackButton/BackButton';
import { Card } from '@/components/common/Card/Card';

interface Invoice {
  id: string;
  appointmentId: string;
  workshopId: string;
  laborRate: number;
  totalLabor: number;
  partsJson: string;
  totalParts: number;
  totalPrice: number;
  createdAt: string;
  clientFullName: string;
  vehicleDisplay: string;
  serviceType: string;
  description: string;
}

interface WorkshopReportsTabProps {
  workshops: any[];
}

export function WorkshopReportsTab({ workshops = [] }: WorkshopReportsTabProps) {
  const [invoicesByWorkshop, setInvoicesByWorkshop] = useState<Record<string, Invoice[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Carga paralela de facturas para todos los talleres del dueño
  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      
      const promises = workshops.map(w => 
        fetch(`${API_BASE_URL}/invoices/workshop/${w.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(async res => {
            if (!res.ok) return { id: w.id, data: [] };
            const data = await res.json();
            return { id: w.id, data };
          })
          .catch(() => ({ id: w.id, data: [] }))
      );

      const results = await Promise.all(promises);
      
      const map: Record<string, Invoice[]> = {};
      results.forEach(res => {
        map[res.id] = res.data;
      });

      setInvoicesByWorkshop(map);
    } catch (err) {
      console.error("Error loading multi-workshop reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshops.length > 0) {
      fetchGlobalData();
    } else {
      setLoading(false);
    }
  }, [workshops]);

  // Filtrar facturas de todos los talleres por el mes seleccionado
  const filteredInvoicesByWorkshop = useMemo(() => {
    const map: Record<string, Invoice[]> = {};
    Object.keys(invoicesByWorkshop).forEach(id => {
      map[id] = invoicesByWorkshop[id].filter(inv => {
        if (selectedMonth === 'all') return true;
        const dateStr = inv.createdAt;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return month === selectedMonth;
      });
    });
    return map;
  }, [invoicesByWorkshop, selectedMonth]);

  // Cómputo global y comparativo de métricas
  const globalStats = useMemo(() => {
    let combinedRevenue = 0;
    let combinedJobs = 0;
    let combinedPartsSold = 0;

    const workshopMetrics = workshops.map(w => {
      const invoices = filteredInvoicesByWorkshop[w.id] || [];
      const revenue = invoices.reduce((sum, inv) => sum + (inv.totalPrice || 0), 0);
      const partsSold = invoices.reduce((sum, inv) => sum + (inv.totalParts || 0), 0);
      const count = invoices.length;

      combinedRevenue += revenue;
      combinedJobs += count;
      combinedPartsSold += partsSold;

      return {
        id: w.id,
        name: w.companyName || 'Taller',
        address: w.address || 'Dirección no especificada',
        revenue,
        count,
        avgTicket: count > 0 ? revenue / count : 0
      };
    });

    // Ordenar talleres por ingresos de mayor a menor
    const sortedByRevenue = [...workshopMetrics].sort((a, b) => b.revenue - a.revenue);
    
    // Mejor taller
    const topWorkshop = sortedByRevenue[0] || null;

    // Calcular el coste de adquisición agregado (60% de lo vendido)
    const combinedPartsCost = combinedPartsSold * 0.6;

    return {
      combinedRevenue,
      combinedJobs,
      combinedPartsSold,
      combinedPartsCost,
      avgTicket: combinedJobs > 0 ? combinedRevenue / combinedJobs : 0,
      workshopMetrics,
      sortedByRevenue,
      topWorkshop
    };
  }, [workshops, filteredInvoicesByWorkshop]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-neutral-800 border-t-neutral-400 rounded-full animate-spin" />
        <p className="text-neutral-500 text-xs font-black uppercase tracking-widest animate-pulse">
          Consolidando Métricas del Grupo Corporativo...
        </p>
      </div>
    );
  }

  // ── RENDERIZADO DEL INFORME DETALLADO DE TALLER INDIVIDUAL ──
  if (selectedWorkshopId) {
    const selectedWorkshop = workshops.find(w => w.id === selectedWorkshopId);
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Barra superior de navegación interna */}
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <BackButton 
              onClick={() => setSelectedWorkshopId(null)} 
              title="Volver a Vista General" 
            />
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Auditoría Individual de Taller</span>
              <h2 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
                {selectedWorkshop?.companyName}
              </h2>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-neutral-500 font-mono">{selectedWorkshop?.address}</span>
            <span className="bg-neutral-900 px-2 py-0.5 border border-neutral-800 rounded text-[9px] font-mono text-neutral-400 ml-2">
              ID: {selectedWorkshop?.id.substring(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Carga el ReportsTab del Gerente adaptado con su ID */}
        <ReportsTab workshopId={selectedWorkshopId} />
      </div>
    );
  }  // ── RENDERIZADO DE LA VISTA GLOBAL COMPARATIVA ──
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Cabecera y Selector de Mes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">Análisis General</h2>
        </div>
        <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* 1. WIDGETS KPIs COMBINADOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          label="Ingresos Totales" 
          value={formatCurrency(globalStats.combinedRevenue)} 
        />
        <MetricCard 
          label="Citas Completadas" 
          value={globalStats.combinedJobs} 
        />
        <MetricCard 
          label="Precio Medio" 
          value={formatCurrency(globalStats.avgTicket)} 
        />
        <MetricCard 
          label="Número de Talleres" 
          value={workshops.length} 
        />
      </div>

      {/* 2. AUDITORÍA DE PIEZAS DE LA RED Y COMPARACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PartsStatsWidget 
          partsCost={globalStats.combinedPartsCost} 
          partsSold={globalStats.combinedPartsSold} 
        />

        {/* 3. COMPARATIVA COMPLETA DE TALLERES (FACTURACIÓN) */}
        <Card 
          variant="neutral"
          border={false}
          padding="lg"
          rounded="2xl"
          className="bg-neutral-950 border border-neutral-900 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-200">
              Facturación por Centro
            </h3>
          </div>

          {globalStats.sortedByRevenue.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-6 text-center">No hay datos de ingresos en este período.</p>
          ) : (
            <div className="space-y-6">
              {globalStats.sortedByRevenue.map((w, idx) => {
                const maxRevenue = Math.max(...globalStats.sortedByRevenue.map(item => item.revenue), 1);
                const percent = (w.revenue / maxRevenue) * 100;

                return (
                  <div key={idx} className="space-y-2 group">
                    <ProgressBar
                      label={w.name}
                      sublabel={w.address}
                      valueText={formatCurrency(w.revenue)}
                      percentage={percent}
                    />
                    <div className="text-right mt-1">
                      <button
                        onClick={() => setSelectedWorkshopId(w.id)}
                        className="text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      >
                        Ver Detalles →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

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
