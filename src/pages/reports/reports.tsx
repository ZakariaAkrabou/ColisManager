import React, { useState, useEffect, useMemo } from "react";
import ReportsTable, {
  ReportColis,
  normalizeStatus,
} from "../../components/reports/ReportsTable";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { Search, RefreshCw, Filter } from "lucide-react";

const Reports: React.FC = () => {
  const { t } = useTranslation();

  const [colisList, setColisList] = useState<ReportColis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // ── Load data ────────────────────────────────────────────────────────────
  const loadColis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoke<ReportColis[]>("get_colis");
      setColisList(data);
    } catch (err) {
      console.error("Failed to load colis:", err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColis();
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return colisList.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        c.tracking_number.toLowerCase().includes(q) ||
        c.sender_name.toLowerCase().includes(q) ||
        c.receiver_name.toLowerCase().includes(q) ||
        (c.receiver_city ?? "").toLowerCase().includes(q);

      const matchStatus =
        !statusFilter || normalizeStatus(c.status) === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [colisList, searchTerm, statusFilter]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // ── Stats (based on full list) ───────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      delivered: colisList.filter(
        (c) => normalizeStatus(c.status) === "delivered"
      ).length,
      inProgress: colisList.filter(
        (c) => normalizeStatus(c.status) === "inTransit"
      ).length,
      pending: colisList.filter(
        (c) => normalizeStatus(c.status) === "pending"
      ).length,
      cancelled: colisList.filter(
        (c) => normalizeStatus(c.status) === "cancelled"
      ).length,
      totalRevenue: colisList.reduce((sum, c) => sum + c.total_amount, 0),
    };
  }, [colisList]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 transition-colors">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t("reports.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Vue d'ensemble de tous les colis
          </p>
        </div>

        <button
          onClick={loadColis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">

        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher un colis, expéditeur…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition appearance-none cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="delivered">Livré</option>
              <option value="inTransit">En transit</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 dark:text-slate-400 ml-auto">
            {filtered.length} colis
          </span>
        </div>

        {/* Loading / Error / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw
              size={32}
              className="text-orange-400 animate-spin stroke-[1.5]"
            />
            <p className="text-gray-400 dark:text-slate-500 text-sm">
              Chargement des données…
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={loadColis}
              className="text-sm text-orange-500 hover:underline cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <ReportsTable data={paginated} stats={stats} />
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && !error && (
        <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">
          <span className="text-sm text-gray-500 dark:text-slate-400">
            Affichage de {(safePage - 1) * pageSize + 1} à{" "}
            {Math.min(safePage * pageSize, filtered.length)} sur{" "}
            {filtered.length} colis
          </span>

          <div className="flex gap-2">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 transition text-sm cursor-pointer disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-lg transition text-sm font-medium cursor-pointer ${
                  safePage === i + 1
                    ? "bg-orange-500 text-white"
                    : "border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 transition text-sm cursor-pointer disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;