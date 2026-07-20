import { useState, useEffect, useRef, useMemo } from "react";
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
  ChevronDown,
  Image,
  Star,
  RefreshCw,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

interface ClientRow {
  id: number;
  full_name: string;
  phone_number: string;
  full_address?: string;
  country?: string;
  region?: string;
  city?: string;
}

interface LocationRow {
  id: number;
  country: string;
  region: string;
  city: string | null;
}



interface ClientInfo {
  client_id?: number;
  name: string;
  phone: string;
  address: string;
}
interface DestinatairInfo extends ClientInfo {
  country: string;
  city: string;
  region: string;
}

interface CreateColisPayload {
  tracking_number: string;
  sender: {
    client_id?: number;
    name: string;
    phone: string;
    address?: string;
    save_client: boolean;
  };
  receiver: {
    client_id?: number;
    name: string;
    phone: string;
    address: string;
    country: string;
    region: string;
    city: string;
    save_client: boolean;
  };
  weight: number;
  quantity: number;
  description?: string;
  delivery_type: string;
  total_amount: number;
  notes?: string;
  image_1?: number[] | null;
  image_2?: number[] | null;
  image_3?: number[] | null;
}

type ColisListItem = {
  id: string;
  trackingNo: string;
  sender: string;
  receiver: string;
  city: string;
  type: string;
  weight: number;
  totalPrice: number;
  status: string;
  date: string;
};

interface AddColisPageProps {
  onBack: () => void;
  onSave: (colis: ColisListItem) => void;
}

function ClientSearch({
  clients,
  query,
  onQueryChange,
  onSelect,
}: {
  clients: ClientRow[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (client: ClientRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? clients.filter(
        (c) =>
          c.full_name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone_number.includes(query) ||
          (c.full_address || "").toLowerCase().includes(query.toLowerCase()),
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
              onQueryChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={i18n.t("addColis.searchClient")}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-700 dark:text-slate-200"
          />
        </div>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c);
                onQueryChange(c.full_name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 hover:bg-[#FDF1EA] dark:hover:bg-orange-500/10 transition-colors border-b border-gray-50 dark:border-slate-800/50 last:border-0 cursor-pointer"
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{c.full_name}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {c.phone_number} • {c.full_address || "—"}
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
          ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
          : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-brand-orange hover:bg-[#FDF1EA] dark:hover:bg-orange-500/10"
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
    <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
        <Icon size={14} className="text-brand-orange" />
        <span className="text-[11px] font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">
          {title}
        </span>
        {badge && (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-1.5 py-0.5 rounded-full">
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
      <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
        {label} {required && <span className="text-red-400 dark:text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-700 dark:text-slate-200 placeholder-gray-300 dark:placeholder-gray-500";

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

  const [shippingSettings, setShippingSettings] = useState({
    agencyDeliveryFee: 20,
    homeDeliveryFee: 30,
  });

  const DELIVERY_TYPES = [
    {
      id: "agence",
      label: "À l'agence",
      icon: Truck,
      pricePerKg: shippingSettings.agencyDeliveryFee,
      description: "Client récupère à l'agence",
    },
    {
      id: "domicile",
      label: "À domicile",
      icon: Home,
      pricePerKg: shippingSettings.homeDeliveryFee,
      description: "Livraison à l'adresse",
    },
  ];

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

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [senderQuery, setSenderQuery] = useState("");
  const [receiverQuery, setReceiverQuery] = useState("");

  // Colis details
  const [weight, setWeight] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">(1);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<(File | null)[]>([null, null, null]);

  // Delivery type
  const [deliveryType, setDeliveryType] = useState<"agence" | "domicile">(
    "domicile",
  );

  // Notes
  const [notes, setNotes] = useState("");

  // Computed
  const pricePerKg = deliveryType === "agence" ? shippingSettings.agencyDeliveryFee : shippingSettings.homeDeliveryFee;
  const totalPrice =
    typeof weight === "number" && weight > 0
      ? weight <= 10
        ? deliveryType === "agence"
          ? 100
          : 200
        : weight * pricePerKg
      : 0;

  const countries = useMemo(
    () => Array.from(new Set(locations.map((loc) => loc.country))).sort(),
    [locations],
  );

  const regions = useMemo(() => {
    const filtered = locations.filter((loc) => loc.country === receiver.country);
    return Array.from(new Set(filtered.map((loc) => loc.region))).sort();
  }, [locations, receiver.country]);

  const cities = useMemo(() => {
    const filtered = locations.filter(
      (loc) => loc.country === receiver.country && loc.region === receiver.region,
    );
    return Array.from(new Set(filtered.map((loc) => loc.city || "")))
      .filter(Boolean)
      .sort();
  }, [locations, receiver.country, receiver.region]);

  const availableCities = cities;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientData, locationData, shippingData] = await Promise.all([
          invoke<ClientRow[]>("get_clients"),
          invoke<LocationRow[]>("get_locations"),
          invoke<{ agency_delivery_fee: number; home_delivery_fee: number }>("get_shipping_settings").catch(() => null),
        ]);
        setClients(clientData);
        setLocations(locationData);
        if (shippingData) {
          setShippingSettings({
            agencyDeliveryFee: shippingData.agency_delivery_fee,
            homeDeliveryFee: shippingData.home_delivery_fee,
          });
        }

        const uniqueCountries = Array.from(
          new Set(locationData.map((loc) => loc.country)),
        ).sort();

        if (uniqueCountries.length > 0 && !uniqueCountries.includes("Maroc")) {
          setReceiver((p) => ({
            ...p,
            country: uniqueCountries[0],
          }));
        }
      } catch (error) {
        console.error("Failed to load clients or locations:", error);
      }
    };

    loadData();
  }, []);

  const handleImageUpload = (idx: number, file: File) => {
    setImages((prev) => prev.map((f, i) => (i === idx ? file : f)));
  };

  const isValid =
    sender.name.trim() &&
    receiver.name.trim() &&
    receiver.country.trim() &&
    receiver.region.trim() &&
    receiver.city.trim() &&
    typeof weight === "number" &&
    weight > 0 &&
    typeof quantity === "number" &&
    quantity > 0 &&
    trackingNo.trim() !== "";

  const buildPayload = (): CreateColisPayload => ({
    tracking_number: trackingNo.trim(),
    sender: {
      client_id: sender.client_id,
      name: sender.name.trim(),
      phone: sender.phone.trim(),
      address: sender.address.trim() || undefined,
      save_client: saveSender,
    },
    receiver: {
      client_id: receiver.client_id,
      name: receiver.name.trim(),
      phone: receiver.phone.trim(),
      address: receiver.address.trim(),
      country: receiver.country.trim(),
      region: receiver.region.trim(),
      city: receiver.city.trim(),
      save_client: saveReceiver,
    },
    weight: typeof weight === "number" ? weight : 0,
    quantity: typeof quantity === "number" ? quantity : 1,
    description: description.trim() || undefined,
    delivery_type: deliveryType,
    total_amount: totalPrice,
    notes: notes.trim() || undefined,
  });

  const mapDbColisToListItem = (item: any): ColisListItem => ({
    id: String(item.id),
    trackingNo: item.tracking_number,
    sender: item.sender_name,
    receiver: item.receiver_name,
    city: item.receiver_city || item.receiver_region || "—",
    type: item.delivery_type === "domicile" || item.delivery_type === "home" ? "Express" : "Standard",
    weight: item.weight,
    totalPrice: item.total_amount,
    status: item.status || "En attente",
    date: item.created_at ? item.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
  });

  const fileToByteArray = async (file: File | null): Promise<number[] | null> => {
    if (!file) return null;
    const buffer = await file.arrayBuffer();
    return Array.from(new Uint8Array(buffer));
  };

  const handleSave = async () => {
    if (!isValid) return;

    try {
      const basePayload = buildPayload();
      const img1 = await fileToByteArray(images[0]);
      const img2 = await fileToByteArray(images[1]);
      const img3 = await fileToByteArray(images[2]);
      
      const payload: CreateColisPayload = {
        ...basePayload,
        image_1: img1,
        image_2: img2,
        image_3: img3,
      };

      const createdColis = await invoke<any>("create_colis", { payload });
      onSave(mapDbColisToListItem(createdColis));
      Swal.fire({
        title: t("common.added"),
        text: t("addColis.savedSuccess"),
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
      onBack();
    } catch (error) {
      console.error("Failed to create colis:", error);
      Swal.fire({
        title: t("common.error"),
        text: t("addColis.saveError") || "Failed to save colis.",
        icon: "error",
        confirmButtonText: t("common.close"),
      });
    }
  };



  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-brand-blue hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Retour à la liste"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Package size={20} className="text-brand-orange" />
              {t("addColis.newParcel")}
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5">
              {t("addColis.trackingNo")} {trackingNo} &nbsp;•&nbsp;{" "}
              {t("header.date")}: {today}
            </p>
          </div>
        </div>

        {/* Save action */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-4 py-1.5 text-sm font-semibold bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("common.save")}
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
              clients={clients}
              query={senderQuery}
              onQueryChange={setSenderQuery}
              onSelect={(c) =>
                setSender({
                  client_id: c.id,
                  name: c.full_name,
                  phone: c.phone_number,
                  address: c.full_address || "",
                })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("clients.modal.fullName")} required>
                <input
                  type="text"
                  value={sender.name}
                  onChange={(e) =>
                    setSender((p) => ({
                      ...p,
                      client_id: undefined,
                      name: e.target.value,
                    }))
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
                    setSender((p) => ({
                      ...p,
                      client_id: undefined,
                      phone: e.target.value,
                    }))
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
                  setSender((p) => ({
                    ...p,
                    client_id: undefined,
                    address: e.target.value,
                  }))
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
                className="w-3.5 h-3.5 rounded accent-brand-orange cursor-pointer dark:bg-slate-850 dark:border-slate-700"
              />
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {t("addColis.saveAsClient")}
              </span>
            </label>
          </Section>

          {/* DESTINATAIRE */}
          <Section icon={MapPin} title={t("colis.receiver")}>
            <ClientSearch
              clients={clients}
              query={receiverQuery}
              onQueryChange={setReceiverQuery}
              onSelect={(c) =>
                setReceiver((p) => ({
                  ...p,
                  client_id: c.id,
                  name: c.full_name,
                  phone: c.phone_number,
                  address: c.full_address || "",
                  country: c.country || p.country,
                  region: c.region || p.region,
                  city: c.city || p.city,
                }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("clients.modal.fullName")} required>
                <input
                  type="text"
                  value={receiver.name}
                  onChange={(e) =>
                    setReceiver((p) => ({
                      ...p,
                      client_id: undefined,
                      name: e.target.value,
                    }))
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
                    setReceiver((p) => ({
                      ...p,
                      client_id: undefined,
                      phone: e.target.value,
                    }))
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
                      setReceiver((p) => ({
                        ...p,
                        client_id: undefined,
                        country: e.target.value,
                        region: "",
                        city: "",
                      }))
                    }
                    className={
                      inputCls + " appearance-none pr-7 cursor-pointer"
                    }
                  >
                    <option value="" className="dark:bg-slate-900">{t("addColis.selectOption")}</option>
                    {countries.map((country) => (
                      <option key={country} value={country} className="dark:bg-slate-900">
                        {country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none"
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
                        client_id: undefined,
                        region: e.target.value,
                        city: "",
                      }))
                    }
                    className={
                      inputCls + " appearance-none pr-7 cursor-pointer"
                    }
                  >
                    <option value="" className="dark:bg-slate-900">{t("addColis.selectOption")}</option>
                    {regions.map((r) => (
                      <option key={r} value={r} className="dark:bg-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none"
                  />
                </div>
              </Field>
              <Field label={t("clients.city")}>

                <div className="relative">
                  <select
                    value={receiver.city}
                    onChange={(e) =>
                      setReceiver((p) => ({
                        ...p,
                        client_id: undefined,
                        city: e.target.value,
                      }))
                    }
                    disabled={!availableCities.length}
                    className={
                      inputCls +
                      " appearance-none pr-7 cursor-pointer disabled:opacity-50"
                    }
                  >
                    <option value="" className="dark:bg-slate-900">{t("addColis.selectOption")}</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c} className="dark:bg-slate-900">
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none"
                  />
                </div>
              </Field>
            </div>
            <Field label={t("clients.modal.fullAddress")}>
              <input
                type="text"
                value={receiver.address}
                onChange={(e) =>
                  setReceiver((p) => ({
                    ...p,
                    client_id: undefined,
                    address: e.target.value,
                  }))
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
                className="w-3.5 h-3.5 rounded accent-brand-orange cursor-pointer dark:bg-slate-850 dark:border-slate-700"
              />
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {t("addColis.saveAsClient")}
              </span>
            </label>
          </Section>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="flex flex-col gap-5">
          {/* DÉTAILS DU COLIS */}
          <Section icon={Scale} title={t("addColis.parcelDetails")}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <Field label="Quantité" required>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value === "" ? "" : parseInt(e.target.value, 10),
                    )
                  }
                  placeholder="Ex: 1"
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
                  {typeof weight === "number" && weight <= 10 ? "Forfait (≤ 10kg)" : `${pricePerKg} MAD/kg`}
                </span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t("addColis.parcelWeight")}</span>
                <span className="font-semibold text-gray-800">
                  {weight !== "" ? `${weight} kg` : "— kg"}
                </span>
              </div>
              {!(typeof weight === "number" && weight <= 10) && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t("addColis.pricePerKg")}</span>
                  <span className="font-semibold text-gray-800">
                    × {pricePerKg} MAD/kg
                  </span>
                </div>
              )}
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
      <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky bottom-0">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="px-5 py-2 text-sm font-semibold bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}
