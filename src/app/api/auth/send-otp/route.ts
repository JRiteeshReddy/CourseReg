import { NextResponse } from 'next/server';
import { checkStudentAuthorized } from '@/lib/google-sheets';
import { isAdminEmail } from '@/lib/auth';
import { generateOtp } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email belongs to Admin Whitelist OR Master Students Google Sheet
    const isAdmin = isAdminEmail(normalizedEmail);
    const student = await checkStudentAuthorized(normalizedEmail);

    if (!isAdmin && !student) {
      // Do NOT send OTP if email is missing from both whitelist and master list
      return NextResponse.json(
        { error: "You are not authorized to access this portal." },
        { status: 403 }
      );
    }

    // Authorized -> Generate & deliver OTP code
    generateOtp(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: "OTP generated and delivered successfully."
    });

  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to process OTP request" }, { status: 500 });
  }
}
