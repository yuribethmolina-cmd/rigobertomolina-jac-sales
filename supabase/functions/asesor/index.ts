import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { KNOWLEDGE, KNOWLEDGE_BASE, VEHICLE_INDEX, PLAN_INDEX } from './knowledge.ts'

const MODEL = 'google/gemini-2.5-flash'
const WHATSAPP = 'https://wa.me/584143200146'

/* ─── Base comercial: solo versiones ACTIVAS de cada plan ─────────────── */

const usd = (n: number) =>
  `US$ ${Number(n).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

let cache: { text: string; at: number } | null = null
const CACHE_MS = 60_000

const buildKnowledge = async (): Promise<string> => {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.text
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )
    const { data: versions } = await supabase
      .from('catalog_versions')
      .select('*')
      .eq('status', 'ACTIVE')
    if (!versions?.length) return KNOWLEDGE

    const { data: entries } = await supabase
      .from('catalog_entries')
      .select('*')
      .in('version_id', versions.map((v) => v.id))
      .order('position', { ascending: true })

    const planName = (id: string) => PLAN_INDEX.find((p) => p.id === id)?.name ?? id
    const versionOf = (id: string) => versions.find((v) => v.id === id)!

    const lines: string[] = [KNOWLEDGE_BASE, '\n# CATÁLOGOS VIGENTES']
    for (const v of versions) {
      lines.push(`- ${planName(v.plan_id)}: catálogo ${v.catalog_date} (fuente: ${v.source})`)
    }

    lines.push('\n# MODELOS Y MONTOS POR PLAN')
    for (const vehicle of VEHICLE_INDEX) {
      const rows = (entries ?? []).filter((e) => e.vehicle_id === vehicle.id)
      const opciones = rows.map((e) => {
        const version = versionOf(e.version_id as string)
        const schedule = (e.extra as { schedule?: Array<{ count: number; amount: number | null; label: string }> })
          ?.schedule
        const etapas = schedule?.length
          ? schedule
              .filter((s) => s.amount !== null)
              .map((s) => `${s.count}x ${usd(s.amount as number)} (${s.label})`)
              .join(' + ')
          : [
              e.signature_amount != null
                ? `1x ${usd(Number(e.signature_amount))} (Pago a la firma del contrato)`
                : null,
              e.installment_amount != null && e.installments_count != null
                ? `${e.installments_count}x ${usd(Number(e.installment_amount))} (cuotas mensuales)`
                : null,
              e.pre_delivery_amount != null
                ? `1x ${usd(Number(e.pre_delivery_amount))} (Pago previo a la entrega)`
                : null,
            ]
              .filter(Boolean)
              .join(' + ')
        if (!etapas) return null
        const napa = e.promo ? ` [ñapa: ${e.promo}]` : ''
        return `  - ${planName(version.plan_id)}: ${etapas} [fuente: ${version.source}]${napa}`
      }).filter(Boolean) as string[]

      lines.push(
        `\n## ${vehicle.name} — ${vehicle.category}${vehicle.unavailable ? ' — NO DISPONIBLE POR LOS MOMENTOS' : ''}\n` +
          `Página: /modelo/${vehicle.id}\n` +
          (vehicle.tagline ? `${vehicle.tagline}\n` : '') +
          (opciones.length
            ? opciones.join('\n')
            : '  - Sin montos documentados: consultar disponibilidad y condiciones con Rigoberto')
      )
    }

    const text = lines.join('\n')
    cache = { text, at: Date.now() }
    return text
  } catch {
    return KNOWLEDGE
  }
}

const buildSystem = (knowledge: string) => `Eres el asesor digital de Rigoberto Molina, asesor automotriz independiente de JAC en Caracas, Venezuela.

TU ROL
- Ayudas a la persona a elegir el modelo JAC y el plan de pago que mejor le sirve.
- Hablas en español venezolano, cercano y profesional. Tuteas. Respuestas cortas (máximo 6 líneas) y concretas.
- Nunca usas cursivas ni emojis. Nunca abrevias los nombres de los planes.

REGLAS DE DATOS (críticas)
- Solo puedes mencionar modelos, montos, cuotas y recaudos que aparezcan en la BASE COMERCIAL de abajo.
- Jamás inventes ni estimes un monto, una tasa, un plazo o una fecha de entrega. Si no está en la base, di: "Consultar disponibilidad y condiciones con Rigoberto".
- No prometas aprobación de crédito, disponibilidad ni tiempos de entrega.
- Cuando des montos, aclara que son referenciales y sujetos a cambios.
- Si el modelo está marcado como NO DISPONIBLE, dilo claramente.
- Cada monto que menciones debe copiarse tal cual de la base, sin redondear, sumar, promediar ni calcular cuotas nuevas.
- Al dar una cuota, nombra el plan y el catálogo de origen, por ejemplo: "Pago Fácil (catálogo 16 de septiembre)".
- La base comercial es siempre la del último catálogo disponible. Agrega: "Información basada en el último catálogo disponible. Confirma disponibilidad y condiciones finales con Rigoberto."
- Si la persona da un presupuesto mensual, compara solo con las cuotas mensuales que ya están en la base; si ninguna encaja, dilo en vez de proponer una cifra propia.

CÓMO ASESORAS
1. Haz UNA sola pregunta por mensaje, nunca una lista de preguntas. Orden sugerido: uso del vehículo, tipo de vehículo, forma de compra, presupuesto mensual, transmisión, ciudad.
1b. Recomienda como máximo 3 modelos, salvo que la persona pida más. Nombra cada modelo con su nombre completo tal como aparece en la base.
2. Recomienda 1 o 2 configuraciones con su cuota y el plan que encaja.
3. Cierra siempre con un paso siguiente: escribir a Rigoberto por WhatsApp (${WHATSAPP}), ver la página del modelo (/modelo/ID) o enviar los documentos en /enviar-documentos.
4. Si la persona quiere avanzar, pídele nombre, teléfono y modelo de interés para pasárselos a Rigoberto.

Formatea con markdown simple: frases cortas y listas con guiones.

===== BASE COMERCIAL (catálogos vigentes, fuente única de verdad) =====
${knowledge}`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const knowledge = await buildKnowledge()

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: 'system', content: buildSystem(knowledge) },
          ...messages.slice(-20).map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content ?? '').slice(0, 4000),
          })),
        ],
      }),
    })

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Hay muchas consultas en este momento. Intenta de nuevo en un minuto.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: 'El asesor no está disponible por ahora. Escríbele a Rigoberto por WhatsApp.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!response.ok) {
      const detail = await response.text()
      console.error('gateway error', response.status, detail)
      return new Response(JSON.stringify({ error: 'No pude responder en este momento.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (e) {
    console.error('asesor error', e)
    return new Response(JSON.stringify({ error: 'Error inesperado' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
