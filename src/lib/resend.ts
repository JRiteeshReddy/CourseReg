import { Resend } from 'resend';
import { renderOtpEmailHtml } from './otp';

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY || '';
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/**
 * Sends a 6-digit OTP email directly using Resend
 */
export async function sendOtpEmail(toEmail: string, code: string): Promise<{ success: boolean; error?: string }> {
  const client = getResendClient();

  if (!client) {
    console.warn("[RESEND WARNING] RESEND_API_KEY is not set in environment variables.");
    return {
      success: false,
      error: "RESEND_API_KEY is missing. Please add RESEND_API_KEY to your .env.local / Vercel Environment Variables.",
    };
  }

  try {
    const html = renderOtpEmailHtml(code);

    // Default Resend testing sender domain is 'onboarding@resend.dev'
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Campus Life Registration <onboarding@resend.dev>';

    const response = await client.emails.send({
      from: fromAddress,
      to: toEmail,
      subject: `Your Verification Code: ${code}`,
      html: html,
    });

    if (response.error) {
      console.error("[RESEND ERROR]:", response.error);
      return { success: false, error: response.error.message };
    }

    console.log(`[RESEND SUCCESS] Sent 6-digit OTP code to ${toEmail}. Message ID: ${response.data?.id}`);
    return { success: true };

  } catch (err: any) {
    console.error("[RESEND EXCEPTION]:", err);
    return { success: false, error: err?.message || "Failed to send email via Resend" };
  }
}
