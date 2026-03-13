import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: tx } = await supabase
    .from("transformations")
    .select("before_photo_url, after_photo_url, testimonial, client_id")
    .eq("share_token", token)
    .eq("is_public", true)
    .maybeSingle();

  if (!tx) {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: 32 }}>Transformation not found</span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const { data: client } = await supabase
    .from("clients")
    .select("coach_id, profiles(full_name)")
    .eq("id", tx.client_id)
    .single();

  const clientProfile = Array.isArray(client?.profiles)
    ? client.profiles[0]
    : client?.profiles;
  const clientName = (clientProfile as { full_name: string | null } | null)?.full_name;

  const { data: coachData } = client
    ? await supabase
        .from("coaches")
        .select("business_name, profiles(full_name)")
        .eq("id", client.coach_id)
        .single()
    : { data: null };

  const coachProfile = Array.isArray(coachData?.profiles)
    ? coachData.profiles[0]
    : coachData?.profiles;
  const coachName = (coachProfile as { full_name: string | null } | null)?.full_name
    ?? coachData?.business_name
    ?? "DawFit Coach";

  const hasBoth = !!(tx.before_photo_url && tx.after_photo_url);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Photo area */}
        <div style={{ display: "flex", flex: 1, gap: 0 }}>
          {hasBoth ? (
            <>
              {/* Before */}
              <div style={{ position: "relative", flex: 1, display: "flex" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tx.before_photo_url!}
                  alt="before"
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: "#94a3b8",
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: 4,
                      padding: "6px 20px",
                      borderRadius: 999,
                      textTransform: "uppercase",
                    }}
                  >
                    Before
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: 4, background: "#0f172a" }} />

              {/* After */}
              <div style={{ position: "relative", flex: 1, display: "flex" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tx.after_photo_url!}
                  alt="after"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      background: "rgba(79,70,229,0.85)",
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: 4,
                      padding: "6px 20px",
                      borderRadius: 999,
                      textTransform: "uppercase",
                    }}
                  >
                    After
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Single photo fallback */
            <div style={{ flex: 1, display: "flex", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={(tx.after_photo_url ?? tx.before_photo_url)!}
                alt="transformation"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
              />
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 32px",
            background: "rgba(15,23,42,0.95)",
            borderTop: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>
              {clientName ? `${clientName}'s Transformation` : "Real Results"}
            </span>
            <span style={{ color: "#818cf8", fontSize: 15 }}>
              Coached by {coachName}
            </span>
          </div>
          <div
            style={{
              background: "#4f46e5",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: 12,
              letterSpacing: 0.5,
            }}
          >
            Apply Now →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
