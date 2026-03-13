"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloudIcon,
  CopyIcon,
  CheckIcon,
  GlobeIcon,
  LockIcon,
  TrashIcon,
  ExternalLinkIcon,
} from "lucide-react";
import {
  saveTransformation,
  toggleTransformationPublic,
  deleteTransformation,
} from "@/app/dashboard/clients/[id]/transformation-actions";

interface Transformation {
  id: string;
  before_photo_url: string | null;
  after_photo_url: string | null;
  testimonial: string | null;
  share_token: string | null;
  is_public: boolean;
}

interface TransformationStudioProps {
  clientId: string;
  clientName: string;
  coachSlug: string;
  appUrl: string;
  existing: Transformation | null;
}

export function TransformationStudio({
  clientId,
  clientName,
  coachSlug,
  appUrl,
  existing,
}: TransformationStudioProps) {
  const router = useRouter();
  const supabase = createClient();

  const [beforeUrl, setBeforeUrl] = useState<string | null>(existing?.before_photo_url ?? null);
  const [afterUrl, setAfterUrl] = useState<string | null>(existing?.after_photo_url ?? null);
  const [testimonial, setTestimonial] = useState(existing?.testimonial ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"before" | "after" | null>(null);
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const shareUrl = existing?.share_token
    ? `${appUrl}/t/${existing.share_token}`
    : null;

  async function uploadPhoto(file: File, side: "before" | "after") {
    setUploading(side);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `transformations/${clientId}/${side}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("transformations")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error || !data) {
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("transformations")
      .getPublicUrl(data.path);

    if (side === "before") setBeforeUrl(publicUrl);
    else setAfterUrl(publicUrl);

    setUploading(null);
  }

  function handleFileChange(side: "before" | "after") {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadPhoto(file, side);
    };
  }

  async function handleSave() {
    setSaving(true);
    await saveTransformation(clientId, {
      testimonial: testimonial || undefined,
      before_photo_url: beforeUrl,
      after_photo_url: afterUrl,
    });
    setSaving(false);
    router.refresh();
  }

  async function handleTogglePublic() {
    if (!existing) return;
    setToggling(true);
    await toggleTransformationPublic(existing.id, clientId, !existing.is_public);
    setToggling(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm("Delete this transformation? This cannot be undone.")) return;
    setDeleting(true);
    await deleteTransformation(existing.id, clientId);
    setDeleting(false);
    router.refresh();
  }

  function copyShareLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasChanges =
    beforeUrl !== (existing?.before_photo_url ?? null) ||
    afterUrl !== (existing?.after_photo_url ?? null) ||
    testimonial !== (existing?.testimonial ?? "");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Transformation Studio</h2>
          <p className="text-sm text-slate-500">Create a shareable before/after story for {clientName}</p>
        </div>
        {existing && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            disabled={deleting}
            onClick={handleDelete}
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      {/* Photo upload grid */}
      <div className="grid grid-cols-2 gap-4">
        {(["before", "after"] as const).map(side => {
          const url = side === "before" ? beforeUrl : afterUrl;
          const ref = side === "before" ? beforeInputRef : afterInputRef;
          const isUploading = uploading === side;

          return (
            <div key={side}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                {side} photo
              </p>
              <div
                onClick={() => ref.current?.click()}
                className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors group"
              >
                {url ? (
                  <>
                    <Image
                      src={url}
                      alt={`${side} photo`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 300px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full transition-opacity">
                        Replace
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                    {isUploading ? (
                      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UploadCloudIcon className="w-8 h-8" />
                        <span className="text-xs">Click to upload</span>
                      </>
                    )}
                  </div>
                )}
                {isUploading && url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <input
                ref={ref}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange(side)}
              />
            </div>
          );
        })}
      </div>

      {/* Testimonial */}
      <div>
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
          Transformation Story
        </label>
        <Textarea
          value={testimonial}
          onChange={e => setTestimonial(e.target.value)}
          placeholder={`"${clientName} came to me wanting to…"`}
          rows={5}
          maxLength={2000}
          className="resize-none text-sm"
        />
        <p className="text-xs text-slate-400 mt-1 text-right">{testimonial.length}/2000</p>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving || (!hasChanges && !!existing)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {saving ? "Saving…" : existing ? "Save Changes" : "Create Transformation"}
      </Button>

      {/* Share controls (only once saved) */}
      {existing && shareUrl && (
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Share Page</p>
              <div className="flex items-center gap-2">
                <Badge
                  className={existing.is_public
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"}
                >
                  {existing.is_public ? (
                    <><GlobeIcon className="w-3 h-3 mr-1" />Public</>
                  ) : (
                    <><LockIcon className="w-3 h-3 mr-1" />Private</>
                  )}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={toggling}
                  onClick={handleTogglePublic}
                  className="text-xs h-7"
                >
                  {toggling ? "…" : existing.is_public ? "Make Private" : "Make Public"}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border">
              <span className="flex-1 text-xs font-mono text-slate-600 truncate">{shareUrl}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 flex-shrink-0"
                onClick={copyShareLink}
              >
                {copied
                  ? <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                  : <CopyIcon className="w-3.5 h-3.5 text-slate-400" />}
              </Button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-6 w-6 flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>

            {!existing.is_public && (
              <p className="text-xs text-slate-400">
                Make this page public so the share link works for anyone.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
