import { Package, Truck, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const ReportStats = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              {t("reports.delivered")}
            </p>

            <h2 className="text-3xl font-bold mt-1 text-green-600">
              12
            </h2>
          </div>

          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
            <CheckCircle className="text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              {t("reports.inProgress")}
            </p>

            <h2 className="text-3xl font-bold mt-1 text-orange-500">
              5
            </h2>
          </div>

          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
            <Truck className="text-orange-500 dark:text-orange-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              {t("reports.totalRevenue")}
            </p>

            <h2 className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400">
              12,500 MAD
            </h2>
          </div>

          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
            <Package className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStats;