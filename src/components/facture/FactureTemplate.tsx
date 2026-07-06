
// path = src/components/facture/FactureTemplate.tsx

import { ReportColis } from "../reports/ReportsTable";

type Settings = {
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  phone2?: string;
  address: string;
  logo_path?: string;
};

export function factureTemplate(colis: ReportColis, settings: Settings) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Facture</title>

<style>
@page{
  size:80mm auto;
  margin:0;
}

html,
body{
  margin:0;
  padding:0;
  background:#fff;
  color:#000;
  font-family:Arial,sans-serif;
  width:100%;
}

*{
  box-sizing:border-box;
}

.container{
  width:90%;
  margin:2 auto;
  padding:4mm;
  border:1px solid #000;
}

/* HEADER */

.header{
  text-align:center;
  border-bottom:1px dashed #000;
  padding-bottom:6px;
}

.logo{
  height:45px;
  max-width:100%;
  object-fit:contain;
  margin-bottom:4px;
}

.title{
  font-size:25px;
  font-weight:bold;
  text-transform:uppercase;
}
.value{
  font-size:12px;
  font-weight:normal;
}

.subtitle{
  margin-top:4px;
  font-size:10px;
  line-height:1.4;
}

.tracking{
  margin-top:6px;
  border:1px solid #000;
  padding:4px;
  font-size:15px;
  font-weight:bold;
}

/* SECTION */

.section{
  margin-top:8px;
  padding-top:6px;
  border-top:1px dashed #000;
}

.section-title{
  text-align:center;
  font-size:15px;
  font-weight:bold;
  margin-bottom:5px;
  text-transform:uppercase;
}

.info{
  font-size:12px;
  line-height:1.4;
}

/* DETAILS */

.details{
  margin-top:4px;
  font-size:15px;
}

.row{
  display:flex;
  justify-content:space-between;
  gap:10px;
  margin-bottom:2px;
}

.label{
 font-size : 12px;
  font-weight:bold;
}

/* TOTAL */

.total{
  margin-top:8px;
  padding-top:4px;
  border-top:1px dashed #000;
  text-align:center;
  font-size:15px;
  font-weight:bold;
}

/* FOOTER */

.footer{
  margin-top:8px;
  padding-top:4px;
  border-top:1px dashed #000;
  text-align:center;
}

.paid{
  font-size:25px;
  font-weight:bold;
}

.thankyou{
  font-size:8px;
  margin-top:4px;
  font-weight:semi-bold;
}

.date{
  font-size:10px;
  margin-top:2px;
}

@media print{
  html,
  body{
    margin:0 !important;
    padding:0 !important;
  }

  .container{
    margin:0 auto !important;
  }
}
</style>

</head>

<body>

<div class="container">

  <div class="header">

    ${
      settings.logo_path
        ? `<img src="${settings.logo_path}" class="logo" />`
        : ""
    }

    <div class="title">${settings.company_name}</div>

    <div class="subtitle">
      ${settings.owner_name}<br/>
      ${settings.phone}
      ${settings.phone2 ? " / " + settings.phone2 : ""}<br/>
      ${settings.email}<br/>
      ${settings.address}
    </div>

    <div class="tracking">
      TRACKING<br/>
      ${colis.tracking_number}
    </div>

  </div>

  <!-- EXPEDITEUR -->
  <div class="section">

    <div class="section-title">
      EXPÉDITEUR
    </div>

    <div class="info">
      ${colis.sender_name}<br/>
      ${colis.sender_phone}<br/>
      ${colis.sender_address}
    </div>

  </div>

  <!-- DESTINATAIRE -->
  <div class="section">

    <div class="section-title">
      DESTINATAIRE
    </div>

    <div class="info">
      ${colis.receiver_name}<br/>
      ${colis.receiver_phone}<br/>
      ${colis.receiver_full_address}<br/>
      ${colis.receiver_country} -
      ${colis.receiver_region} -
      ${colis.receiver_city}
    </div>

  </div>

  <!-- DETAILS -->
  <div class="section">

    <div class="section-title">
      DÉTAILS DU COLIS
    </div>

    <div class="details">

      <div class="row">
        <span class="label">Tracking:</span>
        <span class="value">${colis.tracking_number}</span>
      </div>

      <div class="row">
        <span class="label">Poids:</span>
        <span class="value">${colis.weight} KG</span>
      </div>
          <div class="row">
        <span class="label">Number De Colis:</span>
        <span class="value"> 1 </span>
      </div>
    
      <div class="row">
        <span class="label">Type:</span>
        <span class="value">${colis.delivery_type}</span>
      </div>

      <div class="row">
        <span class="label">Statut:</span>
        <span class="value">${colis.status}</span>
      </div>

    </div>

  </div>

  <!-- TOTAL -->
  <div class="total">
    TOTAL : ${colis.total_amount} DH
  </div>

  <!-- FOOTER -->
  <div class="footer">

    <div class="paid">
      PAYÉ
    </div>

    <div class="thankyou">
N.B : Tous Les Colis Dépassant 100 Euros Doivent Être Déclarés. Nous Ne Sommes Pas Responsables Des Bagages Non Conformes À La Loi. La Société N’Est Pas Tenue Responsable De Toutes Les Formalités Douanières.
    </div>

    <div class="date">
      ${new Date().toLocaleDateString("fr-FR")}
    </div>

  </div>

</div>

</body>
</html>
`;
}

