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
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Cancellations</h2>
            <p>You may cancel your DawFit subscription at any time through your account settings (Dashboard → Settings → Billing → Manage Subscription). Cancellation takes effect at the end of your current billing period. You will retain full access to the platform until that date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Refunds</h2>
            <p>DawFit subscriptions are billed monthly. We do not offer prorated refunds for partial months. If you cancel mid-cycle, you keep access until the end of that billing period with no further charges.</p>
            <p className="mt-3">Exceptions are made for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Duplicate charges or billing errors — refunded in full upon verification</li>
              <li>Charges made after a confirmed cancellation — refunded in full</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">How to Request a Refund</h2>
            <p>Email us at <a href="mailto:support@dawfit.app" className="text-violet-600 underline">support@dawfit.app</a> with your account email and a description of the issue. We will respond within 2 business days. Approved refunds are processed within 5–10 business days to your original payment method.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Free Trial</h2>
            <p>If DawFit offers a free trial period, no charge is made during the trial. You may cancel before the trial ends without being billed.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Questions</h2>
            <p>Contact us at <a href="mailto:support@dawfit.app" className="text-violet-600 underline">support@dawfit.app</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
