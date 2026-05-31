import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Send,
  Download,
  Wallet,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  Edit3,
  Trash2,
  Eye,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import AddClientModal from '../../components/clients/AddClientModal';
import EditClientModal from '../../components/clients/EditClientModal';
import ClientDetailsModal from '../../components/clients/ClientDetailsModal';


// Define Client interface
export interface Client {
  id: string;
  fullName: string;
  phone: string;
  pays: string;
  region: string;
  ville: string;
  fullAddress: string;
  totalSent: number;
  totalReceived: number;
  totalAmount: number;
}

// Distribution helper to allocate a target sum across N elements with bounds
function distributeSum(count: number, targetSum: number, minVal: number, maxVal: number): number[] {
  const arr = Array(count).fill(minVal);
  let currentSum = count * minVal;

  if (currentSum > targetSum) {
    // If target sum is less than min possible, just return array filled with min
    return arr;
  }

  // Distribute the remaining sum randomly
  let attempts = 0;
  while (currentSum < targetSum && attempts < 100000) {
    const idx = Math.floor(Math.random() * count);
    if (arr[idx] < maxVal) {
      arr[idx]++;
      currentSum++;
    }
    attempts++;
  }

  return arr;
}

// Predefined first 8 clients from the image
const FIRST_8_CLIENTS: Client[] = [
  {
    id: 'CL001',
    fullName: 'Mara Rontret',
    phone: '+212 6 12 34 56 78',
    pays: 'Maroc',
    region: 'Casablanca-Settat',
    ville: 'Casablanca',
    fullAddress: 'Rue Mohamed V, Résidence Al Amal, Casablanca',
    totalSent: 15,
    totalReceived: 12,
    totalAmount: 450
  },
  {
    id: 'CL002',
    fullName: 'Youssef Benali',
    phone: '+212 6 23 45 67 89',
    pays: 'Maroc',
    region: 'Rabat-Salé-Kénitra',
    ville: 'Rabat',
    fullAddress: 'Avenue Hassan II, Appt 5, Agdal, Rabat',
    totalSent: 10,
    totalReceived: 8,
    totalAmount: 320
  },
  {
    id: 'CL003',
    fullName: 'Fatima Zahra El Amrani',
    phone: '+212 6 34 56 78 90',
    pays: 'Maroc',
    region: 'Fès-Meknès',
    ville: 'Fès',
    fullAddress: 'Quartier Atlas, Rue 12, Fès',
    totalSent: 18,
    totalReceived: 14,
    totalAmount: 520
  },
  {
    id: 'CL004',
    fullName: 'Hamza Alaoui',
    phone: '+212 6 45 67 89 01',
    pays: 'Maroc',
    region: 'Marrakech-Safi',
    ville: 'Marrakech',
    fullAddress: 'Avenue Mohammed VI, Marrakech',
    totalSent: 12,
    totalReceived: 10,
    totalAmount: 380
  },
  {
    id: 'CL005',
    fullName: 'Salma Idrissi',
    phone: '+212 6 56 78 90 12',
    pays: 'Maroc',
    region: 'Tanger-Tétouan-Al Hoceïma',
    ville: 'Tanger',
    fullAddress: 'Boulevard Pasteur, Tanger',
    totalSent: 20,
    totalReceived: 17,
    totalAmount: 610
  },
  {
    id: 'CL006',
    fullName: 'Omar Chraibi',
    phone: '+212 6 67 89 01 23',
    pays: 'Maroc',
    region: 'Souss-Massa',
    ville: 'Agadir',
    fullAddress: 'Hay Salam, Agadir',
    totalSent: 9,
    totalReceived: 7,
    totalAmount: 290
  },
  {
    id: 'CL007',
    fullName: 'Nadia Bennis',
    phone: '+212 6 78 90 12 34',
    pays: 'Maroc',
    region: 'L’Oriental',
    ville: 'Oujda',
    fullAddress: 'Rue Al Qods, Oujda',
    totalSent: 14,
    totalReceived: 11,
    totalAmount: 430
  },
  {
    id: 'CL008',
    fullName: 'Karim El Fassi',
    phone: '+212 6 89 01 23 45',
    pays: 'Maroc',
    region: 'Béni Mellal-Khénifra',
    ville: 'Béni Mellal',
    fullAddress: 'Avenue Hassan II, Béni Mellal',
    totalSent: 16,
    totalReceived: 13,
    totalAmount: 470
  }

];

const generateMockClients = (): Client[] => {
  const clients = [...FIRST_8_CLIENTS];

  const count = 239;
  // We want the total sum of ALL 247 clients to be:
  // - Total Clients: 247
  // - Total Sent: 1,245 (8 clients sum to 120, so 1125 remaining)
  // - Total Received: 1,102 (8 clients sum to 102, so 1000 remaining)
  // - Total Amount: 12,450 (8 clients sum to 4340, so 8110 remaining, which is 811 tens)
  const sents = distributeSum(count, 1125, 1, 10);
  const receiveds = distributeSum(count, 1000, 1, 8);
  const amountTens = distributeSum(count, 811, 1, 15);

  const moroccanNames = [
    { first: 'Youssef', last: 'Benali' },
    { first: 'Fatima', last: 'Zahra' },
    { first: 'Hamza', last: 'Alaoui' },
    { first: 'Salma', last: 'Idrissi' },
    { first: 'Omar', last: 'Chraibi' },
    { first: 'Nadia', last: 'Bennis' },
    { first: 'Karim', last: 'El Fassi' }
  ];

  const locations = [
    { pays: 'Maroc', ville: 'Casablanca', region: 'Casablanca-Settat', address: 'Boulevard Anfa, Immeuble B, Casablanca' },
    { pays: 'Maroc', ville: 'Oujda', region: 'L\'Oriental', address: 'Boulevard Mohammed V, Oujda' },
    { pays: 'Maroc', ville: 'Kénitra', region: 'Rabat-Salé-Kénitra', address: 'Avenue Mohammed Diouri, Kénitra' }
  ];

  for (let i = 0; i < count; i++) {
    const idNum = i + 9;
    const id = `CL${idNum.toString().padStart(3, '0')}`;

    // Mix and match first/last names for high variety
    const nameObj = moroccanNames[i % moroccanNames.length];
    const firstName = nameObj.first;
    const lastName = moroccanNames[(i + 7) % moroccanNames.length].last;
    const fullName = `${firstName} ${lastName}`;

    const loc = locations[i % locations.length];

    // Generate simulated Moroccan or French phone number
    let phone = '';
    if (loc.pays === 'Maroc') {
      const randDigits = Math.floor(10000000 + Math.random() * 90000000);
      phone = `+212 6 ${randDigits.toString().replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`;
    } else {
      const randDigits = Math.floor(10000000 + Math.random() * 90000000);
      phone = `+33 7 ${randDigits.toString().replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`;
    }

    clients.push({
      id,
      fullName,
      phone,
      pays: loc.pays,
      region: loc.region,
      ville: loc.ville,
      fullAddress: loc.address,
      totalSent: sents[i],
      totalReceived: receiveds[i],
      totalAmount: amountTens[i] * 10
    });
  }

  return clients;
};

export default function ClientsPage() {
  // Store all clients in state
  const [clients, setClients] = useState<Client[]>(() => generateMockClients());

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPays, setFilterPays] = useState('Tous');
  const [filterRegion, setFilterRegion] = useState('Toutes');
  const [filterVille, setFilterVille] = useState('Toutes');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default 5 to match the image exactly

  // Active actions dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Currently selected client for editing/viewing
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);



  // Notification banner/toast state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Click outside listener for the dropdown menu
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Compute unique values for filter dropdowns based on current data
  const uniquePays = useMemo(() => {
    return ['Tous', ...Array.from(new Set(clients.map(c => c.pays)))];
  }, [clients]);

  const uniqueRegions = useMemo(() => {
    // If a country is selected, filter regions for that country only
    const filtered = filterPays !== 'Tous'
      ? clients.filter(c => c.pays === filterPays)
      : clients;
    return ['Toutes', ...Array.from(new Set(filtered.map(c => c.region)))];
  }, [clients, filterPays]);

  const uniqueVilles = useMemo(() => {
    // Filter cities based on selected country and region
    let filtered = clients;
    if (filterPays !== 'Tous') {
      filtered = filtered.filter(c => c.pays === filterPays);
    }
    if (filterRegion !== 'Toutes') {
      filtered = filtered.filter(c => c.region === filterRegion);
    }
    return ['Toutes', ...Array.from(new Set(filtered.map(c => c.ville)))];
  }, [clients, filterPays, filterRegion]);

  // Reset region and city filters if country changes to maintain filter consistency
  useEffect(() => {
    setFilterRegion('Toutes');
    setFilterVille('Toutes');
    setCurrentPage(1);
  }, [filterPays]);

  useEffect(() => {
    setFilterVille('Toutes');
    setCurrentPage(1);
  }, [filterRegion]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterVille, searchQuery]);

  // Filter clients list
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch =
        client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        client.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.ville.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPays = filterPays === 'Tous' || client.pays === filterPays;
      const matchesRegion = filterRegion === 'Toutes' || client.region === filterRegion;
      const matchesVille = filterVille === 'Toutes' || client.ville === filterVille;

      return matchesSearch && matchesPays && matchesRegion && matchesVille;
    });
  }, [clients, searchQuery, filterPays, filterRegion, filterVille]);

  // Paginated clients
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredClients.slice(startIndex, startIndex + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));

  // If page index is out of bounds (after filter changes), adjust it
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Calculate dynamic stats based on ALL current clients in memory
  const stats = useMemo(() => {
    return {
      totalClients: clients.length,
      totalSent: clients.reduce((acc, c) => acc + c.totalSent, 0),
      totalReceived: clients.reduce((acc, c) => acc + c.totalReceived, 0),
      totalAmount: clients.reduce((acc, c) => acc + c.totalAmount, 0)
    };
  }, [clients]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Handle add client submission
  const handleAddClientSubmit = (newClientData: Omit<Client, 'id'>) => {
    // Generate new ID
    const maxIdNum = clients.reduce((max, client) => {
      const num = parseInt(client.id.replace('CL', ''));
      return num > max ? num : max;
    }, 0);
    const newId = `CL${(maxIdNum + 1).toString().padStart(3, '0')}`;

    const newClient: Client = {
      id: newId,
      ...newClientData
    };

    setClients([newClient, ...clients]); // Prepend new client to list
    setIsAddModalOpen(false);
    setToastMessage({ text: `Le client ${newClientData.fullName} (${newId}) a été ajouté avec succès.`, type: 'success' });
  };

  // Handle open edit modal
  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  // Handle edit client submission
  const handleEditClientSubmit = (updatedClient: Client) => {
    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updatedClients);
    setIsEditModalOpen(false);
    setSelectedClient(null);
    setToastMessage({ text: `Les informations du client ${updatedClient.fullName} ont été mises à jour.`, type: 'success' });
  };

  // Handle delete client
  const handleDeleteClient = (client: Client) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client ${client.fullName} (${client.id}) ?`)) {
      setClients(clients.filter(c => c.id !== client.id));
      setToastMessage({ text: `Le client ${client.fullName} a été supprimé.`, type: 'success' });
    }
  };

  // Handle open details modal
  const handleOpenDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterPays('Tous');
    setFilterRegion('Toutes');
    setFilterVille('Toutes');
    setCurrentPage(1);
    setToastMessage({ text: "Filtres réinitialisés.", type: 'success' });
  };

  // Generate pagination number array
  const paginationRange = useMemo(() => {

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPages = [1];
    const endPages = [totalPages];

    const showLeftDots = currentPage > 3;
    const showRightDots = currentPage < totalPages - 2;

    if (!showLeftDots && showRightDots) {
      const middlePages = [2, 3, 4];
      return [...startPages, ...middlePages, 'ellipsis', ...endPages];
    } else if (showLeftDots && !showRightDots) {
      const middlePages = [totalPages - 3, totalPages - 2, totalPages - 1];
      return [...startPages, 'ellipsis', ...middlePages, ...endPages];
    } else {
      const middlePages = [currentPage - 1, currentPage, currentPage + 1];
      return [...startPages, 'ellipsis', ...middlePages, 'ellipsis', ...endPages];
    }
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 transform scale-100 ${toastMessage.type === 'success'
            ? 'bg-emerald-600 text-white shadow-emerald-600/20'
            : 'bg-rose-600 text-white shadow-rose-600/20'
          }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez et consultez la liste de vos clients.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-md shadow-brand-orange/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Ajouter un client</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Total Clients */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-brand-orange shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Clients</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalClients.toLocaleString()}</p>
          </div>
        </div>

        {/* Card 2: Total Envoyés */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Send className="w-5.5 h-5.5 -rotate-12 translate-y-0.5 -translate-x-0.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Envoyés</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalSent.toLocaleString()}</p>
          </div>
        </div>

        {/* Card 3: Total Reçus */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDF1EA] flex items-center justify-center text-brand-orange shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reçus</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalReceived.toLocaleString()}</p>
          </div>
        </div>

        {/* Card 4: Montant Total */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 shrink-0">
            <Wallet className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Montant Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalAmount.toLocaleString()} MAD</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

          {/* Search bar */}
          <div className="col-span-1 md:col-span-4 space-y-1.5">
            <span className="text-xs text-gray-400 font-medium block">Recherche</span>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none transition-all placeholder:text-gray-400 text-gray-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 text-gray-400 hover:text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Pays filter */}
          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-1.5">
            <label htmlFor="filterPays" className="text-xs text-gray-400 font-medium block">Pays</label>
            <select
              id="filterPays"
              value={filterPays}
              onChange={(e) => setFilterPays(e.target.value)}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              {uniquePays.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Région filter */}
          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-1.5">
            <label htmlFor="filterRegion" className="text-xs text-gray-400 font-medium block">Région</label>
            <select
              id="filterRegion"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              {uniqueRegions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Ville filter */}
          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-1.5">
            <label htmlFor="filterVille" className="text-xs text-gray-400 font-medium block">Ville</label>
            <select
              id="filterVille"
              value={filterVille}
              onChange={(e) => setFilterVille(e.target.value)}
              className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              {uniqueVilles.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters button */}
          <div className="col-span-1 sm:col-span-3 md:col-span-2">
            <button
              onClick={handleResetFilters}
              disabled={searchQuery === '' && filterPays === 'Tous' && filterRegion === 'Toutes' && filterVille === 'Toutes'}
              className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 disabled:text-gray-350 disabled:bg-gray-50/30 disabled:border-gray-100 font-medium text-sm px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>

        </div>

        {/* Active Filters list */}
        {(searchQuery || filterPays !== 'Tous' || filterRegion !== 'Toutes' || filterVille !== 'Toutes') && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-400 font-medium">Filtres actifs:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                Recherche: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterPays !== 'Tous' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                Pays: {filterPays}
                <button onClick={() => setFilterPays('Tous')} className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterRegion !== 'Toutes' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                Région: {filterRegion}
                <button onClick={() => setFilterRegion('Toutes')} className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterVille !== 'Toutes' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange text-xs font-semibold">
                Ville: {filterVille}
                <button onClick={() => setFilterVille('Toutes')} className="hover:bg-orange-100 p-0.5 rounded-md cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-brand-orange underline font-semibold ml-auto cursor-pointer"
            >
              Effacer tout
            </button>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100">
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-[100px]">ClientID</th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">FullName</th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Pays </th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider max-w-[280px]">FullAddress</th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-[110px]">TotalSent</th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-[130px]">TotalReceived</th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-[140px]">TotalAmount</th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-[140px]">Actions</th>
                <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-[60px] text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 font-mono">
                      {client.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {client.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono whitespace-nowrap">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="capitalize">{client.pays}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[280px] truncate" title={client.fullAddress}>
                      {client.fullAddress}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {client.totalSent}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {client.totalReceived}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                      {client.totalAmount.toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center ">

                        <button
                          onClick={() => handleOpenDetails(client)}
                          className="p-2 rounded-lg  text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Voir Détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="p-2 rounded-lg  text-amber-600 hover:bg-amber-100 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteClient(client)}
                          className="p-2 rounded-lg  text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm">
                    <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    Aucun client trouvé pour vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {filteredClients.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4.5 bg-white border-t border-gray-100">
            {/* Range indicator */}
            <div className="text-xs text-gray-500 font-medium order-2 sm:order-1">
              Affichage de {Math.min(filteredClients.length, (currentPage - 1) * pageSize + 1)} à {Math.min(filteredClients.length, currentPage * pageSize)} sur {filteredClients.length} clients
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-1.5 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {paginationRange.map((page, index) => {
                if (page === 'ellipsis') {
                  return (
                    <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs select-none">
                      ...
                    </span>
                  );
                }
                const isActive = currentPage === page;
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page as number)}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-semibold rounded-lg border transition-all cursor-pointer ${isActive
                        ? 'border-brand-orange text-brand-orange bg-orange-50/10'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 order-3 ml-auto sm:ml-0">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange cursor-pointer"
              >
                <option value={5}>5 / page</option>
                <option value={8}>8 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddClientSubmit}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditModalOpen}
        client={selectedClient}
        onClose={() => { setIsEditModalOpen(false); setSelectedClient(null); }}
        onSave={handleEditClientSubmit}
      />

      {/* Details View Modal */}
      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        client={selectedClient}
        onClose={() => { setIsDetailsModalOpen(false); setSelectedClient(null); }}
      />

    </div>
  );
}
