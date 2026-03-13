import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ApplySuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl border shadow-sm p-10">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Application Received!</h1>
          <p className="text-slate-500 mt-3 leading-relaxed">
            Thank you for applying. Your coach will review your application and reach out within 24–48 hours.
          </p>
          <p className="text-slate-400 text-sm mt-6">Keep an eye on your inbox.</p>
        </div>
      </div>
    </div>
  );
}
