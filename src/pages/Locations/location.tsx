import { useState } from "react";
import { Search, Filter, Edit, Trash2, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import AddLocationModal from "../../components/locations/addLocationModal";
import EditLocationModal from "../../components/locations/editLocationModal";

const locationsData = [
  {
    id: "LOC001",
    country: "Maroc",
    region: "Casablanca-Settat",
    city: "Casablanca",
  },
  {
    id: "LOC002",
    country: "Maroc",
    region: "Rabat-Salé-Kénitra",
    city: "Rabat",
  },
  {
    id: "LOC003",
    country: "Maroc",
    region: "Marrakech-Safi",
    city: "Marrakech",
  },
  {
    id: "LOC004",
    country: "Maroc",
    region: "Tanger-Tétouan-Al Hoceïma",
    city: "Tanger",
  },
  { id: "LOC005", country: "Maroc", region: "Fès-Meknès", city: "Fès" },
];

export default function Location() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<any>(null);

  const handleEdit = (location: any) => {
    setLocationToEdit(location);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
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
      console.log("Delete location ID:", id);
      await Swal.fire({
        title: t("locations.deletedTitle"),
        text: t("locations.deletedText"),
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
    }
  };

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
              {locationsData.length}
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
                  {t("locations.locationId")}
                </th>
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
              {locationsData.map((location) => (
                <tr
                  key={location.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {location.id}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {location.country}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{location.region}</td>
                  <td className="px-6 py-4 text-gray-600">{location.city}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <EditLocationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        location={locationToEdit}
      />
    </div>
  );
}
