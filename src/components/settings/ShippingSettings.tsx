import React, { useState } from 'react';
import { Save, Check, RefreshCw } from 'lucide-react';

export default function ShippingSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    agencyDeliveryFee: 40, // Frais de livraison standard (en agence)
    homeDeliveryFee: 55,   // Frais de livraison à domicile
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
      <div className="bg-gray-55/30 rounded-xl p-4 border border-gray-100 mb-2">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Configuration des modes de livraison</h3>
        <p className="text-xs text-gray-500">Définissez les frais applicables pour la livraison en agence (Standard) et la livraison directement au domicile du client.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Livraison en Agence (Standard) (MAD)
          </label>
          <input
            type="number"
            required
            min="0"
            value={settings.agencyDeliveryFee}
            onChange={(e) => setSettings({ ...settings, agencyDeliveryFee: Number(e.target.value) })}
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all font-medium"
            placeholder="Ex: 20"
          />
          <span className="text-[11px] text-gray-400 block mt-0.5">Tarif de base pour livraison avec retrait en agence.</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Livraison à Domicile (Client) (MAD)
          </label>
          <input
            type="number"
            required
            min="0"
            value={settings.homeDeliveryFee}
            onChange={(e) => setSettings({ ...settings, homeDeliveryFee: Number(e.target.value) })}
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all font-medium"
            placeholder="Ex: 30"
          />
          <span className="text-[11px] text-gray-400 block mt-0.5">Tarif pour livraison directe à l'adresse du destinataire.</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Tarifs mis à jour</span>
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
          <span>Enregistrer les tarifs</span>
        </button>
      </div>
    </form>
  );
}
