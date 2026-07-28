import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { setSession } from '@/lib/auth';
import { checkEmailExists } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Double check GS to ensure they are still authorized even if they have an account
    const student = await checkEmailExists(email);
    if (!student) {
      return NextResponse.json(
        { error: "student not registered" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error || !data.user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Set secure HTTP-only cookie
    await setSession(email);

    return NextResponse.json({ success: true, message: "Logged in successfully" });

  } catch (error: any) {
    console.error("Login error:", error);
    let message = error.message || "Failed to log in.";
    if (message.includes("fetch failed") || message.includes("ENOTFOUND")) {
      message = "Could not connect to Supabase authentication server. Please check your internet connection or restart your dev server to load environment variables.";
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
