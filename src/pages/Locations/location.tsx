import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Edit, Trash2, MapPin } from "lucide-react";
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

  const handleEdit = (location: Location) => {
    setEditTarget(location);
  };

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
        console.error("Failed to delete location:", error);
        Swal.fire({
          title: t("common.error") || "Erreur",
          text: String(error),
          icon: "error",
        });
      }
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      loc.country.toLowerCase().includes(q) ||
      loc.region.toLowerCase().includes(q) ||
      (loc.city ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="bg-brand-orange p-3 rounded-xl text-white shadow-md">
            <MapPin size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">
              {t("locations.totalLocations")}
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {locations.length}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Table Header / Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800">
            {t("locations.managementTitle")}
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("locations.search")}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white w-full transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Filter size={16} />
                <span className="hidden sm:inline">{t("common.filters")}</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm hover:bg-orange-600 transition-colors cursor-pointer"
              >
                {t("locations.addLocation")}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">
                  {t("locations.country")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("locations.region")}
                </th>
                <th className="px-6 py-4 font-medium">{t("locations.city")}</th>
                <th className="px-6 py-4 font-medium text-right">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    {searchQuery ? t("common.noResults") || "Aucun résultat trouvé" : t("locations.noLocations") || "Aucune location ajoutée"}
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => (
                  <tr
                    key={location.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-800">
                      {location.country}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{location.region}</td>
                    <td className="px-6 py-4 text-gray-600">{location.city ?? "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(location)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title={t("common.edit")}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={t("common.delete")}
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
      </div>

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
