import Link from "next/link";

export const metadata = { title: "Terms of Service – DawFit" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-violet-600 hover:underline mb-8 inline-block">← Back to DawFit</Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: March 14, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Agreement to Terms</h2>
            <p>By creating an account or using DawFit ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
            <p>DawFit is a fitness coaching software platform that enables fitness coaches ("Coaches") to manage clients, build workout programs, track progress, and communicate with clients. Clients access programs and log workouts through the platform at the direction of their Coach.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. DawFit is not liable for any loss resulting from unauthorized access to your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Subscriptions & Billing</h2>
            <p>Coach accounts require a paid subscription (Starter, Pro, or Elite). Subscriptions are billed monthly and renew automatically. You may cancel at any time through your account settings. Cancellation takes effect at the end of the current billing period. See our <Link href="/legal/refund" className="text-violet-600 underline">Refund Policy</Link> for details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Acceptable Use</h2>
            <p>You agree not to misuse the Service, including but not limited to: reverse engineering, transmitting harmful content, violating any laws, or attempting to gain unauthorized access to other accounts or systems.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Health Disclaimer</h2>
            <p>DawFit provides tools for fitness coaches. Content on the platform is not medical advice. Consult a qualified healthcare professional before starting any fitness program. DawFit is not liable for any injury or health outcomes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data & Privacy</h2>
            <p>Your use of the Service is also governed by our <Link href="/legal/privacy" className="text-violet-600 underline">Privacy Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Termination</h2>
            <p>We may suspend or terminate your account for violations of these Terms. You may terminate your account at any time by contacting support.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, DawFit shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Contact</h2>
            <p>Questions about these Terms? Email us at <a href="mailto:support@dawfit.app" className="text-violet-600 underline">support@dawfit.app</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
