import { supabase } from "../lib/supabase";

export interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  product_brand: string;
  product_category: string;
  product_subtype: string | null;
  product_flavor: string | null;
  product_weight: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  payment_method: "online" | "cod";
  payment_status: "paid" | "pending" | "failed";
  order_status: string;
  delivery_estimate: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  order_items: OrderItem[];
}

type GetOrdersOptions = {
  userId: string;
  offset?: number;
  limit?: number;
};

export const getOrders = async ({
  userId,
  offset = 0,
  limit = 5,
}: GetOrdersOptions) => {
  if (!supabase) throw new Error("Something went wrong..");

  const from = Math.max(0, offset);
  const pageSize = Math.max(1, limit);
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("orders")
    .select(
      `
        *,
        order_items(
          id,
          product_name,
          product_image,
          product_brand,
          product_category,
          product_subtype,
          product_flavor,
          product_weight,
          quantity,
          unit_price,
          total_price
        )
      `,
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const orders = (data as unknown as Order[] | null) ?? [];
  const total = count ?? 0;

  return {
    orders,
    total,
    hasMore: from + orders.length < total,
  };
};
