import { useTranslation } from "react-i18next";

export default function SecuritySettings() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-sm font-semibold text-gray-850 mb-3">
          {t("settings.security.changeAdminPassword")}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="password"
            placeholder={t("settings.security.currentPassword")}
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all"
          />
          <input
            type="password"
            placeholder={t("settings.security.newPassword")}
            className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none transition-all"
          />
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-gray-900 hover:bg-gray-850 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {t("common.update")}
          </button>
        </div>
      </div>
    </div>
  );
}
