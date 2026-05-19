"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome2, IconWallet, IconChefHat, IconShoppingCart,
  IconCalendar, IconSettings,
} from "@tabler/icons-react";
import { useApp } from "@/components/providers/AppProvider";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Accueil",    Icon: IconHome2 },
  { href: "/budget",     label: "Budget",     Icon: IconWallet },
  { href: "/recettes",   label: "Recettes",   Icon: IconChefHat },
  { href: "/courses",    label: "Courses",    Icon: IconShoppingCart },
  { href: "/calendrier", label: "Calendrier", Icon: IconCalendar },
  { href: "/settings",   label: "Réglages",   Icon: IconSettings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center gap-1 px-2"
      style={{
        background: "var(--color-forest)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "max(env(safe-area-inset-bottom), 10px)",
        paddingTop: "8px",
        height: "calc(60px + max(env(safe-area-inset-bottom), 10px))",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200"
            style={{
              flex: "1 1 0",
              height: "44px",
              background: active ? "rgba(255,255,255,0.10)" : "transparent",
            }}
          >
            <item.Icon
              size={20}
              stroke={1.5}
              style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}
            />
            <span
              style={{
                fontSize: "9px",
                fontFamily: "var(--font-body)",
                color: active ? "var(--color-butter)" : "rgba(255,255,255,0.35)",
                fontWeight: active ? 500 : 400,
                letterSpacing: "0.2px",
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
  const { myName, partnerName } = useApp();

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 min-h-screen sticky top-0"
      style={{
        background: "var(--color-forest)",
        width: "200px",
        paddingTop: "24px",
        paddingBottom: "0",
      }}
    >
      {/* Logo */}
      <div className="px-5 pb-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{
              background: "var(--color-butter)",
              color: "var(--color-forest)",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            L
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "18px",
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            Life2
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-0">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard" || pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 transition-all duration-150 ${isActive ? "nav-active-bar" : ""}`}
              style={{
                padding: "10px 20px",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              <item.Icon size={17} stroke={1.75} style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13.5px",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Partner chip */}
      {(myName || partnerName) && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "16px 20px 20px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "rgba(232,200,74,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--color-butter)",
                flexShrink: 0,
              }}
            >
              {(partnerName ?? myName ?? "?")[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-body)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {partnerName ?? myName}
              </p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                {myName && partnerName ? "Partenaire" : "Moi"}
              </p>
            </div>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#5CBA7D",
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
