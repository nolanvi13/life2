"use client";

import { useEffect, useRef, useState } from "react";
import type { Depense, SplitType } from "@/lib/depenses";
import { DEPENSE_CATEGORIES, CATEGORY_EMOJI, fmtCHF } from "@/lib/depenses";
import { useApp } from "@/components/providers/AppProvider";

type DepensePayload = Omit<Depense, "id" | "couple_id" | "created_at">;

interface Props {
  onClose: () => void;
  onSave: (d: DepensePayload) => Promise<void>;
  initial?: Depense;
}

/** Dériver le split_type à partir des cases cochées */
function checksToSplitType(
  nolanChecked: boolean,
  lylouChecked: boolean,
  paidBy: "nolan" | "lylou"
): SplitType {
  if (nolanChecked && lylouChecked) return "half";
  if (nolanChecked && paidBy !== "nolan") return "full"; // nolan doit rembourser tout
  if (lylouChecked && paidBy !== "lylou") return "full"; // lylou doit rembourser tout
  return "none";
}

/** Initialiser les cases à partir du split_type existant */
function splitTypeToChecks(splitType: SplitType, paidBy: "nolan" | "lylou") {
  if (splitType === "half") return { nolanChecked: true, lylouChecked: true };
  if (splitType === "full") {
    // l'autre personne (non-payeur) est cochée seule
    return { nolanChecked: paidBy !== "nolan", lylouChecked: paidBy !== "lylou" };
  }
  // none → seulement le payeur
  return { nolanChecked: paidBy === "nolan", lylouChecked: paidBy === "lylou" };
}

export function AddDepenseModal({ onClose, onSave, initial }: Props) {
  const { myOwner, nolanName, lylouName } = useApp();
  const isEdit = !!initial;

  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [paidBy, setPaidBy] = useState<"nolan" | "lylou">(initial?.paid_by ?? myOwner);
  const [category, setCategory] = useState(initial?.category ?? "Autre");

  const initChecks = splitTypeToChecks(initial?.split_type ?? "half", initial?.paid_by ?? myOwner);
  const [nolanChecked, setNolanChecked] = useState(initChecks.nolanChecked);
  const [lylouChecked, setLylouChecked] = useState(initChecks.lylouChecked);

  const firstRef = useRef<HTMLInputElement>(null);

  // Quand paidBy change, recalculer les cases par défaut (les deux cochés)
  function handlePaidByChange(owner: "nolan" | "lylou") {
    setPaidBy(owner);
    setNolanChecked(true);
    setLylouChecked(true);
  }

  useEffect(() => {
    firstRef.current?.focus();
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount.replace(",", "."));
    if (!description.trim() || isNaN(num) || num <= 0) return;
    const split_type = checksToSplitType(nolanChecked, lylouChecked, paidBy);
    onClose();
    await onSave({ description: description.trim(), amount: num, paid_by: paidBy, split_type, category });
  }

  const nameOf = (owner: "nolan" | "lylou") => owner === "nolan" ? nolanName : lylouName;
  const num = parseFloat(amount.replace(",", "."));
  const validAmount = !isNaN(num) && num > 0;
  const splitType = checksToSplitType(nolanChecked, lylouChecked, paidBy);

  // Preview du remboursement
  function previewText() {
    if (!validAmount || splitType === "none") return null;
    const payer = nameOf(paidBy);
    const other = nameOf(paidBy === "nolan" ? "lylou" : "nolan");
    if (splitType === "half") {
      return `${other} devra ${fmtCHF(num / 2)} à ${payer}`;
    }
    // full
    const debtor = nolanChecked && paidBy !== "nolan" ? nolanName : lylouName;
    const creditor = nolanChecked && paidBy !== "nolan" ? (paidBy === "lylou" ? lylouName : nolanName) : (paidBy === "nolan" ? nolanName : lylouName);
    return `${debtor} devra ${fmtCHF(num)} à ${creditor}`;
  }

  const preview = previewText();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full md:max-w-lg md:rounded-3xl rounded-t-3xl flex flex-col"
        style={{
          background: "var(--bg)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          maxHeight: "min(92vh, calc(100dvh - env(safe-area-inset-top, 20px) - 8px))",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 500, color: "var(--color-ink)" }}>
            {isEdit ? "Modifier la dépense" : "Nouvelle dépense"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ color: "var(--color-muted)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <input
              ref={firstRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex. Restaurant Le Lac…"
              required
              style={inputStyle}
            />
          </div>

          {/* Amount */}
          <div>
            <label style={labelStyle}>Montant (CHF)</label>
            <input
              type="number" inputMode="decimal" step="0.01" min="0.01"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" required
              style={{ ...inputStyle, fontSize: "22px", fontFamily: "var(--font-display)" }}
            />
          </div>

          {/* Payé par */}
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>Payé par</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {(["nolan", "lylou"] as const).map((owner) => (
                <button key={owner} type="button" onClick={() => handlePaidByChange(owner)}
                  style={toggleStyle(paidBy === owner)}>
                  {nameOf(owner)}
                  {owner === myOwner && <span style={{ fontSize: "11px", display: "block", opacity: 0.6, marginTop: "2px" }}>Moi</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Qui participe — cases à cocher avec prénoms */}
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>Qui participe ?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <CheckPersonButton
                name={nolanName}
                checked={nolanChecked}
                isPayer={paidBy === "nolan"}
                onChange={setNolanChecked}
              />
              <CheckPersonButton
                name={lylouName}
                checked={lylouChecked}
                isPayer={paidBy === "lylou"}
                onChange={setLylouChecked}
              />
            </div>

            {/* Preview */}
            {preview && (
              <div
                className="mt-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(44,74,53,0.06)", border: "1px solid rgba(44,74,53,0.12)" }}
              >
                <p style={{ fontSize: "13px", color: "var(--color-forest)", fontFamily: "var(--font-body)", fontWeight: 500, textAlign: "center" }}>
                  → {preview}
                </p>
              </div>
            )}
            {splitType === "none" && (
              <p style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)", textAlign: "center", marginTop: "8px" }}>
                Aucun remboursement
              </p>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>Catégorie</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {DEPENSE_CATEGORIES.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  style={{
                    padding: "7px 12px", borderRadius: "20px", cursor: "pointer", transition: "all 0.15s",
                    border: `1.5px solid ${category === cat ? "var(--color-forest)" : "var(--color-border)"}`,
                    background: category === cat ? "var(--color-forest)" : "transparent",
                    color: category === cat ? "#fff" : "var(--color-ink-soft)",
                    fontSize: "13px", fontFamily: "var(--font-body)",
                  }}>
                  {CATEGORY_EMOJI[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!description.trim() || !amount}
            style={{
              width: "100%", padding: "15px", borderRadius: "14px", border: "none",
              background: "var(--color-forest)", color: "#fff",
              fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 500,
              cursor: !description.trim() || !amount ? "not-allowed" : "pointer",
              opacity: !description.trim() || !amount ? 0.5 : 1,
              transition: "opacity 0.15s",
            }}>
            {isEdit ? "Enregistrer les modifications" : "Ajouter la dépense"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckPersonButton({
  name, checked, isPayer, onChange,
}: {
  name: string;
  checked: boolean;
  isPayer: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        padding: "14px 12px",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.15s",
        border: `2px solid ${checked ? "var(--color-forest)" : "var(--color-border)"}`,
        background: checked ? "rgba(44,74,53,0.06)" : "var(--surface-2)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {/* Checkbox visuel */}
      <div style={{
        width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
        border: `2px solid ${checked ? "var(--color-forest)" : "var(--color-border)"}`,
        background: checked ? "var(--color-forest)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{ textAlign: "left" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: checked ? 600 : 400, color: checked ? "var(--color-forest)" : "var(--color-ink-soft)" }}>
          {name}
        </p>
        {isPayer && (
          <p style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginTop: "1px" }}>a payé</p>
        )}
      </div>
    </button>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "12px", fontWeight: 600, letterSpacing: "0.6px",
  textTransform: "uppercase", color: "var(--color-muted)", fontFamily: "var(--font-body)",
};

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", marginTop: "8px", padding: "12px 14px",
  borderRadius: "12px", border: "1px solid var(--color-border)",
  background: "var(--surface-2)", fontSize: "15px",
  fontFamily: "var(--font-body)", color: "var(--color-ink)", outline: "none",
};

function toggleStyle(active: boolean): React.CSSProperties {
  return {
    padding: "12px 8px", borderRadius: "12px", cursor: "pointer", transition: "all 0.15s",
    border: `2px solid ${active ? "var(--color-forest)" : "var(--color-border)"}`,
    background: active ? "rgba(44,74,53,0.06)" : "var(--surface-2)",
    fontFamily: "var(--font-body)", fontSize: "13px",
    fontWeight: active ? 600 : 400,
    color: active ? "var(--color-forest)" : "var(--color-ink-soft)",
  };
}
