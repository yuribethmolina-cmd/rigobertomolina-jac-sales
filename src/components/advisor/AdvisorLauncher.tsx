import { useLocation } from "react-router-dom";
import AdvisorFloat from "@/components/advisor/AdvisorFloat";

/** Burbuja del asesor en todo el sitio, salvo en su propia página y en el panel. */
const HIDDEN_PREFIXES = ["/asesor", "/estadisticas", "/acceso", "/tarjeta", "/moderar"];

const AdvisorLauncher = () => {
  const { pathname } = useLocation();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  return <AdvisorFloat />;
};

export default AdvisorLauncher;
