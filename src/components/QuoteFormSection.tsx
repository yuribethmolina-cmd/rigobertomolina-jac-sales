import { useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { vehicles } from "@/data/vehicles";
import { financingPlans } from "@/data/financingPlans";
import { toast } from "sonner";
import { Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/constants";
import { trackContact } from "@/lib/track";

const quoteSchema = z.object({
  fullName: z.string().trim().min(2, "Escribe tu nombre completo").max(100, "Máximo 100 caracteres"),
  phone: z.string().trim().min(7, "Ingresa un teléfono válido").max(30, "Máximo 30 caracteres")
    .regex(/^[0-9+\-\s()]+$/, "El teléfono solo puede tener números, +, - y espacios"),
  email: z.string().trim().email("Correo inválido").max(255).or(z.literal("")).optional(),
  city: z.string().trim().max(80, "Máximo 80 caracteres").or(z.literal("")).optional(),
  vehicleName: z.string().trim().min(1, "Elige un modelo").max(120),
  planName: z.string().trim().min(1, "Elige un plan").max(120),
  message: z.string().trim().max(1000, "Máximo 1000 caracteres").or(z.literal("")).optional(),
});

type QuoteForm = z.infer<typeof quoteSchema>;

const EMPTY: QuoteForm = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  vehicleName: "",
  planName: "",
  message: "",
};

const inputCls =
  "w-full rounded-lg border-2 border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors";

const QuoteFormSection = () => {
  const [form, setForm] = useState<QuoteForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteForm, string>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const modelOptions = useMemo(
    () => [...vehicles].sort((a, b) => a.displayName.localeCompare(b.displayName, "es")),
    []
  );
  const planOptions = useMemo(
    () => financingPlans.map((p) => p.name),
    []
  );

  const set = (key: keyof QuoteForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = quoteSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof QuoteForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof QuoteForm;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    const { data: inserted, error } = await supabase.from("quote_requests").insert({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      city: parsed.data.city || null,
      vehicle_name: parsed.data.vehicleName,
      plan_name: parsed.data.planName,
      message: parsed.data.message || null,
    }).select("id").single();
    setSending(false);

    if (error || !inserted) {
      console.error("quote_requests insert failed:", error?.message);
      toast.error("No se pudo enviar la solicitud. Intenta de nuevo o escribe por WhatsApp.");
      return;
    }
    supabase.functions.invoke("send-quote-email", { body: { quoteId: inserted.id } })
      .catch((e) => console.error("quote email failed:", e));
    setSent(true);
    toast.success("Solicitud enviada. Rigoberto te contactará pronto.");
  };

  const err = (k: keyof QuoteForm) =>
    errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null;

  return (
    <section id="cotizar" className="section-container py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center">
          Solicita tu cotización
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Déjame tus datos, el modelo y el plan que te interesa, y te respondo personalmente con la cotización detallada.
        </p>

        {sent ? (
          <div className="card-glow mt-10 p-8 text-center">
            <CheckCircle2 size={48} className="mx-auto text-primary" />
            <h3 className="font-heading text-xl font-bold mt-4">Solicitud recibida</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Gracias, {form.fullName.split(" ")[0]}. Revisaré tu solicitud de {form.vehicleName} ({form.planName}) y te contactaré al {form.phone}.
            </p>
            <button
              type="button"
              onClick={() => { setForm(EMPTY); setSent(false); }}
              className="mt-6 text-sm font-heading font-bold text-primary hover:underline"
            >
              Enviar otra solicitud
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-glow mt-10 p-6 md:p-8 space-y-4" noValidate>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="q-name" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Nombre completo *</label>
                <input id="q-name" className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Ej. María Pérez" maxLength={100} autoComplete="name" />
                {err("fullName")}
              </div>
              <div>
                <label htmlFor="q-phone" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Teléfono / WhatsApp *</label>
                <input id="q-phone" type="tel" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Ej. +58 412 1234567" maxLength={30} autoComplete="tel" />
                {err("phone")}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="q-email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Correo (opcional)</label>
                <input id="q-email" type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="tucorreo@ejemplo.com" maxLength={255} autoComplete="email" />
                {err("email")}
              </div>
              <div>
                <label htmlFor="q-city" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Ciudad (opcional)</label>
                <input id="q-city" className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Ej. Caracas" maxLength={80} />
                {err("city")}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="q-model" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Modelo *</label>
                <select id="q-model" className={inputCls} value={form.vehicleName} onChange={(e) => set("vehicleName", e.target.value)}>
                  <option value="">Elige un modelo</option>
                  {modelOptions.map((v) => (
                    <option key={v.id} value={v.displayName}>{v.displayName}</option>
                  ))}
                </select>
                {err("vehicleName")}
              </div>
              <div>
                <label htmlFor="q-plan" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Plan de pago *</label>
                <select id="q-plan" className={inputCls} value={form.planName} onChange={(e) => set("planName", e.target.value)}>
                  <option value="">Elige un plan</option>
                  {planOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="No estoy seguro, asesórame">No estoy seguro, asesórame</option>
                </select>
                {err("planName")}
              </div>
            </div>

            <div>
              <label htmlFor="q-message" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Mensaje (opcional)</label>
              <textarea id="q-message" className={`${inputCls} min-h-24 resize-y`} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Cuéntame si tienes inicial disponible, si das un usado, etc." maxLength={1000} />
              {err("message")}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {sending ? "Enviando..." : "Enviar solicitud de cotización"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Tus datos solo se usan para responderte esta cotización.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default QuoteFormSection;
