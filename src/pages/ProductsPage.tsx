import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '../components/common/EmptyState'
import { Loader } from '../components/common/Loader'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductSearch } from '../components/product/ProductSearch'

import { categories } from '../constants/categories'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { getAllProducts } from '../services/productService'

import type { Product } from '../types/product'

import { setDocumentMeta } from '../utils/seo'

const INITIAL_PRODUCT_LIMIT = 20
const LOAD_MORE_PRODUCT_LIMIT = 10

const ProductsPage = () => {
  const [searchParams] = useSearchParams()

  const categorySlug = searchParams.get('category')
  const isFeaturedView = searchParams.get('featured') === 'true'

  const selectedCategory = categories.find(
    (category) => category.slug === categorySlug,
  )

  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreProducts, setHasMoreProducts] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [loadMoreError, setLoadMoreError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const loadMoreRequestRef = useRef(0)

  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMoreProducts) return

    const requestId = ++loadMoreRequestRef.current

    try {
      setIsLoadingMore(true)
      setLoadMoreError('')

      const nextPage = await getAllProducts({
        category: selectedCategory?.dbValue,
        featuredOnly: isFeaturedView,
        search: searchTerm,
        offset: products.length,
        limit: LOAD_MORE_PRODUCT_LIMIT,
      })

      if (requestId !== loadMoreRequestRef.current) return

      setProducts((currentProducts) => [
        ...currentProducts,
        ...nextPage.products,
      ])
      setHasMoreProducts(nextPage.hasMore)
    } catch (error) {
      if (requestId !== loadMoreRequestRef.current) return

      setLoadMoreError(
        error instanceof Error ? error.message : 'Unable to load more products.',
      )
      setHasMoreProducts(false)
    } finally {
      if (requestId === loadMoreRequestRef.current) {
        setIsLoadingMore(false)
      }
    }
  }, [
    hasMoreProducts,
    isFeaturedView,
    isLoadingMore,
    products.length,
    searchTerm,
    selectedCategory?.dbValue,
  ])

  const infiniteScrollRef = useInfiniteScroll({
    hasMore: hasMoreProducts,
    isLoading: isLoadingMore,
    onLoadMore: loadMoreProducts,
  })

  useEffect(() => {
    setDocumentMeta({
      title: isFeaturedView
        ? 'Featured Products | X-Box Nutrition'
        : selectedCategory
          ? `${selectedCategory.title} | X-Box Nutrition`
          : 'Shop Supplements | X-Box Nutrition',
      description: isFeaturedView
        ? 'Browse all featured supplements from X-Box Nutrition.'
        : 'Browse whey protein, creatine, pre-workout, vitamins, and premium gym supplements.',
    })

    let isMounted = true

    const loadProducts = async () => {
      try {
        loadMoreRequestRef.current += 1
        setIsLoadingProducts(true)
        setIsLoadingMore(false)
        setProducts([])
        setHasMoreProducts(false)
        setLoadMoreError('')

        const firstPage = await getAllProducts({
          category: selectedCategory?.dbValue,
          featuredOnly: isFeaturedView,
          search: searchTerm,
          offset: 0,
          limit: INITIAL_PRODUCT_LIMIT,
        })

        if (isMounted) {
          setProducts(firstPage.products)
          setHasMoreProducts(firstPage.hasMore)
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
  }, [isFeaturedView, searchTerm, selectedCategory])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">
        {isFeaturedView
          ? 'Featured Products'
          : selectedCategory
          ? selectedCategory.title
          : 'All Products'}
      </h1>

      <p className="mt-2 text-zinc-400">
        {isFeaturedView
          ? 'Explore all supplements currently selected as featured.'
          : selectedCategory?.description ??
            'Clean formulas, strong ingredients, and supplements built for consistent progress.'}
      </p>

      <div className="mt-6 flex justify-end">
        <ProductSearch
          value={searchInput}
          onChange={setSearchInput}
          onSearch={setSearchTerm}
          isLoading={isLoadingProducts}
        />
      </div>

      <div className="mt-7">
        {isLoadingProducts ? (
          <Loader />
        ) : productsError ? (
          <EmptyState
            title="Unable to load products"
            description={productsError}
          />
        ) : products.length ? (
          <>
            <ProductGrid products={products} />

            {hasMoreProducts && (
              <div
                ref={infiniteScrollRef}
                className="flex h-20 items-center justify-center"
                aria-hidden={!isLoadingMore}
              >
                {isLoadingMore && (
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400"
                    role="status"
                    aria-label="Loading more products"
                  />
                )}
              </div>
            )}

            {loadMoreError && (
              <p className="mt-5 text-center text-sm text-red-400">
                {loadMoreError}
              </p>
            )}
          </>
        ) : (
          <EmptyState
            title={
              searchTerm
                ? 'No matching products'
                : isFeaturedView
                  ? 'No featured products'
                  : 'No products found'
            }
            description={
              searchTerm
                ? `No products were found for "${searchTerm}".`
                : isFeaturedView
                ? 'There are no featured products yet.'
                : 'There are no products in this category yet.'
            }
          />
        )}
      </div>
    </section>
  )
}

export default ProductsPage
