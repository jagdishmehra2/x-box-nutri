export type ProductCategory =
  | 'whey-protein'
  | 'creatine'
  | 'pre-workout'
  | 'protein-bars'
  | 'vitamins'

export interface Product {
  id: string
  slug: string
  name: string
  category: ProductCategory
  price: number
  compareAtPrice?: number
  rating: number
  reviewCount: number
  image: string
  shortDescription: string
  description: string
  inStock: boolean
  featured?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}
