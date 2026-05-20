"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { useDashboardData } from "@/hooks/useDashboardData";
import { fmt } from "@/lib/budget";
import { fmtCHF } from "@/lib/depenses";
import {
  IconWallet, IconChefHat, IconShoppingCart, IconCalendar,
  IconSettings, IconReceipt, IconNotes, IconChevronRight,
} from "@tabler/icons-react";

const MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MOIS_SHORT = ["jan","fév","mar","avr","mai","juin","juil","aoû","sep","oct","nov","déc"];
const JOURS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];

function todayLabel() {
  const d = new Date();
  return `${JOURS[d.getDay()].charAt(0).toUpperCase() + JOURS[d.getDay()].slice(1)} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

function NavRow({
  href, icon: Icon, label, sub, accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "15px 0",
        textDecoration: "none",
        borderBottom: "0.5px solid var(--color-border)",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} stroke={1.75} style={{ color: "var(--color-forest)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "17px",
          fontWeight: 500,
          color: "var(--color-ink)",
          letterSpacing: "-0.3px",
          display: "block",
        }}>
          {label}
        </span>
        {sub && (
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: accent ? accent : "var(--color-muted)",
            display: "block",
            marginTop: "1px",
          }}>
            {sub}
          </span>
        )}
      </div>
      <IconChevronRight size={16} stroke={1.75} style={{ color: "var(--color-muted)", flexShrink: 0 }} />
    </Link>
  );
}

export function DashboardPage() {
  const { myName, partnerName, coupleId, myOwner, nolanName, lylouName } = useApp();
  const { budget, depensesSummary, nextEvent, loading } = useDashboardData(coupleId, myOwner);
  const partnerOwner = myOwner === "nolan" ? "lylou" : "nolan";
  const partnerDisplayName = partnerOwner === "nolan" ? nolanName : lylouName;

  const firstName = myName ?? "toi";
  const totalCommun = budget?.totalCommun ?? 0;

  // Balance label
  const balance = depensesSummary?.balance ?? 0;
  const balanceLabel = (() => {
    if (!depensesSummary || depensesSummary.totalAll === 0) return null;
    if (Math.abs(balance) < 0.01) return "✓ Tout est réglé";
    const name = partnerDisplayName || partnerName;
    if (balance > 0) return `Tu dois ${fmtCHF(balance)} à ${name}`;
    return `${name} te doit ${fmtCHF(Math.abs(balance))}`;
  })();

  const depensesSub = loading
    ? "…"
    : depensesSummary && depensesSummary.totalAll > 0
    ? `${fmtCHF(depensesSummary.totalAll)} ce mois${balanceLabel ? " · " + balanceLabel : ""}`
    : "Aucune dépense ce mois";

  const depensesAccent = !loading && balance > 0.01 ? "#DC2626" : undefined;

  return (
    <div className="max-w-lg mx-auto px-6 pt-9 pb-32 md:pb-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "var(--color-muted)",
          letterSpacing: "0.2px",
        }}>
          {todayLabel()}
        </p>
        <Link
          href="/settings"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "var(--surface-2)",
            color: "var(--color-muted)",
          }}
        >
          <IconSettings size={16} stroke={1.75} />
        </Link>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "42px",
          fontWeight: 500,
          color: "var(--color-ink)",
          letterSpacing: "-1.2px",
          lineHeight: 1.05,
          marginTop: "4px",
        }}>
          Bonjour,{" "}
          <em style={{ fontStyle: "italic", color: "var(--color-forest)" }}>{firstName}</em>
        </h1>
        {partnerName && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--color-muted)",
            marginTop: "5px",
          }}>
            avec <span style={{ color: "var(--color-ink-soft)", fontWeight: 500 }}>{partnerName}</span>
          </p>
        )}
      </div>

      {/* Prochain événement — if any */}
      {!loading && nextEvent && (
        <Link
          href="/calendrier"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "var(--surface-2)",
            marginBottom: "28px",
            textDecoration: "none",
            border: "0.5px solid var(--color-border)",
          }}
        >
          <div style={{
            width: "44px",
            textAlign: "center",
            flexShrink: 0,
          }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              fontWeight: 500,
              color: "var(--color-ink)",
              lineHeight: 1,
            }}>
              {new Date(nextEvent.date + "T12:00:00").getDate()}
            </div>
            <div style={{
              fontSize: "10px",
              fontFamily: "var(--font-body)",
              color: "var(--color-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginTop: "2px",
            }}>
              {MOIS_SHORT[new Date(nextEvent.date + "T12:00:00").getMonth()]}
            </div>
          </div>
          <div style={{ width: "1px", height: "36px", background: "var(--color-border)", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--color-ink)",
              letterSpacing: "-0.2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {nextEvent.title}
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--color-muted)",
              marginTop: "2px",
            }}>
              {nextEvent.categorie}
            </p>
          </div>
          <IconChevronRight size={15} stroke={1.75} style={{ color: "var(--color-muted)", flexShrink: 0 }} />
        </Link>
      )}

      {/* Section label */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--color-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        marginBottom: "4px",
      }}>
        Sections
      </p>

      {/* Nav list */}
      <div>
        <NavRow
          href="/depenses"
          icon={IconReceipt}
          label="Dépenses"
          sub={depensesSub}
          accent={depensesAccent}
        />
        <NavRow
          href="/budget"
          icon={IconWallet}
          label="Budget"
          sub={loading ? "…" : totalCommun > 0 ? `Commun · ${fmt(totalCommun)}` : "Planification mensuelle"}
        />
        <NavRow
          href="/courses"
          icon={IconShoppingCart}
          label="Courses"
          sub="Liste partagée"
        />
        <NavRow
          href="/recettes"
          icon={IconChefHat}
          label="Recettes"
          sub="Idées repas"
        />
        <NavRow
          href="/calendrier"
          icon={IconCalendar}
          label="Calendrier"
          sub="Événements à deux"
        />
        <NavRow
          href="/notes"
          icon={IconNotes}
          label="Notes"
          sub="Notes partagées"
        />
      </div>
    </div>
  );
}
