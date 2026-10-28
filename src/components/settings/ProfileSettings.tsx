import React, { useRef, useState, useEffect } from "react";
import { Save, Check, RefreshCw, Upload, X, Image } from "lucide-react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import Swal from "sweetalert2";

export default function ProfileSettings() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    phone: "",
    phone2: "",
    address: "",
    website: "",
    logoPath: null as string | null,
  });

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
        logoPath: data.logo_path || null,
      });

      if (data.logo_path) {
        setLogoPreview(data.logo_path);
      }
    } catch (error) {
      console.error("LOAD ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Erreur", text: "Veuillez sélectionner une image." });
      return;
    }

    // Check file size (max 500KB to fit in SQLite)
    if (file.size > 500 * 1024) {
      Swal.fire({ icon: "error", title: "Erreur", text: "L'image ne doit pas dépasser 500 KB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      setSettings((prev) => ({ ...prev, logoPath: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setSettings((prev) => ({ ...prev, logoPath: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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
          logo_path: settings.logoPath,
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

  return isLoading ? (
    <div className="flex items-center justify-center h-48">
      <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
    </div>
  ) : (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl animate-fade-in dark:text-slate-100"
    >
      {/* ── Logo Upload ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
          Logo de l'entreprise
        </label>

        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-800 flex-shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <Image className="w-8 h-8 text-gray-300 dark:text-slate-600" />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {logoPreview ? "Changer le logo" : "Télécharger un logo"}
            </button>

            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                Supprimer le logo
              </button>
            )}

            <p className="text-xs text-gray-400 dark:text-slate-500">
              PNG, JPG, SVG — max 500 KB
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>

      {/* ── Other fields ────────────────────────────────────────────── */}
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

      {/* ── Save button ──────────────────────────────────────────────── */}
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
  );
}