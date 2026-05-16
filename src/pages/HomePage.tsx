import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../constants/categories'
import { getFeaturedProducts } from '../services/productService'
import { setDocumentMeta } from '../utils/seo'
import { CategoryCard } from '../components/home/CategoryCard'
import { HeroSection } from '../components/home/HeroSection'
import { ProductGrid } from '../components/product/ProductGrid'

const HomePage = () => {
  const featuredProducts = getFeaturedProducts()

  useEffect(() => {
    setDocumentMeta({
      title: 'X-Box Nutrition | Premium Gym Supplements',
      description:
        'Buy premium whey protein, creatine, pre-workout, vitamins, and gym nutrition products from X-Box Nutrition.',
    })
  }, [])

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold text-white">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-lime-400 hover:text-lime-300">
            View all
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold text-white">Shop by Category</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.slug} to={`/products?category=${category.slug}`}>
              <CategoryCard category={category} />
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

export default HomePage
