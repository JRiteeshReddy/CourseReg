import { NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/otp';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const isValid = verifyOtpCode(email, code);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP code" }, { status: 401 });
    }

    // Create session cookie
    await setSession(email.trim().toLowerCase());

    return NextResponse.json({ success: true, message: "Logged in successfully" });

  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
