import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { KNOWLEDGE } from './knowledge.ts'

const MODEL = 'google/gemini-2.5-flash'
const WHATSAPP = 'https://wa.me/584143200146'

const SYSTEM = `Eres el asesor digital de Rigoberto Molina, asesor automotriz independiente de JAC en Caracas, Venezuela.

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
- Al dar una cuota, nombra el plan y el catálogo de origen, por ejemplo: "Pago Fácil (catálogo 04 de septiembre)".
- Si la persona da un presupuesto mensual, compara solo con las cuotas mensuales que ya están en la base; si ninguna encaja, dilo en vez de proponer una cifra propia.

CÓMO ASESORAS
1. Si no sabes qué busca, haz una o dos preguntas cortas (uso del vehículo, presupuesto mensual aproximado, si prefiere pagar antes de recibir o llevárselo de una).
2. Recomienda 1 o 2 configuraciones con su cuota y el plan que encaja.
3. Cierra siempre con un paso siguiente: escribir a Rigoberto por WhatsApp (${WHATSAPP}), ver la página del modelo (/modelo/ID) o enviar los documentos en /enviar-documentos.
4. Si la persona quiere avanzar, pídele nombre, teléfono y modelo de interés para pasárselos a Rigoberto.

Formatea con markdown simple: frases cortas y listas con guiones.

===== BASE COMERCIAL (fuente única de verdad, septiembre 2026) =====
${KNOWLEDGE}`

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
          { role: 'system', content: SYSTEM },
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
