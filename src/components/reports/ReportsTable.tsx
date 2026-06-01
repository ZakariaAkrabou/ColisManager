import React from "react";
import { Eye, Printer, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Colis {
  id: string;
  client: string;
  weight: number;
  type: string;
  status: string;
  total: number;
}

interface Props {
  colisList: Colis[];
}

const ReportsTable: React.FC<Props> = ({ colisList }) => {
  const { t } = useTranslation();

  const getStatusLabel = (status: string) => {
    if (status === "Livré") return t("reports.delivered");
    if (status === "En cours") return t("reports.inProgress");
    if (status === "Nouveau") return t("reports.new");
    return status;
  };

  const getTypeLabel = (type: string) => {
    if (type === "À domicile") return t("reports.homeDelivery");
    return type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Livré":
        return "bg-green-100 text-green-700";

      case "En cours":
        return "bg-orange-100 text-orange-700";

      case "Nouveau":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-700">
          {t("reports.parcelList")}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-sm">
              <th className="px-6 py-4 text-left">{t("reports.id")}</th>
              <th className="px-6 py-4 text-left">{t("reports.client")}</th>
              <th className="px-6 py-4 text-left">{t("reports.weight")}</th>
              <th className="px-6 py-4 text-left">{t("reports.type")}</th>
              <th className="px-6 py-4 text-left">{t("reports.status")}</th>
              <th className="px-6 py-4 text-left">{t("reports.total")}</th>
              <th className="px-6 py-4 text-left">{t("reports.actions")}</th>
            </tr>
          </thead>

          <tbody>
            {colisList.map((colis) => (
              <tr
                key={colis.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-5 font-medium text-gray-700">
                  {colis.id}
                </td>

                <td className="px-6 py-5 text-gray-600">{colis.client}</td>

                <td className="px-6 py-5 text-gray-600">
                  {colis.weight} {t("common.kg")}
                </td>

                <td className="px-6 py-5 text-gray-600">
                  {getTypeLabel(colis.type)}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      colis.status,
                    )}`}
                  >
                    {getStatusLabel(colis.status)}
                  </span>
                </td>

                <td className="px-6 py-5 font-semibold text-gray-800">
                  {colis.total} MAD
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {/* <button className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition">
                      <Eye
                        size={18}
                        className="text-blue-600"
                      />
                    </button> */}

                    <button className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition">
                      <Printer size={18} className="text-green-600" />
                    </button>

                    <button className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition">
                      <FileText size={18} className="text-indigo-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsTable;
