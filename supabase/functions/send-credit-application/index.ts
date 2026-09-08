import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const WHATSAPP_NUMBER = '584143200146'
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 7

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let applicationId: unknown
  try {
    applicationId = (await req.json())?.applicationId
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }
  if (typeof applicationId !== 'string' || !UUID_RE.test(applicationId)) {
    return json({ error: 'applicationId inválido' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: app, error } = await supabase
    .from('credit_applications')
    .select(
      'id, full_name, id_number, phone, email, occupation, monthly_income, vehicle_name, plan_name, message, documents',
    )
    .eq('id', applicationId)
    .single()

  if (error || !app) return json({ error: 'Solicitud no encontrada' }, 404)

  const docs = Array.isArray(app.documents) ? app.documents : []
  const documents: { label?: string; name?: string; url?: string }[] = []

  for (const doc of docs) {
    const path = typeof doc?.path === 'string' ? doc.path : null
    if (!path) continue
    const { data: signed } = await supabase.storage
      .from('credit-documents')
      .createSignedUrl(path, SIGNED_URL_SECONDS)
    documents.push({
      label: typeof doc?.label === 'string' ? doc.label : undefined,
      name: typeof doc?.name === 'string' ? doc.name : path.split('/').pop(),
      url: signed?.signedUrl,
    })
  }

  const firstName = (app.full_name || '').split(' ')[0]
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola Rigoberto, envié mi documentación para el plan ${app.plan_name}.`,
  )}`

  const results: Record<string, unknown> = {}

  try {
    results.notification = await sendTemplateEmail('credit-application-notification', '', {
      templateData: {
        name: app.full_name,
        idNumber: app.id_number,
        phone: app.phone,
        email: app.email,
        occupation: app.occupation,
        monthlyIncome: app.monthly_income,
        vehicleName: app.vehicle_name,
        planName: app.plan_name,
        message: app.message,
        documents,
      },
      idempotencyKey: `credit-app-notify-${app.id}`,
    })
  } catch (e) {
    console.error('credit-application-notification failed:', (e as Error).message)
    results.notification = { sent: false, error: (e as Error).message }
  }

  if (app.email) {
    try {
      results.confirmation = await sendTemplateEmail('credit-application-confirmation', app.email, {
        templateData: {
          name: firstName,
          planName: app.plan_name,
          vehicleName: app.vehicle_name,
          documentCount: documents.length,
          whatsappUrl,
        },
        idempotencyKey: `credit-app-confirm-${app.id}`,
      })
    } catch (e) {
      console.error('credit-application-confirmation failed:', (e as Error).message)
      results.confirmation = { sent: false, error: (e as Error).message }
    }
  } else {
    results.confirmation = { sent: false, reason: 'no_email' }
  }

  return json({ ok: true, results })
})
