"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { useBudget } from "@/hooks/useBudget";
import { useCalendrier } from "@/hooks/useCalendrier";
import { calcBudget, fmt } from "@/lib/budget";
import { IconWallet, IconChefHat, IconShoppingCart, IconCalendar, IconSettings } from "@tabler/icons-react";

const MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const JOURS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];

function todayLabel() {
  const d = new Date();
  return `${JOURS[d.getDay()].charAt(0).toUpperCase() + JOURS[d.getDay()].slice(1)}, ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

export function DashboardPage() {
  const { myName, partnerName, coupleId } = useApp();
  const { nolan, lylou, commun, loading: budgetLoading } = useBudget(coupleId);
  const { evenements, loading: eventsLoading } = useCalendrier(coupleId);

  const firstName = myName ?? "toi";

  // Budget card data
  const calc = calcBudget(nolan, lylou, commun);
  const totalDepenses = calc.totalN + calc.totalL;
  const totalRevenus = calc.salaireN + calc.salaireL;
  const pctDepense = totalRevenus > 0 ? Math.min(100, Math.round((totalDepenses / totalRevenus) * 100)) : 0;
  const totalCommun = calc.totalCommun;

  // Next event
  const today = new Date().toISOString().split("T")[0];
  const nextEvent = evenements
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  function formatEventDate(ymd: string) {
    const d = new Date(ymd + "T12:00:00");
    return `${d.getDate()} ${MOIS[d.getMonth()].slice(0, 3).toUpperCase()}`;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-10 pb-32 md:pb-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-10 animate-fade-up">
        <div>
          <p style={{ fontSize: "13px", color: "var(--color-muted)", letterSpacing: "0.3px", marginBottom: "4px", fontFamily: "var(--font-body)" }}>
            {todayLabel()}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "38px",
              fontWeight: 500,
              color: "var(--color-ink)",
              letterSpacing: "-1px",
              lineHeight: 1.05,
            }}
          >
            Bonjour,{" "}
            <em style={{ fontStyle: "italic", color: "var(--color-forest)" }}>{firstName}</em>
          </h1>
          {partnerName && (
            <p style={{ fontSize: "13px", color: "var(--color-muted)", marginTop: "6px", fontFamily: "var(--font-body)" }}>
              avec{" "}
              <span style={{ color: "var(--color-ink-soft)", fontWeight: 500 }}>{partnerName}</span>
            </p>
          )}
        </div>
        <Link
          href="/settings"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
          style={{ background: "var(--surface-2)", color: "var(--color-muted)" }}
        >
          <IconSettings size={18} stroke={1.75} />
        </Link>
      </div>

      {/* Module grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

        {/* Budget — pleine largeur */}
        <Link
          href="/budget"
          className="animate-fade-up animate-fade-up-1"
          style={{
            gridColumn: "span 2",
            background: "var(--color-module-budget)",
            borderRadius: "16px",
            padding: "22px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textDecoration: "none",
            transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <IconWallet size={22} stroke={1.5} style={{ color: "var(--color-forest)" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.4px" }}>
              Budget
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
              {budgetLoading ? "…" : `Commun · ${fmt(totalCommun)}`}
            </span>
          </div>
          {!budgetLoading && totalRevenus > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-muted)", marginBottom: "6px", fontFamily: "var(--font-body)" }}>
                  <span>Dépensé</span>
                  <span>{pctDepense}%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(44,74,53,0.12)", borderRadius: "3px", width: "110px" }}>
                  <div style={{ width: `${pctDepense}%`, height: "100%", background: "var(--color-forest)", borderRadius: "3px", transition: "width 0.5s" }} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 500, color: "var(--color-forest)" }}>
                  {fmt(totalDepenses)}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>CHF ce mois</div>
              </div>
            </div>
          )}
        </Link>

        {/* Recettes */}
        <Link
          href="/recettes"
          className="animate-fade-up animate-fade-up-2"
          style={{
            background: "var(--color-module-recettes)",
            borderRadius: "16px",
            padding: "20px 18px",
            minHeight: "110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            textDecoration: "none",
            transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
        >
          <IconChefHat size={20} stroke={1.5} style={{ color: "var(--color-forest)" }} />
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.4px", display: "block" }}>
              Recettes
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
              Idées repas
            </span>
          </div>
        </Link>

        {/* Courses */}
        <Link
          href="/courses"
          className="animate-fade-up animate-fade-up-3"
          style={{
            background: "var(--color-module-courses)",
            borderRadius: "16px",
            padding: "20px 18px",
            minHeight: "110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            textDecoration: "none",
            transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
        >
          <IconShoppingCart size={20} stroke={1.5} style={{ color: "#3D6B88" }} />
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.4px", display: "block" }}>
              Courses
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
              Liste partagée
            </span>
          </div>
        </Link>

        {/* Calendrier — pleine largeur */}
        <Link
          href="/calendrier"
          className="animate-fade-up animate-fade-up-4"
          style={{
            gridColumn: "span 2",
            background: "var(--color-module-calendar)",
            borderRadius: "16px",
            padding: "22px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textDecoration: "none",
            transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <IconCalendar size={22} stroke={1.5} style={{ color: "#7A60A0" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.4px" }}>
              Calendrier
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
              Événements à deux
            </span>
          </div>

          {!eventsLoading && nextEvent && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(255,255,255,0.55)", borderRadius: "10px", padding: "10px 14px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 500, color: "var(--color-ink)", lineHeight: 1 }}>
                  {new Date(nextEvent.date + "T12:00:00").getDate()}
                </div>
                <div style={{ fontSize: "10px", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "var(--font-body)" }}>
                  {MOIS[new Date(nextEvent.date + "T12:00:00").getMonth()].slice(0, 3).toUpperCase()}
                </div>
              </div>
              <div style={{ width: "1px", height: "32px", background: "var(--color-border)" }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-ink)", fontFamily: "var(--font-body)" }}>
                  {nextEvent.title}
                </div>
                {nextEvent.end_date && (
                  <div style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "2px", fontFamily: "var(--font-body)" }}>
                    {formatEventDate(nextEvent.date)} → {formatEventDate(nextEvent.end_date)}
                  </div>
                )}
                <span style={{
                  background: "var(--color-forest)",
                  color: "#fff",
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  display: "inline-block",
                  marginTop: "5px",
                  fontFamily: "var(--font-body)",
                }}>
                  {nextEvent.categorie}
                </span>
              </div>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
