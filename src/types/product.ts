export type ProductCategory = string

export interface Product {
  id: string
  slug: string

  name: string
  brand?: string

  category: ProductCategory
  subtype?: string

  flavor?: string
  weight?: string

  price: number
  discountPrice?: number

  rating: number
  reviewCount: number

  image: string
  images?: string[]

  shortDescription: string
  description: string
  ingredients?: string | string[]
  benefits?: string | string[]
  tags?: string[]
  warnings?: string | string[]

  stock: number
  inStock: boolean

  featured?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}
