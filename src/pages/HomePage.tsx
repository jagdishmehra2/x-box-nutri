import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { Loader } from '../components/common/Loader'
import { categories } from '../constants/categories'
import { getFeaturedProducts } from '../services/productService'
import type { Product } from '../types/product'
import { setDocumentMeta } from '../utils/seo'
import { CategoryCard } from '../components/home/CategoryCard'
import { FaqSection } from '../components/home/FaqSection'
import { HeroSection } from '../components/home/HeroSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { ProductGrid } from '../components/product/ProductGrid'

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState('')

  useEffect(() => {
    setDocumentMeta({
      title: 'NutriStack-Smart Nutrition Store',
      description:
        'Buy premium whey protein, creatine, pre-workout, vitamins, and gym nutrition products from NutriStack.',
    })

    let isMounted = true

    const loadProducts = async () => {
      try {
        const products = await getFeaturedProducts()
        if (isMounted) {
          setFeaturedProducts(products)
        }
      } catch (error) {
        if (isMounted) {
          setProductsError(
            error instanceof Error ? error.message : 'Unable to load featured products.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold text-white">Featured Products</h2>
          <Link to="/products?featured=true" className="text-sm font-semibold text-lime-400 hover:text-lime-300">
            View all
          </Link>
        </div>
        {isLoadingProducts ? (
          <Loader />
        ) : productsError ? (
          <EmptyState
            title="Unable to load products"
            description={productsError}
          />
        ) : featuredProducts.length ? (
          <ProductGrid
            products={featuredProducts}
            className="[&>article:nth-child(n+5)]:hidden lg:[&>article:nth-child(n+4)]:hidden"
          />
        ) : (
          <EmptyState
            title="No featured products"
            description="Featured products from Supabase will appear here."
          />
        )}
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

      <TestimonialsSection />
      <FaqSection />
    </>
  )
}

export default HomePage
