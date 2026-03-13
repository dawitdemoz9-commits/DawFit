import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { tierFromPriceId } from "@/lib/stripe/plans";
import type Stripe from "stripe";
import type { Json } from "@/types/database";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 });
  }

  const supabase = await createClient();

  // Idempotency: skip already-processed events
  const { data: existing } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as Stripe.Subscription | null)?.id ?? null;

        if (!subscriptionId) break;

        // Retrieve subscription (expand latest_invoice for period dates)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ["latest_invoice"],
        });

        const coachId = subscription.metadata?.coach_id ?? null;
        if (!coachId) break;

        const priceId = subscription.items.data[0]?.price.id ?? null;
        const tier = priceId ? tierFromPriceId(priceId) : null;

        // Get period dates from latest_invoice
        const invoice = subscription.latest_invoice as Stripe.Invoice | null;
        const periodStart = invoice?.period_start
          ? new Date(invoice.period_start * 1000).toISOString()
          : null;
        const periodEnd = invoice?.period_end
          ? new Date(invoice.period_end * 1000).toISOString()
          : null;

        await supabase
          .from("stripe_subscriptions")
          .upsert({
            coach_id: coachId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            status: subscription.status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, { onConflict: "stripe_subscription_id" });

        await supabase
          .from("coaches")
          .update({ subscription_tier: tier, subscription_status: subscription.status })
          .eq("id", coachId);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const coachId = subscription.metadata?.coach_id ?? null;
        const priceId = subscription.items.data[0]?.price.id ?? null;
        const tier = priceId ? tierFromPriceId(priceId) : null;

        // Expand latest_invoice for period dates
        const expanded = await stripe.subscriptions.retrieve(subscription.id, {
          expand: ["latest_invoice"],
        });
        const invoice = expanded.latest_invoice as Stripe.Invoice | null;
        const periodStart = invoice?.period_start
          ? new Date(invoice.period_start * 1000).toISOString()
          : null;
        const periodEnd = invoice?.period_end
          ? new Date(invoice.period_end * 1000).toISOString()
          : null;

        await supabase
          .from("stripe_subscriptions")
          .update({
            stripe_price_id: priceId,
            status: subscription.status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (coachId) {
          await supabase
            .from("coaches")
            .update({ subscription_tier: tier, subscription_status: subscription.status })
            .eq("id", coachId);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const coachId = subscription.metadata?.coach_id ?? null;

        await supabase
          .from("stripe_subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        if (coachId) {
          await supabase
            .from("coaches")
            .update({ subscription_tier: null, subscription_status: "canceled" })
            .eq("id", coachId);
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        // In the 2026 API, subscription is under parent.subscription_details
        const parent = invoice.parent as (Stripe.Invoice.Parent & {
          subscription_details?: { subscription?: string | Stripe.Subscription };
        }) | null;

        const sub = parent?.subscription_details?.subscription;
        const subscriptionId = typeof sub === "string" ? sub : sub?.id ?? null;

        if (!subscriptionId) break;

        await supabase
          .from("stripe_subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);

        const { data: subRow } = await supabase
          .from("stripe_subscriptions")
          .select("coach_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (subRow?.coach_id) {
          await supabase
            .from("coaches")
            .update({ subscription_status: "past_due" })
            .eq("id", subRow.coach_id);
        }

        break;
      }
    }

    // Log event for idempotency + audit
    await supabase.from("stripe_events").insert({
      stripe_event_id: event.id,
      type: event.type,
      data: event.data.object as unknown as Json,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook]", event.type, err);
    const message = err instanceof Error ? err.message : "Handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
