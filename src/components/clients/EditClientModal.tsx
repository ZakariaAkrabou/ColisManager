import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Client } from "../../pages/Clients/Clients";

interface EditClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (updatedClient: Client) => void;
}

export default function EditClientModal({
  isOpen,
  client,
  onClose,
  onSave,
}: EditClientModalProps) {
  const { t } = useTranslation();
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPays, setFormPays] = useState("Maroc");
  const [formRegion, setFormRegion] = useState("");
  const [formVille, setFormVille] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formSent, setFormSent] = useState(0);
  const [formReceived, setFormReceived] = useState(0);
  const [formAmount, setFormAmount] = useState(0);

  useEffect(() => {
    if (client) {
      setFormName(client.fullName);
      setFormPhone(client.phone);
      setFormPays(client.pays);
      setFormRegion(client.region);
      setFormVille(client.ville);
      setFormAddress(client.fullAddress);
      setFormSent(client.totalSent);
      setFormReceived(client.totalReceived);
      setFormAmount(client.totalAmount);
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    if (!formName.trim() || !formPhone.trim() || !formAddress.trim()) {
      return;
    }

    onSave({
      ...client,
      fullName: formName.trim(),
      phone: formPhone.trim(),
      pays: formPays,
      region: formRegion.trim() || formVille.trim(),
      ville: formVille.trim(),
      fullAddress: formAddress.trim(),
      totalSent: Number(formSent) || 0,
      totalReceived: Number(formReceived) || 0,
      totalAmount: Number(formAmount) || 0,
    });
  };

  if (!isOpen || !client) return null;

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
              {t("clients.modal.editTitle", { id: client.id })}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("clients.modal.editSubtitle")}
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
                onChange={(e) => setFormPays(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none transition-all cursor-pointer"
              >
                <option value="Maroc">Maroc</option>
                <option value="France">France</option>
                <option value="Espagne">Espagne</option>
                <option value="Sénégal">Sénégal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("clients.modal.region")} *
              </label>
              <input
                type="text"
                required
                value={formRegion}
                onChange={(e) => setFormRegion(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("clients.modal.city")} *
              </label>
              <input
                type="text"
                required
                value={formVille}
                onChange={(e) => setFormVille(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all text-gray-700"
              />
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
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all text-gray-700 resize-none"
            />
          </div>

          {/* Stats/Financial fields */}

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
              className="px-5 py-2 text-sm font-semibold bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl shadow-md shadow-brand-orange/10 transition-colors cursor-pointer"
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
