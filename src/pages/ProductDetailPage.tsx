import { useEffect } from 'react'
import { Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch } from '../hooks/useRedux'
import { Button } from '../components/common/Button'
import { addToCart } from '../features/cart/cartSlice'
import { getProductBySlug } from '../services/productService'
import { formatCurrency } from '../utils/currency'
import { setDocumentMeta } from '../utils/seo'

const ProductDetailPage = () => {
  const { slug = '' } = useParams()
  const dispatch = useAppDispatch()

  const product = getProductBySlug(slug)

  useEffect(() => {
    if (!product) {
      setDocumentMeta({
        title: 'Product Not Found | X-Box Nutrition',
        description: 'The product you are looking for could not be found.',
      })
      return
    }

    setDocumentMeta({
      title: `${product.name} | X-Box Nutrition`,
      description: product.shortDescription,
    })
  }, [product])

  if (!product) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-white">Product not found</h1>
        <p className="mt-2 text-zinc-400">The product may have been removed or renamed.</p>
        <Link to="/products" className="mt-6 inline-block text-lime-400 hover:text-lime-300">
          Go back to products
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <img
          src={product.image}
          alt={product.name}
          className="h-[420px] w-full rounded-3xl border border-zinc-800 object-cover"
        />

        <article>
          <p className="text-sm uppercase tracking-wide text-lime-400">{product.category.replace('-', ' ')}</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
            <Star className="h-4 w-4 fill-lime-300 text-lime-300" />
            <span>
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <p className="mt-4 text-zinc-300">{product.description}</p>

          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-semibold text-lime-400">{formatCurrency(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-sm text-zinc-500 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() => dispatch(addToCart(product))}
              disabled={!product.inStock}
              aria-label={`Add ${product.name} to cart`}
            >
              {product.inStock ? 'Add To Cart' : 'Out of Stock'}
            </Button>
            <Link to="/cart">
              <Button size="lg" variant="secondary">
                Go To Cart
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}

export default ProductDetailPage
