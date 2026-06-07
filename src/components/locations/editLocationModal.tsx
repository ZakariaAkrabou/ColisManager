import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { countries } from "countries-list";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";

const countryOptions = Object.entries(countries).map(([code, country]) => ({
  value: country.name,
  label: country.name,
  countryCode: code,
}));

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: any; // The location to edit
}

export default function EditLocationModal({
  isOpen,
  onClose,
  location,
}: EditLocationModalProps) {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<{
    value: string;
    label: string;
    countryCode: string;
  } | null>(null);

  useEffect(() => {
    if (location) {
      // Find the matching country option
      const option = countryOptions.find((o) => o.value === location.country);
      if (option) {
        setSelectedCountry(option);
      } else {
        setSelectedCountry(null);
      }
    }
  }, [location]);

  if (!isOpen) return null;

  const formatOptionLabel = ({ label, countryCode }: any) => (
    <div className="flex items-center gap-2">
      <ReactCountryFlag
        countryCode={countryCode}
        svg
        style={{ width: "1.2em", height: "1.2em", borderRadius: "2px" }}
      />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {t("locations.editLocation")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {t("locations.country")}
              </label>
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={(option) => setSelectedCountry(option as any)}
                placeholder={t("locations.selectCountry")}
                isSearchable
                formatOptionLabel={formatOptionLabel}
                className="react-select-container cursor-pointer"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#F9FAFB",
                    borderColor: "#E5E7EB",
                    borderRadius: "0.5rem",
                    padding: "2px",
                    boxShadow: "none",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "#D1D5DB",
                    },
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    cursor: "pointer",
                  }),
                  input: (base) => ({
                    ...base,
                    cursor: "pointer",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    cursor: "pointer",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    cursor: "pointer",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#FFF3EB" : "white",
                    color: state.isFocused ? "#E85D04" : "#374151",
                    cursor: "pointer",
                  }),
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {t("locations.region")}
              </label>
              <input
                type="text"
                defaultValue={location?.region}
                placeholder={t("locations.regionPlaceholder")}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white w-full transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {t("locations.city")}
              </label>
              <input
                type="text"
                defaultValue={location?.city}
                placeholder={t("locations.cityPlaceholder")}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white w-full transition-all"
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer">
            {t("common.update")}
          </button>
        </div>
      </div>
    </div>
  );
}
