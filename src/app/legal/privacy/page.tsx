import Link from "next/link";

export const metadata = { title: "Privacy Policy – DawFit" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-violet-600 hover:underline mb-8 inline-block">← Back to DawFit</Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: March 14, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, including name, email address, and fitness-related data entered by coaches and clients. We also collect usage data and technical information (device type, browser, IP address) automatically when you use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve the Service, process payments, communicate with you about your account, and ensure platform security. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Data Sharing</h2>
            <p>We share data with trusted service providers necessary to operate the platform (Supabase for database/auth, Stripe for payments, Vercel for hosting). Each is contractually bound to protect your data. Coach data is isolated per account and is never shared with other coaches.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Cookies</h2>
            <p>We use session cookies to keep you logged in. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. You may request deletion of your account and associated data by contacting support.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Security</h2>
            <p>We use industry-standard security measures including encrypted connections (HTTPS), row-level security on the database, and secure authentication. No method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:dawitdemoz9@gmail.com" className="text-violet-600 underline">dawitdemoz9@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We'll notify you of significant changes via email or a notice on the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Contact</h2>
            <p>Questions about privacy? Email us at <a href="mailto:dawitdemoz9@gmail.com" className="text-violet-600 underline">dawitdemoz9@gmail.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
