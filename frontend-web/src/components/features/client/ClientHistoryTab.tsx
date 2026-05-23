import { useState } from 'react';
import { API_BASE_URL } from '../../../config/api';

const HistoryIcon = () => (<svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

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

interface ClientHistoryTabProps {
  history: any[];
}

export function ClientHistoryTab({ history }: ClientHistoryTabProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const printInvoicePDF = (inv: Invoice) => {
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
            color: #3b82f6; /* Client theme - blue */
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
            color: #3b82f6; /* Client theme - blue */
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
            <h2>Factura Simplificada</h2>
            <p><strong>Nº Factura:</strong> PS-${inv.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Fecha de Emisión:</strong> ${formattedDate}</p>
          </div>
        </header>

        <div class="grid-details">
          <div class="card-details">
            <h3>Datos del Cliente</h3>
            <p><span>Nombre:</span> ${inv.clientFullName}</p>
            <p><span>Servicio contratado:</span> ${inv.description}</p>
          </div>
          <div class="card-details">
            <h3>Datos del Vehículo</h3>
            <p><span>Vehículo:</span> ${inv.vehicleDisplay}</p>
            <p><span>Tarifa aplicada:</span> ${inv.laborRate.toFixed(2)}€ / hora</p>
          </div>
        </div>

        <div class="table-title">Desglose de Mano de Obra</div>
        <table>
          <thead>
            <tr>
              <th>Concepto / Tarea</th>
              <th class="text-right">Horas de Trabajo</th>
              <th class="text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mano de obra especializada del servicio (${inv.serviceType || 'Base'})</td>
              <td class="text-right">${(inv.totalLabor / inv.laborRate).toFixed(2)} h</td>
              <td class="text-right">${inv.totalLabor.toFixed(2)} €</td>
            </tr>
          </tbody>
        </table>

        ${parsedParts.length > 0 ? `
          <div class="table-title">Materiales y Repuestos Utilizados</div>
          <table>
            <thead>
              <tr>
                <th>Pieza / Repuesto</th>
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
              <span>Mano de Obra</span>
              <span>${inv.totalLabor.toFixed(2)} €</span>
            </div>
            <div class="totals-row">
              <span>Repuestos y Materiales</span>
              <span>${inv.totalParts.toFixed(2)} €</span>
            </div>
            <div class="totals-row final">
              <span>Total a Pagar</span>
              <span>${inv.totalPrice.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <footer>
          <p>Gracias por confiar en Pitstop. Este documento sirve como justificante de liquidación y pago.</p>
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

  const handleDownloadInvoice = async (appointmentId: string) => {
    setDownloadingId(appointmentId);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/invoices/appointment/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo encontrar la factura de este trabajo.');
      const inv = await res.json();
      printInvoicePDF(inv);
    } catch (err: any) {
      alert(err.message || 'Error al descargar la factura.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
         {history.length > 0 ? (
            history.map(hist => {
              const isFinished = hist.status === 'COMPLETED' || hist.status === 'PICKED_UP';
              const isDownloading = downloadingId === hist.id;

              return (
                <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-black bg-neutral-600 group-hover:bg-blue-500 text-neutral-500 group-hover:text-blue-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute top-0 left-[-27px] md:relative md:top-auto md:left-auto md:mx-auto transition-colors duration-300"></div>
                   <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 group-hover:border-blue-900/50 transition-colors shadow flex flex-col gap-4">
                      
                      {/* Cabecera */}
                      <div className="flex items-center justify-between">
                         <div className="font-bold text-white text-sm md:text-base">{hist.vehicleName}</div>
                         <time className="font-mono text-[10px] md:text-xs font-bold text-neutral-500">{hist.finishDate}</time>
                      </div>

                      {/* Detalles y Coste */}
                      <div className="text-neutral-400 text-sm flex justify-between items-center gap-4">
                         <span>{hist.status === 'CANCELLED' ? 'Cita cancelada' : 'Cita finalizada'}</span>
                         {hist.totalCost > 0 && (
                            <span className="font-mono font-bold text-blue-400 shrink-0 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 text-xs">
                               {hist.totalCost.toFixed(2)}€
                            </span>
                         )}
                      </div>

                      {/* Botón Factura condicional para trabajos terminados */}
                      {isFinished && (
                        <div className="pt-2 border-t border-neutral-800 flex justify-center">
                          <button
                            onClick={() => handleDownloadInvoice(hist.id)}
                            disabled={isDownloading}
                            className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 hover:border-blue-600/30 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                          >
                            {isDownloading ? (
                              <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                            Descargar Factura PDF
                          </button>
                        </div>
                      )}
                      
                   </div>
                </div>
              );
            })
         ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
               <HistoryIcon />
               <p className="text-xs font-black uppercase tracking-[0.4em] text-neutral-500 font-mono mt-4">Log Vacío</p>
            </div>
         )}
      </div>
    </div>
  );
}
