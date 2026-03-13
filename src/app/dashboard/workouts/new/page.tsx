import { WorkoutMetaForm } from "@/components/coach/workout-meta-form";

export default function NewWorkoutPage() {
  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Workout</h1>
        <p className="text-slate-500 text-sm mt-0.5">Start by naming your workout, then add exercises</p>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <WorkoutMetaForm />
      </div>
    </div>
  );
}
