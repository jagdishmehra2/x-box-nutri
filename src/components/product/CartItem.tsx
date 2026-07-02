import { Trash2 } from "lucide-react";
import { useAppDispatch } from "../../hooks/useRedux";
import { removeFromCart, updateQuantity } from "../../features/cart/cartSlice";
import { MAX_ORDER_QUANTITY } from "src/constants/categories";
import type { CartItem as CartItemType } from "../../types/product";
import { formatCurrency } from "../../utils/currency";
import { QuantitySelector } from "./QuantitySelector";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const dispatch = useAppDispatch();

  const maxQuantity = Math.min(item.product.stock, MAX_ORDER_QUANTITY);
console.log({
  stock: item.product.stock,
  MAX_ORDER_QUANTITY,
  maxQuantity,
});
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
          <div className="mt-1">
            {item.product.discountPrice ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lime-400">
                    {formatCurrency(item.product.discountPrice)}
                  </p>

                  <p className="text-sm text-zinc-500 line-through">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>

                <p className="text-xs font-medium text-green-400">
                  {Math.round(
                    ((item.product.price - item.product.discountPrice) /
                      item.product.price) *
                      100,
                  )}
                  % OFF
                </p>
              </>
            ) : (
              <p className="font-semibold text-lime-400">
                {formatCurrency(item.product.price)}
              </p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <QuantitySelector
                value={item.quantity}
                max={maxQuantity}
                onChange={(nextValue) =>
                  dispatch(
                    updateQuantity({
                      productId: item.product.id,
                      quantity: Math.max(1, Math.min(nextValue, maxQuantity)),
                    }),
                  )
                }
              />
              {item.quantity >= maxQuantity && (
                <span className="text-[11px] text-zinc-500">
                  {maxQuantity === MAX_ORDER_QUANTITY
                    ? `Max ${MAX_ORDER_QUANTITY} per order`
                    : `Only ${item.product.stock} left`}
                </span>
              )}
            </div>
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
  );
};