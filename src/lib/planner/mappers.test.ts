import { describe, expect, it } from "vitest";

import {
  mapBookRow,
  mapPlannerError,
  mapTimeboxInsert,
  mapTimeboxRow,
  mapWorkoutInsert,
  mapWorkoutRow,
} from "./mappers";

describe("planner mappers", () => {
  it("maps timebox rows between database timestamps and UI date/time fields", () => {
    expect(
      mapTimeboxRow({
        id: "timebox-1",
        user_id: "user-1",
        week_id: "week-1",
        title: "Deep work",
        category: "work",
        starts_at: "2026-06-26T08:30:00.000Z",
        ends_at: "2026-06-26T10:00:00.000Z",
        notes: null,
        status: "planned",
        created_at: "2026-06-26T00:00:00.000Z",
        updated_at: "2026-06-26T00:00:00.000Z",
      }),
    ).toMatchObject({
      id: "timebox-1",
      weekId: "week-1",
      date: "2026-06-26",
      startTime: "08:30",
      endTime: "10:00",
    });

    expect(
      mapTimeboxInsert("user-1", {
        id: "timebox-1",
        weekId: "week-1",
        title: "Deep work",
        date: "2026-06-26",
        startTime: "08:30",
        endTime: "10:00",
        category: "work",
      }),
    ).toMatchObject({
      user_id: "user-1",
      week_id: "week-1",
      starts_at: "2026-06-26T08:30:00.000Z",
      ends_at: "2026-06-26T10:00:00.000Z",
    });
  });

  it("maps workout status names used by the UI to the database status names", () => {
    expect(
      mapWorkoutRow({
        id: "workout-1",
        user_id: "user-1",
        week_id: "week-1",
        type: "run",
        planned_date: "2026-06-26",
        duration_minutes: 45,
        distance_km: 8,
        intensity: "easy",
        status: "done",
        notes: null,
        source: "manual",
        created_at: "2026-06-26T00:00:00.000Z",
        updated_at: "2026-06-26T00:00:00.000Z",
      }).status,
    ).toBe("completed");

    expect(
      mapWorkoutInsert("user-1", {
        id: "workout-1",
        weekId: "week-1",
        type: "run",
        plannedDate: "2026-06-26",
        durationMinutes: 45,
        intensity: "easy",
        status: "completed",
      }),
    ).toMatchObject({ status: "done" });
  });

  it("derives pagesThisWeek from reading logs when available", () => {
    expect(
      mapBookRow(
        {
          id: "book-1",
          user_id: "user-1",
          title: "DDIA",
          author: "Martin Kleppmann",
          total_pages: 616,
          current_page: 124,
          weekly_target_pages: 60,
          status: "reading",
          created_at: "2026-06-26T00:00:00.000Z",
          updated_at: "2026-06-26T00:00:00.000Z",
        },
        [{ pages_read: 20 }, { pages_read: 15 }],
      ).pagesThisWeek,
    ).toBe(35);
  });

  it("normalizes unknown repository errors", () => {
    expect(mapPlannerError({ message: "row-level security violation" }).message).toBe(
      "row-level security violation",
    );
    expect(mapPlannerError("boom").message).toBe("boom");
    expect(mapPlannerError(null).message).toBe(
      "Não foi possível sincronizar os dados do planner.",
    );
  });
});
