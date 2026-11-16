import { Download } from "lucide-react";
import planilla from "@/assets/planilla_solicitud_persona_natural.pdf.asset.json";
import { cn } from "@/lib/utils";

interface Props {
  modelo?: string;
  plan?: string;
  label?: string;
  className?: string;
}

/** Descarga la planilla oficial de solicitud de crédito (persona natural). */
const ApplicationFormButton = ({
  label = "Descargar planilla para llenar",
  className,
}: Props) => (
  <a
    href={planilla.url}
    download="Planilla-solicitud-credito-persona-natural.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-5 py-3 font-heading text-sm font-bold text-primary hover:bg-primary/10 transition-colors",
      className,
    )}
  >
    <Download size={16} /> {label}
  </a>
);

export default ApplicationFormButton;
