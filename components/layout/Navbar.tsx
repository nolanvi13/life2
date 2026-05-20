"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome2, IconWallet, IconChefHat, IconShoppingCart,
  IconCalendar, IconSettings, IconReceipt, IconMenu2, IconX, IconNotes,
} from "@tabler/icons-react";
import { useApp } from "@/components/providers/AppProvider";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Accueil",    Icon: IconHome2,       emoji: "🏠" },
  { href: "/budget",     label: "Budget",     Icon: IconWallet,      emoji: "💰" },
  { href: "/depenses",   label: "Dépenses",   Icon: IconReceipt,     emoji: "💸" },
  { href: "/recettes",   label: "Recettes",   Icon: IconChefHat,     emoji: "🍽️" },
  { href: "/courses",    label: "Courses",    Icon: IconShoppingCart, emoji: "🛒" },
  { href: "/calendrier", label: "Calendrier", Icon: IconCalendar,    emoji: "📅" },
  { href: "/notes",      label: "Notes",      Icon: IconNotes,       emoji: "📓" },
  { href: "/settings",   label: "Réglages",   Icon: IconSettings,    emoji: "⚙️" },
];

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname.startsWith(href);
}

function currentLabel(pathname: string) {
  return NAV_ITEMS.find((i) => isActive(i.href, pathname))?.label ?? "Menu";
}

/** Full-screen slide-up menu for mobile */
export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Persistent bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-between px-5"
        style={{
          background: "var(--color-forest)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "max(env(safe-area-inset-bottom), 10px)",
          paddingTop: "10px",
          height: "calc(58px + max(env(safe-area-inset-bottom), 10px))",
        }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "var(--color-butter)",
              color: "var(--color-forest)",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            L
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 500, color: "#fff", letterSpacing: "-0.3px" }}>
            Life2
          </span>
        </Link>

        {/* Current page label */}
        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
          {currentLabel(pathname)}
        </span>

        {/* Hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: open ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          {open
            ? <IconX size={18} stroke={2} style={{ color: "#fff" }} />
            : <IconMenu2 size={18} stroke={1.75} style={{ color: "#fff" }} />
          }
        </button>
      </nav>

      {/* Full-screen overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[49] md:hidden flex flex-col"
          style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => setOpen(false)}
          />

          {/* Menu panel — slides up from bottom */}
          <div
            className="relative mt-auto mx-3 rounded-3xl overflow-hidden animate-fade-up"
            style={{
              background: "var(--bg)",
              marginBottom: "calc(58px + max(env(safe-area-inset-bottom), 10px) + 8px)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* Nav items */}
            <div className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-4 rounded-2xl transition-all duration-150"
                    style={{
                      padding: "14px 16px",
                      background: active ? "var(--color-forest)" : "transparent",
                      textDecoration: "none",
                    }}
                    onClick={() => setOpen(false)}
                  >
                    <item.Icon
                      size={20}
                      stroke={1.75}
                      style={{ color: active ? "#fff" : "var(--color-muted)", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "18px",
                        fontWeight: 500,
                        color: active ? "#fff" : "var(--color-ink)",
                        letterSpacing: "-0.3px",
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-butter)" }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Desktop sidebar — unchanged */
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
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 transition-all duration-150 ${active ? "nav-active-bar" : ""}`}
              style={{
                padding: "10px 20px",
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              <item.Icon size={17} stroke={1.75} style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13.5px",
                  fontWeight: active ? 500 : 400,
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

// Keep BottomNav as alias → MobileMenu to avoid breaking imports
export { MobileMenu as BottomNav };
