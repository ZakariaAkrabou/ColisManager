import { invoke } from "@tauri-apps/api/core";
import JsBarcode from "jsbarcode";

export async function generateBonCommande(colis: any) {
  const settings: any = await invoke("get_settings");
  
    const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // ✅ 1. CREATE BARCODE FIRST (OUTSIDE HTML)
  const canvas = document.createElement("canvas");

  JsBarcode(canvas, colis.tracking_number, {
    format: "CODE128",
    width: 2,
    height: 80,
    displayValue: true,
  });

  const barcodeImg = canvas.toDataURL("image/png");

  // ✅ 2. HTML PRINT TEMPLATE
  doc.open();
  doc.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>

<title>Bon de Commande</title>

<style>
@page{
  size:A4 landscape;
  margin:8mm;
}

*{
  box-sizing:border-box;
}

body{
  margin:0;
  font-family:Arial,sans-serif;
  background:#fff;
  color:#111827;
}

.container{
  width:100%;
  border:2px solid #111827;
  border-radius:12px;
  overflow:hidden;
}

/* HEADER */
.header{
  background:#111827;
  color:white;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:20px;
}

.company{
  font-size:22px;
  font-weight:bold;
    color:#ef4444;

}

.doc-title{
  text-align:right;
}

.doc-title h1{
  margin:0;
  color:#ef4444;
  font-size:28px;
}

/* TRACKING */
.tracking{
  padding:15px;
  text-align:center;
  border-bottom:1px solid #ddd;
}

.tracking-label{
  font-size:12px;
  color:#666;
  text-transform:uppercase;
}

.tracking-number{
  font-size:24px;
  font-weight:bold;
}

/* BARCODE */
.barcode{
  text-align:center;
  padding:15px;
  border-bottom:1px solid #ddd;
}

.barcode img{
  width:100%;
  max-width:500px;
}

/* GRID */
.content{
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:15px;
  padding:15px;
}

.card{
  border:1px solid #ddd;
  border-radius:10px;
  padding:12px;
}

.card-title{
  font-size:12px;
  font-weight:bold;
  color:#ef4444;
  margin-bottom:10px;
  text-transform:uppercase;
}

.row{
  margin-bottom:8px;
}

.label{
  font-size:10px;
  color:#666;
  text-transform:uppercase;
}

.value{
  font-size:14px;
  font-weight:600;
}

/* SIGNATURE */
.signatures{
  display:flex;
  justify-content:space-around;
  padding:30px;
}

.sign-box{
  width:250px;
  text-align:center;
}

.line{
  border-top:2px solid #111827;
  margin-bottom:8px;
}

.sign-title{
  font-weight:bold;
  font-size:13px;
}
</style>

</head>

<body>

<div class="container">

  <!-- HEADER -->
  <div class="header">
    <div class="company">
  ${settings?.company_name || "COMPANY NAME"}
</div>

    <div class="doc-title">
      <h1>BON DE COMMANDE</h1>
      <div style="font-size:12px">
        ${new Date(colis.created_at).toLocaleDateString("fr-FR")}
      </div>
    </div>
  </div>

  <!-- TRACKING -->
  <div class="tracking">
    <div class="tracking-label">Tracking Number</div>
    <div class="tracking-number">
      ${colis.tracking_number}
    </div>
  </div>

  <!-- BARCODE -->
  <div class="barcode">
    <img src="${barcodeImg}" />
  </div>

  <!-- CONTENT -->
  <div class="content">

    <!-- DESTINATAIRE -->
    <div class="card">
      <div class="card-title">Destinataire</div>

      <div class="row">
        <div class="label">Nom</div>
        <div class="value">${colis.receiver_name}</div>
      </div>

      <div class="row">
        <div class="label">Téléphone</div>
        <div class="value">${colis.receiver_phone}</div>
      </div>

      <div class="row">
        <div class="label">Ville</div>
        <div class="value">${colis.receiver_city}</div>
      </div>
    </div>

    <!-- COLIS -->
    <div class="card">
      <div class="card-title">Colis</div>

      <div class="row">
        <div class="label">Description</div>
        <div class="value">${colis.description || "-"}</div>
      </div>

      <div class="row">
        <div class="label">Poids</div>
        <div class="value">${colis.weight} KG</div>
      </div>
    </div>

    <!-- LIVRAISON -->
    <div class="card">
      <div class="card-title">Livraison</div>

      <div class="row">
        <div class="label">Date</div>
        <div class="value">
          ${new Date(colis.created_at).toLocaleDateString("fr-FR")}
        </div>
      </div>

      <div class="row">
        <div class="label">Montant</div>
        <div class="value">${colis.total_amount} DH</div>
      </div>

      <div class="row">
        <div class="label">Tracking</div>
        <div class="value">${colis.tracking_number}</div>
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
  }, 300);
}