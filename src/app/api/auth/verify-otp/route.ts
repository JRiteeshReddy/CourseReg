import { NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/otp';
import { setSession, isAdminEmail } from '@/lib/auth';
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

    const isAdmin = isAdminEmail(normalizedEmail);
    const student = await checkStudentAuthorized(normalizedEmail);

    if (!isAdmin && !student) {
      return NextResponse.json(
        { error: "You are not authorized to access this portal." },
        { status: 403 }
      );
    }

    // Set secure HTTP-Only session token with Admin role flag
    await setSession({
      email: normalizedEmail,
      name: student?.name || (isAdmin ? "System Administrator" : normalizedEmail.split('@')[0]),
      regNo: student?.regNo || (isAdmin ? "ADMIN-01" : "N/A"),
      isAdmin,
    });

    return NextResponse.json({
      success: true,
      message: "Authenticated successfully",
      isAdmin,
      redirectTo: isAdmin ? "/admin" : "/dashboard"
    });

  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
