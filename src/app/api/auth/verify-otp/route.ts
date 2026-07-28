import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
    
    if (error || !data.user) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // Set our own secure HTTP-only cookie for session management across the app
    await setSession(email);

    return NextResponse.json({ success: true, message: "Logged in successfully" });

  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
