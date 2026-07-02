export interface Category {
  slug: string
  dbValue: string
  title: string
  description: string
}
// Max units of a single product one user can carry in their cart at a time.
// Change this single number to raise or lower the limit store-wide.
export const MAX_ORDER_QUANTITY = 2;
export const categories: Category[] = [
  {
    slug: 'whey-protein',
    dbValue: 'Whey Protein',
    title: 'Whey Protein',
    description: 'Lean muscle support with clean protein blends.',
  },
  {
    slug: 'creatine',
    dbValue: 'Creatine',
    title: 'Creatine',
    description: 'Strength and power support for serious sessions.',
  },
  {
    slug: 'pre-workout',
    dbValue: 'Pre Workout',
    title: 'Pre Workout',
    description: 'Clean energy and focus before training.',
  },
  {
    slug: 'protein-bars',
    dbValue: 'Protein Bar',
    title: 'Protein Bars',
    description: 'Portable high-protein snacks for active days.',
  },
  {
    slug: 'vitamins',
    dbValue: 'Multivitamin',
    title: 'Vitamins',
    description: 'Daily micronutrients to stay consistent.',
  },
]