-- ============================================================
-- DawFit Initial Schema Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('coach', 'client');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'paused');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'rejected');
CREATE TYPE program_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE workout_status AS ENUM ('draft', 'published');
CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'paused');
CREATE TYPE log_status AS ENUM ('in_progress', 'completed', 'skipped');
CREATE TYPE ai_draft_type AS ENUM ('program', 'workout', 'adjustment_suggestion', 'check_in_analysis');
CREATE TYPE ai_draft_status AS ENUM ('pending', 'approved', 'rejected', 'modified_approved');
CREATE TYPE suggestion_type AS ENUM ('load_adjustment', 'deload', 'exercise_swap', 'rep_change', 'rest_change');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE subscription_tier AS ENUM ('starter', 'pro', 'elite');
CREATE TYPE program_source AS ENUM ('manual', 'ai_approved');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COACHES
-- ============================================================

CREATE TABLE coaches (
  id                   UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  slug                 TEXT NOT NULL UNIQUE,
  business_name        TEXT,
  bio                  TEXT,
  brand_color          TEXT DEFAULT '#3B82F6',
  logo_url             TEXT,
  website_url          TEXT,
  stripe_account_id    TEXT,
  stripe_customer_id   TEXT,
  subscription_tier    subscription_tier,
  subscription_status  TEXT,
  onboarded_at         TIMESTAMPTZ,
  settings             JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_coaches_slug ON coaches(slug);

-- ============================================================
-- CLIENTS
-- ============================================================

CREATE TABLE clients (
  id           UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id     UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  status       client_status NOT NULL DEFAULT 'active',
  goals        TEXT,
  notes        TEXT,
  onboarded_at TIMESTAMPTZ,
  metadata     JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_clients_coach_id ON clients(coach_id);

-- ============================================================
-- LEADS
-- ============================================================

CREATE TABLE leads (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id             UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  email                TEXT NOT NULL,
  full_name            TEXT,
  phone                TEXT,
  status               lead_status NOT NULL DEFAULT 'new',
  source               TEXT DEFAULT 'application_page',
  converted_client_id  UUID REFERENCES clients(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_coach_id ON leads(coach_id);
CREATE INDEX idx_leads_status ON leads(coach_id, status);

CREATE TABLE lead_applications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id          UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  coach_id         UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  goals            TEXT,
  experience_level TEXT,
  availability     TEXT,
  budget_range     TEXT,
  health_notes     TEXT,
  custom_answers   JSONB DEFAULT '{}'::jsonb,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_applications_lead_id ON lead_applications(lead_id);
CREATE INDEX idx_lead_applications_coach_id ON lead_applications(coach_id);

-- ============================================================
-- EXERCISES
-- ============================================================

CREATE TABLE exercises (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID REFERENCES coaches(id) ON DELETE CASCADE,  -- NULL = platform default
  name            TEXT NOT NULL,
  description     TEXT,
  instructions    TEXT,
  category        TEXT,
  muscle_groups   TEXT[] DEFAULT '{}',
  equipment       TEXT[] DEFAULT '{}',
  video_url       TEXT,
  thumbnail_url   TEXT,
  is_public       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_coach_id ON exercises(coach_id);
CREATE INDEX idx_exercises_category ON exercises(category);

-- ============================================================
-- PROGRAMS
-- ============================================================

CREATE TABLE programs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  duration_weeks  INTEGER,
  status          program_status NOT NULL DEFAULT 'draft',
  is_template     BOOLEAN NOT NULL DEFAULT false,
  source          program_source NOT NULL DEFAULT 'manual',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_programs_coach_id ON programs(coach_id);
CREATE INDEX idx_programs_status ON programs(coach_id, status);

CREATE TABLE program_assignments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id    UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL,
  end_date    DATE,
  status      assignment_status NOT NULL DEFAULT 'active',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_client_id ON program_assignments(client_id);
CREATE INDEX idx_assignments_coach_id ON program_assignments(coach_id);
CREATE INDEX idx_assignments_program_id ON program_assignments(program_id);

-- ============================================================
-- WEEKS & WORKOUTS
-- ============================================================

CREATE TABLE weeks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id   UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_number  INTEGER NOT NULL,
  label        TEXT,
  notes        TEXT,
  UNIQUE(program_id, week_number)
);

CREATE INDEX idx_weeks_program_id ON weeks(program_id);

CREATE TABLE workouts (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id                UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  week_id                 UUID REFERENCES weeks(id) ON DELETE SET NULL,
  title                   TEXT NOT NULL,
  description             TEXT,
  day_of_week             INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
  order_index             INTEGER NOT NULL DEFAULT 0,
  estimated_duration_min  INTEGER,
  status                  workout_status NOT NULL DEFAULT 'draft',
  is_template             BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_workouts_coach_id ON workouts(coach_id);
CREATE INDEX idx_workouts_week_id ON workouts(week_id);

CREATE TABLE workout_exercises (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id          UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id         UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  order_index         INTEGER NOT NULL DEFAULT 0,
  sets                INTEGER,
  reps                TEXT,
  load                TEXT,
  rest_seconds        INTEGER,
  tempo               TEXT,
  notes               TEXT
);

CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- ============================================================
-- WORKOUT LOGGING
-- ============================================================

CREATE TABLE workout_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id       UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  workout_id     UUID REFERENCES workouts(id) ON DELETE SET NULL,
  assignment_id  UUID REFERENCES program_assignments(id) ON DELETE SET NULL,
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_min   INTEGER,
  overall_rpe    NUMERIC(3,1) CHECK (overall_rpe BETWEEN 1 AND 10),
  energy_level   INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  notes          TEXT,
  status         log_status NOT NULL DEFAULT 'in_progress'
);

CREATE INDEX idx_workout_logs_client_id ON workout_logs(client_id);
CREATE INDEX idx_workout_logs_coach_id ON workout_logs(coach_id);
CREATE INDEX idx_workout_logs_logged_at ON workout_logs(client_id, logged_at DESC);

CREATE TABLE exercise_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_log_id      UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id         UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE SET NULL,
  order_index         INTEGER NOT NULL DEFAULT 0,
  notes               TEXT
);

CREATE INDEX idx_exercise_logs_workout_log_id ON exercise_logs(workout_log_id);

CREATE TABLE set_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_log_id  UUID NOT NULL REFERENCES exercise_logs(id) ON DELETE CASCADE,
  set_number       INTEGER NOT NULL,
  reps_completed   INTEGER,
  load             NUMERIC,
  load_unit        TEXT DEFAULT 'lbs',
  rpe              NUMERIC(3,1) CHECK (rpe BETWEEN 1 AND 10),
  completed        BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_set_logs_exercise_log_id ON set_logs(exercise_log_id);

-- ============================================================
-- CHECK-INS
-- ============================================================

CREATE TABLE check_in_templates (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id   UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  questions  JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_check_in_templates_coach_id ON check_in_templates(coach_id);

CREATE TABLE check_ins (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id          UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  template_id       UUID REFERENCES check_in_templates(id) ON DELETE SET NULL,
  week_start_date   DATE NOT NULL,
  responses         JSONB DEFAULT '{}'::jsonb,
  sleep_quality     INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  stress_level      INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  soreness_level    INTEGER CHECK (soreness_level BETWEEN 1 AND 5),
  weight            NUMERIC,
  weight_unit       TEXT DEFAULT 'lbs',
  body_photo_urls   TEXT[] DEFAULT '{}',
  notes             TEXT,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at       TIMESTAMPTZ,
  coach_notes       TEXT
);

CREATE INDEX idx_check_ins_client_id ON check_ins(client_id);
CREATE INDEX idx_check_ins_coach_id ON check_ins(coach_id);
CREATE INDEX idx_check_ins_week ON check_ins(client_id, week_start_date DESC);

-- ============================================================
-- AI DRAFTS & ADAPTIVE ENGINE
-- ============================================================

CREATE TABLE ai_drafts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id              UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id             UUID REFERENCES clients(id) ON DELETE SET NULL,
  type                  ai_draft_type NOT NULL,
  status                ai_draft_status NOT NULL DEFAULT 'pending',
  prompt_context        JSONB,
  raw_output            JSONB,
  parsed_content        JSONB,
  coach_notes           TEXT,
  approved_resource_id  UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at           TIMESTAMPTZ
);

CREATE INDEX idx_ai_drafts_coach_id ON ai_drafts(coach_id);
CREATE INDEX idx_ai_drafts_status ON ai_drafts(coach_id, status);

CREATE TABLE adaptive_suggestions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assignment_id   UUID NOT NULL REFERENCES program_assignments(id) ON DELETE CASCADE,
  ai_draft_id     UUID NOT NULL REFERENCES ai_drafts(id) ON DELETE CASCADE,
  suggestion_type suggestion_type NOT NULL,
  target_week     INTEGER,
  rationale       TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adaptive_suggestions_coach_id ON adaptive_suggestions(coach_id);
CREATE INDEX idx_adaptive_suggestions_client_id ON adaptive_suggestions(client_id);

-- ============================================================
-- MESSAGING
-- ============================================================

CREATE TABLE conversations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id         UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at  TIMESTAMPTZ,
  UNIQUE(coach_id, client_id)
);

CREATE INDEX idx_conversations_coach_id ON conversations(coach_id);
CREATE INDEX idx_conversations_client_id ON conversations(client_id);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body             TEXT NOT NULL,
  attachment_urls  TEXT[] DEFAULT '{}',
  read_at          TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(conversation_id, sent_at DESC);

-- ============================================================
-- SESSION BOOKING
-- ============================================================

CREATE TABLE availability_slots (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id          UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  day_of_week       INTEGER[],
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  slot_duration_min INTEGER NOT NULL DEFAULT 60,
  is_active         BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_availability_slots_coach_id ON availability_slots(coach_id);

CREATE TABLE session_bookings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id       UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id      UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  duration_min   INTEGER NOT NULL DEFAULT 60,
  type           TEXT,
  status         booking_status NOT NULL DEFAULT 'pending',
  notes          TEXT,
  meeting_url    TEXT
);

CREATE INDEX idx_session_bookings_coach_id ON session_bookings(coach_id);
CREATE INDEX idx_session_bookings_client_id ON session_bookings(client_id);

-- ============================================================
-- STRIPE
-- ============================================================

CREATE TABLE stripe_subscriptions (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id                 UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  stripe_subscription_id   TEXT NOT NULL UNIQUE,
  stripe_price_id          TEXT,
  status                   TEXT NOT NULL,
  current_period_start     TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stripe_subscriptions_coach_id ON stripe_subscriptions(coach_id);

CREATE TABLE stripe_events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id  TEXT NOT NULL UNIQUE,
  type             TEXT NOT NULL,
  data             JSONB NOT NULL,
  processed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUTURE-PROOF STUBS (schema ready, no UI in V1)
-- ============================================================

CREATE TABLE client_risk_scores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  risk_level  risk_level NOT NULL DEFAULT 'low',
  signals     JSONB DEFAULT '{}'::jsonb,
  scored_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transformations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  before_photo_url  TEXT,
  after_photo_url   TEXT,
  testimonial       TEXT,
  share_token       TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public         BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: updated_at auto-maintenance
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER stripe_subscriptions_updated_at
  BEFORE UPDATE ON stripe_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: auto-create profile on auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
