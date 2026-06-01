import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Package,
  User,
  MapPin,
  Scale,
  Truck,
  Home,
  Calculator,
  FileText,
  Save,
  Printer,
  ChevronDown,
  Image,
  Star,
  RefreshCw,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const mockClients = [
  {
    id: "C001",
    name: "Ahmed Mohamed",
    phone: "0612345678",
    address: "Rue Mohammed V, Casablanca",
  },
  {
    id: "C002",
    name: "Fatima Ali",
    phone: "0623456789",
    address: "Quartier Hassan, Rabat",
  },
  {
    id: "C003",
    name: "Youssef Benali",
    phone: "0661234567",
    address: "Bd Zerktouni, Casablanca",
  },
  {
    id: "C004",
    name: "Khadija Mansouri",
    phone: "0698765432",
    address: "Av. Mohammed VI, Marrakech",
  },
  {
    id: "C005",
    name: "Omar Tazi",
    phone: "0677889900",
    address: "Quartier Industriel, Fès",
  },
  {
    id: "C006",
    name: "Salma El Amrani",
    phone: "0655443322",
    address: "Rue Hassan II, Tanger",
  },
];

const moroccanCities: Record<string, string[]> = {
  "Casablanca-Settat": [
    "Casablanca",
    "Settat",
    "Mohammedia",
    "El Jadida",
    "Berrechid",
  ],
  "Rabat-Salé-Kénitra": ["Rabat", "Salé", "Kénitra", "Témara", "Skhirat"],
  "Marrakech-Safi": ["Marrakech", "Safi", "Essaouira", "El Kelâa des Sraghna"],
  "Tanger-Tétouan-Al Hoceïma": [
    "Tanger",
    "Tétouan",
    "Al Hoceïma",
    "Larache",
    "Asilah",
  ],
  "Fès-Meknès": ["Fès", "Meknès", "Taza", "Ifrane", "Sefrou"],
  "Souss-Massa": ["Agadir", "Tiznit", "Taroudant", "Inezgane"],
  Oriental: ["Oujda", "Nador", "Berkane", "Taourirt"],
};

const regions = Object.keys(moroccanCities);

const DELIVERY_TYPES = [
  {
    id: "agence",
    label: "À l'agence",
    icon: Truck,
    pricePerKg: 20,
    description: "Client récupère à l'agence",
  },
  {
    id: "domicile",
    label: "À domicile",
    icon: Home,
    pricePerKg: 30,
    description: "Livraison à l'adresse",
  },
];

interface ClientInfo {
  name: string;
  phone: string;
  address: string;
}
interface DestinatairInfo extends ClientInfo {
  country: string;
  city: string;
  region: string;
}

interface AddColisPageProps {
  onBack: () => void;
  onSave: (colis: any) => void;
}

function ClientSearch({
  onSelect,
}: {
  onSelect: (c: (typeof mockClients)[0]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? mockClients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query),
      )
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={i18n.t("addColis.searchClient")}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all text-gray-700"
          />
        </div>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c);
                setQuery(c.name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 hover:bg-[#FDF1EA] transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
            >
              <p className="text-sm font-semibold text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-400">
                {c.phone} • {c.address}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageSlot({
  index,
  file,
  onUpload,
}: {
  index: number;
  file: File | null;
  onUpload: (i: number, f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
        file
          ? "border-emerald-400 bg-emerald-50"
          : "border-gray-200 bg-gray-50 hover:border-brand-orange hover:bg-[#FDF1EA]"
      }`}
    >
      {file ? (
        <div className="flex flex-col items-center gap-0.5">
          <Image size={14} className="text-emerald-500" />
          <span className="text-[9px] text-emerald-600 font-bold">
            IMG{index + 1} ✓
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5">
          <Image size={14} className="text-gray-400" />
          <span className="text-[9px] text-gray-400">
            {i18n.t("addColis.upload")}
          </span>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && onUpload(index, e.target.files[0])
        }
      />
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: any;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <Icon size={14} className="text-brand-orange" />
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
          {title}
        </span>
        {badge && (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
            <Star size={8} /> {badge}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all text-gray-700 placeholder-gray-300";

export default function AddColisPage({ onBack, onSave }: AddColisPageProps) {
  const { t, i18n } = useTranslation();
  const today = new Date().toLocaleDateString(
    i18n.language === "ar"
      ? "ar-MA"
      : i18n.language === "en"
        ? "en-GB"
        : "fr-FR",
  );
  const [trackingNo, setTrackingNo] = useState(
    () => `C${Math.floor(100000 + Math.random() * 900000)}`,
  );

  // Expéditeur
  const [sender, setSender] = useState<ClientInfo>({
    name: "",
    phone: "",
    address: "",
  });
  const [saveSender, setSaveSender] = useState(false);

  // Destinataire
  const [receiver, setReceiver] = useState<DestinatairInfo>({
    name: "",
    phone: "",
    address: "",
    country: "Maroc",
    city: "",
    region: "",
  });
  const [saveReceiver, setSaveReceiver] = useState(false);

  // Colis details
  const [weight, setWeight] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<(File | null)[]>([null, null, null]);

  // Delivery type
  const [deliveryType, setDeliveryType] = useState<"agence" | "domicile">(
    "domicile",
  );

  // Notes
  const [notes, setNotes] = useState("");

  // Computed
  const pricePerKg = deliveryType === "agence" ? 20 : 30;
  const totalPrice =
    typeof weight === "number" && weight > 0 ? weight * pricePerKg : 0;
  const availableCities = receiver.region
    ? (moroccanCities[receiver.region] ?? [])
    : [];

  const handleImageUpload = (idx: number, file: File) => {
    setImages((prev) => prev.map((f, i) => (i === idx ? file : f)));
  };

  const isValid =
    sender.name.trim() &&
    receiver.name.trim() &&
    typeof weight === "number" &&
    weight > 0 &&
    trackingNo.trim() !== "";

  const buildNewColis = () => ({
    id: `CLS${Math.floor(100 + Math.random() * 900)}`,
    trackingNo,
    sender: sender.name,
    receiver: receiver.name,
    city: receiver.city || receiver.region || "—",
    type: deliveryType === "domicile" ? "Express" : "Standard",
    weight: typeof weight === "number" ? weight : 0,
    totalPrice,
    status: "En attente" as const,
    date: new Date().toISOString().split("T")[0],
  });

  const handleSave = () => {
    if (!isValid) return;
    onSave(buildNewColis());
    Swal.fire({
      title: t("common.added"),
      text: t("addColis.savedSuccess"),
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
    });
    onBack();
  };

  const handleSaveAndPrint = () => {
    if (!isValid) return;
    const newColis = buildNewColis();
    onSave(newColis);

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Bordereau ${trackingNo}</title>
      <style>
        body{font-family:'Segoe UI',sans-serif;padding:30px;color:#1f2937}
        .hdr{border-bottom:2px solid #2B4C8C;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between}
        .title{font-size:22px;font-weight:bold;color:#2B4C8C;margin:0}
        .track{font-family:monospace;font-size:16px;font-weight:bold;color:#E26D28}
        .sec{border:1px solid #e5e7eb;border-radius:8px;margin-bottom:16px;overflow:hidden}
        .sec-t{background:#f9fafb;padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border-bottom:1px solid #e5e7eb}
        .sec-b{padding:12px 16px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .fl{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em}
        .fv{font-size:13px;font-weight:600;color:#111827;margin-top:2px}
        .price{border:2px solid #E26D28;border-radius:8px;padding:16px;text-align:center;margin-top:16px}
        .price .lbl{font-size:11px;color:#9ca3af;text-transform:uppercase}
        .price .val{font-size:28px;font-weight:900;color:#E26D28}
        @media print{button{display:none}}
      </style></head><body>
      <div class="hdr">
        <div><h1 class="title">Bordereau d'Expédition</h1><p style="margin:4px 0 0;font-size:12px;color:#6b7280">ColisManager</p></div>
        <div style="text-align:right"><div class="track">${trackingNo}</div><div style="font-size:11px;color:#6b7280;margin-top:4px">Date: ${today}</div></div>
      </div>
      <div class="sec"><div class="sec-t">Expéditeur</div><div class="sec-b">
        <div><div class="fl">Nom</div><div class="fv">${sender.name}</div></div>
        <div><div class="fl">Téléphone</div><div class="fv">${sender.phone || "—"}</div></div>
        <div style="grid-column:span 2"><div class="fl">Adresse</div><div class="fv">${sender.address || "—"}</div></div>
      </div></div>
      <div class="sec"><div class="sec-t">Destinataire</div><div class="sec-b">
        <div><div class="fl">Nom</div><div class="fv">${receiver.name}</div></div>
        <div><div class="fl">Téléphone</div><div class="fv">${receiver.phone || "—"}</div></div>
        <div><div class="fl">Ville</div><div class="fv">${receiver.city || "—"}</div></div>
        <div><div class="fl">Pays</div><div class="fv">${receiver.country}</div></div>
        <div style="grid-column:span 2"><div class="fl">Adresse</div><div class="fv">${receiver.address || "—"}</div></div>
      </div></div>
      <div class="sec"><div class="sec-t">Détails du Colis</div><div class="sec-b">
        <div><div class="fl">Poids</div><div class="fv">${weight} kg</div></div>
        <div><div class="fl">Type</div><div class="fv">${deliveryType === "domicile" ? "À domicile" : "À l'agence"}</div></div>
        <div style="grid-column:span 2"><div class="fl">Description</div><div class="fv">${description || "—"}</div></div>
      </div></div>
      <div class="price"><div class="lbl">Prix Total</div><div class="val">${totalPrice.toFixed(2)} MAD</div><div style="font-size:11px;color:#6b7280;margin-top:4px">${weight} kg × ${pricePerKg} MAD/kg</div></div>
      <script>window.onload=function(){window.print();setTimeout(()=>window.close(),500);}</script>
    </body></html>`);
    win.document.close();
    onBack();
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-brand-blue hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Retour à la liste"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-brand-orange" />
              {t("addColis.newParcel")}
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {t("addColis.trackingNo")} {trackingNo} &nbsp;•&nbsp;{" "}
              {t("header.date")}: {today}
            </p>
          </div>
        </div>

        {/* Save actions (also repeated at the bottom for comfort) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSaveAndPrint}
            disabled={!isValid}
            className="px-3 py-1.5 text-sm font-semibold text-brand-blue bg-white border-2 border-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={14} /> {t("addColis.saveAndPrint")}
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-4 py-1.5 text-sm font-semibold bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={14} /> {t("common.save")}
          </button>
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex flex-col gap-5">
          {/* EXPÉDITEUR */}
          <Section icon={User} title={t("colis.sender")}>
            <ClientSearch
              onSelect={(c) =>
                setSender({ name: c.name, phone: c.phone, address: c.address })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("clients.modal.fullName")} required>
                <input
                  type="text"
                  value={sender.name}
                  onChange={(e) =>
                    setSender((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Nom complet"
                  className={inputCls}
                />
              </Field>
              <Field label={t("clients.modal.phone")}>
                <input
                  type="tel"
                  value={sender.phone}
                  onChange={(e) =>
                    setSender((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="0612345678"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label={t("clients.modal.fullAddress")}>
              <input
                type="text"
                value={sender.address}
                onChange={(e) =>
                  setSender((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Adresse complète"
                className={inputCls}
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={saveSender}
                onChange={(e) => setSaveSender(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-brand-orange cursor-pointer"
              />
              <span className="text-xs text-gray-500">
                {t("addColis.saveAsClient")}
              </span>
            </label>
          </Section>

          {/* DESTINATAIRE */}
          <Section icon={MapPin} title={t("colis.receiver")}>
            <ClientSearch
              onSelect={(c) =>
                setReceiver((p) => ({
                  ...p,
                  name: c.name,
                  phone: c.phone,
                  address: c.address,
                }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("clients.modal.fullName")} required>
                <input
                  type="text"
                  value={receiver.name}
                  onChange={(e) =>
                    setReceiver((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Nom complet"
                  className={inputCls}
                />
              </Field>
              <Field label={t("clients.modal.phone")}>
                <input
                  type="tel"
                  value={receiver.phone}
                  onChange={(e) =>
                    setReceiver((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="0623456789"
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label={t("clients.country")}>
                <div className="relative">
                  <select
                    value={receiver.country}
                    onChange={(e) =>
                      setReceiver((p) => ({ ...p, country: e.target.value }))
                    }
                    className={
                      inputCls + " appearance-none pr-7 cursor-pointer"
                    }
                  >
                    <option>Maroc</option>
                    <option>France</option>
                    <option>Espagne</option>
                    <option>Belgique</option>
                    <option>Canada</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </Field>
              <Field label={t("clients.region")}>
                <div className="relative">
                  <select
                    value={receiver.region}
                    onChange={(e) =>
                      setReceiver((p) => ({
                        ...p,
                        region: e.target.value,
                        city: "",
                      }))
                    }
                    className={
                      inputCls + " appearance-none pr-7 cursor-pointer"
                    }
                  >
                    <option value="">{t("addColis.selectOption")}</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </Field>
              <Field label={t("clients.city")}>
                <div className="relative">
                  <select
                    value={receiver.city}
                    onChange={(e) =>
                      setReceiver((p) => ({ ...p, city: e.target.value }))
                    }
                    disabled={!availableCities.length}
                    className={
                      inputCls +
                      " appearance-none pr-7 cursor-pointer disabled:opacity-50"
                    }
                  >
                    <option value="">{t("addColis.selectOption")}</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </Field>
            </div>
            <Field label={t("clients.modal.fullAddress")}>
              <input
                type="text"
                value={receiver.address}
                onChange={(e) =>
                  setReceiver((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Quartier, Immeuble, Appartement..."
                className={inputCls}
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={saveReceiver}
                onChange={(e) => setSaveReceiver(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-brand-orange cursor-pointer"
              />
              <span className="text-xs text-gray-500">
                {t("addColis.saveAsClient")}
              </span>
            </label>
          </Section>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="flex flex-col gap-5">
          {/* DÉTAILS DU COLIS */}
          <Section icon={Scale} title={t("addColis.parcelDetails")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label={t("colis.tracking")} required>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) =>
                      setTrackingNo(e.target.value.toUpperCase())
                    }
                    placeholder="Ex: C784917"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setTrackingNo(
                        `C${Math.floor(100000 + Math.random() * 900000)}`,
                      )
                    }
                    className="px-3 py-1.5 text-xs font-bold text-white bg-brand-orange hover:bg-orange-600 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw size={12} />
                    {t("addColis.generate")}
                  </button>
                </div>
              </Field>
              <Field label={t("colis.weight")} required>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={weight}
                  onChange={(e) =>
                    setWeight(
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                  placeholder="Ex: 15"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label={t("addColis.description")}>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vêtements, Électronique..."
                className={inputCls}
              />
            </Field>
            <Field label={t("addColis.photos")}>
              <div className="flex items-center gap-2">
                {images.map((file, idx) => (
                  <ImageSlot
                    key={idx}
                    index={idx}
                    file={file}
                    onUpload={handleImageUpload}
                  />
                ))}
                <span className="text-[10px] text-gray-400 ml-1">
                  {t("addColis.clickToUpload")}
                </span>
              </div>
            </Field>
          </Section>

          {/* TYPE DE LIVRAISON */}
          <Section
            icon={Truck}
            title={t("addColis.deliveryType")}
            badge={t("addColis.required")}
          >
            <div className="grid grid-cols-2 gap-3">
              {DELIVERY_TYPES.map((dt) => {
                const Icon = dt.icon;
                const sel = deliveryType === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() =>
                      setDeliveryType(dt.id as "agence" | "domicile")
                    }
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${sel ? "border-brand-orange bg-[#FDF1EA]" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                  >
                    <div
                      className={`mt-0.5 p-2 rounded-lg shrink-0 ${sel ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-500"}`}
                    >
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`text-sm font-bold ${sel ? "text-brand-orange" : "text-gray-700"}`}
                        >
                          {dt.id === "domicile"
                            ? t("dashboard.homeDelivery")
                            : t("dashboard.agencyDelivery")}
                        </p>
                        {sel && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-brand-blue font-bold mt-0.5">
                        {dt.pricePerKg} MAD/kg
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {dt.id === "domicile"
                          ? t("addColis.homeDeliveryDesc")
                          : t("addColis.agencyDeliveryDesc")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* CALCUL DU PRIX */}
          <Section
            icon={Calculator}
            title={t("addColis.priceCalculation")}
            badge={t("addColis.auto")}
          >
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t("addColis.selectedType")}</span>
                <span className="font-semibold text-gray-800">
                  {deliveryType === "domicile" ? "À domicile" : "À l'agence"}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t("addColis.unitPrice")}</span>
                <span className="font-semibold text-gray-800">
                  {pricePerKg} MAD/kg
                </span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t("addColis.parcelWeight")}</span>
                <span className="font-semibold text-gray-800">
                  {weight !== "" ? `${weight} kg` : "— kg"}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t("addColis.pricePerKg")}</span>
                <span className="font-semibold text-gray-800">
                  × {pricePerKg} MAD/kg
                </span>
              </div>
              <hr className="border-dashed border-gray-200" />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  {t("colis.totalPrice")}
                </span>
                <span
                  className={`text-2xl font-black ${totalPrice > 0 ? "text-brand-orange" : "text-gray-300"}`}
                >
                  {totalPrice > 0 ? `${totalPrice.toFixed(2)} MAD` : "— MAD"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
              <Info size={12} className="text-gray-400 shrink-0" />
              <span>{t("addColis.autoRecalculationHint")}</span>
            </div>
          </Section>

          {/* NOTES */}
          <Section icon={FileText} title={t("addColis.notes")}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("addColis.notesPlaceholder")}
              rows={2}
              className={inputCls + " resize-none"}
            />
          </Section>
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="flex items-center justify-between py-4 border-t border-gray-200 bg-white sticky bottom-0">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {t("common.cancel")}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAndPrint}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-semibold text-brand-blue bg-white border-2 border-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={15} /> {t("addColis.saveAndPrint")}
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-5 py-2 text-sm font-semibold bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={15} /> {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
