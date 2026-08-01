import { NextResponse } from 'next/server';
import { getFullSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const sessionUser = await getFullSession();
    if (!sessionUser || !sessionUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { studentEmail } = await request.json();

    if (!studentEmail || typeof studentEmail !== 'string') {
      return NextResponse.json({ error: "Student email address is required." }, { status: 400 });
    }

    const normalizedEmail = studentEmail.trim().toLowerCase();
    const prefix = normalizedEmail.split('@')[0];

    // Delete custom password record for this student so it reverts back to default (<prefix>@reg_pass)
    const { error } = await supabase
      .from('student_passwords')
      .delete()
      .eq('email', normalizedEmail);

    if (error) {
      console.error("Error resetting student password:", error);
      return NextResponse.json({ error: "Failed to reset student password in database." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Password for ${normalizedEmail} reset to default (${prefix}@reg_pass).`
    });

  } catch (error: any) {
    console.error("Reset student password error:", error);
    return NextResponse.json({ error: "Failed to process password reset request." }, { status: 500 });
  }
}
