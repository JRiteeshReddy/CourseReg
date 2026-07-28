import { NextResponse } from 'next/server';
import { checkEmailExists } from '@/lib/google-sheets';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const student = await checkEmailExists(email);
    if (!student) {
      return NextResponse.json(
        { error: "student not registered" },
        { status: 403 }
      );
    }

    const { error } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "Verification email sent successfully." });

  } catch (error: any) {
    console.error("Signup error:", error);
    let message = error.message || "Failed to sign up. Please try again.";
    if (message.includes("fetch failed") || message.includes("ENOTFOUND")) {
      message = "Could not connect to Supabase authentication server. Please check your internet connection or restart your dev server to load environment variables.";
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
