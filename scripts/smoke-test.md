# DawFit — End-to-End Smoke Test

Run this checklist before every production deploy.
Each step must pass before moving to the next.

---

## Prerequisites

- [ ] All env vars set in `.env.local` (or Vercel environment)
- [ ] Supabase migrations applied (`supabase db push` or SQL editor)
- [ ] `seed.sql` executed (platform default exercises loaded)
- [ ] Stripe products + prices created, Price IDs in env
- [ ] Stripe webhook configured to `/api/stripe/webhook` (local: via Stripe CLI)
- [ ] Resend domain verified (or using Resend test mode)
- [ ] App running (`npm run dev` or deployed)

---

## 1. Coach Signup

- [ ] Visit `/auth/signup`
- [ ] Fill in name, email, password → submit
- [ ] Redirected to `/onboarding` (no error)
- [ ] Supabase: `profiles` row created with `role = coach`
- [ ] Supabase: `coaches` row created with unique slug

## 2. Onboarding

- [ ] Select coaching specialty (Strength / Bodybuilding / CrossFit / General / Cardio)
- [ ] Fill in business name, brand color
- [ ] Submit → redirected to `/dashboard`
- [ ] Supabase: `coaches.onboarded_at` is set
- [ ] Supabase: specialty exercises seeded into `exercises` table for this coach

## 3. Exercise Library

- [ ] Visit `/dashboard/exercises`
- [ ] Platform default exercises visible (90 seeded)
- [ ] Coach specialty exercises visible
- [ ] Search works (filters by name)
- [ ] Category filter works
- [ ] "AI Generate Exercises" dialog opens → select category + count → generate → exercises appear

## 4. Create Program

- [ ] Visit `/dashboard/programs` → New Program
- [ ] Add 2 weeks
- [ ] Add workouts to Week 1 (new + from library)
- [ ] Open a workout → add exercises from picker
- [ ] Publish workout → status changes to Published
- [ ] Program builder shows exercise count on workout row

## 5. Invite Client

- [ ] Visit `/dashboard/clients` → Invite Client
- [ ] Enter client email + name → submit
- [ ] Success toast shown
- [ ] Supabase: `clients` row created, `conversations` row created
- [ ] **Email check**: client receives Supabase magic link email + DawFit branded welcome email (if Resend configured)

## 6. Client Login

- [ ] Client clicks magic link in email → lands at `/auth/callback`
- [ ] Redirected to `/client` dashboard
- [ ] Client sees their portal (programs, check-in, log)

## 7. Client Logs Workout

- [ ] Client navigates to their assigned program
- [ ] Opens a workout → taps "Start Workout"
- [ ] Logs sets/reps/weight for each exercise → submits
- [ ] Supabase: `workout_logs` and `exercise_logs` rows created
- [ ] Coach sees log in `/dashboard/clients/[id]` → Logs tab

## 8. Coach Reviews Log

- [ ] Visit `/dashboard/clients/[id]` → Logs tab
- [ ] Workout log visible with exercises and weights
- [ ] Coach can add notes (if implemented)

## 9. Lead Application

- [ ] Visit `/apply/[coach-slug]` (public page)
- [ ] Fill out application form → submit
- [ ] Supabase: `leads` row created with `status = new`
- [ ] Dashboard → New Leads count increments
- [ ] Coach visits `/dashboard/leads/[id]` → sees application

## 10. Lead Conversion

- [ ] On lead detail page → click "Convert to Client"
- [ ] Supabase: `clients` row created, lead `status = converted`
- [ ] Redirected to `/dashboard/clients/[id]`
- [ ] **Email check**: client receives DawFit branded acceptance email

## 11. AI Draft Review

- [ ] Visit `/dashboard/ai` → Generate workout or program draft
- [ ] Draft appears with `status = pending`
- [ ] Approve draft → exercises/workouts created in DB
- [ ] Reject draft → status changes to `rejected`

## 12. Billing Subscription

- [ ] Visit `/dashboard/settings/billing`
- [ ] All 3 plans shown (Starter $29 / Pro $79 / Elite $149)
- [ ] Click "Get Starter" → redirected to Stripe Checkout
- [ ] Use test card `4242 4242 4242 4242` → complete checkout
- [ ] Redirected back to `/dashboard/settings/billing?success=true`
- [ ] Success banner shown
- [ ] Supabase: `stripe_subscriptions` row created, `coaches.subscription_tier` updated
- [ ] "Manage Billing" button → opens Stripe Customer Portal
- [ ] Upgrade/downgrade from portal → `customer.subscription.updated` webhook fires → tier updates

---

## Webhook Verification (Stripe)

Run locally with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

Each should return `200 { received: true }` and update the DB.

---

## Environment Validation Check

On server startup, look for `[ENV]` log lines:
- `✗` = missing required var (will throw in production)
- `⚠` = optional var not set (using default)
- No output = all good

---

## Production Deploy Checklist

- [ ] All smoke test steps passed in staging
- [ ] `NODE_ENV=production` in Vercel environment
- [ ] Stripe keys switched from `sk_test_` → `sk_live_`
- [ ] Stripe webhook endpoint updated to production URL
- [ ] Resend domain verified + DNS records propagated
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] Supabase project not paused (check dashboard)
- [ ] Vercel deploy succeeded with zero build errors
