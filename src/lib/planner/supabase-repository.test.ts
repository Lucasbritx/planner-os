import { describe, expect, it } from "vitest";

import { createSupabasePlannerRepository } from "./supabase-repository";

describe("createSupabasePlannerRepository", () => {
  it("uses the authenticated user id when creating rows", async () => {
    const inserts: unknown[] = [];
    const fakeClient = {
      auth: {
        getUser: async () => ({
          data: { user: { id: "authenticated-user" } },
          error: null,
        }),
      },
      from: (table: string) => ({
        insert: (payload: unknown) => {
          inserts.push({ table, payload });
          return {
            select: () => ({
              single: async () => ({
                data: {
                  id: "goal-1",
                  user_id: "authenticated-user",
                  week_id: "week-1",
                  title: "Ship Supabase",
                  category: "work",
                  status: "todo",
                  priority: "high",
                  created_at: "2026-06-26T00:00:00.000Z",
                  updated_at: "2026-06-26T00:00:00.000Z",
                },
                error: null,
              }),
            }),
          };
        },
      }),
    };

    const repository = createSupabasePlannerRepository(
      fakeClient as never,
    );

    await repository.create("goals", {
      id: "goal-1",
      weekId: "week-1",
      title: "Ship Supabase",
      category: "work",
      status: "todo",
      priority: "high",
    });

    expect(inserts).toEqual([
      {
        table: "weekly_goals",
        payload: expect.objectContaining({
          user_id: "authenticated-user",
          title: "Ship Supabase",
        }),
      },
    ]);
  });
});
