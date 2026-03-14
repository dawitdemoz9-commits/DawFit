"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const SPECIALTY_EXERCISES: Record<string, Array<{ name: string; category: string; muscle_groups: string[]; equipment: string[] }>> = {
  strength: [
    { name: "Pause Squat", category: "strength", muscle_groups: ["quads", "glutes"], equipment: ["barbell", "rack"] },
    { name: "Deficit Deadlift", category: "strength", muscle_groups: ["hamstrings", "glutes", "lower_back"], equipment: ["barbell"] },
    { name: "Close Grip Bench Press", category: "strength", muscle_groups: ["triceps", "chest"], equipment: ["barbell", "bench"] },
    { name: "Safety Bar Squat", category: "strength", muscle_groups: ["quads", "glutes"], equipment: ["safety_bar", "rack"] },
    { name: "Rack Pull", category: "strength", muscle_groups: ["hamstrings", "glutes", "traps"], equipment: ["barbell", "rack"] },
    { name: "Paused Bench Press", category: "strength", muscle_groups: ["chest", "triceps"], equipment: ["barbell", "bench"] },
    { name: "Box Squat", category: "strength", muscle_groups: ["quads", "glutes", "hamstrings"], equipment: ["barbell", "rack", "box"] },
    { name: "Anderson Squat", category: "strength", muscle_groups: ["quads", "glutes"], equipment: ["barbell", "rack"] },
  ],
  bodybuilding: [
    { name: "Cable Fly", category: "strength", muscle_groups: ["chest"], equipment: ["cable"] },
    { name: "Pec Deck", category: "strength", muscle_groups: ["chest"], equipment: ["machine"] },
    { name: "Leg Extension", category: "strength", muscle_groups: ["quads"], equipment: ["machine"] },
    { name: "Leg Curl", category: "strength", muscle_groups: ["hamstrings"], equipment: ["machine"] },
    { name: "Preacher Curl", category: "strength", muscle_groups: ["biceps"], equipment: ["barbell", "bench"] },
    { name: "Incline Dumbbell Curl", category: "strength", muscle_groups: ["biceps"], equipment: ["dumbbell", "bench"] },
    { name: "Skull Crusher", category: "strength", muscle_groups: ["triceps"], equipment: ["barbell", "bench"] },
    { name: "Cable Lateral Raise", category: "strength", muscle_groups: ["shoulders"], equipment: ["cable"] },
    { name: "Hack Squat", category: "strength", muscle_groups: ["quads", "glutes"], equipment: ["machine"] },
    { name: "Chest Supported Row", category: "strength", muscle_groups: ["lats", "rhomboids"], equipment: ["dumbbell", "bench"] },
    { name: "Reverse Fly", category: "strength", muscle_groups: ["rear_delt", "rhomboids"], equipment: ["dumbbell"] },
    { name: "Calf Raise", category: "strength", muscle_groups: ["calves"], equipment: ["machine"] },
  ],
  crossfit: [
    { name: "Box Jump", category: "power", muscle_groups: ["quads", "glutes", "calves"], equipment: ["box"] },
    { name: "Kettlebell Swing", category: "power", muscle_groups: ["glutes", "hamstrings", "core"], equipment: ["kettlebell"] },
    { name: "Thruster", category: "strength", muscle_groups: ["quads", "glutes", "shoulders"], equipment: ["barbell"] },
    { name: "Wall Ball", category: "conditioning", muscle_groups: ["quads", "glutes", "shoulders"], equipment: ["medicine_ball"] },
    { name: "Burpee", category: "conditioning", muscle_groups: ["full_body"], equipment: ["bodyweight"] },
    { name: "Double Under", category: "cardio", muscle_groups: ["calves", "core"], equipment: ["jump_rope"] },
    { name: "Toes to Bar", category: "core", muscle_groups: ["core", "hip_flexors"], equipment: ["pull_up_bar"] },
    { name: "Muscle Up", category: "strength", muscle_groups: ["lats", "triceps", "core"], equipment: ["rings"] },
    { name: "Handstand Push-Up", category: "strength", muscle_groups: ["shoulders", "triceps"], equipment: ["bodyweight"] },
    { name: "Ring Row", category: "strength", muscle_groups: ["lats", "biceps"], equipment: ["rings"] },
  ],
  cardio: [
    { name: "Treadmill Run", category: "cardio", muscle_groups: ["legs", "cardio"], equipment: ["treadmill"] },
    { name: "Stationary Bike", category: "cardio", muscle_groups: ["quads", "cardio"], equipment: ["bike"] },
    { name: "Rowing Machine", category: "cardio", muscle_groups: ["back", "legs", "cardio"], equipment: ["rower"] },
    { name: "Stair Climber", category: "cardio", muscle_groups: ["quads", "glutes", "cardio"], equipment: ["stair_climber"] },
    { name: "Jump Rope", category: "cardio", muscle_groups: ["calves", "cardio"], equipment: ["jump_rope"] },
    { name: "Battle Ropes", category: "conditioning", muscle_groups: ["shoulders", "core", "cardio"], equipment: ["battle_ropes"] },
    { name: "Sled Push", category: "conditioning", muscle_groups: ["quads", "glutes", "cardio"], equipment: ["sled"] },
    { name: "Farmers Carry", category: "conditioning", muscle_groups: ["core", "traps", "grip"], equipment: ["dumbbell"] },
  ],
  general: [],
};

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const businessName = formData.get("business_name") as string;
  const bio = formData.get("bio") as string;
  const brandColor = formData.get("brand_color") as string;
  const websiteUrl = formData.get("website_url") as string;

  // Generate a clean slug from business name
  const baseSlug = slugify(businessName);
  let slug = baseSlug;
  let attempt = 0;

  // Check if slug is already taken (excluding this coach)
  while (true) {
    const { data: existing } = await supabase
      .from("coaches")
      .select("id")
      .eq("slug", slug)
      .neq("id", user.id)
      .single();

    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { error } = await supabase.from("coaches").update({
    business_name: businessName,
    bio,
    brand_color: brandColor || "#3B82F6",
    website_url: websiteUrl || null,
    slug,
    onboarded_at: new Date().toISOString(),
  }).eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Also update profile full_name if provided
  const fullName = formData.get("full_name") as string;
  if (fullName) {
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  }

  // Seed specialty exercises into coach's personal library
  const specialty = (formData.get("specialty") as string) || "general";
  const specialtyExercises = SPECIALTY_EXERCISES[specialty] ?? [];
  if (specialtyExercises.length > 0) {
    await supabase.from("exercises").insert(
      specialtyExercises.map((ex) => ({
        coach_id: user.id,
        name: ex.name,
        category: ex.category,
        muscle_groups: ex.muscle_groups,
        equipment: ex.equipment,
        is_public: false,
      }))
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
