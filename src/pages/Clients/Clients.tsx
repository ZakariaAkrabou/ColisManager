import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  Send,
  Download,
  Wallet,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Edit3,
  Trash2,
  Eye,
  Info,
} from "lucide-react";
import AddClientModal from "../../components/clients/AddClientModal";
import EditClientModal from "../../components/clients/EditClientModal";
import ClientDetailsModal from "../../components/clients/ClientDetailsModal";
import { invoke } from "@tauri-apps/api/core";
import Swal from "sweetalert2";
export interface Client {
  id: number;
  client_type: "expediteur" | "destinataire";
  full_name: string;
  phone_number: string;
  country: string;
  region: string;
  city: string;
  full_address: string;
  totalSent: number;
  totalReceived: number;
  totalAmount: number;
}

export default function ClientsPage() {
  const { t } = useTranslation();

  const translateAllValue = (value: string) => {
    if (value === "Tous") return t("common.all");
    if (value === "Toutes") return t("common.all");
    return value;
  };

  const [clients, setClients] = useState<Client[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPays, setFilterPays] = useState("Tous");
  const [filterRegion, setFilterRegion] = useState("Toutes");
  const [filterVille, setFilterVille] = useState("Toutes");
  const [filterClientType, setFilterClientType] = useState<"Tous" | "expediteur" | "destinataire">("Tous");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  

  const loadClients = async () => {
    try {
      const data = await invoke<Client[]>("get_clients");
      setClients(
        data.map((client) => ({
          id: client.id,
          client_type: client.client_type ?? "destinataire",
          full_name: client.full_name,
          phone_number: client.phone_number,
          country: client.country ?? "",
          region: client.region ?? "",
          city: client.city ?? "",
          full_address: client.full_address ?? "",
          totalSent: client.totalSent ?? 0,
          totalReceived: client.totalReceived ?? 0,
          totalAmount: client.totalAmount ?? 0,
        }))
      );
    } catch (error) {
      console.error("Failed to load clients:", error);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

 
  const uniquePays = useMemo(() => {
    return ["Tous", ...Array.from(new Set(clients.map((c) => c.country || "")))];
  }, [clients]);

  const uniqueRegions = useMemo(() => {
    const filtered =
      filterPays !== "Tous"
        ? clients.filter((c) => c.country === filterPays)
        : clients;
    return ["Toutes", ...Array.from(new Set(filtered.map((c) => c.region || "")))];
  }, [clients, filterPays]);

  const uniqueVilles = useMemo(() => {
    let filtered = clients;
    if (filterPays !== "Tous") {
      filtered = filtered.filter((c) => c.country === filterPays);
    }
    if (filterRegion !== "Toutes") {
      filtered = filtered.filter((c) => c.region === filterRegion);
    }
    return ["Toutes", ...Array.from(new Set(filtered.map((c) => c.city || "")))];
  }, [clients, filterPays, filterRegion]);

  useEffect(() => {
    setFilterRegion("Toutes");
    setFilterVille("Toutes");
    setCurrentPage(1);
  }, [filterPays]);

  useEffect(() => {
    setFilterVille("Toutes");
    setCurrentPage(1);
  }, [filterRegion]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterVille, searchQuery]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        client.full_name.toLowerCase().includes(search) ||
        String(client.id).includes(search) ||
        client.phone_number.toLowerCase().includes(search) ||
        client.full_address.toLowerCase().includes(search) ||
        client.city.toLowerCase().includes(search);

      const matchesPays = filterPays === "Tous" || client.country === filterPays;
      const matchesRegion =
        filterRegion === "Toutes" || client.region === filterRegion;
      const matchesVille =
        filterVille === "Toutes" || client.city === filterVille;
      const matchesType =
        filterClientType === "Tous" || client.client_type === filterClientType;

      return matchesSearch && matchesPays && matchesRegion && matchesVille && matchesType;
    });
  }, [clients, searchQuery, filterPays, filterRegion, filterVille]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredClients.slice(startIndex, startIndex + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const stats = useMemo(() => {
    return {
      totalClients: clients.length,
      totalSent: clients.reduce((acc, c) => acc + (c.totalSent ?? 0), 0),
      totalReceived: clients.reduce((acc, c) => acc + (c.totalReceived ?? 0), 0),
      totalAmount: clients.reduce((acc, c) => acc + (c.totalAmount ?? 0), 0),
    };
  }, [clients]);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddClientSubmit = (newClient: Client) => {
    setClients([newClient, ...clients]);
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleEditClientSubmit = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    setIsEditModalOpen(false);
    setSelectedClient(null);
    Swal.fire({
      icon: "success",
      title: t("common.success"),
      text: t("clients.clientUpdated", { name: updatedClient.full_name }),
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleDeleteClient = async (client: Client) => {
  const result = await Swal.fire({
    title: t("common.areYouSure") || "Are you sure?",
    text: t("clients.deleteConfirm", {
      name: client.full_name,
      id: client.id,
    }),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ea580c",
    cancelButtonColor: "#6b7280",
    confirmButtonText: t("common.delete") || "Delete",
    cancelButtonText: t("common.cancel") || "Cancel",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  try {
    await invoke("delete_client", { id: client.id });

    setClients((prev) => prev.filter((c) => c.id !== client.id));

    Swal.fire({
      icon: "success",
      title: t("common.success"),
      text: t("clients.clientDeleted", {
        name: client.full_name,
      }),
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Failed to delete client:", error);

    Swal.fire({
      icon: "error",
      title: t("common.error"),
      text: t("clients.clientDeleteFailed"),
      confirmButtonColor: "#ea580c",
    });
  }
};

  const handleOpenDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterPays("Tous");
    setFilterRegion("Toutes");
    setFilterVille("Toutes");
    setFilterClientType("Tous");
    setCurrentPage(1);
  };

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
    <div className="space-y-6">
    

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {t("clients.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t("clients.subtitle")}</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-md shadow-brand-orange/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>{t("clients.addClient")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-brand-orange shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t("clients.totalClients")}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.totalClients.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Send className="w-5.5 h-5.5 -rotate-12 translate-y-0.5 -translate-x-0.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t("clients.totalSent")}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.totalSent.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDF1EA] flex items-center justify-center text-brand-orange shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t("clients.totalReceived")}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.totalReceived.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 shrink-0">
            <Wallet className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t("clients.totalAmount")}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.totalAmount.toLocaleString()} MAD
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="col-span-1 md:col-span-4 space-y-1.5">
            <span className="text-xs text-gray-400 font-medium block">
              {t("clients.search")}
            </span>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("clients.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none transition-all placeholder:text-gray-400 text-gray-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="w-5 h-5 text-gray-400 hover:text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-1.5">
            <label
              htmlFor="filterPays"
              className="text-xs text-gray-400 font-medium block"
            >
              {t("clients.country")}
            </label>
            <select
              id="filterPays"
              value={filterPays}
              onChange={(e) => setFilterPays(e.target.value)}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              {uniquePays.map((p) => (
                <option key={p} value={p}>
                  {translateAllValue(p)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-1.5">
            <label
              htmlFor="filterRegion"
              className="text-xs text-gray-400 font-medium block"
            >
              {t("clients.region")}
            </label>
            <select
              id="filterRegion"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              {uniqueRegions.map((r) => (
                <option key={r} value={r}>
                  {translateAllValue(r)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-1.5">
            <label
              htmlFor="filterVille"
              className="text-xs text-gray-400 font-medium block"
            >
              {t("clients.city")}
            </label>
            <select
              id="filterVille"
              value={filterVille}
              onChange={(e) => setFilterVille(e.target.value)}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              {uniqueVilles.map((v) => (
                <option key={v} value={v}>
                  {translateAllValue(v)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-1.5">
            <label
              htmlFor="filterClientType"
              className="text-xs text-gray-400 font-medium block"
            >
              {t("clients.clientType")}
            </label>
            <select
              id="filterClientType"
              value={filterClientType}
              onChange={(e) => setFilterClientType(e.target.value as "Tous" | "expediteur" | "destinataire")}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              <option value="Tous">{t("common.all")}</option>
              <option value="expediteur">{t("clients.expediteur")}</option>
              <option value="destinataire">{t("clients.destinataire")}</option>
            </select>
          </div>
 
        </div>

        {(searchQuery ||
          filterPays !== "Tous" ||
          filterRegion !== "Toutes" ||
          filterVille !== "Toutes") && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400 font-medium">
                {t("clients.activeFilters")}
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                  {t("clients.search")} : "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterPays !== "Tous" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                  {t("clients.country")} : {filterPays}
                  <button
                    onClick={() => setFilterPays("Tous")}
                    className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterRegion !== "Toutes" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                  {t("clients.region")} : {filterRegion}
                  <button
                    onClick={() => setFilterRegion("Toutes")}
                    className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterVille !== "Toutes" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                  {t("clients.city")} : {filterVille}
                  <button
                    onClick={() => setFilterVille("Toutes")}
                    className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterClientType !== "Tous" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                  {t("clients.clientType")} : {t(`clients.${filterClientType}`)}
                  <button
                    onClick={() => setFilterClientType("Tous")}
                    className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-brand-orange underline font-semibold ml-auto cursor-pointer"
              >
                {t("clients.clearAll")}
              </button>
            </div>
          )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-250">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100">
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("clients.fullName")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("clients.type")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("clients.phone")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("clients.country")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("clients.city")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider max-w-70">
                  {t("clients.fullAddress")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-27.5">
                  {t("clients.totalSent")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-32.5">
                  {t("clients.totalReceived")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-35">
                  {t("clients.totalAmount")}
                </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-35">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50/70 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {client.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {t(`clients.${client.client_type}`)}
                    </td>
                    <td className=" text-sm text-green-700  rounded font-mono whitespace-nowrap">
                      {client.phone_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="capitalize">{client.country}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {client.city}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 max-w-70 truncate"
                      title={client.full_address}
                    >
                      {client.full_address}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">
                      {client.totalSent.toLocaleString()}
                      <span className="px-1 text-xs font-medium text-gray-400">kg</span>

                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">
                      {client.totalReceived.toLocaleString()}
                      <span className="px-1 text-xs font-medium text-gray-400">kg</span>

                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">
                      {client.totalAmount.toLocaleString()}{" "}
                      <span className="text-xs font-medium text-gray-400">DH</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center ">
                        <button
                          onClick={() => handleOpenDetails(client)}
                          className="p-2 rounded-lg  text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                          title={t("clients.viewDetails")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="p-2 rounded-lg  text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                          title={t("common.edit")}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteClient(client)}
                          className="p-2 rounded-lg  text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title={t("common.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-12 text-center text-gray-400 text-sm"
                  >
                    <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    {t("clients.noClientFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredClients.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4.5 bg-white border-t border-gray-100">
            <div className="text-xs text-gray-500 font-medium order-2 sm:order-1">
              {t("clients.showingRange", {
                from: Math.min(
                  filteredClients.length,
                  (currentPage - 1) * pageSize + 1,
                ),
                to: Math.min(filteredClients.length, currentPage * pageSize),
                total: filteredClients.length,
              })}
            </div>

            <div className="flex items-center justify-center gap-1.5 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {paginationRange.map((page, index) => {
                if (page === "ellipsis") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs select-none"
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
                    className={`w-8 h-8 flex items-center justify-center text-sm font-semibold rounded-lg border transition-all cursor-pointer ${isActive
                      ? "border-brand-orange text-brand-orange bg-orange-50/10"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
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
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
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
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange cursor-pointer"
              >
                <option value={5}>{t("clients.perPage", { count: 5 })}</option>
                <option value={8}>{t("clients.perPage", { count: 8 })}</option>
                <option value={10}>{t("clients.perPage", { count: 10 })}</option>
                <option value={20}>{t("clients.perPage", { count: 20 })}</option>
                <option value={50}>{t("clients.perPage", { count: 50 })}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddClientSubmit}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        client={selectedClient}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        onSave={handleEditClientSubmit}
      />

      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        client={selectedClient}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
}
