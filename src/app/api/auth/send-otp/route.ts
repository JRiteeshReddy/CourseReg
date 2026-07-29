import { NextResponse } from 'next/server';
import { checkStudentAuthorized } from '@/lib/google-sheets';
import { generateOtp } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify student is pre-approved in Google Sheets Master List
    const student = await checkStudentAuthorized(normalizedEmail);
    if (!student) {
      return NextResponse.json(
        { error: "student not registered" },
        { status: 403 }
      );
    }

    // Generate & deliver OTP code
    generateOtp(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully. Check your terminal logs for the code!"
    });

  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
