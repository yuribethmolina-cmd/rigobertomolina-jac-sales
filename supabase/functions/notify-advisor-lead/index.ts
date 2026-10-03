import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let leadId: unknown
  try {
    leadId = (await req.json())?.leadId
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }
  if (typeof leadId !== 'string' || !UUID.test(leadId)) return json({ error: 'leadId inválido' }, 400)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: lead, error } = await supabase.from('advisor_leads').select('*').eq('id', leadId).single()
  if (error || !lead) return json({ error: 'Lead no encontrado' }, 404)

  // Solo leads recientes: evita reenvíos de leads viejos.
  if (Date.now() - new Date(lead.created_at).getTime() > 10 * 60_000) {
    return json({ sent: false, reason: 'lead antiguo' })
  }

  try {
    const result = await sendTemplateEmail('advisor-lead-notification', '', {
      templateData: {
        name: lead.name,
        phone: lead.phone,
        city: lead.city,
        modelInterest: lead.model_interest,
        purchaseMethod: lead.purchase_method,
        initialBudget: lead.initial_budget,
        monthlyBudget: lead.monthly_budget,
        leadScore: lead.lead_score,
        summary: lead.conversation_summary,
      },
      idempotencyKey: `advisor-lead-${lead.id}`,
    })
    return json({ sent: true, result })
  } catch (e) {
    console.error('advisor-lead-notification failed:', (e as Error).message)
    return json({ sent: false, error: (e as Error).message }, 500)
  }
})
