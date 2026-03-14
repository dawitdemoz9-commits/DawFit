"use client";

import { useState } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [tab, setTab] = useState<"coach" | "client">("coach");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-6 py-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-slate-900">DawFit</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => setTab("coach")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              tab === "coach"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            I'm a Coach
          </button>
          <button
            onClick={() => setTab("client")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              tab === "client"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            I'm a Client
          </button>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          {tab === "client" && (
            <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
              Your login was set up by your coach. Check your email for an invite link, or sign in below if you've already created your password.
            </div>
          )}

          <LoginForm />

          <div className="mt-4 text-center text-sm text-slate-500">
            <Link href="/auth/reset-password" className="hover:text-indigo-600 transition-colors">
              Forgot your password?
            </Link>
          </div>

          {tab === "coach" && (
            <div className="mt-6 pt-6 border-t text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-indigo-600 font-medium hover:underline">
                Start for free
              </Link>
            </div>
          )}

          {tab === "client" && (
            <div className="mt-6 pt-6 border-t text-center text-sm text-slate-500">
              No invite yet?{" "}
              <span className="text-slate-400">Ask your coach to send you an invite link.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
