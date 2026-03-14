-- ============================================================
-- DawFit Seed Data — Platform Default Exercises
-- Run after migrations to populate exercise library
-- ============================================================

INSERT INTO exercises (id, coach_id, name, description, category, muscle_groups, equipment, is_public)
VALUES

  -- ===================== STRENGTH — COMPOUNDS =====================
  (uuid_generate_v4(), NULL, 'Back Squat', 'Barbell back squat', 'strength', ARRAY['quads', 'glutes', 'hamstrings', 'core'], ARRAY['barbell', 'rack'], true),
  (uuid_generate_v4(), NULL, 'Front Squat', 'Barbell front squat, high bar position, upright torso', 'strength', ARRAY['quads', 'glutes', 'core'], ARRAY['barbell', 'rack'], true),
  (uuid_generate_v4(), NULL, 'Conventional Deadlift', 'Standard barbell deadlift from floor', 'strength', ARRAY['hamstrings', 'glutes', 'lower_back', 'traps'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Sumo Deadlift', 'Wide stance barbell deadlift, toes flared', 'strength', ARRAY['hamstrings', 'glutes', 'adductors'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Romanian Deadlift', 'Hip hinge with barbell, slight knee bend', 'strength', ARRAY['hamstrings', 'glutes', 'lower_back'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Bench Press', 'Flat barbell bench press', 'strength', ARRAY['chest', 'triceps', 'front_delt'], ARRAY['barbell', 'bench'], true),
  (uuid_generate_v4(), NULL, 'Incline Bench Press', 'Incline barbell press targeting upper chest', 'strength', ARRAY['upper_chest', 'triceps', 'front_delt'], ARRAY['barbell', 'incline_bench'], true),
  (uuid_generate_v4(), NULL, 'Overhead Press', 'Standing barbell press, strict form', 'strength', ARRAY['shoulders', 'triceps', 'upper_chest'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Barbell Row', 'Bent-over barbell row, overhand grip', 'strength', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Pull-Up', 'Bodyweight pull-up, full ROM', 'strength', ARRAY['lats', 'biceps', 'core'], ARRAY['pull_up_bar'], true),
  (uuid_generate_v4(), NULL, 'Chin-Up', 'Supinated grip pull-up', 'strength', ARRAY['lats', 'biceps'], ARRAY['pull_up_bar'], true),
  (uuid_generate_v4(), NULL, 'Dip', 'Parallel bar dips, chest or tricep focus', 'strength', ARRAY['triceps', 'chest', 'front_delt'], ARRAY['dip_bar'], true),
  (uuid_generate_v4(), NULL, 'Hip Thrust', 'Barbell hip thrust off bench', 'strength', ARRAY['glutes', 'hamstrings'], ARRAY['barbell', 'bench'], true),
  (uuid_generate_v4(), NULL, 'Bulgarian Split Squat', 'Rear-foot elevated split squat', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['dumbbell', 'bench'], true),
  (uuid_generate_v4(), NULL, 'Power Clean', 'Olympic lift from floor to rack position', 'strength', ARRAY['hamstrings', 'glutes', 'traps', 'shoulders', 'core'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Push Press', 'Leg-drive barbell press overhead', 'strength', ARRAY['shoulders', 'triceps', 'quads'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Pendlay Row', 'Dead-stop barbell row from floor each rep', 'strength', ARRAY['lats', 'rhomboids', 'lower_back'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Trap Bar Deadlift', 'Deadlift with hex/trap bar', 'strength', ARRAY['quads', 'hamstrings', 'glutes', 'traps'], ARRAY['trap_bar'], true),
  (uuid_generate_v4(), NULL, 'Good Morning', 'Barbell good morning hip hinge', 'strength', ARRAY['hamstrings', 'glutes', 'lower_back'], ARRAY['barbell'], true),
  (uuid_generate_v4(), NULL, 'Zercher Squat', 'Barbell held in elbow crook, deep squat', 'strength', ARRAY['quads', 'glutes', 'core', 'biceps'], ARRAY['barbell'], true),

  -- ===================== STRENGTH — ACCESSORIES =====================
  (uuid_generate_v4(), NULL, 'Dumbbell Curl', 'Alternating dumbbell curl', 'strength', ARRAY['biceps'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Hammer Curl', 'Neutral grip dumbbell curl', 'strength', ARRAY['biceps', 'brachialis'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Tricep Pushdown', 'Cable tricep pushdown with rope or bar', 'strength', ARRAY['triceps'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Overhead Tricep Extension', 'Dumbbell or cable overhead tricep extension', 'strength', ARRAY['triceps'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Lat Pulldown', 'Cable lat pulldown, wide or close grip', 'strength', ARRAY['lats', 'biceps'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Cable Row', 'Seated cable row', 'strength', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Face Pull', 'Cable face pull for rear delts and external rotation', 'strength', ARRAY['rear_delt', 'rotator_cuff'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Lateral Raise', 'Dumbbell lateral raise', 'strength', ARRAY['shoulders'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Front Raise', 'Dumbbell or plate front raise', 'strength', ARRAY['front_delt'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Rear Delt Fly', 'Bent-over dumbbell rear delt fly', 'strength', ARRAY['rear_delt', 'rhomboids'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Dumbbell Row', 'Single-arm dumbbell row', 'strength', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['dumbbell', 'bench'], true),
  (uuid_generate_v4(), NULL, 'Incline Dumbbell Press', 'Incline dumbbell chest press', 'strength', ARRAY['upper_chest', 'triceps', 'front_delt'], ARRAY['dumbbell', 'incline_bench'], true),
  (uuid_generate_v4(), NULL, 'Dumbbell Fly', 'Flat or incline dumbbell chest fly', 'strength', ARRAY['chest'], ARRAY['dumbbell', 'bench'], true),
  (uuid_generate_v4(), NULL, 'Leg Press', 'Machine leg press', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['leg_press_machine'], true),
  (uuid_generate_v4(), NULL, 'Leg Curl', 'Machine lying or seated leg curl', 'strength', ARRAY['hamstrings'], ARRAY['leg_curl_machine'], true),
  (uuid_generate_v4(), NULL, 'Leg Extension', 'Machine leg extension', 'strength', ARRAY['quads'], ARRAY['leg_extension_machine'], true),
  (uuid_generate_v4(), NULL, 'Calf Raise', 'Standing or seated calf raise', 'strength', ARRAY['calves'], ARRAY['calf_raise_machine'], true),
  (uuid_generate_v4(), NULL, 'Cable Kickback', 'Cable glute kickback', 'strength', ARRAY['glutes'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Cable Pull-Through', 'Cable pull-through for glutes and hamstrings', 'strength', ARRAY['glutes', 'hamstrings'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Goblet Squat', 'Dumbbell or kettlebell goblet squat', 'strength', ARRAY['quads', 'glutes', 'core'], ARRAY['dumbbell'], true),

  -- ===================== GLUTE / WOMEN'S FITNESS =====================
  (uuid_generate_v4(), NULL, 'Sumo Squat', 'Wide stance squat with dumbbell or kettlebell', 'strength', ARRAY['glutes', 'adductors', 'quads'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Single-Leg Hip Thrust', 'Unilateral barbell or bodyweight hip thrust', 'strength', ARRAY['glutes', 'hamstrings'], ARRAY['bench'], true),
  (uuid_generate_v4(), NULL, 'Frog Pump', 'Bodyweight frog pump glute activation', 'strength', ARRAY['glutes'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Abduction Machine', 'Seated hip abduction machine', 'strength', ARRAY['glutes', 'abductors'], ARRAY['abduction_machine'], true),
  (uuid_generate_v4(), NULL, 'Banded Crab Walk', 'Lateral walk with resistance band around knees', 'strength', ARRAY['glutes', 'abductors'], ARRAY['resistance_band'], true),
  (uuid_generate_v4(), NULL, 'Donkey Kick', 'Quadruped glute kickback', 'strength', ARRAY['glutes'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Fire Hydrant', 'Quadruped hip abduction', 'strength', ARRAY['glutes', 'abductors'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Step-Up', 'Dumbbell step-up onto box or bench', 'strength', ARRAY['quads', 'glutes'], ARRAY['dumbbell', 'box'], true),
  (uuid_generate_v4(), NULL, 'Reverse Lunge', 'Dumbbell or barbell reverse lunge', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Walking Lunge', 'Dumbbell walking lunge', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Nordic Curl', 'Partner or machine Nordic hamstring curl', 'strength', ARRAY['hamstrings'], ARRAY['bodyweight'], true),

  -- ===================== PLYOMETRICS / ATHLETIC =====================
  (uuid_generate_v4(), NULL, 'Box Jump', 'Two-foot explosive jump onto a plyo box', 'plyometrics', ARRAY['quads', 'glutes', 'calves', 'cardiovascular'], ARRAY['plyo_box'], true),
  (uuid_generate_v4(), NULL, 'Broad Jump', 'Standing horizontal broad jump for distance', 'plyometrics', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Depth Drop', 'Step off box and stick landing — shock absorption', 'plyometrics', ARRAY['quads', 'glutes', 'hamstrings', 'core'], ARRAY['plyo_box'], true),
  (uuid_generate_v4(), NULL, 'Lateral Box Jump', 'Lateral two-foot jump onto box', 'plyometrics', ARRAY['quads', 'glutes', 'abductors'], ARRAY['plyo_box'], true),
  (uuid_generate_v4(), NULL, 'Tuck Jump', 'Explosive vertical jump with knee tuck at top', 'plyometrics', ARRAY['quads', 'glutes', 'calves', 'cardiovascular'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Split Jump', 'Explosive alternating lunge jump', 'plyometrics', ARRAY['quads', 'glutes', 'hamstrings', 'cardiovascular'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Slam Ball', 'Overhead slam ball throw to ground', 'plyometrics', ARRAY['shoulders', 'core', 'lats', 'cardiovascular'], ARRAY['slam_ball'], true),
  (uuid_generate_v4(), NULL, 'Medicine Ball Chest Pass', 'Explosive chest pass with medicine ball', 'plyometrics', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['medicine_ball'], true),
  (uuid_generate_v4(), NULL, 'Broad Jump to Sprint', 'Broad jump immediately into 10m sprint', 'plyometrics', ARRAY['quads', 'glutes', 'hamstrings', 'cardiovascular'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Hurdle Hop', 'Two-foot hops over low hurdles in succession', 'plyometrics', ARRAY['quads', 'calves', 'cardiovascular'], ARRAY['hurdles'], true),

  -- ===================== HIIT / CONDITIONING =====================
  (uuid_generate_v4(), NULL, 'Burpee', 'Full body burpee — squat thrust with push-up and jump', 'cardio', ARRAY['full_body', 'cardiovascular'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Mountain Climber', 'Alternating knee drives in plank position', 'cardio', ARRAY['core', 'shoulders', 'cardiovascular'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Kettlebell Swing', 'Two-hand kettlebell hip hinge swing', 'cardio', ARRAY['glutes', 'hamstrings', 'core', 'cardiovascular'], ARRAY['kettlebell'], true),
  (uuid_generate_v4(), NULL, 'Jump Squat', 'Bodyweight or goblet jump squat', 'cardio', ARRAY['quads', 'glutes', 'calves', 'cardiovascular'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'High Knees', 'Running in place with high knee drive', 'cardio', ARRAY['hip_flexors', 'quads', 'cardiovascular'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Battle Rope Waves', 'Alternating waves with battle ropes', 'cardio', ARRAY['shoulders', 'core', 'cardiovascular'], ARRAY['battle_ropes'], true),
  (uuid_generate_v4(), NULL, 'Sled Push', 'Loaded sled push for distance', 'cardio', ARRAY['quads', 'glutes', 'shoulders', 'cardiovascular'], ARRAY['sled'], true),
  (uuid_generate_v4(), NULL, 'Farmer Carry', 'Heavy dumbbell or kettlebell carry for distance', 'cardio', ARRAY['traps', 'core', 'grip', 'cardiovascular'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'Wall Ball', 'Squat and throw medicine ball to target on wall', 'cardio', ARRAY['quads', 'glutes', 'shoulders', 'cardiovascular'], ARRAY['medicine_ball'], true),
  (uuid_generate_v4(), NULL, 'Treadmill Run', 'Treadmill steady-state or interval run', 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY['treadmill'], true),
  (uuid_generate_v4(), NULL, 'Rowing Machine', 'Concept2 rowing ergometer — full body cardio', 'cardio', ARRAY['back', 'legs', 'cardiovascular'], ARRAY['rower'], true),
  (uuid_generate_v4(), NULL, 'Assault Bike', 'Air bike sprint intervals — arms and legs', 'cardio', ARRAY['legs', 'shoulders', 'cardiovascular'], ARRAY['assault_bike'], true),
  (uuid_generate_v4(), NULL, 'Jump Rope', 'Jump rope skipping — single or double unders', 'cardio', ARRAY['calves', 'cardiovascular'], ARRAY['jump_rope'], true),
  (uuid_generate_v4(), NULL, 'SkiErg', 'SkiErg pull-down intervals', 'cardio', ARRAY['lats', 'core', 'cardiovascular'], ARRAY['skierg'], true),
  (uuid_generate_v4(), NULL, 'Stair Climber', 'Step mill or stair climber machine', 'cardio', ARRAY['glutes', 'quads', 'cardiovascular'], ARRAY['stair_climber'], true),
  (uuid_generate_v4(), NULL, 'Sprint Intervals', 'All-out sprint repeats with timed rest', 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY['bodyweight'], true),

  -- ===================== CORE =====================
  (uuid_generate_v4(), NULL, 'Plank', 'Standard front plank hold', 'core', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Side Plank', 'Lateral plank hold on forearm', 'core', ARRAY['obliques', 'core'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Ab Rollout', 'Ab wheel rollout from knees or feet', 'core', ARRAY['core', 'lats', 'shoulders'], ARRAY['ab_wheel'], true),
  (uuid_generate_v4(), NULL, 'Cable Crunch', 'Kneeling cable crunch', 'core', ARRAY['core'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Hanging Leg Raise', 'Hanging from bar, raise straight legs', 'core', ARRAY['core', 'hip_flexors'], ARRAY['pull_up_bar'], true),
  (uuid_generate_v4(), NULL, 'Dead Bug', 'Supine dead bug — contralateral arm and leg extension', 'core', ARRAY['core', 'hip_flexors'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Pallof Press', 'Anti-rotation cable press', 'core', ARRAY['core', 'obliques'], ARRAY['cable'], true),
  (uuid_generate_v4(), NULL, 'Russian Twist', 'Seated rotational twist with weight', 'core', ARRAY['obliques', 'core'], ARRAY['dumbbell'], true),
  (uuid_generate_v4(), NULL, 'V-Up', 'Full body V-sit crunch', 'core', ARRAY['core', 'hip_flexors'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'GHD Sit-Up', 'Glute-ham developer sit-up', 'core', ARRAY['core', 'hip_flexors'], ARRAY['ghd_machine'], true),

  -- ===================== MOBILITY =====================
  (uuid_generate_v4(), NULL, 'World''s Greatest Stretch', 'Hip flexor, t-spine, and hamstring combined mobility drill', 'mobility', ARRAY['hip_flexors', 'thoracic_spine', 'hamstrings'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Hip 90/90 Stretch', 'Seated hip internal and external rotation stretch', 'mobility', ARRAY['hip_flexors', 'glutes', 'adductors'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Pigeon Pose', 'Hip opener stretch for glutes and piriformis', 'mobility', ARRAY['glutes', 'hip_flexors'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Thoracic Extension on Foam Roller', 'T-spine extension over foam roller', 'mobility', ARRAY['thoracic_spine', 'chest'], ARRAY['foam_roller'], true),
  (uuid_generate_v4(), NULL, 'Ankle Circles', 'Slow ankle circle mobility drill', 'mobility', ARRAY['ankles'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Cat-Cow', 'Spinal flexion and extension on hands and knees', 'mobility', ARRAY['spine', 'core'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Banded Pull-Apart', 'Resistance band pull-apart for shoulder health', 'mobility', ARRAY['rear_delt', 'rotator_cuff', 'rhomboids'], ARRAY['resistance_band'], true),
  (uuid_generate_v4(), NULL, 'Couch Stretch', 'Kneeling quad and hip flexor stretch', 'mobility', ARRAY['hip_flexors', 'quads'], ARRAY['bodyweight'], true),
  (uuid_generate_v4(), NULL, 'Shoulder Dislocate', 'PVC pipe or band shoulder dislocate', 'mobility', ARRAY['shoulders', 'chest'], ARRAY['resistance_band'], true),
  (uuid_generate_v4(), NULL, 'Lateral Squat Stretch', 'Wide stance lateral squat with pause', 'mobility', ARRAY['adductors', 'hips', 'quads'], ARRAY['bodyweight'], true)

ON CONFLICT DO NOTHING;
