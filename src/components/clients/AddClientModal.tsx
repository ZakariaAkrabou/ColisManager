// src/components/clients/AddClientModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Client } from "../../pages/Clients/Clients";
import { invoke } from "@tauri-apps/api/core";
import Swal from "sweetalert2";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (client: Omit<Client, "id">) => void;
}

interface LocationRow {
  id: number;
  country: string;
  region: string;
  city: string | null;
}

// Country codes with flags and phone codes
const COUNTRY_CODES = [
  { name: "Morocco", code: "MA", flag: "🇲🇦", phoneCode: "+212" },
  { name: "France", code: "FR", flag: "🇫🇷", phoneCode: "+33" },
  { name: "Spain", code: "ES", flag: "🇪🇸", phoneCode: "+34" },
  { name: "Senegal", code: "SN", flag: "🇸🇳", phoneCode: "+221" },
  { name: "Belgium", code: "BE", flag: "🇧🇪", phoneCode: "+32" },
  { name: "Germany", code: "DE", flag: "🇩🇪", phoneCode: "+49" },
  { name: "Italy", code: "IT", flag: "🇮🇹", phoneCode: "+39" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", phoneCode: "+44" },
  { name: "Canada", code: "CA", flag: "🇨🇦", phoneCode: "+1" },
  { name: "United States", code: "US", flag: "🇺🇸", phoneCode: "+1" },
];

export default function AddClientModal({
  isOpen,
  onClose,
  onAdd,
}: AddClientModalProps) {
  const { t } = useTranslation();
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCountryCode, setFormCountryCode] = useState("MA");
  const [formPays, setFormPays] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formVille, setFormVille] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [locations, setLocations] = useState<LocationRow[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Set default country based on Morocco
      setFormCountryCode("MA");
      invoke<LocationRow[]>("get_locations")
        .then((res) => {
          setLocations(res);
          if (res.length > 0) {
            const marocLoc = res.find(
              (loc) =>
                loc.country.toLowerCase() === "morocco" ||
                loc.country.toLowerCase() === "maroc"
            ) || res[0];
            setFormPays(marocLoc.country);
            setFormRegion(marocLoc.region);
            setFormVille(marocLoc.city || "");
          }
        })
        .catch((err) => console.error("Failed to load locations:", err));
    }
  }, [isOpen]);

  const countries = useMemo(() => {
    return Array.from(new Set(locations.map((loc) => loc.country)));
  }, [locations]);

  const regions = useMemo(() => {
    const filtered = locations.filter((loc) => loc.country === formPays);
    return Array.from(new Set(filtered.map((loc) => loc.region)));
  }, [locations, formPays]);

  const cities = useMemo(() => {
    const filtered = locations.filter(
      (loc) => loc.country === formPays && loc.region === formRegion
    );
    return Array.from(
      new Set(filtered.map((loc) => loc.city || ""))
    ).filter(Boolean);
  }, [locations, formPays, formRegion]);

  const selectedCountry = useMemo(() => {
    return (
      COUNTRY_CODES.find((c) => c.code === formCountryCode) ||
      COUNTRY_CODES[0]
    );
  }, [formCountryCode]);

  const handleCountryChange = (country: string) => {
    setFormPays(country);
    const filteredRegions = locations.filter((loc) => loc.country === country);
    const uniqueRegs = Array.from(new Set(filteredRegions.map((loc) => loc.region)));
    if (uniqueRegs.length > 0) {
      const nextReg = uniqueRegs[0];
      setFormRegion(nextReg);
      const filteredCities = filteredRegions.filter((loc) => loc.region === nextReg);
      const uniqueCits = Array.from(new Set(filteredCities.map((loc) => loc.city || ""))).filter(Boolean);
      setFormVille(uniqueCits.length > 0 ? uniqueCits[0] : "");
    } else {
      setFormRegion("");
      setFormVille("");
    }
  };

  const handleRegionChange = (region: string) => {
    setFormRegion(region);
    const filteredCities = locations.filter(
      (loc) => loc.country === formPays && loc.region === region
    );
    const uniqueCits = Array.from(new Set(filteredCities.map((loc) => loc.city || ""))).filter(Boolean);
    setFormVille(uniqueCits.length > 0 ? uniqueCits[0] : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formName.trim() || !formPhone.trim() || !formAddress.trim()) {
      return;
    }

    const selectedLocation = locations.find(
      (loc) =>
        loc.country === formPays &&
        loc.region === formRegion &&
        (loc.city === formVille || (!loc.city && !formVille))
    );
    const locationId = selectedLocation ? selectedLocation.id : null;

    setIsSubmitting(true);
    try {
      const result = await invoke("create_client", {
        payload: {
          full_name: formName.trim(),
          phone_number: formPhone.trim(),
          location_id: locationId,
          full_address: formAddress.trim(),
        },
      });

      console.log("Rust response:", result);

      onAdd({
        full_name: formName.trim(),
        phone_number: `${COUNTRY_CODES.find((c) => c.code === formCountryCode)?.phoneCode || "+212"}${formPhone}`,
        country: formPays,
        region: formRegion.trim() || formVille.trim(),
        city: formVille.trim(),
        full_address: formAddress.trim(),
        totalSent: 0,
        totalReceived: 0,
        totalAmount: 0,
      });

      Swal.fire({
        title: t("common.success") || "Succès",
        text: t("clients.clientAddedSuccess") || "Client ajouté avec succès.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormName("");
      setFormPhone("");
      setFormCountryCode("MA");
      if (locations.length > 0) {
        const marocLoc = locations.find(
          (loc) =>
            loc.country.toLowerCase() === "morocco" ||
            loc.country.toLowerCase() === "maroc"
        ) || locations[0];
        setFormPays(marocLoc.country);
        setFormRegion(marocLoc.region);
        setFormVille(marocLoc.city || "");
      } else {
        setFormPays("");
        setFormRegion("");
        setFormVille("");
      }
      setFormAddress("");

      onClose();
    } catch (error) {
      console.error("Create client error:", error);
      setSubmitError(
        typeof error === "string"
          ? error
          : "Failed to save client. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    ></div>

    {/* Modal Container */}
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-150 dark:border-gray-800 w-full max-w-2xl overflow-hidden relative z-10 transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t("clients.modal.addTitle")}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {t("clients.modal.addSubtitle")}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-gray-900"
      >
        {/* Profile fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("clients.modal.fullName")} *
            </label>
            <input
              type="text"
              required
              placeholder={t("clients.modal.fullNameExample")}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("clients.modal.phone")} *
            </label>

            <div className="flex items-center bg-gray-50/50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange rounded-xl overflow-hidden relative">

              {/* Hidden select */}
              <select
                value={formCountryCode}
                onChange={(e) => {
                  setFormCountryCode(e.target.value);
                  setFormPhone("");
                }}
                className="absolute left-0 top-0 w-20 h-full opacity-0 cursor-pointer z-10"
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name} {country.phoneCode}
                  </option>
                ))}
              </select>

              {/* Flag */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {selectedCountry.phoneCode}
                </span>
              </div>

              {/* Phone */}
              <input
                type="tel"
                required
                inputMode="numeric"
                placeholder="612345678"
                value={formPhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormPhone(value);
                }}
                className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Geographic fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("clients.modal.country")} *
            </label>
            <select
              value={formPays}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:outline-none transition-all cursor-pointer"
            >
              {countries.length === 0 ? (
                <option value="">{t("common.loading") || "Loading..."}</option>
              ) : (
                countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("clients.modal.region")} *
            </label>
            <select
              value={formRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:outline-none transition-all cursor-pointer"
            >
              {regions.length === 0 ? (
                <option value="">—</option>
              ) : (
                regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("clients.modal.city")} *
            </label>
            <select
              value={formVille}
              onChange={(e) => setFormVille(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:outline-none transition-all cursor-pointer"
            >
              {cities.length === 0 ? (
                <option value="">—</option>
              ) : (
                cities.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("clients.modal.fullAddress")} *
          </label>
          <textarea
            required
            rows={2}
            placeholder={t("clients.modal.addressExample")}
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            className="w-full bg-gray-50/50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-700 dark:text-gray-200 resize-none"
          />
        </div>

        {/* Error */}
        {submitError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            <strong>Error:</strong> {submitError}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold bg-brand-orange hover:bg-brand-orange/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl shadow-md shadow-brand-orange/10 transition-colors cursor-pointer"
          >
            {isSubmitting ? t("common.saving") || "Saving..." : t("common.save")}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}
