import React, { useState } from "react";
import ReportsTable from "../../components/reports/ReportsTable";
import { useTranslation } from "react-i18next";

interface Colis {
  id: string;
  client: string;
  weight: number;
  type: string;
  status: string;
  total: number;
}

const Reports: React.FC = () => {
  const { t } = useTranslation();

  const colisList: Colis[] = [
    {
      id: "Colis80390001",
      client: "Mara Rontret",
      weight: 1.5,
      type: "À domicile",
      status: "Livré",
      total: 450,
    },
    {
      id: "Colis80300622",
      client: "Casablanca",
      weight: 15,
      type: "Express",
      status: "En cours",
      total: 620,
    },
    {
      id: "Colis80500403",
      client: "Rabat",
      weight: 10,
      type: "Standard",
      status: "Nouveau",
      total: 300,
    },
    {
      id: "Colis0360014",
      client: "Rasa Ahbrad",
      weight: 12,
      type: "À domicile",
      status: "Livré",
      total: 480,
    },
    {
      id: 'Colis81045015',
      client: 'Youssef Benali',
      weight: 8,
      type: 'Express',
      status: 'Livré',
      total: 550,
    },
    {
      id: 'Colis81045016',
      client: 'Fatima Zahra',
      weight: 6.5,
      type: 'Standard',
      status: 'En cours',
      total: 280,
    },
    {
      id: 'Colis81045017',
      client: 'Hamza Alaoui',
      weight: 18,
      type: 'À domicile',
      status: 'Livré',
      total: 720,
    },
    {
      id: 'Colis81045018',
      client: 'Salma Idrissi',
      weight: 4,
      type: 'Express',
      status: 'Nouveau',
      total: 350,
    },
    {
      id: 'Colis81045019',
      client: 'Omar Chraibi',
      weight: 22,
      type: 'Standard',
      status: 'En cours',
      total: 840,
    },
    {
      id: 'Colis81045020',
      client: 'Nadia Bennis',
      weight: 9,
      type: 'À domicile',
      status: 'Livré',
      total: 390,
    },
    {
      id: 'Colis81045021',
      client: 'Karim El Fassi',
      weight: 14,
      type: 'Express',
      status: 'Livré',
      total: 610,
    },
    {
      id: 'Colis81045022',
      client: 'Amina Tazi',
      weight: 7,
      type: 'Standard',
      status: 'Nouveau',
      total: 260,
    },
    {
      id: 'Colis81045023',
      client: 'Mehdi El Mansouri',
      weight: 13,
      type: 'À domicile',
      status: 'En cours',
      total: 530,
    },
    {
      id: 'Colis81045024',
      client: 'Sara El Amrani',
      weight: 3.5,
      type: 'Express',
      status: 'Livré',
      total: 290,
    },
    {
      id: 'Colis81045025',
      client: 'Rachid Bouziane',
      weight: 16,
      type: 'Standard',
      status: 'En cours',
      total: 670,
    },
    {
      id: 'Colis81045026',
      client: 'Hind Bennani',
      weight: 5,
      type: 'À domicile',
      status: 'Livré',
      total: 320,
    },
    {
      id: 'Colis81045027',
      client: 'Adil Lahlou',
      weight: 11,
      type: 'Express',
      status: 'Nouveau',
      total: 410,
    },
    {
      id: 'Colis81045028',
      client: 'Khadija Fassi',
      weight: 20,
      type: 'Standard',
      status: 'Livré',
      total: 910,
    },
    {
      id: 'Colis81045029',
      client: 'Zakaria Naciri',
      weight: 17,
      type: 'À domicile',
      status: 'En cours',
      total: 760,
    },
    {
      id: 'Colis81045030',
      client: 'Imane Berrada',
      weight: 2.5,
      type: 'Express',
      status: 'Livré',
      total: 220,
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(colisList.length / pageSize);

  const paginatedColis = colisList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t("reports.title")}
          </h1>
        </div>
      </div>

      <ReportsTable colisList={paginatedColis} />

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Affichage de {(currentPage - 1) * pageSize + 1} à{' '}
          {Math.min(currentPage * pageSize, colisList.length)} sur{' '}
          {colisList.length} colis
        </span>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev: number) => prev - 1)}
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
          >
            Précédent
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-lg ${
                currentPage === i + 1
                  ? 'bg-orange-500 text-white'
                  : 'border border-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev: number) => prev + 1)}
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
