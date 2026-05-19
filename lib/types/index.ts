export type User = {
  id: string;
  email: string;
  name: string;
  couple_id: string;
  color: "pink" | "yellow";
  created_at: string;
};

export type Couple = {
  id: string;
  invite_code: string;
  created_at: string;
};

// Budget
export type BudgetTab = "nolan" | "lylou" | "commun";

export type BudgetCategory =
  | "revenus"
  | "obligatoire"
  | "voiture"
  | "abonnements"
  | "vie_quotidienne"
  | "epargne";

export type BudgetEntry = {
  id: string;
  couple_id: string;
  tab: BudgetTab;
  category: BudgetCategory;
  label: string;
  amount: number;
  type: "income" | "expense";
  created_at: string;
  updated_at: string;
};

// Recettes
export type Recette = {
  id: string;
  couple_id: string;
  title: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  source_url?: string;
  created_at: string;
};

export type Ingredient = {
  name: string;
  quantity: string;
  unit?: string;
};

// Courses
export type CourseItem = {
  id: string;
  couple_id: string;
  label: string;
  quantity?: string;
  category?: string;
  checked: boolean;
  added_by: string;
  created_at: string;
};

// Calendrier
export type CalendrierEvent = {
  id: string;
  couple_id: string;
  title: string;
  description?: string;
  date: string;
  end_date?: string;
  all_day: boolean;
  category: EventCategory;
  color?: string;
  created_by: string;
  created_at: string;
};

export type EventCategory =
  | "perso"
  | "commun"
  | "vacances"
  | "rdv"
  | "autre";
