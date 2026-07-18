import { supabase } from "../lib/supabase";

export const getLatestReviews = async () => {
  if (!supabase) throw new Error("Something went wrong..");

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      product_id,
      customer_name,
      rating,
      comment,
      created_at,
      products (
        name
      )
    `,
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(7);

  if (error) throw error;
  return data ?? [];
};

export const getProductReviews = async (
  productId: string,
  page = 1,
  pageSize = 10,
) => {
  if (!supabase) throw new Error("Something went wrong..");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, comment, created_at", {
      count: "exact",
    })
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    reviews: data ?? [],
    total: count ?? 0,
  };
};

export const getReviewEligibility = async (productId: string) => {
  if (!supabase) throw new Error("Something went wrong..");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      canReview: false,
      reason: "Please login to write a review.",
      existingReview: null,
    };
  }

  const { data: existingReview, error: reviewError } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, comment, created_at")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (reviewError) throw reviewError;

  if (existingReview) {
    return {
      canReview: false,
      reason: "You have already reviewed this product.",
      existingReview,
    };
  }

  const { data: hasPurchased, error: purchaseError } = await supabase.rpc(
    "has_purchased_product",
    { target_product_id: productId },
  );

  if (purchaseError) throw purchaseError;

  if (!hasPurchased) {
    return {
      canReview: false,
      reason: "You can review this product after purchasing it.",
      existingReview: null,
    };
  }

  return { canReview: true, reason: "", existingReview: null };
};

export const addProductReview = async ({
  productId,
  rating,
  comment,
}: {
  productId: string;
  rating: number;
  comment: string;
}) => {
  if (!supabase) throw new Error("Something went wrong..");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Please login to write a review.");

  const customerName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Customer";

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: productId,
      user_id: user.id,
      customer_name: customerName,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
