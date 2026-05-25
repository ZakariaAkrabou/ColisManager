import React, { useState } from 'react';
import { Save, Check, RefreshCw, Sun, Moon } from 'lucide-react';

export default function AppSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    language: 'fr',
    currency: 'MAD',
    theme: 'light',
    dateFormat: 'dd/MM/yyyy',
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Langue par défaut</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-750 focus:outline-none transition-all cursor-pointer"
          >
            <option value="fr">Français (French)</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="en">English (US)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Devise principale</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-750 focus:outline-none transition-all cursor-pointer"
          >
            <option value="MAD">MAD (Dirham Marocain)</option>
            <option value="USD">USD ($ Dollars)</option>
            <option value="EUR">EUR (€ Euros)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Format des dates</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-750 focus:outline-none transition-all cursor-pointer"
          >
            <option value="dd/MM/yyyy">JJ/MM/AAAA (ex: 25/05/2026)</option>
            <option value="MM/dd/yyyy">MM/JJ/AAAA (ex: 05/25/2026)</option>
            <option value="yyyy-MM-dd">AAAA-MM-JJ (ex: 2026-05-25)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thème Visuel</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-white border-brand-orange text-brand-orange ring-1 ring-brand-orange'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sun className="w-4 h-4" />
              Clair
            </button>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Moon className="w-4 h-4" />
              Sombre
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Préférences enregistrées</span>
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
          <span>Enregistrer les préférences</span>
        </button>
      </div>
    </form>
  );
}
