export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Helper: every table needs Relationships for Supabase type inference
type T<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: T<
        { id: string; role: "coach" | "client"; full_name: string | null; avatar_url: string | null; created_at: string },
        { id: string; role: "coach" | "client"; full_name?: string | null; avatar_url?: string | null; created_at?: string },
        { id?: string; role?: "coach" | "client"; full_name?: string | null; avatar_url?: string | null; created_at?: string }
      >;

      coaches: T<
        { id: string; slug: string; business_name: string | null; bio: string | null; brand_color: string | null; logo_url: string | null; website_url: string | null; stripe_account_id: string | null; stripe_customer_id: string | null; subscription_tier: "starter" | "pro" | "elite" | null; subscription_status: string | null; onboarded_at: string | null; settings: Json | null },
        { id: string; slug: string; business_name?: string | null; bio?: string | null; brand_color?: string | null; logo_url?: string | null; website_url?: string | null; stripe_account_id?: string | null; stripe_customer_id?: string | null; subscription_tier?: "starter" | "pro" | "elite" | null; subscription_status?: string | null; onboarded_at?: string | null; settings?: Json | null },
        { id?: string; slug?: string; business_name?: string | null; bio?: string | null; brand_color?: string | null; logo_url?: string | null; website_url?: string | null; stripe_account_id?: string | null; stripe_customer_id?: string | null; subscription_tier?: "starter" | "pro" | "elite" | null; subscription_status?: string | null; onboarded_at?: string | null; settings?: Json | null }
      >;

      clients: T<
        { id: string; coach_id: string; status: "active" | "inactive" | "paused"; goals: string | null; notes: string | null; onboarded_at: string | null; metadata: Json | null },
        { id: string; coach_id: string; status?: "active" | "inactive" | "paused"; goals?: string | null; notes?: string | null; onboarded_at?: string | null; metadata?: Json | null },
        { id?: string; coach_id?: string; status?: "active" | "inactive" | "paused"; goals?: string | null; notes?: string | null; onboarded_at?: string | null; metadata?: Json | null }
      >;

      leads: T<
        { id: string; coach_id: string; email: string; full_name: string | null; phone: string | null; status: "new" | "contacted" | "qualified" | "converted" | "rejected"; source: string | null; converted_client_id: string | null; created_at: string; updated_at: string },
        { id?: string; coach_id: string; email: string; full_name?: string | null; phone?: string | null; status?: "new" | "contacted" | "qualified" | "converted" | "rejected"; source?: string | null; converted_client_id?: string | null; created_at?: string; updated_at?: string },
        { id?: string; coach_id?: string; email?: string; full_name?: string | null; phone?: string | null; status?: "new" | "contacted" | "qualified" | "converted" | "rejected"; source?: string | null; converted_client_id?: string | null; created_at?: string; updated_at?: string }
      >;

      lead_applications: T<
        { id: string; lead_id: string; coach_id: string; goals: string | null; experience_level: string | null; availability: string | null; budget_range: string | null; health_notes: string | null; custom_answers: Json | null; submitted_at: string },
        { id?: string; lead_id: string; coach_id: string; goals?: string | null; experience_level?: string | null; availability?: string | null; budget_range?: string | null; health_notes?: string | null; custom_answers?: Json | null; submitted_at?: string },
        { id?: string; lead_id?: string; coach_id?: string; goals?: string | null; experience_level?: string | null; availability?: string | null; budget_range?: string | null; health_notes?: string | null; custom_answers?: Json | null; submitted_at?: string }
      >;

      exercises: T<
        { id: string; coach_id: string | null; name: string; description: string | null; instructions: string | null; category: string | null; muscle_groups: string[] | null; equipment: string[] | null; video_url: string | null; thumbnail_url: string | null; is_public: boolean; created_at: string },
        { id?: string; coach_id?: string | null; name: string; description?: string | null; instructions?: string | null; category?: string | null; muscle_groups?: string[] | null; equipment?: string[] | null; video_url?: string | null; thumbnail_url?: string | null; is_public?: boolean; created_at?: string },
        { id?: string; coach_id?: string | null; name?: string; description?: string | null; instructions?: string | null; category?: string | null; muscle_groups?: string[] | null; equipment?: string[] | null; video_url?: string | null; thumbnail_url?: string | null; is_public?: boolean; created_at?: string }
      >;

      programs: T<
        { id: string; coach_id: string; title: string; description: string | null; duration_weeks: number | null; status: "draft" | "active" | "archived"; is_template: boolean; source: "manual" | "ai_approved"; created_at: string; updated_at: string },
        { id?: string; coach_id: string; title: string; description?: string | null; duration_weeks?: number | null; status?: "draft" | "active" | "archived"; is_template?: boolean; source?: "manual" | "ai_approved"; created_at?: string; updated_at?: string },
        { id?: string; coach_id?: string; title?: string; description?: string | null; duration_weeks?: number | null; status?: "draft" | "active" | "archived"; is_template?: boolean; source?: "manual" | "ai_approved"; created_at?: string; updated_at?: string }
      >;

      program_assignments: T<
        { id: string; program_id: string; client_id: string; coach_id: string; start_date: string; end_date: string | null; status: "active" | "completed" | "paused"; assigned_at: string },
        { id?: string; program_id: string; client_id: string; coach_id: string; start_date: string; end_date?: string | null; status?: "active" | "completed" | "paused"; assigned_at?: string },
        { id?: string; program_id?: string; client_id?: string; coach_id?: string; start_date?: string; end_date?: string | null; status?: "active" | "completed" | "paused"; assigned_at?: string }
      >;

      weeks: T<
        { id: string; program_id: string; week_number: number; label: string | null; notes: string | null },
        { id?: string; program_id: string; week_number: number; label?: string | null; notes?: string | null },
        { id?: string; program_id?: string; week_number?: number; label?: string | null; notes?: string | null }
      >;

      workouts: T<
        { id: string; coach_id: string; week_id: string | null; title: string; description: string | null; day_of_week: number | null; order_index: number; estimated_duration_min: number | null; status: "draft" | "published"; is_template: boolean },
        { id?: string; coach_id: string; week_id?: string | null; title: string; description?: string | null; day_of_week?: number | null; order_index?: number; estimated_duration_min?: number | null; status?: "draft" | "published"; is_template?: boolean },
        { id?: string; coach_id?: string; week_id?: string | null; title?: string; description?: string | null; day_of_week?: number | null; order_index?: number; estimated_duration_min?: number | null; status?: "draft" | "published"; is_template?: boolean }
      >;

      workout_exercises: T<
        { id: string; workout_id: string; exercise_id: string; order_index: number; sets: number | null; reps: string | null; load: string | null; rest_seconds: number | null; tempo: string | null; notes: string | null },
        { id?: string; workout_id: string; exercise_id: string; order_index?: number; sets?: number | null; reps?: string | null; load?: string | null; rest_seconds?: number | null; tempo?: string | null; notes?: string | null },
        { id?: string; workout_id?: string; exercise_id?: string; order_index?: number; sets?: number | null; reps?: string | null; load?: string | null; rest_seconds?: number | null; tempo?: string | null; notes?: string | null }
      >;

      workout_logs: T<
        { id: string; client_id: string; coach_id: string; workout_id: string | null; assignment_id: string | null; logged_at: string; duration_min: number | null; overall_rpe: number | null; energy_level: number | null; notes: string | null; status: "in_progress" | "completed" | "skipped" },
        { id?: string; client_id: string; coach_id: string; workout_id?: string | null; assignment_id?: string | null; logged_at?: string; duration_min?: number | null; overall_rpe?: number | null; energy_level?: number | null; notes?: string | null; status?: "in_progress" | "completed" | "skipped" },
        { id?: string; client_id?: string; coach_id?: string; workout_id?: string | null; assignment_id?: string | null; logged_at?: string; duration_min?: number | null; overall_rpe?: number | null; energy_level?: number | null; notes?: string | null; status?: "in_progress" | "completed" | "skipped" }
      >;

      exercise_logs: T<
        { id: string; workout_log_id: string; exercise_id: string; workout_exercise_id: string | null; order_index: number; notes: string | null },
        { id?: string; workout_log_id: string; exercise_id: string; workout_exercise_id?: string | null; order_index?: number; notes?: string | null },
        { id?: string; workout_log_id?: string; exercise_id?: string; workout_exercise_id?: string | null; order_index?: number; notes?: string | null }
      >;

      set_logs: T<
        { id: string; exercise_log_id: string; set_number: number; reps_completed: number | null; load: number | null; load_unit: string | null; rpe: number | null; completed: boolean },
        { id?: string; exercise_log_id: string; set_number: number; reps_completed?: number | null; load?: number | null; load_unit?: string | null; rpe?: number | null; completed?: boolean },
        { id?: string; exercise_log_id?: string; set_number?: number; reps_completed?: number | null; load?: number | null; load_unit?: string | null; rpe?: number | null; completed?: boolean }
      >;

      check_in_templates: T<
        { id: string; coach_id: string; title: string; questions: Json; is_default: boolean },
        { id?: string; coach_id: string; title: string; questions?: Json; is_default?: boolean },
        { id?: string; coach_id?: string; title?: string; questions?: Json; is_default?: boolean }
      >;

      check_ins: T<
        { id: string; client_id: string; coach_id: string; template_id: string | null; week_start_date: string; responses: Json | null; sleep_quality: number | null; stress_level: number | null; soreness_level: number | null; weight: number | null; weight_unit: string | null; body_photo_urls: string[] | null; notes: string | null; submitted_at: string; reviewed_at: string | null; coach_notes: string | null },
        { id?: string; client_id: string; coach_id: string; template_id?: string | null; week_start_date: string; responses?: Json | null; sleep_quality?: number | null; stress_level?: number | null; soreness_level?: number | null; weight?: number | null; weight_unit?: string | null; body_photo_urls?: string[] | null; notes?: string | null; submitted_at?: string; reviewed_at?: string | null; coach_notes?: string | null },
        { id?: string; client_id?: string; coach_id?: string; template_id?: string | null; week_start_date?: string; responses?: Json | null; sleep_quality?: number | null; stress_level?: number | null; soreness_level?: number | null; weight?: number | null; weight_unit?: string | null; body_photo_urls?: string[] | null; notes?: string | null; submitted_at?: string; reviewed_at?: string | null; coach_notes?: string | null }
      >;

      ai_drafts: T<
        { id: string; coach_id: string; client_id: string | null; type: "program" | "workout" | "adjustment_suggestion" | "check_in_analysis"; status: "pending" | "approved" | "rejected" | "modified_approved"; prompt_context: Json | null; raw_output: Json | null; parsed_content: Json | null; coach_notes: string | null; approved_resource_id: string | null; created_at: string; reviewed_at: string | null },
        { id?: string; coach_id: string; client_id?: string | null; type: "program" | "workout" | "adjustment_suggestion" | "check_in_analysis"; status?: "pending" | "approved" | "rejected" | "modified_approved"; prompt_context?: Json | null; raw_output?: Json | null; parsed_content?: Json | null; coach_notes?: string | null; approved_resource_id?: string | null; created_at?: string; reviewed_at?: string | null },
        { id?: string; coach_id?: string; client_id?: string | null; type?: "program" | "workout" | "adjustment_suggestion" | "check_in_analysis"; status?: "pending" | "approved" | "rejected" | "modified_approved"; prompt_context?: Json | null; raw_output?: Json | null; parsed_content?: Json | null; coach_notes?: string | null; approved_resource_id?: string | null; created_at?: string; reviewed_at?: string | null }
      >;

      adaptive_suggestions: T<
        { id: string; coach_id: string; client_id: string; assignment_id: string; ai_draft_id: string; suggestion_type: "load_adjustment" | "deload" | "exercise_swap" | "rep_change" | "rest_change"; target_week: number | null; rationale: string | null; status: "pending" | "approved" | "rejected"; created_at: string },
        { id?: string; coach_id: string; client_id: string; assignment_id: string; ai_draft_id: string; suggestion_type: "load_adjustment" | "deload" | "exercise_swap" | "rep_change" | "rest_change"; target_week?: number | null; rationale?: string | null; status?: "pending" | "approved" | "rejected"; created_at?: string },
        { id?: string; coach_id?: string; client_id?: string; assignment_id?: string; ai_draft_id?: string; suggestion_type?: "load_adjustment" | "deload" | "exercise_swap" | "rep_change" | "rest_change"; target_week?: number | null; rationale?: string | null; status?: "pending" | "approved" | "rejected"; created_at?: string }
      >;

      conversations: T<
        { id: string; coach_id: string; client_id: string; created_at: string; last_message_at: string | null },
        { id?: string; coach_id: string; client_id: string; created_at?: string; last_message_at?: string | null },
        { id?: string; coach_id?: string; client_id?: string; created_at?: string; last_message_at?: string | null }
      >;

      messages: T<
        { id: string; conversation_id: string; sender_id: string; body: string; attachment_urls: string[] | null; read_at: string | null; sent_at: string },
        { id?: string; conversation_id: string; sender_id: string; body: string; attachment_urls?: string[] | null; read_at?: string | null; sent_at?: string },
        { id?: string; conversation_id?: string; sender_id?: string; body?: string; attachment_urls?: string[] | null; read_at?: string | null; sent_at?: string }
      >;

      availability_slots: T<
        { id: string; coach_id: string; day_of_week: number[] | null; start_time: string; end_time: string; slot_duration_min: number; is_active: boolean },
        { id?: string; coach_id: string; day_of_week?: number[] | null; start_time: string; end_time: string; slot_duration_min?: number; is_active?: boolean },
        { id?: string; coach_id?: string; day_of_week?: number[] | null; start_time?: string; end_time?: string; slot_duration_min?: number; is_active?: boolean }
      >;

      session_bookings: T<
        { id: string; coach_id: string; client_id: string; scheduled_at: string; duration_min: number; type: string | null; status: "pending" | "confirmed" | "completed" | "cancelled"; notes: string | null; meeting_url: string | null },
        { id?: string; coach_id: string; client_id: string; scheduled_at: string; duration_min?: number; type?: string | null; status?: "pending" | "confirmed" | "completed" | "cancelled"; notes?: string | null; meeting_url?: string | null },
        { id?: string; coach_id?: string; client_id?: string; scheduled_at?: string; duration_min?: number; type?: string | null; status?: "pending" | "confirmed" | "completed" | "cancelled"; notes?: string | null; meeting_url?: string | null }
      >;

      stripe_subscriptions: T<
        { id: string; coach_id: string; stripe_subscription_id: string; stripe_price_id: string | null; status: string; current_period_start: string | null; current_period_end: string | null; cancel_at_period_end: boolean; created_at: string; updated_at: string },
        { id?: string; coach_id: string; stripe_subscription_id: string; stripe_price_id?: string | null; status: string; current_period_start?: string | null; current_period_end?: string | null; cancel_at_period_end?: boolean; created_at?: string; updated_at?: string },
        { id?: string; coach_id?: string; stripe_subscription_id?: string; stripe_price_id?: string | null; status?: string; current_period_start?: string | null; current_period_end?: string | null; cancel_at_period_end?: boolean; created_at?: string; updated_at?: string }
      >;

      stripe_events: T<
        { id: string; stripe_event_id: string; type: string; data: Json; processed_at: string },
        { id?: string; stripe_event_id: string; type: string; data: Json; processed_at?: string },
        { id?: string; stripe_event_id?: string; type?: string; data?: Json; processed_at?: string }
      >;

      client_risk_scores: T<
        { id: string; client_id: string; risk_level: "low" | "medium" | "high"; signals: Json | null; scored_at: string },
        { id?: string; client_id: string; risk_level: "low" | "medium" | "high"; signals?: Json | null; scored_at?: string },
        { id?: string; client_id?: string; risk_level?: "low" | "medium" | "high"; signals?: Json | null; scored_at?: string }
      >;

      transformations: T<
        { id: string; client_id: string; before_photo_url: string | null; after_photo_url: string | null; testimonial: string | null; share_token: string | null; is_public: boolean; created_at: string },
        { id?: string; client_id: string; before_photo_url?: string | null; after_photo_url?: string | null; testimonial?: string | null; share_token?: string | null; is_public?: boolean; created_at?: string },
        { id?: string; client_id?: string; before_photo_url?: string | null; after_photo_url?: string | null; testimonial?: string | null; share_token?: string | null; is_public?: boolean; created_at?: string }
      >;
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Relationships: [];
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    CompositeTypes: {
      [key: string]: Record<string, unknown>;
    };
    Enums: {
      user_role: "coach" | "client";
      client_status: "active" | "inactive" | "paused";
      lead_status: "new" | "contacted" | "qualified" | "converted" | "rejected";
      program_status: "draft" | "active" | "archived";
      workout_status: "draft" | "published";
      assignment_status: "active" | "completed" | "paused";
      ai_draft_type: "program" | "workout" | "adjustment_suggestion" | "check_in_analysis";
      ai_draft_status: "pending" | "approved" | "rejected" | "modified_approved";
      suggestion_type: "load_adjustment" | "deload" | "exercise_swap" | "rep_change" | "rest_change";
      booking_status: "pending" | "confirmed" | "completed" | "cancelled";
      subscription_tier: "starter" | "pro" | "elite";
    };
  };
};

// Convenience types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Coach = Tables<"coaches">;
export type Client = Tables<"clients">;
export type Lead = Tables<"leads">;
export type LeadApplication = Tables<"lead_applications">;
export type Exercise = Tables<"exercises">;
export type Program = Tables<"programs">;
export type ProgramAssignment = Tables<"program_assignments">;
export type Week = Tables<"weeks">;
export type Workout = Tables<"workouts">;
export type WorkoutExercise = Tables<"workout_exercises">;
export type WorkoutLog = Tables<"workout_logs">;
export type ExerciseLog = Tables<"exercise_logs">;
export type SetLog = Tables<"set_logs">;
export type CheckInTemplate = Tables<"check_in_templates">;
export type CheckIn = Tables<"check_ins">;
export type AIDraft = Tables<"ai_drafts">;
export type AdaptiveSuggestion = Tables<"adaptive_suggestions">;
export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;
export type AvailabilitySlot = Tables<"availability_slots">;
export type SessionBooking = Tables<"session_bookings">;
export type StripeSubscription = Tables<"stripe_subscriptions">;

// Composite types for common joins
export type ClientWithProfile = Client & { profile: Profile };
export type LeadWithApplication = Lead & { application: LeadApplication | null };
