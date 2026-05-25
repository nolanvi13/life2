export type SplitType = "half" | "full" | "none" | "custom";
// half   → 50/50
// full   → non-payer rembourse tout
// none   → payeur seul, pas de remboursement
// custom → montant personnalisé (stocké dans custom_amount)

export type Depense = {
  id: string;
  couple_id: string;
  description: string;
  amount: number;           // toujours en CHF (après conversion)
  original_amount?: number | null; // montant dans la devise d'origine
  currency?: string | null; // devise d'origine (ex: "EUR"), null ou "CHF" = pas de conversion
  paid_by: "nolan" | "lylou";
  split_type: SplitType;
  custom_amount?: number | null;
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

/** Montant dû par le non-payeur */
export function owedAmount(amount: number, splitType: SplitType, customAmount?: number | null): number {
  if (splitType === "half") return amount / 2;
  if (splitType === "full") return amount;
  if (splitType === "custom") return customAmount ?? 0;
  return 0;
}

/** Coût effectif réel supporté par chaque personne après split */
export function effectiveCost(depenses: Depense[], person: "nolan" | "lylou"): number {
  let total = 0;
  for (const d of depenses) {
    const owed = owedAmount(d.amount, d.split_type, d.custom_amount);
    const isPayer = d.paid_by === person;
    if (isPayer) {
      total += d.amount - owed; // ce que le payeur garde à sa charge
    } else {
      total += owed; // ce que le non-payeur rembourse
    }
  }
  return total;
}

/**
 * Balance du point de vue de `myOwner`.
 * Positif → je dois à mon/ma partenaire. Négatif → il/elle me doit.
 */
export function computeBalance(depenses: Depense[], myOwner: "nolan" | "lylou"): number {
  const partnerOwner = myOwner === "nolan" ? "lylou" : "nolan";
  let balance = 0;
  for (const d of depenses) {
    const owed = owedAmount(d.amount, d.split_type, d.custom_amount);
    if (owed === 0) continue;
    if (d.paid_by === partnerOwner) {
      balance += owed;
    } else {
      balance -= owed;
    }
  }
  return balance;
}
