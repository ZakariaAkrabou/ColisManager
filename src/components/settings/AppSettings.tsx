import React, { useState } from "react";
import { Save, Check, RefreshCw, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { applyTheme } from "../../utils/theme";
export default function AppSettings() {

  const [settings, setSettings] = useState(() => ({
    language: "fr",
    currency: "MAD",
    theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
    dateFormat: "dd/MM/yyyy",
  }));

  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);


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
className="
  space-y-6
  max-w-2xl
  animate-fade-in
  p-6
  rounded-2xl
  bg-white
  text-gray-900
  border
  border-gray-200

  dark:bg-slate-950
  dark:text-white
  dark:border-slate-700
"    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-300">
            {t("settings.app.defaultLanguage")}
          </label>
          <select
            value={settings.language}
            onChange={(e) =>
              setSettings({ ...settings, language: e.target.value })
            }
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-750 focus:outline-none transition-all cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
          >
            <option value="fr">{t("settings.app.languageFrench")}</option>
            <option value="ar">{t("settings.app.languageArabic")}</option>
            <option value="en">{t("settings.app.languageEnglish")}</option>
          </select>
        </div>

    

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("settings.app.visualTheme")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSettings({ ...settings, theme: "light" });
                applyTheme("light");
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${settings.theme === "light"
                  ? "bg-white border-brand-orange text-brand-orange ring-1 ring-brand-orange"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
            >
              <Sun className="w-4 h-4" />
              {t("settings.app.light")}
            </button>
            <button
              type="button"
              onClick={() => {
                setSettings({ ...settings, theme: "dark" });
                applyTheme("dark");
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${settings.theme === "dark"
                  ? "bg-slate-900 border-slate-950 text-white shadow-md"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
            >
              <Moon className="w-4 h-4" />
              {t("settings.app.dark")}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold animate-fade-in dark:bg-emerald-950 dark:text-emerald-100">
            <Check className="w-3.5 h-3.5" />
            <span>{t("settings.app.preferencesSaved")}</span>
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
          <span>{t("settings.app.savePreferences")}</span>
        </button>
      </div>
    </form>
  );
}
