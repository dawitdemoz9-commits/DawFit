import Link from "next/link";

export const metadata = { title: "Refund & Cancellation Policy – DawFit" };

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-violet-600 hover:underline mb-8 inline-block">← Back to DawFit</Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: March 14, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">14-Day Money-Back Guarantee</h2>
            <p>If you are not satisfied with DawFit within the first 14 days of your paid subscription, contact us for a full refund — no questions asked. This applies to first-time subscribers only.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Cancellations</h2>
            <p>You may cancel your subscription at any time from Dashboard → Settings → Billing → Manage Subscription. Cancellation takes effect at the end of your current billing period. You retain full access until that date and will not be charged again.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">After the 14-Day Period</h2>
            <p>After the initial 14-day window, subscriptions are non-refundable. If you cancel mid-cycle you keep access through the end of that billing period with no further charges, but no partial-month refund is issued.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Billing Errors</h2>
            <p>Duplicate charges or charges made after a confirmed cancellation are always refunded in full. Contact us and we will resolve it within 2 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">How to Request a Refund</h2>
            <p>Email <a href="mailto:dawitdemoz9@gmail.com" className="text-violet-600 underline">dawitdemoz9@gmail.com</a> with your account email and the reason for your request. Approved refunds are returned to your original payment method within 5–10 business days.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
