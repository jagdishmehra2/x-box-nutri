type WeightedCartItem = {
  weight?: unknown;
  quantity: number;
};

const FLAT_DELIVERY_RULES = [
  { pincodes: ["262308"], charge: 20 },
  { pincodes: ["262309", "262311", "262405"], charge: 50 },
] as const;

const DELIVERY_CHARGE_PER_KG = 150;

const parseWeightInKg = (weight: unknown) => {
  if (typeof weight !== "string") return null;

  const match = weight
    .trim()
    .toLowerCase()
    .match(/^([0-9]+(?:\.[0-9]+)?)\s*(kg|kgs|kilograms?|g|gm|gms|grams?)/);

  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;

  return match[2].startsWith("k") ? value : value / 1000;
};

export const calculateDeliveryCharge = (
  pincode: string,
  items: WeightedCartItem[],
) => {
  if (!/^\d{6}$/.test(pincode)) return null;

  const flatRule = FLAT_DELIVERY_RULES.find((rule) =>
    rule.pincodes.some((rulePincode) => rulePincode === pincode)
  );
  if (flatRule) return flatRule.charge;

  let totalWeightInKg = 0;

  for (const item of items) {
    const weightInKg = parseWeightInKg(item.weight);
    if (
      weightInKg === null ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return null;
    }

    totalWeightInKg += weightInKg * item.quantity;
  }

  if (totalWeightInKg <= 0) return null;

  return Math.round(totalWeightInKg * DELIVERY_CHARGE_PER_KG * 100) / 100;
};
