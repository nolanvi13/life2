"use client";

import { useState } from "react";
import { useBudget } from "@/hooks/useBudget";
import { BudgetField } from "./BudgetField";
import { BudgetGauge } from "./BudgetGauge";
import {
  PERSONAL_SECTIONS, COMMUN_SECTIONS, calcBudget, fmt,
  type BudgetOwner, type SectionDef,
} from "@/lib/budget";
import { useApp } from "@/components/providers/AppProvider";
import { IconWallet } from "@tabler/icons-react";

type Tab = "nolan" | "lylou" | "commun" | "synthese";

const SECTION_LABEL_COLORS: Record<string, string> = {
  revenus:      "var(--color-forest)",
  obligatoire:  "#C4614A",
  voiture:      "#E8A020",
  abonnements:  "#7A60C0",
  loisirs:      "#3D6B88",
  épargne:      "var(--color-sage)",
  logement:     "#C4614A",
  alimentation: "var(--color-forest)",
  divers:       "var(--color-muted)",
};

function getSectionColor(title: string): string {
  const key = title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [k, v] of Object.entries(SECTION_LABEL_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "var(--color-forest)";
}

function Section({ section, values, owner, onUpdate }: {
  section: SectionDef;
  values: Record<string, number>;
  owner: BudgetOwner;
  onUpdate: (owner: BudgetOwner, category: string, key: string, val: number) => void;
}) {
  const labelColor = getSectionColor(section.title);
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid var(--color-border)",
        borderRadius: "14px",
        padding: "20px 22px",
        marginBottom: "14px",
      }}
    >
      <h3
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          color: labelColor,
          marginBottom: "16px",
        }}
      >
        {section.title}
      </h3>
      {section.fields.map((f) => (
        <BudgetField
          key={f.key}
          label={f.label}
          value={values[f.key] ?? 0}
          onChange={(val) => onUpdate(owner, section.category, f.key, val)}
        />
      ))}
    </div>
  );
}

function SynthRow({ label, value, highlight, sub }: { label: string; value: number; highlight?: boolean; sub?: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <span
        className="text-sm"
        style={{
          color: highlight ? "var(--color-ink)" : sub ? "var(--text-xmuted)" : "var(--color-muted)",
          fontWeight: highlight ? 600 : 400,
          paddingLeft: sub ? "12px" : 0,
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </span>
      <span
        className="text-sm tabular-nums"
        style={{
          color: highlight ? "var(--color-forest)" : "var(--color-ink)",
          fontFamily: "var(--font-display)",
          fontWeight: highlight ? 500 : 400,
        }}
      >
        {fmt(value)}
      </span>
    </div>
  );
}

export function BudgetPage() {
  const { coupleId, nolanName, lylouName, myOwner } = useApp();
  const [tab, setTab] = useState<Tab>(myOwner);
  const { nolan, lylou, commun, loading, updateField } = useBudget(coupleId);

  const calc = calcBudget(nolan, lylou, commun);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>Chargement…</div>
      </div>
    );
  }

  const TABS = [
    { id: "nolan" as Tab,    label: nolanName },
    { id: "lylou" as Tab,    label: lylouName },
    { id: "commun" as Tab,   label: "Commun"  },
    { id: "synthese" as Tab, label: "Synthèse" },
  ];

  return (
    <div className="max-w-lg mx-auto px-6 pt-9 pb-32 md:pb-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <IconWallet size={20} stroke={1.5} style={{ color: "var(--color-forest)" }} />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "34px",
              fontWeight: 500,
              color: "var(--color-ink)",
              letterSpacing: "-0.8px",
            }}
          >
            Budget
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "4px",
          background: "var(--color-cream)",
          borderRadius: "12px",
          marginBottom: "24px",
          width: "fit-content",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "7px 18px",
              borderRadius: "9px",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              background: tab === t.id ? "#fff" : "transparent",
              color: tab === t.id ? "var(--color-ink)" : "var(--color-muted)",
              fontWeight: tab === t.id ? 500 : 400,
              border: "none",
              cursor: "pointer",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Nolan tab */}
      {tab === "nolan" && (
        <div className="animate-fade-up">
          {PERSONAL_SECTIONS.map((s) => (
            <Section key={s.category + s.title} section={s} values={nolan} owner="nolan" onUpdate={updateField} />
          ))}
          <BudgetGauge
            reste={(nolan.salaire ?? 0) - calcBudget(nolan, {}, {}).depN}
            salaire={nolan.salaire ?? 0}
            label="Reste à vivre (hors commun)"
          />
        </div>
      )}

      {/* Lylou tab */}
      {tab === "lylou" && (
        <div className="animate-fade-up">
          {PERSONAL_SECTIONS.map((s) => (
            <Section key={s.category + s.title} section={s} values={lylou} owner="lylou" onUpdate={updateField} />
          ))}
          <BudgetGauge
            reste={(lylou.salaire ?? 0) - calcBudget({}, lylou, {}).depL}
            salaire={lylou.salaire ?? 0}
            label="Reste à vivre (hors commun)"
          />
        </div>
      )}

      {/* Commun tab */}
      {tab === "commun" && (
        <div className="animate-fade-up">
          {COMMUN_SECTIONS.map((s) => (
            <Section key={s.category + s.title} section={s} values={commun} owner="commun" onUpdate={updateField} />
          ))}
          <div
            style={{
              background: "var(--color-module-budget)",
              border: "0.5px solid var(--color-border)",
              borderRadius: "14px",
              padding: "20px 22px",
            }}
          >
            <p style={{ fontSize: "11px", fontFamily: "var(--font-body)", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--color-forest)", marginBottom: "10px" }}>
              Total commun
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 500, color: "var(--color-ink)" }}>
              {fmt(calc.totalCommun)}
            </p>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", marginTop: "4px", fontFamily: "var(--font-body)" }}>
              soit <strong style={{ color: "var(--color-ink-soft)", fontWeight: 500 }}>{fmt(calc.partCommun)}</strong> chacun
            </p>
          </div>
        </div>
      )}

      {/* Synthèse tab */}
      {tab === "synthese" && (
        <div className="space-y-4 animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BudgetGauge reste={calc.resteN} salaire={calc.salaireN} label={`Reste — ${nolanName}`} />
            <BudgetGauge reste={calc.resteL} salaire={calc.salaireL} label={`Reste — ${lylouName}`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nolan */}
            <div style={{ background: "#fff", border: "0.5px solid var(--color-border)", borderRadius: "14px", padding: "20px 22px" }}>
              <h3 style={{ fontSize: "11px", fontFamily: "var(--font-body)", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--color-forest)", marginBottom: "12px" }}>
                {nolanName}
              </h3>
              <SynthRow label="Salaire net" value={calc.salaireN} />
              <SynthRow label="Impôts" value={nolan.impots ?? 0} sub />
              <SynthRow label="Ass. maladie" value={nolan.assuranceMaladie ?? 0} sub />
              <SynthRow label="Voiture" value={(nolan.leasing ?? 0) + (nolan.assuranceVoiture ?? 0) + (nolan.essence ?? 0) + (nolan.entretienVoiture ?? 0)} sub />
              <SynthRow label="Tél. & abos" value={(nolan.telephone ?? 0) + (nolan.abonnementsPerso ?? 0)} sub />
              <SynthRow label="Loisirs & vie" value={(nolan.loisirs ?? 0) + (nolan.vetements ?? 0) + (nolan.divers ?? 0)} sub />
              <SynthRow label="Épargne perso" value={nolan.epargne ?? 0} sub />
              <SynthRow label="Part commun" value={calc.partCommun} sub />
              <SynthRow label="Total dépenses" value={calc.totalN} highlight />
              <SynthRow label="Reste à vivre" value={calc.resteN} highlight />
            </div>

            {/* Lylou */}
            <div style={{ background: "#fff", border: "0.5px solid var(--color-border)", borderRadius: "14px", padding: "20px 22px" }}>
              <h3 style={{ fontSize: "11px", fontFamily: "var(--font-body)", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--color-sage)", marginBottom: "12px" }}>
                {lylouName}
              </h3>
              <SynthRow label="Salaire net" value={calc.salaireL} />
              <SynthRow label="Impôts" value={lylou.impots ?? 0} sub />
              <SynthRow label="Ass. maladie" value={lylou.assuranceMaladie ?? 0} sub />
              <SynthRow label="Voiture" value={(lylou.leasing ?? 0) + (lylou.assuranceVoiture ?? 0) + (lylou.essence ?? 0) + (lylou.entretienVoiture ?? 0)} sub />
              <SynthRow label="Tél. & abos" value={(lylou.telephone ?? 0) + (lylou.abonnementsPerso ?? 0)} sub />
              <SynthRow label="Loisirs & vie" value={(lylou.loisirs ?? 0) + (lylou.vetements ?? 0) + (lylou.divers ?? 0)} sub />
              <SynthRow label="Épargne perso" value={lylou.epargne ?? 0} sub />
              <SynthRow label="Part commun" value={calc.partCommun} sub />
              <SynthRow label="Total dépenses" value={calc.totalL} highlight />
              <SynthRow label="Reste à vivre" value={calc.resteL} highlight />
            </div>
          </div>

          {/* Vue couple */}
          <div style={{ background: "var(--color-module-budget)", border: "0.5px solid var(--color-border)", borderRadius: "14px", padding: "20px 22px" }}>
            <h3 style={{ fontSize: "11px", fontFamily: "var(--font-body)", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--color-forest)", marginBottom: "16px" }}>
              Vue couple
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Revenus combinés", value: calc.salaireN + calc.salaireL },
                { label: "Dépenses totales", value: calc.totalN + calc.totalL },
                { label: "Reste combiné",    value: calc.resteN + calc.resteL },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p style={{ fontSize: "11px", color: "var(--color-muted)", marginBottom: "4px", fontFamily: "var(--font-body)" }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 500, color: "var(--color-ink)" }}>
                    {fmt(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p style={{ fontSize: "12px", textAlign: "center", marginTop: "24px", color: "var(--text-xmuted)", fontFamily: "var(--font-body)" }}>
        Sauvegarde automatique · Données partagées
      </p>
    </div>
  );
}
