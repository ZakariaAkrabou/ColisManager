import { X, Phone, Globe, Building, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Client } from "../../pages/Clients/Clients";

interface ClientDetailsModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
}

export default function ClientDetailsModal({
  isOpen,
  client,
  onClose,
}: ClientDetailsModalProps) {
  const { t } = useTranslation();
  if (!isOpen || !client) return null;

  const initials = client.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const isDestinataire = client.client_type === "destinataire";

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/45 dark:bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    ></div>

    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-150 dark:border-slate-700 w-full max-w-lg overflow-hidden relative z-10 transform transition-all duration-300 scale-100 flex flex-col">

      <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <span className="bg-orange-50 dark:bg-orange-900/30 text-brand-orange text-xs font-bold px-2.5 py-1 rounded-lg font-mono">
            {client.id}
          </span>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("clients.modal.detailsTitle")}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">

        <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-orange-100/60 dark:bg-orange-900/30 text-brand-orange flex items-center justify-center font-bold text-lg">
            {initials}
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-950 dark:text-white">
              {client.full_name}
            </h4>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mt-1 font-mono">
              <Phone className="w-3.5 h-3.5" />
              <span>{client.phone_number}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
            {t("clients.modal.addressAndLocation")}
          </span>

          <div className="grid grid-cols-2 gap-4">

            <div className="flex items-start gap-2">
              <Globe className="w-4.5 h-4.5 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                  {t("clients.modal.country")}
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-0.5">
                  {client.country}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building className="w-4.5 h-4.5 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                  {t("clients.modal.cityRegion")}
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-0.5">
                  {client.city} / {client.region}
                </p>
              </div>
            </div>

          </div>

          <div className="flex items-start gap-2 border-t border-gray-50 dark:border-slate-700 pt-3">
            <MapPin className="w-4.5 h-4.5 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                {t("clients.modal.fullAddress")}
              </p>
              <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                {client.full_address}
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 dark:border-slate-700 pt-5">

          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-3.5">
            {t("clients.modal.activityStats")}
          </span>

          <div className="grid grid-cols-3 gap-3.5">

            <div className="bg-gray-50/50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                {t("clients.totalSent")}
              </p>
              <p className="text-xl font-extrabold text-blue-600 mt-1">
                {client.totalSent ?? 0}
              </p>
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                {t("clients.totalReceived")}
              </p>
              <p className="text-xl font-extrabold text-brand-orange mt-1">
                {client.totalReceived ?? 0}
              </p>
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                {t("clients.totalAmount")}
              </p>
              <p className="text-base font-extrabold text-slate-800 dark:text-white mt-1.5 whitespace-nowrap">
                {(client.totalAmount ?? 0).toLocaleString()} MAD
              </p>
            </div>

          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
          >
            {t("common.close")}
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-orange-100/60 text-brand-orange flex items-center justify-center font-bold text-lg">
              {initials}
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-950">
                {client.full_name}
              </h4>
              <div className="flex flex-col gap-1 mt-1 text-xs text-gray-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{client.phone_number}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-600">{t("clients.type")}:</span>
                  <span className="capitalize">{t(`clients.${client.client_type}`)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t("clients.modal.addressAndLocation")}
            </span>

            {isDestinataire ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Globe className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {t("clients.modal.country")}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {client.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Building className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {t("clients.modal.cityRegion")}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {client.city} / {client.region}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-2 border-t border-gray-50 pt-3">
              <MapPin className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {t("clients.modal.fullAddress")}
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5 leading-relaxed">
                  {client.full_address}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3.5">
              {t("clients.modal.activityStats")}
            </span>

            <div className="grid grid-cols-3 gap-3.5">
              <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {t("clients.totalSent")}
                </p>
                <p className="text-xl font-extrabold text-blue-600 mt-1">
                  {client.totalSent ?? 0}
                </p>
              </div>

              <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {t("clients.totalReceived")}
                </p>
                <p className="text-xl font-extrabold text-brand-orange mt-1">
                  {client.totalReceived ?? 0}
                </p>
              </div>

              <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {t("clients.totalAmount")}
                </p>
                <p className="text-base font-extrabold text-slate-800 mt-1.5 whitespace-nowrap">
                  {(client.totalAmount ?? 0).toLocaleString()} MAD
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}