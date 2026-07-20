import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
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
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import type { ColisItem, ColisType, ColisStatus } from "../../types/colis";
import { DetailColisModal } from "../../components/colis/detailColis";

type LocalColisItem = ColisItem & { statusRaw?: string; deliveryType?: string };



interface DbColis {
  id: number;
  tracking_number: string;
  sender_name: string;
  receiver_name: string;
  receiver_city?: string;
  receiver_region?: string;
  delivery_type: string;
  weight: number;
  quantity?: number;
  total_amount: number;
  status: string;
  created_at?: string;
}



interface ColisProps {
  onNavigateToAdd: () => void;
  pendingColis?: any | null;
  onPendingConsumed?: () => void;
}

export default function Colis({
  onNavigateToAdd,
  pendingColis,
  onPendingConsumed,
}: ColisProps) {
  const { t, i18n } = useTranslation();
  const [colisList, setColisList] = useState<LocalColisItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetailColis, setSelectedDetailColis] = useState<LocalColisItem | null>(null);

  const normalizeColisStatus = (status: string): ColisStatus => {
    const value = status?.toLowerCase();
    if (value.includes("liv")) return "Livré";
    if (value.includes("trans")) return "En transit";
    if (value.includes("cancel")) return "Annulé";
    return "En attente";
  };

  const normalizeColisType = (deliveryType: string): ColisType => {
    const value = deliveryType?.toLowerCase();
    if (value === "home" || value === "domicile") return "Domicile";
    if (value === "agence" || value === "agency") return "Agence";
    return "Standard";
  };

  const mapDbColisToItem = (item: DbColis): LocalColisItem => ({
    id: String(item.id),
    trackingNo: item.tracking_number,
    sender: item.sender_name,
    receiver: item.receiver_name,
    city: item.receiver_city || item.receiver_region || "—",
    type: normalizeColisType(item.delivery_type),
    deliveryType: item.delivery_type,
    weight: item.weight,
    quantity: item.quantity || 1,
    totalPrice: item.total_amount,
    status: normalizeColisStatus(item.status),
    statusRaw: item.status,
    date: item.created_at ? item.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
  });

  const loadColis = async () => {
    try {
      const data = await invoke<DbColis[]>("get_colis");
      setColisList(data.map(mapDbColisToItem));
    } catch (error) {
      console.error("Failed to load colis:", error);
    }
  };

  useEffect(() => {
    loadColis();
  }, []);
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
  const totalItems = filteredColis.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
    return filteredColis.slice(indexOfFirstItem, indexOfLastItem);
  }, [
    filteredColis,
    indexOfFirstItem,
    indexOfLastItem,
    currentPage,
    totalPages,
  ]);

 
  const cities = useMemo(
    () => Array.from(new Set(colisList.map((c) => c.city))).sort(),
    [colisList],
  );


  const stats = useMemo(
    () => ({
      total: colisList.length,
      weight: colisList.reduce((a, c) => a + c.weight, 0).toFixed(1),
      revenue: colisList.reduce((a, c) => a + c.totalPrice, 0).toFixed(2),
      express: colisList.filter((c) => c.type === "Express").length,
    }),
    [colisList],
  );

  const statusLabel = (status: ColisStatus) => {
    if (status === "Livré") return t("colis.status.delivered");
    if (status === "En transit") return t("colis.status.inTransit");
    if (status === "Annulé") return t("colis.status.cancelled") || "Annulé";
    return t("colis.status.pending");
  };

  const typeLabel = (type: ColisType) => {
    if (type === "Standard") return t("colis.type.standard");
    if (type === "Agence") return t("colis.type.agence") || "À l'agence";
    if (type === "Domicile") return t("colis.type.home") || "À domicile";
    if (type === "Fragile") return t("colis.type.fragile");
    if (type === "Express") return t("colis.type.express") || "Express";
    return type;
  };

 
  const handleDetails = (colis: LocalColisItem) => {
    setSelectedDetailColis(colis);
  };

  const handleEdit = async (colis: LocalColisItem) => {
    let shippingSettings = { agencyDeliveryFee: 20, homeDeliveryFee: 30 };
    try {
      const dbSettings = await invoke<{ agency_delivery_fee: number; home_delivery_fee: number }>("get_shipping_settings");
      if (dbSettings) {
        shippingSettings = {
          agencyDeliveryFee: dbSettings.agency_delivery_fee,
          homeDeliveryFee: dbSettings.home_delivery_fee,
        };
      }
    } catch (e) {
      console.warn("Could not load shipping settings, using defaults", e);
    }

    Swal.fire({
      title: t("colis.editTitle"),
      html: `
        <div class="text-left font-sans text-xs flex flex-col gap-3.5">
          <p class="text-gray-500 dark:text-slate-400 mb-1">Colis <strong class="font-mono">${colis.trackingNo}</strong></p>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Expéditeur *</label>
              <input id="e-sender" type="text" value="${colis.sender}" class="w-full p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Destinataire *</label>
              <input id="e-receiver" type="text" value="${colis.receiver}" class="w-full p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange">
            </div>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div>
              <label class="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Ville *</label>
              <input id="e-city" type="text" value="${colis.city}" class="w-full p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Type de livraison</label>
              <select id="e-type" class="w-full p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange">
                <option value="Agence" ${colis.type === "Agence" || colis.type === "Standard" ? "selected" : ""} class="dark:bg-slate-900">À l'agence</option>
                <option value="Domicile" ${colis.type === "Domicile" ? "selected" : ""} class="dark:bg-slate-900">À domicile</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Poids (kg)</label>
              <input id="e-weight" type="number" step="0.1" min="0.1" value="${colis.weight}" class="w-full p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Quantité</label>
              <input id="e-quantity" type="number" step="1" min="1" value="${colis.quantity || 1}" class="w-full p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Statut</label>
            <select id="e-status" class="w-full p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange">
              <option value="En attente" ${colis.status === "En attente" ? "selected" : ""} class="dark:bg-slate-900">En attente</option>
              <option value="En transit" ${colis.status === "En transit" ? "selected" : ""} class="dark:bg-slate-900">En transit</option>
              <option value="Livré" ${colis.status === "Livré" ? "selected" : ""} class="dark:bg-slate-900">Livré</option>
              <option value="Annulé" ${colis.status === "Annulé" ? "selected" : ""} class="dark:bg-slate-900">Annulé</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Prix Total (DH)</label>
            <input id="e-price" type="number" step="0.01" min="0" value="${colis.totalPrice}" class="w-full p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: t("common.save"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "#E26D28",
      cancelButtonColor: "#6B7280",
      customClass: { popup: "rounded-xl" },
      didOpen: () => {
        const typeEl = document.getElementById("e-type") as HTMLSelectElement;
        const weightEl = document.getElementById("e-weight") as HTMLInputElement;
        const priceEl = document.getElementById("e-price") as HTMLInputElement;

        const updatePrice = () => {
          const deliveryType = typeEl.value;
          const weight = parseFloat(weightEl.value);
          if (isNaN(weight) || weight <= 0) {
            priceEl.value = "0.00";
            return;
          }
          const pricePerKg = deliveryType === "Agence" ? shippingSettings.agencyDeliveryFee : shippingSettings.homeDeliveryFee;
          const calculatedPrice =
            weight <= 10
              ? deliveryType === "Agence"
                ? 100
                : 200
              : weight * pricePerKg;
          priceEl.value = calculatedPrice.toFixed(2);
        };

        typeEl.addEventListener("change", updatePrice);
        weightEl.addEventListener("input", updatePrice);
      },
      preConfirm: () => {
        const sender = (
          document.getElementById("e-sender") as HTMLInputElement
        ).value.trim();
        const receiver = (
          document.getElementById("e-receiver") as HTMLInputElement
        ).value.trim();
        const city = (
          document.getElementById("e-city") as HTMLInputElement
        ).value.trim();
        const type = (document.getElementById("e-type") as HTMLSelectElement)
          .value;
        const status = (
          document.getElementById("e-status") as HTMLSelectElement
        ).value;
        const weight = parseFloat(
          (document.getElementById("e-weight") as HTMLInputElement).value,
        );
        const quantity = parseInt(
          (document.getElementById("e-quantity") as HTMLInputElement).value,
        );
        const totalPrice = parseFloat(
          (document.getElementById("e-price") as HTMLInputElement).value,
        );
        if (
          !sender ||
          !receiver ||
          !city ||
          !status ||
          isNaN(weight) ||
          isNaN(quantity) ||
          isNaN(totalPrice)
        ) {
          Swal.showValidationMessage(t("colis.requiredFields"));
          return false;
        }
        return { sender, receiver, city, type, status, weight, quantity, totalPrice };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        invoke<DbColis>("update_colis", {
          payload: {
            id: parseInt(colis.id),
            sender_name: result.value.sender,
            receiver_name: result.value.receiver,
            city: result.value.city,
            delivery_type: result.value.type,
            status: result.value.status,
            weight: result.value.weight,
            quantity: result.value.quantity,
            total_amount: result.value.totalPrice,
          },
        })
          .then((updatedDbColis) => {
            const mapped = mapDbColisToItem(updatedDbColis);
            setColisList((prev) =>
              prev.map((item) => (item.id === colis.id ? mapped : item))
            );
            Swal.fire({
              title: t("common.updated"),
              text: t("colis.updatedText"),
              icon: "success",
              timer: 1400,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            console.error("Failed to update colis:", err);
            Swal.fire({
              title: t("common.error"),
              text: err.toString() || "Failed to update colis.",
              icon: "error",
              confirmButtonText: t("common.close"),
            });
          });
      }
    });
  };

  const handleDelete = async (id: string, trackingNo: string) => {
    const result = await Swal.fire({
      title: t("colis.deleteTitle"),
      text: t("colis.deleteText", { trackingNo }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common.deleteConfirm"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "#E26D28",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
        cancelButton: "rounded-lg",
      },
    });
    if (result.isConfirmed) {
      try {
        await invoke("delete_colis", { id: parseInt(id) });
        setColisList((prev) => prev.filter((c) => c.id !== id));
        await Swal.fire({
          title: t("common.deleted"),
          text: t("colis.deletedText"),
          icon: "success",
          timer: 1400,
          showConfirmButton: false,
        });
      } catch (err: any) {
        console.error("Failed to delete colis:", err);
        await Swal.fire({
          title: t("common.error"),
          text: err.toString() || "Failed to delete colis.",
          icon: "error",
          confirmButtonText: t("common.close"),
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t("colis.pageTitle")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t("colis.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t("colis.totalParcels"),
            value: String(stats.total),
            suffix: "",
            icon: Package,
            bg: "bg-brand-blue/10 dark:bg-brand-blue/20",
            color: "text-brand-blue dark:text-blue-400",
          },
          {
            label: t("colis.totalWeight"),
            value: stats.weight,
            suffix: "kg",
            icon: Scale,
            bg: "bg-brand-orange/10 dark:bg-brand-orange/20",
            color: "text-brand-orange dark:text-orange-400",
          },
          {
            label: t("colis.totalRevenue"),
            value: parseFloat(stats.revenue).toLocaleString(
              i18n.language === "ar"
                ? "ar-MA"
                : i18n.language === "en"
                  ? "en-GB"
                  : "fr-FR",
            ),
            suffix: "DH",
            icon: DollarSign,
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            color: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: t("colis.expressShipments"),
            value: String(stats.express),
            suffix: "",
            icon: TrendingUp,
            bg: "bg-amber-50 dark:bg-amber-500/10",
            color: "text-amber-600 dark:text-amber-400",
          },
        ].map(({ label, value, suffix, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md duration-300"
          >
            <div className={`${bg} p-3 rounded-xl ${color} shadow-sm`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
                {label}
              </p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-0.5">
                {value}{" "}
                {suffix && (
                  <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    {suffix}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {t("colis.shipmentList")}
            </h3>
            <span className="bg-[#FDF1EA] dark:bg-orange-500/10 text-brand-orange text-xs px-2.5 py-0.5 rounded-full font-bold border border-orange-100 dark:border-orange-500/20">
              {t("colis.recordsCount", { count: filteredColis.length })}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                size={16}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t("colis.searchPlaceholder")}
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white dark:focus:bg-slate-800 w-full transition-all text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* City filter */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-600 dark:text-slate-350 appearance-none cursor-pointer font-medium"
              >
                <option value="" className="dark:bg-slate-900">{t("colis.allCities")}</option>
                {cities.map((c) => (
                  <option key={c} value={c} className="dark:bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-slate-500">
                <Filter size={13} />
              </div>
            </div>

            {/* Ajouter Colis */}
            <button
              onClick={onNavigateToAdd}
              className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus size={15} />
              {t("colis.addParcel")}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/70 dark:bg-slate-800/40 text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{t("colis.tracking")}</th>
                <th className="px-6 py-4">{t("colis.sender")}</th>
                <th className="px-6 py-4">{t("colis.receiver")}</th>
                <th className="px-6 py-4">{t("colis.city")}</th>
                <th className="px-6 py-4 text-center">
                  {t("colis.typeLabel")}
                </th>
                <th className="px-6 py-4 text-center">{t("colis.statusLabel")}</th>
                <th className="px-6 py-4 text-right">{t("colis.weight")}</th>
                <th className="px-6 py-4 text-right">Quantité</th>
                <th className="px-6 py-4 text-right">
                  {t("colis.totalPrice")}
                </th>
                <th className="px-6 py-4 text-center">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {currentItems.length > 0 ? (
                currentItems.map((colis) => (
                  <tr
                    key={colis.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* N°Track */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package
                          size={15}
                          className="text-gray-400 dark:text-slate-500 group-hover:text-brand-orange transition-colors shrink-0"
                        />
                        <span className="font-bold font-mono text-gray-800 dark:text-slate-200">
                          {colis.trackingNo}
                        </span>
                      </div>
                    </td>

                    {/* Expéditeur */}
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-slate-200">
                      {colis.sender}
                    </td>

                    {/* Destinataire */}
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      {colis.receiver}
                    </td>

                    {/* Ville */}
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-350">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400 dark:text-slate-500 shrink-0" />
                        {colis.city}
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          colis.type === "Domicile"
                            ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-500/20"
                            : colis.type === "Agence"
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"
                              : colis.type === "Fragile"
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20"
                                : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-700"
                        }`}
                      >
                        {typeLabel(colis.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          colis.status === "Livré"
                            ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-500/20"
                            : colis.status === "En transit"
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"
                              : colis.status === "Annulé"
                                ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/20"
                                : "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-500/20"
                        }`}
                      >
                        {statusLabel(colis.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-slate-300">
                      {colis.weight.toFixed(1)}{" "}
                      <span className="text-xs text-gray-400 dark:text-slate-500 font-normal">
                        kg
                      </span>
                    </td>

                    {/* Quantité */}
                    <td className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-slate-300">
                      {colis.quantity || 1}
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-slate-200">
                      {colis.totalPrice.toFixed(2)}{" "}
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                        DH
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDetails(colis)}
                          className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg transition-colors cursor-pointer"
                          title={t("common.details")}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(colis)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors cursor-pointer"
                          title={t("common.edit")}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(colis.id, colis.trackingNo)
                          }
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title={t("common.delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package
                        size={36}
                        className="text-gray-300 dark:text-slate-600 stroke-[1.5]"
                      />
                      <span className="font-medium text-gray-400 dark:text-slate-500 text-sm">
                        {t("colis.noParcelFound")}
                      </span>
                      <p className="text-xs text-gray-300 dark:text-slate-600 max-w-xs">
                        {t("colis.noParcelHint")}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-slate-900/30">
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              {t("colis.showing")}{" "}
              <span className="font-bold text-gray-700 dark:text-slate-350">
                {indexOfFirstItem + 1}
              </span>{" "}
              {t("colis.to")}{" "}
              <span className="font-bold text-gray-700 dark:text-slate-350">
                {Math.min(indexOfLastItem, totalItems)}
              </span>{" "}
              {t("colis.of")}{" "}
              <span className="font-bold text-gray-700 dark:text-slate-350">{totalItems}</span>{" "}
              {t("colis.parcels")}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-brand-orange text-white border border-brand-orange shadow-sm"
                        : "border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render the Details Modal Component */}
      {selectedDetailColis && (
        <DetailColisModal
          colis={selectedDetailColis}
          isOpen={true}
          onClose={() => setSelectedDetailColis(null)}
        />
      )}
    </div>
  );
}