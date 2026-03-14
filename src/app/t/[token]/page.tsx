import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // re-validate at most every hour

interface Props {
  params: Promise<{ token: string }>;
}

async function getTransformation(token: string) {
  const supabase = await createClient();

  const { data: tx } = await supabase
    .from("transformations")
    .select("id, before_photo_url, after_photo_url, testimonial, client_id")
    .eq("share_token", token)
    .eq("is_public", true)
    .maybeSingle();

  if (!tx) return null;

  // Load client profile + coach
  const { data: client } = await supabase
    .from("clients")
    .select("coach_id, profiles(full_name)")
    .eq("id", tx.client_id)
    .single();

  if (!client) return null;

  const clientProfile = Array.isArray(client.profiles)
    ? client.profiles[0]
    : client.profiles;

  const { data: coachData } = await supabase
    .from("coaches")
    .select("slug, business_name, profiles(full_name)")
    .eq("id", client.coach_id)
    .single();

  const coachProfile = Array.isArray(coachData?.profiles)
    ? coachData.profiles[0]
    : coachData?.profiles;

  return {
    ...tx,
    client_name: (clientProfile as { full_name: string | null } | null)?.full_name ?? null,
    coach_name: (coachProfile as { full_name: string | null } | null)?.full_name
      ?? coachData?.business_name
      ?? "Coach",
    coach_slug: coachData?.slug ?? null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const tx = await getTransformation(token);

  if (!tx) return { title: "Transformation | DawFit" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dawfit.app";
  const title = tx.client_name
    ? `${tx.client_name}'s Transformation`
    : "Client Transformation";
  const description = tx.testimonial
    ? tx.testimonial.slice(0, 160)
    : `An incredible transformation journey coached by ${tx.coach_name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/t/${token}`,
      siteName: "DawFit",
      images: tx.after_photo_url
        ? [
            {
              url: `${appUrl}/t/${token}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: tx.after_photo_url ? [`${appUrl}/t/${token}/opengraph-image`] : [],
    },
  };
}

export default async function TransformationSharePage({ params }: Props) {
  const { token } = await params;
  const tx = await getTransformation(token);

  if (!tx) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dawfit.app";
  const applyUrl = tx.coach_slug ? `${appUrl}/apply/${tx.coach_slug}` : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">
            Real Results
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {tx.client_name ? `${tx.client_name}'s Transformation` : "An Amazing Transformation"}
          </h1>
          <p className="text-slate-400 text-sm">Coached by {tx.coach_name}</p>
        </div>

        {/* Before / After photos */}
        {(tx.before_photo_url || tx.after_photo_url) && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-12">
            {(["before", "after"] as const).map(side => {
              const url = side === "before" ? tx.before_photo_url : tx.after_photo_url;
              return (
                <div key={side} className="space-y-2">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800">
                    {url ? (
                      <Image
                        src={url}
                        alt={`${side} photo`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 45vw, 320px"
                        priority={side === "after"}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
                        No photo
                      </div>
                    )}
                  </div>
                  <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {side}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Testimonial */}
        {tx.testimonial && (
          <div className="mb-12">
            <blockquote className="relative">
              <span className="absolute -top-4 -left-2 text-6xl text-indigo-800 font-serif leading-none select-none" aria-hidden>
                &ldquo;
              </span>
              <p className="relative text-lg sm:text-xl text-slate-200 leading-relaxed italic pt-4 px-4">
                {tx.testimonial}
              </p>
              <span className="absolute -bottom-8 right-0 text-6xl text-indigo-800 font-serif leading-none select-none" aria-hidden>
                &rdquo;
              </span>
            </blockquote>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-slate-800 my-12" />

        {/* Coach CTA */}
        <div className="text-center space-y-4">
          <p className="text-slate-300 text-lg font-medium">
            Ready to start your own transformation?
          </p>
          <p className="text-slate-500 text-sm">
            Work with {tx.coach_name} and get a personalized coaching program.
          </p>
          {applyUrl && (
            <Link
              href={applyUrl}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Apply to Work with {tx.coach_name}
            </Link>
          )}
        </div>

        {/* Growth footer */}
        <p className="text-center text-xs text-slate-400 mt-10">
          <Link href="/" className="hover:text-indigo-500 transition-colors">
            Built with DawFit
          </Link>
        </p>
        </div>

    </div>
  );
}
