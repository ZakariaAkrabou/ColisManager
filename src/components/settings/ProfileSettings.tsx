import React, { useState, useEffect } from "react";
import { Save, Check, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import Swal from "sweetalert2";

export default function ProfileSettings() {
  const { t } = useTranslation();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [settings, setSettings] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    phone: "",
    phone2: "",
    address: "",
    website: "",
  });
  type SettingsData = {
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  phone2?: string;
  address: string;
  website?: string;
};

  const loadSettings = async () => {
  try {
    setIsLoading(true);
    const data = await invoke<any>("get_settings");

    console.log("DATA FROM RUST:", data);

    setSettings({
      companyName: data.company_name,
      ownerName: data.owner_name,
      email: data.email,
      phone: data.phone,
      phone2: data.phone2 || "",
      address: data.address,
      website: data.website || "",
    });

  } catch (error) {
    console.error("LOAD ERROR:", error);
  } finally {
    setIsLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await invoke("save_settings", {
        settings: {
          company_name: settings.companyName,
          owner_name: settings.ownerName,
          email: settings.email,
          phone: settings.phone,
          phone2: settings.phone2,
          address: settings.address,
          website: settings.website,
          logo_path: null,
        },
      });
      
      setSaveSuccess(true);
  Swal.fire({
    title: t("common.success") || "Succès",
    text: t("settings.profile.updated") || "Paramètres enregistrés avec succès.",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  });
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de la sauvegarde des paramètres.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  return (
    isLoading ? (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    ) : (
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-2xl animate-fade-in dark:text-slate-100"
      >
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
              {t("settings.profile.companyName")}
            </label>
            <input
              type="text"
              required
              value={settings.companyName}
              onChange={(e) =>
                setSettings({ ...settings, companyName: e.target.value })
              }
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
              {t("settings.profile.ownerName")}
            </label>
            <input
              type="text"
              required
              value={settings.ownerName}
              onChange={(e) =>
                setSettings({ ...settings, ownerName: e.target.value })
              }
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
              {t("settings.profile.email")}
            </label>
            <input
              type="email"
              required
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
              {t("settings.profile.phone")}
            </label>
            <input
              type="text"
              required
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all font-mono dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
              {t("settings.profile.phone2")}
            </label>
            <input
              type="text"
              value={settings.phone2}
              onChange={(e) =>
                setSettings({ ...settings, phone2: e.target.value })
              }
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all font-mono dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
              {t("settings.profile.address")}
            </label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
              {t("settings.profile.website")}
            </label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) =>
                setSettings({ ...settings, website: e.target.value })
              }
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all font-mono dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700 pt-5 flex items-center justify-end gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold animate-fade-in dark:bg-emerald-950 dark:text-emerald-100">
              <Check className="w-3.5 h-3.5" />
              <span>{t("settings.profile.updated")}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{t("settings.profile.saveChanges")}</span>
          </button>
        </div>
      </form>
    )
  );
}