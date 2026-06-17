// path = src/components/facture/generateFacture.tsff
import { invoke } from "@tauri-apps/api/core";
import { factureTemplate } from "./FactureTemplate";

export async function generateFacture(colis: any) {
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const settings = await invoke("get_settings");

  doc.open();
  doc.write(factureTemplate(colis, settings as any));
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 300);
}