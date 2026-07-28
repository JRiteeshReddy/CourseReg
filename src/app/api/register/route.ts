import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const email = await getSession();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId, session } = await request.json();
    if (!courseId || !session) {
      return NextResponse.json({ error: "Missing courseId or session" }, { status: 400 });
    }

    // Use Postgres RPC for atomic decrements
    const { data: success, error } = await supabase.rpc('register_course', {
      student_email: email,
      course_id: courseId,
      session_num: session
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json({ error: "Database error during registration." }, { status: 500 });
    }

    if (!success) {
      return NextResponse.json({ error: "Course is full or does not exist." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Registered successfully" });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}
