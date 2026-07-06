import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

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

  let body: {
    addressId?: unknown
    items?: Array<{ productId?: unknown; quantity?: unknown }>
  }

  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  if (typeof body.addressId !== 'string' || !Array.isArray(body.items)) {
    return json({ error: 'Address and cart items are required.' }, 400)
  }

  const quantities = new Map<string, number>()

  for (const item of body.items) {
    if (
      typeof item.productId !== 'string' ||
      !Number.isInteger(item.quantity) ||
      Number(item.quantity) <= 0
    ) {
      return json({ error: 'Cart contains an invalid item.' }, 400)
    }

    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + Number(item.quantity),
    )
  }

  if (quantities.size === 0) {
    return json({ error: 'Your cart is empty.' }, 400)
  }

  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .select(
      'id, full_name, phone, address, landmark, city, state, pincode',
    )
    .eq('id', body.addressId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (addressError || !address) {
    return json({ error: 'Delivery address was not found.' }, 400)
  }

  const productIds = [...quantities.keys()]
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(
      'id, name, brand, category, subtype, flavor, weight, price, discount_price, image_urls, stock',
    )
    .in('id', productIds)
    .eq('is_active', true)

  if (productsError || !products || products.length !== productIds.length) {
    return json({ error: 'One or more cart products are unavailable.' }, 400)
  }

  let amountInPaise = 0
  const orderItems = []

  for (const product of products) {
    const quantity = quantities.get(String(product.id))
    const unitPrice = Number(product.discount_price ?? product.price)
    const mrp = Number(product.price)
    const stock = product.stock === null ? null : Number(product.stock)

    if (
      !quantity ||
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0 ||
      !Number.isFinite(mrp)
    ) {
      return json({ error: 'A cart product has an invalid price.' }, 400)
    }

    if (stock !== null && (!Number.isFinite(stock) || quantity > stock)) {
      return json({ error: `${product.name} does not have enough stock.` }, 400)
    }

    const unitPriceInPaise = Math.round(unitPrice * 100)
    amountInPaise += unitPriceInPaise * quantity
    orderItems.push({
      product_id: product.id,
      product_name: product.name ?? '',
      product_image: product.image_urls?.[0] ?? null,
      product_brand: product.brand ?? null,
      product_category: product.category ?? '',
      product_subtype: product.subtype ?? null,
      product_flavor: product.flavor ?? null,
      product_weight: product.weight ?? null,
      unit_price: unitPriceInPaise / 100,
      quantity,
      mrp,
      total_price: (unitPriceInPaise * quantity) / 100,
    })
  }

  if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
    return json({ error: 'Payment amount must be at least ₹1.00.' }, 400)
  }

  const totalAmount = amountInPaise / 100
  const deliveryEstimate =
    address.pincode === '262308' ? 'Same Day Delivery' : '2-3 Business Days'
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      address_id: address.id,
      total_amount: totalAmount,
      order_status: 'pending',
      payment_status: 'pending',
      payment_method: 'online',
      shipping_name: address.full_name,
      shipping_phone: address.phone,
      shipping_address: address.address,
      shipping_landmark: address.landmark,
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_pincode: address.pincode,
      delivery_estimate: deliveryEstimate,
    })
    .select('id, created_at')
    .single()

  if (orderError || !order) {
    return json({ error: orderError?.message ?? 'Unable to save order.' }, 500)
  }

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })))

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return json({ error: 'Unable to save order items.' }, 500)
  }

  const { error: paymentError } = await supabase.from('payments').insert({
    order_id: order.id,
    user_id: user.id,
    amount: totalAmount,
    payment_method: 'razorpay',
    payment_status: 'pending',
  })

  if (paymentError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return json({ error: 'Unable to save payment.' }, 500)
  }

  let razorpayResponse: Response

  try {
    razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpaySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.id,
        notes: { local_order_id: order.id, user_id: user.id },
      }),
    })
  } catch {
    await Promise.all([
      supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order.id),
      supabase
        .from('payments')
        .update({
          payment_status: 'failed',
          failure_reason: 'Unable to reach Razorpay.',
        })
        .eq('order_id', order.id),
    ])
    return json({ error: 'Unable to reach Razorpay.' }, 502)
  }

  const razorpayOrder = await razorpayResponse.json().catch(() => null)

  if (
    !razorpayResponse.ok ||
    typeof razorpayOrder?.id !== 'string' ||
    razorpayOrder.amount !== amountInPaise ||
    razorpayOrder.currency !== 'INR'
  ) {
    const reason =
      razorpayOrder?.error?.description ?? 'Razorpay order creation failed.'
    await Promise.all([
      supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order.id),
      supabase
        .from('payments')
        .update({ payment_status: 'failed', failure_reason: reason })
        .eq('order_id', order.id),
    ])
    return json({ error: reason }, 502)
  }

  const { error: saveRazorpayIdError } = await supabase
    .from('payments')
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq('order_id', order.id)
    .eq('payment_status', 'pending')

  if (saveRazorpayIdError) {
    await Promise.all([
      supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order.id),
      supabase
        .from('payments')
        .update({
          payment_status: 'failed',
          failure_reason: 'Unable to save Razorpay order ID.',
        })
        .eq('order_id', order.id),
    ])
    return json({ error: 'Unable to save Razorpay order.' }, 500)
  }

  return json(
    {
      localOrderId: order.id,
      keyId: razorpayKeyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      createdAt: order.created_at,
    },
    201,
  )
})
