"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Depense, SplitType } from "@/lib/depenses";
import { DEPENSE_CATEGORIES, CATEGORY_EMOJI, fmtCHF, owedAmount } from "@/lib/depenses";
import { useApp } from "@/components/providers/AppProvider";

type DepensePayload = Omit<Depense, "id" | "couple_id" | "created_at">;

interface Props {
  onClose: () => void;
  onSave: (d: DepensePayload) => Promise<void>;
  initial?: Depense;
}

const CURRENCIES = [
  { code: "CHF", flag: "🇨🇭" },
  { code: "EUR", flag: "🇪🇺" },
  { code: "USD", flag: "🇺🇸" },
  { code: "GBP", flag: "🇬🇧" },
  { code: "CAD", flag: "🇨🇦" },
  { code: "AUD", flag: "🇦🇺" },
  { code: "JPY", flag: "🇯🇵" },
  { code: "SEK", flag: "🇸🇪" },
  { code: "NOK", flag: "🇳🇴" },
  { code: "DKK", flag: "🇩🇰" },
  { code: "CZK", flag: "🇨🇿" },
  { code: "HUF", flag: "🇭🇺" },
  { code: "TRY", flag: "🇹🇷" },
  { code: "THB", flag: "🇹🇭" },
  { code: "HKD", flag: "🇭🇰" },
  { code: "SGD", flag: "🇸🇬" },
  { code: "MXN", flag: "🇲🇽" },
];

function splitTypeToChecks(splitType: SplitType, paidBy: "nolan" | "lylou") {
  if (splitType === "none") return { nolanChecked: paidBy === "nolan", lylouChecked: paidBy === "lylou" };
  return { nolanChecked: true, lylouChecked: true };
}

export function AddDepenseModal({ onClose, onSave, initial }: Props) {
  const { myOwner, nolanName, lylouName } = useApp();
  const isEdit = !!initial;

  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial?.original_amount ? String(initial.original_amount) : initial ? String(initial.amount) : "");
  const [currency, setCurrency] = useState<string>(initial?.currency || "CHF");
  const [paidBy, setPaidBy] = useState<"nolan" | "lylou">(initial?.paid_by ?? myOwner);
  const [category, setCategory] = useState(initial?.category ?? "Autre");

  const initChecks = splitTypeToChecks(initial?.split_type ?? "half", initial?.paid_by ?? myOwner);
  const [nolanChecked, setNolanChecked] = useState(initChecks.nolanChecked);
  const [lylouChecked, setLylouChecked] = useState(initChecks.lylouChecked);

  const isInitCustom = initial?.split_type === "custom";
  const [useCustom, setUseCustom] = useState(isInitCustom);
  const [customAmount, setCustomAmount] = useState(
    isInitCustom && initial?.custom_amount ? String(initial.custom_amount) : ""
  );

  // Conversion devise
  const [convertedCHF, setConvertedCHF] = useState<number | null>(
    initial ? initial.amount : null
  );
  const [converting, setConverting] = useState(false);
  const [conversionError, setConversionError] = useState(false);
  const convertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstRef = useRef<HTMLInputElement>(null);

  const fetchConversion = useCallback(async (amt: number, cur: string) => {
    if (cur === "CHF") { setConvertedCHF(amt); setConversionError(false); return; }
    setConverting(true);
    setConversionError(false);
    try {
      const from = cur.toLowerCase();
      const res = await fetch(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.min.json`
      );
      const data = await res.json();
      const rate = data?.[from]?.["chf"];
      if (typeof rate === "number") {
        setConvertedCHF(Math.round(amt * rate * 100) / 100);
      } else {
        setConversionError(true);
        setConvertedCHF(null);
      }
    } catch {
      setConversionError(true);
      setConvertedCHF(null);
    } finally {
      setConverting(false);
    }
  }, []);

  // Re-convertir quand montant ou devise change
  useEffect(() => {
    const num = parseFloat(amount.replace(",", "."));
    if (isNaN(num) || num <= 0) { setConvertedCHF(null); return; }
    if (currency === "CHF") { setConvertedCHF(num); setConversionError(false); return; }
    if (convertTimer.current) clearTimeout(convertTimer.current);
    setConverting(true);
    convertTimer.current = setTimeout(() => fetchConversion(num, currency), 500);
    return () => { if (convertTimer.current) clearTimeout(convertTimer.current); };
  }, [amount, currency, fetchConversion]);

  function handlePaidByChange(owner: "nolan" | "lylou") {
    setPaidBy(owner);
    setNolanChecked(true);
    setLylouChecked(true);
  }

  function handleNolanCheck(v: boolean) {
    setNolanChecked(v);
    if (!v) { setUseCustom(false); setCustomAmount(""); }
  }
  function handleLylouCheck(v: boolean) {
    setLylouChecked(v);
    if (!v) { setUseCustom(false); setCustomAmount(""); }
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

  const num = parseFloat(amount.replace(",", "."));
  const validAmount = !isNaN(num) && num > 0;
  const bothChecked = nolanChecked && lylouChecked;

  function getSplitType(): SplitType {
    if (!nolanChecked && !lylouChecked) return "none";
    if (nolanChecked && !lylouChecked) return paidBy === "nolan" ? "none" : "full";
    if (!nolanChecked && lylouChecked) return paidBy === "lylou" ? "none" : "full";
    if (useCustom) return "custom";
    return "half";
  }

  function getCustomAmount(): number | null {
    if (!useCustom) return null;
    const v = parseFloat(customAmount.replace(",", "."));
    return isNaN(v) ? null : v;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !validAmount || convertedCHF === null) return;
    const split_type = getSplitType();
    const custom_amount = getCustomAmount();
    if (split_type === "custom" && (custom_amount === null || custom_amount <= 0 || custom_amount >= convertedCHF)) return;

    onClose();
    await onSave({
      description: description.trim(),
      amount: convertedCHF,           // CHF converti → stocké en DB
      original_amount: currency !== "CHF" ? num : null,
      currency: currency !== "CHF" ? currency : "CHF",
      paid_by: paidBy,
      split_type,
      custom_amount,
      category,
    });
  }

  const nameOf = (owner: "nolan" | "lylou") => owner === "nolan" ? nolanName : lylouName;
  const splitType = getSplitType();
  const customAmt = getCustomAmount();
  const nonPayer: "nolan" | "lylou" = paidBy === "nolan" ? "lylou" : "nolan";

  function previewText(): string | null {
    if (!validAmount || convertedCHF === null) return null;
    if (splitType === "none") return null;
    const payer = nameOf(paidBy);
    const other = nameOf(nonPayer);
    const owed = owedAmount(convertedCHF, splitType, customAmt ?? undefined);
    if (owed <= 0) return null;
    if (splitType === "custom" && customAmt !== null) {
      return `${other} rembourse ${fmtCHF(customAmt)} · ${payer} garde ${fmtCHF(convertedCHF - customAmt)}`;
    }
    return `${other} devra ${fmtCHF(owed)} à ${payer}`;
  }

  const preview = previewText();
  const canSubmit =
    description.trim() && validAmount && convertedCHF !== null && !conversionError &&
    (splitType !== "custom" || (customAmt !== null && customAmt > 0 && customAmt < convertedCHF));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}
      role="dialog" aria-modal="true"
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

          {/* Montant + devise */}
          <div>
            <label style={labelStyle}>Montant</label>

            {/* Sélecteur de devise */}
            <div className="flex gap-2 mt-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
              {CURRENCIES.map(({ code, flag }) => (
                <button
                  key={code} type="button"
                  onClick={() => setCurrency(code)}
                  style={{
                    flexShrink: 0, padding: "5px 10px", borderRadius: "20px",
                    fontSize: "12px", fontFamily: "var(--font-body)", whiteSpace: "nowrap",
                    border: `1.5px solid ${currency === code ? "var(--color-forest)" : "var(--color-border)"}`,
                    background: currency === code ? "var(--color-forest)" : "transparent",
                    color: currency === code ? "#fff" : "var(--color-ink-soft)",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                  }}
                >
                  {flag} {code}
                </button>
              ))}
            </div>

            {/* Input montant */}
            <input
              type="number" inputMode="decimal" step="0.01" min="0.01"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" required
              style={{ ...inputStyle, fontSize: "22px", fontFamily: "var(--font-display)", marginTop: 0 }}
            />

            {/* Résultat de la conversion */}
            {currency !== "CHF" && validAmount && (
              <div style={{
                marginTop: "8px", padding: "10px 14px", borderRadius: "10px",
                background: conversionError ? "rgba(220,38,38,0.06)" : "rgba(44,74,53,0.06)",
                border: `1px solid ${conversionError ? "rgba(220,38,38,0.2)" : "rgba(44,74,53,0.12)"}`,
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                {converting ? (
                  <span style={{ fontSize: "13px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                    Conversion en cours…
                  </span>
                ) : conversionError ? (
                  <span style={{ fontSize: "13px", color: "#DC2626", fontFamily: "var(--font-body)" }}>
                    ⚠ Conversion indisponible
                  </span>
                ) : convertedCHF !== null ? (
                  <>
                    <span style={{ fontSize: "13px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                      {amount} {currency}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--color-muted)" }}>→</span>
                    <span style={{ fontSize: "16px", fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--color-forest)" }}>
                      {fmtCHF(convertedCHF)}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginLeft: "auto" }}>
                      taux en direct
                    </span>
                  </>
                ) : null}
              </div>
            )}
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

          {/* Qui rembourse */}
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>Qui rembourse ?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <CheckPersonButton name={nolanName} checked={nolanChecked} isPayer={paidBy === "nolan"} onChange={handleNolanCheck} />
              <CheckPersonButton name={lylouName} checked={lylouChecked} isPayer={paidBy === "lylou"} onChange={handleLylouCheck} />
            </div>

            {/* Montant custom */}
            {bothChecked && (
              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => { setUseCustom((v) => !v); setCustomAmount(""); }}
                  style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
                >
                  <div style={{
                    width: "36px", height: "20px", borderRadius: "10px",
                    background: useCustom ? "var(--color-forest)" : "var(--color-border)",
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
                  }}>
                    <div style={{
                      position: "absolute", top: "2px", left: useCustom ? "18px" : "2px",
                      width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: useCustom ? "var(--color-forest)" : "var(--color-muted)", fontWeight: useCustom ? 500 : 400 }}>
                    Montant personnalisé
                  </span>
                </button>

                {useCustom && (
                  <div style={{ marginTop: "4px" }}>
                    <label style={{ ...labelStyle, display: "block", marginBottom: "6px" }}>
                      Montant remboursé par {nameOf(nonPayer)} (CHF)
                    </label>
                    <input
                      type="number" inputMode="decimal" step="0.01" min="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                      style={{ ...inputStyle, fontSize: "20px", fontFamily: "var(--font-display)" }}
                    />
                    {convertedCHF !== null && customAmt !== null && customAmt > 0 && customAmt < convertedCHF && (
                      <p style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginTop: "6px" }}>
                        {nameOf(paidBy)} garde {fmtCHF(convertedCHF - customAmt)} à sa charge
                      </p>
                    )}
                    {convertedCHF !== null && customAmt !== null && customAmt >= convertedCHF && (
                      <p style={{ fontSize: "12px", color: "#DC2626", fontFamily: "var(--font-body)", marginTop: "6px" }}>
                        Le montant ne peut pas dépasser {fmtCHF(convertedCHF)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {preview ? (
              <div className="mt-3 rounded-xl px-4 py-3" style={{ background: "rgba(44,74,53,0.06)", border: "1px solid rgba(44,74,53,0.12)" }}>
                <p style={{ fontSize: "13px", color: "var(--color-forest)", fontFamily: "var(--font-body)", fontWeight: 500, textAlign: "center" }}>
                  → {preview}
                </p>
              </div>
            ) : splitType === "none" && (
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
            disabled={!canSubmit}
            style={{
              width: "100%", padding: "15px", borderRadius: "14px", border: "none",
              background: "var(--color-forest)", color: "#fff",
              fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 500,
              cursor: !canSubmit ? "not-allowed" : "pointer",
              opacity: !canSubmit ? 0.5 : 1, transition: "opacity 0.15s",
            }}>
            {isEdit ? "Enregistrer les modifications" : "Ajouter la dépense"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckPersonButton({ name, checked, isPayer, onChange }: {
  name: string; checked: boolean; isPayer: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        padding: "14px 12px", borderRadius: "12px", cursor: "pointer", transition: "all 0.15s",
        border: `2px solid ${checked ? "var(--color-forest)" : "var(--color-border)"}`,
        background: checked ? "rgba(44,74,53,0.06)" : "var(--surface-2)",
        display: "flex", alignItems: "center", gap: "10px",
      }}
    >
      <div style={{
        width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
        border: `2px solid ${checked ? "var(--color-forest)" : "var(--color-border)"}`,
        background: checked ? "var(--color-forest)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
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
        {isPayer && <p style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginTop: "1px" }}>a payé</p>}
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
