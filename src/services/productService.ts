import { products } from '../constants/products'

export const getAllProducts = () => products

export const getFeaturedProducts = () => products.filter((product) => product.featured)

export const getProductBySlug = (slug: string) => {
  return products.find((product) => product.slug === slug)
}
