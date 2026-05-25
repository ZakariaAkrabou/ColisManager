import { Package, Truck, CheckCircle } from 'lucide-react';

const ReportStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Livrés</p>
            <h2 className="text-3xl font-bold mt-1 text-green-600">12</h2>
          </div>

          <div className="bg-green-100 p-3 rounded-xl">
            <CheckCircle className="text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">En cours</p>
            <h2 className="text-3xl font-bold mt-1 text-orange-500">5</h2>
          </div>

          <div className="bg-orange-100 p-3 rounded-xl">
            <Truck className="text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Revenu Total</p>
            <h2 className="text-3xl font-bold mt-1 text-blue-600">
              12,500 MAD
            </h2>
          </div>

          <div className="bg-blue-100 p-3 rounded-xl">
            <Package className="text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStats;