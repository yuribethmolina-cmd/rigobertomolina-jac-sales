import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  FileUp,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { waLink } from "@/lib/constants";
import { vehicles } from "@/data/vehicles";
import {
  financingPlans,
  PENDING_REQUIREMENTS_NOTE,
  REQUIREMENTS_NOTE,
  requirementsForPlan,
  requirementsStatusForPlan,
} from "@/data/financingPlans";
import FooterSection from "@/components/FooterSection";

const MAX_FILE_MB = 10;
const ACCEPT = "image/*,application/pdf";

const schema = z.object({
  fullName: z.string().trim().min(2, "Escribe tu nombre completo").max(100),
  idNumber: z.string().trim().min(5, "Escribe tu cédula o RIF").max(30),
  phone: z
    .string()
    .trim()
    .min(7, "Ingresa un teléfono válido")
    .max(30)
    .regex(/^[0-9+\-\s()]+$/, "El teléfono solo puede tener números, +, - y espacios"),
  email: z.string().trim().email("Correo inválido").max(255),
  occupation: z.string().trim().max(120).or(z.literal("")).optional(),
  monthlyIncome: z.string().trim().max(60).or(z.literal("")).optional(),
  vehicleName: z.string().trim().max(120).or(z.literal("")).optional(),
  planName: z.string().trim().min(1, "Elige el plan que te interesa").max(120),
  message: z.string().trim().max(1000, "Máximo 1000 caracteres").or(z.literal("")).optional(),
});

type Form = z.infer<typeof schema>;

const EMPTY: Form = {
  fullName: "",
  idNumber: "",
  phone: "",
  email: "",
  occupation: "",
  monthlyIncome: "",
  vehicleName: "",
  planName: "",
  message: "",
};

const inputCls =
  "w-full rounded-lg border-2 border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2";

const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-80);

const EnviarDocumentos = () => {
  const [params] = useSearchParams();
  const [form, setForm] = useState<Form>({
    ...EMPTY,
    planName: financingPlans.find((p) => p.id === params.get("plan"))?.name ?? "",
    vehicleName: params.get("modelo") ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const plan = useMemo(
    () => financingPlans.find((p) => p.name === form.planName),
    [form.planName]
  );
  const requirements = useMemo(
    () => (plan ? requirementsForPlan(plan.id) : []),
    [plan]
  );
  const pending = plan ? requirementsStatusForPlan(plan.id) === "Por confirmar" : false;
  const docSlots = requirements.length ? requirements : ["Documentos de respaldo"];

  const modelOptions = useMemo(
    () => [...vehicles].sort((a, b) => a.displayName.localeCompare(b.displayName, "es")),
    []
  );

  const set = (key: keyof Form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const addFiles = (slot: string, list: FileList | null) => {
    if (!list?.length) return;
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" supera los ${MAX_FILE_MB} MB`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length) {
      setFiles((f) => ({ ...f, [slot]: [...(f[slot] ?? []), ...accepted] }));
    }
  };

  const removeFile = (slot: string, index: number) =>
    setFiles((f) => ({ ...f, [slot]: (f[slot] ?? []).filter((_, i) => i !== index) }));

  const totalFiles = Object.values(files).reduce((n, arr) => n + arr.length, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof Form, string>> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof Form] = issue.message;
      }
      setErrors(next);
      toast.error("Revisa los datos del formulario");
      return;
    }
    if (totalFiles === 0) {
      toast.error("Adjunta al menos un documento");
      return;
    }

    setSending(true);
    const applicationId = crypto.randomUUID();
    const uploaded: { label: string; path: string; name: string }[] = [];

    try {
      for (const [slot, list] of Object.entries(files)) {
        for (const file of list) {
          const path = `${applicationId}/${Date.now()}-${safeName(file.name)}`;
          const { error } = await supabase.storage
            .from("credit-documents")
            .upload(path, file, { contentType: file.type || "application/octet-stream" });
          if (error) throw error;
          uploaded.push({ label: slot, path, name: file.name });
        }
      }

      const data = parsed.data;
      const { error: insertError } = await supabase.from("credit_applications").insert({
        id: applicationId,
        full_name: data.fullName,
        id_number: data.idNumber,
        phone: data.phone,
        email: data.email,
        occupation: data.occupation || null,
        monthly_income: data.monthlyIncome || null,
        vehicle_name: data.vehicleName || null,
        plan_id: plan?.id ?? "otro",
        plan_name: data.planName,
        message: data.message || null,
        documents: uploaded,
      });
      if (insertError) throw insertError;

      await supabase.functions.invoke("send-credit-application", {
        body: { applicationId },
      });

      setSent(true);
      toast.success("Documentación enviada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar. Intenta de nuevo o escríbeme por WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Enviar documentos para crédito JAC · Rigoberto Molina</title>
        <meta
          name="description"
          content="Envía en línea los recaudos de tu crédito JAC. Tu documentación llega directo al ejecutivo para revisión y aprobación."
        />
        <link rel="canonical" href="https://rigobertomolina.com/enviar-documentos" />
      </Helmet>

      <section className="pt-16 pb-10 bg-secondary/40 border-b border-border">
        <div className="section-container max-w-2xl text-center">
          <Link
            to="/creditos"
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft size={15} /> Volver a Créditos
          </Link>
          <h1 className="font-heading text-4xl font-bold leading-tight">
            Envía tu documentación
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Completa tus datos y adjunta los recaudos del plan que te interesa. Tu solicitud
            se envía al ejecutivo JAC para revisión y aprobación.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="section-container max-w-2xl">
          {sent ? (
            <div className="rounded-2xl border-2 border-primary/40 bg-secondary/40 p-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 text-primary" size={40} />
              <h2 className="font-heading text-2xl font-bold">Documentación recibida</h2>
              <p className="mt-3 text-muted-foreground">
                Enviamos tu solicitud al ejecutivo JAC. Te contactaremos al {form.phone} o a{" "}
                {form.email} apenas se revise tu expediente.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={waLink(
                    `Hola Rigoberto, acabo de enviar mi documentación para el plan ${form.planName}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
                >
                  <MessageCircle size={16} /> Avisar por WhatsApp
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-border px-5 py-3 text-sm font-bold"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="fullName">Nombre completo *</label>
                  <input
                    id="fullName"
                    className={inputCls}
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="María Pérez"
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div>
                  <label className={labelCls} htmlFor="idNumber">Cédula o RIF *</label>
                  <input
                    id="idNumber"
                    className={inputCls}
                    value={form.idNumber}
                    onChange={(e) => set("idNumber", e.target.value)}
                    placeholder="V-12345678"
                  />
                  {errors.idNumber && <p className="mt-1 text-xs text-destructive">{errors.idNumber}</p>}
                </div>
                <div>
                  <label className={labelCls} htmlFor="phone">Teléfono *</label>
                  <input
                    id="phone"
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+58 412 1234567"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div>
                  <label className={labelCls} htmlFor="email">Correo electrónico *</label>
                  <input
                    id="email"
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="maria@ejemplo.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <label className={labelCls} htmlFor="occupation">Ocupación</label>
                  <input
                    id="occupation"
                    className={inputCls}
                    value={form.occupation}
                    onChange={(e) => set("occupation", e.target.value)}
                    placeholder="Comerciante, empleado, independiente"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="monthlyIncome">Ingresos mensuales</label>
                  <input
                    id="monthlyIncome"
                    className={inputCls}
                    value={form.monthlyIncome}
                    onChange={(e) => set("monthlyIncome", e.target.value)}
                    placeholder="Aproximado en USD"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="vehicleName">Modelo de interés</label>
                  <select
                    id="vehicleName"
                    className={inputCls}
                    value={form.vehicleName}
                    onChange={(e) => set("vehicleName", e.target.value)}
                  >
                    <option value="">Selecciona un modelo</option>
                    {modelOptions.map((v) => (
                      <option key={v.id} value={v.displayName}>{v.displayName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="planName">Plan *</label>
                  <select
                    id="planName"
                    className={inputCls}
                    value={form.planName}
                    onChange={(e) => set("planName", e.target.value)}
                  >
                    <option value="">Selecciona un plan</option>
                    {financingPlans.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  {errors.planName && <p className="mt-1 text-xs text-destructive">{errors.planName}</p>}
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="message">Comentarios</label>
                <textarea
                  id="message"
                  rows={4}
                  className={inputCls}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Cuéntame cualquier detalle que deba saber el ejecutivo"
                />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
              </div>

              <div className="rounded-2xl border-2 border-border bg-secondary/30 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileUp size={18} className="text-primary" />
                  <h2 className="font-heading text-lg font-bold">Recaudos</h2>
                </div>

                {!plan && (
                  <p className="text-sm text-muted-foreground">
                    Elige primero un plan para ver los recaudos que debes adjuntar.
                  </p>
                )}

                {plan && pending && (
                  <p className="mb-4 text-sm text-muted-foreground">{PENDING_REQUIREMENTS_NOTE}</p>
                )}

                {plan && (
                  <div className="space-y-4">
                    {docSlots.map((slot) => (
                      <div key={slot} className="rounded-xl border border-border bg-background/40 p-4">
                        <p className="text-sm font-bold">{slot}</p>
                        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-border px-4 py-2 text-xs font-bold hover:border-primary">
                          <Upload size={14} /> Adjuntar archivo
                          <input
                            type="file"
                            className="hidden"
                            accept={ACCEPT}
                            multiple
                            onChange={(e) => {
                              addFiles(slot, e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {(files[slot] ?? []).length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {(files[slot] ?? []).map((file, i) => (
                              <li
                                key={`${file.name}-${i}`}
                                className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2 text-xs"
                              >
                                <span className="truncate">{file.name}</span>
                                <button
                                  type="button"
                                  aria-label={`Quitar ${file.name}`}
                                  onClick={() => removeFile(slot, i)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                  Formatos aceptados: fotos o PDF, hasta {MAX_FILE_MB} MB por archivo. {REQUIREMENTS_NOTE}
                </p>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
                <p>
                  Tus documentos se guardan de forma privada y solo se comparten con el
                  ejecutivo JAC encargado de evaluar tu solicitud.
                </p>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {sending ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
                {sending ? "Enviando documentación" : "Enviar documentación"}
              </button>
            </form>
          )}
        </div>
      </section>

      <FooterSection />
    </>
  );
};

export default EnviarDocumentos;
