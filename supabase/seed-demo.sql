-- ============================================================
-- DawFit Demo Seed Data
-- ============================================================
-- Creates a realistic demo coach account for marketing screenshots.
-- Demo coach login: demo@dawfit.app / DawFitDemo2024!
--
-- Run AFTER migrations and seed.sql:
--   psql $DATABASE_URL < supabase/seed.sql
--   psql $DATABASE_URL < supabase/seed-demo.sql
--
-- To reset:
--   DELETE FROM auth.users WHERE email = 'demo@dawfit.app';
-- ============================================================

-- Static UUIDs for demo accounts (predictable for screenshots)
-- Coach:     a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
-- Clients:   c0000000-0000-0000-0000-00000000000{1..8}
-- Programs:  b0000000-0000-0000-0000-00000000000{1..3}

-- ============================================================
-- 1. AUTH USERS
-- ============================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
) VALUES
  -- Demo coach
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '00000000-0000-0000-0000-000000000000',
    'demo@dawfit.app',
    crypt('DawFitDemo2024!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Rivera"}',
    'authenticated', 'authenticated'
  ),
  -- Client 1
  ('c0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','jordan.smith@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Jordan Smith"}','authenticated','authenticated'),
  -- Client 2
  ('c0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','maya.chen@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Maya Chen"}','authenticated','authenticated'),
  -- Client 3
  ('c0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','carlos.diaz@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Carlos Diaz"}','authenticated','authenticated'),
  -- Client 4
  ('c0000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','priya.patel@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Priya Patel"}','authenticated','authenticated'),
  -- Client 5
  ('c0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','sam.johnson@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Sam Johnson"}','authenticated','authenticated'),
  -- Client 6
  ('c0000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','taylor.kim@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Taylor Kim"}','authenticated','authenticated'),
  -- Client 7
  ('c0000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','ryan.murphy@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Ryan Murphy"}','authenticated','authenticated'),
  -- Client 8
  ('c0000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','lisa.torres@example.com',crypt('password',gen_salt('bf')),NOW(),NOW(),NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Lisa Torres"}','authenticated','authenticated')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. PROFILES
-- ============================================================

INSERT INTO profiles (id, role, full_name) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'coach', 'Alex Rivera'),
  ('c0000000-0000-0000-0000-000000000001', 'client', 'Jordan Smith'),
  ('c0000000-0000-0000-0000-000000000002', 'client', 'Maya Chen'),
  ('c0000000-0000-0000-0000-000000000003', 'client', 'Carlos Diaz'),
  ('c0000000-0000-0000-0000-000000000004', 'client', 'Priya Patel'),
  ('c0000000-0000-0000-0000-000000000005', 'client', 'Sam Johnson'),
  ('c0000000-0000-0000-0000-000000000006', 'client', 'Taylor Kim'),
  ('c0000000-0000-0000-0000-000000000007', 'client', 'Ryan Murphy'),
  ('c0000000-0000-0000-0000-000000000008', 'client', 'Lisa Torres')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. COACH
-- ============================================================

INSERT INTO coaches (id, slug, business_name, bio, subscription_tier, subscription_status, onboarded_at) VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'alex-rivera',
    'Rivera Performance',
    'Online strength & conditioning coach specializing in body recomposition and athletic performance.',
    'pro',
    'active',
    NOW() - INTERVAL '90 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. CLIENTS
-- ============================================================

INSERT INTO clients (id, coach_id, status, goals, onboarded_at) VALUES
  ('c0000000-0000-0000-0000-000000000001','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Build lean muscle and improve pull-up strength',NOW()-INTERVAL '82 days'),
  ('c0000000-0000-0000-0000-000000000002','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Lose 15 lbs and improve cardiovascular endurance',NOW()-INTERVAL '74 days'),
  ('c0000000-0000-0000-0000-000000000003','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','active','Improve squat and deadlift numbers for powerlifting meet',NOW()-INTERVAL '61 days'),
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
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '12-Week Hypertrophy Block',
    'Progressive overload program focused on muscle growth. Targets all major muscle groups with an upper/lower split.',
    'active', 12, false, 'manual',
    NOW()-INTERVAL '85 days', NOW()-INTERVAL '5 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Strength Foundation — 8 Weeks',
    'AI-generated powerlifting prep. Emphasizes squat, bench, and deadlift with linear periodization.',
    'active', 8, false, 'ai_approved',
    NOW()-INTERVAL '50 days', NOW()-INTERVAL '2 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Athletic Conditioning — 6 Weeks',
    'Sport-specific conditioning with plyometrics, agility drills, and metabolic work.',
    'active', 6, true, 'manual',
    NOW()-INTERVAL '30 days', NOW()-INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. LEADS (pipeline stages)
-- ============================================================

INSERT INTO leads (id, coach_id, full_name, email, status, goals, source, created_at) VALUES
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Marcus Webb','marcus.webb@example.com','new','Build muscle for wedding in 6 months','apply_page',NOW()-INTERVAL '1 day'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Natalie Osei','natalie.osei@example.com','new','Weight loss after pregnancy','apply_page',NOW()-INTERVAL '2 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Derek Huang','derek.huang@example.com','new','Athletic performance improvement','apply_page',NOW()-INTERVAL '3 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Sofia Reyes','sofia.reyes@example.com','contacted','General health and energy boost','referral',NOW()-INTERVAL '6 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Ben Kowalski','ben.kowalski@example.com','contacted','Powerlifting competition prep','apply_page',NOW()-INTERVAL '8 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Amara Diallo','amara.diallo@example.com','qualified','Body recomposition','instagram',NOW()-INTERVAL '11 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Finn Larsson','finn.larsson@example.com','qualified','Marathon training support','referral',NOW()-INTERVAL '14 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Zoe Nakamura','zoe.nakamura@example.com','converted','Strength and toning','apply_page',NOW()-INTERVAL '20 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Ethan Brooks','ethan.brooks@example.com','rejected','Not a good fit — schedule conflict','apply_page',NOW()-INTERVAL '25 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. PROGRAM ASSIGNMENTS (clients 1–6 each assigned a program)
-- ============================================================

INSERT INTO program_assignments (id, coach_id, client_id, program_id, status, start_date, assigned_at) VALUES
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','active',NOW()-INTERVAL '80 days',NOW()-INTERVAL '80 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','active',NOW()-INTERVAL '70 days',NOW()-INTERVAL '70 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000002','active',NOW()-INTERVAL '48 days',NOW()-INTERVAL '48 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000001','active',NOW()-INTERVAL '44 days',NOW()-INTERVAL '44 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000003','active',NOW()-INTERVAL '30 days',NOW()-INTERVAL '30 days'),
  (uuid_generate_v4(),'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','c0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000003','active',NOW()-INTERVAL '18 days',NOW()-INTERVAL '18 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. WORKOUT LOGS (realistic activity for clients 1–3)
-- ============================================================

-- Client 1 — Jordan Smith (12 weeks of logs, 4x/week pattern)
INSERT INTO workout_logs (id, client_id, logged_at, status, overall_rpe, duration_min) VALUES
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '77 days','completed',7,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '75 days','completed',8,62),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '73 days','completed',6,48),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '70 days','completed',7,58),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '68 days','completed',8,60),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '66 days','completed',7,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '63 days','completed',9,65),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '61 days','completed',7,52),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '56 days','completed',8,60),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '49 days','completed',7,57),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '42 days','completed',8,63),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '35 days','completed',7,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '28 days','completed',8,62),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '21 days','completed',7,59),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '14 days','completed',8,64),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '7 days','completed',7,56),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '3 days','completed',8,61),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',NOW()-INTERVAL '1 day','completed',7,54);

-- Client 2 — Maya Chen (regular 3x/week pattern)
INSERT INTO workout_logs (id, client_id, logged_at, status, overall_rpe, duration_min) VALUES
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '68 days','completed',6,45),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '65 days','completed',7,50),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '61 days','completed',7,48),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '55 days','completed',6,44),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '48 days','completed',7,52),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '41 days','completed',8,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '34 days','completed',7,50),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '27 days','completed',7,47),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '20 days','completed',8,53),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '13 days','completed',7,49),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '6 days','completed',8,55),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',NOW()-INTERVAL '2 days','completed',7,48);

-- Client 3 — Carlos Diaz (powerlifting focus, 4x/week)
INSERT INTO workout_logs (id, client_id, logged_at, status, overall_rpe, duration_min) VALUES
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '44 days','completed',8,75),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '41 days','completed',8,72),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '38 days','completed',9,80),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '35 days','completed',8,78),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '30 days','completed',9,85),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '24 days','completed',8,76),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '17 days','completed',9,82),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '10 days','completed',8,79),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000003',NOW()-INTERVAL '4 days','completed',9,84);

-- ============================================================
-- 9. CHECK-INS (12 weeks for client 1, 10 for client 2)
-- ============================================================

INSERT INTO check_ins (id, client_id, week_start_date, submitted_at, weight, weight_unit, sleep_quality, stress_level, soreness_level, notes) VALUES
  -- Jordan Smith — showing consistent weight loss
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '77 days')::date,NOW()-INTERVAL '76 days',195.2,'lbs',3,3,3,'Feeling good, adapting to the program'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '70 days')::date,NOW()-INTERVAL '69 days',193.8,'lbs',4,2,2,'Energy levels improving'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '63 days')::date,NOW()-INTERVAL '62 days',192.4,'lbs',4,2,2,'Hit a PR on bench press!'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '56 days')::date,NOW()-INTERVAL '55 days',191.1,'lbs',4,3,3,'Tough week at work but stuck to the plan'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '49 days')::date,NOW()-INTERVAL '48 days',190.0,'lbs',4,2,2,'Feeling stronger in the gym'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '42 days')::date,NOW()-INTERVAL '41 days',188.9,'lbs',5,2,1,'Best sleep week in months'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '35 days')::date,NOW()-INTERVAL '34 days',187.5,'lbs',4,3,2,'Visible changes in the mirror'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '28 days')::date,NOW()-INTERVAL '27 days',186.2,'lbs',4,2,2,'Deadlift went up 20 lbs'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '21 days')::date,NOW()-INTERVAL '20 days',185.0,'lbs',5,1,1,'Feeling the best I have in years'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '14 days')::date,NOW()-INTERVAL '13 days',184.1,'lbs',4,2,2,'Down 11 lbs total!'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000001',(NOW()-INTERVAL '7 days')::date,NOW()-INTERVAL '6 days',183.2,'lbs',4,2,2,'Maintaining momentum'),
  -- Maya Chen — steady fat loss
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '70 days')::date,NOW()-INTERVAL '69 days',162.5,'lbs',3,4,2,'Starting fresh, nervous but motivated'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '63 days')::date,NOW()-INTERVAL '62 days',161.0,'lbs',4,3,2,'Cardio is getting easier'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '56 days')::date,NOW()-INTERVAL '55 days',159.8,'lbs',4,3,3,'Slight plateau but staying consistent'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '49 days')::date,NOW()-INTERVAL '48 days',158.4,'lbs',4,2,2,'Broke through the plateau!'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '42 days')::date,NOW()-INTERVAL '41 days',157.0,'lbs',5,2,1,'Clothes fitting better'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '35 days')::date,NOW()-INTERVAL '34 days',155.9,'lbs',4,2,2,'Cardio endurance noticeably better'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '28 days')::date,NOW()-INTERVAL '27 days',154.5,'lbs',4,3,2,'Ran a 5K without stopping!'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '21 days')::date,NOW()-INTERVAL '20 days',153.3,'lbs',5,2,1,'Down 9 lbs, feeling amazing'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '14 days')::date,NOW()-INTERVAL '13 days',152.1,'lbs',4,2,2,'Maintaining good habits'),
  (uuid_generate_v4(),'c0000000-0000-0000-0000-000000000002',(NOW()-INTERVAL '7 days')::date,NOW()-INTERVAL '6 days',151.0,'lbs',5,2,1,'10 lbs down total - huge milestone!');

-- ============================================================
-- 10. AI DRAFTS (pending review)
-- ============================================================

INSERT INTO ai_drafts (id, coach_id, client_id, type, status, content, created_at) VALUES
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0000000-0000-0000-0000-000000000001',
    'adjustment_suggestion',
    'pending',
    '{"suggestion":"Jordan has logged RPE 8+ for 3 consecutive sessions. Consider reducing volume by 15% this week and increasing rest periods to 3 minutes for compound lifts.","confidence":0.87}',
    NOW()-INTERVAL '1 day'
  ),
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0000000-0000-0000-0000-000000000002',
    'check_in_analysis',
    'pending',
    '{"summary":"Maya has lost 10 lbs over 10 weeks (1 lb/week). Sleep score improved from 3 to 5 over the period. Stress remains moderate. Recommend maintaining current caloric deficit and adding one LISS session per week.","highlights":["10 lbs lost","Sleep quality 3→5","Stress trending down"]}',
    NOW()-INTERVAL '6 hours'
  ),
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0000000-0000-0000-0000-000000000003',
    'program',
    'pending',
    '{"program_title":"Peak Phase — Competition Prep","duration_weeks":4,"focus":"Peaking for powerlifting meet. Reduce volume 40%, maintain intensity. Add competition-specific cues."}',
    NOW()-INTERVAL '2 hours'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- Done! Demo coach login: demo@dawfit.app / DawFitDemo2024!
-- ============================================================
