import { useState } from "react";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { waLink, WHATSAPP_DISPLAY, EMAIL, INSTAGRAM, INSTAGRAM_HANDLE } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2, CheckCircle2, MessageCircle, Mail, Instagram } from "lucide-react";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Escribe tu nombre completo").max(100, "Máximo 100 caracteres"),
  phone: z.string().trim().max(30, "Máximo 30 caracteres")
    .regex(/^[0-9+\-\s()]*$/, "El teléfono solo puede tener números, +, - y espacios")
    .or(z.literal("")).optional(),
  email: z.string().trim().email("Correo inválido").max(255).or(z.literal("")).optional(),
  message: z.string().trim().min(2, "Escribe tu mensaje").max(1000, "Máximo 1000 caracteres"),
}).refine((d) => (d.phone && d.phone.length >= 7) || (d.email && d.email.length > 0), {
  message: "Déjame al menos un teléfono o un correo para responderte",
  path: ["phone"],
});

type ContactForm = z.infer<typeof contactSchema>;

const EMPTY: ContactForm = { fullName: "", phone: "", email: "", message: "" };

const inputCls =
  "w-full rounded-lg border-2 border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors";

const Contact = () => {
  const [form, setForm] = useState<ContactForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof ContactForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
    });
    setSending(false);

    if (error) {
      console.error("contact_messages insert failed:", error.message);
      toast.error("No se pudo enviar el mensaje. Intenta de nuevo o escribe por WhatsApp.");
      return;
    }
    setSent(true);
    toast.success("Mensaje enviado. Rigoberto te contactará pronto.");
  };

  const err = (k: keyof ContactForm) =>
    errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null;

  return (
    <>
      <Helmet>
        <title>Contacto · Rigoberto Molina — JAC Caracas</title>
        <meta name="description" content="Escríbeme directamente: consultas sobre modelos JAC, planes de pago y disponibilidad. Respondo personalmente por WhatsApp, correo o este formulario." />
        <link rel="canonical" href="https://rigobertomolina.com/contacto" />
        <meta property="og:title" content="Contacto · Rigoberto Molina — JAC Caracas" />
        <meta property="og:url" content="https://rigobertomolina.com/contacto" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="section-container py-16 md:py-24 min-h-screen">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <div className="max-w-2xl mx-auto mt-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-center">Hablemos</h1>
          <p className="mt-3 text-center text-muted-foreground">
            ¿Dudas sobre un modelo, un plan de pago o la disponibilidad? Déjame tu mensaje y te respondo personalmente.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            <a href={waLink()} target="_blank" rel="noopener noreferrer"
              className="card-glow p-4 text-center hover:border-primary transition-colors">
              <MessageCircle size={20} className="mx-auto text-primary" />
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">WhatsApp</p>
              <p className="text-sm font-heading font-bold mt-0.5">{WHATSAPP_DISPLAY}</p>
            </a>
            <a href={`mailto:${EMAIL}`}
              className="card-glow p-4 text-center hover:border-primary transition-colors">
              <Mail size={20} className="mx-auto text-primary" />
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo</p>
              <p className="text-sm font-heading font-bold mt-0.5 break-all">{EMAIL}</p>
            </a>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
              className="card-glow p-4 text-center hover:border-primary transition-colors">
              <Instagram size={20} className="mx-auto text-primary" />
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Instagram</p>
              <p className="text-sm font-heading font-bold mt-0.5">{INSTAGRAM_HANDLE}</p>
            </a>
          </div>

          {sent ? (
            <div className="card-glow mt-10 p-8 text-center">
              <CheckCircle2 size={48} className="mx-auto text-primary" />
              <h2 className="font-heading text-xl font-bold mt-4">Mensaje recibido</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Gracias, {form.fullName.split(" ")[0]}. Te responderé lo antes posible.
              </p>
              <button
                type="button"
                onClick={() => { setForm(EMPTY); setSent(false); }}
                className="mt-6 text-sm font-heading font-bold text-primary hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card-glow mt-10 p-6 md:p-8 space-y-4" noValidate>
              <div>
                <label htmlFor="c-name" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Nombre completo *</label>
                <input id="c-name" className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Ej. María Pérez" maxLength={100} autoComplete="name" />
                {err("fullName")}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="c-phone" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Teléfono / WhatsApp</label>
                  <input id="c-phone" type="tel" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Ej. +58 412 1234567" maxLength={30} autoComplete="tel" />
                  {err("phone")}
                </div>
                <div>
                  <label htmlFor="c-email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Correo</label>
                  <input id="c-email" type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="tucorreo@ejemplo.com" maxLength={255} autoComplete="email" />
                  {err("email")}
                </div>
              </div>

              <div>
                <label htmlFor="c-message" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Mensaje *</label>
                <textarea id="c-message" className={`${inputCls} min-h-32 resize-y`} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="¿En qué puedo ayudarte?" maxLength={1000} />
                {err("message")}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {sending ? "Enviando..." : "Enviar mensaje"}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                Tus datos solo se usan para responderte este mensaje.
              </p>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default Contact;
