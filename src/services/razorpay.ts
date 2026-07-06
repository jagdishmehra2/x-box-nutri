import { supabase } from '../lib/supabase'

const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let razorpayScriptPromise: Promise<boolean> | null = null

interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayFailureResponse {
  error?: {
    code?: string
    description?: string
    source?: string
    step?: string
    reason?: string
    metadata?: {
      order_id?: string
      payment_id?: string
    }
  }
}

interface RazorpayInstance {
  open: () => void
  close?: () => void
  on: (
    event: 'payment.failed',
    callback: (response: RazorpayFailureResponse) => void,
  ) => void
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

interface OpenRazorpayCheckoutOptions {
  key: string
  orderId: string
  amount: number
  currency: string
  name: string
  description?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  themeColor?: string
  onSuccess: (response: RazorpaySuccessResponse) => void
  onDismiss?: () => void
  onFailure?: (response: RazorpayFailureResponse) => void
}

interface CreateRazorpayOrderInput {
  addressId: string
  items: Array<{
    productId: string
    quantity: number
  }>
}

interface CreateRazorpayOrderResponse {
  localOrderId: string
  keyId: string
  amount: number
  currency: string
  razorpayOrderId: string
  createdAt: string
}

interface VerifyRazorpayPaymentInput extends RazorpaySuccessResponse {
  local_order_id: string
}

interface VerifyRazorpayPaymentResponse {
  localOrderId: string
  paymentId: string
  amount: number
  paymentStatus: 'paid'
}

interface ReportRazorpayFailureInput {
  local_order_id: string
  razorpay_order_id: string
  failure_reason?: string
  payment_failed: true
}

const getFunctionError = async (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'context' in error) {
    const context = (error as { context?: unknown }).context

    if (context instanceof Response) {
      try {
        const body = (await context.clone().json()) as { error?: unknown }
        if (typeof body.error === 'string') return body.error
      } catch {
        // Use the SDK error below when the response is not JSON.
      }
    }
  }

  return error instanceof Error && error.message ? error.message : fallback
}

export const createRazorpayOrder = async (
  input: CreateRazorpayOrderInput,
): Promise<CreateRazorpayOrderResponse> => {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.functions.invoke(
    'create-razorpay-order',
    { body: input },
  )

  if (error) {
    throw new Error(
      await getFunctionError(error, 'Unable to create payment order.'),
    )
  }

  return data as CreateRazorpayOrderResponse
}

export const verifyRazorpayPayment = async (
  input: VerifyRazorpayPaymentInput,
): Promise<VerifyRazorpayPaymentResponse> => {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.functions.invoke(
    'verify-razorpay-payment',
    { body: input },
  )

  if (error) {
    throw new Error(
      await getFunctionError(error, 'Payment verification failed.'),
    )
  }

  return data as VerifyRazorpayPaymentResponse
}

export const reportRazorpayPaymentFailure = async (
  input: ReportRazorpayFailureInput,
) => {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.functions.invoke(
    'verify-razorpay-payment',
    { body: input },
  )

  if (error) {
    throw new Error(
      await getFunctionError(error, 'Unable to update failed payment.'),
    )
  }

  if (data?.paymentStatus !== 'failed') {
    throw new Error('Unable to update failed payment.')
  }
}

export const loadRazorpayScript = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  if (window.Razorpay) return true

  if (razorpayScriptPromise) {
    return razorpayScriptPromise
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SRC}"]`,
    )

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      existingScript.addEventListener('load', () => resolve(true), {
        once: true,
      })
      existingScript.addEventListener('error', () => resolve(false), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_CHECKOUT_SRC
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)

    document.body.appendChild(script)
  })

  return razorpayScriptPromise
}

export const openRazorpayCheckout = async (
  options: OpenRazorpayCheckoutOptions,
) => {
  const isLoaded = await loadRazorpayScript()

  if (!isLoaded || !window.Razorpay) {
    throw new Error(
      'Unable to load Razorpay Checkout. Please check your internet connection and try again.',
    )
  }

  const checkoutOptions = {
    key: options.key,
    order_id: options.orderId,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    handler: options.onSuccess,
    prefill: options.prefill,
    notes: options.notes,
    theme: {
      color: options.themeColor ?? '#a3e635',
    },
    modal: {
      ondismiss: options.onDismiss,
    },
  }

  const razorpay = new window.Razorpay(checkoutOptions)

  razorpay.on('payment.failed', (response) => {
    options.onFailure?.(response)
    razorpay.close?.()
  })

  razorpay.open()
}

export type { RazorpaySuccessResponse, RazorpayFailureResponse }
