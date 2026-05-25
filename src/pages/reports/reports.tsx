import React from 'react';
import ReportStats from '../../components/reports/ReportStats';
import ReportsTable from '../../components/reports/ReportsTable';

interface Colis {
  id: string;
  client: string;
  weight: number;
  type: string;
  status: string;
  total: number;
}

const Reports: React.FC = () => {
  const colisList: Colis[] = [
    {
      id: 'Colis80390001',
      client: 'Mara Rontret',
      weight: 1.5,
      type: 'À domicile',
      status: 'Livré',
      total: 450,
    },
    {
      id: 'Colis80300622',
      client: 'Casablanca',
      weight: 15,
      type: 'Express',
      status: 'En cours',
      total: 620,
    },
    {
      id: 'Colis80500403',
      client: 'Rabat',
      weight: 10,
      type: 'Standard',
      status: 'Nouveau',
      total: 300,
    },
    {
      id: 'Colis0360014',
      client: 'Rasa Ahbrad',
      weight: 12,
      type: 'À domicile',
      status: 'Livré',
      total: 480,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Rapport des Colis
          </h1>

        </div>
      </div>

      {/* <ReportStats /> */}

      <ReportsTable colisList={colisList} />
    </div>
  );
};

export default Reports;