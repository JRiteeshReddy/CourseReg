import { NextResponse } from 'next/server';
import { checkStudentAuthorized } from '@/lib/google-sheets';
import { isAdminEmail } from '@/lib/auth';
import { generateOtp } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check authorization against Master Students list or Admin Whitelist
    const isAdmin = isAdminEmail(normalizedEmail);
    const student = await checkStudentAuthorized(normalizedEmail);

    if (!isAdmin && !student) {
      return NextResponse.json(
        { error: "You are not authorized to access this portal." },
        { status: 403 }
      );
    }

    // 1. Generate local 6-digit OTP code
    const code = generateOtp(normalizedEmail);

    // 2. Deliver via Resend API
    const resendResult = await sendOtpEmail(normalizedEmail, code);

    if (!resendResult.success) {
      console.error("[RESEND DELIVERY FAILURE]:", resendResult.error);
      return NextResponse.json({
        error: `Resend Email Delivery Failed: ${resendResult.error}`,
      }, { status: 400 });
    }

    console.log(`[RESEND SUCCESS] Sent 6-digit OTP (${code}) to ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: `OTP delivered to ${normalizedEmail} via Resend. Please check your inbox and spam folder!`,
    });

  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to process OTP request" }, { status: 500 });
  }
}
