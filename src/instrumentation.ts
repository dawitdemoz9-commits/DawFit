/**
 * Next.js instrumentation hook — runs once on server startup.
 * Validates all required environment variables before accepting requests.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertEnv } = await import("@/lib/env");
    assertEnv();
  }
}
