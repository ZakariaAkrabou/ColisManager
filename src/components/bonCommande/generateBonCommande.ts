import { invoke } from "@tauri-apps/api/core";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

export async function generateBonCommande(colis: any) {
  const settings: any = await invoke("get_settings");

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  // Generate QR Code
  const qrImage = await QRCode.toDataURL(colis.tracking_number || "NO-TRACKING", {
    width: 150,
    margin: 1,
  });

  // Generate Barcode
  let barcodeImage = "";
  try {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, colis.tracking_number || "000000000", {
      format: "CODE128",
      width: 2,
      height: 36,
      displayValue: false,
      margin: 0,
      background: "#ffffff",
      lineColor: "#000000",
    });
    barcodeImage = canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Error generating barcode:", err);
  }

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Format fields
  const companyName = settings?.company_name || "Olivraison";
  const companyPhone = settings?.phone || "+212.520.015.583";
  const logoPath: string | null = settings?.logo_path || null;
  const companyInitial = companyName.charAt(0).toUpperCase();

  // Build logo HTML: use image if logo_path is set, otherwise use initials badge
  const logoHtml = logoPath
    ? `<img src="${logoPath}" class="company-logo-img" alt="Logo">`
    : `<div class="company-logo-initials">${companyInitial}</div>`;
  const dateFormatted = colis.created_at
    ? new Date(colis.created_at).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const receiverCity = (colis.receiver_city || "CASABLANCA").toUpperCase();
  const receiverName = colis.receiver_name || "client";
  const receiverAddress = colis.receiver_full_address || colis.receiver_address || "";
  const receiverPhone = colis.receiver_phone || "";

  const senderName = colis.sender_name || settings?.owner_name || "Expéditeur";
  const senderPhone = colis.sender_phone || settings?.phone || "";
  const senderCity = (colis.sender_address || colis.sender_city || "SALE").toUpperCase();

  const productNature = colis.description || "Colis standard";

  const totalAmountFormatted = colis.total_amount
    ? Number(colis.total_amount).toFixed(2) + " DH"
    : "0.00 DH";

  const crbtText = colis.paid ? "PAYÉ" : "CRBT: C/Espèce";
  const trackingNumber = colis.tracking_number || "";

  doc.open();
  doc.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Bon de Commande</title>
<style>
@page {
  size: 50mm 50mm;
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 50mm;
  height: 50mm;
  overflow: hidden;
  background: #fff;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.label-container {
  width: 50mm;
  height: 50mm;
  box-sizing: border-box;
  padding: 1mm 1.2mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  background: #fff;
}

/* Header */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 9.5mm;
  width: 100%;
}

.company-section {
  display: flex;
  align-items: center;
  gap: 1.2mm;
  flex: 1;
  overflow: hidden;
}

.company-logo-img {
  width: 8mm;
  height: 8mm;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 1mm;
}

.company-logo-initials {
  width: 8mm;
  height: 8mm;
  flex-shrink: 0;
  background: #008e82 !important;
  color: #fff !important;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
  border-radius: 1mm;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.company-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.company-title {
  font-size: 7.5px;
  font-weight: 900;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.company-phone {
  font-size: 5.2px;
  font-weight: 700;
  color: #111;
  white-space: nowrap;
  line-height: 1.1;
  margin-top: 0.5px;
}

.qr-section {
  width: 9.5mm;
  height: 9.5mm;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.qr-section img {
  width: 9mm;
  height: 9mm;
  object-fit: contain;
}

/* Date */
.date-label {
  font-size: 4.5px;
  font-weight: 600;
  color: #222;
  margin-top: 0.2mm;
  margin-bottom: 0.3mm;
  line-height: 1;
}

/* Destinataire & HUB row */
.destinataire-hub-row {
  display: flex;
  gap: 1mm;
  height: 9.8mm;
  width: 100%;
}

.destinataire-box {
  flex: 1.85;
  border: 0.8px solid #000;
  padding: 0.5mm 0.8mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.destinataire-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.destinataire-title {
  font-size: 5px;
  font-weight: 900;
}

.city-badge {
  border: 0.8px solid #000;
  padding: 0.1mm 0.8mm;
  font-size: 4.5px;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.1;
}

.destinataire-name {
  font-size: 4.8px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.destinataire-address {
  font-size: 4.2px;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.destinataire-phone {
  font-size: 4.8px;
  font-weight: 900;
  line-height: 1.1;
}

.hub-box {
  flex: 1;
  border: 0.8px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0.4mm;
  overflow: hidden;
}

.hub-text {
  font-size: 5.2px;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.15;
}

/* CRBT & Barcode row */
.crbt-barcode-row {
  display: flex;
  gap: 1mm;
  height: 7.6mm;
  width: 100%;
  align-items: stretch;
}

.crbt-box {
  width: 16mm;
  background: #008e82 !important;
  color: #fff !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.3mm 0.5mm;
  flex-shrink: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.crbt-title {
  font-size: 4px;
  font-weight: 700;
  line-height: 1;
}

.crbt-amount {
  font-size: 7px;
  font-weight: 900;
  white-space: nowrap;
  line-height: 1.15;
}

.barcode-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.tracking-code {
  font-size: 4.8px;
  font-weight: 900;
  letter-spacing: 0.2px;
  white-space: nowrap;
  line-height: 1;
  margin-bottom: 0.2mm;
}

.barcode-img {
  width: 100%;
  height: 4.8mm;
  object-fit: fill;
  display: block;
}

/* Expéditeur & Nature du produit */
.expediteur-nature-row {
  display: flex;
  border: 0.8px solid #000;
  height: 8.8mm;
  width: 100%;
}

.expediteur-col {
  width: 50%;
  border-right: 0.8px solid #000;
  padding: 0.4mm 0.8mm;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  overflow: hidden;
}

.col-header {
  font-size: 4.8px;
  font-weight: 900;
  line-height: 1;
}

.expediteur-name {
  font-size: 4.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.expediteur-phone {
  font-size: 4.5px;
  font-weight: 900;
  line-height: 1.1;
}

.expediteur-city {
  font-size: 4.5px;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.1;
}

.nature-col {
  width: 50%;
  padding: 0.4mm 0.8mm;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nature-desc {
  font-size: 4.5px;
  font-weight: 600;
  margin-top: 0.3mm;
  line-height: 1.15;
  word-break: break-word;
}

/* Bottom instructions row */
.bottom-instructions-row {
  display: flex;
  gap: 1mm;
  height: 6.8mm;
  width: 100%;
}

.notice-box-left {
  flex: 1;
  border: 0.8px solid #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0.3mm;
  overflow: hidden;
}

.arabic-bold {
  font-size: 4.5px;
  font-weight: 900;
  line-height: 1.1;
  direction: rtl;
}

.french-sub {
  font-size: 3.8px;
  font-weight: 600;
  line-height: 1.1;
}

.arabic-sub {
  font-size: 4px;
  font-weight: 700;
  line-height: 1.1;
  direction: rtl;
}

.notice-box-right {
  flex: 1.5;
  border: 0.8px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0.4mm;
  overflow: hidden;
}

.notice-box-right .arabic-bold {
  font-size: 5px;
  font-weight: 900;
  direction: rtl;
}
</style>
</head>
<body>
<div class="label-container">
    <!-- Header: Logo, Company Info & QR Code -->
    <div class="header-row">
        <div class="company-section">
            ${logoHtml}
            <div class="company-details">
                <div class="company-title">${companyName}</div>
                <div class="company-phone">${companyPhone}</div>
            </div>
        </div>
        <div class="qr-section">
            <img src="${qrImage}" alt="QR">
        </div>
    </div>

    <!-- Date -->
    <div class="date-label">Date: ${dateFormatted}</div>

    <!-- Destinataire & HUB row -->
    <div class="destinataire-hub-row">
        <div class="destinataire-box">
            <div class="destinataire-header">
                <span class="destinataire-title">Destinataire</span>
                <span class="city-badge">${receiverCity}</span>
            </div>
            <div class="destinataire-name">${receiverName}</div>
            <div class="destinataire-address">${receiverAddress}</div>
            <div class="destinataire-phone">Tél: ${receiverPhone}</div>
        </div>
        <div class="hub-box">
            <div class="hub-text">HUB ${receiverCity}</div>
        </div>
    </div>

    <!-- CRBT & Barcode row -->
    <div class="crbt-barcode-row">
        <div class="crbt-box">
            <div class="crbt-title">${crbtText}</div>
            <div class="crbt-amount">${totalAmountFormatted}</div>
        </div>
        <div class="barcode-box">
            <div class="tracking-code">#${trackingNumber}</div>
            ${barcodeImage ? `<img class="barcode-img" src="${barcodeImage}" alt="Barcode">` : ""}
        </div>
    </div>

    <!-- Expéditeur & Nature du produit -->
    <div class="expediteur-nature-row">
        <div class="expediteur-col">
            <div class="col-header">Expéditeur</div>
            <div class="expediteur-name">${senderName}</div>
            <div class="expediteur-phone">Tél: ${senderPhone}</div>
            <div class="expediteur-city">${senderCity}</div>
        </div>
        <div class="nature-col">
            <div class="col-header">Nature du produit</div>
            <div class="nature-desc">${productNature}</div>
        </div>
    </div>

    <!-- Bottom instructions row -->
    <div class="bottom-instructions-row">
        <div class="notice-box-left">
            <div class="arabic-bold">يمكن فتح الطرد</div>
            <div class="french-sub">Essayage interdit</div>
            <div class="arabic-sub">لا يسمح بالقياس</div>
        </div>
        <div class="notice-box-right">
            <div class="arabic-bold">شركتنا مكلفة بالتوصيل فقط</div>
        </div>
    </div>
</div>
</body>
</html>
  `);

  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}