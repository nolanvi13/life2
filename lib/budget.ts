export type BudgetOwner = "nolan" | "lylou" | "commun";
export type BudgetValues = Record<string, number>;

export type FieldDef = { key: string; label: string };
export type SectionDef = { title: string; category: string; fields: FieldDef[] };

export const PERSONAL_SECTIONS: SectionDef[] = [
  {
    title: "Revenus", category: "revenus",
    fields: [{ key: "salaire", label: "Salaire net" }],
  },
  {
    title: "Obligatoire", category: "obligatoire",
    fields: [
      { key: "impots", label: "Impôts estimés" },
      { key: "assuranceMaladie", label: "Assurance maladie" },
    ],
  },
  {
    title: "Voiture", category: "voiture",
    fields: [
      { key: "leasing", label: "Leasing" },
      { key: "assuranceVoiture", label: "Assurance auto" },
      { key: "essence", label: "Essence" },
      { key: "entretienVoiture", label: "Entretien" },
    ],
  },
  {
    title: "Abonnements", category: "abonnements",
    fields: [
      { key: "telephone", label: "Téléphone" },
      { key: "abonnementsPerso", label: "Autres abos" },
    ],
  },
  {
    title: "Vie quotidienne", category: "vie",
    fields: [
      { key: "loisirs", label: "Loisirs" },
      { key: "vetements", label: "Vêtements" },
      { key: "divers", label: "Divers" },
    ],
  },
  {
    title: "Épargne", category: "epargne",
    fields: [{ key: "epargne", label: "Épargne perso" }],
  },
];

export const COMMUN_SECTIONS: SectionDef[] = [
  {
    title: "Logement", category: "logement",
    fields: [
      { key: "loyer", label: "Loyer total" },
      { key: "wifi", label: "Internet / Wifi" },
    ],
  },
  {
    title: "Alimentation", category: "alimentation",
    fields: [{ key: "nourriture", label: "Courses / Nourriture" }],
  },
  {
    title: "Abonnements communs", category: "abonnements",
    fields: [
      { key: "netflix", label: "Netflix" },
      { key: "spotify", label: "Spotify" },
    ],
  },
  {
    title: "Loisirs communs", category: "loisirs",
    fields: [
      { key: "sortiesCouple", label: "Sorties / Restos" },
      { key: "vacances", label: "Vacances (mensuel)" },
      { key: "divers", label: "Divers commun" },
    ],
  },
  {
    title: "Épargne commune", category: "epargne",
    fields: [{ key: "epargneCommune", label: "Épargne / projet commun" }],
  },
];

const EXPENSE_KEYS = [
  "impots", "leasing", "assuranceVoiture", "essence", "entretienVoiture",
  "assuranceMaladie", "telephone", "abonnementsPerso", "loisirs",
  "vetements", "divers", "epargne",
];

const COMMUN_KEYS = [
  "loyer", "wifi", "nourriture", "netflix", "spotify",
  "sortiesCouple", "vacances", "divers", "epargneCommune",
];

export function calcBudget(nolan: BudgetValues, lylou: BudgetValues, commun: BudgetValues) {
  const n = (k: string) => nolan[k] ?? 0;
  const l = (k: string) => lylou[k] ?? 0;
  const c = (k: string) => commun[k] ?? 0;

  const totalCommun = COMMUN_KEYS.reduce((s, k) => s + c(k), 0);
  const partCommun = totalCommun / 2;

  const depN = EXPENSE_KEYS.reduce((s, k) => s + n(k), 0);
  const depL = EXPENSE_KEYS.reduce((s, k) => s + l(k), 0);

  const totalN = depN + partCommun;
  const totalL = depL + partCommun;

  return {
    totalCommun, partCommun,
    depN, depL, totalN, totalL,
    resteN: n("salaire") - totalN,
    resteL: l("salaire") - totalL,
    salaireN: n("salaire"),
    salaireL: l("salaire"),
  };
}

export function gaugeStatus(reste: number, salaire: number) {
  const pct = salaire > 0 ? Math.max(0, Math.min((reste / salaire) * 100, 100)) : 0;
  if (pct >= 25) return { label: "Confortable", color: "var(--accent-green)", pct };
  if (pct >= 12) return { label: "Limite", color: "#F59E0B", pct };
  return { label: "Serré", color: "#EF4444", pct };
}

export const fmt = (n: number) =>
  new Intl.NumberFormat("fr-CH", {
    style: "currency", currency: "CHF", maximumFractionDigits: 0,
  }).format(n);
