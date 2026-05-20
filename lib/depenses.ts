export type SplitType = "half" | "full" | "none";
// half → 50/50 | full → other person reimburses everything | none → payer only

export type Depense = {
  id: string;
  couple_id: string;
  description: string;
  amount: number;
  paid_by: "nolan" | "lylou";
  split_type: SplitType;
  category: string;
  created_at: string;
};

export const DEPENSE_CATEGORIES = [
  "Alimentation",
  "Restaurant",
  "Transport",
  "Loisirs",
  "Voyage",
  "Santé",
  "Maison",
  "Shopping",
  "Autre",
];

export const CATEGORY_EMOJI: Record<string, string> = {
  Alimentation: "🛒",
  Restaurant: "🍽️",
  Transport: "🚗",
  Loisirs: "🎬",
  Voyage: "✈️",
  Santé: "💊",
  Maison: "🏠",
  Shopping: "🛍️",
  Autre: "💸",
};

export function fmtCHF(n: number) {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Amount owed by non-payer given a split type */
export function owedAmount(amount: number, splitType: SplitType): number {
  if (splitType === "half") return amount / 2;
  if (splitType === "full") return amount;
  return 0;
}

/**
 * Effective cost for a given person — what they actually bear after splits.
 * e.g. Lylou pays 50 split half → Lylou effective = 25, Nolan effective = 25
 *      Lylou pays 7.5 full reimburse by Nolan → Lylou effective = 0, Nolan effective = 7.5
 */
export function effectiveCost(depenses: Depense[], person: "nolan" | "lylou"): number {
  let total = 0;
  for (const d of depenses) {
    const isPayer = d.paid_by === person;
    if (isPayer) {
      if (d.split_type === "none") total += d.amount;        // covers all
      else if (d.split_type === "half") total += d.amount / 2; // covers half
      else if (d.split_type === "full") total += 0;           // other reimburses all
    } else {
      if (d.split_type === "none") total += 0;               // payer covers all
      else if (d.split_type === "half") total += d.amount / 2; // owes half
      else if (d.split_type === "full") total += d.amount;    // owes all
    }
  }
  return total;
}

/**
 * Compute balance from the perspective of `myOwner`.
 * Positive → I owe my partner. Negative → partner owes me.
 */
export function computeBalance(depenses: Depense[], myOwner: "nolan" | "lylou"): number {
  const partnerOwner = myOwner === "nolan" ? "lylou" : "nolan";
  let balance = 0;
  for (const d of depenses) {
    const owed = owedAmount(d.amount, d.split_type);
    if (owed === 0) continue;
    if (d.paid_by === partnerOwner) {
      balance += owed; // partner paid → I owe
    } else {
      balance -= owed; // I paid → partner owes me
    }
  }
  return balance;
}
