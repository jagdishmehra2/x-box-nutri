import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { clearCart } from '../features/cart/cartSlice'
import { supabase } from '../lib/supabase'
import {
  openRazorpayCheckout,
  type RazorpayFailureResponse,
} from '../services/razorpay'
import { formatCurrency } from '../utils/currency'
import { setDocumentMeta } from '../utils/seo'

const RazorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const items = useAppSelector((state) => state.cart.items)
  const user = useAppSelector((state) => state.auth.user)

  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    )
  }, [items])

  const amountInPaise = Math.round(subtotal * 100)

  useEffect(() => {
    setDocumentMeta({
      title: 'Checkout | X-Box Nutrition',
      description: 'Complete your payment securely with Razorpay Checkout.',
    })
  }, [])

  const saveOrderInSupabase = async (paymentId: string, razorpayOrderId?: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured for order storage.')
    }

    if (!user?.id) {
      throw new Error('You must be logged in to place an order.')
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: subtotal,
        payment_status: 'paid',
        order_status: 'confirmed',
        razorpay_payment_id: paymentId,
        razorpay_order_id: razorpayOrderId ?? null,
      })
      .select('id, created_at')
      .single()

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'Unable to create order record.')
    }

    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }))

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)

    if (orderItemsError) {
      throw new Error(orderItemsError.message)
    }

    return order
  }

  const handlePaymentFailure = (response: RazorpayFailureResponse) => {
    const message =
      response.error?.description ??
      'Payment failed. Please try again with a different method.'

    toast.error(message)
    setIsProcessingPayment(false)
  }

  const handlePayNow = async () => {
    if (!items.length) {
      toast.error('Your cart is empty.')
      return
    }

    if (!RazorpayKeyId) {
      toast.error('Razorpay key is missing. Set VITE_RAZORPAY_KEY_ID in .env.')
      return
    }

    if (!user?.id) {
      toast.error('Please login before checkout.')
      navigate('/login', { replace: true, state: { from: { pathname: '/checkout' } } })
      return
    }

    if (amountInPaise < 100) {
      toast.error('Minimum payment amount is ₹1.00.')
      return
    }

    setIsProcessingPayment(true)

    try {
      await openRazorpayCheckout({
        key: RazorpayKeyId,
        amount: amountInPaise,
        currency: 'INR',
        name: 'X-BOX NUTRITION',
        description: `Payment for ${items.length} item${items.length > 1 ? 's' : ''}`,
        prefill: {
          email: user.email,
        },
        notes: {
          app: 'x-box-nutrition',
          user_id: user.id,
        },
        onDismiss: () => {
          toast('Payment popup closed.')
          setIsProcessingPayment(false)
        },
        onFailure: handlePaymentFailure,
        onSuccess: async (paymentResponse) => {
          try {
            const savedOrder = await saveOrderInSupabase(
              paymentResponse.razorpay_payment_id,
              paymentResponse.razorpay_order_id,
            )

            dispatch(clearCart())
            toast.success('Payment successful. Order created.')

            navigate('/order-success', {
              replace: true,
              state: {
                orderId: savedOrder.id,
                amount: subtotal,
                paymentId: paymentResponse.razorpay_payment_id,
                createdAt: savedOrder.created_at,
              },
            })
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Payment succeeded but order saving failed.'

            toast.error(message)
          } finally {
            setIsProcessingPayment(false)
          }
        },
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to open checkout. Please try again.'

      toast.error(message)
      setIsProcessingPayment(false)
    }
  }

  if (!items.length) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState
          title="No items to checkout"
          description="Add products to your cart before entering checkout."
          actionLabel="Go to Products"
          onAction={() => navigate('/products')}
        />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-4xl font-semibold text-white">Checkout</h1>
        <p className="mt-2 text-zinc-400">
          Complete your payment through Razorpay. After successful payment, your order is saved in Supabase.
        </p>
      </header>

      <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold text-white">Order Summary</h2>

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3 text-sm"
            >
              <p className="text-zinc-300">
                {item.product.name} <span className="text-zinc-500">x {item.quantity}</span>
              </p>
              <p className="font-medium text-zinc-100">
                {formatCurrency(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
          <p className="text-sm text-zinc-400">Total</p>
          <p className="text-3xl font-bold text-lime-400">{formatCurrency(subtotal)}</p>
        </div>

        <Button
          className="mt-6 w-full"
          size="lg"
          onClick={handlePayNow}
          disabled={isProcessingPayment}
          aria-label="Pay now using Razorpay"
        >
          {isProcessingPayment ? 'Processing...' : 'Pay Now'}
        </Button>

        <p className="mt-3 text-xs text-zinc-500">
          MVP note: payment signature verification must be done on backend (recommended via Supabase Edge Function) before marking orders as paid in production.
        </p>
      </article>
    </section>
  )
}

export default CheckoutPage
