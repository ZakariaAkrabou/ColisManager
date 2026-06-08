// src/components/clients/AddClientModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Client } from "../../pages/Clients/Clients";
import { invoke } from "@tauri-apps/api/core";

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

export default function AddClientModal({
  isOpen,
  onClose,
  onAdd,
}: AddClientModalProps) {
  const { t } = useTranslation();
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPays, setFormPays] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formVille, setFormVille] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [locations, setLocations] = useState<LocationRow[]>([]);

  useEffect(() => {
    if (isOpen) {
      invoke<LocationRow[]>("get_locations")
        .then((res) => {
          setLocations(res);
          if (res.length > 0) {
            // Find Morocco or the first location to set as default
            const marocLoc = res.find(loc => loc.country.toLowerCase() === "morocco" || loc.country.toLowerCase() === "maroc") || res[0];
            setFormPays(marocLoc.country);
            setFormRegion(marocLoc.region);
            setFormVille(marocLoc.city || "");
          }
        })
        .catch((err) => console.error("Failed to load locations:", err));
    }
  }, [isOpen]);

  // Unique countries
  const countries = useMemo(() => {
    return Array.from(new Set(locations.map((loc) => loc.country)));
  }, [locations]);

  // Unique regions based on current country
  const regions = useMemo(() => {
    const filtered = locations.filter((loc) => loc.country === formPays);
    return Array.from(new Set(filtered.map((loc) => loc.region)));
  }, [locations, formPays]);

  // Unique cities based on current country & region
  const cities = useMemo(() => {
    const filtered = locations.filter(
      (loc) => loc.country === formPays && loc.region === formRegion
    );
    return Array.from(
      new Set(filtered.map((loc) => loc.city || ""))
    ).filter(Boolean);
  }, [locations, formPays, formRegion]);

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

    // Find the corresponding LocationID
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

      // Notify parent (shows toast + closes modal via setIsAddModalOpen(false))
      onAdd({
        fullName: formName.trim(),
        phone: formPhone.trim(),
        pays: formPays,
        region: formRegion.trim() || formVille.trim(),
        ville: formVille.trim(),
        fullAddress: formAddress.trim(),
        totalSent: 0,
        totalReceived: 0,
        totalAmount: 0,
      });

      // Reset form
      setFormName("");
      setFormPhone("");
      if (locations.length > 0) {
        const marocLoc = locations.find(loc => loc.country.toLowerCase() === "morocco" || loc.country.toLowerCase() === "maroc") || locations[0];
        setFormPays(marocLoc.country);
        setFormRegion(marocLoc.region);
        setFormVille(marocLoc.city || "");
      } else {
        setFormPays("");
        setFormRegion("");
        setFormVille("");
      }
      setFormAddress("");

      // Close the modal explicitly
      onClose();
    } catch (error) {
      console.error("Create client error:", error);
      setSubmitError(typeof error === "string" ? error : "Failed to save client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-150 w-full max-w-2xl overflow-hidden relative z-10 transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t("clients.modal.addTitle")}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("clients.modal.addSubtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Profile fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("clients.modal.fullName")} *
              </label>
              <input
                type="text"
                required
                placeholder={t("clients.modal.fullNameExample")}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all placeholder:text-gray-400 text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("clients.modal.phone")} *
              </label>
              <input
                type="text"
                required
                placeholder={t("clients.modal.phoneExample")}
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all placeholder:text-gray-400 text-gray-700"
              />
            </div>
          </div>

          {/* Geographic fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("clients.modal.country")} *
              </label>
              <select
                value={formPays}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none transition-all cursor-pointer"
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("clients.modal.region")} *
              </label>
              <select
                value={formRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none transition-all cursor-pointer"
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("clients.modal.city")} *
              </label>
              <select
                value={formVille}
                onChange={(e) => setFormVille(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none transition-all cursor-pointer"
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("clients.modal.fullAddress")} *
            </label>
            <textarea
              required
              rows={2}
              placeholder={t("clients.modal.addressExample")}
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all placeholder:text-gray-400 text-gray-700 resize-none"
            />
          </div>

          {/* Error message */}
          {submitError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <strong>Error:</strong> {submitError}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-gray-600 transition-colors cursor-pointer"
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
