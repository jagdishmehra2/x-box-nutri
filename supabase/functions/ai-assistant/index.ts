import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type UnknownRecord = Record<string, unknown>;
type SelectionId =
  | "whey"
  | "creatine"
  | "multivitamin"
  | "preworkout"
  | "whey-creatine";
type ProductKind = "whey" | "creatine" | "multivitamin" | "preworkout";

interface AssistantUsage {
  guideCount: number;
}

interface SafeProduct {
  id: string;
  name: string;
  priceInr?: string;
  description?: string;
  stock?: number | boolean;
  inStock: boolean;
  category?: string;
  subtype?: string;
}

interface OpenAIResponse {
  output_text?: unknown;
  output?: Array<{
    content?: Array<{ type?: unknown; text?: unknown }>;
  }>;
}

const selectionRequirements: Record<SelectionId, ProductKind[]> = {
  whey: ["whey"],
  creatine: ["creatine"],
  multivitamin: ["multivitamin"],
  preworkout: ["preworkout"],
  "whey-creatine": ["whey", "creatine"],
};

const questionKeysBySelection: Record<SelectionId, readonly string[]> = {
  whey: [
    "goal",
    "bodyWeight",
    "dietPreference",
    "trainingDays",
    "safety",
    "productPreference",
    "budget",
  ],
  creatine: [
    "goal",
    "trainingDays",
    "creatineExperience",
    "safety",
    "productPreference",
    "budget",
  ],
  multivitamin: [
    "multivitaminReason",
    "dietPattern",
    "produceDaily",
    "doctorRecommendation",
    "safety",
    "budget",
  ],
  preworkout: [
    "preWorkoutGoal",
    "trainingTime",
    "caffeineSensitivity",
    "dailyCaffeine",
    "preWorkoutSymptoms",
    "preWorkoutMedical",
    "budget",
  ],
  "whey-creatine": [
    "goal",
    "bodyWeight",
    "trainingDays",
    "workoutIntensity",
    "dietPreference",
    "safety",
    "creatineExperience",
    "budget",
  ],
};

const medicalRiskTerms = [
  "allergy",
  "allergic",
  "pregnant",
  "pregnancy",
  "kidney",
  "liver",
  "medication",
  "disease",
  "diagnosis",
  "chest pain",
  "serious condition",
  "serious bloating",
];

const GUIDE_LIMIT_MESSAGE =
  "You have used your 3 free personalized NutriStack guides.";

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cleanString = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || undefined;
};

const inrNumberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

const formatINR = (value: number) => `₹${inrNumberFormat.format(value)}`;

const replaceDollarPriceSymbols = (value: string) =>
  value.replace(/\$(?=\s*\d)/g, "₹");

const extractMoneyAmount = (value: string) => {
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;

  const amount = Number(match[0]);
  return Number.isFinite(amount) ? amount : undefined;
};

const cleanPrice = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatINR(value);
  }

  const cleaned = cleanString(value, 40);
  if (!cleaned) return undefined;
  const amount = extractMoneyAmount(cleaned);
  return amount === undefined
    ? replaceDollarPriceSymbols(cleaned)
    : formatINR(amount);
};

const normalizeBudget = (value: string) => {
  const amount = extractMoneyAmount(value);
  return amount === undefined
    ? replaceDollarPriceSymbols(value)
    : formatINR(amount);
};

const sanitizeProduct = (value: unknown): SafeProduct | null => {
  if (!isRecord(value)) return null;

  const id = cleanString(value.id, 100);
  const name = cleanString(value.name, 120);
  if (!id || !name || typeof value.inStock !== "boolean") return null;

  const stock = typeof value.stock === "number" && Number.isFinite(value.stock)
    ? value.stock
    : typeof value.stock === "boolean"
    ? value.stock
    : undefined;

  return {
    id,
    name,
    priceInr: cleanPrice(value.priceInr),
    description: cleanString(value.description, 260),
    stock,
    inStock: value.inStock,
    category: cleanString(value.category, 80),
    subtype: cleanString(value.subtype, 80),
  };
};

const extractOutputText = (response: OpenAIResponse) => {
  if (typeof response.output_text === "string") return response.output_text;

  for (const output of response.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
};

const hasMedicalRisk = (text: string) => {
  const normalized = text.toLowerCase();
  return medicalRiskTerms.some((term) => normalized.includes(term));
};

const preWorkoutRiskReasons = (answers: Record<string, string>) => {
  const riskText = [
    answers.trainingTime,
    answers.caffeineSensitivity,
    answers.preWorkoutSymptoms,
    answers.preWorkoutMedical,
  ].join(" ").toLowerCase();
  const reasons: string[] = [];

  if (riskText.includes("late night")) reasons.push("late-night training");
  if (riskText.includes("high sensitivity")) {
    reasons.push("high caffeine sensitivity");
  }
  if (riskText.includes("anxiety")) reasons.push("anxiety");
  if (riskText.includes("sleep")) reasons.push("sleep issues");
  if (
    riskText.includes("high bp") || riskText.includes("high blood pressure")
  ) {
    reasons.push("high blood pressure");
  }
  if (riskText.includes("palpitation")) reasons.push("heart palpitations");
  if (riskText.includes("chest pain")) reasons.push("chest pain");
  if (riskText.includes("panic")) reasons.push("panic attacks");
  if (riskText.includes("medication")) reasons.push("medication use");
  if (riskText.includes("kidney")) reasons.push("a kidney issue");
  if (riskText.includes("liver")) reasons.push("a liver issue");
  if (riskText.includes("heart")) reasons.push("a heart issue");
  if (riskText.includes("pregnan")) reasons.push("pregnancy");
  if (riskText.includes("serious condition")) {
    reasons.push("a serious condition");
  }

  return [...new Set(reasons)];
};

const usageFromRow = (value: unknown): AssistantUsage => {
  if (!isRecord(value)) return { guideCount: 0 };

  const count = Number(value.learn_count ?? value.guideCount ?? 0);
  return {
    guideCount: Number.isFinite(count) ? Math.max(0, count) : 0,
  };
};

const readUsage = async (admin: SupabaseClient, userId: string) => {
  const { data, error } = await admin
    .from("ai_assistant_usage")
    .select("learn_count")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return usageFromRow(data);
};

const reserveGuideUsage = async (
  admin: SupabaseClient,
  userId: string,
) => {
  // Reuse the existing three-use learn_count branch in the RPC as guide usage.
  const { data, error } = await admin.rpc("reserve_ai_assistant_usage", {
    p_user_id: userId,
    p_mode: "learn",
  });

  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  const allowed = typeof result === "boolean"
    ? result
    : isRecord(result)
    ? result.allowed === true ||
      result.is_allowed === true ||
      result.success === true ||
      result.reserved === true ||
      result.can_use === true ||
      result.can_reserve === true
    : false;

  return { allowed, usage: await readUsage(admin, userId) };
};

const productKind = (product: SafeProduct): ProductKind | null => {
  const category = product.category?.toLowerCase() ?? "";
  if (category.includes("whey")) return "whey";
  if (category.includes("creatine")) return "creatine";
  if (category.includes("vitamin")) return "multivitamin";
  if (category.includes("pre") && category.includes("workout")) {
    return "preworkout";
  }
  return null;
};

const responseSchema = {
  type: "object",
  properties: {
    text: {
      type: "string",
      description: "A concise customer-facing recommendation.",
    },
    relevant: {
      type: "boolean",
      description:
        "True only when the recommendation is supported by supplied products.",
    },
    productId: {
      type: ["string", "null"],
      description:
        "The supplied product ID for a single recommendation, otherwise null.",
    },
    productIds: {
      type: "array",
      items: { type: "string" },
      maxItems: 3,
      description:
        "Supplied product IDs for a stack in Whey, Creatine, Multivitamin order; empty for a single recommendation.",
    },
  },
  required: ["text", "relevant", "productId", "productIds"],
  additionalProperties: false,
};

Deno.serve(async (request) => {
  try {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ||
      Deno.env.get("ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SERVICE_ROLE_KEY");
    const authorization = request.headers.get("Authorization");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return json({ error: "Supabase service is not configured." }, 500);
    }

    if (!authorization) {
      return json({ error: "Authentication is required." }, 401);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const accessToken = authorization.replace(/^Bearer\s+/i, "");
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(accessToken);

    if (userError || !user) {
      return json({ error: "Invalid or expired session." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 100_000) {
      return json({ error: "Request is too large." }, 413);
    }

    let body: UnknownRecord;
    try {
      const parsed = await request.json();
      if (!isRecord(parsed)) throw new Error("Invalid body");
      body = parsed;
    } catch {
      return json({ error: "Invalid request body." }, 400);
    }

    const selectionId = cleanString(body.selectionId, 60) as
      | SelectionId
      | undefined;
    const selectionLabel = cleanString(body.selectionLabel, 100);
    const isStack = body.isStack === true;
    const products = Array.isArray(body.products)
      ? body.products
        .slice(0, 24)
        .map(sanitizeProduct)
        .filter((product): product is SafeProduct => Boolean(product))
      : [];

    if (
      body.mode !== "recommend" ||
      !selectionId ||
      !(selectionId in selectionRequirements) ||
      !selectionLabel
    ) {
      return json({ error: "Invalid assistant request." }, 400);
    }

    if (selectionId === "preworkout") {
      for (const product of products) delete product.description;
    }

    const requiredKinds = selectionRequirements[selectionId];
    if (isStack !== (requiredKinds.length > 1)) {
      return json({ error: "Invalid guide selection." }, 400);
    }

    if (!products.length) {
      return json({
        text: "I could not find matching NutriStack products right now.",
        relevant: false,
        usage: await readUsage(admin, user.id),
      });
    }

    const suppliedKinds = new Set(products.map(productKind).filter(Boolean));
    if (!requiredKinds.every((kind) => suppliedKinds.has(kind))) {
      return json({
        text: "I could not find all matching NutriStack products right now.",
        relevant: false,
        usage: await readUsage(admin, user.id),
      });
    }

    const expectedQuestionKeys = questionKeysBySelection[selectionId];
    const recommendationAnswers: Record<string, string> = {};
    if (isRecord(body.recommendationAnswers)) {
      for (const key of expectedQuestionKeys) {
        const answer = cleanString(body.recommendationAnswers[key], 160);
        if (answer) {
          recommendationAnswers[key] = key === "budget"
            ? normalizeBudget(answer)
            : answer;
        }
      }
    }

    if (
      Object.keys(recommendationAnswers).length !==
        expectedQuestionKeys.length
    ) {
      return json({ error: "All recommendation answers are required." }, 400);
    }

    let reservation: { allowed: boolean; usage: AssistantUsage };
    try {
      reservation = await reserveGuideUsage(admin, user.id);
    } catch (error) {
      console.error("Assistant usage reservation failed", error);
      return json({ error: "Unable to reserve assistant usage." }, 500);
    }

    const { usage } = reservation;
    if (!reservation.allowed) {
      return json({
        text: GUIDE_LIMIT_MESSAGE,
        relevant: false,
        usage,
      });
    }

    if (selectionId === "preworkout") {
      const riskReasons = preWorkoutRiskReasons(recommendationAnswers);
      if (riskReasons.length) {
        return json({
          text: `Decision: Not recommended\nWhy: Your answers mention ${
            riskReasons.join(", ")
          }, so stimulant pre-workout would not be a safe recommendation here.\nSafer choice: Improve sleep, food, hydration, and training consistency first, and ask a qualified doctor before using pre-workout.`,
          relevant: false,
          usage,
        });
      }
    }

    const safetyText = Object.values(recommendationAnswers).join(" ");
    if (hasMedicalRisk(safetyText)) {
      return json({
        text:
          "I can’t safely recommend supplements for the medical concern mentioned. Please consult a qualified doctor, especially for allergies, pregnancy, medication use, or kidney/liver conditions.",
        relevant: false,
        usage,
      });
    }

    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-5.4-nano";
    const brandName = cleanString(body.brandName, 80) || "NutriStack";

    if (!openAIKey) {
      return json({ error: "AI service is not configured." }, 500);
    }

    const formatRules = selectionId === "preworkout"
      ? `Safety comes before sales. Decide whether the user should buy pre-workout.
For a safe in-stock recommendation, return:
Decision: Recommended / Choose stimulant-free only
Best pick: product name
Price: ₹X
Why: one short reason based on the answers and supplied product fields
Caution: follow the product label and stop use if side effects occur
Doctor note: consult a qualified doctor if using medication, pregnant, or having heart, BP, kidney/liver, anxiety, sleep, or serious health issues.

If it is not appropriate, set relevant=false, productId=null, productIds=[], and return:
Decision: Not recommended
Why: one short reason based on the answers
Safer choice: improve sleep, food, hydration, and training consistency first, or ask a qualified doctor before using pre-workout.
Do not recommend a product and never give dosage advice.`
      : isStack
      ? `Return this compact format:
Recommended ${brandName}:
${
        requiredKinds.map((kind, index) =>
          `${index + 1}. ${
            kind === "whey"
              ? "Whey"
              : kind === "creatine"
              ? "Creatine"
              : "Multivitamin"
          }: product name — ₹X`
        ).join("\n")
      }
Total estimated price: ₹X
Why this stack fits: one short reason.
Budget fit: within budget / slightly above budget / no suitable stack within budget.
Note: check labels before use; consult a qualified doctor for medical concerns.`
      : `Return this compact format:
Best pick: product name
Price: ₹X
Why it fits: one short reason based on the intake answers and supplied product fields.
Who should choose it: short, safe guidance without dosage advice.
Note: check the label before use; consult a qualified doctor for allergies, pregnancy, medication use, kidney/liver issues, or serious conditions.`;

    const instructions =
      `Use the structured intake judgment of a diet coach with 20 years of experience while acting as ${brandName}'s supplement-shopping assistant. Select ${requiredKinds.length} product(s), exactly one for each required category: ${
        requiredKinds.join(", ")
      }.

All product prices and budgets are Indian Rupees (INR). A plain budget such as 2000 and a dollar-prefixed budget such as $2000 both mean ₹2,000. Never convert currency. Never use dollars, USD, or the $ symbol. Format every monetary amount with ₹ and Indian digit grouping, such as ₹800 or ₹2,000.

Use only supplied in-stock products and the supplied product fields. Match whey concentrate/isolate/blend and creatine monohydrate/HCL only when those subtypes exist in the supplied products. Never invent products, facts, discounts, prices, or subtypes. For stacks, recommend only one whey and one creatine; never add a multivitamin. Try to stay within the total budget using the closest lower-priced valid combination. If every valid combination exceeds budget, state that clearly. If a doctor recommendation or diagnosed deficiency is mentioned, remind the user to follow their doctor's advice. Never give dosage, diagnosis, or treatment advice. Keep the answer concise. ${formatRules}`;

    const idRules = isStack
      ? "Set productId to null and productIds to the exact selected supplied IDs in required-category order."
      : "Set productId to the exact selected supplied ID and productIds to an empty array.";
    const systemInstructions = `${instructions} ${idRules}`;

    let openAIResponse: Response;
    try {
      openAIResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          store: false,
          max_output_tokens: 500,
          ...(model.startsWith("gpt-5")
            ? { reasoning: { effort: "none" } }
            : {}),
          input: [
            { role: "system", content: systemInstructions },
            {
              role: "user",
              content: JSON.stringify({
                selection: selectionLabel,
                recommendationAnswers,
                products,
              }),
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "nutristack_recommendation",
              strict: true,
              schema: responseSchema,
            },
          },
        }),
      });
    } catch {
      return json({ error: "Unable to reach the AI provider." }, 502);
    }

    const providerBody = (await openAIResponse.json().catch(() => null)) as
      | OpenAIResponse
      | null;

    if (!openAIResponse.ok || !providerBody) {
      console.error("OpenAI request failed", {
        status: openAIResponse.status,
        requestId: openAIResponse.headers.get("x-request-id"),
      });
      return json({ error: "AI provider request failed." }, 502);
    }

    const outputText = extractOutputText(providerBody);
    if (!outputText) {
      return json({ error: "AI provider returned an empty response." }, 502);
    }

    let result: UnknownRecord;
    try {
      const parsed = JSON.parse(outputText);
      if (!isRecord(parsed)) throw new Error("Invalid output");
      result = parsed;
    } catch {
      return json({ error: "AI provider returned an invalid response." }, 502);
    }

    const rawText = cleanString(result.text, 1_500);
    const text = rawText ? replaceDollarPriceSymbols(rawText) : undefined;
    const relevant = result.relevant === true;
    const productId = cleanString(result.productId, 100);
    const productIds = Array.isArray(result.productIds)
      ? result.productIds
        .map((id) => cleanString(id, 100))
        .filter((id): id is string => Boolean(id))
      : [];

    if (!text) {
      return json({ error: "AI provider returned an invalid response." }, 502);
    }

    if (!relevant) {
      return json({ text, relevant: false, usage });
    }

    const selectedIds = isStack ? productIds : productId ? [productId] : [];
    const uniqueIds = new Set(selectedIds);
    const selectedProducts = selectedIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is SafeProduct => Boolean(product));
    const validSelection = selectedIds.length === requiredKinds.length &&
      uniqueIds.size === selectedIds.length &&
      selectedProducts.length === selectedIds.length &&
      selectedProducts.every((product) => product.inStock) &&
      requiredKinds.every((kind) =>
        selectedProducts.some((product) => productKind(product) === kind)
      );

    if (!validSelection) {
      return json({
        text:
          `I don’t have enough matching ${brandName} product information to make that recommendation.`,
        relevant: false,
        usage,
      });
    }

    return json({
      text,
      relevant: true,
      ...(isStack
        ? { productIds: selectedIds }
        : { productId: selectedIds[0] }),
      usage,
    });
  } catch (error) {
    console.error("Unhandled ai-assistant error", error);
    return json({ error: "Unexpected assistant service error." }, 500);
  }
});
