export type AssistantMode = "recommend";

export type GuideSelectionId =
  | "whey"
  | "creatine"
  | "multivitamin"
  | "preworkout"
  | "whey-creatine";

export interface AIProduct {
  id: string;
  name: string;
  category?: string;
  subtype?: string;
  description?: string;
  shortDescription?: string;
  price?: number | string;
  discountPrice?: number | string;
  stock?: number | boolean;
  inStock?: boolean;
}

export interface CompactAIProduct {
  id: string;
  name: string;
  priceInr?: number | string;
  description?: string;
  stock?: number | boolean;
  inStock: boolean;
  category?: string;
  subtype?: string;
}

export interface GuideSelection {
  id: GuideSelectionId;
  label: string;
  searchQueries: readonly string[];
  isStack: boolean;
}

export interface RecommendationQuestion {
  id: string;
  prompt: string;
  placeholder: string;
  options?: string[];
}

export type RecommendationAnswers = Record<string, string>;

export interface AssistantRequest {
  mode: AssistantMode;
  products: CompactAIProduct[];
  recommendationAnswers: RecommendationAnswers;
  selectionId: GuideSelectionId;
  selectionLabel: string;
  isStack: boolean;
  brandName: string;
}

export interface AssistantResponse {
  text: string;
  relevant: boolean;
  productId?: string;
  productIds?: string[];
  usage?: AssistantUsage;
}

export type AssistantResponder = (
  request: AssistantRequest,
) => Promise<AssistantResponse>;

export type ProductSearchFunction = (
  query: string,
  scope?: "catalog" | "subtype",
) => Promise<readonly AIProduct[]>;

export interface AssistantUsage {
  guideCount: number;
}

export interface AssistantUsageStore {
  get(userKey: string): AssistantUsage | Promise<AssistantUsage>;
  set(
    userKey: string,
    usage: AssistantUsage,
  ): void | Promise<void>;
}

export interface AIAssistantProps {
  searchProducts: ProductSearchFunction;
  userId?: string | null;
  brandName?: string;
  responder?: AssistantResponder;
  usageStore?: AssistantUsageStore;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}
