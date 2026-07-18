import { invoke } from "@tauri-apps/api/core";
import QRCode from "qrcode";

export async function generateBonCommande(colis: any) {
  const settings: any = await invoke("get_settings");
  
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const qrImage = await QRCode.toDataURL(colis.tracking_number, {
    width: 220,
    margin: 1,
  });

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Format dynamic fields to match the image requirements
  const companyName = (settings?.company_name || "TRAPPES ROYAL TRA").toUpperCase();
  const dateFormatted = colis.created_at 
    ? new Date(colis.created_at).toLocaleDateString("fr-FR") 
    : new Date().toLocaleDateString("fr-FR");
  const weightFormatted = (colis.weight || 0).toString().replace(".", ",");
  
  const desc = (colis.description || "").trim();
  const piecesText = desc.toLowerCase().includes("sac") ? desc : `1 SAC ${desc}`.trim();
  
  const paymentStatus = (colis.total_amount && colis.total_amount > 0) 
    ? `${colis.total_amount} DH` 
    : "PAYE";

  doc.open();
  doc.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Bon de Commande</title>
<style>
@page {
  size: 100mm 40mm;
  margin: 0;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  width: 100mm;
  height: 40mm;
  background: #fff;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
}
.label-container {
  width: 100mm;
  height: 40mm;
  display: flex;
  border: 1.5px solid #000;
  overflow: hidden;
}

/* Columns */
.left-col {
  width: 38mm;
  height: 100%;
  border-right: 1.5px solid #000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2px 2px;
}

.right-col {
  width: 62mm;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Left Column elements */
.company-name {
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qr-code-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.qr-code-wrapper img {
  width: 22mm;
  height: 22mm;
  object-fit: contain;
}

.colis-info {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pieces-text {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.weight-text {
  font-size: 8px;
  font-weight: bold;
}

/* Right Column elements */
.tracking-row {
  height: 10mm;
  background: #000;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1.5px solid #000;
}

.tracking-text {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.receiver-row {
  height: 13mm;
  border-bottom: 1.5px solid #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2px;
  gap: 1px;
}

.receiver-name {
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.receiver-phone {
  font-size: 9px;
  font-weight: bold;
  text-align: center;
}

.destination-row {
  flex: 1;
  display: flex;
  align-items: stretch;
}

.city-box-wrapper {
  width: 62%;
  border-right: 1.5px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1px;
}

.city-box {
  border: 1px solid #000;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1px;
}

.city-title {
  font-size: 5px;
  color: #555;
  text-transform: uppercase;
  text-align: center;
  font-weight: bold;
}

.city-name {
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-date-wrapper {
  width: 38%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  padding: 1px;
}

.payment-status {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
}

.print-date {
  font-size: 7px;
  font-weight: bold;
  text-align: center;
}
</style>
</head>
<body>
<div class="label-container">
    <!-- Left Column -->
    <div class="left-col">
        <div class="company-name">${companyName}</div>
        <div class="qr-code-wrapper">
            <img src="${qrImage}" class="qr">
        </div>
        <div class="colis-info">
            <div class="pieces-text">${piecesText}</div>
            <div class="weight-text">${weightFormatted} (KG)</div>
        </div>
    </div>

    <!-- Right Column -->
    <div class="right-col">
        <div class="tracking-row">
            <span class="tracking-text">${colis.tracking_number}</span>
        </div>
        <div class="receiver-row">
            <div class="receiver-name">${colis.receiver_name}</div>
            <div class="receiver-phone">${colis.receiver_phone}</div>
        </div>
        <div class="destination-row">
            <div class="city-box-wrapper">
                <div class="city-box">
                    <div class="city-title">Pour les objets</div>
                    <div class="city-name">${(colis.receiver_city || "").toUpperCase()}</div>
                </div>
            </div>
            <div class="payment-date-wrapper">
                <div class="payment-status">${paymentStatus}</div>
                <div class="print-date">${dateFormatted}</div>
            </div>
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