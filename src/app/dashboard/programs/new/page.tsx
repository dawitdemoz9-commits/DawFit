import { ProgramMetaForm } from "@/components/coach/program-meta-form";

export default function NewProgramPage() {
  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Program</h1>
        <p className="text-slate-500 text-sm mt-0.5">Create a multi-week training program</p>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <ProgramMetaForm />
      </div>
    </div>
  );
}
