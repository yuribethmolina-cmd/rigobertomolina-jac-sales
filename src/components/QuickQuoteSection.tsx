import { useEffect, useMemo, useState } from "react";
import { waLink } from "@/lib/constants";
import { Download, Copy, Check, Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import CopyableMessage from "./CopyableMessage";
import WhatsAppButton from "./WhatsAppButton";
import { generateQuotePdf } from "@/lib/quotePdf";
import { trackContact } from "@/lib/track";
import { vehicles } from "@/data/vehicles";
import { financingOptionsFor } from "@/data/vehicleFinancing";
import { FINANCING_DISCLAIMER, NOT_VERIFIED_LABEL, fmtUsd } from "@/data/financingPlans";

const QuickQuoteSection = () => {
  const [vehicleId, setVehicleId] = useState<string>(vehicles[0]?.id ?? "");
  const [planId, setPlanId] = useState<string>("pago-facil");
  const [nombre, setNombre] = useState("");
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rm_nombre");
    if (saved) setNombre(saved);
  }, []);

  useEffect(() => {
    if (nombre) localStorage.setItem("rm_nombre", nombre);
  }, [nombre]);

  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId), [vehicleId]);
  const options = useMemo(() => (vehicle ? financingOptionsFor(vehicle.id) : []), [vehicle]);
  const option = options.find((o) => o.plan.id === planId) ?? options[0];

  useEffect(() => {
    if (options.length && !options.some((o) => o.plan.id === planId)) {
      setPlanId(options[0].plan.id);
    }
  }, [options, planId]);

  const breakdown = useMemo<[string, string][]>(() => {
    if (!option) return [];
    return option.schedule.map((s) => [
      s.count > 1 ? `${s.count} × ${s.label}` : s.label,
      s.amount === null ? NOT_VERIFIED_LABEL : `${fmtUsd(s.amount)}${s.count > 1 ? " c/u" : ""}`,
    ]);
  }, [option]);

  const message = useMemo(() => {
    if (!vehicle || !option) return "";
    return [
      `Hola Rigoberto${nombre ? `, soy ${nombre}` : ""}. Estoy viendo el ${vehicle.displayName} y me interesa el plan ${option.plan.name}.`,
      ``,
      `Configuración: ${vehicle.displayName} (${vehicle.category})`,
      `Plan: ${option.plan.name}`,
      `Estructura: ${option.plan.description}`,
      ...(breakdown.length ? [``, `Cronograma:`, ...breakdown.map(([k, v]) => `- ${k}: ${v}`)] : []),
      ``,
      `¿Me puedes enviar el cronograma actualizado y confirmar disponibilidad?`,
    ].join("\n");
  }, [vehicle, option, nombre, breakdown]);

  const handleCopyMessage = async () => {
    if (!message) return;
    trackContact("copy", { model: vehicle?.displayName, plan: option?.plan.name, source: "cotizacion-rapida" });
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const ta = document.createElement("textarea");
        ta.value = message;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setMessageCopied(true);
      window.setTimeout(() => setMessageCopied(false), 2000);
      toast.success("Mensaje copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el mensaje");
    }
  };

  const handleDownloadPdf = () => {
    if (!vehicle || !option) return;
    trackContact("pdf", { model: vehicle.displayName, plan: option.plan.name, source: "cotizacion-rapida" });
    const cuota = option.schedule.find((s) => s.count > 1 && s.amount !== null);
    generateQuotePdf({
      modelo: vehicle.displayName,
      categoria: vehicle.category,
      plan: option.plan.name,
      planDetalle: option.plan.description,
      cuota: cuota?.amount ? `${fmtUsd(cuota.amount)} por cuota` : NOT_VERIFIED_LABEL,
      nombre: nombre || undefined,
      desglose: breakdown.length ? breakdown : undefined,
      mensaje: message,
      waUrl: waLink(message),
    });
  };

  const grouped = useMemo(() => {
    const map = new Map<string, typeof vehicles>();
    for (const v of vehicles) {
      if (!map.has(v.category)) map.set(v.category, []);
      map.get(v.category)!.push(v);
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
            Elige configuración y plan: preparamos el mensaje con el cronograma documentado.
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
                Configuración
              </label>
              <select
                id="qq-model"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
              >
                {grouped.map(([cat, list]) => (
                  <optgroup key={cat} label={cat}>
                    {list.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.displayName}
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
              {options.map((o) => (
                <button
                  key={o.plan.id}
                  type="button"
                  onClick={() => setPlanId(o.plan.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-colors ${
                    option?.plan.id === o.plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary hover:border-primary/40"
                  }`}
                >
                  <p className="font-heading font-bold text-sm text-foreground">{o.plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{o.plan.description}</p>
                  {o.plan.sourceStatus === "REVIEW_NOT_VERIFIED" && (
                    <p className="mt-2 text-[11px] text-amber-500 flex items-center gap-1">
                      <AlertTriangle size={12} /> En revisión
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cronograma */}
          {breakdown.length > 0 && (
            <div className="mt-6 rounded-xl border border-primary/20 divide-y divide-primary/10">
              {breakdown.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-heading font-bold text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">{FINANCING_DISCLAIMER}</p>

          <div className="mt-6">
            <CopyableMessage message={message} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <WhatsAppButton
              message={message}
              label="Enviar por WhatsApp"
              model={vehicle?.displayName}
              plan={option?.plan.name}
              source="cotizacion-rapida"
            />
            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-5 py-4 font-heading text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              {messageCopied ? <Check size={16} /> : <Copy size={16} />}
              {messageCopied ? "Copiado" : "Copiar mensaje"}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-5 py-4 font-heading text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              <Download size={16} /> Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickQuoteSection;
