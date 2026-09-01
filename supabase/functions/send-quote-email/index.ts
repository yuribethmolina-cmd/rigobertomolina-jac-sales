import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const WHATSAPP_NUMBER = '584143200146'
const SITE_URL = 'https://rigobertomolina.com'

const slugify = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let quoteId: unknown
  try {
    quoteId = (await req.json())?.quoteId
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }
  if (typeof quoteId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quoteId)) {
    return json({ error: 'quoteId inválido' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: quote, error } = await supabase
    .from('quote_requests')
    .select('id, full_name, phone, email, city, vehicle_name, plan_name, message')
    .eq('id', quoteId)
    .single()

  if (error || !quote) return json({ error: 'Solicitud no encontrada' }, 404)

  const firstName = (quote.full_name || '').split(' ')[0]
  const reviewUrl = `${SITE_URL}/resena?modelo=${slugify(quote.vehicle_name)}&plan=${slugify(quote.plan_name)}`
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola Rigoberto, acabo de solicitar una cotización del ${quote.vehicle_name} (${quote.plan_name}).`,
  )}`

  const results: Record<string, unknown> = {}

  // 1. Notificación a Rigoberto (destinatario fijo en la plantilla)
  try {
    results.notification = await sendTemplateEmail('quote-notification', '', {
      templateData: {
        name: quote.full_name,
        phone: quote.phone,
        email: quote.email,
        city: quote.city,
        vehicleName: quote.vehicle_name,
        planName: quote.plan_name,
        message: quote.message,
      },
      idempotencyKey: `quote-notify-${quote.id}`,
    })
  } catch (e) {
    console.error('quote-notification failed:', (e as Error).message)
    results.notification = { sent: false, error: (e as Error).message }
  }

  // 2. Confirmación al cliente (solo si dejó correo)
  if (quote.email) {
    try {
      results.confirmation = await sendTemplateEmail('quote-confirmation', quote.email, {
        templateData: {
          name: firstName,
          vehicleName: quote.vehicle_name,
          planName: quote.plan_name,
          reviewUrl,
          whatsappUrl,
        },
        idempotencyKey: `quote-confirm-${quote.id}`,
      })
    } catch (e) {
      console.error('quote-confirmation failed:', (e as Error).message)
      results.confirmation = { sent: false, error: (e as Error).message }
    }
  } else {
    results.confirmation = { sent: false, reason: 'no_email' }
  }

  return json({ ok: true, results })
})
