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
  })

  razorpay.open()
}

export type { RazorpaySuccessResponse, RazorpayFailureResponse }
