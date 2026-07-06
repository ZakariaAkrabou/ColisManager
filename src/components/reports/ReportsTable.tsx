import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { generateFacture } from "../facture/generateFacture";
import { generateBonCommande } from "../bonCommande/generateBonCommande";


export interface ReportColis {
  id: number;
  tracking_number: string;

  sender_name: string;
  sender_phone: string;
  sender_address: string;

  receiver_name: string;
  receiver_phone: string;
  receiver_full_address: string;
  receiver_city: string;
  receiver_region: string;
  receiver_country: string;

  delivery_type: string;
  description: string;
  notes: string;

  weight: number;
  total_amount: number;

  status: string;
  created_at: string;
}

interface ReportsTableProps {
  data: ReportColis[];
  stats: {
    delivered: number;
    inProgress: number;
    pending: number;
    cancelled: number;
    totalRevenue: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeStatus = (status: string) => {
  const v = status?.toLowerCase() ?? "";
  if (v.includes("liv")) return "delivered";
  if (v.includes("trans")) return "inTransit";
  if (v.includes("cancel") || v.includes("annul")) return "cancelled";
  return "pending";
};

const statusConfig = {
  delivered: {
    label: "Livré",
    bg: "bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  inTransit: {
    label: "En transit",
    bg: "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  pending: {
    label: "En attente",
    bg: "bg-yellow-50 text-yellow-700 border border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  cancelled: {
    label: "Annulé",
    bg: "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
};

const handleFacture = async (colis: ReportColis) => {
  await generateFacture(colis);
};



const ReportsTable = ({ data, stats }: ReportsTableProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6   dark:bg-slate-950
">

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 border-b border-gray-100 dark:border-slate-800">

        {/* Delivered */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl shrink-0">
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
              {t("reports.delivered")}
            </p>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.delivered}
            </h2>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl shrink-0">
            <Truck className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
              {t("reports.inProgress")}
            </p>
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </h2>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl shrink-0">
            <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
              {t("reports.pending")}
            </p>
            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </h2>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl shrink-0">
            <Package className="text-orange-500 dark:text-orange-400" size={20} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
              {t("reports.totalRevenue")}
            </p>
            <h2 className="text-xl font-bold text-orange-500 dark:text-orange-400">
              {stats.totalRevenue.toLocaleString("fr-FR")} DH
            </h2>
          </div>
        </div>

      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={42} className="text-gray-300 dark:text-slate-600 stroke-[1.5]" />
            <p className="text-gray-400 dark:text-slate-500 text-sm">
              Aucun colis trouvé
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/70 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">N° Suivi</th>
                <th className="px-5 py-4">Expéditeur</th>
                <th className="px-5 py-4">Destinataire</th>
                <th className="px-5 py-4">Ville</th>
                <th className="px-5 py-4 text-center">Statut</th>

                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4 text-center">Facture</th>
                <th className="px-5 py-4 text-center">Bon De Commande</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {data.map((colis) => {
                const statusKey = normalizeStatus(colis.status);
                const cfg = statusConfig[statusKey];
                const city = colis.receiver_city || colis.receiver_region || "—"
                
                  ? colis.created_at.split("T")[0]
                  : "—";

                return (

                  <tr

                    key={colis.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Tracking */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Package
                          size={14}
                          className="text-gray-400 group-hover:text-orange-500 transition-colors shrink-0"
                        />
                        <span className="font-bold font-mono text-gray-800 dark:text-slate-200 text-xs">
                          {colis.tracking_number}
                        </span>
                      </div>
                    </td>

                    {/* Sender */}
                    <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-slate-300">
                      {colis.sender_name}
                    </td>

                    {/* Receiver */}
                    <td className="px-5 py-3.5 text-gray-600 dark:text-slate-400">
                      {colis.receiver_name}
                    </td>

                    {/* City */}
                    <td className="px-5 py-3.5 text-gray-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        {city}
                      </div>
                    </td>



                    {/* Status */}
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </td>



                    {/* Total */}
                    <td className="px-5 py-3.5 text-right font-bold text-gray-800 dark:text-slate-200">
                      {colis.total_amount.toFixed(2)}{" "}
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">DH</span>
                    </td>


                    {/* Facture Button */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleFacture(colis)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition cursor-pointer"
                      >
                        <FileText size={14} />
                        Facture
                      </button>

                    </td>

                    {/* Bon De Commande Button */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => generateBonCommande(colis)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition cursor-pointer"
                      >
                        <FileText size={14} />
                        Bon De Commande
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportsTable;
export { normalizeStatus };