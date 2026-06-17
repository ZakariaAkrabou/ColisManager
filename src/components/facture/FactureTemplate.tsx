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
@page { size: A4 portrait; margin: 12mm; }

body{
  font-family: Arial;
  margin:0;
  background:#fff;
  color:#222;
}

.container{
  border:3px solid #2b6cb0;
  padding:15px;
  border-radius:10px;
}

/* HEADER */
.header{
  text-align:center;
  border-bottom:3px solid #e63946;
  padding-bottom:10px;
}

.logo{
  height:50px;
  margin-bottom:5px;
}

.title{
  font-size:20px;
  font-weight:bold;
  color:#2b6cb0;
}

.subtitle{
  font-size:11px;
  color:#555;
  line-height:1.5;
}

.tracking{
  margin-top:8px;
  background:#e63946;
  color:white;
  padding:6px 10px;
  display:inline-block;
  border-radius:6px;
  font-weight:bold;
}

/* SECTIONS */
.section{
  margin-top:15px;
  border:1px solid #eee;
  padding:10px;
  border-radius:8px;
}

.section h4{
  margin:0 0 6px 0;
  font-size:12px;
  color:#e63946;
  border-left:4px solid #2b6cb0;
  padding-left:6px;
}

.info{
  font-size:12px;
  line-height:1.6;
}

/* TABLE */
table{
  width:100%;
  margin-top:10px;
  border-collapse:collapse;
  font-size:12px;
}

th{
  background:#000;
  color:#fff;
  padding:10px;
  font-weight:bold;
  text-transform:uppercase;
  letter-spacing:0.5px;
}

td{
  border:1px solid #eee;
  padding:8px;
  text-align:center;
}

.status{
  background:#e63946;
  color:black;
  padding:4px 8px;
  border-radius:6px;
  font-size:11px;
}

/* TOTAL */
.total{
  margin-top:15px;
  text-align:right;
  font-size:16px;
  font-weight:bold;
  color:#e63946;
}

.footer{
  margin-top:10px;
  text-align:center;
  font-size:30px;
  color:green;
}
</style>
</head>

<body onload="window.print()">

<div class="container">

  <!-- COMPANY HEADER -->
  <div class="header">

    ${settings.logo_path ? `<img src="${settings.logo_path}" class="logo"/>` : ""}

    <div class="title">${settings.company_name}</div>

    <div class="subtitle">
      ${settings.owner_name}<br/>
      ${settings.phone} ${settings.phone2 ? " | " + settings.phone2 : ""}<br/>
      ${settings.email}<br/>
      ${settings.address}
    </div>

    <div class="tracking">
      Tracking: ${colis.tracking_number}
    </div>
  </div>

  <!-- SENDER -->
  <div class="section">
    <h4>Expéditeur</h4>
    <div class="info">
      ${colis.sender_name}<br/>
      ${colis.sender_phone}<br/>
      ${colis.sender_address}
    </div>
  </div>

  <!-- RECEIVER -->
  <div class="section">
    <h4>Destinataire</h4>
    <div class="info">
      ${colis.receiver_name}<br/>
      ${colis.receiver_phone}<br/>
      ${colis.receiver_full_address}<br/>
      ${colis.receiver_country} - ${colis.receiver_region} - ${colis.receiver_city}
    </div>
  </div>

  <!-- DETAILS -->
  <div class="section">
    <h4>Détails du colis</h4>

    <table>
      <thead>
        <tr>
          <th>Tracking</th>
          <th>Poids</th>
          <th>Type</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${colis.tracking_number}</td>
          <td>${colis.weight} KG</td>
          <td>${colis.delivery_type}</td>
          <td><span class="status">${colis.status}</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- TOTAL -->
  <div class="total">
    TOTAL: ${colis.total_amount} DH
  </div>

  <div class="footer">
 PAYE
  </div>

</div>

</body>
</html>
`;
}