import Swal from "sweetalert2";
import type { ColisItem } from "../../types/colis";

export type EditableColisFields = Pick<
  ColisItem,
  "sender" | "receiver" | "city" | "type"
>;

export async function showEditColisModal(
  colis: ColisItem,
): Promise<EditableColisFields | null> {
  const result = await Swal.fire({
    title: "Modifier le Colis",
    html: `
			<div class="text-left font-sans space-y-4 p-2">
				<p class="text-gray-500 text-sm">Vous modifiez les informations pour le colis <strong class="font-mono">${colis.trackingNo}</strong>.</p>
				<div class="space-y-3">
					<div>
						<label class="block text-xs font-semibold text-gray-400 mb-1">Expéditeur</label>
						<input type="text" id="edit-sender" class="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange" value="${colis.sender}">
					</div>
					<div>
						<label class="block text-xs font-semibold text-gray-400 mb-1">Destinataire</label>
						<input type="text" id="edit-receiver" class="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange" value="${colis.receiver}">
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="block text-xs font-semibold text-gray-400 mb-1">Ville</label>
							<input type="text" id="edit-city" class="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange" value="${colis.city}">
						</div>
						<div>
							<label class="block text-xs font-semibold text-gray-400 mb-1">Type</label>
							<select id="edit-type" class="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange">
								<option value="Standard" ${colis.type === "Standard" ? "selected" : ""}>Standard</option>
								<option value="Express" ${colis.type === "Express" ? "selected" : ""}>Express</option>
								<option value="Fragile" ${colis.type === "Fragile" ? "selected" : ""}>Fragile</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		`,
    showCancelButton: true,
    confirmButtonText: "Sauvegarder",
    cancelButtonText: "Annuler",
    confirmButtonColor: "#E26D28",
    cancelButtonColor: "#6B7280",
    preConfirm: () => {
      const sender = (
        document.getElementById("edit-sender") as HTMLInputElement
      ).value.trim();
      const receiver = (
        document.getElementById("edit-receiver") as HTMLInputElement
      ).value.trim();
      const city = (
        document.getElementById("edit-city") as HTMLInputElement
      ).value.trim();
      const type = (document.getElementById("edit-type") as HTMLSelectElement)
        .value as ColisItem["type"];

      if (!sender || !receiver || !city) {
        Swal.showValidationMessage(
          "Veuillez remplir tous les champs obligatoires",
        );
        return false;
      }

      const payload: EditableColisFields = { sender, receiver, city, type };
      return payload;
    },
  });

  if (!result.isConfirmed || !result.value) {
    return null;
  }

  await Swal.fire({
    title: "Mis à jour !",
    text: "Le colis a été mis à jour avec succès.",
    icon: "success",
    timer: 1400,
    showConfirmButton: false,
  });

  return result.value;
}
