import { Download } from "lucide-react";
import { generateApplicationFormPdf } from "@/lib/applicationFormPdf";
import { cn } from "@/lib/utils";

interface Props {
  modelo?: string;
  plan?: string;
  label?: string;
  className?: string;
}

/** Descarga la planilla imprimible que el cliente llena y envía con sus recaudos. */
const ApplicationFormButton = ({
  modelo,
  plan,
  label = "Descargar planilla para llenar",
  className,
}: Props) => (
  <button
    type="button"
    onClick={() => generateApplicationFormPdf({ modelo, plan })}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-5 py-3 font-heading text-sm font-bold text-primary hover:bg-primary/10 transition-colors",
      className,
    )}
  >
    <Download size={16} /> {label}
  </button>
);

export default ApplicationFormButton;
