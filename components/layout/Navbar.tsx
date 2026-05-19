"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/budget",     label: "Budget",     icon: "💰", bg: "var(--pastel-purple)", accent: "var(--accent-purple)" },
  { href: "/recettes",   label: "Recettes",   icon: "🍳", bg: "var(--pastel-green)",  accent: "var(--accent-green)"  },
  { href: "/courses",    label: "Courses",    icon: "🛒", bg: "var(--pastel-blue)",   accent: "var(--accent-blue)"   },
  { href: "/calendrier", label: "Calendrier", icon: "📅", bg: "var(--pastel-peach)",  accent: "var(--accent-peach)"  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center gap-1 px-2"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        paddingTop: "8px",
        height: "calc(64px + max(env(safe-area-inset-bottom), 8px))",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-center gap-1.5 rounded-2xl transition-all duration-200 overflow-hidden"
            style={{
              flex: active ? "2 1 0" : "1 1 0",
              height: "44px",
              background: active ? item.bg : "transparent",
              minWidth: 0,
            }}
          >
            <span className="text-lg leading-none flex-shrink-0">{item.icon}</span>
            <span
              className="font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-200"
              style={{
                fontFamily: "var(--font-display)",
                color: item.accent,
                maxWidth: active ? "80px" : "0px",
                opacity: active ? 1 : 0,
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const active = NAV_ITEMS.find((i) => pathname.startsWith(i.href));

  return (
    <aside
      className="hidden md:flex flex-col w-56 shrink-0 min-h-screen sticky top-0"
      style={{
        background: "var(--surface-2)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ background: "var(--pastel-purple)" }}
          >
            🏠
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            Life2
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-2.5 flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200"
              style={{
                background: isActive ? item.bg : "transparent",
                color: isActive ? item.accent : "var(--text-muted)",
              }}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 pb-5 space-y-0.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200"
          style={{
            background: pathname === "/dashboard" ? "var(--pastel-purple)" : "transparent",
            color: pathname === "/dashboard" ? "var(--accent-purple)" : "var(--text-muted)",
          }}
        >
          <span className="text-base leading-none">🏡</span>
          <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Accueil</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200"
          style={{
            background: pathname === "/settings" ? "var(--pastel-blue)" : "transparent",
            color: pathname === "/settings" ? "var(--accent-blue)" : "var(--text-muted)",
          }}
        >
          <span className="text-base leading-none">⚙️</span>
          <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Réglages</span>
        </Link>
      </div>
    </aside>
  );
}
