import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ClientsPage from "../pages/Clients/Clients";
import SettingsPage from "../pages/Settings/Settings";
import ReportsPage from "../pages/reports/reports";
import Dashboard from "../pages/Dashboard/Dashboard";
import Location from "../pages/Locations/location";
import Colis from "../pages/Colis/colis";
import AddColisPage from "./colis/addColis";
import { useTranslation } from "react-i18next";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayouts({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("clients");
  const [isMobile, setIsMobile] = useState(false);

  const [pendingColis, setPendingColis] = useState<any | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigateTo = useCallback((page: string) => {
    setActiveItem(page);
  }, []);

  const handleAddColisSave = useCallback((newColis: any) => {
    setPendingColis(newColis);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans relative">
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        activeItem={activeItem === "add-colis" ? "colis" : activeItem}
        onItemClick={(item) => {
          setActiveItem(item);
          if (isMobile) setIsSidebarOpen(false);
        }}
      />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50/50">
          {children ||
            (activeItem === "clients" ? (
              <ClientsPage />
            ) : activeItem === "settings" ? (
              <SettingsPage />
            ) : activeItem === "dashboard" ? (
              <Dashboard />
            ) : activeItem === "reports" ? (
              <ReportsPage />
            ) : activeItem === "locations" ? (
              <Location />
            ) : activeItem === "colis" ? (
              <Colis
                onNavigateToAdd={() => navigateTo("add-colis")}
                pendingColis={pendingColis}
                onPendingConsumed={() => setPendingColis(null)}
              />
            ) : activeItem === "add-colis" ? (
              <AddColisPage
                onBack={() => navigateTo("colis")}
                onSave={handleAddColisSave}
              />
            ) : (
              <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {t("layout.placeholderTitle", {
                    name:
                      activeItem.charAt(0).toUpperCase() + activeItem.slice(1),
                  })}
                </h2>
                <p className="text-gray-500">
                  {t("layout.placeholderText", { name: activeItem })}
                </p>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
