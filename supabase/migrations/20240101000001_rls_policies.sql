-- ============================================================
-- DawFit RLS Policies
-- All data access enforced at the database layer
-- ============================================================

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's coach_id
-- (For clients: returns their coach_id. For coaches: returns their own id.)
CREATE OR REPLACE FUNCTION get_my_coach_id()
RETURNS UUID AS $$
  SELECT CASE
    WHEN (SELECT role FROM profiles WHERE id = auth.uid()) = 'coach'
      THEN auth.uid()
    WHEN (SELECT role FROM profiles WHERE id = auth.uid()) = 'client'
      THEN (SELECT coach_id FROM clients WHERE id = auth.uid())
    ELSE NULL
  END;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: users can read their own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: coaches can read their clients"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = profiles.id
      AND clients.coach_id = auth.uid()
    )
  );

CREATE POLICY "profiles: users can update their own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: service role can insert"
  ON profiles FOR INSERT
  WITH CHECK (true);  -- Controlled via service role / trigger

-- ============================================================
-- COACHES
-- ============================================================

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaches: coaches can read their own"
  ON coaches FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "coaches: clients can read their coach"
  ON coaches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.coach_id = coaches.id
      AND clients.id = auth.uid()
    )
  );

CREATE POLICY "coaches: public can read for apply page"
  ON coaches FOR SELECT
  USING (true);  -- slug/brand info is public for lead capture page

CREATE POLICY "coaches: coaches can update their own"
  ON coaches FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "coaches: insert during signup"
  ON coaches FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- CLIENTS
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients: coaches can manage their own clients"
  ON clients FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "clients: clients can read their own record"
  ON clients FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "clients: clients can update their own record"
  ON clients FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- LEADS
-- ============================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads: coaches can manage their own leads"
  ON leads FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Leads can be inserted by anonymous users (application form)
CREATE POLICY "leads: anyone can insert via application"
  ON leads FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- LEAD APPLICATIONS
-- ============================================================

ALTER TABLE lead_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_applications: coaches can read their own"
  ON lead_applications FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "lead_applications: anyone can insert"
  ON lead_applications FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- EXERCISES
-- ============================================================

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Coaches can see their own exercises + platform defaults (coach_id IS NULL)
CREATE POLICY "exercises: coaches see own + platform"
  ON exercises FOR SELECT
  USING (
    coach_id IS NULL
    OR coach_id = auth.uid()
    OR (
      is_public = true
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    )
  );

-- Clients can see their coach's exercises + platform defaults
CREATE POLICY "exercises: clients see their coach's + platform"
  ON exercises FOR SELECT
  USING (
    coach_id IS NULL
    OR coach_id = get_my_coach_id()
  );

CREATE POLICY "exercises: coaches can manage their own"
  ON exercises FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- ============================================================
-- PROGRAMS
-- ============================================================

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "programs: coaches can manage their own"
  ON programs FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "programs: clients can read assigned programs"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_assignments pa
      WHERE pa.program_id = programs.id
      AND pa.client_id = auth.uid()
    )
  );

-- ============================================================
-- PROGRAM ASSIGNMENTS
-- ============================================================

ALTER TABLE program_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments: coaches can manage their own"
  ON program_assignments FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "assignments: clients can read their own"
  ON program_assignments FOR SELECT
  USING (client_id = auth.uid());

-- ============================================================
-- WEEKS
-- ============================================================

ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weeks: coaches can manage their programs' weeks"
  ON weeks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = weeks.program_id
      AND programs.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = weeks.program_id
      AND programs.coach_id = auth.uid()
    )
  );

CREATE POLICY "weeks: clients can read assigned program weeks"
  ON weeks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      JOIN program_assignments pa ON pa.program_id = p.id
      WHERE p.id = weeks.program_id
      AND pa.client_id = auth.uid()
    )
  );

-- ============================================================
-- WORKOUTS
-- ============================================================

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workouts: coaches can manage their own"
  ON workouts FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "workouts: clients can read their coach's published workouts"
  ON workouts FOR SELECT
  USING (
    status = 'published'
    AND coach_id = get_my_coach_id()
    AND (
      week_id IS NULL
      OR EXISTS (
        SELECT 1 FROM weeks w
        JOIN programs p ON p.id = w.program_id
        JOIN program_assignments pa ON pa.program_id = p.id
        WHERE w.id = workouts.week_id
        AND pa.client_id = auth.uid()
      )
    )
  );

-- ============================================================
-- WORKOUT EXERCISES
-- ============================================================

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_exercises: coaches can manage"
  ON workout_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.coach_id = auth.uid()
    )
  );

CREATE POLICY "workout_exercises: clients can read"
  ON workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts w
      WHERE w.id = workout_exercises.workout_id
      AND w.coach_id = get_my_coach_id()
    )
  );

-- ============================================================
-- WORKOUT LOGS
-- ============================================================

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_logs: coaches can read their clients' logs"
  ON workout_logs FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "workout_logs: clients can manage their own logs"
  ON workout_logs FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ============================================================
-- EXERCISE LOGS
-- ============================================================

ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_logs: coaches can read"
  ON exercise_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs wl
      WHERE wl.id = exercise_logs.workout_log_id
      AND wl.coach_id = auth.uid()
    )
  );

CREATE POLICY "exercise_logs: clients can manage their own"
  ON exercise_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs wl
      WHERE wl.id = exercise_logs.workout_log_id
      AND wl.client_id = auth.uid()
    )
  );

-- ============================================================
-- SET LOGS
-- ============================================================

ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "set_logs: coaches can read"
  ON set_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs el
      JOIN workout_logs wl ON wl.id = el.workout_log_id
      WHERE el.id = set_logs.exercise_log_id
      AND wl.coach_id = auth.uid()
    )
  );

CREATE POLICY "set_logs: clients can manage their own"
  ON set_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs el
      JOIN workout_logs wl ON wl.id = el.workout_log_id
      WHERE el.id = set_logs.exercise_log_id
      AND wl.client_id = auth.uid()
    )
  );

-- ============================================================
-- CHECK-IN TEMPLATES
-- ============================================================

ALTER TABLE check_in_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "check_in_templates: coaches manage their own"
  ON check_in_templates FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- ============================================================
-- CHECK-INS
-- ============================================================

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "check_ins: coaches can read their clients' check-ins"
  ON check_ins FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "check_ins: coaches can update (add notes)"
  ON check_ins FOR UPDATE
  USING (coach_id = auth.uid());

CREATE POLICY "check_ins: clients can manage their own"
  ON check_ins FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ============================================================
-- AI DRAFTS
-- ============================================================

ALTER TABLE ai_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_drafts: coaches can manage their own"
  ON ai_drafts FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- ============================================================
-- ADAPTIVE SUGGESTIONS
-- ============================================================

ALTER TABLE adaptive_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adaptive_suggestions: coaches can manage their own"
  ON adaptive_suggestions FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- ============================================================
-- CONVERSATIONS
-- ============================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations: coaches can read their own"
  ON conversations FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "conversations: clients can read their own"
  ON conversations FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "conversations: coaches can insert"
  ON conversations FOR INSERT
  WITH CHECK (coach_id = auth.uid());

-- ============================================================
-- MESSAGES
-- ============================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages: participants can read"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.coach_id = auth.uid() OR c.client_id = auth.uid())
    )
  );

CREATE POLICY "messages: participants can insert"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.coach_id = auth.uid() OR c.client_id = auth.uid())
    )
  );

CREATE POLICY "messages: participants can update read_at"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.coach_id = auth.uid() OR c.client_id = auth.uid())
    )
  );

-- ============================================================
-- AVAILABILITY SLOTS
-- ============================================================

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_slots: coaches manage their own"
  ON availability_slots FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "availability_slots: clients can read their coach's"
  ON availability_slots FOR SELECT
  USING (coach_id = get_my_coach_id() AND is_active = true);

-- ============================================================
-- SESSION BOOKINGS
-- ============================================================

ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_bookings: coaches can manage their own"
  ON session_bookings FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "session_bookings: clients can read and insert their own"
  ON session_bookings FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "session_bookings: clients can book"
  ON session_bookings FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND coach_id = get_my_coach_id()
  );

-- ============================================================
-- STRIPE SUBSCRIPTIONS
-- ============================================================

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_subscriptions: coaches can read their own"
  ON stripe_subscriptions FOR SELECT
  USING (coach_id = auth.uid());

-- Only service role can insert/update stripe data (via webhook handler)

-- ============================================================
-- STRIPE EVENTS
-- ============================================================

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Only service role accesses this table

-- ============================================================
-- FUTURE-PROOF STUBS
-- ============================================================

ALTER TABLE client_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_risk_scores: coaches can manage"
  ON client_risk_scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_risk_scores.client_id
      AND clients.coach_id = auth.uid()
    )
  );

ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transformations: coaches can manage"
  ON transformations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = transformations.client_id
      AND clients.coach_id = auth.uid()
    )
  );

CREATE POLICY "transformations: clients can read their own"
  ON transformations FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "transformations: public can read public ones"
  ON transformations FOR SELECT
  USING (is_public = true);
