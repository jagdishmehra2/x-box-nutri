import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import {
  addToCart,
  removeFromCart,
  toggleWishlist,
  updateQuantity,
} from "../../features/cart/cartSlice";
import { MAX_ORDER_QUANTITY } from "src/constants/categories";
import type { Product } from "../../types/product";
import { formatCurrency } from "../../utils/currency";
import { Button } from "../common/Button";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();

  const isInWishlist = useAppSelector((state) =>
    state.cart.wishlist.includes(product.id),
  );

  const cartItem = useAppSelector((state) =>
    state.cart.items.find((item) => item.product.id === product.id),
  );

  const quantity = cartItem?.quantity ?? 0;

  const isOutOfStock = product.stock <= 0;
  const hasReachedStockLimit = quantity >= product.stock;
  const hasReachedOrderLimit = quantity >= MAX_ORDER_QUANTITY;
  const canIncrement = !hasReachedStockLimit && !hasReachedOrderLimit;

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart`);
  };

  const handleIncrement = () => {
    if (!canIncrement) {
      toast.error(
        hasReachedOrderLimit
          ? `Limit ${MAX_ORDER_QUANTITY} per order`
          : "No more stock available",
      );
      return;
    }
    dispatch(updateQuantity({ productId: product.id, quantity: quantity + 1 }));
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      dispatch(removeFromCart(product.id));
      return;
    }
    dispatch(updateQuantity({ productId: product.id, quantity: quantity - 1 }));
  };

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 sm:rounded-2xl"
    >
      <Link className="block overflow-hidden" to={`/products/${product.slug}`}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-36 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-52"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
        <div className="flex flex-1 items-start justify-between gap-1 sm:gap-3">
          <div className="min-w-0">
            <Link
              to={`/products/${product.slug}`}
              className="block truncate text-sm font-semibold text-white hover:text-lime-300 sm:text-base"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400 sm:mt-1 sm:text-sm">
              {product.shortDescription}
            </p>
          </div>
          <button
            className="shrink-0 rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-lime-300 sm:p-2"
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
            onClick={() => dispatch(toggleWishlist(product.id))}
          >
            <Heart
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isInWishlist ? "fill-lime-300 text-lime-300" : ""}`}
            />
          </button>
        </div>

        <div className="flex min-w-0 flex-col items-stretch gap-2 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between min-[400px]:gap-1 sm:gap-3">
          <div className="min-w-0">
            {product.discountPrice ? (
              <>
                <div className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-2">
                  <p className="whitespace-nowrap text-base font-semibold leading-tight text-lime-400 sm:text-lg">
                    {formatCurrency(product.discountPrice)}
                  </p>

                  <p className="whitespace-nowrap text-[11px] leading-tight text-zinc-500 line-through sm:text-sm">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <p className="mt-1 text-[10px] font-medium leading-none text-green-400 sm:text-xs">
                  {Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100,
                  )}
                  % OFF
                </p>
              </>
            ) : (
              <p className="whitespace-nowrap text-base font-semibold text-lime-400 sm:text-lg">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex shrink-0 self-end flex-col items-end gap-1">
              <div
                className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-1 py-1 sm:gap-3 sm:px-2 sm:py-1.5"
                role="group"
                aria-label={`${product.name} quantity`}
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="rounded p-1 text-zinc-300 transition hover:text-lime-300"
                >
                  <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
                <span className="w-3 text-center text-xs font-semibold text-white sm:w-4 sm:text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={!canIncrement}
                  aria-label="Increase quantity"
                  className="rounded p-1 text-zinc-300 transition hover:text-lime-300 disabled:cursor-not-allowed disabled:text-zinc-600 disabled:hover:text-zinc-600"
                >
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
              {hasReachedOrderLimit && (
                <span className="text-[9px] text-zinc-500 sm:text-[11px]">
                  Max {MAX_ORDER_QUANTITY} per order
                </span>
              )}
              {!hasReachedOrderLimit && hasReachedStockLimit && (
                <span className="text-[9px] text-zinc-500 sm:text-[11px]">
                  Only {product.stock} left
                </span>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              className="h-8 w-8 shrink-0 self-end px-0 text-xs sm:h-9 sm:w-auto sm:px-3 sm:text-sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={`Add ${product.name} to cart`}
            >
              {!isOutOfStock && (
                <ShoppingCart className="h-3.5 w-3.5 sm:mr-1 sm:h-4 sm:w-4" />
              )}
              <span
                className={
                  isOutOfStock ? "text-[10px] sm:text-sm" : "hidden sm:inline"
                }
              >
                {isOutOfStock ? "Out" : "Add"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
