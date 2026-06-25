export type Category = "work" | "study" | "fitness" | "reading" | "poc" | "personal";
export type Status = "todo" | "in_progress" | "done" | "skipped";
export type ChecklistItem = { id: string; title: string; done: boolean };
export type Week = { id: string; startDate: string; endDate: string; title: string; status: "planned" | "active" | "reviewed" };
export type WeeklyGoal = { id: string; weekId: string; title: string; category: Category; status: Status; priority: "low" | "medium" | "high" };
export type Timebox = { id: string; weekId: string; title: string; date: string; startTime: string; endTime: string; category: Category };
export type StudyItem = { id: string; weekId?: string; title: string; topic: string; type: "article"|"course"|"video"|"documentation"|"practice"; estimatedMinutes: number; completedMinutes: number; status: Status; checklist: ChecklistItem[] };
export type Book = { id: string; title: string; author: string; totalPages: number; currentPage: number; weeklyTargetPages: number; status: "reading"|"paused"|"finished"; pagesThisWeek: number };
export type POC = { id: string; title: string; description: string; goal: string; repoUrl?: string; stack: string[]; status: "idea"|"doing"|"paused"|"done"; scopeChecklist: ChecklistItem[]; aiEvaluation?: string };
export type Workout = { id: string; weekId: string; type: "run"|"strength"|"mobility"|"pilates"|"football"|"rest"; plannedDate: string; durationMinutes: number; distanceKm?: number; intensity: "easy"|"moderate"|"hard"; status: "planned"|"completed"|"skipped"|"cancelled" };
export type WeeklyReview = { id: string; weekId: string; wins: string; misses: string; learnings: string; nextWeekFocus: string; scoreStudy: number; scoreFitness: number; scoreWork: number; scorePersonal: number };
export type Preferences = { locale: "pt-BR"|"en"; timezone: string; weekStartsOn: 0|1 };
export type PlannerData = {
  weeks: Week[]; goals: WeeklyGoal[]; timeboxes: Timebox[]; studies: StudyItem[];
  books: Book[]; pocs: POC[]; workouts: Workout[]; reviews: WeeklyReview[]; preferences: Preferences;
};
