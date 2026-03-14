import { Resend } from "resend";

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "DawFit <noreply@dawfit.app>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a transactional email via Resend.
 * Silently skips if RESEND_API_KEY is not set (dev/test environments).
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[Email] RESEND_API_KEY not configured — skipping email to ${to} (${subject})`);
    return;
  }

  try {
    const { error } = await getResend().emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("[Email] Resend error:", error);
    }
  } catch (err) {
    console.error("[Email] Failed to send email:", err);
  }
}

// ─── Typed email senders ────────────────────────────────────────────────────

/** Sent when a coach invites a client to the portal. */
export async function sendClientInviteEmail({
  to,
  clientName,
  coachName,
  coachBusiness,
  appUrl,
}: {
  to: string;
  clientName: string;
  coachName: string;
  coachBusiness: string;
  appUrl: string;
}) {
  await sendEmail({
    to,
    subject: `${coachBusiness} has invited you to their coaching platform`,
    html: clientInviteTemplate({ clientName, coachName, coachBusiness, appUrl }),
  });
}

/** Sent when a lead is converted to a client. */
export async function sendLeadConversionEmail({
  to,
  clientName,
  coachName,
  coachBusiness,
  appUrl,
}: {
  to: string;
  clientName: string;
  coachName: string;
  coachBusiness: string;
  appUrl: string;
}) {
  await sendEmail({
    to,
    subject: `You've been accepted — welcome to ${coachBusiness}!`,
    html: leadConversionTemplate({ clientName, coachName, coachBusiness, appUrl }),
  });
}

/** Sent to remind a client to complete their weekly check-in. */
export async function sendCheckInReminderEmail({
  to,
  clientName,
  coachBusiness,
  appUrl,
}: {
  to: string;
  clientName: string;
  coachBusiness: string;
  appUrl: string;
}) {
  await sendEmail({
    to,
    subject: `Weekly check-in reminder from ${coachBusiness}`,
    html: checkInReminderTemplate({ clientName, coachBusiness, appUrl }),
  });
}

// ─── HTML Templates ─────────────────────────────────────────────────────────

function base(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .header { background: #1e293b; padding: 28px 36px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .body { padding: 32px 36px; }
    .body p { margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6; }
    .body p:last-child { margin-bottom: 0; }
    .btn { display: inline-block; margin: 24px 0 0; padding: 13px 28px; background: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; }
    .footer { padding: 20px 36px; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>DawFit</h1></div>
    <div class="body">${body}</div>
    <div class="footer"><p>You received this email because a coach invited you to their DawFit portal. If this was unexpected, you can safely ignore it.</p></div>
  </div>
</body>
</html>`;
}

function clientInviteTemplate({
  clientName,
  coachName,
  coachBusiness,
  appUrl,
}: {
  clientName: string;
  coachName: string;
  coachBusiness: string;
  appUrl: string;
}) {
  const name = clientName || "there";
  return base(
    `You're invited to ${coachBusiness}`,
    `<p>Hi ${name},</p>
    <p><strong>${coachName}</strong> has invited you to join <strong>${coachBusiness}</strong>'s coaching platform powered by DawFit.</p>
    <p>Once you set up your account, you'll be able to:</p>
    <p>• View your personalized workout programs<br/>
    • Log your workouts and track progress<br/>
    • Submit weekly check-ins to your coach<br/>
    • Message your coach directly</p>
    <a href="${appUrl}/client" class="btn">Set up my account →</a>
    <p style="margin-top:20px; font-size:13px; color:#64748b;">Your invitation link was sent separately by ${coachBusiness}. Click the link in that email first to activate your account, then use the button above to access your portal.</p>`
  );
}

function leadConversionTemplate({
  clientName,
  coachName,
  coachBusiness,
  appUrl,
}: {
  clientName: string;
  coachName: string;
  coachBusiness: string;
  appUrl: string;
}) {
  const name = clientName || "there";
  return base(
    `Welcome to ${coachBusiness}!`,
    `<p>Hi ${name},</p>
    <p>Great news — <strong>${coachName}</strong> has accepted your application and you're now an official client of <strong>${coachBusiness}</strong>!</p>
    <p>You'll receive a separate email shortly with a link to set up your account password. Once you're in, your training portal will be ready with everything your coach has prepared for you.</p>
    <a href="${appUrl}/client" class="btn">Go to my portal →</a>
    <p style="margin-top:20px; font-size:13px; color:#64748b;">Questions? Reply to this email or message your coach directly through the platform.</p>`
  );
}

function checkInReminderTemplate({
  clientName,
  coachBusiness,
  appUrl,
}: {
  clientName: string;
  coachBusiness: string;
  appUrl: string;
}) {
  const name = clientName || "there";
  return base(
    `Weekly check-in reminder`,
    `<p>Hi ${name},</p>
    <p>Your coach at <strong>${coachBusiness}</strong> is waiting for your weekly check-in. It only takes a few minutes and helps your coach adjust your program for the week ahead.</p>
    <p>Share how you're feeling, your energy levels, sleep, and any wins or struggles from the past week.</p>
    <a href="${appUrl}/client/check-in" class="btn">Complete my check-in →</a>
    <p style="margin-top:20px; font-size:13px; color:#64748b;">Consistent check-ins = better results. Your coach reviews every submission.</p>`
  );
}
