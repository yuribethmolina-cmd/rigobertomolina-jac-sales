import { supabase } from "@/integrations/supabase/client";

export interface AdvisorLeadInput {
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  model_interest?: string | null;
  use_case?: string | null;
  purchase_method?: string | null;
  initial_budget?: string | null;
  monthly_budget?: string | null;
  conversation_summary?: string | null;
  lead_score: "hot" | "warm" | "cold";
}

const clip = (v: string | null | undefined, max: number) => (v ? v.slice(0, max) : null);

/** Guarda un lead del asesor en la bandeja y avisa a Rigoberto por correo. */
export const saveAdvisorLead = async (lead: AdvisorLeadInput): Promise<boolean> => {
  const id = crypto.randomUUID();
  const { error } = await supabase.from("advisor_leads").insert({
    id,
    name: clip(lead.name, 200),
    phone: clip(lead.phone, 50),
    city: clip(lead.city, 120),
    model_interest: clip(lead.model_interest, 200),
    use_case: clip(lead.use_case, 500),
    purchase_method: clip(lead.purchase_method, 200),
    initial_budget: clip(lead.initial_budget, 100),
    monthly_budget: clip(lead.monthly_budget, 100),
    conversation_summary: clip(lead.conversation_summary, 5000),
    lead_score: lead.lead_score,
  });
  if (error) {
    console.error("saveAdvisorLead failed:", error.message);
    return false;
  }
  supabase.functions
    .invoke("notify-advisor-lead", { body: { leadId: id } })
    .then(({ error: e }) => e && console.error("notify-advisor-lead failed:", e.message));
  return true;
};
