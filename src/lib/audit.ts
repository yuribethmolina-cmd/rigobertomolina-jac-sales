import { supabase } from "@/integrations/supabase/client";

export type AuditEvent = "stats_view" | "export_download";

export const logAudit = async (
  event: AuditEvent,
  details: Record<string, unknown> = {},
) => {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      user_id: user.id,
      user_email: user.email ?? null,
      event,
      details: details as never,
      page: typeof window !== "undefined" ? window.location.pathname : null,
    });
  } catch (err) {
    console.error("audit log failed", err);
  }
};
