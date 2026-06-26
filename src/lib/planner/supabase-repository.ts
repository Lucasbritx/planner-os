import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Book,
  PlannerData,
  Preferences,
  StudyItem,
  Timebox,
  Week,
  WeeklyGoal,
  WeeklyReview,
  Workout,
  POC,
} from "@/lib/types";
import type { Database, Insert, Row, TableName, Update } from "@/lib/supabase/database.types";

import {
  collectionTableMap,
  mapBookInsert,
  mapBookRow,
  mapPlannerError,
  mapPocInsert,
  mapPocRow,
  mapPreferencesUpdate,
  mapProfileRow,
  mapStudyItemInsert,
  mapStudyItemRow,
  mapTimeboxInsert,
  mapTimeboxRow,
  mapWeekInsert,
  mapWeekRow,
  mapWeeklyGoalInsert,
  mapWeeklyGoalRow,
  mapWeeklyReviewInsert,
  mapWeeklyReviewRow,
  mapWorkoutInsert,
  mapWorkoutRow,
  type PlannerCollection,
} from "./mappers";

type PlannerClient = SupabaseClient<Database, "public">;
type DynamicTableQuery = {
  select(columns?: string): unknown;
  insert(payload: unknown): unknown;
  update(payload: unknown): unknown;
  delete(): unknown;
  upsert(payload: unknown, options?: unknown): unknown;
};
type PlannerItem = Week | WeeklyGoal | Timebox | StudyItem | Book | POC | Workout | WeeklyReview;
type PlannerCreateInput<C extends PlannerCollection> = C extends "weeks"
  ? Omit<Week, "id"> & { id?: string }
  : C extends "goals"
    ? Omit<WeeklyGoal, "id"> & { id?: string }
    : C extends "timeboxes"
      ? Omit<Timebox, "id"> & { id?: string }
      : C extends "studies"
        ? Omit<StudyItem, "id"> & { id?: string }
        : C extends "books"
          ? Omit<Book, "id" | "pagesThisWeek"> & { id?: string }
          : C extends "pocs"
            ? Omit<POC, "id"> & { id?: string }
            : C extends "workouts"
              ? Omit<Workout, "id"> & { id?: string }
              : Omit<WeeklyReview, "id"> & { id?: string };

const DEFAULT_PREFERENCES: Preferences = {
  locale: "pt-BR",
  timezone: "America/Sao_Paulo",
  weekStartsOn: 0,
};

function todayInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function getSundayWeekRange(date = todayInSaoPaulo()) {
  const value = new Date(`${date}T00:00:00.000Z`);
  const start = addDays(date, -value.getUTCDay());

  return {
    startDate: start,
    endDate: addDays(start, 6),
  };
}

function assertNever(value: never): never {
  throw new Error(`Unsupported collection: ${String(value)}`);
}

function fromDynamic(client: PlannerClient, table: string): DynamicTableQuery {
  return client.from(table as TableName) as unknown as DynamicTableQuery;
}

function mapCreateInput<C extends PlannerCollection>(
  collection: C,
  userId: string,
  item: PlannerCreateInput<C>,
): Insert<(typeof collectionTableMap)[C]> {
  switch (collection) {
    case "weeks":
      return mapWeekInsert(userId, item as PlannerCreateInput<"weeks">) as Insert<(typeof collectionTableMap)[C]>;
    case "goals":
      return mapWeeklyGoalInsert(userId, item as PlannerCreateInput<"goals">) as Insert<(typeof collectionTableMap)[C]>;
    case "timeboxes":
      return mapTimeboxInsert(userId, item as PlannerCreateInput<"timeboxes">) as Insert<(typeof collectionTableMap)[C]>;
    case "studies":
      return mapStudyItemInsert(userId, item as PlannerCreateInput<"studies">) as Insert<(typeof collectionTableMap)[C]>;
    case "books":
      return mapBookInsert(userId, item as PlannerCreateInput<"books">) as Insert<(typeof collectionTableMap)[C]>;
    case "pocs":
      return mapPocInsert(userId, item as PlannerCreateInput<"pocs">) as Insert<(typeof collectionTableMap)[C]>;
    case "workouts":
      return mapWorkoutInsert(userId, item as PlannerCreateInput<"workouts">) as Insert<(typeof collectionTableMap)[C]>;
    case "reviews":
      return mapWeeklyReviewInsert(userId, item as PlannerCreateInput<"reviews">) as Insert<(typeof collectionTableMap)[C]>;
    default:
      return assertNever(collection);
  }
}

function mapRow(collection: PlannerCollection, row: unknown): PlannerItem {
  switch (collection) {
    case "weeks":
      return mapWeekRow(row as Row<"weeks">);
    case "goals":
      return mapWeeklyGoalRow(row as Row<"weekly_goals">);
    case "timeboxes":
      return mapTimeboxRow(row as Row<"timeboxes">);
    case "studies":
      return mapStudyItemRow(row as Row<"study_items">);
    case "books":
      return mapBookRow(row as Row<"books">);
    case "pocs":
      return mapPocRow(row as Row<"pocs">);
    case "workouts":
      return mapWorkoutRow(row as Row<"workouts">);
    case "reviews":
      return mapWeeklyReviewRow(row as Row<"weekly_reviews">);
    default:
      return assertNever(collection);
  }
}

function mapPatch<C extends PlannerCollection>(
  collection: C,
  patch: Partial<PlannerCreateInput<C>>,
): Update<(typeof collectionTableMap)[C]> {
  const mapped = mapCreateInput(collection, "__ignored_user__", patch as PlannerCreateInput<C>);
  const rest = { ...(mapped as Record<string, unknown>) };
  delete rest.user_id;
  delete rest.id;

  return rest as Update<(typeof collectionTableMap)[C]>;
}

async function getAuthenticatedUserId(client: PlannerClient) {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) throw mapPlannerError(error);
  if (!user) throw mapPlannerError("Usuário não autenticado.");

  return user.id;
}

async function selectAll<T extends TableName>(
  client: PlannerClient,
  table: T,
  orderBy?: string,
) {
  let query = fromDynamic(client, table).select("*") as {
    order(column: string, options: { ascending: boolean }): unknown;
  } & PromiseLike<{ data: unknown[] | null; error: unknown }>;

  if (orderBy) {
    query = query.order(orderBy, { ascending: true }) as typeof query;
  }

  const { data, error } = await query;

  if (error) throw mapPlannerError(error);

  return data ?? [];
}

export function createSupabasePlannerRepository(client: PlannerClient) {
  return {
    async ensureCurrentWeek(): Promise<Week> {
      const userId = await getAuthenticatedUserId(client);
      const { startDate, endDate } = getSundayWeekRange();
      const title = `Semana de ${startDate.slice(8, 10)}/${startDate.slice(5, 7)}`;

      const upsertWeekQuery = fromDynamic(client, "weeks").upsert(
        {
          user_id: userId,
          start_date: startDate,
          end_date: endDate,
          title,
          status: "active",
        },
        { onConflict: "user_id,start_date", ignoreDuplicates: true },
      ) as {
        select(columns?: string): {
          single(): Promise<{ data: Row<"weeks"> | null; error: unknown }>;
        };
      };

      const { data, error } = await upsertWeekQuery.select("*").single();

      if (error) {
        const selectExistingWeekQuery = client
          .from("weeks")
          .select("*")
          .eq("user_id", userId)
          .eq("start_date", startDate)
          .single() as unknown as Promise<{
          data: Row<"weeks"> | null;
          error: unknown;
        }>;

        const { data: existing, error: selectError } =
          await selectExistingWeekQuery;

        if (selectError) throw mapPlannerError(error);
        if (!existing) throw mapPlannerError(error);
        return mapWeekRow(existing);
      }

      if (!data) throw mapPlannerError("Não foi possível criar a semana atual.");

      return mapWeekRow(data);
    },

    async load(): Promise<PlannerData> {
      const [profileResult, weeks, goals, timeboxes, studies, books, readingLogs, pocs, workouts, reviews] =
        await Promise.all([
          client.from("profiles").select("*").single(),
          selectAll(client, "weeks", "start_date"),
          selectAll(client, "weekly_goals", "created_at"),
          selectAll(client, "timeboxes", "starts_at"),
          selectAll(client, "study_items", "created_at"),
          selectAll(client, "books", "created_at"),
          selectAll(client, "reading_logs", "read_date"),
          selectAll(client, "pocs", "created_at"),
          selectAll(client, "workouts", "planned_date"),
          selectAll(client, "weekly_reviews", "created_at"),
        ]);

      if (profileResult.error) throw mapPlannerError(profileResult.error);

      const activeWeek = (weeks as Row<"weeks">[]).find((week) => week.status === "active");
      const currentWeekLogs = (readingLogs as Row<"reading_logs">[]).filter(
        (log) => !activeWeek || log.week_id === activeWeek.id,
      );

      return {
        weeks: (weeks as Row<"weeks">[]).map(mapWeekRow),
        goals: (goals as Row<"weekly_goals">[]).map(mapWeeklyGoalRow),
        timeboxes: (timeboxes as Row<"timeboxes">[]).map(mapTimeboxRow),
        studies: (studies as Row<"study_items">[]).map(mapStudyItemRow),
        books: (books as Row<"books">[]).map((book) =>
          mapBookRow(
            book,
            currentWeekLogs.filter((log) => log.book_id === book.id),
          ),
        ),
        pocs: (pocs as Row<"pocs">[]).map(mapPocRow),
        workouts: (workouts as Row<"workouts">[]).map(mapWorkoutRow),
        reviews: (reviews as Row<"weekly_reviews">[]).map(mapWeeklyReviewRow),
        preferences: profileResult.data
          ? mapProfileRow(profileResult.data)
          : DEFAULT_PREFERENCES,
      };
    },

    async create<C extends PlannerCollection>(
      collection: C,
      item: PlannerCreateInput<C>,
    ): Promise<PlannerItem> {
      const userId = await getAuthenticatedUserId(client);
      const table = collectionTableMap[collection];
      const payload = mapCreateInput(collection, userId, item);
      const { data, error } = await ((fromDynamic(client, table)
        .insert(payload) as unknown as {
        select(columns?: string): {
          single(): Promise<{ data: unknown; error: unknown }>;
        };
      })
        .select("*")
        .single());

      if (error) throw mapPlannerError(error);

      return mapRow(collection, data);
    },

    async update<C extends PlannerCollection>(
      collection: C,
      id: string,
      patch: Partial<PlannerCreateInput<C>>,
    ): Promise<PlannerItem> {
      const table = collectionTableMap[collection];
      const payload = mapPatch(collection, patch);
      const { data, error } = await (((fromDynamic(client, table)
        .update(payload) as unknown as {
        eq(column: string, value: string): {
          select(columns?: string): {
            single(): Promise<{ data: unknown; error: unknown }>;
          };
        };
      })
        .eq("id", id)
        .select("*")
        .single()));

      if (error) throw mapPlannerError(error);

      return mapRow(collection, data);
    },

    async remove(collection: PlannerCollection, id: string): Promise<void> {
      const table = collectionTableMap[collection];
      const { error } = await ((fromDynamic(client, table)
        .delete() as unknown as {
        eq(column: string, value: string): Promise<{ error: unknown }>;
      }).eq("id", id));

      if (error) throw mapPlannerError(error);
    },

    async updatePreferences(patch: Partial<Preferences>): Promise<Preferences> {
      const userId = await getAuthenticatedUserId(client);
      const { data, error } = await client
        .from("profiles")
        .update(mapPreferencesUpdate(patch))
        .eq("id", userId)
        .select("*")
        .single();

      if (error) throw mapPlannerError(error);

      return mapProfileRow(data);
    },
  };
}

export type SupabasePlannerRepository = ReturnType<
  typeof createSupabasePlannerRepository
>;
