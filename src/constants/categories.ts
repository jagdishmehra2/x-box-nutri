export interface Category {
  slug: string
  title: string
  description: string
}

export const categories: Category[] = [
  {
    slug: 'whey-protein',
    title: 'Whey Protein',
    description: 'Lean muscle support with clean protein blends.',
  },
  {
    slug: 'creatine',
    title: 'Creatine',
    description: 'Strength and power support for serious sessions.',
  },
  {
    slug: 'pre-workout',
    title: 'Pre Workout',
    description: 'Clean energy and focus before training.',
  },
  {
    slug: 'protein-bars',
    title: 'Protein Bars',
    description: 'Portable high-protein snacks for active days.',
  },
  {
    slug: 'vitamins',
    title: 'Vitamins',
    description: 'Daily micronutrients to stay consistent.',
  },
]
