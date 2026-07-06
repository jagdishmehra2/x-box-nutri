import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const createSignature = async (value: string, secret: string) => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))

  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return difference === 0
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  const supabaseUrl = Deno.env.get('URL')
  const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')
  const razorpayKeyId = Deno.env.get('RAZORPAY_API_KEY')
  const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY')

  if (!supabaseUrl || !serviceRoleKey || !razorpayKeyId || !razorpaySecret) {
    return json({ error: 'Payment service is not configured.' }, 500)
  }

  const authorization = request.headers.get('Authorization')
  const accessToken = authorization?.replace(/^Bearer\s+/i, '')

  if (!accessToken) {
    return json({ error: 'Authentication is required.' }, 401)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken)

  if (userError || !user) {
    return json({ error: 'Invalid or expired session.' }, 401)
  }

  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  const localOrderId = body.local_order_id
  const razorpayOrderId = body.razorpay_order_id
  const razorpayPaymentId = body.razorpay_payment_id
  const razorpaySignature = body.razorpay_signature
  const paymentFailed = body.payment_failed === true

  if (
    typeof localOrderId !== 'string' ||
    typeof razorpayOrderId !== 'string'
  ) {
    return json({ error: 'Payment verification details are required.' }, 400)
  }

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select(
      'id, order_id, amount, payment_status, razorpay_order_id, razorpay_payment_id',
    )
    .eq('order_id', localOrderId)
    .eq('user_id', user.id)
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle()

  if (paymentError || !payment) {
    return json({ error: 'Pending payment was not found.' }, 404)
  }

  if (paymentFailed) {
    if (payment.payment_status === 'paid') {
      return json({ error: 'Payment is already marked as paid.' }, 409)
    }

    const failureReason =
      typeof body.failure_reason === 'string'
        ? body.failure_reason.slice(0, 500)
        : 'Payment failed in Razorpay Checkout.'
    const [paymentUpdate, orderUpdate] = await Promise.all([
      supabase
        .from('payments')
        .update({ payment_status: 'failed', failure_reason: failureReason })
        .eq('id', payment.id),
      supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', localOrderId)
        .eq('user_id', user.id),
    ])

    if (paymentUpdate.error || orderUpdate.error) {
      return json({ error: 'Unable to update failed payment.' }, 500)
    }

    return json({ paymentStatus: 'failed' })
  }

  if (
    typeof razorpayPaymentId !== 'string' ||
    typeof razorpaySignature !== 'string'
  ) {
    return json({ error: 'Payment verification details are required.' }, 400)
  }

  const expectedSignature = await createSignature(
    `${payment.razorpay_order_id}|${razorpayPaymentId}`,
    razorpaySecret,
  )
  const isValid = safeEqual(expectedSignature, razorpaySignature.toLowerCase())

  if (!isValid) {
    if (payment.payment_status !== 'paid') {
      const [paymentUpdate, orderUpdate] = await Promise.all([
        supabase
          .from('payments')
          .update({
            payment_status: 'failed',
            failure_reason: 'Razorpay signature verification failed.',
          })
          .eq('id', payment.id),
        supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('id', localOrderId)
          .eq('user_id', user.id),
      ])

      if (paymentUpdate.error || orderUpdate.error) {
        return json({ error: 'Unable to update failed payment.' }, 500)
      }
    }

    return json({ error: 'Invalid Razorpay payment signature.' }, 400)
  }

  if (
    payment.payment_status === 'paid' &&
    payment.razorpay_payment_id !== razorpayPaymentId
  ) {
    return json({ error: 'A different payment is already recorded.' }, 409)
  }

  const paidAt = new Date().toISOString()
  const { error: paidPaymentError } = await supabase
    .from('payments')
    .update({
      payment_status: 'paid',
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      failure_reason: null,
      paid_at: paidAt,
    })
    .eq('id', payment.id)

  if (paidPaymentError) {
    return json({ error: 'Unable to save verified payment.' }, 500)
  }

  const { error: paidOrderError } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', order_status: 'confirmed' })
    .eq('id', localOrderId)
    .eq('user_id', user.id)

  if (paidOrderError) {
    return json({ error: 'Unable to update paid order.' }, 500)
  }

  return json({
    localOrderId,
    paymentId: razorpayPaymentId,
    amount: Number(payment.amount),
    paymentStatus: 'paid',
  })
})
