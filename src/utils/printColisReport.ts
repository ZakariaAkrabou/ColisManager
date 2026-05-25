import type { ColisItem } from "../types/colis";

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

function buildTableRows(colisList: ColisItem[]): string {
    return colisList
        .map(
            (colis) => `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 12px 8px; font-weight: bold; font-family: monospace;">${escapeHtml(colis.trackingNo)}</td>
        <td style="padding: 12px 8px;">${escapeHtml(colis.sender)}</td>
        <td style="padding: 12px 8px;">${escapeHtml(colis.receiver)}</td>
        <td style="padding: 12px 8px;">${escapeHtml(colis.city)}</td>
        <td style="padding: 12px 8px;"><span style="background-color: #F3F4F6; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">${escapeHtml(colis.type)}</span></td>
        <td style="padding: 12px 8px; text-align: right;">${colis.weight.toFixed(1)} kg</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: bold;">${colis.totalPrice.toFixed(2)} DH</td>
      </tr>
    `,
        )
        .join("");
}

function buildPrintHtml(colisList: ColisItem[]): string {
    const totalWeight = colisList.reduce((sum, c) => sum + c.weight, 0).toFixed(1);
    const totalAmount = colisList
        .reduce((sum, c) => sum + c.totalPrice, 0)
        .toFixed(2);
    const tableRows = buildTableRows(colisList);

    return `
    <html>
      <head>
        <title>Rapport des Colis - ColisManager</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #374151; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2B4C8C; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #2B4C8C; margin: 0; }
          .meta { font-size: 12px; color: #6B7280; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background-color: #F9FAFB; border-bottom: 2px solid #E5E7EB; color: #4B5563; font-weight: 600; padding: 12px 8px; text-align: left; }
          .summary { margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 20px; display: flex; justify-content: flex-end; gap: 40px; }
          .summary-item { text-align: right; }
          .summary-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; }
          .summary-val { font-size: 18px; font-weight: bold; color: #111827; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Rapport des Colis</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6B7280;">ColisManager - Gestion Professionnelle des Expeditions</p>
          </div>
          <div class="meta">
            <p style="margin: 0;"><strong>Date d'impression:</strong> ${new Date().toLocaleDateString("fr-FR")}</p>
            <p style="margin: 5px 0 0 0;"><strong>Total Colis:</strong> ${colisList.length}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>N°Track</th>
              <th>Expediteur</th>
              <th>Destinataire</th>
              <th>Ville</th>
              <th>Type</th>
              <th style="text-align: right;">Poids</th>
              <th style="text-align: right;">Prix Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Poids Total</div>
            <div class="summary-val">${totalWeight} kg</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Montant Total</div>
            <div class="summary-val" style="color: #E26D28;">${totalAmount} DH</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `;
}

export function printColisReport(colisList: ColisItem[]): boolean {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        return false;
    }

    printWindow.document.write(buildPrintHtml(colisList));
    printWindow.document.close();

    return true;
}
