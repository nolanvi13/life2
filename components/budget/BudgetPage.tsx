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

type Tab = "nolan" | "lylou" | "commun" | "synthese";

function buildTabs(nolanName: string, lylouName: string) {
  return [
    { id: "nolan" as Tab,    label: nolanName, bg: "var(--pastel-yellow)", accent: "var(--nolan)" },
    { id: "lylou" as Tab,    label: lylouName, bg: "var(--pastel-pink)",   accent: "var(--lylou)" },
    { id: "commun" as Tab,   label: "Commun",  bg: "var(--pastel-green)",  accent: "var(--accent-green)" },
    { id: "synthese" as Tab, label: "Synthèse",bg: "var(--pastel-purple)", accent: "var(--accent-purple)" },
  ];
}

function Section({ section, values, owner, accent, onUpdate }: {
  section: SectionDef;
  values: Record<string, number>;
  owner: BudgetOwner;
  accent: string;
  onUpdate: (owner: BudgetOwner, category: string, key: string, val: number) => void;
}) {
  return (
    <div className="rounded-3xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: accent, fontFamily: "var(--font-display)" }}>
        {section.title}
      </h3>
      {section.fields.map((f) => (
        <BudgetField
          key={f.key}
          label={f.label}
          value={values[f.key] ?? 0}
          accentColor={accent}
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
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span
        className="text-sm"
        style={{
          color: highlight ? "var(--text)" : sub ? "var(--text-xmuted)" : "var(--text-muted)",
          fontWeight: highlight ? 700 : 400,
          paddingLeft: sub ? "12px" : 0,
        }}
      >
        {label}
      </span>
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color: highlight ? "var(--accent-purple)" : "var(--text)", fontFamily: "var(--font-body)" }}
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
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</div>
      </div>
    );
  }

  const TABS = buildTabs(nolanName, lylouName);
  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-32 md:pb-8">

      {/* Header */}
      <h1 className="text-2xl font-bold mb-5" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
        Budget 💰
      </h1>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 p-1 rounded-2xl" style={{ background: "var(--surface-2)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={{
              fontFamily: "var(--font-display)",
              background: tab === t.id ? t.bg : "transparent",
              color: tab === t.id ? t.accent : "var(--text-muted)",
              boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Nolan tab */}
      {tab === "nolan" && (
        <div className="space-y-3 animate-fade-up">
          {PERSONAL_SECTIONS.map((s) => (
            <Section key={s.category + s.title} section={s} values={nolan} owner="nolan" accent="var(--nolan)" onUpdate={updateField} />
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
        <div className="space-y-3 animate-fade-up">
          {PERSONAL_SECTIONS.map((s) => (
            <Section key={s.category + s.title} section={s} values={lylou} owner="lylou" accent="var(--lylou)" onUpdate={updateField} />
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
        <div className="space-y-3 animate-fade-up">
          {COMMUN_SECTIONS.map((s) => (
            <Section key={s.category + s.title} section={s} values={commun} owner="commun" accent="var(--accent-green)" onUpdate={updateField} />
          ))}
          <div className="rounded-3xl p-5" style={{ background: "var(--pastel-green)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--accent-green)" }}>Total commun</p>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
              {fmt(calc.totalCommun)}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              soit <span className="font-bold" style={{ color: "var(--text)" }}>{fmt(calc.partCommun)}</span> chacun
            </p>
          </div>
        </div>
      )}

      {/* Synthèse tab */}
      {tab === "synthese" && (
        <div className="space-y-4 animate-fade-up">
          {/* Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BudgetGauge reste={calc.resteN} salaire={calc.salaireN} label={`Reste — ${nolanName}`} />
            <BudgetGauge reste={calc.resteL} salaire={calc.salaireL} label={`Reste — ${lylouName}`} />
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nolan */}
            <div className="rounded-3xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--nolan)" }}>
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
            <div className="rounded-3xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--lylou)" }}>
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

          {/* Stats couple */}
          <div className="rounded-3xl p-5" style={{ background: "var(--pastel-purple)", border: "1px solid var(--border)" }}>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: "var(--accent-purple)" }}>
              Vue couple
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Revenus combinés", value: calc.salaireN + calc.salaireL },
                { label: "Dépenses totales", value: calc.totalN + calc.totalL },
                { label: "Reste combiné", value: calc.resteN + calc.resteL },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <p className="text-base font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
                    {fmt(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-center mt-6" style={{ color: "var(--text-xmuted)" }}>
        Sauvegarde automatique · Données partagées avec ton couple
      </p>
    </div>
  );
}
