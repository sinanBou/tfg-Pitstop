import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/config/api';
import { MonthSelector } from '@/components/common/MonthSelector/MonthSelector';
import { MetricCard } from '@/components/common/MetricCard/MetricCard';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import { PartsStatsWidget } from '@/components/common/PartsStatsWidget/PartsStatsWidget';
import { printInvoicePDF } from '@/utils/InvoicePdfPrinter';
import { useToast } from '@/hooks/useToast';

interface PartItem {
  name: string;
  price: number;
}

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

interface ReportsTabProps {
  workshopId: string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ workshopId }) => {
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Cargar las facturas e informes desde la API
  const fetchInvoices = () => {
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/invoices/workshop/${workshopId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: Invoice[]) => {
        const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setInvoices(sorted);
      })
      .catch(err => console.error("Error loading invoices history:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (workshopId) {
      fetchInvoices();
    }
  }, [workshopId]);

  // Filtrado reactivo de facturas
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const term = searchTerm.toLowerCase();
      return (
        inv.clientFullName?.toLowerCase().includes(term) ||
        inv.vehicleDisplay?.toLowerCase().includes(term) ||
        inv.description?.toLowerCase().includes(term) ||
        inv.serviceType?.toLowerCase().includes(term)
      );
    });
  }, [invoices, searchTerm]);

  // Generar y descargar Factura PDF mediante impresión nativa maquetada de alta fidelidad
  const handlePrintPDF = (inv: Invoice) => {
    printInvoicePDF(inv, undefined, (msg) => toast.warning(msg));
  };

  // Filtrar facturas por mes seleccionado
  const filteredInvoicesByMonth = useMemo(() => {
    return invoices.filter(inv => {
      if (selectedMonth === 'all') return true;
      const dateStr = inv.createdAt;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return month === selectedMonth;
    });
  }, [invoices, selectedMonth]);

  // Calcular KPIs y Analíticas del Taller
  const analytics = useMemo(() => {
    const totalRevenue = filteredInvoicesByMonth.reduce((sum, inv) => sum + (inv.totalPrice || 0), 0);
    const totalLabor = filteredInvoicesByMonth.reduce((sum, inv) => sum + (inv.totalLabor || 0), 0);
    const totalParts = filteredInvoicesByMonth.reduce((sum, inv) => sum + (inv.totalParts || 0), 0);
    const avgInvoice = filteredInvoicesByMonth.length > 0 ? totalRevenue / filteredInvoicesByMonth.length : 0;
    
    // Simular precio de coste/adquisición de repuestos (60% de precio retail/venta)
    const totalPartsCost = totalParts * 0.6;

    const totalCombined = totalLabor + totalParts;
    const laborPercentage = totalCombined > 0 ? (totalLabor / totalCombined) * 100 : 0;
    const partsPercentage = totalCombined > 0 ? (totalParts / totalCombined) * 100 : 0;

    return {
      totalRevenue,
      totalLabor,
      totalParts,
      totalPartsCost,
      avgInvoice,
      laborPercentage,
      partsPercentage
    };
  }, [filteredInvoicesByMonth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-neutral-800 border-t-red-500 rounded-full animate-spin" />
        <p className="text-neutral-500 text-sm font-black uppercase tracking-widest animate-pulse">
          Cargando Historial de Informes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up select-none">
      {/* Cabecera y Selector de Mes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-500">Panel de Control de Informes</span>
          <h2 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">Análisis General</h2>
        </div>
        <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* ── SECCIÓN DE ANALÍTICAS Y METRICAS DEL TALLER (KPIs) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          label="Facturación Total" 
          value={`${analytics.totalRevenue.toFixed(2)}€`} 
        />
        <MetricCard 
          label="Precio Medio" 
          value={`${analytics.avgInvoice.toFixed(2)}€`} 
        />
        <MetricCard 
          label="Citas Facturadas" 
          value={filteredInvoicesByMonth.length} 
        />
        <MetricCard 
          label="Mano de Obra / Piezas" 
          value={`${analytics.laborPercentage.toFixed(0)}% / ${analytics.partsPercentage.toFixed(0)}%`} 
        />
      </div>

      {/* ── AUDITORÍA DE REPUESTOS Y MATERIALES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PartsStatsWidget 
          partsCost={analytics.totalPartsCost} 
          partsSold={analytics.totalParts} 
        />

        <div className="bg-neutral-900/80 rounded-2xl p-6 md:p-8 space-y-6 border border-neutral-800/40">
          <div className="flex items-center justify-between border-b border-neutral-800/40 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Ingresos por Categoría
            </h3>
          </div>

          <div className="space-y-6 py-2">
            <ProgressBar
              label="Total Mano de Obra"
              valueText={`${analytics.totalLabor.toFixed(2)}€`}
              percentage={analytics.laborPercentage}
            />
            <ProgressBar
              label="Total Repuestos y Materiales"
              valueText={`${analytics.totalParts.toFixed(2)}€`}
              percentage={analytics.partsPercentage}
            />
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-neutral-800/40 my-8"></div>

      {/* Cabecera y Buscador del Historial */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">
            {invoices.length} {invoices.length === 1 ? 'informe registrado' : 'informes registrados'}
          </h3>
          <p className="text-neutral-500 text-xs mt-0.5">Consulta de facturas y descargas de PDFs oficiales.</p>
        </div>

        {/* Buscador */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, matrícula o tarea..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/50 transition-all shadow-inner"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-all"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Listado de Informes */}
      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40 border border-dashed border-neutral-850 rounded-2xl">
          <svg className="w-12 h-12 text-neutral-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-neutral-500 text-sm font-black uppercase tracking-widest">
            No se han encontrado informes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.map(inv => {
            const isExpanded = expandedInvoiceId === inv.id;
            const dateObj = new Date(inv.createdAt);
            const formattedDate = dateObj.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            const partsList: PartItem[] = JSON.parse(inv.partsJson || '[]');

            return (
              <div
                key={inv.id}
                className={`bg-neutral-900/80 rounded-2xl p-6 border border-neutral-800/40 transition-all duration-300 hover:border-neutral-700/60 ${
                  isExpanded ? 'bg-neutral-900/95' : ''
                }`}
              >
                {/* Cabecera del informe */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-neutral-850 px-2 py-0.5 border border-neutral-800 rounded text-[10px] font-mono font-bold text-neutral-400">
                        PS-{inv.id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-neutral-500">{formattedDate}</span>
                    </div>
                    <h4 className="text-base font-black uppercase tracking-tight text-white">
                      {inv.vehicleDisplay}
                    </h4>
                    <p className="text-neutral-400 text-sm font-bold">{inv.clientFullName}</p>
                  </div>

                  {/* Lado Derecho: Totales y Acciones */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Total Liquidado</p>
                      <p className="text-lg font-black font-mono text-green-400 mt-0.5">{inv.totalPrice.toFixed(2)}€</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón Detalle */}
                      <button
                        onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                        className="w-10 h-10 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-850 flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-95 cursor-pointer"
                        title={isExpanded ? "Ocultar detalle" : "Ver detalle"}
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Botón Descargar PDF */}
                      <button
                        onClick={() => handlePrintPDF(inv)}
                        className="h-10 px-4 rounded-xl bg-green-950/20 hover:bg-green-950/40 border border-green-500/20 hover:border-green-500/30 text-green-400 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.05)] cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desglose Expandido */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-neutral-900 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Mano de Obra */}
                      <div className="bg-neutral-950/40 border border-neutral-800/40 rounded-2xl p-5 space-y-2">
                        <span className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-1">Cálculo Mano de Obra</span>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400">Tarifa por hora:</span>
                          <span className="text-white font-mono">{inv.laborRate.toFixed(2)}€/h</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400">Total Mano de Obra:</span>
                          <span className="text-white font-mono font-bold">{inv.totalLabor.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400">Servicios:</span>
                          <span className="text-neutral-300 text-xs font-mono truncate max-w-[60%]" title={inv.serviceType}>
                            {inv.serviceType}
                          </span>
                        </div>
                      </div>

                      {/* Repuestos */}
                      <div className="bg-neutral-950/40 border border-neutral-800/40 rounded-2xl p-5 space-y-2">
                        <span className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-1">Repuestos Utilizados ({partsList.length})</span>
                        {partsList.length === 0 ? (
                          <p className="text-neutral-600 text-xs italic">Ningún repuesto imputado en este trabajo.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                            {partsList.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-neutral-400 truncate max-w-[70%]">{p.name}</span>
                                <span className="text-white font-mono">{p.price.toFixed(2)}€</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {partsList.length > 0 && (
                          <div className="flex justify-between items-center text-xs pt-1.5 border-t border-neutral-900/60 font-bold">
                            <span className="text-neutral-400">Total Materiales:</span>
                            <span className="text-white font-mono">{inv.totalParts.toFixed(2)}€</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
