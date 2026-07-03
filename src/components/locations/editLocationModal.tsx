import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { countries } from "countries-list";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import Swal from "sweetalert2";

const countryOptions = Object.entries(countries).map(([code, country]) => ({
  value: country.name,
  label: country.name,
  countryCode: code,
}));

export interface Location {
  id: number;
  country: string;
  region: string;
  city: string | null;
}

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onSuccess: () => void;
}

export default function EditLocationModal({
  isOpen,
  onClose,
  location,
  onSuccess,
}: EditLocationModalProps) {
  const { t } = useTranslation();

  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (location) {
      const option = countryOptions.find((o) => o.value === location.country) || {
        value: location.country,
        label: location.country,
        countryCode: "",
      };
      setSelectedCountry(option);
      setRegion(location.region);
      setCity(location.city || "");
    } else {
      setSelectedCountry(null);
      setRegion("");
      setCity("");
    }
  }, [location, isOpen]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!location) return;

    if (!selectedCountry || !region.trim()) {
      Swal.fire({
        title: t("common.error") || "Erreur",
        text: "Veuillez remplir les champs obligatoires (Pays et Région).",
        icon: "error",
      });
      return;
    }

    try {
      await invoke("update_location", {
        payload: {
          id: location.id,
          country: selectedCountry.value,
          region: region.trim(),
          city: city.trim() || null,
        },
      });

      Swal.fire({
        title: t("common.success") || "Succès",
        text: "Location modifiée avec succès.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        title: t("common.error") || "Erreur",
        text: String(error),
        icon: "error",
      });
    }
  };

  if (!isOpen || !location) return null;

  const isDark = document.documentElement.classList.contains("dark");

  const formatOptionLabel = ({ label, countryCode }: any) => (
    <div className="flex items-center gap-2">
      {countryCode && (
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={{ width: "1.2em", height: "1.2em", borderRadius: "2px" }}
        />
      )}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="
        bg-white dark:bg-slate-900
        rounded-xl shadow-xl
        w-full max-w-lg
        overflow-hidden flex flex-col
        border border-gray-100 dark:border-slate-700
        transition-colors
      ">
        <div className="
          flex items-center justify-between p-5
          border-b border-gray-100 dark:border-slate-700
        ">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {t("locations.editLocation") || "Modifier la location"}
          </h2>

          <button
            onClick={onClose}
            className="
              p-2 rounded-full
              text-gray-400 hover:text-gray-600
              hover:bg-gray-100 dark:hover:bg-slate-800
              transition cursor-pointer
            "
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("locations.country")}
            </label>

            <Select
              options={countryOptions}
              value={selectedCountry}
              onChange={(option) => setSelectedCountry(option as any)}
              placeholder={t("locations.selectCountry")}
              isSearchable
              formatOptionLabel={formatOptionLabel}
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: isDark ? "#1e293b" : "#f9fafb",
                  borderColor: isDark ? "#334155" : "#e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "2px",
                  boxShadow: "none",
                  color: isDark ? "#f1f5f9" : "#111827",
                  "&:hover": { borderColor: isDark ? "#475569" : "#d1d5db" },
                  cursor: "pointer",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                  border: isDark ? "1px solid #334155" : "1px solid #e5e7eb",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? isDark ? "#1e293b" : "#f3f4f6"
                    : isDark ? "#0f172a" : "#ffffff",
                  color: isDark ? "#f1f5f9" : "#111827",
                  cursor: "pointer",
                }),
                singleValue: (base) => ({
                  ...base,
                  color: isDark ? "#f1f5f9" : "#111827",
                }),
                input: (base) => ({
                  ...base,
                  color: isDark ? "#f1f5f9" : "#111827",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: isDark ? "#64748b" : "#9ca3af",
                }),
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("locations.region")}
            </label>

            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder={t("locations.regionPlaceholder")}
              className="
                px-4 py-2 rounded-lg text-sm
                bg-gray-50 dark:bg-slate-800
                border border-gray-200 dark:border-slate-700
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-brand-orange
                outline-none transition
              "
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("locations.city")}
            </label>

            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("locations.cityPlaceholder")}
              className="
                px-4 py-2 rounded-lg text-sm
                bg-gray-50 dark:bg-slate-800
                border border-gray-200 dark:border-slate-700
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-brand-orange
                outline-none transition
              "
            />
          </div>
        </div>

        <div className="
          p-5 flex justify-end gap-3
          border-t border-gray-100 dark:border-slate-700
          bg-gray-50 dark:bg-slate-900
        ">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              bg-white dark:bg-slate-800
              border border-gray-200 dark:border-slate-700
              text-gray-600 dark:text-white
              hover:bg-gray-100 dark:hover:bg-slate-700
              transition cursor-pointer
            "
          >
            {t("common.cancel")}
          </button>

          <button
            onClick={handleSave}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              bg-brand-orange hover:bg-orange-600
              text-white transition cursor-pointer
            "
          >
            {t("common.save") || "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}