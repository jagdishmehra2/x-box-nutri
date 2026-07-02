import { supabase } from "../lib/supabase";
import type { Product, ProductCategory } from "../types/product";

type ProductRow = {
  id?: string | number | null;
  slug?: string | null;
  name?: string | null;
  category?: ProductCategory | null;
  price?: string | number | null;
  rating?: string | number | null;
  reviewCount?: string | number | null;
  review_count?: string | number | null;
  discount_price?: string | number | null;
  image_urls?: string[] | null;
  stock?: number | null;
  shortDescription?: string | null;
  short_description?: string | null;
  description?: string | null;
  featured?: boolean | string | number | null;
  is_featured?: boolean | string | number | null;
  brand?: string | null
subtype?: string | null
flavor?: string | null
weight?: string | null
};

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const toString = (value: unknown, fallback = "") => {
  return typeof value === "string" && value.trim() ? value : fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : fallback;

  if (typeof value === "string") {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  return fallback;
};

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return undefined;

  const parsedValue = toNumber(value, Number.NaN);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return fallback;
};

const mapProduct = (row: ProductRow): Product => {
  const name = toString(row.name, "Product");
  const id = String(row.id ?? slugify(name));
  const images = Array.isArray(row.image_urls)
    ? row.image_urls.filter(
        (image): image is string => typeof image === "string" && Boolean(image.trim()),
      )
    : [];

return {
  id,
  slug: toString(row.slug, slugify(name) || id),

  name,

  category: toString(
    row.category,
    'uncategorized',
  ),

  price: toNumber(row.price),

  discountPrice: toOptionalNumber(
    row.discount_price,
  ),

  rating: toNumber(row.rating),

  reviewCount: toNumber(
    row.reviewCount ?? row.review_count,
  ),

  image: images[0] ?? '',
  images,

  shortDescription: toString(
    row.shortDescription ??
      row.short_description,
  ),

  description: toString(row.description),
stock: toNumber(row.stock),
  inStock:
    typeof row.stock === 'number'
      ? row.stock > 0
      : true,

  featured: toBoolean(
    row.featured ?? row.is_featured,
  ),
  brand: toString(row.brand),

subtype: toString(row.subtype),

flavor: toString(row.flavor),

weight: toString(row.weight),
}
};

export type GetProductsOptions = {
  category?: string;
  featuredOnly?: boolean;
  search?: string;
  offset?: number;
  limit?: number;
};

export const getProducts = async ({
  category,
  featuredOnly = false,
  search = "",
  offset = 0,
  limit = 20,
}: GetProductsOptions = {}) => {
  if (!supabase) {
    throw new Error("Something went wrong..");
  }

  const from = Math.max(0, offset);
  const pageSize = Math.max(1, limit);
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  if (featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error, count } = await query
    .order(featuredOnly ? "created_at" : "id", {
      ascending: !featuredOnly,
    })
    .range(from, to);

  if (error) throw error;

  const products = (data ?? []).map((product) => mapProduct(product));
  const total = count ?? 0;

  return {
    products,
    total,
    hasMore: from + products.length < total,
  };
};

export const getAllProducts = getProducts;

export const getFeaturedProducts = async () => {
  const { products } = await getProducts({
    featuredOnly: true,
    limit: 3,
  });

  return products;
};

export const getProductBySlug = async (id: string) => {
  if (!supabase) {
    throw new Error("Something went wrong..");
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", id)
    .maybeSingle();
  if (error) throw error;
 

  return data ? mapProduct(data) : null;
};
