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
      className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
    >
      <Link to={`/products/${product.slug}`}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              to={`/products/${product.slug}`}
              className="text-base font-semibold text-white hover:text-lime-300"
            >
              {product.name}
            </Link>
            <p className="mt-1 text-sm text-zinc-400">
              {product.shortDescription}
            </p>
          </div>
          <button
            className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-lime-300"
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
            onClick={() => dispatch(toggleWishlist(product.id))}
          >
            <Heart
              className={`h-4 w-4 ${isInWishlist ? "fill-lime-300 text-lime-300" : ""}`}
            />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            {product.discountPrice ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-lime-400">
                    {formatCurrency(product.discountPrice)}
                  </p>

                  <p className="text-sm text-zinc-500 line-through">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <p className="text-xs font-medium text-green-400">
                  {Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100,
                  )}
                  % OFF
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold text-lime-400">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex flex-col items-end gap-1">
              <div
                className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5"
                role="group"
                aria-label={`${product.name} quantity`}
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="rounded p-1 text-zinc-300 transition hover:text-lime-300"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-4 text-center text-sm font-semibold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={!canIncrement}
                  aria-label="Increase quantity"
                  className="rounded p-1 text-zinc-300 transition hover:text-lime-300 disabled:cursor-not-allowed disabled:text-zinc-600 disabled:hover:text-zinc-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {hasReachedOrderLimit && (
                <span className="text-[11px] text-zinc-500">
                  Max {MAX_ORDER_QUANTITY} per order
                </span>
              )}
              {!hasReachedOrderLimit && hasReachedStockLimit && (
                <span className="text-[11px] text-zinc-500">
                  Only {product.stock} left
                </span>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              {isOutOfStock ? "Out" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
};