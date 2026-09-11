import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { waLink } from "@/lib/constants";
import { trackContact } from "@/lib/track";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export interface LeadDraft {
  name: string;
  city: string;
  model_interest: string;
  use_case: string;
  purchase_method: string;
  initial_budget: string;
  monthly_budget: string;
  phone: string;
}

const empty: LeadDraft = {
  name: "",
  city: "",
  model_interest: "",
  use_case: "",
  purchase_method: "",
  initial_budget: "",
  monthly_budget: "",
  phone: "",
};

export const buildWhatsAppMessage = (lead: LeadDraft) => {
  const lines = [
    "Hola Rigoberto, vengo del asistente de tu página.",
    "",
    lead.name && `Nombre: ${lead.name}`,
    lead.city && `Ciudad: ${lead.city}`,
    lead.model_interest && `Modelo de interés: ${lead.model_interest}`,
    lead.use_case && `Uso principal: ${lead.use_case}`,
    lead.purchase_method && `Modalidad: ${lead.purchase_method}`,
    lead.initial_budget && `Inicial aproximada: ${lead.initial_budget}`,
    lead.monthly_budget && `Pago mensual aproximado: ${lead.monthly_budget}`,
    "",
    "Quisiera confirmar disponibilidad y condiciones vigentes.",
  ].filter(Boolean);
  return lines.join("\n");
};

const scoreOf = (lead: LeadDraft, clickedWhatsApp: boolean) => {
  if (lead.model_interest && (lead.monthly_budget || lead.initial_budget) && clickedWhatsApp) return "hot";
  if (lead.model_interest || lead.monthly_budget || lead.initial_budget) return "warm";
  return "cold";
};

interface Props {
  defaults?: Partial<LeadDraft>;
  summary?: string;
  onDone?: () => void;
}

const fields: { key: keyof LeadDraft; label: string; placeholder?: string }[] = [
  { key: "name", label: "Nombre" },
  { key: "phone", label: "WhatsApp", placeholder: "0414 000 0000" },
  { key: "city", label: "Ciudad" },
  { key: "model_interest", label: "Modelo de interés" },
  { key: "use_case", label: "Uso principal" },
  { key: "purchase_method", label: "Forma de compra" },
  { key: "initial_budget", label: "Inicial aproximada" },
  { key: "monthly_budget", label: "Pago mensual aproximado" },
];

const AdvisorLeadForm = ({ defaults, summary, onDone }: Props) => {
  const [lead, setLead] = useState<LeadDraft>({ ...empty, ...defaults });
  const [saving, setSaving] = useState(false);

  const save = async (clickedWhatsApp: boolean) => {
    setSaving(true);
    const { error } = await supabase.from("advisor_leads").insert({
      name: lead.name || null,
      phone: lead.phone || null,
      city: lead.city || null,
      model_interest: lead.model_interest || null,
      use_case: lead.use_case || null,
      purchase_method: lead.purchase_method || null,
      initial_budget: lead.initial_budget || null,
      monthly_budget: lead.monthly_budget || null,
      conversation_summary: summary ?? null,
      lead_score: scoreOf(lead, clickedWhatsApp),
    });
    setSaving(false);
    if (error) {
      toast({
        title: "No pude guardar tus datos",
        description: "Continúa por WhatsApp para que Rigoberto reciba tu mensaje.",
        variant: "destructive",
      });
      return false;
    }
    trackContact("lead", { model: lead.model_interest || null, source: "asesor-ia" });
    return true;
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h3 className="font-heading text-sm font-bold text-foreground">
          Deja tus datos para que Rigoberto te contacte
        </h3>
        <p className="text-xs text-muted-foreground">
          Con el nombre y el WhatsApp basta. Lo demás lo puedes dejar en blanco.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="text-xs text-muted-foreground">
            {f.label}
            <input
              value={lead[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => setLead((p) => ({ ...p, [f.key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="w-full sm:w-auto"
          disabled={saving || !lead.name.trim()}
          onClick={async () => {
            const ok = await save(true);
            if (!ok) return;
            trackContact("whatsapp", { model: lead.model_interest || null, source: "asesor-lead" });
            window.open(waLink(buildWhatsAppMessage(lead)), "_blank", "noopener,noreferrer");
            toast({ title: "Datos enviados", description: "Continúa la conversación por WhatsApp." });
            onDone?.();
          }}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Hablar con Rigoberto por WhatsApp
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          disabled={saving || !lead.name.trim()}
          onClick={async () => {
            const ok = await save(false);
            if (!ok) return;
            toast({ title: "Listo", description: "Rigoberto recibirá tus datos." });
            onDone?.();
          }}
        >
          Solo dejar mis datos
        </Button>
      </div>
    </div>
  );
};

export default AdvisorLeadForm;
