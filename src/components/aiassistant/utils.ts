import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_USAGE } from "./constants";
import type {
  AIProduct,
  AssistantRequest,
  AssistantResponse,
  AssistantUsageStore,
  CompactAIProduct,
  GuideSelection,
  RecommendationAnswers,
} from "./types";

const shorten = (value: string | undefined, length: number) =>
  value && value.length > length ? `${value.slice(0, length).trim()}…` : value;

export const isProductAvailable = (
  product: Pick<AIProduct, "stock" | "inStock">,
) => {
  if (typeof product.stock === "number") return product.stock > 0;
  if (typeof product.stock === "boolean") return product.stock;
  if (typeof product.inStock === "boolean") return product.inStock;
  return false;
};

export const compactProductForAI = (
  product: AIProduct,
  includeDescription = true,
): CompactAIProduct => ({
  id: product.id,
  name: product.name,
  priceInr: product.discountPrice ?? product.price,
  ...(includeDescription
    ? {
        description: shorten(
          product.description || product.shortDescription,
          240,
        ),
      }
    : {}),
  stock: product.stock,
  inStock: isProductAvailable(product),
  category: product.category,
  subtype: product.subtype,
});

export const compactSearchResults = (
  products: readonly AIProduct[],
  limit = 24,
  includeDescription = true,
) =>
  [...products]
    .sort(
      (left, right) =>
        Number(isProductAvailable(right)) - Number(isProductAvailable(left)),
    )
    .slice(0, Math.max(1, Math.min(limit, 24)))
    .map((product) => compactProductForAI(product, includeDescription));

export const buildAssistantRequest = (
  products: readonly AIProduct[],
  brandName: string,
  selection: GuideSelection,
  recommendationAnswers: RecommendationAnswers,
): AssistantRequest => ({
  mode: "recommend",
  products: compactSearchResults(
    products,
    24,
    selection.id !== "preworkout",
  ),
  recommendationAnswers,
  selectionId: selection.id,
  selectionLabel: selection.label,
  isStack: selection.isStack,
  brandName,
});

/** Never put provider API keys in this frontend responder. */
export const createBackendResponder = (
  endpoint: string,
): ((request: AssistantRequest) => Promise<AssistantResponse>) =>
  async (request) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error("Assistant request failed");
    return response.json() as Promise<AssistantResponse>;
  };

export const createSupabaseAssistantResponder = (
  client: SupabaseClient,
  functionName = "ai-assistant",
): ((request: AssistantRequest) => Promise<AssistantResponse>) =>
  async (request) => {
    const { data, error } = await client.functions.invoke<AssistantResponse>(
      functionName,
      { body: request },
    );

    if (error) {
      const context = "context" in error ? error.context : undefined;
      let detail = "Assistant function request failed";

      if (context instanceof Response) {
        const body = (await context.clone().json().catch(() => null)) as
          | { error?: unknown }
          | null;
        if (typeof body?.error === "string") detail = body.error;
      }

      console.error("AI assistant Edge Function failed:", detail, error);
      throw new Error(detail);
    }

    if (
      !data ||
      typeof data.text !== "string" ||
      typeof data.relevant !== "boolean"
    ) {
      throw new Error("Assistant function returned an invalid response");
    }

    if (
      data.usage &&
      typeof data.usage.guideCount !== "number"
    ) {
      throw new Error("Assistant function returned invalid usage data");
    }

    return data;
  };

export const createSupabaseUsageStore = (
  client: SupabaseClient,
): AssistantUsageStore => ({
  async get(userKey) {
    if (!userKey) return { ...DEFAULT_USAGE };

    const { data, error } = await client
      .from("ai_assistant_usage")
      .select("learn_count")
      .eq("user_id", userKey)
      .maybeSingle();

    if (error) throw error;
    return {
      guideCount:
        typeof data?.learn_count === "number" ? data.learn_count : 0,
    };
  },
  set() {
    // The Edge Function owns all usage reservations.
  },
});
