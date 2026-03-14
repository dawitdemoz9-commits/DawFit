import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplyForm } from "@/components/shared/apply-form";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ utm_source?: string; ref?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: coach } = await supabase
    .from("coaches")
    .select("business_name, bio")
    .eq("slug", slug)
    .single();

  return {
    title: coach ? `Apply to work with ${coach.business_name}` : "Apply",
    description: coach?.bio ?? undefined,
  };
}

export default async function ApplyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { utm_source, ref } = await searchParams;
  const source = utm_source ?? ref ?? "application_page";
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, slug, business_name, bio, brand_color, logo_url")
    .eq("slug", slug)
    .single();

  if (!coach) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header bar with coach brand color */}
      <div className="h-2" style={{ backgroundColor: coach.brand_color ?? "#3B82F6" }} />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Coach header */}
        <div className="text-center mb-10">
          <div
            className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            style={{ backgroundColor: coach.brand_color ?? "#3B82F6" }}
          >
            {(coach.business_name ?? "D").charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{coach.business_name}</h1>
          {coach.bio && (
            <p className="text-slate-500 mt-3 max-w-lg mx-auto leading-relaxed">{coach.bio}</p>
          )}
        </div>

        {/* Application form */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Apply for Coaching</h2>
          <p className="text-slate-500 text-sm mb-6">
            Tell us about yourself and your goals. We&apos;ll be in touch within 24–48 hours.
          </p>
          <ApplyForm coachId={coach.id} coachSlug={coach.slug} brandColor={coach.brand_color ?? "#3B82F6"} source={source} />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by <span className="font-medium">DawFit</span>
        </p>
      </div>
    </div>
  );
}
