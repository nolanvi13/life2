"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { useDepenses } from "@/hooks/useDepenses";
import { AddDepenseModal } from "./AddDepenseModal";
import { CATEGORY_EMOJI, fmtCHF, computeBalance, owedAmount, effectiveCost } from "@/lib/depenses";
import type { Depense } from "@/lib/depenses";

const MOIS_LONG = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MOIS_COURT = ["jan","fév","mar","avr","mai","juin","juil","aoû","sep","oct","nov","déc"];

function toYM(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MOIS_LONG[d.getMonth()]}`;
}
function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]} à ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function DepensesPage() {
  const { coupleId, myOwner, nolanName, lylouName } = useApp();
  const { depenses, loading, addDepense, updateDepense, deleteDepense, markSettled } = useDepenses(coupleId);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Depense | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmSettle, setConfirmSettle] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyYM, setHistoryYM] = useState<string | null>(null);

  const nameOf = (owner: "nolan" | "lylou") => owner === "nolan" ? nolanName : lylouName;
  const partnerOwner: "nolan" | "lylou" = myOwner === "nolan" ? "lylou" : "nolan";

  // Tout ce qui n'a pas encore été réglé via Twint — peu importe la date
  const unsettled = useMemo(
    () => depenses.filter((d) => !d.settled_at).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [depenses]
  );
  const settled = useMemo(
    () => depenses.filter((d) => d.settled_at),
    [depenses]
  );

  const balance = useMemo(() => computeBalance(unsettled, myOwner), [unsettled, myOwner]);
  const totalAll = unsettled.reduce((s, d) => s + d.amount, 0);

  // Mois disponibles dans l'historique (réglés uniquement)
  const historyMonths = useMemo(() => {
    const months = new Set<string>();
    settled.forEach((d) => months.add(toYM(new Date(d.created_at))));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [settled]);

  const historyFiltered = useMemo(
    () => historyYM ? settled.filter((d) => toYM(new Date(d.created_at)) === historyYM) : [],
    [settled, historyYM]
  );

  function monthLabel(ym: string) {
    const [y, m] = ym.split("-");
    return `${MOIS_COURT[parseInt(m) - 1]} ${y}`;
  }

  async function handleSettle() {
    await markSettled(unsettled.map((d) => d.id));
    setConfirmSettle(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>Chargement…</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 pt-9 pb-32 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "34px", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.8px" }}>
          Dépenses
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: "var(--color-forest)", color: "#fff", border: "none",
            borderRadius: "10px", padding: "9px 16px", fontFamily: "var(--font-body)",
            fontSize: "13px", fontWeight: 500, cursor: "pointer",
          }}
        >
          + Ajouter
        </button>
      </div>

      {/* Balance card — basé sur le non-réglé, indépendant du mois calendaire */}
      <div
        className="mb-5 rounded-2xl p-5"
        style={{
          background: Math.abs(balance) < 0.01
            ? "var(--color-module-budget)"
            : balance > 0 ? "rgba(239,68,68,0.07)" : "rgba(44,74,53,0.06)",
          border: `1px solid ${Math.abs(balance) < 0.01 ? "var(--color-border)" : balance > 0 ? "rgba(239,68,68,0.2)" : "rgba(44,74,53,0.15)"}`,
        }}
      >
        <p style={{ fontSize: "11px", fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: "8px" }}>
          À régler · depuis le dernier Twint
        </p>

        {unsettled.length === 0 ? (
          <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 500, color: "var(--color-muted)" }}>
            Aucune dépense à régler
          </p>
        ) : Math.abs(balance) < 0.01 ? (
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 500, color: "var(--color-forest)" }}>✅ Vous êtes quittes</p>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginTop: "4px" }}>Aucun virement nécessaire</p>
          </div>
        ) : balance > 0 ? (
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 500, color: "#DC2626" }}>
              Tu dois {fmtCHF(balance)} à {nameOf(partnerOwner)}
            </p>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginTop: "4px" }}>{nameOf(partnerOwner)} a avancé plus depuis le dernier règlement</p>
          </div>
        ) : (
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 500, color: "var(--color-forest)" }}>
              {nameOf(partnerOwner)} te doit {fmtCHF(-balance)}
            </p>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginTop: "4px" }}>Tu as avancé plus depuis le dernier règlement</p>
          </div>
        )}

        {/* Stats — coût effectif par personne */}
        {unsettled.length > 0 && (
          <div className="flex mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)", gap: 0 }}>
            <StatBox label={nameOf("nolan")} amount={effectiveCost(unsettled, "nolan")} />
            <div style={{ width: "1px", background: "var(--color-border)", margin: "0 12px", flexShrink: 0 }} />
            <StatBox label={nameOf("lylou")} amount={effectiveCost(unsettled, "lylou")} />
            <div style={{ width: "1px", background: "var(--color-border)", margin: "0 12px", flexShrink: 0 }} />
            <StatBox label="Total" amount={totalAll} />
          </div>
        )}
      </div>

      {/* Liste des dépenses non réglées */}
      {unsettled.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">💸</p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
            Aucune dépense pour l'instant
          </p>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              marginTop: "16px", padding: "9px 18px", borderRadius: "10px", fontSize: "13px",
              fontWeight: 500, background: "var(--color-forest)", color: "#fff",
              border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
            }}
          >
            Ajouter la première
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {unsettled.map((d) => (
            <DepenseRow
              key={d.id}
              depense={d}
              nameOf={nameOf}
              myOwner={myOwner}
              confirmDelete={confirmDelete}
              setConfirmDelete={setConfirmDelete}
              onDelete={deleteDepense}
              onEdit={() => setEditing(d)}
              readOnly={false}
            />
          ))}
        </div>
      )}

      {/* Marquer comme réglé */}
      {unsettled.length > 0 && (
        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
          {confirmSettle ? (
            <div className="rounded-2xl p-4" style={{ background: "rgba(44,74,53,0.06)", border: "1px solid rgba(44,74,53,0.15)" }}>
              <p style={{ fontSize: "14px", fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-ink)", marginBottom: "4px" }}>
                Marquer comme réglé ?
              </p>
              <p style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginBottom: "12px" }}>
                Les {unsettled.length} dépenses actuelles passeront dans l'historique. Le solde repart à zéro — à faire une fois le Twint envoyé.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSettle}
                  style={{
                    flex: 1, padding: "10px", borderRadius: "10px", border: "none",
                    background: "var(--color-forest)", color: "#fff", fontFamily: "var(--font-body)",
                    fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Oui, réglé
                </button>
                <button
                  onClick={() => setConfirmSettle(false)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: "10px",
                    border: "1px solid var(--color-border)", background: "transparent",
                    color: "var(--color-ink)", fontFamily: "var(--font-body)",
                    fontSize: "13px", cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmSettle(true)}
              style={{
                width: "100%", padding: "13px", borderRadius: "12px",
                border: "none", background: "var(--color-forest)",
                color: "#fff", fontFamily: "var(--font-body)",
                fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              💸 Marquer comme réglé (Twint envoyé)
            </button>
          )}
        </div>
      )}

      {/* Historique */}
      <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
        <button
          onClick={() => setShowHistory((v) => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            background: "none", border: "none", cursor: "pointer", padding: "4px 0",
          }}
        >
          <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.4px", textTransform: "uppercase" }}>
            Historique des règlements {settled.length > 0 && `(${settled.length})`}
          </span>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            style={{ color: "var(--color-muted)", transform: showHistory ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showHistory && (
          <div className="mt-4">
            {historyMonths.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--color-muted)", fontFamily: "var(--font-body)", textAlign: "center", padding: "20px 0" }}>
                Aucun règlement effectué pour l'instant
              </p>
            ) : (
              <>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                  {historyMonths.map((ym) => (
                    <button
                      key={ym}
                      onClick={() => setHistoryYM(historyYM === ym ? null : ym)}
                      style={{
                        flexShrink: 0, padding: "6px 14px", borderRadius: "20px",
                        fontSize: "13px", fontFamily: "var(--font-body)", whiteSpace: "nowrap",
                        border: `1px solid ${historyYM === ym ? "var(--color-forest)" : "var(--color-border)"}`,
                        background: historyYM === ym ? "var(--color-forest)" : "transparent",
                        color: historyYM === ym ? "#fff" : "var(--color-ink-soft)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {monthLabel(ym)}
                    </button>
                  ))}
                </div>

                {historyYM && (
                  <div className="space-y-2">
                    {historyFiltered.map((d) => (
                      <DepenseRow
                        key={d.id}
                        depense={d}
                        nameOf={nameOf}
                        myOwner={myOwner}
                        confirmDelete={confirmDelete}
                        setConfirmDelete={setConfirmDelete}
                        onDelete={deleteDepense}
                        onEdit={() => setEditing(d)}
                        readOnly={true}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddDepenseModal
          onClose={() => setShowAdd(false)}
          onSave={addDepense}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AddDepenseModal
          onClose={() => setEditing(null)}
          onSave={(payload) => updateDepense(editing.id, payload)}
          initial={editing}
        />
      )}
    </div>
  );
}

function StatBox({ label, amount }: { label: string; amount: number }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginBottom: "2px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 500, color: "var(--color-ink)" }}>
        {fmtCHF(amount)}
      </p>
    </div>
  );
}

function DepenseRow({
  depense, nameOf, myOwner, confirmDelete, setConfirmDelete, onDelete, onEdit, readOnly,
}: {
  depense: Depense;
  nameOf: (o: "nolan" | "lylou") => string;
  myOwner: "nolan" | "lylou";
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
  onDelete: (id: string) => Promise<void>;
  onEdit: () => void;
  readOnly: boolean;
}) {
  const isMe = depense.paid_by === myOwner;

  return (
    <div
      style={{
        background: "var(--surface-2)", borderRadius: "14px", padding: "14px 16px",
        border: "0.5px solid var(--color-border)", display: "flex", alignItems: "center", gap: "12px",
      }}
    >
      {/* Emoji */}
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px", background: "var(--color-module-budget)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0,
      }}>
        {CATEGORY_EMOJI[depense.category] ?? "💸"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 500, color: "var(--color-ink)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {depense.description}
        </p>
        <p style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginTop: "2px" }}>
          {nameOf(depense.paid_by)} · {readOnly ? formatDate(depense.created_at) : formatDateTime(depense.created_at)}
          {depense.split_type === "half" && (
            <span style={{ marginLeft: "6px", background: "rgba(44,74,53,0.08)", color: "var(--color-forest)", borderRadius: "6px", padding: "1px 6px", fontSize: "11px" }}>÷2</span>
          )}
          {depense.split_type === "full" && (
            <span style={{ marginLeft: "6px", background: "rgba(220,38,38,0.08)", color: "#DC2626", borderRadius: "6px", padding: "1px 6px", fontSize: "11px" }}>tout</span>
          )}
          {depense.split_type === "custom" && (
            <span style={{ marginLeft: "6px", background: "rgba(124,92,252,0.1)", color: "#7C5CFC", borderRadius: "6px", padding: "1px 6px", fontSize: "11px" }}>perso</span>
          )}
        </p>
      </div>

      {/* Amount */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 500, color: isMe ? "var(--color-forest)" : "var(--color-ink)" }}>
          {fmtCHF(depense.amount)}
        </p>
        {depense.currency && depense.currency !== "CHF" && depense.original_amount && (
          <p style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
            {depense.original_amount} {depense.currency}
          </p>
        )}
        {depense.split_type !== "none" && (
          <p style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
            {fmtCHF(owedAmount(depense.amount, depense.split_type, depense.custom_amount ?? undefined))} dû
          </p>
        )}
      </div>

      {/* Actions */}
      {!readOnly && (
        confirmDelete === depense.id ? (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onDelete(depense.id)}
              style={{ padding: "5px 10px", borderRadius: "8px", background: "#DC2626", color: "#fff", border: "none", fontSize: "12px", fontFamily: "var(--font-body)", cursor: "pointer" }}>
              Oui
            </button>
            <button onClick={() => setConfirmDelete(null)}
              style={{ padding: "5px 10px", borderRadius: "8px", background: "var(--color-border)", color: "var(--color-ink)", border: "none", fontSize: "12px", fontFamily: "var(--font-body)", cursor: "pointer" }}>
              Non
            </button>
          </div>
        ) : (
          <div className="flex gap-1 flex-shrink-0">
            {/* Edit */}
            <button onClick={onEdit}
              style={{ color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {/* Delete */}
            <button onClick={() => setConfirmDelete(depense.id)}
              style={{ color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )
      )}
    </div>
  );
}
