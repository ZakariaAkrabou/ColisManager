import { Home, Package, Users, MapPin, FileText, Settings } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'colis', label: 'Colis', icon: Package },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'reports', label: 'Reports', icon: FileText },
];

interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export default function Sidebar({ isOpen, isMobile, activeItem = 'dashboard', onItemClick }: SidebarProps) {
  return (
    <aside 
      className={`bg-white border-gray-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 h-full ${
        isMobile ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'relative border-r'
      }`}
      style={{ width: isOpen ? '250px' : '0', overflow: 'hidden', borderRightWidth: isOpen ? '1px' : '0' }}
    >
      <div className="h-15 flex items-center px-5 text-xl font-bold text-brand-blue border-b border-gray-200 shrink-0" style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
        <span className="flex items-center gap-2 whitespace-nowrap">
          ColisManager
        </span>
      </div>
      <div className="flex-1 py-5 overflow-y-auto" style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', minWidth: '250px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={`flex items-center px-5 py-3 mx-3 my-1 rounded-lg text-left w-[calc(100%-24px)] transition-all duration-200 font-medium cursor-pointer ${
                isActive 
                  ? 'bg-[#FDF1EA] text-brand-orange' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-brand-blue'
              }`}
              onClick={() => onItemClick?.(item.id)}
            >
              <Icon className="mr-3 w-5 h-5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="p-5 border-t border-gray-200 shrink-0" style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', minWidth: '250px' }}>
        <button 
          className={`flex items-center px-5 py-3 mx-0 rounded-lg text-left w-full transition-all duration-200 font-medium cursor-pointer ${
            activeItem === 'settings'
              ? 'bg-[#FDF1EA] text-brand-orange' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-brand-blue'
          }`}
          onClick={() => onItemClick?.('settings')}
        >
          <Settings className="mr-3 w-5 h-5 shrink-0" />
          Settings
        </button>
      </div>
    </aside>
  );
}
