"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";

const MODULES = [
  {
    href: "/budget",
    icon: "💰",
    label: "Budget",
    bg: "var(--pastel-purple)",
    accent: "var(--accent-purple)",
    span: "full",
    delay: "animate-fade-up-1",
  },
  {
    href: "/recettes",
    icon: "🍳",
    label: "Recettes",
    bg: "var(--pastel-green)",
    accent: "var(--accent-green)",
    span: "half",
    delay: "animate-fade-up-2",
  },
  {
    href: "/courses",
    icon: "🛒",
    label: "Courses",
    bg: "var(--pastel-blue)",
    accent: "var(--accent-blue)",
    span: "half",
    delay: "animate-fade-up-3",
  },
  {
    href: "/calendrier",
    icon: "📅",
    label: "Calendrier",
    bg: "var(--pastel-peach)",
    accent: "var(--accent-peach)",
    span: "full",
    delay: "animate-fade-up-4",
  },
] as const;

export function DashboardPage() {
  const { myName, partnerName } = useApp();

  const firstName = myName ?? "toi";

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-32 md:pb-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <h1
            className="text-4xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            Bonjour,<br />{firstName} 👋
          </h1>
          {partnerName && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>avec</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                  style={{ background: "var(--lylou)", color: "#8B1A4A" }}
                >
                  {partnerName[0].toUpperCase()}
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
                  {partnerName}
                </span>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/settings"
          className="flex items-center justify-center w-10 h-10 rounded-2xl transition-all hover:scale-105"
          style={{ background: "var(--surface-2)" }}
        >
          <span className="text-lg">⚙️</span>
        </Link>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`rounded-3xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] animate-fade-up ${mod.delay} ${mod.span === "full" ? "col-span-2" : "col-span-1"}`}
            style={{
              background: mod.bg,
              padding: mod.span === "full" ? "24px 24px 22px" : "20px 18px 18px",
              minHeight: mod.span === "full" ? "130px" : "110px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span className={mod.span === "full" ? "text-3xl" : "text-2xl"}>
              {mod.icon}
            </span>
            <span
              className={`font-bold leading-none ${mod.span === "full" ? "text-xl" : "text-base"}`}
              style={{ fontFamily: "var(--font-display)", color: mod.accent }}
            >
              {mod.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
