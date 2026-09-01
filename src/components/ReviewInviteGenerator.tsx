import { useMemo, useState } from "react";
import { vehicles } from "@/data/vehicles";
import { financingPlans } from "@/data/financingPlans";
import { toast } from "sonner";
import { MessageCircle, Copy } from "lucide-react";

const REVIEW_BASE_URL = "https://rigobertomolina.com/resena";

/** Genera un enlace de WhatsApp con un mensaje que incluye el link de reseña
 *  con vehículo y plan preseleccionados. */
const ReviewInviteGenerator = () => {
  const [vehicleId, setVehicleId] = useState("");
  const [planId, setPlanId] = useState("");

  const reviewUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (vehicleId) params.set("modelo", vehicleId);
    if (planId) params.set("plan", planId);
    const qs = params.toString();
    return qs ? `${REVIEW_BASE_URL}?${qs}` : REVIEW_BASE_URL;
  }, [vehicleId, planId]);

  const waUrl = useMemo(() => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const plan = financingPlans.find((p) => p.id === planId);
    const lines = [
      "¡Gracias por tu compra! Me ayudaría mucho conocer tu experiencia.",
      vehicle ? `Tu modelo: ${vehicle.displayName}` : null,
      plan ? `Tu plan: ${plan.name}` : null,
      `Deja tu reseña aquí (toma menos de un minuto): ${reviewUrl}`,
    ].filter(Boolean);
    return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [vehicleId, planId, reviewUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(reviewUrl);
    toast.success("Link de reseña copiado al portapapeles");
  };

  return (
    <div className="mb-4 rounded-xl border border-primary/25 bg-card/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
        Invitación personalizada por WhatsApp
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          aria-label="Vehículo"
        >
          <option value="">Vehículo (opcional)</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.displayName}
            </option>
          ))}
        </select>
        <select
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          aria-label="Plan de financiamiento"
        >
          <option value="">Plan (opcional)</option>
          {financingPlans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 break-all text-xs text-muted-foreground">{reviewUrl}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <MessageCircle size={16} /> Enviar por WhatsApp
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
        >
          <Copy size={16} /> Copiar link
        </button>
      </div>
    </div>
  );
};

export default ReviewInviteGenerator;
