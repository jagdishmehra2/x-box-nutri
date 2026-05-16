import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/useRedux'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { formatCurrency } from '../utils/currency'
import { setDocumentMeta } from '../utils/seo'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const items = useAppSelector((state) => state.cart.items)
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )

  useEffect(() => {
    setDocumentMeta({
      title: 'Checkout | X-Box Nutrition',
      description: 'Secure checkout for your selected nutrition products.',
    })
  }, [])

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
      <h1 className="text-4xl font-semibold text-white">Checkout</h1>
      <p className="mt-2 text-zinc-400">
        Stripe Checkout will be triggered via secure backend logic in the next step.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold text-white">Order Total</h2>
        <p className="mt-3 text-3xl font-bold text-lime-400">{formatCurrency(subtotal)}</p>

        <p className="mt-5 text-sm text-zinc-400">
          For security, payment session creation should happen in a Supabase Edge Function, not directly in frontend code.
        </p>

        <Link to="/order-success" className="mt-6 block">
          <Button className="w-full" size="lg">
            Continue (Demo Success Page)
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default CheckoutPage
