interface FactureTemplateProps {
  colis: {
    trackingNo: string;
    sender: string;
    receiver: string;
    city: string;
    type: string;
    weight: number;
    totalPrice: number;
    date: string;
    status: string;
  };
}

export default function FactureTemplate({
  colis,
}: FactureTemplateProps) {
  return (
    <div
      id="facture-content"
      className="bg-white text-black p-10 w-[800px]"
    >
      {/* Header */}
      <div className="flex justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">FACTURE</h1>
          <p>N° {colis.trackingNo}</p>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-bold">
            ASFAR TARIQ
          </h2>
          <p>Transport & Livraison</p>
          <p>{colis.date}</p>
        </div>
      </div>

      {/* Client */}
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-2">
          Informations Client
        </h3>

        <p>
          <strong>Expéditeur :</strong>{" "}
          {colis.sender}
        </p>

        <p>
          <strong>Destinataire :</strong>{" "}
          {colis.receiver}
        </p>

        <p>
          <strong>Ville :</strong>{" "}
          {colis.city}
        </p>
      </div>

      {/* Table */}
      <table className="w-full mt-8 border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3">Suivi</th>
            <th className="border p-3">Type</th>
            <th className="border p-3">Poids</th>
            <th className="border p-3">Montant</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border p-3">
              {colis.trackingNo}
            </td>

            <td className="border p-3">
              {colis.type}
            </td>

            <td className="border p-3">
              {colis.weight} KG
            </td>

            <td className="border p-3">
              {colis.totalPrice} DH
            </td>
          </tr>
        </tbody>
      </table>

      {/* Total */}
      <div className="mt-8 text-right">
        <h2 className="text-2xl font-bold">
          Total : {colis.totalPrice} DH
        </h2>
      </div>
    </div>
  );
}