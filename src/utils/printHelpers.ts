import QRCode from "qrcode";

interface NormalizedColis {
  id: string;
  trackingNo: string;
  senderName: string;
  senderPhone?: string;
  senderAddress?: string;
  receiverName: string;
  receiverPhone?: string;
  receiverAddress?: string;
  city: string;
  weight: number;
  totalPrice: number;
  type: string;
  status: string;
  date: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function normalizeColis(colis: any): NormalizedColis {
  // If the colis has sender/receiver as objects (like in some forms) or simple strings, handle them
  const senderName = typeof colis.sender === "string" ? colis.sender : (colis.sender?.name || "Zakaria Akrabou");
  const receiverName = typeof colis.receiver === "string" ? colis.receiver : (colis.receiver?.name || colis.client || "Client Destinataire");

  return {
    id: colis.id || "",
    trackingNo: colis.trackingNo || colis.id || "TRK-000000",
    senderName,
    senderPhone: colis.senderPhone || colis.sender?.phone || "",
    senderAddress: colis.senderAddress || colis.sender?.address || "",
    receiverName,
    receiverPhone: colis.receiverPhone || colis.receiver?.phone || "",
    receiverAddress: colis.receiverAddress || colis.receiver?.address || "",
    city: colis.city || colis.receiver?.city || "Casablanca",
    weight: typeof colis.weight === "number" ? colis.weight : 0,
    totalPrice: typeof colis.totalPrice === "number" ? colis.totalPrice : (typeof colis.total === "number" ? colis.total : 0),
    type: colis.type || "Standard",
    status: colis.status || "En attente",
    date: colis.date || new Date().toISOString().split("T")[0],
  };
}

async function generateQrCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 120,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    // Fallback QR code API if local generation fails
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
  }
}

function getFactureHtml(colis: NormalizedColis, qrCodeUrl: string): string {
  const unitPrice = colis.weight > 0 ? (colis.totalPrice / colis.weight) : 0;
  
  return `
    <div class="document-page invoice-layout">
      <div class="doc-header">
        <div>
          <div class="logo-text">Colis<span class="orange">Manager</span></div>
          <p class="logo-sub">Service de transport & logistique national</p>
          <p class="company-info">contact@colismanager.ma • +212 5 22 00 00 00</p>
        </div>
        <div style="text-align: right;">
          <h1 class="doc-title">Facture</h1>
          <div class="meta-info">
            <div><strong>N° Facture:</strong> FAC-${escapeHtml(colis.trackingNo)}</div>
            <div><strong>Date:</strong> ${escapeHtml(colis.date)}</div>
            <div><strong>Mode de paiement:</strong> Espèces à la livraison</div>
          </div>
        </div>
      </div>
      
      <div class="address-grid">
        <div class="address-card">
          <div class="card-label">Expéditeur</div>
          <div class="card-name">${escapeHtml(colis.senderName)}</div>
          ${colis.senderPhone ? `<div class="card-detail">Tél: ${escapeHtml(colis.senderPhone)}</div>` : ""}
          ${colis.senderAddress ? `<div class="card-detail">${escapeHtml(colis.senderAddress)}</div>` : ""}
        </div>
        <div class="address-card" style="border-left: 2px solid #e5e7eb; padding-left: 24px;">
          <div class="card-label">Destinataire (Facturé à)</div>
          <div class="card-name">${escapeHtml(colis.receiverName)}</div>
          ${colis.receiverPhone ? `<div class="card-detail">Tél: ${escapeHtml(colis.receiverPhone)}</div>` : ""}
          <div class="card-detail">${escapeHtml(colis.receiverAddress || "Adresse de livraison")}</div>
          <div class="card-detail"><strong>Ville:</strong> ${escapeHtml(colis.city)}</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Type</th>
            <th style="text-align: right;">Poids</th>
            <th style="text-align: right;">Tarif Unit.</th>
            <th style="text-align: right;">Total (DH)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Abonnement/Envoi de colis (Réf: ${escapeHtml(colis.trackingNo)})</strong>
              <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Statut d'expédition: ${escapeHtml(colis.status)}</div>
            </td>
            <td><span class="type-badge">${escapeHtml(colis.type)}</span></td>
            <td style="text-align: right;">${colis.weight.toFixed(1)} kg</td>
            <td style="text-align: right;">${unitPrice.toFixed(2)} DH/kg</td>
            <td style="text-align: right; font-weight: bold; color: #111827;">${colis.totalPrice.toFixed(2)} DH</td>
          </tr>
        </tbody>
      </table>

      <div class="footer-layout">
        <div class="qr-container">
          <img class="qr-image" src="${qrCodeUrl}" alt="QR code" />
          <div class="qr-text">${escapeHtml(colis.trackingNo)}</div>
        </div>
        <div class="totals-card">
          <div class="total-row">
            <span>Sous-total:</span>
            <span>${colis.totalPrice.toFixed(2)} DH</span>
          </div>
          <div class="total-row">
            <span>TVA (0%):</span>
            <span>0.00 DH</span>
          </div>
          <div class="total-row grand-total">
            <span>Total net:</span>
            <span>${colis.totalPrice.toFixed(2)} DH</span>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <p>Merci de votre confiance ! Pour toute assistance, veuillez nous contacter.</p>
        <p style="font-size: 9px; color: #9ca3af; margin-top: 8px;">Document généré de manière sécurisée par ColisManager.</p>
      </div>
    </div>
  `;
}

function getBonCommandeHtml(colis: NormalizedColis, qrCodeUrl: string): string {
  return `
    <div class="document-page bon-layout">
      <div class="doc-header">
        <div>
          <div class="logo-text">Colis<span class="orange">Manager</span></div>
          <p class="logo-sub">Bon de Commande & Bordereau de Livraison</p>
        </div>
        <div style="text-align: right;">
          <h1 class="doc-title" style="color: #E26D28;">Bon Commande</h1>
          <div class="meta-info">
            <div><strong>N° Suivi:</strong> ${escapeHtml(colis.trackingNo)}</div>
            <div><strong>Date d'émission:</strong> ${escapeHtml(colis.date)}</div>
            <div><strong>Type Service:</strong> ${escapeHtml(colis.type)}</div>
          </div>
        </div>
      </div>

      <div class="address-grid">
        <div class="address-card">
          <div class="card-label">Expéditeur (Sender)</div>
          <div class="card-name">${escapeHtml(colis.senderName)}</div>
          ${colis.senderPhone ? `<div class="card-detail">Tél: ${escapeHtml(colis.senderPhone)}</div>` : ""}
          ${colis.senderAddress ? `<div class="card-detail">${escapeHtml(colis.senderAddress)}</div>` : ""}
        </div>
        <div class="address-card">
          <div class="card-label">Destinataire (Receiver)</div>
          <div class="card-name">${escapeHtml(colis.receiverName)}</div>
          ${colis.receiverPhone ? `<div class="card-detail">Tél: ${escapeHtml(colis.receiverPhone)}</div>` : ""}
          <div class="card-detail">${escapeHtml(colis.receiverAddress || "Adresse de livraison")}</div>
          <div class="card-detail"><strong>Ville:</strong> ${escapeHtml(colis.city)}</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Désignation Colis</th>
            <th>Type Livraison</th>
            <th>Poids (kg)</th>
            <th style="text-align: right;">Frais d'envoi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Expédition standard de marchandises</strong>
              <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Réf tracking: ${escapeHtml(colis.trackingNo)}</div>
            </td>
            <td>${escapeHtml(colis.type)}</td>
            <td>${colis.weight.toFixed(1)} kg</td>
            <td style="text-align: right; font-weight: bold; color: #E26D28;">${colis.totalPrice.toFixed(2)} DH</td>
          </tr>
        </tbody>
      </table>

      <div class="signatures-and-qr">
        <div class="signatures-grid">
          <div class="signature-box">
            <div class="sig-title">Signature Expéditeur</div>
            <div class="sig-placeholder">Date & Signature</div>
          </div>
          <div class="signature-box">
            <div class="sig-title">Signature Livreur</div>
            <div class="sig-placeholder">Date & Signature</div>
          </div>
          <div class="signature-box">
            <div class="sig-title">Signature Destinataire</div>
            <div class="sig-placeholder">Reçu en bon état</div>
          </div>
        </div>
        <div class="qr-container-inline">
          <img class="qr-image" src="${qrCodeUrl}" alt="QR code" />
          <div class="qr-text" style="font-weight: bold;">${escapeHtml(colis.trackingNo)}</div>
        </div>
      </div>

      <div class="doc-footer" style="margin-top: 40px;">
        <p>Veuillez conserver ce document pour le suivi de votre livraison.</p>
      </div>
    </div>
  `;
}

function getCommonStyles(): string {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      
      body {
        font-family: 'Inter', system-ui, sans-serif;
        color: #1f2937;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .document-page {
        box-sizing: border-box;
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
      }
      
      .doc-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #f3f4f6;
        padding-bottom: 24px;
        margin-bottom: 24px;
      }
      
      .logo-text {
        font-size: 24px;
        font-weight: 900;
        color: #2B4C8C;
        letter-spacing: -0.025em;
      }
      
      .logo-text .orange {
        color: #E26D28;
      }
      
      .logo-sub {
        font-size: 11px;
        color: #4b5563;
        margin: 4px 0 0 0;
        font-weight: 500;
      }
      
      .company-info {
        font-size: 10px;
        color: #9ca3af;
        margin: 2px 0 0 0;
      }
      
      .doc-title {
        font-size: 28px;
        font-weight: 900;
        color: #2B4C8C;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: -0.025em;
      }
      
      .meta-info {
        font-size: 12px;
        color: #4b5563;
        margin-top: 8px;
        line-height: 1.5;
      }
      
      .address-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 30px;
      }
      
      .address-card {
        display: flex;
        flex-direction: column;
      }
      
      .card-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #9ca3af;
        font-weight: 700;
        margin-bottom: 6px;
      }
      
      .card-name {
        font-size: 14px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 4px;
      }
      
      .card-detail {
        font-size: 12px;
        color: #4b5563;
        line-height: 1.4;
      }
      
      .items-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        margin-bottom: 30px;
      }
      
      .items-table th {
        border-bottom: 2px solid #e5e7eb;
        color: #6b7280;
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 700;
        padding: 12px 8px;
        letter-spacing: 0.05em;
      }
      
      .items-table td {
        border-bottom: 1px solid #f3f4f6;
        padding: 16px 8px;
        font-size: 12px;
        color: #4b5563;
        line-height: 1.4;
      }
      
      .type-badge {
        background-color: #f3f4f6;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 10px;
        font-weight: 600;
      }
      
      .footer-layout {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      
      .qr-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .qr-image {
        width: 100px;
        height: 100px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 4px;
      }
      
      .qr-text {
        font-size: 9px;
        font-family: monospace;
        color: #6b7280;
        margin-top: 4px;
        letter-spacing: 0.05em;
      }
      
      .totals-card {
        width: 250px;
        background-color: #f9fafb;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e5e7eb;
      }
      
      .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #4b5563;
        margin-bottom: 8px;
      }
      
      .total-row:last-child {
        margin-bottom: 0;
      }
      
      .total-row.grand-total {
        font-size: 16px;
        font-weight: 800;
        color: #111827;
        border-top: 1px solid #e5e7eb;
        padding-top: 8px;
        margin-top: 8px;
      }
      
      .doc-footer {
        text-align: center;
        margin-top: 50px;
        font-size: 10px;
        color: #9ca3af;
        border-top: 1px solid #f3f4f6;
        padding-top: 16px;
      }
      
      .signatures-and-qr {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 30px;
        align-items: center;
      }
      
      .signatures-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
      }
      
      .signature-box {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        height: 90px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      
      .sig-title {
        font-size: 9px;
        text-transform: uppercase;
        color: #9ca3af;
        font-weight: 700;
        text-align: center;
      }
      
      .sig-placeholder {
        font-size: 8px;
        color: #cbd5e1;
        text-align: center;
      }
      
      .qr-container-inline {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      @media print {
        body {
          padding: 0;
          background-color: transparent;
        }
        .document-page {
          padding: 20px 0;
        }
        .page-break {
          page-break-before: always;
          height: 0;
          overflow: hidden;
        }
      }
    </style>
  `;
}

function writeAndPrint(win: Window, html: string): boolean {
  win.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Impression ColisManager</title>
        ${getCommonStyles()}
      </head>
      <body>
        ${html}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  win.document.close();
  return true;
}

export async function printFacture(colisRaw: any): Promise<boolean> {
  const colis = normalizeColis(colisRaw);
  const qrCodeUrl = await generateQrCode(colis.trackingNo);
  
  const win = window.open("", "_blank");
  if (!win) {
    console.error("Could not open print window. Please allow popups.");
    return false;
  }
  
  const html = getFactureHtml(colis, qrCodeUrl);
  return writeAndPrint(win, html);
}

export async function printBonCommande(colisRaw: any): Promise<boolean> {
  const colis = normalizeColis(colisRaw);
  const qrCodeUrl = await generateQrCode(colis.trackingNo);
  
  const win = window.open("", "_blank");
  if (!win) {
    console.error("Could not open print window. Please allow popups.");
    return false;
  }
  
  const html = getBonCommandeHtml(colis, qrCodeUrl);
  return writeAndPrint(win, html);
}

export async function printBothDocuments(colisRaw: any): Promise<boolean> {
  const colis = normalizeColis(colisRaw);
  const qrCodeUrl = await generateQrCode(colis.trackingNo);
  
  const win = window.open("", "_blank");
  if (!win) {
    console.error("Could not open print window. Please allow popups.");
    return false;
  }
  
  const html = `
    ${getFactureHtml(colis, qrCodeUrl)}
    <div class="page-break"></div>
    ${getBonCommandeHtml(colis, qrCodeUrl)}
  `;
  
  return writeAndPrint(win, html);
}
