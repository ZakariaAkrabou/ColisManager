import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ColisItem } from "../../types/colis";
import { Package, X } from "lucide-react";

interface DetailColisProps {
  colis: ColisItem;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailColisModal({ colis, isOpen, onClose }: DetailColisProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  return (
    <>
      {/* Centered Modal Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in" 
        onClick={onClose} 
      />

      {/* Centered Modal Box Wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex-none bg-linear-to-r from-orange-50/60 to-white px-6 py-5 border-b border-orange-100 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Détails du Colis</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <Package size={15} className="text-brand-orange" />
                <p className="text-sm font-mono font-bold text-brand-orange">{colis.trackingNo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-500 transition-colors shadow-sm border border-gray-100 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Column 1: Info Cards (Expéditeur & Destinataire) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acteurs</h3>
                
                <div className="bg-gray-50/70 rounded-xl p-4.5 border border-gray-100/80">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Expéditeur</p>
                  <p className="font-bold text-gray-800 text-base">{colis.sender}</p>
                </div>
                
                <div className="bg-blue-50/30 rounded-xl p-4.5 border border-blue-100/60">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">Destinataire</p>
                  <p className="font-bold text-gray-800 text-base">{colis.receiver}</p>
                  <p className="text-sm text-gray-600 mt-2 font-medium flex items-center gap-1">
                    <span className="text-blue-500">📍</span> {colis.city}
                  </p>
                </div>
              </div>

              {/* Column 2: Shipment Information details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Informations Colis</h3>
                
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between p-3.5 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Type de livraison</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">{colis.type}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Poids</span>
                    <span className="font-semibold text-gray-800">{colis.weight} <span className="text-xs text-gray-400 font-medium">kg</span></span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Date d'expédition</span>
                    <span className="text-sm font-semibold text-gray-800">{colis.date}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-orange-50/10">
                    <span className="text-sm text-gray-500 font-bold">Prix Total</span>
                    <span className="font-black text-xl text-brand-orange">{colis.totalPrice.toFixed(2)} <span className="text-xs font-bold">DH</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Statut actuel</h3>
              <div className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${
                colis.status === 'Livré' ? 'bg-green-50 border-green-100 text-green-800' :
                colis.status === 'En transit' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                colis.status === 'Annulé' ? 'bg-red-50 border-red-100 text-red-800' :
                'bg-yellow-50 border-yellow-100 text-yellow-800'
              }`}>
                <span className="font-bold text-sm tracking-wide">{colis.status}</span>
                <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
              </div>
            </div>

            {/* Images Grid Section */}
            {images.length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Images du Colis (cliquez pour agrandir)</h3>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((url, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedImage(url)}
                      className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group bg-gray-50 cursor-zoom-in"
                    >
                      <img
                        src={url}
                        alt={`Colis img ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
                        <span className="bg-white/95 text-gray-800 text-xs px-2.5 py-1 rounded-lg font-bold shadow-md">Zoom</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-none p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal (Click to zoom view) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-100 bg-slate-950/90 flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-5 right-5 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer shadow-lg"
            onClick={() => setSelectedImage(null)}
          >
            <X size={22} />
          </button>
          <img 
            src={selectedImage} 
            alt="Colis zoom" 
            className="max-w-full max-h-[92vh] object-contain rounded-xl shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200" 
          />
        </div>
      )}
    </>
  );
}


export async function showDetailColisModal(): Promise<void> {
  console.warn("showDetailColisModal is deprecated. Use DetailColisModal component instead.");
}
