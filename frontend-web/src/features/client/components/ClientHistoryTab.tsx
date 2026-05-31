import { useState, useMemo, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { printInvoicePDF as importPrintInvoicePDF } from '@/utils/InvoicePdfPrinter';
import { useToast } from '@/hooks/useToast';


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

  const printInvoicePDF = (inv: any, translated?: string) => {
    importPrintInvoicePDF(inv, translated);
  };
  /*
  const old_printInvoicePDF = (inv: Invoice) => {
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
  */

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
      printInvoicePDF(inv, translated);
    } catch (err: any) {
      toast.error(err.message || 'Error al descargar la factura.');
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
          <Card variant="neutral" padding="none" rounded="2xl" className="p-6 bg-neutral-900/10 text-center text-neutral-600 text-xs py-10">
            No tienes notificaciones o actividad registrada en tus citas.
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => {
              const formattedTime = notif.dateTime.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
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
                    <Button
                      onClick={() => handleDownloadInvoice(notif.appointmentId)}
                      disabled={downloadingId === notif.appointmentId}
                      glow={false}
                      className="!px-4 !py-2 !text-[9px] !rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:border-transparent text-white shrink-0"
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
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
