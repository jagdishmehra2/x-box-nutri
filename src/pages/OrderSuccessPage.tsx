import { format } from 'date-fns'
import { CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { formatCurrency } from '../utils/currency'
import { setDocumentMeta } from '../utils/seo'

interface OrderSuccessState {
  orderId?: string
  paymentId?: string
  amount?: number
  createdAt?: string
}

const OrderSuccessPage = () => {
  const location = useLocation()
  const state = (location.state ?? {}) as OrderSuccessState

  useEffect(() => {
    setDocumentMeta({
      title: 'Order Success | NutriStack',
      description: 'Your order has been placed successfully.',
    })
  }, [])

  const orderDate = state.createdAt
    ? format(new Date(state.createdAt), 'dd MMM yyyy, hh:mm a')
    : null

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-lime-400" />
        <h1 className="mt-4 text-4xl font-semibold text-white">Order Confirmed</h1>
        <p className="mt-2 text-zinc-400">
          Payment was successful and your order has been saved.
        </p>
      </header>

      <article className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Payment Details</h2>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Order ID</span>
            <span className="max-w-[60%] truncate text-right text-zinc-100">
              {state.orderId ?? 'Not available'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Payment ID</span>
            <span className="max-w-[60%] truncate text-right text-zinc-100">
              {state.paymentId ?? 'Not available'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Amount Paid</span>
            <span className="text-zinc-100">
              {typeof state.amount === 'number'
                ? formatCurrency(state.amount)
                : 'Not available'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Date</span>
            <span className="text-zinc-100">{orderDate ?? 'Not available'}</span>
          </div>
        </div>
      </article>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/orders">
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
            View Orders
          </Button>
        </Link>
        <Link to="/products">
          <Button size="lg" className="w-full sm:w-auto">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default OrderSuccessPage
