import type { Product } from '../types/product'

export const products: Product[] = [
  {
    id: 'whey-1',
    slug: 'isolate-whey-vanilla',
    name: 'Isolate Whey Vanilla',
    category: 'whey-protein',
    price: 79.99,
    discountPrice: 64.99,
    rating: 4.8,
    reviewCount: 182,
    image:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1000&q=80',
    shortDescription: '25g protein per scoop with zero added sugar.',
    description:
      'Fast-digesting isolate whey for lean muscle growth and recovery. Built for daily training, clean nutrition, and easy digestion.',
    stock: 18,
    inStock: true,
    featured: true,
  },
  {
    id: 'crt-1',
    slug: 'micronized-creatine-monohydrate',
    name: 'Micronized Creatine Monohydrate',
    category: 'creatine',
    price: 29.99,
    rating: 4.7,
    reviewCount: 249,
    image:
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1000&q=80',
    shortDescription: 'Pure 5g creatine monohydrate per serving.',
    description:
      'Supports strength output, muscle volume, and training performance. No flavoring, no fillers, just clinically trusted creatine.',
    stock: 32,
    inStock: true,
    featured: true,
  },
  {
    id: 'pre-1',
    slug: 'pre-workout-green-apple',
    name: 'Pre-Workout Green Apple',
    category: 'pre-workout',
    price: 44.99,
    discountPrice: 39.99,
    rating: 4.6,
    reviewCount: 121,
    image:
      'https://images.unsplash.com/photo-1612531385446-f7b7c5dcf5b1?auto=format&fit=crop&w=1000&q=80',
    shortDescription: 'Caffeine, citrulline, and beta-alanine blend.',
    description:
      'Energy and focus formula designed to improve workout intensity. Great for heavy sessions and high-volume training blocks.',
    stock: 14,
    inStock: true,
    featured: true,
  },
  {
    id: 'bar-1',
    slug: 'chocolate-protein-bars-pack',
    name: 'Chocolate Protein Bars (12 Pack)',
    category: 'protein-bars',
    price: 24.99,
    rating: 4.5,
    reviewCount: 76,
    image:
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1000&q=80',
    shortDescription: '20g protein bar with low net carbs.',
    description:
      'Convenient on-the-go snack made for recovery and satiety between meals. Great texture, balanced macros, and no chalky aftertaste.',
    stock: 24,
    inStock: true,
  },
  {
    id: 'vit-1',
    slug: 'daily-performance-multivitamin',
    name: 'Daily Performance Multivitamin',
    category: 'vitamins',
    price: 19.99,
    rating: 4.4,
    reviewCount: 91,
    image:
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=1000&q=80',
    shortDescription: 'Essential daily vitamins and minerals for athletes.',
    description:
      'Well-rounded micronutrient support for active lifestyles. Includes vitamin D, B-complex, zinc, and magnesium in athlete-friendly doses.',
    stock: 40,
    inStock: true,
  },
  {
    id: 'whey-2',
    slug: 'mass-gainer-chocolate',
    name: 'Mass Gainer Chocolate',
    category: 'whey-protein',
    price: 54.99,
    rating: 4.3,
    reviewCount: 58,
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80',
    shortDescription: 'High-calorie blend for healthy muscle gain.',
    description:
      'Calorie-dense formula with quality carbs and protein to support bulking phases and post-workout calorie targets.',
    stock: 0,
    inStock: false,
  },
]
