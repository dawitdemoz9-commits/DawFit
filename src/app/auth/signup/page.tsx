import Link from "next/link";
import { SignUpForm } from "@/components/forms/signup-form";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-6 py-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-slate-900">DawFit</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Start coaching smarter</h1>
          <p className="text-slate-500 mt-1">Create your coaching account</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <SignUpForm />
          <div className="mt-6 pt-6 border-t text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
