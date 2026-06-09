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
    // باقي البيانات كما هي...
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(colisList.length / pageSize);

  const paginatedColis = colisList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 transition-colors">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t("reports.title")}
          </h1>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
        <ReportsTable data={paginatedColis} />
      </div>

      {/* Pagination */}
      <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">

        <span className="text-sm text-gray-500 dark:text-slate-400">
          Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
          {Math.min(currentPage * pageSize, colisList.length)} sur{" "}
          {colisList.length} colis
        </span>

        <div className="flex gap-2">

          {/* Prev */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="
              px-3 py-2 rounded-lg border
              border-gray-200 dark:border-slate-700
              text-gray-700 dark:text-white
              hover:bg-gray-100 dark:hover:bg-slate-800
              disabled:opacity-50
              transition
            "
          >
            Précédent
          </button>

          {/* Pages */}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`
                w-10 h-10 rounded-lg transition
                ${
                  currentPage === i + 1
                    ? "bg-orange-500 text-white"
                    : "border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                }
              `}
            >
              {i + 1}
            </button>
          ))}

          {/* Next */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="
              px-3 py-2 rounded-lg border
              border-gray-200 dark:border-slate-700
              text-gray-700 dark:text-white
              hover:bg-gray-100 dark:hover:bg-slate-800
              disabled:opacity-50
              transition
            "
          >
            Suivant
          </button>

        </div>
      </div>
    </div>
  );
};

export default Reports;