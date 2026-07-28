import { NextResponse } from 'next/server';
import { checkEmailExists } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const student = await checkEmailExists(email);
    if (!student) {
      return NextResponse.json(
        { error: "You are not authorized to access this portal." },
        { status: 403 }
      );
    }

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully via Supabase" });

  } catch (error: any) {
    console.error("OTP generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
