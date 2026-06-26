export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          locale: string;
          timezone: string;
          week_starts_on: number;
          theme: "light" | "dark" | "system";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email: string;
          locale?: string;
          timezone?: string;
          week_starts_on?: number;
          theme?: "light" | "dark" | "system";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      weeks: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          title: string;
          status: "planned" | "active" | "reviewed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date: string;
          title: string;
          status?: "planned" | "active" | "reviewed";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weeks"]["Insert"]>;
        Relationships: [];
      };
      weekly_goals: {
        Row: {
          id: string;
          user_id: string;
          week_id: string;
          title: string;
          category: "work" | "study" | "fitness" | "reading" | "poc" | "personal";
          status: "todo" | "in_progress" | "done" | "skipped";
          priority: "low" | "medium" | "high";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_id: string;
          title: string;
          category: "work" | "study" | "fitness" | "reading" | "poc" | "personal";
          status?: "todo" | "in_progress" | "done" | "skipped";
          priority?: "low" | "medium" | "high";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weekly_goals"]["Insert"]>;
        Relationships: [];
      };
      timeboxes: {
        Row: {
          id: string;
          user_id: string;
          week_id: string;
          title: string;
          category: "work" | "study" | "fitness" | "reading" | "poc" | "personal" | "recovery";
          starts_at: string;
          ends_at: string;
          notes: string | null;
          status: "planned" | "done" | "skipped";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_id: string;
          title: string;
          category: "work" | "study" | "fitness" | "reading" | "poc" | "personal" | "recovery";
          starts_at: string;
          ends_at: string;
          notes?: string | null;
          status?: "planned" | "done" | "skipped";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["timeboxes"]["Insert"]>;
        Relationships: [];
      };
      study_items: {
        Row: {
          id: string;
          user_id: string;
          week_id: string | null;
          title: string;
          topic: string;
          type: "article" | "course" | "video" | "documentation" | "practice";
          estimated_minutes: number;
          completed_minutes: number;
          status: "todo" | "in_progress" | "done" | "skipped";
          checklist: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_id?: string | null;
          title: string;
          topic: string;
          type: "article" | "course" | "video" | "documentation" | "practice";
          estimated_minutes?: number;
          completed_minutes?: number;
          status?: "todo" | "in_progress" | "done" | "skipped";
          checklist?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["study_items"]["Insert"]>;
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string;
          total_pages: number;
          current_page: number;
          weekly_target_pages: number;
          status: "reading" | "paused" | "finished";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          author: string;
          total_pages: number;
          current_page?: number;
          weekly_target_pages?: number;
          status?: "reading" | "paused" | "finished";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["books"]["Insert"]>;
        Relationships: [];
      };
      reading_logs: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          week_id: string | null;
          read_date: string;
          pages_read: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          week_id?: string | null;
          read_date?: string;
          pages_read: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reading_logs"]["Insert"]>;
        Relationships: [];
      };
      pocs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          goal: string;
          repo_url: string | null;
          stack: string[];
          status: "idea" | "doing" | "paused" | "done";
          scope_checklist: Json;
          ai_evaluation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          goal?: string;
          repo_url?: string | null;
          stack?: string[];
          status?: "idea" | "doing" | "paused" | "done";
          scope_checklist?: Json;
          ai_evaluation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pocs"]["Insert"]>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          week_id: string;
          type: "run" | "strength" | "mobility" | "pilates" | "football" | "rest";
          planned_date: string;
          duration_minutes: number;
          distance_km: number | null;
          intensity: "easy" | "moderate" | "hard";
          status: "planned" | "done" | "skipped";
          notes: string | null;
          source: "manual" | "garmin" | "suggested";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_id: string;
          type: "run" | "strength" | "mobility" | "pilates" | "football" | "rest";
          planned_date: string;
          duration_minutes?: number;
          distance_km?: number | null;
          intensity?: "easy" | "moderate" | "hard";
          status?: "planned" | "done" | "skipped";
          notes?: string | null;
          source?: "manual" | "garmin" | "suggested";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
        Relationships: [];
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_id: string;
          wins: string;
          misses: string;
          learnings: string;
          next_week_focus: string;
          score_study: number | null;
          score_fitness: number | null;
          score_work: number | null;
          score_personal: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_id: string;
          wins?: string;
          misses?: string;
          learnings?: string;
          next_week_focus?: string;
          score_study?: number | null;
          score_fitness?: number | null;
          score_work?: number | null;
          score_personal?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weekly_reviews"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type Update<T extends TableName> = Database["public"]["Tables"][T]["Update"];
