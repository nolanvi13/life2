"use client";

import { createContext, useContext } from "react";

export type AppContextValue = {
  coupleId: string;
  userId: string;
  myName: string | null;
  partnerName: string | null;
  myOwner: "nolan" | "lylou";
  nolanName: string;
  lylouName: string;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  value,
  children,
}: {
  value: AppContextValue;
  children: React.ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
