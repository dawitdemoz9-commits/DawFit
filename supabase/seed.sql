-- ============================================================
-- DawFit Seed Data — Platform Default Exercises
-- Run after migrations to populate exercise library
-- ============================================================

INSERT INTO exercises (id, coach_id, name, description, category, muscle_groups, equipment, is_public)
VALUES
  -- Strength Compounds
  (uuid_generate_v4(), NULL, 'Back Squat', 'Barbell back squat', 'strength', ARRAY['quads', 'glutes', 'hamstrings', 'core'], ARRAY['barbell', 'rack'], true),
  (uuid_generate_v4(), NULL, 'Front Squat', 'Barbell front squat', 'strength', ARRAY['quads', 'glutes', 'core'], ARRAY['barbell', 'rack'], true),
  (uuid_generate_v4(), NULL, 'Romanian Deadlift', 'Hip hinge with barbell', 'strength', ARRAY['hamstrings', 'glutes', 'lower_back'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Conventional Deadlift', 'Standard barbell deadlift', 'strength', ARRAY['hamstrings', 'glutes', 'lower_back', 'traps'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Sumo Deadlift', 'Wide stance barbell deadlift', 'strength', ARRAY['hamstrings', 'glutes', 'adductors'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Bench Press', 'Flat barbell bench press', 'strength', ARRAY['chest', 'triceps', 'front_delt'], ARRAY['barbell', 'bench'], true),
  (uuid_generate_v4(), NULL, 'Incline Bench Press', 'Incline barbell press', 'strength', ARRAY['upper_chest', 'triceps', 'front_delt'], ARRAY['barbell', 'incline_bench'], true),
  (uuid_generate_v4(), NULL, 'Overhead Press', 'Standing barbell press', 'strength', ARRAY['shoulders', 'triceps', 'upper_chest'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Barbell Row', 'Bent-over barbell row', 'strength', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Pull-Up', 'Bodyweight pull-up', 'strength', ARRAY['lats', 'biceps', 'core'], ARRAY['pull_up_bar'], true),
  (uuid_generate_v4(), NULL, 'Chin-Up', 'Supinated grip pull-up', 'strength', ARRAY['lats', 'biceps'], ARRAY['pull_up_bar'], true),
  (uuid_generate_v4(), NULL, 'Dip', 'Parallel bar dips', 'strength', ARRAY['triceps', 'chest', 'front_delt'], ARRAY['dip_bar'], true),
  (uuid_generate_v4(), NULL, 'Hip Thrust', 'Barbell hip thrust', 'strength', ARRAY['glutes', 'hamstrings'], ARRAY['barbell', 'bench'], true),
  (uuid_generate_v4(), NULL, 'Bulgarian Split Squat', 'Rear-foot elevated split squat', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['dumbbell', 'bench'], true),
  -- Accessories
  (uuid_generate_v4(), NULL, 'Dumbbell Curl', 'Alternating dumbbell curl', 'strength', ARRAY['biceps'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Tricep Pushdown', 'Cable tricep pushdown', 'strength', ARRAY['triceps'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Lat Pulldown', 'Cable lat pulldown', 'strength', ARRAY['lats', 'biceps'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Cable Row', 'Seated cable row', 'strength', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Face Pull', 'Cable face pull', 'strength', ARRAY['rear_delt', 'rotator_cuff'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Plank', 'Standard plank hold', 'core', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], true),
  -- Cardio
  (uuid_generate_v4(), NULL, 'Treadmill Run', 'Treadmill steady-state run', 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY['treadmill'], true),
  (uuid_generate_v4(), NULL, 'Rowing Machine', 'Concept2 rowing ergometer', 'cardio', ARRAY['back', 'legs', 'cardiovascular'], ARRAY['rower'], true),
  (uuid_generate_v4(), NULL, 'Assault Bike', 'Air bike sprint intervals', 'cardio', ARRAY['legs', 'shoulders', 'cardiovascular'], ARRAY['assault_bike'], true),
  (uuid_generate_v4(), NULL, 'Jump Rope', 'Jump rope skipping', 'cardio', ARRAY['calves', 'cardiovascular'], ARRAY['jump_rope'], true);
