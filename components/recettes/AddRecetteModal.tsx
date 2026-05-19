"use client";

import { useEffect, useState } from "react";
import type { Recette, Ingredient } from "@/lib/recettes";
import { RECETTE_CATEGORIES, getIngredientCategory } from "@/lib/recettes";
import { RecetteModal } from "./RecetteModal";

type Mode = "url" | "description" | "manual";
type Step = "choose" | "input" | "loading" | "preview" | "manual";

interface Props {
  onClose: () => void;
  onAdd: (recipe: Omit<Recette, "id" | "couple_id" | "created_at" | "in_week">) => Promise<void>;
}

const EMPTY_INGREDIENT: Ingredient = { name: "", quantity: null, unit: null };

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function AddRecetteModal({ onClose, onAdd }: Props) {
  const [step, setStep] = useState<Step>("choose");
  const [mode, setMode] = useState<Mode>("url");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<Omit<Recette, "id" | "couple_id" | "created_at" | "in_week"> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [adding, setAdding] = useState(false);

  // Manual form state
  const [manualTitle, setManualTitle] = useState("");
  const [manualEmoji, setManualEmoji] = useState("🍽️");
  const [manualCategory, setManualCategory] = useState<string>("Autre");
  const [manualPrepTime, setManualPrepTime] = useState("");
  const [manualPortions, setManualPortions] = useState(2);
  const [manualMicrowave, setManualMicrowave] = useState(false);
  const [manualIngredients, setManualIngredients] = useState<Ingredient[]>([{ ...EMPTY_INGREDIENT }]);
  const [manualSteps, setManualSteps] = useState<string[]>([""]);
  const [manualTips, setManualTips] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function generate() {
    if (!input.trim()) return;
    setError("");
    setStep("loading");
    try {
      const res = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      setGenerated(data.recipe);
      setStep("preview");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
      setStep("input");
    }
  }

  async function handleAddGenerated() {
    if (!generated) return;
    setAdding(true);
    try {
      await onAdd(generated);
      onClose();
    } catch {
      setError("Impossible d'ajouter la recette.");
      setAdding(false);
    }
  }

  async function handleAddManual() {
    if (!manualTitle.trim()) return;
    setAdding(true);
    const ingredients = manualIngredients.filter((i) => i.name.trim()).map((i) => ({
      ...i,
      category: getIngredientCategory(i.name),
    }));
    const steps = manualSteps.filter((s) => s.trim());
    const tips = manualTips.filter((t) => t.trim());
    try {
      await onAdd({
        slug: slugify(manualTitle),
        title: manualTitle.trim(),
        emoji: manualEmoji,
        category: manualCategory,
        prep_time: manualPrepTime || "? min",
        portions: manualPortions,
        microwave_friendly: manualMicrowave,
        tips,
        ingredients,
        steps,
        source_url: null,
      });
      onClose();
    } catch {
      setError("Impossible d'ajouter la recette.");
      setAdding(false);
    }
  }

  function restart() {
    setStep("choose");
    setInput("");
    setGenerated(null);
    setError("");
  }

  // Ingredient helpers
  function updateIng(idx: number, field: keyof Ingredient, val: string) {
    setManualIngredients((prev) => prev.map((ing, i) => {
      if (i !== idx) return ing;
      if (field === "quantity") return { ...ing, quantity: val === "" ? null : Number(val) || null };
      return { ...ing, [field]: val || null };
    }));
  }
  function addIng() { setManualIngredients((p) => [...p, { ...EMPTY_INGREDIENT }]); }
  function removeIng(idx: number) { setManualIngredients((p) => p.filter((_, i) => i !== idx)); }

  // Steps helpers
  function updateStep(idx: number, val: string) { setManualSteps((p) => p.map((s, i) => i === idx ? val : s)); }
  function addStep() { setManualSteps((p) => [...p, ""]); }
  function removeStep(idx: number) { setManualSteps((p) => p.filter((_, i) => i !== idx)); }

  // Tips helpers
  function updateTip(idx: number, val: string) { setManualTips((p) => p.map((t, i) => i === idx ? val : t)); }
  function addTip() { setManualTips((p) => [...p, ""]); }
  function removeTip(idx: number) { setManualTips((p) => p.filter((_, i) => i !== idx)); }

  if (showPreview && generated) {
    const fakeRecette: Recette = { ...generated, id: "__preview__", couple_id: "", created_at: "", in_week: false };
    return <RecetteModal recette={fakeRecette} onClose={() => setShowPreview(false)} />;
  }

  const inputStyle = {
    background: "var(--surface-2)",
    border: "1.5px solid var(--border)",
    color: "var(--text)",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full md:max-w-lg md:rounded-3xl rounded-t-3xl flex flex-col animate-fade-up"
        style={{ background: "var(--bg)", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
            {step === "choose" && "Ajouter une recette"}
            {step === "input" && (mode === "url" ? "Depuis une URL" : "Décrire un plat")}
            {step === "loading" && "Génération…"}
            {step === "preview" && "Recette générée ✨"}
            {step === "manual" && "Créer une recette"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ color: "var(--text-xmuted)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {/* Step: choose */}
          {step === "choose" && (
            <div className="grid grid-cols-1 gap-3">
              {[
                { mode: "url" as Mode, icon: "🔗", label: "Depuis une URL", desc: "Colle le lien d'une recette en ligne", step: "input" as Step },
                { mode: "description" as Mode, icon: "✨", label: "Décrire à Claude", desc: "Dis-moi ce que tu veux manger", step: "input" as Step },
                { mode: "manual" as Mode, icon: "✏️", label: "Créer manuellement", desc: "Remplis les champs toi-même", step: "manual" as Step },
              ].map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => { setMode(opt.mode); setStep(opt.step); }}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-150"
                  style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)" }}
                >
                  <span className="text-3xl flex-shrink-0">{opt.icon}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step: AI input */}
          {step === "input" && (
            <div className="space-y-4">
              <button onClick={() => setStep("choose")} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
              {mode === "url" ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>URL de la recette</label>
                  <input type="url" value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://..." autoFocus
                    className="h-11 px-3 rounded-2xl text-sm outline-none" style={inputStyle} />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Description du plat</label>
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ex: Un risotto crémeux aux champignons…" autoFocus rows={3}
                    className="px-3 py-2.5 rounded-2xl text-sm outline-none resize-none" style={inputStyle} />
                </div>
              )}
              {error && <p className="text-xs rounded-xl p-3" style={{ background: "#FEE2E2", color: "#B91C1C" }}>{error}</p>}
              <button onClick={generate} disabled={!input.trim()}
                className="w-full py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: "var(--pastel-purple)", color: "var(--accent-purple)" }}>
                ✨ Générer la recette
              </button>
            </div>
          )}

          {/* Step: loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full border-4 animate-spin"
                style={{ borderColor: "var(--pastel-purple)", borderTopColor: "var(--accent-purple)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Claude prépare ta recette…</p>
            </div>
          )}

          {/* Step: AI preview */}
          {step === "preview" && generated && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <span className="text-3xl">{generated.emoji}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{generated.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {generated.category} · {generated.prep_time} · {generated.ingredients?.length ?? 0} ingrédients
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPreview(true)}
                className="w-full py-2.5 rounded-2xl text-sm font-medium"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                👁 Voir le détail complet
              </button>
              {error && <p className="text-xs rounded-xl p-3" style={{ background: "#FEE2E2", color: "#B91C1C" }}>{error}</p>}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={restart} className="py-3 rounded-2xl text-sm font-bold"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                  Recommencer
                </button>
                <button onClick={handleAddGenerated} disabled={adding}
                  className="py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-60"
                  style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}>
                  {adding ? "Ajout…" : "✓ Ajouter"}
                </button>
              </div>
            </div>
          )}

          {/* Step: manual form */}
          {step === "manual" && (
            <div className="space-y-5">
              <button onClick={() => setStep("choose")} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>

              {/* Title + emoji */}
              <div className="flex gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Emoji</label>
                  <input value={manualEmoji} onChange={(e) => setManualEmoji(e.target.value)} maxLength={2}
                    className="w-14 h-11 text-center text-xl rounded-2xl outline-none" style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Nom de la recette *</label>
                  <input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Poulet rôti aux herbes"
                    className="h-11 px-3 rounded-2xl text-sm outline-none" style={inputStyle} />
                </div>
              </div>

              {/* Category + prep time */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Catégorie</label>
                  <select value={manualCategory} onChange={(e) => setManualCategory(e.target.value)}
                    className="h-11 px-3 rounded-2xl text-sm outline-none" style={inputStyle}>
                    {RECETTE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Temps de prép</label>
                  <input value={manualPrepTime} onChange={(e) => setManualPrepTime(e.target.value)} placeholder="25 min"
                    className="h-11 px-3 rounded-2xl text-sm outline-none" style={inputStyle} />
                </div>
              </div>

              {/* Portions + microwave */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Portions</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setManualPortions((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-xl font-bold" style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text)" }}>−</button>
                    <span className="w-6 text-center text-sm font-bold" style={{ color: "var(--text)" }}>{manualPortions}</span>
                    <button onClick={() => setManualPortions((p) => p + 1)}
                      className="w-8 h-8 rounded-xl font-bold" style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text)" }}>+</button>
                  </div>
                </div>
                <button onClick={() => setManualMicrowave((p) => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold mt-4"
                  style={{
                    background: manualMicrowave ? "var(--pastel-green)" : "var(--surface-2)",
                    color: manualMicrowave ? "var(--accent-green)" : "var(--text-muted)",
                    border: "1.5px solid var(--border)",
                  }}>
                  📦 Tupperware ok
                </button>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Ingrédients</label>
                  <button onClick={addIng} className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}>+ Ajouter</button>
                </div>
                <div className="space-y-2">
                  {manualIngredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-1.5 items-center">
                      <input value={ing.name} onChange={(e) => updateIng(idx, "name", e.target.value)}
                        placeholder="Nom" className="flex-1 h-9 px-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                      <input value={ing.quantity ?? ""} onChange={(e) => updateIng(idx, "quantity", e.target.value)}
                        placeholder="Qté" type="number" min={0}
                        className="w-16 h-9 px-2 rounded-xl text-sm outline-none text-center" style={inputStyle} />
                      <input value={ing.unit ?? ""} onChange={(e) => updateIng(idx, "unit", e.target.value)}
                        placeholder="Unité" className="w-16 h-9 px-2 rounded-xl text-sm outline-none" style={inputStyle} />
                      {manualIngredients.length > 1 && (
                        <button onClick={() => removeIng(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ color: "var(--text-xmuted)", background: "var(--surface-2)" }}>
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Étapes</label>
                  <button onClick={addStep} className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}>+ Ajouter</button>
                </div>
                <div className="space-y-2">
                  {manualSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-1.5 items-start">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2"
                        style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}>{idx + 1}</span>
                      <textarea value={step} onChange={(e) => updateStep(idx, e.target.value)}
                        placeholder={`Étape ${idx + 1}…`} rows={2}
                        className="flex-1 px-2.5 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
                      {manualSteps.length > 1 && (
                        <button onClick={() => removeStep(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 mt-1"
                          style={{ color: "var(--text-xmuted)", background: "var(--surface-2)" }}>
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips (optional) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>💡 Astuces <span style={{ color: "var(--text-xmuted)", fontWeight: 400 }}>(optionnel)</span></label>
                  <button onClick={addTip} className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: "var(--pastel-yellow)", color: "#8B6914" }}>+ Ajouter</button>
                </div>
                <div className="space-y-2">
                  {manualTips.map((tip, idx) => (
                    <div key={idx} className="flex gap-1.5 items-center">
                      <input value={tip} onChange={(e) => updateTip(idx, e.target.value)} placeholder="Ex: Se réchauffe très bien au micro-ondes"
                        className="flex-1 h-9 px-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                      <button onClick={() => removeTip(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg"
                        style={{ color: "var(--text-xmuted)", background: "var(--surface-2)" }}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs rounded-xl p-3" style={{ background: "#FEE2E2", color: "#B91C1C" }}>{error}</p>}

              <button onClick={handleAddManual} disabled={!manualTitle.trim() || adding}
                className="w-full py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}>
                {adding ? "Ajout…" : "✓ Créer la recette"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
