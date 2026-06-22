import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
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
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    let objectUrls: string[] = [];
    if (isOpen && colis?.id) {
      const fetchImages = async () => {
        try {
          const res = await invoke<any>("get_colis_images", { id: Number(colis.id) });
          if (res.image_1) objectUrls.push(URL.createObjectURL(new Blob([new Uint8Array(res.image_1)])));
          if (res.image_2) objectUrls.push(URL.createObjectURL(new Blob([new Uint8Array(res.image_2)])));
          if (res.image_3) objectUrls.push(URL.createObjectURL(new Blob([new Uint8Array(res.image_3)])));
          setImages([...objectUrls]);
        } catch (err) {
          console.error("Failed to fetch images", err);
        }
      };
      fetchImages();
    } else {
      setImages([]);
    }
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [isOpen, colis]);

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
    <>
      {/* Transparent backdrop for dismissing */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.08)] border-l border-gray-100 flex flex-col h-full animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex-none bg-linear-to-r from-orange-50 to-white px-6 py-5 border-b border-orange-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Détails du Colis</h2>
            <div className="flex items-center gap-2 mt-1">
              <Package size={14} className="text-brand-orange" />
              <p className="text-sm font-mono font-bold text-gray-500">{colis.trackingNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-500 transition-colors shadow-sm border border-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Main Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expéditeur</p>
              <p className="font-semibold text-gray-800">{colis.sender}</p>
            </div>
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Destinataire</p>
              <p className="font-semibold text-gray-800">{colis.receiver}</p>
              <p className="text-xs text-gray-500 mt-1">{colis.city}</p>
            </div>
          </div>

          {/* Details Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informations</h3>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <span className="text-sm text-gray-500 font-medium">Type de livraison</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">{colis.type}</span>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <span className="text-sm text-gray-500 font-medium">Poids</span>
                <span className="font-semibold text-gray-800">{colis.weight} <span className="text-xs text-gray-400">kg</span></span>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <span className="text-sm text-gray-500 font-medium">Prix Total</span>
                <span className="font-black text-lg text-brand-orange">{colis.totalPrice.toFixed(2)} <span className="text-sm">DH</span></span>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-sm text-gray-500 font-medium">Date d'expédition</span>
                <span className="text-sm font-semibold text-gray-800">{colis.date}</span>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Statut actuel</h3>
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              colis.status === 'Livré' ? 'bg-green-50 border-green-100 text-green-800' :
              colis.status === 'En transit' ? 'bg-blue-50 border-blue-100 text-blue-800' :
              colis.status === 'Annulé' ? 'bg-red-50 border-red-100 text-red-800' :
              'bg-yellow-50 border-yellow-100 text-yellow-800'
            }`}>
              <span className="font-bold">{colis.status}</span>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            </div>
          </div>

          {/* Images Section */}
          {images.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Images du Colis</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
                {images.map((url, i) => (
                  <div key={i} className="snap-center shrink-0 w-40 h-40 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm relative group bg-gray-50">
                    <img
                      src={url}
                      alt={`Colis img ${i + 1}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-orange text-white hover:bg-orange-600 disabled:bg-orange-300 font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Printer size={18} />
            {isPrinting ? "Patientez..." : "Imprimer"}
          </button>
        </div>
      </div>
    </>
  );
}


export async function showDetailColisModal(): Promise<void> {
  console.warn("showDetailColisModal is deprecated. Use DetailColisModal component instead.");
}
