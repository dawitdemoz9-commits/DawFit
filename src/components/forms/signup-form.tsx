"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { signUp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      Create account
    </Button>
  );
}

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    setError(null);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleAction} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Alex Johnson"
          autoComplete="name"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <SubmitButton />
      <p className="text-xs text-slate-400 text-center">
        By creating an account you agree to our{" "}
        <a href="/terms" className="underline hover:text-slate-600">Terms</a>
        {" "}and{" "}
        <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
      </p>
    </form>
  );
}
