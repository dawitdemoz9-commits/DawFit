import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <LoginForm />
          <div className="mt-4 text-center text-sm text-slate-500">
            <Link href="/auth/reset-password" className="hover:text-primary transition-colors">
              Forgot your password?
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary font-medium hover:underline">
              Start for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
