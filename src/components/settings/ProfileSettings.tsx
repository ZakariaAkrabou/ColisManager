import React, { useState } from "react";
import { Save, Check, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProfileSettings() {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    companyName: "Moroccan shipping store",
    ownerName: "Zakaria Akrabou",
    email: "contact@colismanager.ma",
    phone: "+212 6 12 34 56 78",
    address: "Boulevard Anfa, Immeuble B, Casablanca",
    website: "https://colismanager.ma",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl animate-fade-in"
    >
      <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100/50">
        <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center text-brand-orange font-bold text-xl uppercase shrink-0 shadow-inner">
          {settings.companyName.substring(0, 2)}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-805">
            {t("settings.profile.logoTitle")}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("settings.profile.logoHint")}
          </p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-brand-orange hover:text-brand-orange/80 cursor-pointer"
          >
            {t("settings.profile.changeImage")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("settings.profile.companyName")}
          </label>
          <input
            type="text"
            required
            value={settings.companyName}
            onChange={(e) =>
              setSettings({ ...settings, companyName: e.target.value })
            }
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all"
            placeholder={t("settings.profile.companyNamePlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("settings.profile.ownerName")}
          </label>
          <input
            type="text"
            required
            value={settings.ownerName}
            onChange={(e) =>
              setSettings({ ...settings, ownerName: e.target.value })
            }
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all"
            placeholder={t("settings.profile.fullNamePlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("settings.profile.email")}
          </label>
          <input
            type="email"
            required
            value={settings.email}
            onChange={(e) =>
              setSettings({ ...settings, email: e.target.value })
            }
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all"
            placeholder={t("settings.profile.emailPlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("settings.profile.phone")}
          </label>
          <input
            type="text"
            required
            value={settings.phone}
            onChange={(e) =>
              setSettings({ ...settings, phone: e.target.value })
            }
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all font-mono"
            placeholder="+212 6 XX XX XX XX"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("settings.profile.address")}
          </label>
          <input
            type="text"
            required
            value={settings.address}
            onChange={(e) =>
              setSettings({ ...settings, address: e.target.value })
            }
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all"
            placeholder={t("settings.profile.addressPlaceholder")}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("settings.profile.website")}
          </label>
          <input
            type="url"
            value={settings.website}
            onChange={(e) =>
              setSettings({ ...settings, website: e.target.value })
            }
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all font-mono"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold animate-fade-in">
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
