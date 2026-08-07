import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowRight, AlertTriangle, Search, ChevronDown, X } from "lucide-react";
import { waLink } from "@/lib/constants";
import CopyableMessage from "@/components/CopyableMessage";

const PRECIO_MIN = 5000;
const PRECIO_MAX = 300000;

type VehicleType = "SUV" | "Camioneta" | "Comercial";
const vehicleTypes: VehicleType[] = ["SUV", "Camioneta", "Comercial"];

type ModelQuota = { model: string; cuota: number; cuota2?: number };

type Plan = {
  id: string;
  title: string;
  tagline: string;
  structure: string[];
  cuotaLabel: string;
  inicialRange?: string;
  highlight: string;
  accent: "teal" | "amber" | "neutral";
  models: ModelQuota[];
  // Parámetros para el mini simulador
  inicialPct: number;        // % del precio que cubre la inicial total
  cuotasOrdinarias: number;  // número de cuotas mensuales típicas
  defaultPlazo: number;      // plazo total sugerido en meses
  plazoMin: number;
  plazoMax: number;
};

// Cuotas extraídas vía OCR de los catálogos oficiales JAC/Bel Agosto 2026.
// Para Fiao/Ruta66/Travesía la secuencia de modelos es idéntica entre planes.
const morePlans: Plan[] = [
  {
    id: "credijac",
    title: "Credijac 35×35",
    tagline: "Inicial 35% + 30 cuotas + 6 cuotas extra",
    structure: [
      "6 cuotas iniciales (35%)",
      "Pre-entrega previo a la entrega",
      "30 cuotas ordinarias mensuales",
      "6 cuotas extra en meses 9, 12, 15, 18, 21 y 24",
    ],
    cuotaLabel: "Cuota ordinaria mensual",
    inicialRange: "Cuota inicial desde $1.459 hasta $7.567",
    highlight: "Plan más popular para financiamiento extendido",
    accent: "teal",
    models: [
      // Camiones (Credijac 35×35 Camiones)
      { model: "X100 Ferretero", cuota: 398.9 },
      { model: "Urban Chasis Largo 3 Ton", cuota: 654.5 },
      { model: "Urban Ferretero 2 Ton", cuota: 716.3 },
      { model: "C-3500 Doble Cabina", cuota: 963.7 },
      { model: "Búfalo Cava de Conservación", cuota: 2197.4 },
      { model: "Búfalo Brazo Hidráulico", cuota: 3538.2 },
      // Pasajeros (Credijac 35×35 Pasajeros · 06 de agosto 2026)
      { model: "Arena Sport MT", cuota: 404.8 },
      { model: "Arena Sport AT", cuota: 442.5 },
      { model: "Arena Pro AT", cuota: 485.1 },
      { model: "Nevado MT", cuota: 542.7 },
      { model: "Tepuy Pro", cuota: 736.4 },
      { model: "Savanna", cuota: 798.2 },
      { model: "GX7", cuota: 761.4 },
      { model: "RF8", cuota: 1322.6 },
      { model: "La Venezolana 4x2 Gasolina", cuota: 532.7 },
      { model: "La Venezolana 4x2 Diésel", cuota: 556.1 },
      { model: "La Venezolana 4x4 Diésel", cuota: 615.1 },
      { model: "T5 La Venezolana 4x2 Diésel", cuota: 579.3 },
      { model: "La Venezolana Pal Campo 4x4", cuota: 721.2 },
      { model: "La Venezolana Pro 4x4", cuota: 766.9 },
      { model: "Pickup Limited AT", cuota: 973.5 },
      { model: "Aventura 4x4 AT", cuota: 946.4 },
      { model: "Aventura Pro Gasolina", cuota: 1188.7 },
      { model: "Sunray V4 Pasajeros 11+1", cuota: 971.3 },
      { model: "Sunray V4 Carga", cuota: 914.5 },
      { model: "Sunray V6 Pasajeros 17+1", cuota: 1082.6 },
      { model: "Sunray V6 Carga", cuota: 983.5 },
      { model: "Sunray V6 Motorhome", cuota: 2086.0 },
      { model: "Sunray V6 Escolar", cuota: 1186.9 },
      { model: "Ambulancia V4", cuota: 1264.9 },
      { model: "Compactador 10M3", cuota: 1966.7 },

    ],
    inicialPct: 35,
    cuotasOrdinarias: 30,
    defaultPlazo: 36,
    plazoMin: 24,
    plazoMax: 48,
  },
  {
    id: "facilito",
    title: "Facilito de JAC",
    tagline: "Inicial baja + cuotas fijas por 2 años",
    structure: [
      "Afiliación Día 1",
      "6 pagos mensuales iniciales",
      "Pre-entrega (cuota especial)",
      "23 cuotas fijas mensuales",
    ],
    cuotaLabel: "Cuota mensual fija",
    highlight: "La cuota mensual más baja de JAC",
    accent: "teal",
    models: [
      { model: "Arena Sport MT", cuota: 799.1 },
      { model: "Arena Sport AT", cuota: 899.4 },
    ],
    inicialPct: 20,
    cuotasOrdinarias: 23,
    defaultPlazo: 30,
    plazoMin: 24,
    plazoMax: 36,
  },
  {
    id: "fiao",
    title: "Llévatelo Fiao",
    tagline: "Inicial 40% (6 pagos) + pre-entrega + 12 cuotas ordinarias",
    structure: [
      "Cuota a la firma del contrato",
      "5 pagos iguales (completan el 40% de inicial)",
      "Pre-entrega previo a la entrega",
      "12 cuotas ordinarias mensuales",
    ],
    cuotaLabel: "Cuota ordinaria mensual",
    inicialRange: "Cuota inicial desde $1.298,7 hasta $4.129,3 (6 pagos)",
    highlight: "Te llevas tu vehículo antes de pagar todo",
    accent: "amber",
    models: [
      { model: "Arena Sport MT", cuota: 974.0 },
      { model: "Arena Sport AT", cuota: 1064.9 },
      { model: "Arena Pro AT", cuota: 1173.2 },
      { model: "Nevado MT", cuota: 1324.6 },
      { model: "Tepuy Pro", cuota: 1865.6 },
      { model: "Savanna", cuota: 1800.7 },
      { model: "RF8", cuota: 3008.1 },
      { model: "GX7", cuota: 1692.5 },
      { model: "La Venezolana 4X2 Gasolina", cuota: 1396.7 },
      { model: "La Venezolana 4X2 Diesel 2.8L", cuota: 1396.1 },
      { model: "La Venezolana 4X4 Diesel 2.8L", cuota: 1547.6 },
      { model: "T5 La Venezolana 4X2 Diesel 2.8L", cuota: 1273.2 },
      { model: "La Venezolana Pal Campo 4X4 Diesel", cuota: 1773.4 },
      { model: "La Venezolana Pro 4X4", cuota: 1724.5 },
      { model: "Pickup Limited Automatica", cuota: 2188.1 },
      { model: "Aventura 4X4 Automatica", cuota: 2123.2 },
      { model: "Aventura Pro Gasolina Edicion Limitada", cuota: 2573.3 },
      { model: "X100 Ferretero", cuota: 1192.7 },
      { model: "Urban Chasis 3 Ton", cuota: 1365.9 },
      { model: "Urban Ferretero 3 Ton", cuota: 1452.4 },
      { model: "C-3500 4X4", cuota: 2010.7 },
      { model: "Doble Cabina Ferretero 3 Ton", cuota: 1712.1 },
      { model: "6T Chasis", cuota: 1943.9 },
      { model: "6T Ferretero", cuota: 2052.1 },
      { model: "Bufalo 12 Ton Tanque 1000 L", cuota: 3096.9 },
    ],

    inicialPct: 40,
    cuotasOrdinarias: 12,
    defaultPlazo: 18,
    plazoMin: 12,
    plazoMax: 24,
  },
  {
    id: "ruta66",
    title: "Credijac Ruta 66",
    tagline: "16 cuotas iniciales + pre-entrega + 50 cuotas mensuales",
    structure: [
      "16 cuotas iniciales mensuales (previas a la entrega)",
      "Pre-entrega: pago especial previo a recibir el vehículo",
      "50 cuotas ordinarias mensuales y consecutivas",
    ],
    cuotaLabel: "Cuota mensual (50 cuotas)",
    inicialRange: "Cuota inicial desde $499,2 hasta $1.543,3 (16 cuotas)",
    highlight: "Financiamiento extendido a más de 5 años",
    accent: "neutral",
    models: [
      { model: "Arena Sport MT", cuota: 558.8 },
      { model: "Arena Sport AT", cuota: 599.3 },
      { model: "Arena Pro", cuota: 670.9 },
      { model: "Nevado MT", cuota: 731.4 },
      { model: "Tepuy Pro", cuota: 1020.1 },
      { model: "Savanna", cuota: 1110.5 },
      { model: "RF8", cuota: 1718.4 },
      { model: "GX7", cuota: 1013.3 },
      { model: "La Venezolana 4X2 Gasolina", cuota: 701.0 },
      { model: "La Venezolana 4X2 Diesel 2.8L", cuota: 750.4 },
      { model: "La Venezolana 4X4 Diesel 2.8L", cuota: 846.7 },
      { model: "T5 La Venezolana 4X2 Diesel 2.8L", cuota: 774.3 },
      { model: "La Venezolana Pal Campo 4X4 Diesel", cuota: 915.2 },
      { model: "La Venezolana Pro 4X4", cuota: 984.1 },
      { model: "Pickup Limited Automatica", cuota: 1270.7 },
      { model: "Aventura 4X4 Automatica", cuota: 1233.6 },
      { model: "Aventura Pro Gasolina Edicion Limitada", cuota: 1585.8 },
      { model: "X100 Ferretero", cuota: 574.9 },
      { model: "Urban Chasis 3 Ton", cuota: 739.7 },
      { model: "Urban Ferretero 3 Ton", cuota: 787.4 },
      { model: "C-3500 4X4", cuota: 1109.4 },
      { model: "Doble Cabina Ferretero 3 Ton", cuota: 887.8 },
      { model: "6T Chasis", cuota: 1052.6 },
      { model: "6T Ferretero", cuota: 1137.6 },
      { model: "Bufalo 12 Ton Tanque 1000 L", cuota: 1725.9 },
    ],
    inicialPct: 20,
    cuotasOrdinarias: 50,
    defaultPlazo: 50,
    plazoMin: 50,
    plazoMax: 66,
  },
  {
    id: "travesia",
    title: "Travesía",
    tagline: "Estructura Pago Cuota 1 + Pago Cuota 2",
    structure: [
      "Pago Cuota 1 al firmar el contrato",
      "Pago Cuota 2 previo a la entrega",
      "No tiene cuotas mensuales: solo dos pagos definidos",
    ],
    cuotaLabel: "Pago Cuota 1 / Pago Cuota 2",
    highlight: "Toda la gama: SUV, camionetas, comerciales y eléctricos",
    accent: "teal",
    models: [
      { model: "Arena Sport MT", cuota: 16396.5, cuota2: 3016.4 },
      { model: "Arena Sport AT", cuota: 17745.6, cuota2: 3232.3 },
      { model: "Arena Pro", cuota: 19473.6, cuota2: 3508.8 },
      { model: "Nevado MT", cuota: 21501.1, cuota2: 3833.2 },
      { model: "Tepuy Pro", cuota: 29601.8, cuota2: 5129.3 },
      { model: "Savanna", cuota: 31749.6, cuota2: 5472.9 },
      { model: "GX7", cuota: 28385.2, cuota2: 4934.6 },
      { model: "RF8", cuota: 49613.4, cuota2: 8331.1 },
      { model: "La Venezolana 4X2 Gasolina", cuota: 21253.9, cuota2: 3840.6 },
      { model: "La Venezolana 4X2 Diesel 2.8L", cuota: 21928.5, cuota2: 3948.6 },
      { model: "La Venezolana 4X4 Diesel 2.8L", cuota: 24565.4, cuota2: 4370.5 },
      { model: "T5 La Venezolana 4X2 Diesel 2.8L", cuota: 21701.5, cuota2: 3912.2 },
      { model: "La Venezolana Pal Campo 4X4 Diesel", cuota: 27734.5, cuota2: 4877.5 },
      { model: "La Venezolana Pro 4X4", cuota: 29090.0, cuota2: 5094.4 },
      { model: "Pickup Limited Automatica", cuota: 36120.7, cuota2: 6219.3 },
      { model: "Aventura 4X4 Automatica", cuota: 35527.0, cuota2: 6124.3 },
      { model: "Edicion Limitada Off-Road", cuota: 44020.9, cuota2: 7483.3 },
      { model: "X100 Ferretero", cuota: 15839.2, cuota2: 2974.3 },
      { model: "Urban Chasis 3 Ton", cuota: 21953.5, cuota2: 3952.5 },
      { model: "Urban Ferretero 3 Ton", cuota: 23274.6, cuota2: 4163.9 },
      { model: "Doble Cabina Ferretero 3 Ton", cuota: 26053.7, cuota2: 4608.6 },
      { model: "C-3500 4X4", cuota: 31933.2, cuota2: 5549.3 },
      { model: "6T Chasis", cuota: 31590.2, cuota2: 5494.4 },
      { model: "6T Ferretero", cuota: 33967.4, cuota2: 5874.8 },
      { model: "Bufalo 12 Ton Tanque 1000 L", cuota: 48768.3, cuota2: 8242.9 },
      { model: "Sunray EV", cuota: 6038.3, cuota2: 6038.3 },
      { model: "E-Sei4", cuota: 7154.3, cuota2: 7154.3 },
      { model: "E-JS1", cuota: 5564.0, cuota2: 5564.0 },
      { model: "E-JS4", cuota: 7752.5, cuota2: 7752.5 },
    ],

    inicialPct: 50,
    cuotasOrdinarias: 2,
    defaultPlazo: 2,
    plazoMin: 2,
    plazoMax: 2,
  },
  {
    id: "crediexpress",
    title: "CrediExpress JAC",
    tagline: "Inicial fraccionada + previo entrega + 6 cuotas",
    structure: [
      "3 pagos iniciales (inicial fraccionada)",
      "Previo a la entrega (cuota especial)",
      "6 cuotas ordinarias mensuales",
    ],
    cuotaLabel: "Cuota ordinaria mensual (6 cuotas)",
    highlight: "El plan más corto: paga en 6 cuotas",
    accent: "neutral" as const,
    models: [
      { model: "Arena Sport MT", cuota: 1785.7 },
      { model: "Arena Sport AT", cuota: 1952.4 },
    ],
    inicialPct: 30,
    cuotasOrdinarias: 6,
    defaultPlazo: 6,
    plazoMin: 6,
    plazoMax: 6,
  },
  {
    id: "travesia3",
    title: "Travesía 3 Pagos",
    tagline: "3 cuotas iguales: firma, 30 días y entrega",
    structure: [
      "Pago Cuota 1 al firmar el contrato",
      "Pago Cuota 2 a los 30 días",
      "Pago Cuota 3 previo a la entrega",
    ],
    cuotaLabel: "Pago por cuota (× 3 pagos iguales)",
    highlight: "Paga en solo 3 cuotas iguales",
    accent: "amber" as const,
    models: [
      { model: "Arena Sport MT", cuota: 6831.8 },
      { model: "Arena Sport AT", cuota: 7382.4 },
    ],
    inicialPct: 33,
    cuotasOrdinarias: 3,
    defaultPlazo: 3,
    plazoMin: 3,
    plazoMax: 3,
  },
];

const accentBorder = {
  neutral: "border-border",
  teal: "border-primary/60 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.35)]",
  amber: "border-amber-500/40",
};

const accentBadge = {
  neutral: "bg-secondary text-foreground",
  teal: "bg-primary text-primary-foreground",
  amber: "bg-amber-500 text-white",
};

const formatUSD = (n: number) =>
  `$${n.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

type Category = "SUV" | "Camioneta" | "Pasajeros" | "Comercial";

const categorize = (model: string): Category => {
  const m = model.toLowerCase();
  // Comerciales: carga, vans, camiones, ambulancia, escolar, compactador
  if (
    /(x100|urban|c-3500|b[uú]falo|compactador|sunray.*(carga|ambulancia|escolar)|m4 carroza|sunlong|bachaco)/i.test(
      m,
    )
  ) {
    return "Comercial";
  }
  // Pasajeros (vans / minibuses)
  if (/sunray.*pasajeros/i.test(m)) return "Pasajeros";
  // Camionetas / pickups
  if (
    /(la venezolana|aventura|arena|nevado|tepuy|limited|jimmy)/i.test(m)
  ) {
    return "Camioneta";
  }
  // SUVs
  if (/(savanna|[ée]lite|rf8)/i.test(m)) return "SUV";
  return "Comercial";
};

const categoryLabel: Record<Category, string> = {
  SUV: "SUV",
  Camioneta: "Camioneta",
  Pasajeros: "Pasajeros",
  Comercial: "Comercial",
};

const MorePlansSection = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(morePlans[0].id);
  const [vehicleType, setVehicleType] = useState<VehicleType>("SUV");
  const [precio, setPrecio] = useState<number>(25000);
  const [precioRaw, setPrecioRaw] = useState<string>("25000");
  const [plazo, setPlazo] = useState<number>(morePlans[0].defaultPlazo);
  const [modelQuery, setModelQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"original" | "asc" | "desc">(
    "original",
  );
  const [fuelFilter, setFuelFilter] = useState<"all" | "gasolina" | "diesel">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>(
    "all",
  );
  const [page, setPage] = useState<number>(1);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const PAGE_SIZE = 6;

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    if (!searchOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [searchOpen]);

  const selectedPlan =
    morePlans.find((p) => p.id === selectedPlanId) ?? morePlans[0];

  // Detectar si el plan tiene modelos por combustible
  const fuelAvailability = useMemo(() => {
    const hasGasolina = selectedPlan.models.some((m) =>
      /gasolina/i.test(m.model),
    );
    const hasDiesel = selectedPlan.models.some((m) =>
      /di[eé]sel/i.test(m.model),
    );
    return { hasGasolina, hasDiesel, show: hasGasolina && hasDiesel };
  }, [selectedPlan]);

  // Categorías disponibles dentro del plan seleccionado
  const availableCategories = useMemo(() => {
    const set = new Set<Category>();
    selectedPlan.models.forEach((m) => set.add(categorize(m.model)));
    return (["SUV", "Camioneta", "Pasajeros", "Comercial"] as const).filter(
      (c) => set.has(c),
    );
  }, [selectedPlan]);

  // Al cambiar de plan, mantener búsqueda y orden (contexto del usuario).
  // Solo reseteamos los filtros que dependen del catálogo del plan
  // (combustible y categoría pueden no existir en el nuevo plan) y la página.
  useEffect(() => {
    setFuelFilter("all");
    setCategoryFilter("all");
    setPage(1);
  }, [selectedPlanId]);

  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    let base = q
      ? selectedPlan.models.filter((m) => m.model.toLowerCase().includes(q))
      : selectedPlan.models;

    if (categoryFilter !== "all") {
      base = base.filter((m) => categorize(m.model) === categoryFilter);
    }

    if (fuelAvailability.show && fuelFilter !== "all") {
      base = base.filter((m) =>
        fuelFilter === "gasolina"
          ? /gasolina/i.test(m.model)
          : /di[eé]sel/i.test(m.model),
      );
    }

    if (sortOrder === "original") return base;
    return [...base].sort((a, b) =>
      sortOrder === "asc" ? a.cuota - b.cuota : b.cuota - a.cuota,
    );
  }, [
    selectedPlan,
    modelQuery,
    sortOrder,
    fuelFilter,
    fuelAvailability.show,
    categoryFilter,
  ]);

  const cuotaStats = useMemo(() => {
    if (filteredModels.length === 0) return null;
    const cuotas = filteredModels.map((m) => m.cuota);
    return { min: Math.min(...cuotas), max: Math.max(...cuotas) };
  }, [filteredModels]);

  const totalPages = Math.max(1, Math.ceil(filteredModels.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedModels = filteredModels.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Sugerencias para el dropdown del buscador
  const searchSuggestions = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    return (
      q
        ? selectedPlan.models.filter((m) => m.model.toLowerCase().includes(q))
        : selectedPlan.models
    ).slice(0, 50);
  }, [selectedPlan, modelQuery]);

  // Reset página cuando cambia cualquier filtro
  useEffect(() => {
    setPage(1);
  }, [modelQuery, sortOrder, fuelFilter, categoryFilter]);

  // Reset índice activo cuando cambia la lista o se cierra el dropdown
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchSuggestions, searchOpen]);

  // Auto-scroll del item activo al moverse con teclado
  useEffect(() => {
    if (!searchOpen || activeIndex < 0 || !listboxRef.current) return;
    const item = listboxRef.current.querySelectorAll<HTMLLIElement>(
      "li[role='option']",
    )[activeIndex];
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, searchOpen]);

  // Foco automático al input cuando se abre el dropdown
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Recalcular plazo dentro del rango cuando cambia el plan
  const effectivePlazo = Math.min(
    Math.max(plazo, selectedPlan.plazoMin),
    selectedPlan.plazoMax,
  );
  const plazoIsValid =
    Number.isFinite(plazo) &&
    plazo >= selectedPlan.plazoMin &&
    plazo <= selectedPlan.plazoMax;

  // Validación del precio
  let precioError: string | null = null;
  if (precioRaw.trim() === "" || !Number.isFinite(precio)) {
    precioError = "Ingresa un precio válido para simular tu cuota.";
  } else if (precio <= 0) {
    precioError = "El precio debe ser mayor que $0.";
  } else if (precio < PRECIO_MIN) {
    precioError = `El precio mínimo aceptado es ${formatUSD(PRECIO_MIN)}.`;
  } else if (precio > PRECIO_MAX) {
    precioError = `El precio máximo aceptado es ${formatUSD(PRECIO_MAX)}.`;
  }

  const isValid = !precioError && plazoIsValid;

  // Cálculo simplificado de la cuota mensual estimada
  const inicialMonto = isValid ? (precio * selectedPlan.inicialPct) / 100 : 0;
  const restante = isValid ? precio - inicialMonto : 0;
  const cuotaEstimada = isValid ? restante / effectivePlazo : 0;

  const waMessage = (() => {
    const parts: string[] = [
      `Hola Rigoberto, me interesa el plan ${selectedPlan.title} para un vehículo tipo ${vehicleType}.`,
    ];
    if (isValid) {
      parts.push(
        `Precio aproximado ${formatUSD(precio)}.`,
        `Según el simulador la cuota mensual sería ~${formatUSD(cuotaEstimada)} en ${effectivePlazo} meses (inicial estimada ${formatUSD(inicialMonto)}).`,
        `¿Me confirmas los números reales?`,
      );
    } else {
      parts.push(`¿Me puedes dar más información?`);
    }
    return parts.join(" ");
  })();


  return (
    <section id="mas-planes" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">Más planes de financiamiento</h2>
          <p className="section-subtitle">
            Además de Compra Directa y Pago Fácil, JAC ofrece siete planes
            adicionales. Selecciona un plan para ver la cuota estimada por
            modelo.
          </p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Tabs de planes */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {morePlans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlanId(p.id)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-heading font-bold transition-colors ${
                selectedPlanId === p.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Tarjeta del plan seleccionado */}
        <div
          className={`mt-8 rounded-2xl border-2 ${accentBorder[selectedPlan.accent]} card-glow p-6 md:p-8`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <span
                className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${accentBadge[selectedPlan.accent]}`}
              >
                {selectedPlan.highlight}
              </span>
              <h3 className="font-heading text-2xl font-bold mt-4">
                {selectedPlan.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedPlan.tagline}
              </p>

              <ul className="mt-5 space-y-2 text-sm">
                {selectedPlan.structure.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan.inicialRange && (
                <p className="mt-4 text-sm">
                  <span className="font-heading font-bold text-primary">
                    {selectedPlan.inicialRange}
                  </span>
                </p>
              )}
            </div>

            {/* Tabla de modelos con buscador y paginación */}
            <div>
              <div className="mb-3">
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {selectedPlan.cuotaLabel} por modelo
                </h4>
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="font-heading font-bold text-primary">
                    {filteredModels.length}
                    <span className="text-muted-foreground font-semibold">
                      {" "}
                      / {selectedPlan.models.length}{" "}
                      {filteredModels.length === selectedPlan.models.length
                        ? "modelos"
                        : "modelos coinciden"}
                    </span>
                  </span>
                  {totalPages > 1 && filteredModels.length > 0 && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </span>
                  )}
                  {cuotaStats ? (
                    <>
                      <span className="text-muted-foreground">
                        Mín{" "}
                        <span className="font-heading font-bold text-foreground">
                          {formatUSD(cuotaStats.min)}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Máx{" "}
                        <span className="font-heading font-bold text-foreground">
                          {formatUSD(cuotaStats.max)}
                        </span>
                      </span>
                      {sortOrder !== "original" && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                          Orden: {sortOrder === "asc" ? "menor a mayor" : "mayor a menor"}
                        </span>
                      )}
                      {modelQuery.trim() && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                          Búsqueda: "{modelQuery.trim()}"
                        </span>
                      )}
                      {fuelFilter !== "all" && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                          Combustible: {fuelFilter === "gasolina" ? "Gasolina" : "Diésel"}
                        </span>
                      )}
                      {categoryFilter !== "all" && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                          Categoría: {categoryFilter}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Sin resultados
                    </span>
                  )}
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mb-3">
                <div className="relative" ref={searchWrapRef}>
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={searchOpen}
                    aria-controls="model-search-listbox"
                    aria-autocomplete="list"
                    aria-activedescendant={
                      searchOpen && activeIndex >= 0
                        ? `model-option-${activeIndex}`
                        : undefined
                    }
                    value={modelQuery}
                    onChange={(e) => {
                      setModelQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        return;
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (!searchOpen) {
                          setSearchOpen(true);
                          return;
                        }
                        if (searchSuggestions.length === 0) return;
                        setActiveIndex((i) =>
                          i < searchSuggestions.length - 1 ? i + 1 : 0,
                        );
                        return;
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (!searchOpen) {
                          setSearchOpen(true);
                          return;
                        }
                        if (searchSuggestions.length === 0) return;
                        setActiveIndex((i) =>
                          i <= 0 ? searchSuggestions.length - 1 : i - 1,
                        );
                        return;
                      }
                      if (e.key === "Home" && searchOpen) {
                        e.preventDefault();
                        setActiveIndex(0);
                        return;
                      }
                      if (e.key === "End" && searchOpen) {
                        e.preventDefault();
                        setActiveIndex(searchSuggestions.length - 1);
                        return;
                      }
                      if (e.key === "Enter") {
                        if (
                          searchOpen &&
                          activeIndex >= 0 &&
                          searchSuggestions[activeIndex]
                        ) {
                          e.preventDefault();
                          setModelQuery(searchSuggestions[activeIndex].model);
                          setSearchOpen(false);
                        }
                      }
                    }}
                    placeholder="Buscar modelo (X100, Sunray, Venezolana...)"
                    className="w-full rounded-lg border-2 border-border bg-background pl-9 pr-16 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {modelQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setModelQuery("");
                          setSearchOpen(true);
                          searchInputRef.current?.focus();
                        }}
                        aria-label="Limpiar búsqueda"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen((v) => !v);
                        searchInputRef.current?.focus();
                      }}
                      aria-label="Mostrar lista de modelos"
                      aria-expanded={searchOpen}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${searchOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {searchOpen && (
                    <ul
                      ref={listboxRef}
                      id="model-search-listbox"
                      role="listbox"
                      className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border-2 border-primary/40 bg-card shadow-xl"
                    >
                      {searchSuggestions.length === 0 ? (
                        <li className="px-3 py-2 text-xs text-muted-foreground">
                          Sin coincidencias en este plan.
                        </li>
                      ) : (
                        searchSuggestions.map((m, idx) => {
                          const isActive = idx === activeIndex;
                          return (
                            <li
                              key={m.model}
                              id={`model-option-${idx}`}
                              role="option"
                              aria-selected={isActive}
                            >
                              <button
                                type="button"
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => {
                                  setModelQuery(m.model);
                                  setSearchOpen(false);
                                  searchInputRef.current?.focus();
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-3 transition-colors ${
                                  isActive
                                    ? "bg-primary/15 text-foreground"
                                    : "hover:bg-primary/10"
                                }`}
                              >
                                <span className="font-semibold text-foreground truncate">
                                  {m.model}
                                </span>
                                <span className="font-heading font-bold text-primary shrink-0">
                                  {formatUSD(m.cuota)}
                                </span>
                              </button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  )}
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(
                      e.target.value as "original" | "asc" | "desc",
                    )
                  }
                  aria-label="Ordenar modelos por cuota"
                  className="rounded-lg border-2 border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="original">Orden del catálogo</option>
                  <option value="asc">Cuota: menor a mayor</option>
                  <option value="desc">Cuota: mayor a menor</option>
                </select>
              </div>

              {availableCategories.length > 1 && (
                <div
                  role="group"
                  aria-label="Filtrar por categoría"
                  className="flex flex-wrap gap-2 mb-3"
                >
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    aria-pressed={categoryFilter === "all"}
                    className={`rounded-full border-2 px-3 py-1 text-xs font-heading font-bold transition-colors ${
                      categoryFilter === "all"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    Todas
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      aria-pressed={categoryFilter === cat}
                      className={`rounded-full border-2 px-3 py-1 text-xs font-heading font-bold transition-colors ${
                        categoryFilter === cat
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      {categoryLabel[cat]}
                    </button>
                  ))}
                </div>
              )}

              {fuelAvailability.show && (
                <div
                  role="group"
                  aria-label="Filtrar por combustible"
                  className="flex flex-wrap gap-2 mb-3"
                >
                  {(
                    [
                      { id: "all", label: "Todos" },
                      { id: "gasolina", label: "Gasolina" },
                      { id: "diesel", label: "Diésel" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFuelFilter(opt.id)}
                      aria-pressed={fuelFilter === opt.id}
                      className={`rounded-full border-2 px-3 py-1 text-xs font-heading font-bold transition-colors ${
                        fuelFilter === opt.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {sortOrder !== "original" &&
                filteredModels.some((m) => m.cuota2 !== undefined) && (
                  <div
                    role="note"
                    className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs"
                  >
                    <AlertTriangle
                      size={14}
                      className="text-amber-500 mt-0.5 shrink-0"
                    />
                    <p className="text-foreground">
                      Este plan mezcla cuotas mensuales con pagos únicos. El
                      orden por cuota usa solo el primer monto de cada modelo,
                      así que no es estrictamente comparable.
                    </p>
                  </div>
                )}

              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {pagedModels.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-center text-muted-foreground text-sm">
                          No hay modelos que coincidan con "{modelQuery}".
                        </td>
                      </tr>
                    ) : (
                      pagedModels.map((m, i) => {
                        const isPagoUnico = m.cuota2 !== undefined;
                        const badgeLabel = isPagoUnico
                          ? "Pago único × 2"
                          : "Cuota mensual";
                        const tooltip = isPagoUnico
                          ? "Pago único: dos pagos definidos (Cuota 1 + Cuota 2). El monto mostrado NO es mensual y no es comparable directamente al ordenar."
                          : `Cuota ordinaria mensual del catálogo oficial. Estructura del plan: ${selectedPlan.tagline}.`;
                        return (
                          <tr
                            key={m.model}
                            className={i % 2 === 0 ? "bg-secondary/40" : ""}
                          >
                            <td className="px-4 py-2.5">
                              <div className="font-semibold">{m.model}</div>
                              <div className="mt-1">
                                <span
                                  title={tooltip}
                                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full cursor-help ${
                                    isPagoUnico
                                      ? "bg-amber-500/15 text-amber-500 border border-amber-500/40"
                                      : "bg-primary/10 text-primary border border-primary/30"
                                  }`}
                                >
                                  {badgeLabel}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-right font-heading font-bold text-primary whitespace-nowrap align-top">
                              {formatUSD(m.cuota)}
                              {isPagoUnico ? (
                                <>
                                  <span className="text-muted-foreground font-normal">
                                    {" / "}
                                  </span>
                                  <span className="text-primary">
                                    {formatUSD(m.cuota2!)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground font-normal text-xs">
                                  /mes
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border-2 border-border bg-background px-3 py-1.5 text-xs font-heading font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border-2 border-border bg-background px-3 py-1.5 text-xs font-heading font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedPlan.id === "travesia" ? (
          <div className="mt-10 rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-6 md:p-8 max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-heading text-lg font-bold">
                Travesía Eléctricos no usa simulador
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Este plan se paga en dos cuotas fijas (Pago Cuota 1 + Pago Cuota
              2) según el modelo eléctrico. Consulta directamente con
              Rigoberto para confirmar montos y disponibilidad.
            </p>
            <a
              href={waLink(
                `Hola Rigoberto, me interesa el plan Travesía Eléctricos. ¿Me confirmas Pago Cuota 1 y Pago Cuota 2 actualizados?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Consultar por WhatsApp <ArrowRight size={16} />
            </a>
          </div>
        ) : (
        /* Mini simulador + consulta personalizada */
        <div className="mt-10 rounded-2xl border-2 border-primary/40 bg-secondary/30 p-6 md:p-8 max-w-3xl mx-auto">
          <h3 className="font-heading text-lg md:text-xl font-bold text-center">
            Simula tu cuota y arma tu consulta
          </h3>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Ingresa el precio del vehículo y el plazo. Calculamos una cuota
            estimada según el plan seleccionado y armamos tu mensaje.
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="precio-input"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Precio del vehículo (USD)
              </label>
              <input
                id="precio-input"
                type="number"
                inputMode="numeric"
                min={PRECIO_MIN}
                max={PRECIO_MAX}
                step={500}
                value={precioRaw}
                aria-invalid={!!precioError}
                aria-describedby={precioError ? "precio-error" : undefined}
                onChange={(e) => {
                  const raw = e.target.value;
                  setPrecioRaw(raw);
                  const n = Number(raw);
                  setPrecio(Number.isFinite(n) ? n : NaN);
                }}
                className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-sm font-semibold text-foreground focus:outline-none transition-colors ${
                  precioError
                    ? "border-amber-500 focus:border-amber-500"
                    : "border-border focus:border-primary"
                }`}
              />
              {precioError && (
                <p
                  id="precio-error"
                  className="mt-1.5 text-xs font-semibold text-amber-500"
                >
                  {precioError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="plazo-input"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Plazo: {effectivePlazo} meses
                <span className="text-muted-foreground font-normal normal-case ml-1">
                  ({selectedPlan.plazoMin}–{selectedPlan.plazoMax})
                </span>
              </label>
              <input
                id="plazo-input"
                type="range"
                min={selectedPlan.plazoMin}
                max={selectedPlan.plazoMax}
                step={6}
                value={effectivePlazo}
                onChange={(e) => setPlazo(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          {/* Aviso de validación */}
          {!isValid && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-lg border-2 border-amber-500/60 bg-amber-500/10 p-3 text-sm"
            >
              <AlertTriangle
                size={16}
                className="text-amber-500 mt-0.5 shrink-0"
              />
              <p className="text-foreground">
                {precioError ??
                  `El plazo debe estar entre ${selectedPlan.plazoMin} y ${selectedPlan.plazoMax} meses.`}{" "}
                <span className="text-muted-foreground">
                  La simulación y el mensaje no se actualizarán hasta corregir
                  estos valores.
                </span>
              </p>
            </div>
          )}

          {/* Resultado del simulador */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-background border border-border p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Inicial ({selectedPlan.inicialPct}%)
              </p>
              <p className="font-heading font-bold text-foreground mt-1">
                {isValid ? formatUSD(inicialMonto) : "—"}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 text-center border-2 ${
                isValid
                  ? "bg-primary/10 border-primary"
                  : "bg-background border-dashed border-border"
              }`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isValid ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Cuota mensual
              </p>
              <p
                className={`font-heading font-bold mt-1 ${
                  isValid ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {isValid ? formatUSD(cuotaEstimada) : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-background border border-border p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total a financiar
              </p>
              <p className="font-heading font-bold text-foreground mt-1">
                {isValid ? formatUSD(restante) : "—"}
              </p>
            </div>
          </div>

          {/* Tipo de vehículo */}
          <div className="mt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Tipo de vehículo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {vehicleTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setVehicleType(t)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    vehicleType === t
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <CopyableMessage message={waMessage} className="mt-5" />

          {isValid ? (
            <a
              href={waLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enviar consulta por WhatsApp <ArrowRight size={16} />
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Corrige el precio o el plazo para enviar la consulta"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-muted px-5 py-3 font-heading text-sm font-bold text-muted-foreground cursor-not-allowed"
            >
              Corrige los datos para enviar la consulta
            </button>
          )}

          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Cuota calculada como (precio − inicial) ÷ plazo. Estimación
            referencial sin incluir cuotas extra, intereses, IVA, IGTF ni
            gastos de nacionalización.
          </p>
        </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          * Montos referenciales de los catálogos oficiales JAC / Bel. Facilito,
          Llévatelo Fiao y Credijac Ruta 66 actualizados Ago 2026. Sujetos a
          variación según flete, seguro, IVA, IGTF y gastos de nacionalización.
          Confirma siempre con Rigoberto antes de cerrar tu plan.
        </p>
      </div>
    </section>
  );
};

export default MorePlansSection;
