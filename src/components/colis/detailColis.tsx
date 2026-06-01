import Swal from "sweetalert2";
import type { ColisItem } from "../../types/colis";
import i18n from "../../i18n";

export async function showDetailColisModal(colis: ColisItem): Promise<void> {
  await Swal.fire({
    title: i18n.t("colis.detailsTitle"),
    html: `
			<div class="text-left font-sans space-y-4 p-2">
				<div class="flex items-center gap-3 border-b border-gray-100 pb-3 mb-2">
					<div class="bg-[#FDF1EA] p-2 rounded-lg text-brand-orange">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="M11 21.88a2 2 0 0 0 2 0l8-4.5a2 2 0 0 0 1-1.73V7.87a2 2 0 0 0-1-1.73l-8-4.5a2 2 0 0 0-2 0l-8 4.5A2 2 0 0 0 3 7.87v7.78a2 2 0 0 0 1 1.73Z"/><path d="M12 2v20"/><path d="m3.5 7 8.5 4.75L20.5 7"/><path d="m17.5 10-5.5 3-5.5-3"/></svg>
					</div>
					<div>
						<span class="text-gray-400 text-xs block">Numéro de Suivi (N°Track)</span>
						<span class="font-bold text-lg text-gray-800 font-mono">${colis.trackingNo}</span>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
					<div>
						<span class="text-gray-400 text-xs block">Expéditeur</span>
						<span class="font-semibold text-gray-700">${colis.sender}</span>
					</div>
					<div>
						<span class="text-gray-400 text-xs block">Destinataire</span>
						<span class="font-semibold text-gray-700">${colis.receiver}</span>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
					<div>
						<span class="text-gray-400 text-xs block">Ville</span>
						<span class="font-semibold text-gray-700">${colis.city}</span>
					</div>
					<div>
						<span class="text-gray-400 text-xs block">Type de Colis</span>
						<span class="font-semibold text-gray-700">${colis.type}</span>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
					<div>
						<span class="text-gray-400 text-xs block">Poids</span>
						<span class="font-semibold text-gray-700">${colis.weight} kg</span>
					</div>
					<div>
						<span class="text-gray-400 text-xs block">Prix Total</span>
						<span class="font-bold text-brand-blue text-lg">${colis.totalPrice.toFixed(2)} DH</span>
					</div>
				</div>
				<div class="flex items-center justify-between pt-2">
					<div>
						<span class="text-gray-400 text-xs block mb-1">Date d'Expédition</span>
						<span class="text-gray-700 text-sm font-medium">${colis.date}</span>
					</div>
					<div>
						<span class="text-gray-400 text-xs block mb-1 text-right">Statut actuel</span>
						<span class="px-3 py-1 rounded-full text-xs font-semibold ${
              colis.status === "Livré"
                ? "bg-green-100 text-green-800"
                : colis.status === "En transit"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
            }">${colis.status}</span>
					</div>
				</div>
			</div>
		`,
    showCloseButton: true,
    confirmButtonText: i18n.t("common.close"),
    confirmButtonColor: "#2B4C8C",
    customClass: {
      popup: "rounded-xl",
      confirmButton: "rounded-lg px-6 py-2",
    },
  });
}
