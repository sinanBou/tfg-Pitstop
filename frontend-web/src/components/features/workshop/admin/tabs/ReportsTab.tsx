import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../../../../config/api';

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Cargar las facturas e informes desde la API
  const fetchInvoices = () => {
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_BASE_URL}/invoices/workshop/${workshopId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: Invoice[]) => {
        setInvoices(data);
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
    const parsedParts: PartItem[] = JSON.parse(inv.partsJson || '[]');
    const dateObj = new Date(inv.createdAt);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes para descargar la factura.');
      return;
    }

    // Renderizar HTML/CSS Premium para la factura
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura - ${inv.vehicleDisplay}</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #171717;
            background-color: #ffffff;
            font-size: 13px;
            line-height: 1.5;
          }
          header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 30px;
            margin-bottom: 30px;
          }
          .logo-area h1 {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: -1px;
            margin: 0;
            color: #22c55e;
          }
          .logo-area p {
            margin: 4px 0 0 0;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 2px;
            color: #737373;
          }
          .meta-area {
            text-align: right;
          }
          .meta-area h2 {
            font-size: 16px;
            font-weight: 900;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            color: #171717;
          }
          .meta-area p {
            margin: 2px 0;
            font-size: 12px;
            color: #525252;
          }
          .grid-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .card-details {
            background-color: #fafafa;
            border: 1px solid #f3f4f6;
            border-radius: 16px;
            padding: 20px;
          }
          .card-details h3 {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #737373;
            margin: 0 0 12px 0;
          }
          .card-details p {
            margin: 6px 0;
            font-size: 13px;
          }
          .card-details span {
            font-weight: 700;
            color: #171717;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f9fafb;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 1px;
            color: #737373;
            text-align: left;
            padding: 12px 16px;
            border-bottom: 2px solid #e5e7eb;
          }
          td {
            padding: 14px 16px;
            border-bottom: 1px solid #f3f4f6;
            color: #404040;
          }
          .text-right {
            text-align: right;
          }
          .table-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #404040;
            margin-bottom: 12px;
            margin-top: 30px;
          }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 40px;
          }
          .totals-box {
            width: 300px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 20px;
            box-sizing: border-box;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 12px;
            color: #525252;
          }
          .totals-row.final {
            margin-top: 14px;
            border-top: 2px solid #e5e7eb;
            padding-top: 14px;
            font-size: 16px;
            font-weight: 900;
            color: #22c55e;
          }
          footer {
            margin-top: 60px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
            padding-top: 30px;
            color: #a3a3a3;
            font-size: 11px;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="logo-area">
            <h1>PITSTOP</h1>
            <p>Soporte de Taller Inteligente</p>
          </div>
          <div class="meta-area">
            <h2>Informe de Servicio</h2>
            <p><strong>Nº Factura:</strong> PS-${inv.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Fecha de Emisión:</strong> ${formattedDate}</p>
          </div>
        </header>

        <div class="grid-details">
          <div class="card-details">
            <h3>Ficha del Cliente</h3>
            <p><span>Nombre completo:</span> ${inv.clientFullName}</p>
            <p><span>Servicio realizado:</span> ${inv.description}</p>
          </div>
          <div class="card-details">
            <h3>Ficha del Vehículo</h3>
            <p><span>Vehículo asignado:</span> ${inv.vehicleDisplay}</p>
            <p><span>Mano de obra tarifa:</span> ${inv.laborRate.toFixed(2)}€ / hora</p>
          </div>
        </div>

        <div class="table-title">Desglose de Mano de Obra</div>
        <table>
          <thead>
            <tr>
              <th>Concepto / Tarea</th>
              <th class="text-right">Horas Imputadas</th>
              <th class="text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tareas de reparación del catálogo de servicios (${inv.serviceType || 'Mano de obra base'})</td>
              <td class="text-right">${(inv.totalLabor / inv.laborRate).toFixed(2)} h</td>
              <td class="text-right">${inv.totalLabor.toFixed(2)} €</td>
            </tr>
          </tbody>
        </table>

        ${parsedParts.length > 0 ? `
          <div class="table-title">Repuestos y Materiales Empleados</div>
          <table>
            <thead>
              <tr>
                <th>Repuesto / Pieza Física</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Precio Unitario</th>
              </tr>
            </thead>
            <tbody>
              ${parsedParts.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td class="text-right">1</td>
                  <td class="text-right">${p.price.toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="totals-section">
          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal Mano de Obra</span>
              <span>${inv.totalLabor.toFixed(2)} €</span>
            </div>
            <div class="totals-row">
              <span>Subtotal Materiales</span>
              <span>${inv.totalParts.toFixed(2)} €</span>
            </div>
            <div class="totals-row final">
              <span>Total Liquidado</span>
              <span>${inv.totalPrice.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <footer>
          <p>Este documento es un informe de liquidación oficial emitido por Pitstop.</p>
          <p>© ${new Date().getFullYear()} PitStop S.L. - Todos los derechos reservados.</p>
        </footer>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-4 border-neutral-800 border-t-green-500 rounded-full animate-spin" />
        <p className="text-neutral-500 text-xs font-black uppercase tracking-widest animate-pulse">
          Cargando Historial de Informes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y Buscador */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
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
            className="w-full bg-neutral-950 border border-neutral-800/80 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 transition-all shadow-inner"
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
        <div className="flex flex-col items-center justify-center py-20 opacity-40 border border-dashed border-neutral-900 rounded-[2rem]">
          <svg className="w-12 h-12 text-neutral-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-neutral-500 text-xs font-black uppercase tracking-widest">
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
                className={`bg-neutral-900/30 border border-neutral-800/60 rounded-[2rem] p-6 transition-all duration-300 hover:border-neutral-700/60 ${
                  isExpanded ? 'bg-neutral-900/50 shadow-[0_0_30px_rgba(255,255,255,0.02)]' : ''
                }`}
              >
                {/* Cabecera del informe */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-neutral-850 px-2 py-0.5 border border-neutral-800 rounded text-[9px] font-mono font-bold text-neutral-400">
                        PS-{inv.id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">{formattedDate}</span>
                    </div>
                    <h4 className="text-base font-black uppercase tracking-tight text-white">
                      {inv.vehicleDisplay}
                    </h4>
                    <p className="text-neutral-400 text-xs font-bold">{inv.clientFullName}</p>
                  </div>

                  {/* Lado Derecho: Totales y Acciones */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Total Liquidado</p>
                      <p className="text-lg font-black font-mono text-green-400 mt-0.5">{inv.totalPrice.toFixed(2)}€</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón Detalle */}
                      <button
                        onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                        className="w-10 h-10 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-95"
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
                        className="h-10 px-4 rounded-xl bg-green-950/20 hover:bg-green-950/40 border border-green-500/20 hover:border-green-500/30 text-green-400 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.05)]"
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
                      <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-5 space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block mb-1">Cálculo Mano de Obra</span>
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
                          <span className="text-neutral-300 text-[10px] font-mono truncate max-w-[60%]" title={inv.serviceType}>
                            {inv.serviceType}
                          </span>
                        </div>
                      </div>

                      {/* Repuestos */}
                      <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-5 space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block mb-1">Repuestos Utilizados ({partsList.length})</span>
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
