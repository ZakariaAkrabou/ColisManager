import React, { useState } from "react";
import { User, Truck, Globe, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProfileSettings from "./ProfileSettings";
import ShippingSettings from "./ShippingSettings";
import AppSettings from "./AppSettings";
import SecuritySettings from "./SecuritySettings";

interface SettingTab {
  id: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: SettingTab[] = [
  { id: "profile", labelKey: "settings.tabs.profile", icon: User },
  { id: "shipping", labelKey: "settings.tabs.shipping", icon: Truck },
  { id: "app", labelKey: "settings.tabs.app", icon: Globe },
  { id: "security", labelKey: "settings.tabs.security", icon: Shield },
];

export default function SettingsComponent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-137.5 animate-fade-in">
     
      <div className="w-full md:w-64 border-r border-gray-100 bg-gray-50/50 p-4 shrink-0">
        <div className="px-3 py-2 mb-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            {t("settings.menu")}
          </span>
        </div>
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FDF1EA] text-brand-orange shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-brand-orange" : "text-gray-400"}`}
                />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Form Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 font-sans">
            {t(
              tabs.find((tab) => tab.id === activeTab)?.labelKey ??
                "settings.tabs.profile",
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("settings.configureHint")}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "shipping" && <ShippingSettings />}
          {activeTab === "app" && <AppSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}
