import { useState, useMemo } from 'react';
import { API_BASE_URL } from '@/config/api';
import { getBrandLogo } from '@/components/common/SearchableSelect/BrandLogos';


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

interface NotificationItem {
  id: string;
  type: 'confirm' | 'complete' | 'invoice';
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Generar notificaciones dinámicas en base a citas y facturas
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
      const vehicleDisplay = app.vehicleDisplay || app.vehicleName || 'Vehículo';
      const appDate = app.dateTime ? new Date(app.dateTime) : null;
      if (!appDate) return;

      // 1. Cita Confirmada (siempre que esté en CONFIRMED, IN_PROGRESS, COMPLETED, PICKED_UP)
      if (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'PICKED_UP'].includes(app.status)) {
        // Usar la fecha de confirmación real guardada en la base de datos si existe, de lo contrario estimar 24h antes
        const confirmDate = app.confirmedAt 
          ? new Date(app.confirmedAt) 
          : new Date(appDate.getTime() - 24 * 3600 * 1000);

        list.push({
          id: `${app.id}-confirm`,
          type: 'confirm',
          title: 'Cita Confirmada',
          message: `Su cita para el vehículo ${vehicleDisplay} ha sido confirmada y programada.`,
          dateTime: confirmDate,
          appointmentId: app.id
        });
      }

      // 2. Trabajo Finalizado (si está COMPLETED, PICKED_UP)
      if (['COMPLETED', 'PICKED_UP'].includes(app.status)) {
        // Usamos el fin real registrado en el backend, o estimamos 2 horas después de la cita programada
        const completeDate = app.actualEndTime 
          ? new Date(app.actualEndTime) 
          : new Date(appDate.getTime() + 2 * 3600 * 1000);

        list.push({
          id: `${app.id}-complete`,
          type: 'complete',
          title: 'Trabajo Finalizado',
          message: `Se ha finalizado el trabajo en su vehículo ${vehicleDisplay}. Puede acudir a recogerlo.`,
          dateTime: completeDate,
          appointmentId: app.id
        });
      }

      // 3. Factura Generada (si está COMPLETED, PICKED_UP)
      if (['COMPLETED', 'PICKED_UP'].includes(app.status)) {
        // Usamos el fin real + 1 minuto, o estimamos 2 horas + 1 minuto después de la cita programada
        const invoiceDate = app.actualEndTime
          ? new Date(new Date(app.actualEndTime).getTime() + 60 * 1000)
          : new Date(appDate.getTime() + 2 * 3600 * 1000 + 60 * 1000);

        list.push({
          id: `${app.id}-invoice`,
          type: 'invoice',
          title: 'Factura Generada',
          message: `Se ha generado la factura de su vehículo ${vehicleDisplay}.`,
          dateTime: invoiceDate,
          appointmentId: app.id
        });
      }
    });

    // Ordenar notificaciones por fecha de más reciente a más antigua y por prioridad si la hora coincide
    return list.sort((a, b) => {
      const diff = b.dateTime.getTime() - a.dateTime.getTime();
      if (diff !== 0) return diff;
      const weights = { invoice: 3, complete: 2, confirm: 1 };
      return weights[b.type] - weights[a.type];
    });
  }, [appointments, history]);

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
            color: #3b82f6;
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
            color: #3b82f6;
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
    <div className="space-y-12">
      {/* ── NOTIFICACIONES DE ESTADO ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
            Actividad y Notificaciones
          </h3>
        </div>

        {notifications.length === 0 ? (
          <div className="p-6 bg-neutral-900/10 border border-neutral-900 rounded-[2rem] text-center text-neutral-600 text-xs py-10">
            No tienes notificaciones o actividad registrada en tus citas.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => {
              const formattedTime = notif.dateTime.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });

              // Determinar icono y colores premium según tipo de notificación
              let borderClass = 'border-neutral-800 bg-neutral-900/20';
              let badgeColor = 'bg-blue-600/10 border-blue-500/20 text-blue-400';
              let icon = (
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              );

              if (notif.type === 'complete') {
                borderClass = 'border-green-500/10 bg-green-500/5';
                badgeColor = 'bg-green-600/10 border-green-500/20 text-green-400';
                icon = (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                );
              } else if (notif.type === 'invoice') {
                borderClass = 'border-emerald-500/10 bg-emerald-500/5';
                badgeColor = 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400';
                icon = (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                );
              }

              return (
                <div
                  key={notif.id}
                  className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${borderClass}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon Circle */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${badgeColor}`}>
                      {icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-white">
                          {notif.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {formattedTime}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {/* Factura Download Button */}
                  {notif.type === 'invoice' && (
                    <button
                      onClick={() => handleDownloadInvoice(notif.appointmentId)}
                      disabled={downloadingId === notif.appointmentId}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
                    >
                      {downloadingId === notif.appointmentId ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar PDF
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── HISTORIAL DE TRABAJOS COMPLETADOS ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neutral-500 animate-pulse" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
            Historial de Trabajos Realizados (Vista Taller)
          </h3>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <HistoryIcon />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-neutral-500 font-mono mt-4">Log Vacío</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map(hist => {
              const isFinished = hist.status === 'COMPLETED' || hist.status === 'PICKED_UP';
              const isDownloading = downloadingId === hist.id;

              return (
                <div
                  key={hist.id}
                  className={`bg-neutral-900/40 border rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.05)] ${
                    hist.status === 'CANCELLED'
                      ? 'border-red-500/20 hover:border-red-500/40'
                      : 'border-green-500/20 hover:border-green-500/40'
                  }`}
                >
                  {/* Background glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
                    hist.status === 'CANCELLED' ? 'bg-red-500/5' : 'bg-green-500/5'
                  }`} />

                  <div className="relative z-10 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            hist.status === 'CANCELLED'
                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : 'bg-green-500/10 border-green-500/20 text-green-400'
                          }`}>
                            {hist.status === 'CANCELLED' ? '✕ Cancelado' : '✓ Finalizado'}
                          </span>
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tight text-white truncate flex items-center gap-1.5">
                          <span className="shrink-0 flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4 [&_div]:w-4 [&_div]:h-4 [&_div]:text-[8px]">
                            {getBrandLogo((hist.vehicleName || '').split(' ')[0])}
                          </span>
                          <span>{hist.vehicleName}</span>
                        </h4>
                        <p className="text-neutral-500 text-xs font-bold mt-0.5">{hist.description}</p>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Fecha</span>
                        <span className="text-white text-xs font-mono">{hist.finishDate}</span>
                      </div>
                      {hist.totalCost > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Costo total</span>
                          <span className="text-blue-400 text-xs font-mono font-bold">{hist.totalCost.toFixed(2)}€</span>
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    {isFinished && (
                      <button
                        onClick={() => handleDownloadInvoice(hist.id)}
                        disabled={isDownloading}
                        className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.15)] disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Descargar Factura PDF
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
