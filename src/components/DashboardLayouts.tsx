import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayouts({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);

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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans relative">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile}
        activeItem={activeItem}
        onItemClick={(item) => {
          setActiveItem(item);
          if (isMobile) setIsSidebarOpen(false);
        }}
      />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children || (
            <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}</h2>
              <p className="text-gray-500">This is the placeholder content for the {activeItem} page.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
