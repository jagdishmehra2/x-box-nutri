import { motion } from 'framer-motion'
import { Heart, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { addToCart, toggleWishlist } from '../../features/cart/cartSlice'
import type { Product } from '../../types/product'
import { formatCurrency } from '../../utils/currency'
import { Button } from '../common/Button'

interface ProductCardProps {
  product: Product
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch()
  const isInWishlist = useAppSelector((state) =>
    state.cart.wishlist.includes(product.id),
  )

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
            <Link to={`/products/${product.slug}`} className="text-base font-semibold text-white hover:text-lime-300">
              {product.name}
            </Link>
            <p className="mt-1 text-sm text-zinc-400">{product.shortDescription}</p>
          </div>
          <button
            className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-lime-300"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => dispatch(toggleWishlist(product.id))}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-lime-300 text-lime-300' : ''}`} />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-semibold text-lime-400">{formatCurrency(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-xs text-zinc-500 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <Button
            size="sm"
            onClick={() => dispatch(addToCart(product))}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            {product.inStock ? 'Add' : 'Out'}
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
