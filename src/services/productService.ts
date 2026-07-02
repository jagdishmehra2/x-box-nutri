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

  image:
    Array.isArray(row.image_urls) &&
    row.image_urls.length
      ? row.image_urls[0]
      : '',

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

export const getProducts = async (category?: string) => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabase.from("products").select("*").eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((product) => mapProduct(product));
};

export const getAllProducts = getProducts;

export const getFeaturedProducts = async () => {
  const products = await getProducts();
  const featuredProducts = products.filter((product) => product.featured);

  return featuredProducts.length ? featuredProducts : products.slice(0, 3);
};

export const getProductBySlug = async (id: string) => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
 

  return data ? mapProduct(data) : null;
};
