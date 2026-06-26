import type {
  Book,
  ChecklistItem,
  PlannerData,
  POC,
  Preferences,
  StudyItem,
  Timebox,
  Week,
  WeeklyGoal,
  WeeklyReview,
  Workout,
} from "@/lib/types";
import type { Insert, Json, Row, TableName, Update } from "@/lib/supabase/database.types";

type PlannerErrorLike = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

export class PlannerRepositoryError extends Error {
  code?: string;
  details?: string;
  hint?: string;

  constructor(error: PlannerErrorLike) {
    super(error.message);
    this.name = "PlannerRepositoryError";
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
  }
}

export function mapPlannerError(error: unknown): PlannerRepositoryError {
  if (error instanceof PlannerRepositoryError) return error;

  if (error instanceof Error) {
    return new PlannerRepositoryError({ message: error.message });
  }

  if (typeof error === "string") {
    return new PlannerRepositoryError({ message: error });
  }

  if (error && typeof error === "object" && "message" in error) {
    const value = error as Partial<PlannerErrorLike>;
    return new PlannerRepositoryError({
      message:
        typeof value.message === "string"
          ? value.message
          : "Não foi possível sincronizar os dados do planner.",
      code: value.code,
      details: value.details,
      hint: value.hint,
    });
  }

  return new PlannerRepositoryError({
    message: "Não foi possível sincronizar os dados do planner.",
  });
}

function asChecklist(value: Json): ChecklistItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, Json | undefined> => {
      return Boolean(item && typeof item === "object" && !Array.isArray(item));
    })
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `item-${index}`,
      title: typeof item.title === "string" ? item.title : "",
      done: typeof item.done === "boolean" ? item.done : false,
    }));
}

function checklistToJson(value: ChecklistItem[] | undefined): Json {
  return (value ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    done: item.done,
  }));
}

function toTimestamp(date: string, time: string) {
  return new Date(`${date}T${time}:00.000Z`).toISOString();
}

function fromTimestamp(value: string) {
  return {
    date: value.slice(0, 10),
    time: value.slice(11, 16),
  };
}

function toDbWorkoutStatus(
  status: Workout["status"] | undefined,
): Row<"workouts">["status"] | undefined {
  if (!status) return undefined;
  if (status === "completed") return "done";
  if (status === "cancelled") return "skipped";
  return status;
}

function fromDbWorkoutStatus(status: Row<"workouts">["status"]): Workout["status"] {
  if (status === "done") return "completed";
  return status;
}

export function mapProfileRow(row: Row<"profiles">): Preferences {
  return {
    locale: row.locale === "en" ? "en" : "pt-BR",
    timezone: row.timezone,
    weekStartsOn: row.week_starts_on === 1 ? 1 : 0,
  };
}

export function mapPreferencesUpdate(
  preferences: Partial<Preferences>,
): Update<"profiles"> {
  return {
    locale: preferences.locale,
    timezone: preferences.timezone,
    week_starts_on: preferences.weekStartsOn,
  };
}

export function mapWeekRow(row: Row<"weeks">): Week {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    title: row.title,
    status: row.status,
  };
}

export function mapWeekInsert(userId: string, week: Omit<Week, "id"> & { id?: string }): Insert<"weeks"> {
  return {
    id: week.id,
    user_id: userId,
    start_date: week.startDate,
    end_date: week.endDate,
    title: week.title,
    status: week.status,
  };
}

export function mapWeeklyGoalRow(row: Row<"weekly_goals">): WeeklyGoal {
  return {
    id: row.id,
    weekId: row.week_id,
    title: row.title,
    category: row.category,
    status: row.status,
    priority: row.priority,
  };
}

export function mapWeeklyGoalInsert(
  userId: string,
  goal: Omit<WeeklyGoal, "id"> & { id?: string },
): Insert<"weekly_goals"> {
  return {
    id: goal.id,
    user_id: userId,
    week_id: goal.weekId,
    title: goal.title,
    category: goal.category,
    status: goal.status,
    priority: goal.priority,
  };
}

export function mapTimeboxRow(row: Row<"timeboxes">): Timebox {
  const start = fromTimestamp(row.starts_at);
  const end = fromTimestamp(row.ends_at);

  return {
    id: row.id,
    weekId: row.week_id,
    title: row.title,
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    category: row.category === "recovery" ? "personal" : row.category,
  };
}

export function mapTimeboxInsert(
  userId: string,
  timebox: Omit<Timebox, "id"> & { id?: string },
): Insert<"timeboxes"> {
  return {
    id: timebox.id,
    user_id: userId,
    week_id: timebox.weekId,
    title: timebox.title,
    category: timebox.category,
    starts_at: toTimestamp(timebox.date, timebox.startTime),
    ends_at: toTimestamp(timebox.date, timebox.endTime),
  };
}

export function mapStudyItemRow(row: Row<"study_items">): StudyItem {
  return {
    id: row.id,
    weekId: row.week_id ?? undefined,
    title: row.title,
    topic: row.topic,
    type: row.type,
    estimatedMinutes: row.estimated_minutes,
    completedMinutes: row.completed_minutes,
    status: row.status,
    checklist: asChecklist(row.checklist),
  };
}

export function mapStudyItemInsert(
  userId: string,
  study: Omit<StudyItem, "id"> & { id?: string },
): Insert<"study_items"> {
  return {
    id: study.id,
    user_id: userId,
    week_id: study.weekId ?? null,
    title: study.title,
    topic: study.topic,
    type: study.type,
    estimated_minutes: study.estimatedMinutes,
    completed_minutes: study.completedMinutes,
    status: study.status,
    checklist: checklistToJson(study.checklist),
  };
}

export function mapBookRow(
  row: Row<"books">,
  readingLogs: Array<Pick<Row<"reading_logs">, "pages_read">> = [],
): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    totalPages: row.total_pages,
    currentPage: row.current_page,
    weeklyTargetPages: row.weekly_target_pages,
    status: row.status,
    pagesThisWeek: readingLogs.reduce((sum, log) => sum + log.pages_read, 0),
  };
}

export function mapBookInsert(
  userId: string,
  book: Omit<Book, "id" | "pagesThisWeek"> & { id?: string },
): Insert<"books"> {
  return {
    id: book.id,
    user_id: userId,
    title: book.title,
    author: book.author,
    total_pages: book.totalPages,
    current_page: book.currentPage,
    weekly_target_pages: book.weeklyTargetPages,
    status: book.status,
  };
}

export function mapPocRow(row: Row<"pocs">): POC {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    goal: row.goal,
    repoUrl: row.repo_url ?? undefined,
    stack: row.stack,
    status: row.status,
    scopeChecklist: asChecklist(row.scope_checklist),
    aiEvaluation: row.ai_evaluation ?? undefined,
  };
}

export function mapPocInsert(
  userId: string,
  poc: Omit<POC, "id"> & { id?: string },
): Insert<"pocs"> {
  return {
    id: poc.id,
    user_id: userId,
    title: poc.title,
    description: poc.description,
    goal: poc.goal,
    repo_url: poc.repoUrl ?? null,
    stack: poc.stack,
    status: poc.status,
    scope_checklist: checklistToJson(poc.scopeChecklist),
    ai_evaluation: poc.aiEvaluation ?? null,
  };
}

export function mapWorkoutRow(row: Row<"workouts">): Workout {
  return {
    id: row.id,
    weekId: row.week_id,
    type: row.type,
    plannedDate: row.planned_date,
    durationMinutes: row.duration_minutes,
    distanceKm: row.distance_km ?? undefined,
    intensity: row.intensity,
    status: fromDbWorkoutStatus(row.status),
  };
}

export function mapWorkoutInsert(
  userId: string,
  workout: Omit<Workout, "id"> & { id?: string },
): Insert<"workouts"> {
  return {
    id: workout.id,
    user_id: userId,
    week_id: workout.weekId,
    type: workout.type,
    planned_date: workout.plannedDate,
    duration_minutes: workout.durationMinutes,
    distance_km: workout.distanceKm ?? null,
    intensity: workout.intensity,
    status: toDbWorkoutStatus(workout.status),
  };
}

export function mapWeeklyReviewRow(row: Row<"weekly_reviews">): WeeklyReview {
  return {
    id: row.id,
    weekId: row.week_id,
    wins: row.wins,
    misses: row.misses,
    learnings: row.learnings,
    nextWeekFocus: row.next_week_focus,
    scoreStudy: row.score_study ?? 1,
    scoreFitness: row.score_fitness ?? 1,
    scoreWork: row.score_work ?? 1,
    scorePersonal: row.score_personal ?? 1,
  };
}

export function mapWeeklyReviewInsert(
  userId: string,
  review: Omit<WeeklyReview, "id"> & { id?: string },
): Insert<"weekly_reviews"> {
  return {
    id: review.id,
    user_id: userId,
    week_id: review.weekId,
    wins: review.wins,
    misses: review.misses,
    learnings: review.learnings,
    next_week_focus: review.nextWeekFocus,
    score_study: review.scoreStudy,
    score_fitness: review.scoreFitness,
    score_work: review.scoreWork,
    score_personal: review.scorePersonal,
  };
}

export type PlannerCollection = Exclude<keyof PlannerData, "preferences">;

export const collectionTableMap = {
  weeks: "weeks",
  goals: "weekly_goals",
  timeboxes: "timeboxes",
  studies: "study_items",
  books: "books",
  pocs: "pocs",
  workouts: "workouts",
  reviews: "weekly_reviews",
} satisfies Record<PlannerCollection, TableName>;
