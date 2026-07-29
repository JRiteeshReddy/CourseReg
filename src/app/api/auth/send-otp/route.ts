import { NextResponse } from 'next/server';
import { checkStudentAuthorized } from '@/lib/google-sheets';
import { generateOtp } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email exists in Master Students Google Sheet BEFORE generating OTP
    const student = await checkStudentAuthorized(normalizedEmail);
    if (!student) {
      // Do NOT send OTP if email is missing from master list
      return NextResponse.json(
        { error: "You are not authorized to access this portal." },
        { status: 403 }
      );
    }

    // Email is authorized -> Generate & deliver OTP code
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
