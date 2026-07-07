import "server-only";
import { Resend } from "resend";
import { siteConfig } from "@/lib/constants";
import { formatDate, formatDistance } from "@/lib/utils";
import type { Event, Registration } from "@/types";

let resendClient: Resend | null = null;

async function getResendClient(): Promise<Resend | null> {
  const { serverEnv } = await import("@/lib/env.server");
  if (!serverEnv.RESEND_API_KEY) return null;

  if (!resendClient) {
    resendClient = new Resend(serverEnv.RESEND_API_KEY);
  }
  return resendClient;
}

function registrationConfirmationHtml(registration: Registration, event: Event): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
    <div style="background:#0A0A0B; padding: 24px; text-align:center;">
      <span style="color:#C9A227; font-size: 20px; font-weight: bold; letter-spacing: 2px;">
        ${siteConfig.name.toUpperCase()}
      </span>
    </div>
    <div style="padding: 32px 24px;">
      <h1 style="font-size: 22px; margin-bottom: 8px;">You're registered, ${registration.fullName.split(" ")[0]}! 🏍️</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #444;">
        Your spot for <strong>${event.title}</strong> is confirmed. Here are the ride details:
      </p>
      <table style="width:100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
        <tbody>
          <tr><td style="padding:8px 0; color:#777;">Destination</td><td style="padding:8px 0; text-align:right; font-weight:bold;">${event.destination}</td></tr>
          <tr><td style="padding:8px 0; color:#777;">Date</td><td style="padding:8px 0; text-align:right; font-weight:bold;">${formatDate(event.startDate)}</td></tr>
          <tr><td style="padding:8px 0; color:#777;">Meeting Point</td><td style="padding:8px 0; text-align:right; font-weight:bold;">${event.meetingPoint}</td></tr>
          <tr><td style="padding:8px 0; color:#777;">Meeting Time</td><td style="padding:8px 0; text-align:right; font-weight:bold;">${event.meetingTime}</td></tr>
          <tr><td style="padding:8px 0; color:#777;">Distance</td><td style="padding:8px 0; text-align:right; font-weight:bold;">${formatDistance(event.distanceKm)}</td></tr>
          <tr><td style="padding:8px 0; color:#777;">Ride Captain</td><td style="padding:8px 0; text-align:right; font-weight:bold;">${event.rideCaptainName}</td></tr>
        </tbody>
      </table>
      <div style="margin-top: 24px; padding: 16px; background: #f5f5f3; border-radius: 8px; font-size: 13px; color: #555;">
        <strong>Before you ride:</strong> full gear is mandatory (helmet, jacket, gloves, boots). Arrive 15 minutes
        before the meeting time for the safety briefing and mechanical check.
      </div>
      <p style="font-size: 13px; color: #999; margin-top: 24px;">
        Ride responsibly. See you on the road.<br />${siteConfig.name}
      </p>
    </div>
  </div>`;
}

/**
 * Sends the registration confirmation email. Fails soft (logs and returns
 * false) when RESEND_API_KEY isn't configured or the send fails — a missing
 * confirmation email should never roll back a successful registration that's
 * already stored in the database.
 */
export async function sendRegistrationConfirmationEmail(
  registration: Registration,
  event: Event
): Promise<boolean> {
  const resend = await getResendClient();

  if (!resend) {
    console.warn(
      "RESEND_API_KEY not configured — skipping registration confirmation email. See .env.example."
    );
    return false;
  }

  try {
    const { serverEnv } = await import("@/lib/env.server");
    await resend.emails.send({
      from: serverEnv.EMAIL_FROM || `${siteConfig.name} <onboarding@resend.dev>`,
      to: registration.email,
      replyTo: serverEnv.EMAIL_REPLY_TO || siteConfig.contact.email,
      subject: `You're registered: ${event.title}`,
      html: registrationConfirmationHtml(registration, event),
    });
    return true;
  } catch (error) {
    console.error("Failed to send registration confirmation email:", error);
    return false;
  }
}
