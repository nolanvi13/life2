"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { BudgetPage } from "@/components/budget/BudgetPage";
import { CoursesPage } from "@/components/courses/CoursesPage";
import { RecettesPage } from "@/components/recettes/RecettesPage";
import { CalendrierPage } from "@/components/calendrier/CalendrierPage";

type Tab = "dashboard" | "budget" | "courses" | "recettes" | "calendrier";
const TABS: Tab[] = ["dashboard", "budget", "courses", "recettes", "calendrier"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment() as string | null;
  const activeTab = (TABS.includes(segment as Tab) ? segment : "dashboard") as Tab;
  const [everMounted, setEverMounted] = useState<Set<Tab>>(new Set([activeTab]));

  useEffect(() => {
    setEverMounted((prev) => new Set([...prev, activeTab]));
  }, [activeTab]);

  const isTab = TABS.includes(segment as Tab) || segment === null;

  return (
    <>
      {TABS.map((tab) => {
        const active = tab === activeTab;
        if (!everMounted.has(tab)) return null;
        return (
          <div key={tab} style={{ display: active ? "block" : "none" }}>
            {tab === "dashboard"  && <DashboardPage />}
            {tab === "budget"     && <BudgetPage />}
            {tab === "courses"    && <CoursesPage />}
            {tab === "recettes"   && <RecettesPage />}
            {tab === "calendrier" && <CalendrierPage />}
          </div>
        );
      })}
      {!isTab && children}
    </>
  );
}
