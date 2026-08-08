import { supabase } from "@/integrations/supabase/client";

export type ContactAction = "whatsapp" | "copy" | "pdf" | "email" | "call";

interface TrackPayload {
  model?: string | null;
  plan?: string | null;
  source?: string | null;
}

/** Registra un intento de contacto. Nunca bloquea ni rompe la UI. */
export const trackContact = (action: ContactAction, payload: TrackPayload = {}) => {
  try {
    supabase
      .from("contact_events")
      .insert({
        action,
        model: payload.model ?? null,
        plan: payload.plan ?? null,
        source: payload.source ?? null,
        page: typeof window !== "undefined" ? window.location.pathname : null,
      })
      .then(({ error }) => {
        if (error) console.error("trackContact failed:", error.message);
      });
  } catch {
    /* ignorar: el seguimiento nunca debe afectar al usuario */
  }
};
