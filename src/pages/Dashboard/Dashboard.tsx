import { Package, Wallet, Clock, CheckSquare, Search, Filter } from 'lucide-react';

const recentColis = [
  { id: 'Colis80390001', client: 'Mara Rontret', weight: 1.5, type: 'À domicile', status: 'À domicile', total: 450 },
  { id: 'Colis80300622', client: 'Casablanca', weight: 15, type: 'À domicile', status: 'À domicile', total: 450 },
  { id: 'Colis80500403', client: 'Casablanca', weight: 10, type: 'À domicile', status: 'Nouveau', total: 300 },
  { id: 'Colis0360014', client: 'Rasa Ahbrad', weight: 12, type: 'Type de Livraison', status: 'À domicile', total: 480 },
  { id: 'Colis80500015', client: 'Monta kxhararrez', weight: 1, type: 'À domicile', status: 'À domicile', total: 350 },
  { id: 'Colis80370816', client: 'Casablanca', weight: 15, type: 'Daznicie', status: 'À domicile', total: 350 },
  { id: 'Colis40690017', client: 'Marrakech', weight: 15.5, type: 'Type de Livraison', status: 'À domicile', total: 450 },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
     
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="bg-brand-orange p-3 rounded-xl text-white shadow-md">
            <Package size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Colis</p>
            <p className="text-xl xl:text-2xl font-bold text-gray-800 whitespace-nowrap">247</p>
          </div>
        </div>

        {/* Revenu */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="bg-brand-blue p-3 rounded-xl text-white shadow-md">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Revenu</p>
            <p className="text-xl xl:text-2xl font-bold text-gray-800 whitespace-nowrap">12,450 MAD</p>
          </div>
        </div>

        {/* Livraisons en attente */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="bg-brand-orange p-3 rounded-xl text-white shadow-md">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Livraisons en attente</p>
            <p className="text-xl xl:text-2xl font-bold text-gray-800 whitespace-nowrap">23</p>
          </div>
        </div>

        {/* Livrés aujourd'hui */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="bg-brand-blue p-3 rounded-xl text-white shadow-md">
            <CheckSquare size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Livrés aujourd'hui</p>
            <p className="text-xl xl:text-2xl font-bold text-gray-800 whitespace-nowrap">15</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Table Header / Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800">Colis Récents</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher" 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white w-full transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <select className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer">
                <option>Filtre de livraison</option>
                <option>À domicile</option>
                <option>À l'agence</option>
              </select>
              <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Filter size={16} />
                <span className="hidden sm:inline">Filtres</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Suivi #</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Poids (kg)</th>
                <th className="px-6 py-4 font-medium">Type de Livraison</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Total (MAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentColis.map((colis, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{colis.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{colis.client}</td>
                  <td className="px-6 py-4 text-gray-600">{colis.weight}</td>
                  <td className="px-6 py-4 text-gray-600">{colis.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      colis.status === 'Nouveau' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-orange-50 text-brand-orange border-orange-200'
                    }`}>
                      {colis.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{colis.total} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
