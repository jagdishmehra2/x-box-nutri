import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { CartItem } from '../components/product/CartItem'
import { clearCart } from '../features/cart/cartSlice'
import { formatCurrency } from '../utils/currency'
import { setDocumentMeta } from '../utils/seo'

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)

const subtotal = items.reduce(
  (total, item) =>
    total +
    (item.product.discountPrice ??
      item.product.price) *
      item.quantity,
  0,
)

  useEffect(() => {
    setDocumentMeta({
      title: 'Your Cart | NutriStack',
      description: 'Review your selected supplements and proceed to checkout.',
    })
  }, [])

  if (!items.length) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState
          title="Your cart is empty"
          description="Add whey, creatine, and other essentials to start your order."
          actionLabel="Browse Products"
          onAction={() => navigate('/products')}
        />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Your Cart</h1>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl font-semibold text-white">Order Summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-300">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-zinc-300">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="mt-4 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between text-base font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <Link to="/checkout" className="mt-5 block">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => dispatch(clearCart())}
          >
            Clear Cart
          </Button>
        </aside>
      </div>
    </section>
  )
}

export default CartPage
