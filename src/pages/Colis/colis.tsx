import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Scale,
  MapPin,
  TrendingUp,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";

// ─── Mock Data ────────────────────────────────────────────────────────────────

type ColisStatus = "Livré" | "En transit" | "En attente";
type ColisType = "Standard" | "Express" | "Fragile";

interface ColisItem {
  id: string;
  trackingNo: string;
  sender: string;
  receiver: string;
  city: string;
  type: ColisType;
  weight: number;
  totalPrice: number;
  status: ColisStatus;
  date: string;
}

const initialColisData: ColisItem[] = [
  { id: "CLS001", trackingNo: "TRK-98302-MA", sender: "Zakaria Akrabou",    receiver: "Fatima Zahra",        city: "Casablanca", type: "Express",  weight: 2.5,  totalPrice: 120.0, status: "Livré",      date: "2026-05-24" },
  { id: "CLS002", trackingNo: "TRK-48201-MA", sender: "Anass El Madi",      receiver: "Jean Dupont",          city: "Rabat",      type: "Standard", weight: 5.0,  totalPrice: 85.0,  status: "En transit", date: "2026-05-23" },
  { id: "CLS003", trackingNo: "TRK-74921-MA", sender: "Yassine Mansouri",   receiver: "Khadija Bennani",     city: "Marrakech",  type: "Fragile",  weight: 1.2,  totalPrice: 150.0, status: "En attente", date: "2026-05-25" },
  { id: "CLS004", trackingNo: "TRK-10932-MA", sender: "Meriem Sadiki",      receiver: "Omar Fassi",           city: "Tanger",     type: "Express",  weight: 0.8,  totalPrice: 110.0, status: "Livré",      date: "2026-05-22" },
  { id: "CLS005", trackingNo: "TRK-88301-MA", sender: "Karim Tazi",         receiver: "Samira Alaoui",        city: "Fès",        type: "Standard", weight: 12.4, totalPrice: 240.0, status: "En transit", date: "2026-05-21" },
  { id: "CLS006", trackingNo: "TRK-33491-MA", sender: "Said Amrani",        receiver: "Lina Cherkaoui",       city: "Casablanca", type: "Fragile",  weight: 3.1,  totalPrice: 180.0, status: "En attente", date: "2026-05-24" },
  { id: "CLS007", trackingNo: "TRK-66482-MA", sender: "Noureddine Bennis",  receiver: "Mounir Riad",          city: "Oujda",      type: "Standard", weight: 8.5,  totalPrice: 130.0, status: "Livré",      date: "2026-05-20" },
  { id: "CLS008", trackingNo: "TRK-55209-MA", sender: "Siham El Amri",      receiver: "Tariq Jamil",          city: "Agadir",     type: "Express",  weight: 1.5,  totalPrice: 140.0, status: "Livré",      date: "2026-05-23" },
  { id: "CLS009", trackingNo: "TRK-12903-MA", sender: "Youssef Filali",     receiver: "Rachida Benjelloun",   city: "Rabat",      type: "Fragile",  weight: 0.5,  totalPrice: 95.0,  status: "En transit", date: "2026-05-25" },
  { id: "CLS010", trackingNo: "TRK-88402-MA", sender: "Houda Chraibi",      receiver: "Amine Touimi",         city: "Meknès",     type: "Standard", weight: 6.2,  totalPrice: 90.0,  status: "En attente", date: "2026-05-24" },
  { id: "CLS011", trackingNo: "TRK-23910-MA", sender: "Driss El Fassi",     receiver: "Zineb Berrada",        city: "Marrakech",  type: "Express",  weight: 4.0,  totalPrice: 165.0, status: "Livré",      date: "2026-05-19" },
  { id: "CLS012", trackingNo: "TRK-90432-MA", sender: "Amina Lahlou",       receiver: "Farid Kadiri",         city: "Casablanca", type: "Standard", weight: 15.0, totalPrice: 310.0, status: "En transit", date: "2026-05-25" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ColisProps {
  onNavigateToAdd: () => void;
  pendingColis?: any | null;
  onPendingConsumed?: () => void;
}

export default function Colis({ onNavigateToAdd, pendingColis, onPendingConsumed }: ColisProps) {
  const [colisList, setColisList] = useState<ColisItem[]>(initialColisData);
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 5;

  // Consume pending colis passed from the AddColis page via layout
  useEffect(() => {
    if (pendingColis) {
      setColisList((prev) => [pendingColis, ...prev]);
      onPendingConsumed?.();
    }
  }, [pendingColis, onPendingConsumed]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredColis = useMemo(() => {
    return colisList.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        c.trackingNo.toLowerCase().includes(q) ||
        c.sender.toLowerCase().includes(q) ||
        c.receiver.toLowerCase().includes(q);
      const matchCity = !selectedCity || c.city === selectedCity;
      return matchSearch && matchCity;
    });
  }, [colisList, searchTerm, selectedCity]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalItems       = filteredColis.length;
  const totalPages       = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
    return filteredColis.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredColis, indexOfFirstItem, indexOfLastItem, currentPage, totalPages]);

  // ── Unique cities for filter ───────────────────────────────────────────────
  const cities = useMemo(
    () => Array.from(new Set(colisList.map((c) => c.city))).sort(),
    [colisList]
  );

  // ── KPI Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   colisList.length,
    weight:  colisList.reduce((a, c) => a + c.weight, 0).toFixed(1),
    revenue: colisList.reduce((a, c) => a + c.totalPrice, 0).toFixed(2),
    express: colisList.filter((c) => c.type === "Express").length,
  }), [colisList]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // DETAILS
  const handleDetails = (colis: ColisItem) => {
    const statusColor =
      colis.status === "Livré"      ? "bg-green-100 text-green-800" :
      colis.status === "En transit" ? "bg-blue-100 text-blue-800"   :
                                      "bg-yellow-100 text-yellow-800";


    Swal.fire({
      title: "Détails du Colis",
      html: `
        <div style="text-align:left;font-family:sans-serif;font-size:14px">
          <div style="display:flex;align-items:center;gap:10px;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid #f3f4f6">
            <div style="background:#FDF1EA;padding:8px;border-radius:8px;color:#E26D28;display:flex;align-items:center;justify-content:center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
            </div>
            <div>
              <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em">Numéro de Suivi</div>
              <div style="font-family:monospace;font-weight:700;font-size:16px;color:#111827">${colis.trackingNo}</div>
            </div>
            <span style="margin-left:auto;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600" class="${statusColor}">${colis.status}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid #f3f4f6">
            <div><div style="font-size:11px;color:#9ca3af">Expéditeur</div><div style="font-weight:600;color:#374151;margin-top:2px">${colis.sender}</div></div>
            <div><div style="font-size:11px;color:#9ca3af">Destinataire</div><div style="font-weight:600;color:#374151;margin-top:2px">${colis.receiver}</div></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid #f3f4f6">
            <div>
              <div style="font-size:11px;color:#9ca3af">Ville</div>
              <div style="font-weight:600;color:#374151;margin-top:2px;display:flex;align-items:center;gap:4px">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                ${colis.city}
              </div>
            </div>
            <div><div style="font-size:11px;color:#9ca3af">Type</div><div style="margin-top:4px"><span style="padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600">${colis.type}</span></div></div>
            <div><div style="font-size:11px;color:#9ca3af">Date</div><div style="font-weight:600;color:#374151;margin-top:2px">${colis.date}</div></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div><div style="font-size:11px;color:#9ca3af">Poids</div><div style="font-weight:700;font-size:18px;color:#111827;margin-top:2px">${colis.weight.toFixed(1)} <span style="font-size:12px;color:#9ca3af">kg</span></div></div>
            <div><div style="font-size:11px;color:#9ca3af">Prix Total</div><div style="font-weight:900;font-size:22px;color:#E26D28;margin-top:2px">${colis.totalPrice.toFixed(2)} <span style="font-size:12px;color:#9ca3af">DH</span></div></div>
          </div>
        </div>
      `,
      showCloseButton: true,
      confirmButtonText: "Fermer",
      confirmButtonColor: "#2B4C8C",
      customClass: { popup: "rounded-xl", confirmButton: "rounded-lg px-6 py-2" },
    });
  };

  // EDIT
  const handleEdit = (colis: ColisItem) => {
    Swal.fire({
      title: "Modifier le Colis",
      html: `
        <div style="text-align:left;font-family:sans-serif;font-size:13px;display:flex;flex-direction:column;gap:10px">
          <p style="color:#6b7280;margin:0 0 4px">Colis <strong style="font-family:monospace">${colis.trackingNo}</strong></p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div>
              <label style="display:block;font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:4px;text-transform:uppercase">Expéditeur *</label>
              <input id="e-sender" type="text" value="${colis.sender}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box">
            </div>
            <div>
              <label style="display:block;font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:4px;text-transform:uppercase">Destinataire *</label>
              <input id="e-receiver" type="text" value="${colis.receiver}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
            <div>
              <label style="display:block;font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:4px;text-transform:uppercase">Ville *</label>
              <input id="e-city" type="text" value="${colis.city}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box">
            </div>
            <div>
              <label style="display:block;font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:4px;text-transform:uppercase">Type</label>
              <select id="e-type" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box">
                <option value="Standard" ${colis.type==="Standard"?"selected":""}>Standard</option>
                <option value="Express"  ${colis.type==="Express" ?"selected":""}>Express</option>
                <option value="Fragile"  ${colis.type==="Fragile" ?"selected":""}>Fragile</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:4px;text-transform:uppercase">Poids (kg)</label>
              <input id="e-weight" type="number" step="0.1" min="0.1" value="${colis.weight}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box">
            </div>
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:4px;text-transform:uppercase">Prix Total (DH)</label>
            <input id="e-price" type="number" step="0.01" min="0" value="${colis.totalPrice}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sauvegarder",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#E26D28",
      cancelButtonColor: "#6B7280",
      customClass: { popup: "rounded-xl" },
      preConfirm: () => {
        const sender     = (document.getElementById("e-sender")   as HTMLInputElement).value.trim();
        const receiver   = (document.getElementById("e-receiver") as HTMLInputElement).value.trim();
        const city       = (document.getElementById("e-city")     as HTMLInputElement).value.trim();
        const type       = (document.getElementById("e-type")     as HTMLSelectElement).value;
        const weight     = parseFloat((document.getElementById("e-weight") as HTMLInputElement).value);
        const totalPrice = parseFloat((document.getElementById("e-price")  as HTMLInputElement).value);
        if (!sender || !receiver || !city || isNaN(weight) || isNaN(totalPrice)) {
          Swal.showValidationMessage("Veuillez remplir tous les champs obligatoires.");
          return false;
        }
        return { sender, receiver, city, type, weight, totalPrice };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setColisList((prev) =>
          prev.map((item) => item.id === colis.id ? { ...item, ...result.value } : item)
        );
        Swal.fire({ title: "Mis à jour !", text: "Le colis a été modifié.", icon: "success", timer: 1400, showConfirmButton: false });
      }
    });
  };

  // DELETE
  const handleDelete = async (id: string, trackingNo: string) => {
    const result = await Swal.fire({
      title: "Supprimer ce colis ?",
      text: `Le colis ${trackingNo} sera supprimé définitivement.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#E26D28",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      focusCancel: true,
      customClass: { popup: "rounded-xl", confirmButton: "rounded-lg", cancelButton: "rounded-lg" },
    });
    if (result.isConfirmed) {
      setColisList((prev) => prev.filter((c) => c.id !== id));
      await Swal.fire({ title: "Supprimé !", text: "Le colis a été retiré.", icon: "success", timer: 1400, showConfirmButton: false });
    }
  };

  // PRINT
  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) { Swal.fire("Erreur", "Autorisez les fenêtres contextuelles.", "error"); return; }

    const rows = filteredColis.map((c) => `
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:10px 8px;font-family:monospace;font-weight:700">${c.trackingNo}</td>
        <td style="padding:10px 8px">${c.sender}</td>
        <td style="padding:10px 8px">${c.receiver}</td>
        <td style="padding:10px 8px">${c.city}</td>
        <td style="padding:10px 8px"><span style="background:#f3f4f6;padding:2px 8px;border-radius:9999px;font-size:11px">${c.type}</span></td>
        <td style="padding:10px 8px;text-align:right">${c.weight.toFixed(1)} kg</td>
        <td style="padding:10px 8px;text-align:right;font-weight:700">${c.totalPrice.toFixed(2)} DH</td>
      </tr>
    `).join("");

    const totalRevenue = filteredColis.reduce((s, c) => s + c.totalPrice, 0);
    const totalWeight  = filteredColis.reduce((s, c) => s + c.weight,    0);

    win.document.write(`<html><head><title>Rapport Colis - ColisManager</title>
      <style>
        body{font-family:'Segoe UI',sans-serif;color:#374151;padding:40px;margin:0}
        .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2B4C8C;padding-bottom:20px;margin-bottom:28px}
        .title{font-size:22px;font-weight:900;color:#2B4C8C;margin:0}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{background:#f9fafb;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:700;padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
        .summary{margin-top:32px;border-top:1px solid #e5e7eb;padding-top:20px;display:flex;justify-content:flex-end;gap:48px}
        .s-label{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em}
        .s-val{font-size:20px;font-weight:900;color:#111827;margin-top:2px}
        @media print{button{display:none}}
      </style></head><body>
      <div class="hdr">
        <div>
          <h1 class="title">Rapport des Colis</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280">ColisManager — Gestion Professionnelle des Expéditions</p>
        </div>
        <div style="text-align:right;font-size:12px;color:#6b7280">
          <div><strong>Date:</strong> ${new Date().toLocaleDateString("fr-FR")}</div>
          <div style="margin-top:4px"><strong>Total colis:</strong> ${filteredColis.length}</div>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>N°Track</th><th>Expéditeur</th><th>Destinataire</th><th>Ville</th><th>Type</th>
          <th style="text-align:right">Poids</th><th style="text-align:right">Prix Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="summary">
        <div><div class="s-label">Poids Total</div><div class="s-val">${totalWeight.toFixed(1)} kg</div></div>
        <div><div class="s-label">Montant Total</div><div class="s-val" style="color:#E26D28">${totalRevenue.toFixed(2)} DH</div></div>
      </div>
      <script>window.onload=function(){window.print();setTimeout(()=>window.close(),500);}</script>
    </body></html>`);
    win.document.close();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Colis</h2>
        <p className="text-sm text-gray-500 mt-1">Gérez, suivez et imprimez le rapport de vos envois de colis.</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Colis",    value: String(stats.total),                                          suffix: "",    icon: Package,    bg: "bg-brand-blue/10",  color: "text-brand-blue" },
          { label: "Poids Cumulé",   value: stats.weight,                                                 suffix: "kg",  icon: Scale,      bg: "bg-brand-orange/10",color: "text-brand-orange" },
          { label: "Revenu Total",   value: parseFloat(stats.revenue).toLocaleString("fr-FR"),            suffix: "DH",  icon: DollarSign, bg: "bg-emerald-50",     color: "text-emerald-600" },
          { label: "Envois Express", value: String(stats.express),                                        suffix: "",    icon: TrendingUp, bg: "bg-amber-50",       color: "text-amber-600" },
        ].map(({ label, value, suffix, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
            <div className={`${bg} p-3 rounded-xl ${color} shadow-sm`}><Icon size={22} /></div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-black text-gray-800 mt-0.5">
                {value} {suffix && <span className="text-sm font-bold text-gray-500">{suffix}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800">Liste des Expéditions</h3>
            <span className="bg-[#FDF1EA] text-brand-orange text-xs px-2.5 py-0.5 rounded-full font-bold border border-orange-100">
              {filteredColis.length} enregistrement(s)
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="N°Track, expéditeur, destinataire..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white w-full transition-all text-gray-700"
              />
            </div>

            {/* City filter */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all text-gray-600 appearance-none cursor-pointer font-medium"
              >
                <option value="">Toutes les villes</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <Filter size={13} />
              </div>
            </div>

            {/* Imprimer */}
            <button
              onClick={handlePrint}
              disabled={filteredColis.length === 0}
              className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-[#1A3362] transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={15} />
              Imprimer
            </button>

            {/* Ajouter Colis */}
            <button
              onClick={onNavigateToAdd}
              className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus size={15} />
              Ajouter Colis
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/70 text-gray-500 border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">N°Track</th>
                <th className="px-6 py-4">Expéditeur</th>
                <th className="px-6 py-4">Destinataire</th>
                <th className="px-6 py-4">Ville</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-right">Poids</th>
                <th className="px-6 py-4 text-right">Total Price</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? currentItems.map((colis) => (
                <tr key={colis.id} className="hover:bg-gray-50/80 transition-colors group">

                  {/* N°Track */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={15} className="text-gray-400 group-hover:text-brand-orange transition-colors shrink-0" />
                      <span className="font-bold font-mono text-gray-800">{colis.trackingNo}</span>
                    </div>
                  </td>

                  {/* Expéditeur */}
                  <td className="px-6 py-4 font-medium text-gray-700">{colis.sender}</td>

                  {/* Destinataire */}
                  <td className="px-6 py-4 text-gray-600">{colis.receiver}</td>

                  {/* Ville */}
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      {colis.city}
                    </div>
                  </td>

                  {/* Type badge */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      colis.type === "Express" ? "bg-red-50 text-red-700 border border-red-100"       :
                      colis.type === "Fragile" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                                 "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      {colis.type}
                    </span>
                  </td>

                  {/* Poids */}
                  <td className="px-6 py-4 text-right font-semibold text-gray-600">
                    {colis.weight.toFixed(1)} <span className="text-xs text-gray-400 font-normal">kg</span>
                  </td>

                  {/* Total Price */}
                  <td className="px-6 py-4 text-right font-black text-gray-800">
                    {colis.totalPrice.toFixed(2)} <span className="text-[10px] text-gray-400 font-bold">DH</span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleDetails(colis)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer" title="Détails"><Eye size={16} /></button>
                      <button onClick={() => handleEdit(colis)}    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Modifier"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(colis.id, colis.trackingNo)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Supprimer"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={36} className="text-gray-300 stroke-[1.5]" />
                      <span className="font-medium text-gray-400 text-sm">Aucun colis trouvé</span>
                      <p className="text-xs text-gray-300 max-w-xs">Essayez d'ajuster vos critères de recherche ou supprimez les filtres.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <span className="text-xs text-gray-500 font-medium">
              Affichage de <span className="font-bold text-gray-700">{indexOfFirstItem + 1}</span> à{" "}
              <span className="font-bold text-gray-700">{Math.min(indexOfLastItem, totalItems)}</span> sur{" "}
              <span className="font-bold text-gray-700">{totalItems}</span> colis
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-brand-orange text-white border border-brand-orange shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
