import "server-only";

import { Resend } from "resend";

/**
 * Internal team inbox for GN Labs form notifications. GN Labs has no
 * site-specific contact address anywhere in its own content; this mirrors
 * the shared team inbox already wired into GN Academy's
 * (`src/content/site.ts`) and GN Club's (`lib/site.ts`) equivalent
 * notification email.
 */
export const TEAM_NOTIFICATION_EMAIL = "gnclub.contactus@gmail.com";

/**
 * Best-effort transactional sender. Mirrors the sibling GN Academy site's
 * `sendEmail` helper (`src/lib/email/send.ts`): failures are logged, never
 * thrown, so a down or unconfigured email provider never blocks a form
 * submission that has already been durably persisted to Firestore.
 *
 * `RESEND_API_KEY` is not set in this repo's `.env.local` yet — until it is,
 * this no-ops (logs a skip) rather than throwing or fabricating a key.
 */
export async function sendTeamNotification(input: {
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(`[email] skipped (RESEND_API_KEY not set): "${input.subject}"`);
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      // Resend's sandbox sender only delivers to the account that owns the
      // API key until a verified sending domain is added (see
      // PLAN-OVERVIEW.md's outstanding Resend domain list). This is an env
      // var, not a hardcoded address, so verifying gnlabs.* (or whichever
      // domain is chosen) is the only thing standing between now and mail
      // that reaches the team inbox for real.
      from: process.env.RESEND_FROM || "GN Labs <onboarding@resend.dev>",
      to: TEAM_NOTIFICATION_EMAIL,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      console.error("[email] send failed", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send failed", error);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Renders a simple label/value notification email body. Values are escaped. */
export function renderNotificationEmail(
  heading: string,
  rows: Array<[label: string, value: string | undefined]>
): string {
  const rowsHtml = rows
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) =>
        `<p style="color:#101B2E;font-size:15px;margin:4px 0;"><strong>${escapeHtml(
          label
        )}:</strong> ${escapeHtml(value!).replace(/\n/g, "<br/>")}</p>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <body style="background-color:#F5F7FA;font-family:Arial,sans-serif;">
    <div style="background-color:#ffffff;border-radius:8px;margin:24px auto;max-width:520px;padding:32px;">
      <h1 style="color:#101B2E;font-size:20px;">${escapeHtml(heading)}</h1>
      ${rowsHtml}
    </div>
  </body>
</html>`;
}
