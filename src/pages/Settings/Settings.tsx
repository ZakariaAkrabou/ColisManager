import SettingsComponent from "../../components/settings/SettingsComponent";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-brand-orange">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {t("settings.title")}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">{t("settings.subtitle")}</p>
        </div>
      </div>

      {/* Main Settings Content */}
      <SettingsComponent />
    </div>
  );
}
