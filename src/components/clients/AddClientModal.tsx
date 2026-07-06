import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Globe2,
  MapPin,
  User,
  UsersRound,
  X,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { useTranslation } from "react-i18next";
import { Client } from "../../pages/Clients/Clients";
import { invoke } from "@tauri-apps/api/core";
import Swal from "sweetalert2";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (client: Client) => void;
}

interface LocationRow {
  id: number;
  country: string;
  region: string;
  city: string | null;
}

const COUNTRY_CODES = [
  { name: "Morocco", code: "MA", phoneCode: "+212" },
  { name: "France", code: "FR", phoneCode: "+33" },
  { name: "Spain", code: "ES", phoneCode: "+34" },
  { name: "Senegal", code: "SN", phoneCode: "+221" },
  { name: "Belgium", code: "BE", phoneCode: "+32" },
  { name: "Germany", code: "DE", phoneCode: "+49" },
  { name: "Italy", code: "IT", phoneCode: "+39" },
  { name: "United Kingdom", code: "GB", phoneCode: "+44" },
  { name: "Canada", code: "CA", phoneCode: "+1" },
  { name: "United States", code: "US", phoneCode: "+1" },
];

const fieldWrapClass = "space-y-1.5";
const labelClass =
  "text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider";
const controlClass =
  "h-11 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/60 px-3.5 text-sm text-gray-800 dark:text-slate-200 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500 hover:bg-white dark:hover:bg-slate-800 focus:border-brand-orange focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-brand-orange/15";
const selectClass = `${controlClass} cursor-pointer appearance-none pr-9`;
const iconClass = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500";
const iconControlClass = `${controlClass} pl-10`;

export default function AddClientModal({
  isOpen,
  onClose,
  onAdd,
}: AddClientModalProps) {
  const { t } = useTranslation();
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formClientType, setFormClientType] = useState<
    "expediteur" | "destinataire"
  >("destinataire");
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
      setFormCountryCode("MA");
      setSubmitError(null);
      invoke<LocationRow[]>("get_locations")
        .then((res) => {
          setLocations(res);
          if (res.length > 0) {
            const marocLoc =
              res.find(
                (loc) =>
                  loc.country.toLowerCase() === "morocco" ||
                  loc.country.toLowerCase() === "maroc",
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
      (loc) => loc.country === formPays && loc.region === formRegion,
    );
    return Array.from(new Set(filtered.map((loc) => loc.city || ""))).filter(
      Boolean,
    );
  }, [locations, formPays, formRegion]);

  const selectedCountry = useMemo(() => {
    return (
      COUNTRY_CODES.find((country) => country.code === formCountryCode) ||
      COUNTRY_CODES[0]
    );
  }, [formCountryCode]);

  const handleCountryChange = (country: string) => {
    setFormPays(country);
    const filteredRegions = locations.filter((loc) => loc.country === country);
    const uniqueRegs = Array.from(
      new Set(filteredRegions.map((loc) => loc.region)),
    );

    if (uniqueRegs.length > 0) {
      const nextReg = uniqueRegs[0];
      setFormRegion(nextReg);
      const filteredCities = filteredRegions.filter(
        (loc) => loc.region === nextReg,
      );
      const uniqueCits = Array.from(
        new Set(filteredCities.map((loc) => loc.city || "")),
      ).filter(Boolean);
      setFormVille(uniqueCits.length > 0 ? uniqueCits[0] : "");
    } else {
      setFormRegion("");
      setFormVille("");
    }
  };

  const handleRegionChange = (region: string) => {
    setFormRegion(region);
    const filteredCities = locations.filter(
      (loc) => loc.country === formPays && loc.region === region,
    );
    const uniqueCits = Array.from(
      new Set(filteredCities.map((loc) => loc.city || "")),
    ).filter(Boolean);
    setFormVille(uniqueCits.length > 0 ? uniqueCits[0] : "");
  };

  const resetForm = () => {
    setFormName("");
    setFormPhone("");
    setFormClientType("destinataire");
    setFormCountryCode("MA");
    setFormAddress("");

    if (locations.length > 0) {
      const marocLoc =
        locations.find(
          (loc) =>
            loc.country.toLowerCase() === "morocco" ||
            loc.country.toLowerCase() === "maroc",
        ) || locations[0];
      setFormPays(marocLoc.country);
      setFormRegion(marocLoc.region);
      setFormVille(marocLoc.city || "");
    } else {
      setFormPays("");
      setFormRegion("");
      setFormVille("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formName.trim() || !formPhone.trim() || !formAddress.trim()) {
      return;
    }

    if (
      formClientType === "destinataire" &&
      (!formPays || !formRegion || !formVille)
    ) {
      setSubmitError(
        t("clients.modal.destinationFieldsRequired") ||
          "Please fill all destination fields.",
      );
      return;
    }

    const selectedLocation =
      formClientType === "destinataire"
        ? locations.find(
            (loc) =>
              loc.country === formPays &&
              loc.region === formRegion &&
              (loc.city === formVille || (!loc.city && !formVille)),
          )
        : null;
    const locationId = selectedLocation ? selectedLocation.id : null;

    setIsSubmitting(true);
    try {
      const phoneNumber = formPhone.startsWith("+") ? formPhone.trim() : `${selectedCountry.phoneCode}${formPhone.trim().replace(/^\+/, "")}`;
      const insertedId = await invoke<number>("create_client", {
        payload: {
          client_type: formClientType,
          full_name: formName.trim(),
          phone_number: phoneNumber,
          location_id: locationId,
          full_address: formAddress.trim(),
        },
      });

      onAdd({
        id: insertedId,
        client_type: formClientType,
        full_name: formName.trim(),
        phone_number: phoneNumber,
        country: formClientType === "destinataire" ? formPays : "",
        region:
          formClientType === "destinataire"
            ? formRegion.trim() || formVille.trim()
            : "",
        city: formClientType === "destinataire" ? formVille.trim() : "",
        full_address: formAddress.trim(),
        totalSent: 0,
        totalReceived: 0,
        totalAmount: 0,
      });

      Swal.fire({
        title: t("common.success") || "Succes",
        text: t("clients.clientAddedSuccess") || "Client ajoute avec succes.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Create client error:", error);
      setSubmitError(
        typeof error === "string"
          ? error
          : "Failed to save client. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
      <button
        type="button"
        aria-label={t("common.close") || "Close"}
        className="absolute inset-0 bg-slate-950/45 dark:bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">
              {t("clients.modal.addTitle")}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-gray-400 dark:text-slate-500">
              {t("clients.modal.addSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-white dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto p-5"
        >
          <section className="space-y-3.5">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10 text-brand-orange">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
                {t("clients.modal.clientType")}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className={`${fieldWrapClass} md:col-span-2`}>
                <label className={labelClass}>
                  {t("clients.modal.fullName")} *
                </label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    required
                    placeholder={t("clients.modal.fullNameExample")}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={iconControlClass}
                  />
                </div>
              </div>

              <div className={fieldWrapClass}>
                <label className={labelClass}>
                  {t("clients.modal.clientType")} *
                </label>
                <div className="relative">
                      <UsersRound className={iconClass} />
                      <select
                        value={formClientType}
                        onChange={(e) =>
                          setFormClientType(
                            e.target.value as "expediteur" | "destinataire",
                          )
                        }
                        className={`${iconControlClass} appearance-none pr-10 cursor-pointer`}
                      >
                        <option value="destinataire" className="dark:bg-slate-900">
                          {t("clients.modal.destinataire")}
                        </option>
                        <option value="expediteur" className="dark:bg-slate-900">
                          {t("clients.modal.expediteur")}
                        </option>
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                </div>
              </div>

              <div className={`${fieldWrapClass} md:col-span-2`}>
                <label className={labelClass}>{t("clients.modal.phone")} *</label>
                <div className="relative h-11 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/60 transition-all hover:bg-white dark:hover:bg-slate-800 focus-within:border-brand-orange focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-brand-orange/15">
                  <PhoneInput
                    country={formCountryCode.toLowerCase()}
                    value={formPhone}
                    onChange={(value: string, data: any) => {
                      // value may come without +, normalize to include + when sending
                      setFormPhone(value ? (value.startsWith("+") ? value : `+${value}`) : "");
                      if (data?.countryCode) setFormCountryCode(data.countryCode.toUpperCase());
                    }}
                    inputClass="!w-full !h-11 !bg-transparent !border-none !text-sm !text-gray-800 dark:!text-slate-200 !outline-none !pl-[48px] !pr-3.5 placeholder:!text-gray-400 dark:placeholder:!text-slate-500"
                    buttonClass="!bg-transparent !border-0 !border-r !border-gray-200 dark:!border-slate-700 !rounded-l-xl"
                    containerClass="!w-full !h-full"
                    dropdownClass="!w-max !rounded-xl !border-gray-200 dark:!border-slate-700 !shadow-lg dark:!bg-slate-850 dark:!text-slate-200"
                    enableSearch
                    preferredCountries={["ma", "fr"]}
                  />
                </div>
              </div>
            </div>
          </section>

          {formClientType === "destinataire" ? (
            <section className="space-y-3.5">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
                  {t("clients.modal.addressAndLocation")}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className={fieldWrapClass}>
                  <label className={labelClass}>
                    {t("clients.modal.country")} *
                  </label>
                  <div className="relative">
                    <Globe2 className={iconClass} />
                    <select
                      value={formPays}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className={`${selectClass} pl-10`}
                    >
                      {countries.length === 0 ? (
                        <option value="" className="dark:bg-slate-900">
                          {t("common.loading") || "Loading..."}
                        </option>
                      ) : (
                        countries.map((country) => (
                          <option key={country} value={country} className="dark:bg-slate-900">
                            {country}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className={fieldWrapClass}>
                  <label className={labelClass}>
                    {t("clients.modal.region")} *
                  </label>
                  <div className="relative">
                    <Building2 className={iconClass} />
                    <select
                      value={formRegion}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className={`${selectClass} pl-10`}
                    >
                      {regions.length === 0 ? (
                        <option value="" className="dark:bg-slate-900">-</option>
                      ) : (
                        regions.map((region) => (
                          <option key={region} value={region} className="dark:bg-slate-900">
                            {region}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className={fieldWrapClass}>
                  <label className={labelClass}>{t("clients.modal.city")} *</label>
                  <div className="relative">
                    <MapPin className={iconClass} />
                    <select
                      value={formVille}
                      onChange={(e) => setFormVille(e.target.value)}
                      className={`${selectClass} pl-10`}
                    >
                      {cities.length === 0 ? (
                        <option value="" className="dark:bg-slate-900">-</option>
                      ) : (
                        cities.map((city) => (
                          <option key={city} value={city} className="dark:bg-slate-900">
                            {city}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <div className={fieldWrapClass}>
            <label className={labelClass}>
              {t("clients.modal.fullAddress")} *
            </label>
            <div className="relative">
              <MapPin className={iconClass} />
              <input
                type="text"
                required
                placeholder={t("clients.modal.addressExample")}
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className={iconControlClass}
              />
            </div>
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-semibold text-gray-600 dark:text-slate-300 transition-colors hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-md shadow-brand-orange/10 transition-colors hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting
                ? t("common.saving") || "Saving..."
                : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
