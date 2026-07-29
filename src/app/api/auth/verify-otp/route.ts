import { NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/otp';
import { setSession, isAdminEmail } from '@/lib/auth';
import { checkStudentAuthorized } from '@/lib/google-sheets';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = String(code).trim();

    let isValid = false;

    // 1. Verify 6-digit code against memory store (sent via Resend)
    isValid = verifyOtpCode(normalizedEmail, cleanCode);

    // 2. Fallback check against Supabase Auth
    if (!isValid) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: cleanCode,
          type: 'email',
        });

        if (!error && data?.session) {
          isValid = true;
        }
      } catch (err) {
        // Ignore Supabase check error
      }
    }

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
