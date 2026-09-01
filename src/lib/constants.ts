export const WHATSAPP_NUMBER = "584143200146";
export const WHATSAPP_DISPLAY = "+58 414 320 0146";
export const EMAIL = "rigobertomolina6@gmail.com";
export const INSTAGRAM = "https://www.instagram.com/ventasjacvzla/";
export const INSTAGRAM_HANDLE = "@ventasjacvzla";

export const waLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const waModelMessage = (model: string) =>
  `Hola Rigoberto, me interesa el ${model}. ¿Puedes darme más información?`;

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
  priceDirecta?: string;
  priceFacil?: string;
  featured?: string;
  specs?: CarSpecs;
  image?: string;
  referentialImage?: boolean;
}

/* ══════════════════════════════════════════
   Comerciales Livianos (PRIORIDAD)
   ══════════════════════════════════════════ */
