/**
 * Extracción de un catálogo en PDF hacia un BORRADOR revisable.
 *
 * Reglas duras:
 * - Nunca publica: siempre crea una versión en estado BORRADOR.
 * - Nunca calcula, redondea ni infiere montos.
 * - Lo que no se puede asociar con certeza queda como REQUIERE REVISIÓN.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { PDFDocument } from "npm:pdf-lib@1.17.1";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const PAGES_PER_CHUNK = 10;

interface Extracted {
  model_name: string;
  version_label: string | null;
  signature_amount: number | null;
  installments_count: number | null;
  installment_amount: number | null;
  pre_delivery_amount: number | null;
  promo: string | null;
  conditions: string | null;
  needs_review: boolean;
  review_reason?: string | null;
}

const INSTRUCTIONS = `Eres un extractor de catálogos comerciales de vehículos JAC en Venezuela.
Del PDF adjunto extrae UN registro por cada cronograma de pago que encuentres.

Reglas obligatorias:
- Copia los montos EXACTAMENTE como aparecen, con sus decimales. El formato del documento usa punto de miles y coma decimal (2.705,70 = 2705.70). Devuelve números con punto decimal.
- NO redondees, NO estimes, NO calcules montos que no estén escritos.
- NO agrupes versiones distintas (Manual/Automático, Gasolina/Diésel, 4x2/4x4, Pro, Pal' Campo, Ferretero, Chasis, capacidades, versiones especiales).
- Empareja cada cronograma con el modelo al que pertenece según el documento. Si no puedes asociarlo con certeza, marca needs_review=true y explica por qué en review_reason.
- Si falta un dato, ponlo en null y marca needs_review=true. Nunca lo inventes.
- promo: la ñapa o promoción textual si aparece; si no hay, null.
- conditions: condiciones comerciales textuales si aparecen; si no, null.

Devuelve SOLO un JSON: {"registros": [ ... ]} sin texto adicional.`;

const b64 = (bytes: Uint8Array) => {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
};

const parseJson = (text: string): Extracted[] => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed?.registros) ? parsed.registros : [];
  } catch {
    return [];
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "No autorizado" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "No autorizado" }, 401);

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "No autorizado" }, 403);

    const body = await req.json();
    const planId = String(body?.planId ?? "");
    const catalogDate = String(body?.catalogDate ?? "");
    const pdfPath = String(body?.pdfPath ?? "");
    const source = String(body?.source ?? "");
    if (!planId || !catalogDate || !pdfPath) {
      return json({ error: "Faltan datos del catálogo" }, 400);
    }

    const { data: file, error: fileError } = await supabase.storage
      .from("catalog-pdfs")
      .download(pdfPath);
    if (fileError || !file) return json({ error: "No se pudo leer el PDF" }, 400);

    const original = await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true,
    });
    const totalPages = original.getPageCount();

    const registros: Extracted[] = [];
    for (let start = 0; start < totalPages; start += PAGES_PER_CHUNK) {
      const indices = Array.from(
        { length: Math.min(PAGES_PER_CHUNK, totalPages - start) },
        (_, i) => start + i
      );
      const part = await PDFDocument.create();
      const pages = await part.copyPages(original, indices);
      pages.forEach((p) => part.addPage(p));
      const dataUrl = `data:application/pdf;base64,${b64(await part.save())}`;

      const res = await fetch(AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: INSTRUCTIONS },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Páginas ${start + 1} a ${start + indices.length} de ${totalPages}.`,
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });

      if (res.status === 429) return json({ error: "Límite de uso alcanzado. Intenta más tarde." }, 429);
      if (res.status === 402) return json({ error: "Se agotaron los créditos de IA." }, 402);
      if (!res.ok) {
        const detail = await res.text();
        return json({ error: `No se pudo procesar el PDF: ${detail.slice(0, 200)}` }, 502);
      }

      const data = await res.json();
      registros.push(...parseJson(data?.choices?.[0]?.message?.content ?? ""));
    }

    if (registros.length === 0) {
      return json({ error: "No se pudo extraer ningún registro del PDF." }, 422);
    }

    /* Comparación contra la versión ACTIVA del mismo plan. */
    const { data: activeVersion } = await supabase
      .from("catalog_versions")
      .select("id")
      .eq("plan_id", planId)
      .eq("status", "ACTIVE")
      .maybeSingle();

    const { data: activeEntries } = activeVersion
      ? await supabase.from("catalog_entries").select("*").eq("version_id", activeVersion.id)
      : { data: [] as Record<string, unknown>[] };

    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

    const current = (activeEntries ?? []) as Array<Record<string, any>>;
    const usados = new Set<string>();

    const { data: version, error: versionError } = await supabase
      .from("catalog_versions")
      .insert({
        plan_id: planId,
        catalog_date: catalogDate,
        status: "DRAFT",
        source: source || `Catálogo ${catalogDate}`,
        pdf_path: pdfPath,
        entries_count: registros.length,
        created_by: user.id,
      })
      .select()
      .single();
    if (versionError || !version) return json({ error: "No se pudo crear el borrador" }, 500);

    const rows = registros.map((r, i) => {
      const nombre = [r.model_name, r.version_label].filter(Boolean).join(" ").trim();
      const previo = current.find(
        (c) => norm(`${c.model_name ?? ""} ${c.version_label ?? ""}`) === norm(nombre)
      );
      if (previo) usados.add(previo.id as string);

      const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);
      const igual =
        previo &&
        Number(previo.signature_amount) === num(r.signature_amount) &&
        Number(previo.installments_count) === num(r.installments_count) &&
        Number(previo.installment_amount) === num(r.installment_amount) &&
        Number(previo.pre_delivery_amount) === num(r.pre_delivery_amount);

      const change_type = r.needs_review
        ? "NEEDS_REVIEW"
        : previo
          ? igual
            ? "UNCHANGED"
            : "UPDATED"
          : "NEW";

      return {
        version_id: version.id,
        position: i,
        vehicle_id: previo?.vehicle_id ?? null,
        model_name: r.model_name ?? "(sin nombre)",
        version_label: r.version_label ?? null,
        signature_amount: num(r.signature_amount),
        installments_count: num(r.installments_count),
        installment_amount: num(r.installment_amount),
        pre_delivery_amount: num(r.pre_delivery_amount),
        promo: r.promo ?? null,
        conditions: r.conditions ?? null,
        extra: {
          review_reason: r.review_reason ?? null,
          previous: previo
            ? {
                signature_amount: previo.signature_amount,
                installments_count: previo.installments_count,
                installment_amount: previo.installment_amount,
                pre_delivery_amount: previo.pre_delivery_amount,
                promo: previo.promo,
              }
            : null,
        },
        change_type,
      };
    });

    /* Modelos del catálogo activo que no aparecen en el PDF: RETIRADO. */
    const retirados = current
      .filter((c) => !usados.has(c.id as string))
      .map((c, i) => ({
        version_id: version.id,
        position: rows.length + i,
        vehicle_id: c.vehicle_id ?? null,
        model_name: c.model_name,
        version_label: c.version_label ?? null,
        signature_amount: null,
        installments_count: null,
        installment_amount: null,
        pre_delivery_amount: null,
        promo: null,
        conditions: null,
        extra: {
          previous: {
            signature_amount: c.signature_amount,
            installments_count: c.installments_count,
            installment_amount: c.installment_amount,
            pre_delivery_amount: c.pre_delivery_amount,
            promo: c.promo,
          },
        },
        change_type: "REMOVED",
      }));

    const todos = [...rows, ...retirados];
    const { error: insertError } = await supabase.from("catalog_entries").insert(todos);
    if (insertError) return json({ error: "No se pudieron guardar los registros" }, 500);

    await supabase
      .from("catalog_versions")
      .update({ entries_count: todos.length })
      .eq("id", version.id);

    await supabase.from("catalog_audit").insert({
      version_id: version.id,
      plan_id: planId,
      action: "EXTRACT",
      user_id: user.id,
      user_email: user.email,
      details: { pages: totalPages, entries: todos.length },
    });

    return json({ versionId: version.id, entries: todos.length, pages: totalPages });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error inesperado" }, 500);
  }
});
