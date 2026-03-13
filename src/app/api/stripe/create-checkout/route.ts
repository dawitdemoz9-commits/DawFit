import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { PLANS } from "@/lib/stripe/plans";
import { z } from "zod";

const RequestSchema = z.object({
  tier: z.enum(["starter", "pro", "elite"]),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "coach") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  const { tier } = parsed.data;
  const plan = PLANS.find(p => p.tier === tier);
  if (!plan || !plan.price_id) {
    return NextResponse.json({ error: "Plan not configured — check Stripe Price IDs in .env" }, { status: 400 });
  }

  // Load or create Stripe customer
  const { data: coach } = await supabase
    .from("coaches")
    .select("stripe_customer_id, subscription_tier, subscription_status")
    .eq("id", user.id)
    .single();

  const { data: profileData } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  let customerId = coach?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profileData?.full_name ?? undefined,
      metadata: { coach_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("coaches")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.price_id, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings/billing?success=true&tier=${tier}`,
    cancel_url: `${appUrl}/dashboard/settings/billing?canceled=true`,
    subscription_data: {
      metadata: { coach_id: user.id, tier },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
