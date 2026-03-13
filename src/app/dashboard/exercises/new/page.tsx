import { ExerciseForm } from "@/components/coach/exercise-form";

export default function NewExercisePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Exercise</h1>
        <p className="text-slate-500 text-sm mt-0.5">Add a custom exercise to your library</p>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <ExerciseForm />
      </div>
    </div>
  );
}
