import { useState } from "react";
import type { ColisItem } from "../../types/colis";
import { printFacture } from "../../utils/printHelpers";
import { Package, Printer, X } from "lucide-react";

interface DetailColisProps {
  colis: ColisItem;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailColisModal({ colis, isOpen, onClose }: DetailColisProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      console.log("Starting print with colis:", colis);
      const success = await printFacture(colis);
      console.log("Print result:", success);
      if (!success) {
        alert("Impossible d'ouvrir la fenêtre d'impression. Veuillez vérifier vos paramètres de navigateur.");
      }
    } catch (err) {
      console.error("Error printing facture:", err);
      alert("Impossible d'imprimer la facture. Veuillez vérifier vos paramètres de navigateur.");
    } finally {
      setIsPrinting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Livré":
        return "bg-green-100 text-green-800";
      case "En transit":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Détails du Colis</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tracking Number */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="bg-[#FDF1EA] p-3 rounded-lg text-orange-500">
              <Package size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold">Numéro de Suivi (N°Track)</p>
              <p className="font-bold text-lg text-gray-800 font-mono">{colis.trackingNo}</p>
            </div>
          </div>

          {/* Sender & Receiver */}
          <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold block mb-1">Expéditeur</p>
              <p className="font-semibold text-gray-700">{colis.sender}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold block mb-1">Destinataire</p>
              <p className="font-semibold text-gray-700">{colis.receiver}</p>
            </div>
          </div>

          {/* City & Type */}
          <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold block mb-1">Ville</p>
              <p className="font-semibold text-gray-700">{colis.city}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold block mb-1">Type de Livraison</p>
              <p className="font-semibold text-gray-700">{colis.type}</p>
            </div>
          </div>

          {/* Weight & Price */}
          <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold block mb-1">Poids</p>
              <p className="font-semibold text-gray-700">{colis.weight} kg</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold block mb-1">Prix Total</p>
              <p className="font-bold text-blue-600 text-lg">{colis.totalPrice.toFixed(2)} DH</p>
            </div>
          </div>

          {/* Date & Status */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-1">Date d'Expédition</p>
              <p className="text-gray-700 text-sm font-medium">{colis.date}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs font-semibold mb-1">Statut actuel</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(colis.status)}`}>
                {colis.status}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300 font-medium transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            {isPrinting ? "Impression..." : "Imprimer Facture"}
          </button>
        </div>
      </div>
    </div>
  );
}


export async function showDetailColisModal(): Promise<void> {
  console.warn("showDetailColisModal is deprecated. Use DetailColisModal component instead.");
}
