import { Menu, Calendar } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-15 bg-brand-orange text-white flex items-center justify-between px-4 md:px-6 shadow-md z-10 sticky top-0 shrink-0">
      <div className="flex items-center gap-2 md:gap-4 text-base md:text-lg font-semibold">
        <button 
          className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1.5 rounded hover:bg-white/20 transition-colors" 
          onClick={onToggleSidebar}
        >
          <Menu size={24} />
        </button>
        <span className="hidden sm:inline">Moroccan shipping store</span>
        <span className="sm:hidden">Moroccan Store</span>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 md:gap-3 text-sm">
          <span className="hidden md:inline opacity-90">Language :</span>
          <span className="fi fi-sa text-xl md:text-2xl rounded-sm overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-sm" title="Arabic"></span>
          <span className="fi fi-fr text-xl md:text-2xl rounded-sm overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-sm" title="French"></span>
          <span className="fi fi-gb text-xl md:text-2xl rounded-sm overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-sm" title="English"></span>
        </div>
        
        <div className="hidden sm:flex text-sm font-medium opacity-95 items-center gap-2">
          <span>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <Calendar size={18} />
        </div>
      </div>
    </header>
  );
}
