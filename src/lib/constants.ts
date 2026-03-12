export const WHATSAPP_NUMBER = "58XXXXXXXXXX";
export const WHATSAPP_DISPLAY = "+58 XXX XXXXXXX";
export const EMAIL = "correo@email.com";

export const waLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const waModelMessage = (model: string) =>
  `Hola Rigoberto, me interesa el ${model} ¿puedes darme más información?`;

/* ── Specs interface ── */
export interface CarSpecs {
  motor?: string;
  potencia?: string;
  torque?: string;
  combustible?: string;
  transmisionDetalle?: string;
  suspension?: string[];
  frenos?: string;
  dimensiones?: string;
  pesoNeto?: string;
  capacidadCarga?: string;
  tanque?: string;
  seguridad?: string[];
  tecnologia?: string[];
  equipamiento?: string[];
}

/* ── Model interface ── */
export interface CarModel {
  name: string;
  tagline: string;
  transmission: string;
  traction: string;
  colors?: { name: string; hex: string }[];
  price?: string;
  featured?: string;
  specs?: CarSpecs;
  image?: string;
}

/* ══════════════════════════════════════════
   SUVs
   ══════════════════════════════════════════ */
export const suvModels: CarModel[] = [
  {
    name: "NEVADO MT",
    tagline: "El SUV familiar más completo del catálogo",
    transmission: "Manual",
    traction: "4x2",
    colors: [
      { name: "Negro", hex: "#1a1a1a" },
      { name: "Blanco", hex: "#f5f5f5" },
      { name: "Rojo", hex: "#dc2626" },
      { name: "Azul", hex: "#2563eb" },
      { name: "Gris", hex: "#9ca3af" },
    ],
    price: "$3.018,6",
    featured: "MÁS CONSULTADO",
    specs: {
      motor: "1.6 L DVT Euro V",
      potencia: "118 Hp @ 6.000 RPM",
      torque: "150 Nm @ 4.000 RPM",
      combustible: "Gasolina",
      transmisionDetalle: "Manual MF20V MT — 6 velocidades",
      suspension: ["Delantera: McPherson independiente", "Trasera: Semi-independiente, barra de torsión"],
      frenos: "Disco ventilado (del.) / Tambor (tras.)",
      dimensiones: "4.410 x 1.800 x 1.660 mm",
      tanque: "55 L",
      seguridad: ["2 airbags frontales", "ABS + EBD", "Cinturones 3 puntos", "Anclajes ISOFIX", "Control de estabilidad ESP"],
      tecnologia: ["Pantalla táctil 10\"", "Cámara de reversa", "Bluetooth + USB", "Control crucero"],
      equipamiento: ["Rines de aleación 17\"", "Luces LED DRL", "Techo corredizo (según versión)", "Aire acondicionado"],
    },
  },
  {
    name: "NEVADO AT",
    tagline: "La misma potencia del Nevado, en automático",
    transmission: "Automática",
    traction: "4x2",
    colors: [
      { name: "Negro", hex: "#1a1a1a" },
      { name: "Blanco", hex: "#f5f5f5" },
      { name: "Rojo", hex: "#dc2626" },
      { name: "Azul", hex: "#2563eb" },
      { name: "Gris", hex: "#9ca3af" },
    ],
    price: "$3.715,2",
    specs: {
      motor: "1.6 L DVT Euro V",
      potencia: "118 Hp @ 6.000 RPM",
      torque: "150 Nm @ 4.000 RPM",
      combustible: "Gasolina",
      transmisionDetalle: "Automática CVT",
      suspension: ["Delantera: McPherson independiente", "Trasera: Semi-independiente, barra de torsión"],
      frenos: "Disco ventilado (del.) / Tambor (tras.)",
      dimensiones: "4.410 x 1.800 x 1.660 mm",
      tanque: "55 L",
      seguridad: ["2 airbags frontales", "ABS + EBD", "ESP", "Anclajes ISOFIX"],
      tecnologia: ["Pantalla táctil 10\"", "Cámara de reversa", "Bluetooth + USB", "Control crucero"],
    },
  },
  {
    name: "ARENA SPORT MT",
    tagline: "SUV compacto, perfecto para la ciudad",
    transmission: "Manual",
    traction: "4x2",
    price: "$2.383,2",
    colors: [
      { name: "Negro", hex: "#1a1a1a" },
      { name: "Blanco", hex: "#f5f5f5" },
      { name: "Rojo", hex: "#dc2626" },
      { name: "Gris", hex: "#9ca3af" },
    ],
    specs: {
      motor: "1.5 L Euro V",
      potencia: "113 Hp",
      torque: "141 Nm",
      combustible: "Gasolina",
      transmisionDetalle: "Manual — 5 velocidades",
      dimensiones: "4.135 x 1.740 x 1.625 mm",
      tanque: "45 L",
      seguridad: ["2 airbags frontales", "ABS + EBD", "Anclajes ISOFIX"],
      tecnologia: ["Pantalla táctil 8\"", "Cámara de reversa", "Bluetooth"],
    },
  },
  {
    name: "ARENA SPORT AT",
    tagline: "Comodidad automática para el día a día",
    transmission: "Automática",
    traction: "4x2",
    price: "$2.586,2",
    colors: [
      { name: "Negro", hex: "#1a1a1a" },
      { name: "Blanco", hex: "#f5f5f5" },
      { name: "Rojo", hex: "#dc2626" },
      { name: "Gris", hex: "#9ca3af" },
    ],
    specs: {
      motor: "1.5 L Euro V",
      potencia: "113 Hp",
      torque: "141 Nm",
      combustible: "Gasolina",
      transmisionDetalle: "Automática CVT",
      dimensiones: "4.135 x 1.740 x 1.625 mm",
      tanque: "45 L",
      seguridad: ["2 airbags frontales", "ABS + EBD", "Anclajes ISOFIX"],
      tecnologia: ["Pantalla táctil 8\"", "Cámara de reversa", "Bluetooth"],
    },
  },
  {
    name: "ARENA PRO XIP-4",
    tagline: "Tracción 4x4 para quienes van más allá",
    transmission: "Manual",
    traction: "4x4",
    price: "$2.824,7",
    colors: [
      { name: "Negro", hex: "#1a1a1a" },
      { name: "Blanco", hex: "#f5f5f5" },
      { name: "Gris", hex: "#9ca3af" },
    ],
    specs: {
      motor: "1.5 L Euro V",
      potencia: "113 Hp",
      torque: "141 Nm",
      combustible: "Gasolina",
      transmisionDetalle: "Manual — 5 velocidades",
      dimensiones: "4.135 x 1.740 x 1.625 mm",
      seguridad: ["2 airbags frontales", "ABS + EBD", "ESP"],
      tecnologia: ["Pantalla táctil 8\"", "Cámara de reversa", "Bluetooth"],
    },
  },
  {
    name: "LITE 5",
    tagline: "Minivan espaciosa, ideal para familias grandes",
    transmission: "Manual",
    traction: "4x2",
    specs: {
      motor: "1.5 L Euro V",
      combustible: "Gasolina",
      transmisionDetalle: "Manual — 5 velocidades",
      seguridad: ["ABS + EBD", "Cinturones 3 puntos"],
    },
  },
  {
    name: "REFINE",
    tagline: "Sedán premium con tecnología de última generación",
    transmission: "Automática",
    traction: "4x2",
    specs: {
      motor: "1.5 L Turbo",
      combustible: "Gasolina",
      transmisionDetalle: "Automática CVT",
      tecnologia: ["Pantalla táctil", "Cámara de reversa", "Sensores de estacionamiento"],
    },
  },
];

/* ══════════════════════════════════════════
   Pickups / Camionetas
   ══════════════════════════════════════════ */
export const pickupModels: CarModel[] = [
  {
    name: "LA VENEZOLANA 4X2",
    tagline: "La pickup que trabaja tan duro como tú · Gasolina",
    transmission: "Manual",
    traction: "4x2",
    price: "$2.972,3",
    specs: {
      motor: "2.0 L Euro V",
      potencia: "136 Hp",
      torque: "200 Nm",
      combustible: "Gasolina",
      transmisionDetalle: "Manual — 5 velocidades",
      capacidadCarga: "1.045 kg",
      seguridad: ["2 airbags frontales", "ABS + EBD"],
      tecnologia: ["Radio multimedia", "Cámara de reversa"],
    },
  },
  {
    name: "LA VENEZOLANA 4X2 DIESEL",
    tagline: "Mayor eficiencia en combustible para trabajo pesado",
    transmission: "Manual",
    traction: "4x2",
    price: "$3.214,6",
    specs: {
      motor: "2.8 L Turbo Diésel",
      potencia: "116 Hp",
      torque: "280 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 5 velocidades",
      capacidadCarga: "1.045 kg",
      seguridad: ["2 airbags frontales", "ABS + EBD"],
    },
  },
  {
    name: "LA VENEZOLANA 4X4 DIESEL",
    tagline: "Potencia diesel y tracción total sin compromiso",
    transmission: "Manual",
    traction: "4x4",
    price: "$3.613,3",
    specs: {
      motor: "2.8 L Turbo Diésel",
      potencia: "116 Hp",
      torque: "280 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 5 velocidades",
      capacidadCarga: "1.000 kg",
      seguridad: ["2 airbags frontales", "ABS + EBD"],
    },
  },
  {
    name: "LA VENEZOLANA PRO 4X4",
    tagline: "La versión premium de la pickup más versátil",
    transmission: "Manual",
    traction: "4x4",
    price: "$4.165,2",
    specs: {
      motor: "2.8 L Turbo Diésel",
      potencia: "116 Hp",
      torque: "280 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 5 velocidades",
      capacidadCarga: "1.000 kg",
      seguridad: ["2 airbags frontales", "ABS + EBD", "ESP"],
      tecnologia: ["Pantalla táctil 10\"", "Cámara de reversa", "Sensores de estacionamiento"],
      equipamiento: ["Rines de aleación", "Barras laterales", "Barra antivuelco"],
    },
  },
  {
    name: "DOBLE CABINA",
    tagline: "Pickup doble cabina con versatilidad para todo",
    transmission: "Manual",
    traction: "4x2",
    price: "$3.713,3",
    specs: {
      motor: "2.8 L Turbo Diésel",
      potencia: "116 Hp",
      torque: "280 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 5 velocidades",
      seguridad: ["2 airbags frontales", "ABS + EBD"],
    },
  },
  {
    name: "C-3500 4X4",
    tagline: "Robusta y confiable para las rutas más exigentes",
    transmission: "Manual",
    traction: "4x4",
    price: "$4.709,3",
    specs: {
      motor: "2.8 L Turbo Diésel",
      potencia: "116 Hp",
      torque: "280 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 5 velocidades",
      seguridad: ["ABS + EBD"],
    },
  },
  {
    name: "AVENTURA",
    tagline: "El SUV premium de JAC — potencia y tecnología",
    transmission: "Automática",
    traction: "4x4",
    price: "$5.259,0",
    colors: [
      { name: "Negro", hex: "#1a1a1a" },
      { name: "Blanco", hex: "#f5f5f5" },
      { name: "Gris", hex: "#9ca3af" },
    ],
    specs: {
      motor: "2.0 L Turbo",
      potencia: "190 Hp",
      torque: "320 Nm",
      combustible: "Gasolina",
      transmisionDetalle: "Automática — 6 velocidades",
      seguridad: ["6 airbags", "ABS + EBD + ESP", "Control de tracción", "Asistente de arranque en pendiente"],
      tecnologia: ["Pantalla táctil 12\"", "Cámara 360°", "Sensores delanteros y traseros", "Cargador inalámbrico"],
      equipamiento: ["Techo panorámico", "Asientos en cuero", "Rines de aleación 19\""],
    },
  },
  {
    name: "AVENTURA PRO",
    tagline: "Máxima potencia y lujo — lo mejor de JAC",
    transmission: "Automática",
    traction: "4x4",
    price: "$6.392,4",
    colors: [
      { name: "Negro", hex: "#1a1a1a" },
      { name: "Blanco", hex: "#f5f5f5" },
    ],
    specs: {
      motor: "2.0 L Turbo",
      potencia: "220 Hp",
      torque: "350 Nm",
      combustible: "Gasolina",
      transmisionDetalle: "Automática — 8 velocidades",
      seguridad: ["6 airbags", "ABS + EBD + ESP", "Frenado autónomo de emergencia", "Alerta de cambio de carril"],
      tecnologia: ["Pantalla táctil 12.3\"", "Cámara 360°", "Head-up display", "Cargador inalámbrico", "Apple CarPlay / Android Auto"],
      equipamiento: ["Techo panorámico", "Asientos en cuero ventilados", "Rines de aleación 20\"", "Suspensión adaptativa"],
    },
  },
];

/* ══════════════════════════════════════════
   Comerciales Livianos
   ══════════════════════════════════════════ */
export const commercialModels: CarModel[] = [
  {
    name: "X100 FERRETERO",
    tagline: "Carga ligera urbana — ágil y económico",
    transmission: "Manual",
    traction: "4x2",
    price: "$2.564,7",
    image: "x100-ferretero",
    specs: {
      motor: "1.3 L Euro V",
      potencia: "87 Hp",
      combustible: "Gasolina",
      transmisionDetalle: "Manual — 5 velocidades",
      capacidadCarga: "760 kg",
      seguridad: ["ABS", "Cinturones 3 puntos"],
    },
  },
  {
    name: "URBAN FERRETERO 3 TON",
    tagline: "Distribución urbana — capacidad de 3 toneladas",
    transmission: "Manual",
    traction: "4x2",
    price: "$3.395,2",
    image: "urban-ferretero-3ton",
    specs: {
      motor: "2.8 L Turbo Diésel",
      potencia: "116 Hp",
      torque: "280 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 5 velocidades",
      capacidadCarga: "3.000 kg",
      seguridad: ["ABS", "Cinturones 3 puntos"],
    },
  },
  {
    name: "URBAN CHASIS LARGO 3 TON",
    tagline: "Chasis largo para carrocerías especiales",
    transmission: "Manual",
    traction: "4x2",
    price: "$3.236,4",
    image: "urban-chasis-largo-3ton",
    specs: {
      motor: "2.8 L Turbo Diésel",
      potencia: "116 Hp",
      torque: "280 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 5 velocidades",
      capacidadCarga: "3.000 kg",
    },
  },
  {
    name: "SUNRAY V6",
    tagline: "Van de carga o pasajeros — versatilidad total",
    transmission: "Manual",
    traction: "4x2",
    specs: {
      motor: "2.8 L Turbo Diésel",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 5 velocidades",
    },
  },
  {
    name: "M4 CARROZA",
    tagline: "Transporte colectivo — hasta 16 pasajeros",
    transmission: "Manual",
    traction: "4x2",
    specs: {
      combustible: "Diésel",
    },
  },
];

/* ══════════════════════════════════════════
   Camiones
   ══════════════════════════════════════════ */
export const truckModels: CarModel[] = [
  {
    name: "6T CHASIS 6 TON",
    tagline: "Camión mediano para carga de 6 toneladas",
    transmission: "Manual",
    traction: "4x2",
    price: "$4.473,1",
    specs: {
      motor: "3.8 L Turbo Diésel",
      potencia: "156 Hp",
      torque: "500 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 6 velocidades",
      capacidadCarga: "6.000 kg",
      seguridad: ["ABS", "Cinturones 3 puntos"],
    },
  },
  {
    name: "6T FERRETERO 6 TON",
    tagline: "Camión ferretero con caja de 6 toneladas",
    transmission: "Manual",
    traction: "4x2",
    price: "$4.671,3",
    specs: {
      motor: "3.8 L Turbo Diésel",
      potencia: "156 Hp",
      torque: "500 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 6 velocidades",
      capacidadCarga: "6.000 kg",
    },
  },
  {
    name: "BÚFALO 12 TON",
    tagline: "Camión pesado — 12 toneladas de capacidad",
    transmission: "Manual",
    traction: "4x2",
    price: "$7.322,6",
    specs: {
      motor: "6.7 L Turbo Diésel",
      potencia: "220 Hp",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 6 velocidades",
      capacidadCarga: "12.000 kg",
    },
  },
  {
    name: "BÚFALO XL 13 TON",
    tagline: "Mayor capacidad para operaciones exigentes",
    transmission: "Manual",
    traction: "4x2",
    price: "$7.850,3",
    specs: {
      motor: "6.7 L Turbo Diésel",
      potencia: "220 Hp",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 6 velocidades",
      capacidadCarga: "13.000 kg",
    },
  },
  {
    name: "LEYENDA 20 TON",
    tagline: "Camión de alto tonelaje para transporte pesado",
    transmission: "Manual",
    traction: "4x2",
    price: "$10.223,2",
    specs: {
      motor: "7.8 L Turbo Diésel",
      potencia: "300 Hp",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 9 velocidades",
      capacidadCarga: "20.000 kg",
    },
  },
  {
    name: "CAVALINO 22 TON",
    tagline: "Tracto-camión para remolques de 22 toneladas",
    transmission: "Manual",
    traction: "4x2",
    price: "$7.106,4",
    specs: {
      motor: "7.8 L Turbo Diésel",
      potencia: "300 Hp",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 9 velocidades",
      capacidadCarga: "22.000 kg",
    },
  },
  {
    name: "CHUTO 400HP 40 TON",
    tagline: "Tracto-camión pesado — 400 HP y 40 toneladas",
    transmission: "Manual",
    traction: "6x4",
    price: "$9.312,5",
    specs: {
      motor: "11.8 L Turbo Diésel",
      potencia: "400 Hp",
      torque: "1.900 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 12 velocidades",
      capacidadCarga: "40.000 kg",
    },
  },
  {
    name: "K5 CHUTO 430HP 45 TON",
    tagline: "El más potente del catálogo — 430 HP, 45 toneladas",
    transmission: "Manual",
    traction: "6x4",
    price: "$11.209,9",
    specs: {
      motor: "12.0 L Turbo Diésel",
      potencia: "430 Hp",
      torque: "2.100 Nm",
      combustible: "Diésel",
      transmisionDetalle: "Manual — 12 velocidades",
      capacidadCarga: "45.000 kg",
    },
  },
];
