// ─── Types ───────────────────────────────────────────────────────────────────

export interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string | null;
  category?: string;
}

export interface Recette {
  id: string;
  couple_id: string;
  slug: string;
  title: string;
  emoji: string;
  category: string;
  prep_time: string;
  portions: number;
  microwave_friendly: boolean;
  tips: string[];
  ingredients: Ingredient[];
  steps: string[];
  in_week: boolean;
  source_url?: string | null;
  created_at: string;
}

export interface ItemCourse {
  id: string;
  couple_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  category: string;
  checked: boolean;
  recette_id: string | null;
  created_at: string;
}

// ─── Category utils ───────────────────────────────────────────────────────────

export const CATEGORY_ICONS: Record<string, string> = {
  "Viandes & Protéines": "🥩",
  "Féculents & Céréales": "🌾",
  "Légumes & Fruits": "🥦",
  "Crémerie & Frais": "🥛",
  "Épicerie & Sauces": "🫙",
  "Divers": "🛍️",
};

export const CATEGORY_ORDER = [
  "Viandes & Protéines",
  "Féculents & Céréales",
  "Légumes & Fruits",
  "Crémerie & Frais",
  "Épicerie & Sauces",
  "Divers",
];

const INGREDIENT_CATEGORIES: Record<string, string> = {
  "bœuf haché": "Viandes & Protéines",
  "blancs de poulet": "Viandes & Protéines",
  "poulet": "Viandes & Protéines",
  "bœuf émincé fin": "Viandes & Protéines",
  "bœuf": "Viandes & Protéines",
  "pancetta / lardons": "Viandes & Protéines",
  "lardons": "Viandes & Protéines",
  "jambon": "Viandes & Protéines",
  "saumon": "Viandes & Protéines",
  "thon": "Viandes & Protéines",
  "crevettes": "Viandes & Protéines",
  "œufs": "Crémerie & Frais",
  "oeufs": "Crémerie & Frais",
  "fromage frais tartare (ail & fines herbes)": "Crémerie & Frais",
  "fromage frais tartare": "Crémerie & Frais",
  "crème liquide": "Crémerie & Frais",
  "parmesan": "Crémerie & Frais",
  "fromage": "Crémerie & Frais",
  "beurre": "Crémerie & Frais",
  "lait": "Crémerie & Frais",
  "crème fraîche": "Crémerie & Frais",
  "mozzarella": "Crémerie & Frais",
  "riz blanc": "Féculents & Céréales",
  "pâtes (penne ou rigatoni)": "Féculents & Céréales",
  "pâtes": "Féculents & Céréales",
  "nouilles de riz": "Féculents & Céréales",
  "pain": "Féculents & Céréales",
  "farine": "Féculents & Céréales",
  "concombre": "Légumes & Fruits",
  "carottes": "Légumes & Fruits",
  "carotte": "Légumes & Fruits",
  "oignons verts": "Légumes & Fruits",
  "oignon": "Légumes & Fruits",
  "oignons": "Légumes & Fruits",
  "citron vert": "Légumes & Fruits",
  "citron": "Légumes & Fruits",
  "gingembre frais": "Légumes & Fruits",
  "échalote": "Légumes & Fruits",
  "tomate": "Légumes & Fruits",
  "tomates": "Légumes & Fruits",
  "poivron": "Légumes & Fruits",
  "courgette": "Légumes & Fruits",
  "épinards": "Légumes & Fruits",
  "champignons": "Légumes & Fruits",
  "ail": "Épicerie & Sauces",
  "sauce soja": "Épicerie & Sauces",
  "huile de sésame": "Épicerie & Sauces",
  "huile d'olive": "Épicerie & Sauces",
  "tomates concassées": "Épicerie & Sauces",
  "piment rouge (flocons)": "Épicerie & Sauces",
  "sucre": "Épicerie & Sauces",
  "graines de sésame": "Épicerie & Sauces",
  "anis étoilé (badiane)": "Épicerie & Sauces",
  "sauce poisson (nuoc-mâm)": "Épicerie & Sauces",
  "sriracha": "Épicerie & Sauces",
  "bouillon de bœuf": "Épicerie & Sauces",
  "sel": "Épicerie & Sauces",
  "poivre": "Épicerie & Sauces",
  "vinaigre": "Épicerie & Sauces",
};

export function getIngredientCategory(name: string): string {
  const n = name.toLowerCase().trim();
  if (INGREDIENT_CATEGORIES[n]) return INGREDIENT_CATEGORIES[n];
  // fuzzy: partial match on known keys
  for (const [key, cat] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (n.includes(key) || key.includes(n)) return cat;
  }
  // Keyword-based fallback for common patterns
  if (/viande|poulet|bœuf|porc|agneau|veau|saumon|thon|crevette|lardon|jambon|bacon|chorizo|dinde/.test(n)) return "Viandes & Protéines";
  if (/riz|pâtes|nouille|quinoa|pomme de terre|pain|farine|couscous|blé|céréale|semoule/.test(n)) return "Féculents & Céréales";
  if (/tomate|oignon|ail|carotte|courgette|poivron|épinard|champignon|concombre|salade|brocoli|chou|poireau|céleri|artichaut|asperge|avocat|citron|fruit|légume|basilic frais|persil frais|coriandre fraîche/.test(n)) return "Légumes & Fruits";
  if (/œuf|oeuf|beurre|crème|lait|fromage|yaourt|mozzarella|parmesan|gruyère|ricotta|mascarpone/.test(n)) return "Crémerie & Frais";
  if (/huile|sauce|vinaigre|moutarde|ketchup|mayo|bouillon|tomate conc|lait de coco|soja|nuoc|sriracha|tabasco|worcester/.test(n)) return "Épicerie & Sauces";
  return "Divers";
}

export const RECETTE_CATEGORIES = [
  "Pâtes",
  "Riz & Bowls",
  "Bouillons & Soupes",
  "Viande",
  "Poisson",
  "Végétarien",
  "Salades",
  "Autre",
] as const;

export function formatQty(quantity: string | null | number, unit: string | null): string {
  if (quantity === null || quantity === undefined || quantity === "") return "";
  const q = typeof quantity === "number"
    ? (Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1))
    : quantity;
  return unit ? `${q} ${unit}` : q;
}
