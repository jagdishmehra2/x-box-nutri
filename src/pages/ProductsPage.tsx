import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '../components/common/EmptyState'
import { Loader } from '../components/common/Loader'
import { ProductGrid } from '../components/product/ProductGrid'

import { categories } from '../constants/categories'
import { getAllProducts } from '../services/productService'

import type { Product } from '../types/product'

import { setDocumentMeta } from '../utils/seo'

const ProductsPage = () => {
  const [searchParams] = useSearchParams()

  const categorySlug = searchParams.get('category')

  const selectedCategory = categories.find(
    (category) => category.slug === categorySlug,
  )

  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState('')

  useEffect(() => {
    setDocumentMeta({
      title: selectedCategory
        ? `${selectedCategory.title} | X-Box Nutrition`
        : 'Shop Supplements | X-Box Nutrition',
      description:
        'Browse whey protein, creatine, pre-workout, vitamins, and premium gym supplements.',
    })

    let isMounted = true

    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true)

        const products = await getAllProducts(
          selectedCategory?.dbValue,
        )

        if (isMounted) {
          setProducts(products)
          setProductsError('')
        }
      } catch (error) {
        if (isMounted) {
          setProductsError(
            error instanceof Error
              ? error.message
              : 'Unable to load products.',
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
  }, [selectedCategory])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">
        {selectedCategory
          ? selectedCategory.title
          : 'All Products'}
      </h1>

      <p className="mt-2 text-zinc-400">
        {selectedCategory?.description ??
          'Clean formulas, strong ingredients, and supplements built for consistent progress.'}
      </p>

      <div className="mt-7">
        {isLoadingProducts ? (
          <Loader />
        ) : productsError ? (
          <EmptyState
            title="Unable to load products"
            description={productsError}
          />
        ) : products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="No products found"
            description="There are no products in this category yet."
          />
        )}
      </div>
    </section>
  )
}

export default ProductsPage