import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let reviewId: unknown
  try {
    reviewId = (await req.json())?.reviewId
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }
  if (typeof reviewId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewId)) {
    return json({ error: 'reviewId inválido' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: review, error } = await supabase
    .from('reviews')
    .select('id, customer_name, vehicle_name, rating, message, photo_url, created_at')
    .eq('id', reviewId)
    .single()

  if (error || !review) return json({ error: 'Reseña no encontrada' }, 404)

  const createdAt = new Date(review.created_at).toLocaleString('es-VE', {
    timeZone: 'America/Caracas',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  try {
    const result = await sendTemplateEmail('review-notification', '', {
      templateData: {
        customerName: review.customer_name,
        vehicleName: review.vehicle_name,
        rating: review.rating,
        message: review.message,
        hasPhoto: !!review.photo_url,
        createdAt,
      },
      idempotencyKey: `review-notify-${review.id}`,
    })
    return json({ ok: true, result })
  } catch (e) {
    console.error('review-notification failed:', (e as Error).message)
    return json({ ok: false, error: (e as Error).message }, 500)
  }
})
