"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";
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
  return null; // /settings and any other non-tab page
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = pathnameToTab(pathname);

  // Initialize with the first tab the user lands on
  const [mountedTabs, setMountedTabs] = useState<Set<Tab>>(() => {
    const t = pathnameToTab(pathname);
    return t ? new Set([t]) : new Set();
  });

  // useLayoutEffect: fires synchronously before paint → no blank flash on tab switch
  useLayoutEffect(() => {
    if (activeTab && !mountedTabs.has(activeTab)) {
      setMountedTabs((prev) => new Set([...prev, activeTab]));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Non-tab route (settings, etc.) — render page content normally
  if (activeTab === null) {
    return <>{children}</>;
  }

  return (
    <>
      {TABS.map((tab) => {
        // Only render once the tab has been visited
        if (!mountedTabs.has(tab)) return null;
        return (
          <div key={tab} style={{ display: tab === activeTab ? "block" : "none" }}>
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
