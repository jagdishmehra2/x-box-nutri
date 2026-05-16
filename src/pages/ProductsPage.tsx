import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { getAllProducts } from '../services/productService'
import { setDocumentMeta } from '../utils/seo'

const ProductsPage = () => {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')

  const products = getAllProducts().filter((product) => {
    if (!category) return true
    return product.category === category
  })

  useEffect(() => {
    setDocumentMeta({
      title: 'Shop Supplements | X-Box Nutrition',
      description:
        'Browse whey protein, creatine, pre-workout, vitamins, and premium gym supplements.',
    })
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">All Products</h1>
      <p className="mt-2 text-zinc-400">
        Clean formulas, strong ingredients, and supplements built for consistent progress.
      </p>

      <div className="mt-7">
        <ProductGrid products={products} />
      </div>
    </section>
  )
}

export default ProductsPage
