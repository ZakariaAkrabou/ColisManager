import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ColisItem } from "../../types/colis";
import {
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Scale,
  Truck,
  Calendar,
  DollarSign,
  ImageOff,
  ZoomIn,
} from "lucide-react";

interface DetailColisProps {
  colis: ColisItem;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailColisModal({ colis, isOpen, onClose }: DetailColisProps) {
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

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
          setActiveIndex(0);
        } catch (err) {
          console.error("Failed to fetch images", err);
        }
      };
      fetchImages();
    } else {
      setImages([]);
      setActiveIndex(0);
    }
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [isOpen, colis]);

  if (!isOpen) return null;

  const statusConfig = {
    "Livré":     { bg: "bg-green-50 dark:bg-green-500/10",  border: "border-green-200 dark:border-green-500/20",  text: "text-green-700 dark:text-green-400",  dot: "bg-green-500"  },
    "En transit":{ bg: "bg-blue-50 dark:bg-blue-500/10",   border: "border-blue-200 dark:border-blue-500/20",    text: "text-blue-700 dark:text-blue-400",    dot: "bg-blue-500"   },
    "Annulé":    { bg: "bg-red-50 dark:bg-red-500/10",     border: "border-red-200 dark:border-red-500/20",      text: "text-red-700 dark:text-red-400",      dot: "bg-red-500"    },
    "En attente":{ bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20",  text: "text-amber-700 dark:text-amber-400",  dot: "bg-amber-500"  },
  };
  const status = statusConfig[colis.status as keyof typeof statusConfig] || statusConfig["En attente"];

  const goPrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, images.length]);

  return (
    <>
   
      <div
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />


      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-3xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">

       
          <div className="flex-none flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-slate-800 bg-linear-to-r from-orange-50/80 to-white dark:from-orange-950/20 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                <Package size={16} className="text-brand-orange" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  Détails du Colis
                </h2>
                <p className="text-xs font-mono font-semibold text-brand-orange mt-0.5">
                  {colis.trackingNo}
                </p>
              </div>
              {/* Status pill in header */}
              <span className={`ml-2 hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.border} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                {colis.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Body: split panel ── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* LEFT PANEL — Info */}
            <div className="flex flex-col w-full md:w-[52%] overflow-y-auto p-4 gap-4 border-r border-gray-100 dark:border-slate-800">

              {/* Actors */}
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Acteurs</p>
                {/* Expéditeur */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                    <User size={13} className="text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Expéditeur</p>
                    <p className="font-bold text-gray-900 dark:text-white text-xs">{colis.sender}</p>
                  </div>
                </div>
                {/* Destinataire */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/40 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-900/30">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <MapPin size={13} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-0.5">Destinataire</p>
                    <p className="font-bold text-gray-900 dark:text-white text-xs">{colis.receiver}</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">{colis.city}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-slate-800" />

              {/* Shipment Details */}
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Informations colis</p>
                <div className="rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden divide-y divide-gray-50 dark:divide-slate-800">
                  {/* Type */}
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                      <Truck size={13} />
                      <span className="text-xs font-medium">Type de livraison</span>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700/80 rounded-lg text-[10px] font-bold text-gray-700 dark:text-slate-300">
                      {colis.type}
                    </span>
                  </div>
                  {/* Poids */}
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                      <Scale size={13} />
                      <span className="text-xs font-medium">Poids</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
                      {colis.weight} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">kg</span>
                    </span>
                  </div>
                  {/* Quantité */}
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                      <Package size={13} />
                      <span className="text-xs font-medium">Quantité</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
                      {colis.quantity || 1}
                    </span>
                  </div>
                  {/* Date */}
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                      <Calendar size={13} />
                      <span className="text-xs font-medium">Date d'expédition</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{colis.date}</span>
                  </div>
                  {/* Prix total — highlighted */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-orange-50/60 dark:bg-orange-500/5">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                      <DollarSign size={13} className="text-brand-orange" />
                      <span className="text-xs font-bold">Prix Total</span>
                    </div>
                    <span className="text-lg font-black text-brand-orange">
                      {colis.totalPrice.toFixed(2)}<span className="text-xs font-bold ml-1">DH</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status (mobile — shown when no right panel images) */}
              <div className={`md:hidden flex items-center justify-between p-4 rounded-xl border ${status.bg} ${status.border}`}>
                <span className={`font-bold text-sm ${status.text}`}>{colis.status}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${status.dot} animate-pulse`} />
              </div>
            </div>

            {/* RIGHT PANEL — Image Slideshow */}
            <div className="hidden md:flex flex-col w-[48%] bg-gray-50 dark:bg-slate-950 relative">
              {images.length > 0 ? (
                <>
                  {/* Main image */}
                  <div
                    className="relative flex-1 overflow-hidden group cursor-zoom-in"
                    onClick={() => setLightbox(true)}
                  >
                    <img
                      key={activeIndex}
                      src={images[activeIndex]}
                      alt={`Colis image ${activeIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in"
                    />
                    {/* Overlay hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 text-gray-800 dark:text-white text-xs px-3 py-2 rounded-xl font-bold shadow-lg backdrop-blur-sm">
                        <ZoomIn size={14} />
                        Agrandir
                      </div>
                    </div>

                    {/* Navigation arrows (shown if multiple images) */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); goPrev(); }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center text-gray-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); goNext(); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center text-gray-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}

                    {/* Image counter badge */}
                    {images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                        {activeIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {images.length > 1 && (
                    <div className="flex-none flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                      {images.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIndex(i)}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                            i === activeIndex
                              ? "border-brand-orange shadow-md shadow-orange-200 dark:shadow-orange-900/30 scale-105"
                              : "border-transparent hover:border-gray-300 dark:hover:border-slate-600 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {/* Dot indicator */}
                      <div className="flex gap-1 ml-auto">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`rounded-full transition-all cursor-pointer ${
                              i === activeIndex
                                ? "w-4 h-2 bg-brand-orange"
                                : "w-2 h-2 bg-gray-300 dark:bg-slate-600 hover:bg-brand-orange/50"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status overlay at bottom of image panel */}
                  <div className={`flex-none flex items-center justify-between px-4 py-3 ${status.bg} border-t ${status.border}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">Statut</p>
                    <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${status.text}`}>
                      <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                      {colis.status}
                    </span>
                  </div>
                </>
              ) : (
                /* No images placeholder */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                    <ImageOff size={28} className="text-gray-300 dark:text-slate-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-400 dark:text-slate-500">Aucune image</p>
                    <p className="text-xs text-gray-300 dark:text-slate-600 mt-1">Pas de photos pour ce colis</p>
                  </div>
                  {/* Status badge when no image */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${status.bg} ${status.border} ${status.text}`}>
                    <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                    <span className="font-bold text-sm">{colis.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex-none flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && images.length > 0 && (
        <div
          className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer z-10"
          >
            <X size={22} />
          </button>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-5 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer z-10"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Main image */}
          <img
            key={activeIndex}
            src={images[activeIndex]}
            alt="Colis zoom"
            className="max-w-[90vw] max-h-[88vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={`rounded-full transition-all cursor-pointer ${
                    i === activeIndex ? "w-6 h-2.5 bg-brand-orange" : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export async function showDetailColisModal(): Promise<void> {
  console.warn("showDetailColisModal is deprecated. Use DetailColisModal component instead.");
}
