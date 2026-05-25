import React from 'react';
import { Eye, Printer, FileText } from 'lucide-react';

interface Colis {
  id: string;
  client: string;
  weight: number;
  type: string;
  status: string;
  total: number;
}

interface Props {
  colisList: Colis[];
}

const ReportsTable: React.FC<Props> = ({ colisList }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livré':
        return 'bg-green-100 text-green-700';

      case 'En cours':
        return 'bg-orange-100 text-orange-700';

      case 'Nouveau':
        return 'bg-blue-100 text-blue-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-700">
          Liste des Colis
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-sm">
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Client</th>
              <th className="px-6 py-4 text-left">Poids</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Statut</th>
              <th className="px-6 py-4 text-left">Total</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {colisList.map((colis) => (
              <tr
                key={colis.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-5 font-medium text-gray-700">
                  {colis.id}
                </td>

                <td className="px-6 py-5 text-gray-600">
                  {colis.client}
                </td>

                <td className="px-6 py-5 text-gray-600">
                  {colis.weight} kg
                </td>

                <td className="px-6 py-5 text-gray-600">
                  {colis.type}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      colis.status
                    )}`}
                  >
                    {colis.status}
                  </span>
                </td>

                <td className="px-6 py-5 font-semibold text-gray-800">
                  {colis.total} MAD
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {/* <button className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition">
                      <Eye
                        size={18}
                        className="text-blue-600"
                      />
                    </button> */}

                    <button className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition">
                      <Printer
                        size={18}
                        className="text-green-600"
                      />
                    </button>

                    <button className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition">
                      <FileText
                        size={18}
                        className="text-indigo-600"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsTable;