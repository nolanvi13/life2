import Anthropic from "@anthropic-ai/sdk";
import { getIngredientCategory } from "@/lib/recettes";
import fs from "fs";
import path from "path";

function getApiKey(): string {
  // Try process.env first (works in production / standard Next.js)
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  // Fallback: read .env.local directly (fixes Turbopack dev issue)
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  throw new Error("ANTHROPIC_API_KEY not found");
}


// Canonical ingredient names — shared with the prompt so Claude uses them consistently
const CANONICAL_NAMES = `
Utilise TOUJOURS ces noms canoniques pour les ingrédients courants :
- Viandes : "Bœuf haché", "Blanc de poulet", "Lardons", "Saumon", "Thon en boîte", "Crevettes", "Viande hachée de porc", "Chorizo"
- Féculents : "Riz blanc", "Pâtes", "Nouilles de riz", "Quinoa", "Pommes de terre", "Pain de mie"
- Légumes : "Tomates", "Oignons", "Ail", "Carottes", "Courgettes", "Poivron rouge", "Poivron vert", "Épinards", "Champignons", "Concombre", "Salade verte", "Échalote", "Poireaux", "Brocoli"
- Fruits : "Citron", "Citron vert", "Avocat", "Pomme", "Banane"
- Crémerie : "Œufs", "Beurre", "Crème liquide", "Crème fraîche", "Lait", "Parmesan", "Mozzarella", "Gruyère râpé", "Fromage frais"
- Épicerie : "Huile d'olive", "Sauce soja", "Vinaigre balsamique", "Moutarde", "Mayonnaise", "Ketchup", "Sauce tomate", "Tomates concassées", "Lait de coco", "Bouillon de poulet", "Bouillon de bœuf"
- Aromates : "Sel", "Poivre", "Paprika", "Cumin", "Curry", "Thym", "Basilic", "Persil", "Coriandre", "Gingembre frais"
Si l'ingrédient n'est pas dans cette liste, utilise un nom court et standardisé (pas de parenthèses, pas d'articles).`;

const SYSTEM_PROMPT = `Tu es un assistant qui extrait ou génère des recettes de cuisine.
Tu retournes UNIQUEMENT un objet JSON valide, sans markdown, sans texte autour, sans \`\`\`json.
La structure est exactement :
{
  "slug": "slug-kebab-case-unique",
  "title": "Nom de la recette",
  "emoji": "emoji approprié",
  "category": "une valeur parmi : Pâtes | Riz & Bowls | Bouillons & Soupes | Viande | Poisson | Végétarien | Salades | Autre",
  "prep_time": "X min",
  "portions": 2,
  "microwave_friendly": true ou false,
  "tips": ["tip 1", "tip 2"],
  "ingredients": [
    { "name": "Nom ingrédient", "quantity": 200, "unit": "g" }
  ],
  "steps": ["étape 1", "étape 2"]
}
Pour unit : utilise "g", "ml", "L", "c.s.", "c.c.", ou null pour les éléments comptables.
Les quantités sont pour 2 portions.
Réponds en français.
${CANONICAL_NAMES}`;

export async function POST(request: Request) {
  try {
    const client = new Anthropic({ apiKey: getApiKey() });
    const { mode, input } = await request.json() as { mode: "url" | "description"; input: string };

    if (!input?.trim()) {
      return Response.json({ error: "Input manquant" }, { status: 400 });
    }

    let userMessage: string;

    if (mode === "url") {
      let pageContent = "";
      try {
        const res = await fetch(input.trim(), {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Life2App/1.0)" },
          signal: AbortSignal.timeout(8000),
        });
        const html = await res.text();
        pageContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 8000);
      } catch {
        return Response.json({ error: "Impossible de charger cette URL. Essaie la description à la place." }, { status: 400 });
      }
      userMessage = `Voici le contenu d'une page web de recette. Extrais et structure la recette en JSON :\n\n${pageContent}`;
    } else {
      userMessage = `Génère une recette complète et réaliste basée sur cette description : ${input.trim()}`;
    }

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Strip potential markdown code fences
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let recipe: Record<string, unknown>;
    try {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      recipe = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw text:", rawText.slice(0, 500));
      return Response.json({ error: "Claude n'a pas pu générer la recette. Réessaie." }, { status: 500 });
    }

    // Ensure ingredient categories
    if (Array.isArray(recipe.ingredients)) {
      recipe.ingredients = (recipe.ingredients as Array<Record<string, unknown>>).map((ing) => ({
        ...ing,
        category: ing.category ?? getIngredientCategory(String(ing.name ?? "")),
      }));
    }

    return Response.json({ recipe });
  } catch (err) {
    console.error("parse-recipe error:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return Response.json({ error: msg }, { status: 500 });
  }
}
