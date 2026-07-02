import type { Category } from "../../constants/categories";

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-lime-400/50">
      <h3 className="text-lg font-semibold text-white">{category.title}</h3>

      <p className="mt-2 flex-1 text-sm text-zinc-400">
        {category.description}
      </p>
    </article>
  );
};
