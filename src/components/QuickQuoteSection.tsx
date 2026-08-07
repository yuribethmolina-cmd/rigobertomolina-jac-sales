import { useEffect, useMemo, useState } from "react";
import {
  suvModels,
  pickupModels,
  commercialModels,
  truckModels,
  waLink,
  type CarModel,
} from "@/lib/constants";
import { Download, MessageSquareText, Copy, Check, Zap } from "lucide-react";
import { toast } from "sonner";
import CopyableMessage from "./CopyableMessage";
import WhatsAppButton from "./WhatsAppButton";
import { generateQuotePdf } from "@/lib/quotePdf";
import { planModels } from "@/lib/paymentPlans";

/* Parse "$X.XXX,X" / "desde $X.XXX/mes" → number (formato VE) */
const parsePrice = (s?: string): number | null => {
  if (!s) return null;
  const m = s.replace(/desde\s*/i, "").match(/\$([\d.,]+)/);
  if (!m) return null;
  const [intPart, decPart = "0"] = m[1].split(",");
  const n = parseFloat(`${intPart.replace(/\./g, "")}.${decPart}`);
  return isNaN(n) ? null : n;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

interface QuickModel {
  name: string;
  category: string;
  cuotaDirecta: number | null;
  cuotaFacil: number | null;
}

const buildList = (): QuickModel[] => {
  const cats: [string, CarModel[]][] = [
    ["SUV", suvModels],
    ["Camioneta", pickupModels],
    ["Comercial", commercialModels],
    ["Camión", truckModels],
  ];
  const list: QuickModel[] = [];
  for (const [category, models] of cats) {
    for (const m of models) {
      const cuotaDirecta = parsePrice(m.priceDirecta) ?? parsePrice(m.price);
      const cuotaFacil = parsePrice(m.priceFacil);
      if (cuotaDirecta || cuotaFacil) list.push({ name: m.name, category, cuotaDirecta, cuotaFacil });
    }
  }
  return list;
};

const allModels = buildList();

type PlanKey = "directa" | "facil";

const QuickQuoteSection = () => {
  const [modelName, setModelName] = useState<string>(allModels[0]?.name ?? "");
  const [plan, setPlan] = useState<PlanKey>("directa");
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("rm_nombre");
    if (saved) setNombre(saved);
  }, []);

  useEffect(() => {
    if (nombre) localStorage.setItem("rm_nombre", nombre);
  }, [nombre]);

  const model = useMemo(
    () => allModels.find((m) => m.name === modelName) ?? null,
    [modelName]
  );

  /* Si el plan elegido no aplica al modelo, cambia al disponible */
  useEffect(() => {
    if (!model) return;
    if (plan === "directa" && !model.cuotaDirecta && model.cuotaFacil) setPlan("facil");
    if (plan === "facil" && !model.cuotaFacil && model.cuotaDirecta) setPlan("directa");
  }, [model, plan]);

  const cuota = plan === "directa" ? model?.cuotaDirecta ?? null : model?.cuotaFacil ?? null;
  const planName = plan === "directa" ? "Compra Directa" : "Pago Fácil";
  const planDetail = plan === "directa" ? "7 pagos" : "12 pagos";

  /* Desglose: inicial (afiliación), cuotas mensuales y pago previo a la entrega.
     Si el modelo está en la tabla comparativa se usan sus montos exactos. */
  const breakdown = useMemo(() => {
    if (!model || !cuota) return null;
    const ref = planModels.find(
      (pm) => pm.modelo.toLowerCase() === model.name.toLowerCase()
    );

    if (plan === "directa") {
      const total = ref?.totalDirecta ?? cuota * 7;
      const inicial = cuota;
      const nCuotas = 5;
      const preEntrega = round1(total - inicial - cuota * nCuotas);
      return { inicial, inicialLabel: "Afiliación (a la firma)", nCuotas, cuota, preEntrega, total };
    }

    const inicial = ref?.afiliacionFacil ?? 999.9;
    const nCuotas = 12;
    const preEntrega = ref?.finalFacil ?? round1(cuota * 2.254);
    const total = ref?.totalFacil ?? round1(inicial + cuota * nCuotas + preEntrega);
    return { inicial, inicialLabel: "Afiliación (a la firma)", nCuotas, cuota, preEntrega, total };
  }, [model, cuota, plan]);

  const message = useMemo(() => {
    if (!model) return "";
    return [
      `Hola Rigoberto${nombre ? `, soy ${nombre}` : ""}. Quiero información sobre:`,
      ``,
      `Modelo: ${model.name} (${model.category})`,
      `Plan: ${planName} (${planDetail})`,
      cuota ? `Cuota estimada: ${fmt(cuota)}/mes` : `Cuota: por confirmar`,
      ...(breakdown
        ? [
            ``,
            `Desglose estimado:`,
            `- Inicial (afiliación): ${fmt(breakdown.inicial)}`,
            `- ${breakdown.nCuotas} cuotas de ${fmt(breakdown.cuota)}`,
            `- Previo a entrega: ${fmt(breakdown.preEntrega)}`,
            `- Total estimado: ${fmt(breakdown.total)}`,
          ]
        : []),
      ``,
      `¿Me confirmas disponibilidad y los pasos para iniciar?`,
    ].join("\n");
  }, [model, nombre, planName, planDetail, cuota, breakdown]);

  const handleDownloadPdf = () => {
    if (!model) return;
    generateQuotePdf({
      modelo: model.name,
      categoria: model.category,
      plan: planName,
      planDetalle: planDetail,
      cuota: cuota ? `${fmt(cuota)}/mes` : "Por confirmar",
      nombre: nombre || undefined,
      desglose: breakdown
        ? [
            [breakdown.inicialLabel, fmt(breakdown.inicial)],
            [`${breakdown.nCuotas} cuotas mensuales`, `${fmt(breakdown.cuota)} c/u`],
            ["Pago previo a la entrega", fmt(breakdown.preEntrega)],
            ["Total estimado", fmt(breakdown.total)],
          ]
        : undefined,
      mensaje: message,
      waUrl: waLink(message),
    });
  };

  const grouped = useMemo(() => {
    const map = new Map<string, QuickModel[]>();
    for (const m of allModels) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return [...map.entries()];
  }, []);

  return (
    <section id="cotizacion-rapida" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Zap size={16} /> Mensaje listo en 2 toques
          </div>
          <h2 className="section-title">Cotización rápida por WhatsApp</h2>
          <p className="section-subtitle">
            Elige modelo y plan: preparamos el mensaje con la cuota estimada para que solo tengas que enviarlo.
          </p>
          <div className="teal-underline mx-auto" />
        </div>

        <div className="mt-10 max-w-3xl mx-auto card-glow p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="qq-model"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Modelo
              </label>
              <select
                id="qq-model"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
              >
                {grouped.map(([cat, models]) => (
                  <optgroup key={cat} label={cat}>
                    {models.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="qq-nombre"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Tu nombre (opcional)
              </label>
              <input
                id="qq-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: María González"
                className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Plan de pago
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {([
                ["directa", "Compra Directa", "7 pagos", model?.cuotaDirecta ?? null],
                ["facil", "Pago Fácil", "12 pagos · última mayor", model?.cuotaFacil ?? null],
              ] as [PlanKey, string, string, number | null][]).map(([key, title, desc, amount]) => (
                <button
                  key={key}
                  type="button"
                  disabled={!amount}
                  onClick={() => setPlan(key)}
                  className={`text-left p-4 rounded-xl border-2 transition-colors ${
                    plan === key
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary hover:border-primary/50"
                  } ${!amount ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span className="font-heading font-bold text-sm">{title}</span>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  <p className="mt-2 font-heading font-bold text-primary">
                    {amount ? `${fmt(amount)}/mes` : "No disponible"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {breakdown && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Desglose de la cuota estimada
              </p>
              <div className="rounded-xl border border-border overflow-hidden text-sm">
                <div className="divide-y divide-border">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-muted-foreground">{breakdown.inicialLabel}</span>
                    <span className="font-heading font-bold">{fmt(breakdown.inicial)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-muted-foreground">
                      {breakdown.nCuotas} cuotas mensuales
                    </span>
                    <span className="font-heading font-bold">
                      {fmt(breakdown.cuota)} <span className="text-muted-foreground font-normal">c/u</span>
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-muted-foreground">Pago previo a la entrega</span>
                    <span className="font-heading font-bold">{fmt(breakdown.preEntrega)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 bg-primary/10">
                    <span className="font-heading font-bold">TOTAL ESTIMADO</span>
                    <span className="font-heading font-bold text-primary">
                      {fmt(breakdown.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <CopyableMessage message={message} label="Mensaje que se enviará" />
          </div>

          <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-3">
            <WhatsAppButton
              message={message}
              label="Enviar por WhatsApp"
              className="w-full"
              disabled={!model}
            />
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!model}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary text-primary font-heading font-bold px-6 py-4 hover:bg-primary/10 transition-colors disabled:opacity-40"
            >
              <Download size={18} /> Descargar PDF
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
            <MessageSquareText size={13} className="mt-0.5 shrink-0" />
            Montos referenciales Agosto 2026. Sujetos a variación.
          </p>
        </div>
      </div>
    </section>
  );
};

export default QuickQuoteSection;
