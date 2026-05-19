"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { BudgetPage } from "@/components/budget/BudgetPage";
import { CoursesPage } from "@/components/courses/CoursesPage";
import { RecettesPage } from "@/components/recettes/RecettesPage";
import { CalendrierPage } from "@/components/calendrier/CalendrierPage";

type Tab = "dashboard" | "budget" | "courses" | "recettes" | "calendrier";
const TABS: Tab[] = ["dashboard", "budget", "courses", "recettes", "calendrier"];

function pathnameToTab(pathname: string): Tab | null {
  if (pathname === "/" || pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/budget"))     return "budget";
  if (pathname.startsWith("/courses"))    return "courses";
  if (pathname.startsWith("/recettes"))   return "recettes";
  if (pathname.startsWith("/calendrier")) return "calendrier";
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = pathnameToTab(pathname);

  // Track which tabs have been visited so they stay mounted (keep state/data).
  // Initialize with current tab so first render is instant.
  const [mountedTabs, setMountedTabs] = useState<Set<Tab>>(() => {
    const t = pathnameToTab(pathname);
    return t ? new Set([t]) : new Set();
  });

  // After mount, keep track of every visited tab
  useEffect(() => {
    if (activeTab && !mountedTabs.has(activeTab)) {
      setMountedTabs((prev) => new Set([...prev, activeTab]));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Non-tab route (settings, etc.) — render via normal routing
  if (activeTab === null) {
    return <>{children}</>;
  }

  return (
    <>
      {TABS.map((tab) => {
        // Render if: currently active (always show) OR previously visited (keep mounted)
        const isActive = tab === activeTab;
        if (!isActive && !mountedTabs.has(tab)) return null;
        return (
          <div key={tab} style={{ display: isActive ? "block" : "none" }}>
            {tab === "dashboard"  && <DashboardPage />}
            {tab === "budget"     && <BudgetPage />}
            {tab === "courses"    && <CoursesPage />}
            {tab === "recettes"   && <RecettesPage />}
            {tab === "calendrier" && <CalendrierPage />}
          </div>
        );
      })}
    </>
  );
}
