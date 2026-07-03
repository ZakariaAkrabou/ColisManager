import { useState, useEffect, useMemo } from "react";
import {
  Package,
  Wallet,
  Clock,
  CheckSquare,
  Search,
  Filter,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";

interface DbColis {
  id: number;
  tracking_number: string;
  sender_name: string;
  receiver_name: string;
  receiver_city?: string;
  receiver_region?: string;
  delivery_type: string;
  weight: number;
  total_amount: number;
  status: string;
  created_at?: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [colisList, setColisList] = useState<DbColis[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await invoke<DbColis[]>("get_colis");
      setColisList(data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const deliveryTypeLabel = (type: string) => {
    const lower = type?.toLowerCase() || "";
    if (lower === "à domicile" || lower === "domicile" || lower === "home") return t("dashboard.homeDelivery");
    if (lower === "agence" || lower === "agency") return t("dashboard.agencyDelivery");
    if (lower === "type de livraison") return t("dashboard.deliveryTypeLabel");
    if (lower === "daznicie") return t("dashboard.deliveryTypeLabel");
    return type;
  };

  const statusLabel = (status: string) => {
    if (status === "Nouveau") return t("dashboard.statusNew");
    if (status === "À domicile") return t("dashboard.statusHome");
    return status;
  };

  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const stats = useMemo(() => {
    let total = 0;
    let revenue = 0;
    let pending = 0;
    let deliveredToday = 0;

    colisList.forEach(c => {
      total += 1;
      revenue += c.total_amount || 0;

      const statusLower = c.status?.toLowerCase() || "";
      const isDelivered = statusLower.includes("liv");
      const isCancelled = statusLower.includes("cancel") || statusLower.includes("annul");

      if (!isDelivered && !isCancelled) {
        pending += 1;
      }

      if (isDelivered && isToday(c.created_at)) {
        deliveredToday += 1;
      }
    });

    return { total, revenue, pending, deliveredToday };
  }, [colisList]);

  const recentColis = useMemo(() => {
    return [...colisList]
      .sort((a, b) => b.id - a.id)
      .filter(c => {
        if (searchTerm &&
            !c.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !c.receiver_name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (filterType && filterType !== t("dashboard.deliveryFilter")) {
          const label = deliveryTypeLabel(c.delivery_type);
          if (label !== filterType) return false;
        }
        return true;
      })
      .slice(0, 10);
  }, [colisList, searchTerm, filterType, t]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {/* Total Colis */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="bg-brand-orange/10 dark:bg-brand-orange/20 p-3 rounded-xl text-brand-orange dark:text-orange-400 shadow-sm">
            <Package size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              {t("dashboard.totalParcels")}
            </p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-0.5 whitespace-nowrap">
              {stats.total}
            </p>
          </div>
        </div>

        {/* Revenu */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="bg-brand-blue/10 dark:bg-brand-blue/20 p-3 rounded-xl text-brand-blue dark:text-blue-400 shadow-sm">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              {t("dashboard.revenue")}
            </p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-0.5 whitespace-nowrap">
              {stats.revenue.toLocaleString()}{" "}
              <span className="text-sm font-medium text-gray-500 dark:text-slate-400">MAD</span>
            </p>
          </div>
        </div>

        {/* Livraisons en attente */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl text-amber-600 dark:text-amber-400 shadow-sm">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              {t("dashboard.pendingDeliveries")}
            </p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-0.5 whitespace-nowrap">
              {stats.pending}
            </p>
          </div>
        </div>

        {/* Livrés aujourd'hui */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
            <CheckSquare size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              {t("dashboard.deliveredToday")}
            </p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-0.5 whitespace-nowrap">
              {stats.deliveredToday}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        {/* Table Header / Filters */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {t("dashboard.recentParcels")}
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="text"
                placeholder={t("dashboard.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white dark:focus:bg-slate-800 w-full transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all cursor-pointer"
              >
                <option value="" className="dark:bg-slate-900">{t("dashboard.deliveryFilter")}</option>
                <option value={t("dashboard.homeDelivery")} className="dark:bg-slate-900">{t("dashboard.homeDelivery")}</option>
                <option value={t("dashboard.agencyDelivery")} className="dark:bg-slate-900">{t("dashboard.agencyDelivery")}</option>
              </select>
              <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Filter size={16} />
                <span className="hidden sm:inline">{t("common.filters")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/70 dark:bg-slate-800/40 text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">
                  {t("dashboard.tracking")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("dashboard.client")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("dashboard.weightKg")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("dashboard.deliveryType")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("dashboard.status")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("dashboard.totalMad")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {recentColis.map((colis, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-700 dark:text-slate-200">{colis.tracking_number}</td>
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">
                    {colis.receiver_name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{colis.weight}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                    {deliveryTypeLabel(colis.delivery_type)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        colis.status === "Nouveau" || colis.status.toLowerCase().includes("attente")
                          ? "bg-orange-50 dark:bg-orange-500/10 text-brand-orange dark:text-orange-400 border-orange-200 dark:border-orange-500/20"
                          : colis.status.toLowerCase().includes("liv")
                          ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
                          : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                      }`}
                    >
                      {statusLabel(colis.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">
                    {colis.total_amount}{" "}
                    <span className="text-xs text-gray-500 dark:text-slate-400">MAD</span>
                  </td>
                </tr>
              ))}
              {recentColis.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 dark:text-slate-500">
                    {t("dashboard.recentParcels")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
