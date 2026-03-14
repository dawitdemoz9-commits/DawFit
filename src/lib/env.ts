/**
 * Environment variable validation.
 * Call validateEnv() at app startup (e.g. in instrumentation.ts or a server layout).
 * In production, missing required vars throw. In development, they warn.
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  // Supabase — always required
  { key: "NEXT_PUBLIC_SUPABASE_URL",      required: true,  description: "Supabase project URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true,  description: "Supabase anon (public) key" },
  { key: "SUPABASE_SERVICE_ROLE_KEY",     required: true,  description: "Supabase service role key (server-only)" },

  // App URL
  { key: "NEXT_PUBLIC_APP_URL",           required: true,  description: "Public app URL (e.g. https://dawfit.app)" },

  // Anthropic AI
  { key: "ANTHROPIC_API_KEY",             required: true,  description: "Anthropic Claude API key" },

  // Stripe — required for billing
  { key: "STRIPE_SECRET_KEY",             required: true,  description: "Stripe secret key (sk_live_ or sk_test_)" },
  { key: "STRIPE_WEBHOOK_SECRET",         required: true,  description: "Stripe webhook signing secret (whsec_...)" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: true, description: "Stripe publishable key (pk_live_ or pk_test_)" },
  { key: "STRIPE_PRICE_STARTER",          required: true,  description: "Stripe Price ID for Starter plan" },
  { key: "STRIPE_PRICE_PRO",              required: true,  description: "Stripe Price ID for Pro plan" },
  { key: "STRIPE_PRICE_ELITE",            required: true,  description: "Stripe Price ID for Elite plan" },

  // Resend — required for email
  { key: "RESEND_API_KEY",                required: true,  description: "Resend API key for transactional email" },
  { key: "RESEND_FROM_EMAIL",             required: false, description: "From address (defaults to noreply@dawfit.app)" },
];

export function validateEnv(): { missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const { key, required, description } of ENV_VARS) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      if (required) {
        missing.push(`  ✗ ${key} — ${description}`);
      } else {
        warnings.push(`  ⚠ ${key} — ${description} (optional, using default)`);
      }
    }
  }

  return { missing, warnings };
}

/**
 * Logs env validation results to the console.
 * In production with missing required vars, throws an error.
 */
export function assertEnv(): void {
  const { missing, warnings } = validateEnv();
  const isProd = process.env.NODE_ENV === "production";

  if (warnings.length > 0) {
    console.warn("[ENV] Optional variables not set:\n" + warnings.join("\n"));
  }

  if (missing.length > 0) {
    const msg = `[ENV] Missing required environment variables:\n${missing.join("\n")}\n\nCopy .env.local.example to .env.local and fill in all required values.`;
    if (isProd) {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
}
