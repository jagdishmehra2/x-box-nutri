import type { Product } from '../../types/product'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
