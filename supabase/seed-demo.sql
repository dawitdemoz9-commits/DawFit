-- ============================================================
-- DawFit Demo Seed Data  (Phase 14 — complete rewrite)
-- ============================================================
-- Demo coach login: demo@dawfit.app / DawFitDemo2024!
-- Admin login:      dawit@admin / dawit123
--
-- Run AFTER migrations and seed.sql:
--   psql $DATABASE_URL -f supabase/seed.sql
--   psql $DATABASE_URL -f supabase/seed-demo.sql
--
-- To reset:
--   DELETE FROM auth.users WHERE email IN ('demo@dawfit.app','dawit@admin');
-- ============================================================

-- ============================================================
-- UUID KEY
-- ============================================================
-- Admin:       d0000000-0000-0000-0000-000000000000
-- Coach:       a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
-- Clients:     c0000000-0000-0000-0000-00000000000{1..8}
-- Programs:    b0000000-0000-0000-0000-00000000000{1..3}
-- Weeks:       00000000-0000-0000-{prog:04d}-{week:012d}
-- Workouts:    00000000-0000-{prog:04d}-{week:04d}-{wo:012d}
-- Convs:       00000000-0000-0000-c0a0-{client:012d}

-- ============================================================
-- 1. AUTH USERS
-- ============================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
) VALUES
  -- Admin (Dawit)
  ('d0000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000000','dawit@admin',
   crypt('dawit123',gen_salt('bf')),NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"],"role":"admin"}','{"full_name":"Dawit"}','authenticated','authenticated'),
  -- Demo coach (Austin Rivera)
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0000-000000000000','demo@dawfit.app',
   crypt('DawFitDemo2024!',gen_salt('bf')),NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}','{"full_name":"Austin Rivera"}','authenticated','authenticated'),
  -- Clients
  ('c0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','jordan.smith@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Jordan Smith"}','authenticated','authenticated'),
  ('c0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','maya.chen@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Maya Chen"}','authenticated','authenticated'),
  ('c0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','carlos.diaz@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Carlos Diaz"}','authenticated','authenticated'),
  ('c0000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','priya.patel@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Priya Patel"}','authenticated','authenticated'),
  ('c0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','sam.johnson@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Sam Johnson"}','authenticated','authenticated'),
  ('c0000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','taylor.kim@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Taylor Kim"}','authenticated','authenticated'),
  ('c0000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','ryan.murphy@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Ryan Murphy"}','authenticated','authenticated'),
  ('c0000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','lisa.torres@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Lisa Torres"}','authenticated','authenticated')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. PROFILES
-- ============================================================

INSERT INTO profiles (id, role, full_name) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','coach','Austin Rivera'),
  ('c0000000-0000-0000-0000-000000000001','client','Jordan Smith'),
  ('c0000000-0000-0000-0000-000000000002','client','Maya Chen'),
  ('c0000000-0000-0000-0000-000000000003','client','Carlos Diaz'),
  ('c0000000-0000-0000-0000-000000000004','client','Priya Patel'),
  ('c0000000-0000-0000-0000-000000000005','client','Sam Johnson'),
  ('c0000000-0000-0000-0000-000000000006','client','Taylor Kim'),
  ('c0000000-0000-0000-0000-000000000007','client','Ryan Murphy'),
  ('c0000000-0000-0000-0000-000000000008','client','Lisa Torres')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. COACH
-- ============================================================

INSERT INTO coaches (id, slug, business_name, bio, subscription_tier, subscription_status, onboarded_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','austin-rivera','Rivera Performance',
   'Online strength & conditioning coach specializing in body recomposition and athletic performance.',
   'pro','active',NOW()-INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. CLIENTS
-- ============================================================

INSERT INTO clients (id, coach_id, status, goals, onboarded_at) VALUES
  ('c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Build lean muscle and improve pull-up strength',NOW()-INTERVAL '82 days'),
  ('c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Lose 15 lbs and improve cardiovascular endurance',NOW()-INTERVAL '74 days'),
  ('c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Improve squat and deadlift for powerlifting meet',NOW()-INTERVAL '61 days'),
  ('c0000000-0000-0000-0000-000000000004','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Post-partum fitness — rebuild core strength',NOW()-INTERVAL '48 days'),
  ('c0000000-0000-0000-0000-000000000005','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','General fitness and stress management through movement',NOW()-INTERVAL '35 days'),
  ('c0000000-0000-0000-0000-000000000006','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Athletic conditioning for recreational basketball',NOW()-INTERVAL '22 days'),
  ('c0000000-0000-0000-0000-000000000007','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','paused','Marathon training — on hold due to injury',NOW()-INTERVAL '60 days'),
  ('c0000000-0000-0000-0000-000000000008','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Body recomposition: build muscle, reduce body fat',NOW()-INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. PROGRAMS
-- ============================================================

INSERT INTO programs (id, coach_id, title, description, status, duration_weeks, is_template, source, created_at, updated_at) VALUES
  ('b0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '12-Week Hypertrophy Block',
   'Progressive overload program focused on muscle growth. Upper/lower split with 4 training days per week. Volume increases 5% every two weeks.',
   'active',12,false,'manual',NOW()-INTERVAL '85 days',NOW()-INTERVAL '5 days'),
  ('b0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Strength Foundation — 8 Weeks',
   'AI-generated powerlifting prep. Emphasizes squat, bench, and deadlift with linear periodization. RPE-based loading.',
   'active',8,false,'ai_approved',NOW()-INTERVAL '50 days',NOW()-INTERVAL '2 days'),
  ('b0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Athletic Conditioning — 6 Weeks',
   'Sport-specific conditioning with plyometrics, agility drills, and metabolic work. 3 days per week.',
   'active',6,true,'manual',NOW()-INTERVAL '30 days',NOW()-INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. WEEKS
-- ============================================================

-- Program 1 — 12-Week Hypertrophy (all 12 weeks)
INSERT INTO weeks (id, program_id, week_number, label, notes) VALUES
  ('00000000-0000-0000-0001-000000000001','b0000000-0000-0000-0000-000000000001',1,'Week 1 — Foundation','Establish baseline. Focus on form. RPE 6–7 across all lifts.'),
  ('00000000-0000-0000-0001-000000000002','b0000000-0000-0000-0000-000000000001',2,'Week 2 — Foundation','Same structure, add one set to main compounds.'),
  ('00000000-0000-0000-0001-000000000003','b0000000-0000-0000-0000-000000000001',3,'Week 3 — Accumulation','Volume increases. Push to RPE 7–8 on compounds.'),
  ('00000000-0000-0000-0001-000000000004','b0000000-0000-0000-0000-000000000001',4,'Week 4 — Deload','Reduce volume 40%. Keep intensity. Active recovery.'),
  ('00000000-0000-0000-0001-000000000005','b0000000-0000-0000-0000-000000000001',5,'Week 5 — Intensification','Add 2.5–5 lbs to all main lifts vs Week 1.'),
  ('00000000-0000-0000-0001-000000000006','b0000000-0000-0000-0000-000000000001',6,'Week 6 — Intensification','Continue progressive overload.'),
  ('00000000-0000-0000-0001-000000000007','b0000000-0000-0000-0000-000000000001',7,'Week 7 — Peak Volume','Highest volume block. 4×10–12 on accessories.'),
  ('00000000-0000-0000-0001-000000000008','b0000000-0000-0000-0000-000000000001',8,'Week 8 — Deload','Second deload. Assessment photos due.'),
  ('00000000-0000-0000-0001-000000000009','b0000000-0000-0000-0000-000000000001',9,'Week 9 — Strength Phase','Drop reps, increase load. 3×6–8 main lifts.'),
  ('00000000-0000-0000-0001-000000000010','b0000000-0000-0000-0000-000000000001',10,'Week 10 — Strength Phase','Continue strength phase.'),
  ('00000000-0000-0000-0001-000000000011','b0000000-0000-0000-0000-000000000001',11,'Week 11 — Peak Strength','Max effort. PR week on bench and squat.'),
  ('00000000-0000-0000-0001-000000000012','b0000000-0000-0000-0000-000000000001',12,'Week 12 — Final Deload','Final deload + assessment. Progress photos and measurements.')
ON CONFLICT (program_id, week_number) DO NOTHING;

-- Program 2 — 8-Week Strength Foundation
INSERT INTO weeks (id, program_id, week_number, label, notes) VALUES
  ('00000000-0000-0000-0002-000000000001','b0000000-0000-0000-0000-000000000002',1,'Week 1 — Baseline','Establish working weights. RPE 7 max.'),
  ('00000000-0000-0000-0002-000000000002','b0000000-0000-0000-0000-000000000002',2,'Week 2 — Load','Add 5 lbs to all lifts.'),
  ('00000000-0000-0000-0002-000000000003','b0000000-0000-0000-0000-000000000002',3,'Week 3 — Load','Continue adding load.'),
  ('00000000-0000-0000-0002-000000000004','b0000000-0000-0000-0000-000000000002',4,'Week 4 — Deload','Reduce to 60% of working weights.'),
  ('00000000-0000-0000-0002-000000000005','b0000000-0000-0000-0000-000000000002',5,'Week 5 — Intensification','Back to max with 10 lbs added.'),
  ('00000000-0000-0000-0002-000000000006','b0000000-0000-0000-0000-000000000002',6,'Week 6 — Intensification','Push RPE 8–9.'),
  ('00000000-0000-0000-0002-000000000007','b0000000-0000-0000-0000-000000000002',7,'Week 7 — Peak','Heavy singles. Competition simulation.'),
  ('00000000-0000-0000-0002-000000000008','b0000000-0000-0000-0000-000000000002',8,'Week 8 — Taper','Final prep. Light loads, high CNS readiness.')
ON CONFLICT (program_id, week_number) DO NOTHING;

-- Program 3 — 6-Week Athletic Conditioning
INSERT INTO weeks (id, program_id, week_number, label, notes) VALUES
  ('00000000-0000-0000-0003-000000000001','b0000000-0000-0000-0000-000000000003',1,'Week 1 — Foundation','Movement quality. Aerobic base.'),
  ('00000000-0000-0000-0003-000000000002','b0000000-0000-0000-0000-000000000003',2,'Week 2 — Build','Add plyometric volume.'),
  ('00000000-0000-0000-0003-000000000003','b0000000-0000-0000-0000-000000000003',3,'Week 3 — Build','Speed work introduced.'),
  ('00000000-0000-0000-0003-000000000004','b0000000-0000-0000-0000-000000000003',4,'Week 4 — Peak','Max intensity. Sport-specific drills.'),
  ('00000000-0000-0000-0003-000000000005','b0000000-0000-0000-0000-000000000003',5,'Week 5 — Taper','Reduce volume, maintain intensity.'),
  ('00000000-0000-0000-0003-000000000006','b0000000-0000-0000-0000-000000000003',6,'Week 6 — Performance','Final assessments. Time trials.')
ON CONFLICT (program_id, week_number) DO NOTHING;

-- ============================================================
-- 7. WORKOUTS
-- ============================================================

-- Program 1, Weeks 1–3 (4 workouts each, published)
INSERT INTO workouts (id, coach_id, week_id, title, description, day_of_week, order_index, estimated_duration_min, status) VALUES
  -- Week 1
  ('00000000-0000-0001-0001-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000001','Upper A — Push','Chest, shoulders, triceps. Barbell bench focus.',2,0,55,'published'),
  ('00000000-0000-0001-0001-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000001','Lower A — Squat','Quad-dominant. Back squat and accessories.',3,1,60,'published'),
  ('00000000-0000-0001-0001-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000001','Upper B — Pull','Back, biceps. Barbell row and pull-up focus.',5,2,55,'published'),
  ('00000000-0000-0001-0001-000000000004','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000001','Lower B — Hinge','Hip-dominant. Romanian deadlift and glute work.',6,3,60,'published'),
  -- Week 2
  ('00000000-0000-0001-0002-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000002','Upper A — Push','Same structure as W1. Add 1 set to bench.',2,0,60,'published'),
  ('00000000-0000-0001-0002-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000002','Lower A — Squat','Add 1 set to back squat.',3,1,65,'published'),
  ('00000000-0000-0001-0002-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000002','Upper B — Pull','Add 1 set to barbell row.',5,2,60,'published'),
  ('00000000-0000-0001-0002-000000000004','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000002','Lower B — Hinge','Add hip thrust set.',6,3,65,'published'),
  -- Week 3
  ('00000000-0000-0001-0003-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000003','Upper A — Push (Vol)','Volume day. RPE 7–8 target.',2,0,65,'published'),
  ('00000000-0000-0001-0003-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000003','Lower A — Squat (Vol)','Volume squat day. 4×8 working sets.',3,1,70,'published'),
  ('00000000-0000-0001-0003-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000003','Upper B — Pull (Vol)','Pull volume. Lat pulldown superset.',5,2,65,'published'),
  ('00000000-0000-0001-0003-000000000004','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0001-000000000003','Lower B — Hinge (Vol)','Hip hinge volume. Deadlift AMRAP set.',6,3,70,'published')
ON CONFLICT DO NOTHING;

-- Program 2, Week 1
INSERT INTO workouts (id, coach_id, week_id, title, description, day_of_week, order_index, estimated_duration_min, status) VALUES
  ('00000000-0000-0002-0001-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0002-000000000001','Squat Day','Back squat + front squat + accessories.',2,0,75,'published'),
  ('00000000-0000-0002-0001-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0002-000000000001','Bench Day','Bench press + OHP + triceps.',4,1,70,'published'),
  ('00000000-0000-0002-0001-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0002-000000000001','Deadlift Day','Conventional deadlift + accessories.',6,2,80,'published'),
  ('00000000-0000-0002-0001-000000000004','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0002-000000000001','Accessory Day','GPP + weak point work.',7,3,50,'published')
ON CONFLICT DO NOTHING;

-- Program 3, Week 1
INSERT INTO workouts (id, coach_id, week_id, title, description, day_of_week, order_index, estimated_duration_min, status) VALUES
  ('00000000-0000-0003-0001-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0003-000000000001','Power & Plyometrics','Box jumps, broad jumps, medicine ball work.',2,0,50,'published'),
  ('00000000-0000-0003-0001-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0003-000000000001','Strength & Agility','Compound lifts + ladder drills.',4,1,55,'published'),
  ('00000000-0000-0003-0001-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0000-0003-000000000001','Conditioning','Assault bike intervals + jump rope + core.',6,2,45,'published')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. WORKOUT EXERCISES (P1 W1 — 4 workouts, 5 exercises each)
-- ============================================================

-- Upper A — Push (id: 00000000-0000-0001-0001-000000000001)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, load, rest_seconds, notes)
VALUES
  ('00000000-0000-0001-0001-000000000001',(SELECT id FROM exercises WHERE name='Bench Press' AND coach_id IS NULL LIMIT 1),0,4,'8',NULL,180,'Main press. Use flat grip.'),
  ('00000000-0000-0001-0001-000000000001',(SELECT id FROM exercises WHERE name='Overhead Press' AND coach_id IS NULL LIMIT 1),1,3,'10',NULL,120,'Strict press only. No leg drive.'),
  ('00000000-0000-0001-0001-000000000001',(SELECT id FROM exercises WHERE name='Incline Bench Press' AND coach_id IS NULL LIMIT 1),2,3,'12',NULL,90,'60% of bench weight.'),
  ('00000000-0000-0001-0001-000000000001',(SELECT id FROM exercises WHERE name='Tricep Pushdown' AND coach_id IS NULL LIMIT 1),3,3,'15',NULL,60,'Light cable work.'),
  ('00000000-0000-0001-0001-000000000001',(SELECT id FROM exercises WHERE name='Face Pull' AND coach_id IS NULL LIMIT 1),4,3,'20',NULL,60,'Prehab. Don''t skip this.');

-- Lower A — Squat (id: 00000000-0000-0001-0001-000000000002)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, load, rest_seconds, notes)
VALUES
  ('00000000-0000-0001-0001-000000000002',(SELECT id FROM exercises WHERE name='Back Squat' AND coach_id IS NULL LIMIT 1),0,4,'8',NULL,180,'Bar low. Depth below parallel.'),
  ('00000000-0000-0001-0001-000000000002',(SELECT id FROM exercises WHERE name='Romanian Deadlift' AND coach_id IS NULL LIMIT 1),1,3,'12',NULL,120,'Hip hinge. Feel the stretch.'),
  ('00000000-0000-0001-0001-000000000002',(SELECT id FROM exercises WHERE name='Bulgarian Split Squat' AND coach_id IS NULL LIMIT 1),2,3,'10',NULL,90,'Per leg. Match left/right.'),
  ('00000000-0000-0001-0001-000000000002',(SELECT id FROM exercises WHERE name='Hip Thrust' AND coach_id IS NULL LIMIT 1),3,3,'15',NULL,60,'Full glute squeeze at top.'),
  ('00000000-0000-0001-0001-000000000002',(SELECT id FROM exercises WHERE name='Plank' AND coach_id IS NULL LIMIT 1),4,3,'60s',NULL,60,'Core stability. Neutral spine.');

-- Upper B — Pull (id: 00000000-0000-0001-0001-000000000003)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, load, rest_seconds, notes)
VALUES
  ('00000000-0000-0001-0001-000000000003',(SELECT id FROM exercises WHERE name='Barbell Row' AND coach_id IS NULL LIMIT 1),0,4,'8',NULL,180,'Pronated grip. Pull to belly button.'),
  ('00000000-0000-0001-0001-000000000003',(SELECT id FROM exercises WHERE name='Pull-Up' AND coach_id IS NULL LIMIT 1),1,4,'6',NULL,150,'Weighted if 6 is too easy.'),
  ('00000000-0000-0001-0001-000000000003',(SELECT id FROM exercises WHERE name='Lat Pulldown' AND coach_id IS NULL LIMIT 1),2,3,'12',NULL,90,'Superset with cable row.'),
  ('00000000-0000-0001-0001-000000000003',(SELECT id FROM exercises WHERE name='Cable Row' AND coach_id IS NULL LIMIT 1),3,3,'15',NULL,60,'Superset with lat pulldown.'),
  ('00000000-0000-0001-0001-000000000003',(SELECT id FROM exercises WHERE name='Dumbbell Curl' AND coach_id IS NULL LIMIT 1),4,3,'12',NULL,60,'Finish. Control the eccentric.');

-- Lower B — Hinge (id: 00000000-0000-0001-0001-000000000004)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, load, rest_seconds, notes)
VALUES
  ('00000000-0000-0001-0001-000000000004',(SELECT id FROM exercises WHERE name='Conventional Deadlift' AND coach_id IS NULL LIMIT 1),0,4,'5',NULL,210,'Heavy. RPE 8 on last set.'),
  ('00000000-0000-0001-0001-000000000004',(SELECT id FROM exercises WHERE name='Sumo Deadlift' AND coach_id IS NULL LIMIT 1),1,3,'8',NULL,150,'Lighter than conventional. Technique focus.'),
  ('00000000-0000-0001-0001-000000000004',(SELECT id FROM exercises WHERE name='Hip Thrust' AND coach_id IS NULL LIMIT 1),2,3,'12',NULL,90,'Add band around knees.'),
  ('00000000-0000-0001-0001-000000000004',(SELECT id FROM exercises WHERE name='Romanian Deadlift' AND coach_id IS NULL LIMIT 1),3,3,'15',NULL,60,'Light. Hamstring focus.'),
  ('00000000-0000-0001-0001-000000000004',(SELECT id FROM exercises WHERE name='Plank' AND coach_id IS NULL LIMIT 1),4,3,'45s',NULL,60,'Brace hard.');

-- Program 2, Squat Day exercises
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, load, rest_seconds, notes)
VALUES
  ('00000000-0000-0002-0001-000000000001',(SELECT id FROM exercises WHERE name='Back Squat' AND coach_id IS NULL LIMIT 1),0,5,'5',NULL,240,'Work up to RPE 8.'),
  ('00000000-0000-0002-0001-000000000001',(SELECT id FROM exercises WHERE name='Front Squat' AND coach_id IS NULL LIMIT 1),1,3,'5',NULL,180,'60% of back squat.'),
  ('00000000-0000-0002-0001-000000000001',(SELECT id FROM exercises WHERE name='Romanian Deadlift' AND coach_id IS NULL LIMIT 1),2,4,'8',NULL,120,'Accessory.'),
  ('00000000-0000-0002-0001-000000000001',(SELECT id FROM exercises WHERE name='Bulgarian Split Squat' AND coach_id IS NULL LIMIT 1),3,3,'10',NULL,90,'Unilateral balance.');

-- ============================================================
-- 9. LEADS (FIXED — no goals column on leads table)
-- ============================================================

INSERT INTO leads (id, coach_id, full_name, email, status, source, created_at) VALUES
  ('aaaa0001-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Marcus Webb','marcus.webb@example.com','new','apply_page',NOW()-INTERVAL '1 day'),
  ('aaaa0002-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Natalie Osei','natalie.osei@example.com','new','apply_page',NOW()-INTERVAL '2 days'),
  ('aaaa0003-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Derek Huang','derek.huang@example.com','new','apply_page',NOW()-INTERVAL '3 days'),
  ('aaaa0004-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Sofia Reyes','sofia.reyes@example.com','contacted','referral',NOW()-INTERVAL '6 days'),
  ('aaaa0005-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Ben Kowalski','ben.kowalski@example.com','contacted','apply_page',NOW()-INTERVAL '8 days'),
  ('aaaa0006-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Amara Diallo','amara.diallo@example.com','qualified','instagram',NOW()-INTERVAL '11 days'),
  ('aaaa0007-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Finn Larsson','finn.larsson@example.com','qualified','referral',NOW()-INTERVAL '14 days'),
  ('aaaa0008-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Zoe Nakamura','zoe.nakamura@example.com','converted','apply_page',NOW()-INTERVAL '20 days'),
  ('aaaa0009-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Ethan Brooks','ethan.brooks@example.com','rejected','apply_page',NOW()-INTERVAL '25 days')
ON CONFLICT DO NOTHING;

-- Lead applications (goals/details go here, not on leads table)
INSERT INTO lead_applications (lead_id, coach_id, goals, experience_level, availability, budget_range, submitted_at) VALUES
  ('aaaa0001-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Build muscle for wedding in 6 months','intermediate','3 days/week','$100-200/mo',NOW()-INTERVAL '1 day'),
  ('aaaa0002-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Weight loss after pregnancy','beginner','4 days/week','$100-200/mo',NOW()-INTERVAL '2 days'),
  ('aaaa0003-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Athletic performance for competitive tennis','advanced','5 days/week','$200+/mo',NOW()-INTERVAL '3 days'),
  ('aaaa0006-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Body recomposition over 6 months','intermediate','4 days/week','$200+/mo',NOW()-INTERVAL '11 days'),
  ('aaaa0007-0000-0000-0000-000000000000','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Marathon training and strength support','advanced','6 days/week','$200+/mo',NOW()-INTERVAL '14 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. PROGRAM ASSIGNMENTS
-- ============================================================

INSERT INTO program_assignments (id, coach_id, client_id, program_id, status, start_date, assigned_at) VALUES
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','active',(NOW()-INTERVAL '80 days')::date,NOW()-INTERVAL '80 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','active',(NOW()-INTERVAL '70 days')::date,NOW()-INTERVAL '70 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000002','active',(NOW()-INTERVAL '48 days')::date,NOW()-INTERVAL '48 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000001','active',(NOW()-INTERVAL '44 days')::date,NOW()-INTERVAL '44 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000003','active',(NOW()-INTERVAL '30 days')::date,NOW()-INTERVAL '30 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000003','active',(NOW()-INTERVAL '18 days')::date,NOW()-INTERVAL '18 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. CONVERSATIONS + MESSAGES
-- ============================================================

INSERT INTO conversations (id, coach_id, client_id, created_at, last_message_at) VALUES
  ('00000000-0000-0000-c0a0-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '80 days',NOW()-INTERVAL '1 day'),
  ('00000000-0000-0000-c0a0-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '70 days',NOW()-INTERVAL '2 days'),
  ('00000000-0000-0000-c0a0-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '61 days',NOW()-INTERVAL '4 days')
ON CONFLICT (coach_id, client_id) DO NOTHING;

-- Jordan Smith <> Austin Rivera messages
INSERT INTO messages (conversation_id, sender_id, body, read_at, sent_at) VALUES
  ('00000000-0000-0000-c0a0-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Hey Jordan! Your program has been set up. Week 1 focuses on establishing your baseline — keep RPE at 6–7 for all main lifts. Let me know if you have any questions before your first session.',NOW()-INTERVAL '79 days',NOW()-INTERVAL '79 days'),
  ('00000000-0000-0000-c0a0-000000000001','c0000000-0000-0000-0000-000000000001','Thanks Austin! Just finished Upper A. Bench felt good at 155 lbs × 4×8. Should I go heavier next week?',NOW()-INTERVAL '77 days',NOW()-INTERVAL '77 days'),
  ('00000000-0000-0000-c0a0-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Great session! Yes — if RPE was under 7, add 5 lbs to next week. You''re progressing well. Also noticed your check-in weight is down — keep up the nutrition work!',NOW()-INTERVAL '76 days',NOW()-INTERVAL '76 days'),
  ('00000000-0000-0000-c0a0-000000000001','c0000000-0000-0000-0000-000000000001','Will do. Down 11 lbs total now. Feeling stronger every week.',NOW()-INTERVAL '14 days',NOW()-INTERVAL '14 days'),
  ('00000000-0000-0000-c0a0-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Jordan — incredible progress. 11 lbs in 10 weeks AND strength going up. This is exactly what body recomposition looks like. Keep the check-ins coming, I want to catch your Week 12 photos 💪',NULL,NOW()-INTERVAL '1 day');

-- Maya Chen <> Austin Rivera messages
INSERT INTO messages (conversation_id, sender_id, body, read_at, sent_at) VALUES
  ('00000000-0000-0000-c0a0-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Welcome Maya! I''ve reviewed your goals and set up your 12-week program. First priority is building your aerobic base while we work on body composition. Check in every Sunday.',NOW()-INTERVAL '69 days',NOW()-INTERVAL '69 days'),
  ('00000000-0000-0000-c0a0-000000000002','c0000000-0000-0000-0000-000000000002','Thank you! I completed my first week. The cardio sessions are tough but I can already feel the difference. Down 1.5 lbs this week!',NOW()-INTERVAL '62 days',NOW()-INTERVAL '62 days'),
  ('00000000-0000-0000-c0a0-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Amazing start Maya! 1.5 lbs/week is the perfect pace — sustainable and healthy. Your sleep score from check-in was 4/5 which is great. Keep that up.',NOW()-INTERVAL '61 days',NOW()-INTERVAL '61 days'),
  ('00000000-0000-0000-c0a0-000000000002','c0000000-0000-0000-0000-000000000002','Austin, I hit 10 lbs down today! Can''t believe how much better I feel. The check-in form really helps me stay accountable.',NULL,NOW()-INTERVAL '2 days');

-- Carlos Diaz <> Austin Rivera messages
INSERT INTO messages (conversation_id, sender_id, body, read_at, sent_at) VALUES
  ('00000000-0000-0000-c0a0-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Carlos, your strength program is ready. We''re running an 8-week linear progression block before the meet. Squats on Monday, bench Wednesday, deadlift Friday.',NOW()-INTERVAL '60 days',NOW()-INTERVAL '60 days'),
  ('00000000-0000-0000-c0a0-000000000003','c0000000-0000-0000-0000-000000000003','Perfect. Just hit a 315 squat today. That''s a 20 lb PR from last month!',NOW()-INTERVAL '30 days',NOW()-INTERVAL '30 days'),
  ('00000000-0000-0000-c0a0-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','315 squat 🔥 That''s huge Carlos. At this pace you''re on track for a 330 at the meet. Keep the RPE under 9 in training — save the max for the platform.',NULL,NOW()-INTERVAL '4 days');

-- ============================================================
-- 12. WORKOUT LOGS (FIXED — added coach_id)
-- ============================================================

-- Jordan Smith — 18 sessions over ~80 days
INSERT INTO workout_logs (id, client_id, coach_id, workout_id, logged_at, status, overall_rpe, duration_min) VALUES
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0001-000000000001',NOW()-INTERVAL '77 days','completed',7,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0001-000000000002',NOW()-INTERVAL '75 days','completed',8,62),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0001-000000000003',NOW()-INTERVAL '73 days','completed',6,48),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0001-000000000004',NOW()-INTERVAL '70 days','completed',7,58),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0002-000000000001',NOW()-INTERVAL '68 days','completed',8,60),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0002-000000000002',NOW()-INTERVAL '66 days','completed',7,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0002-000000000003',NOW()-INTERVAL '63 days','completed',9,65),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0002-000000000004',NOW()-INTERVAL '61 days','completed',7,52),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0003-000000000001',NOW()-INTERVAL '56 days','completed',8,60),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0003-000000000002',NOW()-INTERVAL '49 days','completed',7,57),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0003-000000000003',NOW()-INTERVAL '42 days','completed',8,63),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0003-000000000004',NOW()-INTERVAL '35 days','completed',7,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0001-000000000001',NOW()-INTERVAL '28 days','completed',8,62),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0001-000000000002',NOW()-INTERVAL '21 days','completed',7,59),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0001-000000000003',NOW()-INTERVAL '14 days','completed',8,64),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0001-000000000004',NOW()-INTERVAL '7 days','completed',7,56),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0002-000000000001',NOW()-INTERVAL '3 days','completed',8,61),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0001-0002-000000000002',NOW()-INTERVAL '1 day','completed',7,54);

-- Maya Chen — 12 sessions
INSERT INTO workout_logs (id, client_id, coach_id, logged_at, status, overall_rpe, duration_min) VALUES
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '68 days','completed',6,45),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '65 days','completed',7,50),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '61 days','completed',7,48),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '55 days','completed',6,44),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '48 days','completed',7,52),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '41 days','completed',8,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '34 days','completed',7,50),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '27 days','completed',7,47),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '20 days','completed',8,53),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '13 days','completed',7,49),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '6 days','completed',8,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',NOW()-INTERVAL '2 days','completed',7,48);

-- Carlos Diaz — 9 sessions
INSERT INTO workout_logs (id, client_id, coach_id, workout_id, logged_at, status, overall_rpe, duration_min) VALUES
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000001',NOW()-INTERVAL '44 days','completed',8,75),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000002',NOW()-INTERVAL '41 days','completed',8,72),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000003',NOW()-INTERVAL '38 days','completed',9,80),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000001',NOW()-INTERVAL '35 days','completed',8,78),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000002',NOW()-INTERVAL '30 days','completed',9,85),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000003',NOW()-INTERVAL '24 days','completed',8,76),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000001',NOW()-INTERVAL '17 days','completed',9,82),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000002',NOW()-INTERVAL '10 days','completed',8,79),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','00000000-0000-0002-0001-000000000003',NOW()-INTERVAL '4 days','completed',9,84);

-- ============================================================
-- 13. CHECK-INS (FIXED — added coach_id)
-- ============================================================

-- Jordan Smith — 11 check-ins (195 → 183 lbs transformation)
INSERT INTO check_ins (id, client_id, coach_id, week_start_date, submitted_at, weight, weight_unit, sleep_quality, stress_level, soreness_level, notes) VALUES
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '77 days')::date,NOW()-INTERVAL '76 days',195.2,'lbs',3,3,3,'Feeling good, adapting to the program'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '70 days')::date,NOW()-INTERVAL '69 days',193.8,'lbs',4,2,2,'Energy levels improving'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '63 days')::date,NOW()-INTERVAL '62 days',192.4,'lbs',4,2,2,'Hit a PR on bench press!'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '56 days')::date,NOW()-INTERVAL '55 days',191.1,'lbs',4,3,3,'Tough week at work but stuck to the plan'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '49 days')::date,NOW()-INTERVAL '48 days',190.0,'lbs',4,2,2,'Feeling stronger in the gym'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '42 days')::date,NOW()-INTERVAL '41 days',188.9,'lbs',5,2,1,'Best sleep week in months'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '35 days')::date,NOW()-INTERVAL '34 days',187.5,'lbs',4,3,2,'Visible changes in the mirror'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '28 days')::date,NOW()-INTERVAL '27 days',186.2,'lbs',4,2,2,'Deadlift went up 20 lbs'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '21 days')::date,NOW()-INTERVAL '20 days',185.0,'lbs',5,1,1,'Feeling the best I have in years'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '14 days')::date,NOW()-INTERVAL '13 days',184.1,'lbs',4,2,2,'Down 11 lbs total!'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '7 days')::date,NOW()-INTERVAL '6 days',183.2,'lbs',4,2,2,'Maintaining momentum. 12 lbs down total.');

-- Maya Chen — 10 check-ins (162 → 151 lbs)
INSERT INTO check_ins (id, client_id, coach_id, week_start_date, submitted_at, weight, weight_unit, sleep_quality, stress_level, soreness_level, notes) VALUES
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '70 days')::date,NOW()-INTERVAL '69 days',162.5,'lbs',3,4,2,'Starting fresh, nervous but motivated'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '63 days')::date,NOW()-INTERVAL '62 days',161.0,'lbs',4,3,2,'Cardio is getting easier'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '56 days')::date,NOW()-INTERVAL '55 days',159.8,'lbs',4,3,3,'Slight plateau but staying consistent'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '49 days')::date,NOW()-INTERVAL '48 days',158.4,'lbs',4,2,2,'Broke through the plateau!'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '42 days')::date,NOW()-INTERVAL '41 days',157.0,'lbs',5,2,1,'Clothes fitting better'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '35 days')::date,NOW()-INTERVAL '34 days',155.9,'lbs',4,2,2,'Cardio endurance noticeably better'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '28 days')::date,NOW()-INTERVAL '27 days',154.5,'lbs',4,3,2,'Ran a 5K without stopping!'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '21 days')::date,NOW()-INTERVAL '20 days',153.3,'lbs',5,2,1,'Down 9 lbs, feeling amazing'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '14 days')::date,NOW()-INTERVAL '13 days',152.1,'lbs',4,2,2,'Maintaining good habits'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',(NOW()-INTERVAL '7 days')::date,NOW()-INTERVAL '6 days',151.0,'lbs',5,2,1,'10 lbs down total — huge milestone!');

-- ============================================================
-- 14. TRANSFORMATION MILESTONE
-- Jordan Smith: 195.2 lbs → 183.2 lbs (-12 lbs in 11 weeks)
-- Captured via coach_notes on the Week 11 check-in query above.
-- The weight trend in check_ins IS the transformation record.
-- Additional coach note added to the Week 7 check-in for milestone flag.
-- ============================================================

UPDATE check_ins
SET coach_notes = 'TRANSFORMATION MILESTONE — Week 7: Jordan is down 8 lbs in 7 weeks while bench, squat, and deadlift are all up. Body recomposition in action. Before: 195 lbs, soft midsection, struggled with 3 pull-ups. Now: 187.5 lbs, visible shoulder/arm definition, hitting 8 clean pull-ups. On track for 12 lb total loss by end of program.'
WHERE client_id = 'c0000000-0000-0000-0000-000000000001'
  AND week_start_date = (NOW()-INTERVAL '35 days')::date;

-- ============================================================
-- 15. AI DRAFTS (FIXED — parsed_content not content)
-- ============================================================

INSERT INTO ai_drafts (id, coach_id, client_id, type, status, parsed_content, created_at) VALUES
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000001',
   'adjustment_suggestion','pending',
   '{"suggestion":"Jordan has logged RPE 8+ for 3 consecutive sessions. Consider reducing volume by 15% this week and increasing rest periods to 3 minutes for compound lifts.","confidence":0.87,"data_points":["RPE 8 - Nov 14","RPE 8 - Nov 17","RPE 9 - Nov 19"]}',
   NOW()-INTERVAL '1 day'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000002',
   'check_in_analysis','pending',
   '{"summary":"Maya has lost 10 lbs over 10 weeks (1 lb/week). Sleep score improved from 3 to 5. Stress trending down. Recommend maintaining current caloric deficit and adding one LISS session per week.","highlights":["10 lbs lost in 10 weeks","Sleep quality 3 → 5","Stress score 4 → 2"]}',
   NOW()-INTERVAL '6 hours'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000003',
   'program','pending',
   '{"program_title":"Peak Phase — Competition Prep","duration_weeks":4,"focus":"Peaking for powerlifting meet. Reduce volume 40%, maintain intensity. Add competition-specific cues and attempt selection.","weeks":[{"week":1,"theme":"Volume reduction"},{"week":2,"theme":"Intensity peak"},{"week":3,"theme":"Simulation"},{"week":4,"theme":"Taper"}]}',
   NOW()-INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Done!
-- Demo coach:  demo@dawfit.app / DawFitDemo2024!
-- Admin:       dawit@admin / dawit123
-- Test client: jordan.smith@example.com / password
-- ============================================================
