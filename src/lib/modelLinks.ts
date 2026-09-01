/* Utilidades para generar enlaces compartibles por modelo. */

export const slugify = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/×|x(?=\d)/gi, "x")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const SITE_URL = "https://rigobertomolina.com";

export const modelPath = (name: string) => `/modelo/${slugify(name)}`;

export const modelUrl = (name: string) => {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : SITE_URL;
  return `${origin}${modelPath(name)}`;
};

export const shareModelMessage = (name: string, url: string) =>
  `Información del ${name} (precios y formas de pago): ${url}`;

/** Normaliza nombres para emparejar catálogos distintos. */
export const normalizeName = (name: string) =>
  slugify(name)
    .replace(/-/g, " ")
    .replace(/\bmanual\b/g, "mt")
    .replace(/\bautomatico\b/g, "at")
    .replace(/\ba gasolina\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
