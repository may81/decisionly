
export type UpgradePlan = "pro" | "business";

const isSandbox =
  process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox";

export const PADDLE_PRICES: Record<UpgradePlan, string> = {
  pro: isSandbox
    ? "pri_01m07813mwxnkg7jde1anv70zp"
    : "pri_01m07813mwxnkg7jde1anv70zp",

  business: isSandbox
    ? "pri_01m078kjpwsq7pgxbxvsq362qm"
    : "pri_01m1a56fkxdf42tvxy1pyrkvhy",
};

export function getPlanFromPriceId(
  priceId: string
): UpgradePlan | null {
  if (priceId === "pri_01m07813mwxnkg7jde1anv70zp") {
    return "pro";
  }

  if (priceId === "pri_01m1a4ttkrddmrvz53g8m1xxdz") {
    return "pro";
  }

  if (
    priceId === "pri_01m078kjpwsq7pgxbxvsq362qm" ||
    priceId === "pri_01m1a56fkxdf42tvxy1pyrkvhy"
  ) {
    return "business";
  }

  return null;
}

