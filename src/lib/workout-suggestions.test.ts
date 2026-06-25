import { describe, expect, it } from "vitest";
import { workoutSuggestions } from "./workout-suggestions";
import type { Workout } from "./types";
describe("workoutSuggestions", () => {
  it("sugere mobilidade quando ela está ausente", () => {
    const items: Workout[] = [{id:"1",weekId:"w",type:"strength",plannedDate:"2026-06-24",durationMinutes:40,intensity:"hard",status:"completed"}];
    expect(workoutSuggestions(items).join(" ")).toMatch(/mobilidade/i);
  });
});
