import { NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/otp';
import { setSession } from '@/lib/auth';
import { checkStudentAuthorized } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP code
    const isValid = verifyOtpCode(normalizedEmail, code);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP code" }, { status: 401 });
    }

    // Automatically retrieve student profile (Registration Number, Student Name, Email) from Master Google Sheet
    const student = await checkStudentAuthorized(normalizedEmail);
    if (!student) {
      return NextResponse.json(
        { error: "You are not authorized to access this portal." },
        { status: 403 }
      );
    }

    // Store complete authenticated profile in secure HTTP-only JWT cookie
    await setSession({
      email: student.email,
      name: student.name,
      regNo: student.regNo,
    });

    return NextResponse.json({
      success: true,
      message: "Authenticated successfully",
      student: {
        email: student.email,
        name: student.name,
        regNo: student.regNo,
      }
    });

  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
