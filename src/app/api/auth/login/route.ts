import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { setSession } from '@/lib/auth';
import { checkEmailExists } from '@/lib/db';

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
        { error: "Didn't register to DOSL course" },
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
    return NextResponse.json(
      { error: error.message || "Failed to log in." },
      { status: 500 }
    );
  }
}
