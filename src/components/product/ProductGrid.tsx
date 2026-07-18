import type { Product } from '../../types/product'
import { cn } from '../../utils/cn'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  className?: string
}

export const ProductGrid = ({ products, className }: ProductGridProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3',
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
