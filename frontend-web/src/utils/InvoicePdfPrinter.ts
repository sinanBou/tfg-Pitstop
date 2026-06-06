import { formatCurrency } from './formatters';

export interface PartItem {
  name: string;
  price: number;
}

export interface InvoiceData {
  id: string;
  laborRate: number;
  totalLabor: number;
  partsJson: string;
  totalParts: number;
  totalPrice: number;
  createdAt: string;
  clientFullName: string;
  vehicleDisplay: string;
  serviceType?: string;
  description: string;
}

/**
 * Genera y descarga una factura PDF maquetada nativamente en alta fidelidad y estética seria.
 */
export function printInvoicePDF(inv: InvoiceData, translatedTasks?: string, onError?: (message: string) => void) {
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
    if (onError) {
      onError('Por favor, permite las ventanas emergentes para descargar la factura.');
    } else {
      console.warn('Por favor, permite las ventanas emergentes para descargar la factura.');
    }
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
          color: #171717;
        }
        .logo-area p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-meta h2 {
          font-size: 20px;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }
        .invoice-meta p {
          margin: 5px 0 0 0;
          color: #4b5563;
        }
        .invoice-meta .ref {
          font-family: monospace;
          background-color: #f3f4f6;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 11px;
          display: inline-block;
          margin-top: 5px;
        }
        .details-grid {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .details-block h3 {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #9ca3af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .details-block p {
          margin: 4px 0;
          color: #374151;
        }
        .details-block strong {
          color: #111827;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        th {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6b7280;
          text-align: left;
          padding: 12px 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        td {
          padding: 12px 8px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
        }
        td.price {
          text-align: right;
          font-family: monospace;
          font-weight: 500;
        }
        th.price {
          text-align: right;
        }
        .invoice-summary {
          width: 320px;
          margin-left: auto;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 12px;
          color: #4b5563;
        }
        .summary-row.total {
          border-top: 2px dashed #e5e7eb;
          margin-top: 8px;
          padding-top: 12px;
          font-weight: 900;
          font-size: 16px;
          color: #111827;
        }
        .summary-row span.val {
          font-family: monospace;
        }
        footer {
          margin-top: 60px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
        footer p {
          margin: 4px 0;
        }
        @media print {
          body { padding: 0; }
          .invoice-summary { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <header>
        <div class="logo-area">
          <h1>PITSTOP</h1>
          <p>Taller Mecánico Profesional</p>
        </div>
        <div class="invoice-meta">
          <h2>Factura Oficial</h2>
          <p>Fecha: ${formattedDate}</p>
          <span class="ref">REF: ${inv.id.substring(0, 8).toUpperCase()}</span>
        </div>
      </header>

      <div class="details-grid">
        <div class="details-block">
          <h3>Emisor</h3>
          <p><strong>PitStop Automoción S.L.</strong></p>
          <p>CIF: B-87654321</p>
          <p>Av. de la Constitución 142, Planta Baja</p>
          <p>Madrid, España</p>
          <p>contacto@pitstop.es</p>
        </div>
        <div class="details-block">
          <h3>Cliente y Vehículo</h3>
          <p><strong>${inv.clientFullName}</strong></p>
          <p>Vehículo: ${inv.vehicleDisplay}</p>
          <p>Servicio: ${inv.description || 'Mantenimiento General'}</p>
        </div>
      </div>

      ${translatedTasks ? `
      <div class="details-block" style="margin-bottom: 30px;">
        <h3>Operaciones y Trabajos Realizados</h3>
        <p style="font-size: 14px; color: #111827; font-weight: 600; margin: 6px 0 0 0; letter-spacing: -0.2px;">
          ${translatedTasks}
        </p>
      </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            <th>Concepto / Descripción</th>
            <th class="price" style="width: 120px;">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Mano de Obra y Diagnóstico Especializado</strong>
              <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                Tasa horaria aplicada: ${formatCurrency(inv.laborRate)}/h
              </div>
            </td>
            <td class="price">${formatCurrency(inv.totalLabor)}</td>
          </tr>
          ${parsedParts.map(p => `
            <tr>
              <td>
                <span>Repuesto: ${p.name}</span>
              </td>
              <td class="price">${formatCurrency(p.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="invoice-summary">
        <div class="summary-row">
          <span>Base Imponible Mano de Obra</span>
          <span class="val">${formatCurrency(inv.totalLabor)}</span>
        </div>
        <div class="summary-row">
          <span>Base Imponible Repuestos</span>
          <span class="val">${formatCurrency(inv.totalParts)}</span>
        </div>
        <div class="summary-row total">
          <span>Importe Total (IVA Incl.)</span>
          <span class="val">${formatCurrency(inv.totalPrice)}</span>
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
}
