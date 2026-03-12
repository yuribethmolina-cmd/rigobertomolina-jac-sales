export const WHATSAPP_NUMBER = "58XXXXXXXXXX";
export const WHATSAPP_DISPLAY = "+58 XXX XXXXXXX";
export const EMAIL = "correo@email.com";

export const waLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const waModelMessage = (model: string) =>
  `Hola Rigoberto, me interesa el ${model} ¿puedes darme más información?`;

export interface CarModel {
  name: string;
  tagline: string;
  transmission: string;
  traction: string;
  colors?: { name: string; hex: string }[];
  price?: string;
  featured?: string;
}

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
  },
  {
    name: "NEVADO AT",
    tagline: "La misma potencia del Nevado, en automático",
    transmission: "Automática",
    traction: "4x2",
    colors: [
      { name: "Negro", hex: "#1a1a1a" },
      { name: "Blanco", hex: "#f5f5f5" },
    ],
  },
  {
    name: "ARENA SPORT MT",
    tagline: "SUV compacto, perfecto para la ciudad",
    transmission: "Manual",
    traction: "4x2",
    price: "$2.564,7",
  },
  {
    name: "ARENA SPORT AT",
    tagline: "Comodidad automática para el día a día",
    transmission: "Automática",
    traction: "4x2",
    price: "$3.236,4",
  },
  {
    name: "ARENA PRO XIP-4",
    tagline: "Tracción 4x4 para quienes van más allá",
    transmission: "Manual",
    traction: "4x4",
  },
  {
    name: "TEPUY PRO",
    tagline: "El SUV premium de JAC — potencia y tecnología",
    transmission: "Automática",
    traction: "4x4",
    price: "$5.259,0",
  },
  {
    name: "LITE 5",
    tagline: "Minivan espaciosa, ideal para familias grandes",
    transmission: "Manual",
    traction: "4x2",
  },
  {
    name: "REFINE",
    tagline: "Sedán premium con tecnología de última generación",
    transmission: "Automática",
    traction: "4x2",
  },
];

export const pickupModels: CarModel[] = [
  {
    name: "LA VENEZOLANA 4X2",
    tagline: "La pickup que trabaja tan duro como tú · Gasolina",
    transmission: "Manual",
    traction: "4x2",
  },
  {
    name: "LA VENEZOLANA 4X2 DIESEL",
    tagline: "Mayor eficiencia en combustible para trabajo pesado",
    transmission: "Manual",
    traction: "4x2",
  },
  {
    name: "LA VENEZOLANA 4X4 DIESEL",
    tagline: "Potencia diesel y tracción total sin compromiso",
    transmission: "Manual",
    traction: "4x4",
  },
  {
    name: "LA VENEZOLANA PRO 4X4",
    tagline: "La versión premium de la pickup más versátil",
    transmission: "Manual",
    traction: "4x4",
  },
  {
    name: "C-3500 4X4",
    tagline: "Robusta y confiable para las rutas más exigentes",
    transmission: "Manual",
    traction: "4x4",
  },
];

export const commercialModels = [
  { icon: "🚐", name: "SUNRAY V6", desc: "Van de carga o pasajeros" },
  { icon: "🚐", name: "M4 CARROZA", desc: "Transporte colectivo" },
  { icon: "🚛", name: "X100 FERRETERO", desc: "Carga ligera urbana" },
  { icon: "🚛", name: "URBAN FERRETERO 3 TON", desc: "Distribución urbana" },
];
