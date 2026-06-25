import type { Workout } from "./types";
export function workoutSuggestions(items: Workout[]) {
  const done = items.filter(i => i.status === "completed");
  const hard = done.filter(i => i.intensity === "hard").length;
  const strength = items.filter(i => i.type === "strength" && i.status !== "cancelled").length;
  const mobility = items.filter(i => i.type === "mobility" && i.status !== "cancelled").length;
  const result: string[] = [];
  if (hard >= 2) result.push("Considere recuperação ou mobilidade após uma sequência intensa.");
  if (strength === 0) result.push("Inclua uma sessão de força para equilibrar a semana.");
  if (mobility === 0) result.push("Uma sessão curta de mobilidade pode complementar seus treinos.");
  if (items.length < 2) result.push("Planeje pelo menos duas sessões leves para criar consistência.");
  return result.length ? result : ["Sua semana está equilibrada. Ajuste a carga conforme sua recuperação."];
}
