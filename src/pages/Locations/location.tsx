import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Filter, Edit, Trash2, MapPin, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import AddLocationModal from "../../components/locations/addLocationModal";
import EditLocationModal from "../../components/locations/editLocationModal";
import type { Location } from "../../components/locations/editLocationModal";

export default function LocationPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editTarget, setEditTarget] = useState<Location | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Sorting states
  const [sortField, setSortField] = useState<"country" | "region" | "city" | null>("country");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchLocations = useCallback(async () => {
    try {
      const data = await invoke<Location[]>("get_locations");
      setLocations(data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Supprimer cette location ?",
      text: t("locations.deleteWarning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common.deleteConfirm"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "#E85D04",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        await invoke("delete_location", { id });

        await Swal.fire({
          title: t("locations.deletedTitle"),
          text: t("locations.deletedText"),
          icon: "success",
          timer: 1400,
          showConfirmButton: false,
        });

        fetchLocations();
      } catch (error) {
        Swal.fire({
          title: t("common.error") || "Erreur",
          text: String(error),
          icon: "error",
        });
      }
    }
  };

  // Reset pagination when search query or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Handle header sorting click
  const handleSort = (field: "country" | "region" | "city") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter and sort locations
  const filteredLocations = useMemo(() => {
    // 1. Filter
    const filtered = locations.filter((loc) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        loc.country.toLowerCase().includes(q) ||
        loc.region.toLowerCase().includes(q) ||
        (loc.city ?? "").toLowerCase().includes(q)
      );
    });

    // 2. Sort
    if (sortField) {
      filtered.sort((a, b) => {
        const valA = (a[sortField] ?? "").toLowerCase();
        const valB = (b[sortField] ?? "").toLowerCase();
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [locations, searchQuery, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / pageSize));

  // Adjust page index if it goes out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLocations.slice(startIndex, startIndex + pageSize);
  }, [filteredLocations, currentPage, pageSize]);

  const paginationRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPages = [1];
    const endPages = [totalPages];

    const showLeftDots = currentPage > 3;
    const showRightDots = currentPage < totalPages - 2;

    if (!showLeftDots && showRightDots) {
      const middlePages = [2, 3, 4];
      return [...startPages, ...middlePages, "ellipsis", ...endPages];
    } else if (showLeftDots && !showRightDots) {
      const middlePages = [totalPages - 3, totalPages - 2, totalPages - 1];
      return [...startPages, "ellipsis", ...middlePages, ...endPages];
    } else {
      const middlePages = [currentPage - 1, currentPage, currentPage + 1];
      return [...startPages, "ellipsis", ...middlePages, "ellipsis", ...endPages];
    }
  }, [totalPages, currentPage]);

  return (
  <div className="flex flex-col gap-6 w-full animate-fade-in">

    {/* PAGE TITLE */}
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        {t("locations.title") || "Locations"}
      </h1>
    </div>

    {/* HEADER CARD */}
    <div className="
      bg-white dark:bg-slate-900
      p-5 rounded-xl shadow-sm
      border border-gray-100 dark:border-gray-800
      flex items-center gap-4
      transition-colors
    ">
      <div className="bg-brand-orange p-3 rounded-xl text-white shadow-md">
        <MapPin size={28} />
      </div>

      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {t("locations.totalLocations")}
        </p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          {locations.length}
        </p>
      </div>
    </div>


      {/* HEADER */}
      <div className="
        p-5 border-b
        border-gray-100 dark:border-gray-800 dark:bg-slate-900 rounded-lg
        flex flex-col md:flex-row md:items-center justify-between gap-4
      ">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          {t("locations.managementTitle")}
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">

          {/* SEARCH */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("locations.search")}
              className="
                pl-10 pr-4 py-2 text-sm
                rounded-lg w-full
                bg-gray-50 dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-brand-orange
                outline-none transition
              "
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-2">

            <button className="
              px-4 py-2 rounded-lg text-sm
              bg-gray-50 dark:bg-gray-900
              border border-gray-200 dark:border-gray-800
              text-gray-600 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-800
              flex items-center gap-2 transition cursor-pointer
            ">
              <Filter size={16} />
              <span className="hidden sm:inline">{t("common.filters")}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="
                px-4 py-2 rounded-lg text-sm
                bg-brand-orange hover:bg-orange-600
                text-white transition cursor-pointer
              "
            >
              {t("locations.addLocation")}
            </button>

          </div>
        </div>
      </div>
    {/* TABLE CARD */}
    <div className="
      bg-white dark:bg-slate-950
      rounded-xl shadow-sm
      border border-gray-100 dark:border-gray-800
      overflow-hidden flex flex-col
      transition-colors
    ">

  

      {/* TABLE */}
      <div className="overflow-x-auto w-full">

        <table className="w-full text-left text-sm whitespace-nowrap">

          <thead className="
            bg-gray-50 dark:bg-gray-900
            text-gray-600 dark:text-gray-300
            border-b border-gray-200 dark:border-gray-800
          ">
            <tr>
              <th
                onClick={() => handleSort("country")}
                className="px-6 py-4 font-medium cursor-pointer select-none group hover:text-gray-800 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("locations.country")}</span>
                  {sortField === "country" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={14} className="text-brand-orange" />
                    ) : (
                      <ChevronDown size={14} className="text-brand-orange" />
                    )
                  ) : (
                    <ChevronsUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("region")}
                className="px-6 py-4 font-medium cursor-pointer select-none group hover:text-gray-800 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("locations.region")}</span>
                  {sortField === "region" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={14} className="text-brand-orange" />
                    ) : (
                      <ChevronDown size={14} className="text-brand-orange" />
                    )
                  ) : (
                    <ChevronsUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("city")}
                className="px-6 py-4 font-medium cursor-pointer select-none group hover:text-gray-800 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("locations.city")}</span>
                  {sortField === "city" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={14} className="text-brand-orange" />
                    ) : (
                      <ChevronDown size={14} className="text-brand-orange" />
                    )
                  ) : (
                    <ChevronsUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 font-medium text-right">{t("common.actions")}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

            {paginatedLocations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                  {searchQuery ? t("common.noResults") : t("locations.noLocations")}
                </td>
              </tr>
            ) : (
              paginatedLocations.map((location) => (
                <tr
                  key={location.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >

                  <td className="px-6 py-4 text-gray-800 dark:text-white">
                    {location.country}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {location.region}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {location.city ?? "—"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">

                      <button
                        onClick={() => setEditTarget(location)}
                        className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition cursor-pointer"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(location.id)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}
      {filteredLocations.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4.5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
          <div className="text-xs text-gray-500 dark:text-slate-400 font-medium order-2 sm:order-1">
            {t("locations.showingRange", {
              from: Math.min(
                filteredLocations.length,
                (currentPage - 1) * pageSize + 1
              ),
              to: Math.min(filteredLocations.length, currentPage * pageSize),
              total: filteredLocations.length,
            })}
          </div>

          <div className="flex items-center justify-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {paginationRange.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-slate-600 text-xs select-none"
                  >
                    ...
                  </span>
                );
              }
              const isActive = currentPage === page;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-8 h-8 flex items-center justify-center text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? "border-brand-orange text-brand-orange bg-orange-50/10 dark:bg-orange-500/10"
                      : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 order-3 ml-auto sm:ml-0">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange cursor-pointer"
            >
              <option value={5} className="dark:bg-slate-900">
                {t("locations.perPage", { count: 5 })}
              </option>
              <option value={10} className="dark:bg-slate-900">
                {t("locations.perPage", { count: 10 })}
              </option>
              <option value={20} className="dark:bg-slate-900">
                {t("locations.perPage", { count: 20 })}
              </option>
              <option value={50} className="dark:bg-slate-900">
                {t("locations.perPage", { count: 50 })}
              </option>
            </select>
          </div>
        </div>
      )}

    </div>

    {/* MODALS */}
    <AddLocationModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        fetchLocations();
      }}
    />

    <EditLocationModal
      isOpen={editTarget !== null}
      onClose={() => setEditTarget(null)}
      location={editTarget}
      onSuccess={fetchLocations}
    />
  </div>
);
}