"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { initialData } from "@/data/mock-data";
import type { PlannerData, Preferences } from "@/lib/types";

type Collection = Exclude<keyof PlannerData, "preferences">;
type Store = {
  data: PlannerData;
  isSaving: boolean;
  error: string | null;
  add: (collection: Collection, item: Record<string, unknown>) => void;
  update: (collection: Collection, id: string, patch: Record<string, unknown>) => void;
  remove: (collection: Collection, id: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
};
const Context = createContext<Store | null>(null);

async function persist(path: string, init: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Não foi possível salvar no Supabase.");
  }
}

export function PlannerProvider({ children, initialSnapshot = initialData }: { children: React.ReactNode; initialSnapshot?: PlannerData }) {
  const [data, setData] = useState<PlannerData>(() => structuredClone(initialSnapshot));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runMutation = (mutation: () => void, request: () => Promise<void>) => {
    mutation();
    setIsSaving(true);
    setError(null);
    void request()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Não foi possível salvar no Supabase."))
      .finally(() => setIsSaving(false));
  };
  const value = useMemo<Store>(() => ({
    data,
    isSaving,
    error,
    add: (collection, item) => runMutation(
      () => setData(d => ({...d, [collection]: [...(d[collection] as unknown[]), item]})),
      () => persist(`/api/planner/${collection}`, { method: "POST", body: JSON.stringify(item) }),
    ),
    update: (collection, id, patch) => runMutation(
      () => setData(d => ({...d, [collection]: (d[collection] as Array<{id:string}>).map(item => item.id === id ? {...item,...patch} : item)})),
      () => persist(`/api/planner/${collection}/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    ),
    remove: (collection, id) => runMutation(
      () => setData(d => ({...d, [collection]: (d[collection] as Array<{id:string}>).filter(item => item.id !== id)})),
      () => persist(`/api/planner/${collection}/${id}`, { method: "DELETE" }),
    ),
    updatePreferences: patch => runMutation(
      () => setData(d => ({...d, preferences:{...d.preferences,...patch}})),
      () => persist("/api/planner/preferences", { method: "PATCH", body: JSON.stringify(patch) }),
    )
  }), [data, error, isSaving]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePlanner() {
  const value = useContext(Context);
  if (!value) throw new Error("usePlanner must be used inside PlannerProvider");
  return value;
}
