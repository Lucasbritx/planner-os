"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { initialData } from "@/data/mock-data";
import type { PlannerData, Preferences } from "@/lib/types";

type Collection = Exclude<keyof PlannerData, "preferences">;
type Store = {
  data: PlannerData;
  add: (collection: Collection, item: Record<string, unknown>) => void;
  update: (collection: Collection, id: string, patch: Record<string, unknown>) => void;
  remove: (collection: Collection, id: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
};
const Context = createContext<Store | null>(null);
export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PlannerData>(() => structuredClone(initialData));
  const value = useMemo<Store>(() => ({
    data,
    add: (collection, item) => setData(d => ({...d, [collection]: [...(d[collection] as unknown[]), item]})),
    update: (collection, id, patch) => setData(d => ({...d, [collection]: (d[collection] as Array<{id:string}>).map(item => item.id === id ? {...item,...patch} : item)})),
    remove: (collection, id) => setData(d => ({...d, [collection]: (d[collection] as Array<{id:string}>).filter(item => item.id !== id)})),
    updatePreferences: patch => setData(d => ({...d, preferences:{...d.preferences,...patch}}))
  }), [data]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePlanner() {
  const value = useContext(Context);
  if (!value) throw new Error("usePlanner must be used inside PlannerProvider");
  return value;
}
