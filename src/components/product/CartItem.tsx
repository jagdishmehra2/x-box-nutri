import { Trash2 } from 'lucide-react'
import { useAppDispatch } from '../../hooks/useRedux'
import { removeFromCart, updateQuantity } from '../../features/cart/cartSlice'
import type { CartItem as CartItemType } from '../../types/product'
import { formatCurrency } from '../../utils/currency'
import { QuantitySelector } from './QuantitySelector'

interface CartItemProps {
  item: CartItemType
}

export const CartItem = ({ item }: CartItemProps) => {
  const dispatch = useAppDispatch()

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex gap-4">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="h-20 w-20 rounded-lg object-cover"
          loading="lazy"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-white">{item.product.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">{formatCurrency(item.product.price)}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <QuantitySelector
              value={item.quantity}
              onChange={(nextValue) =>
                dispatch(
                  updateQuantity({
                    productId: item.product.id,
                    quantity: Math.max(1, nextValue),
                  }),
                )
              }
            />
            <button
              className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
              onClick={() => dispatch(removeFromCart(item.product.id))}
              aria-label={`Remove ${item.product.name} from cart`}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
