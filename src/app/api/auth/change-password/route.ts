import { NextResponse } from 'next/server';
import { getFullSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const sessionUser = await getFullSession();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    const email = sessionUser.email.toLowerCase().trim();
    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();

    // 1. Verify current password
    const prefix = email.split('@')[0];
    const defaultPassword = `${prefix}@reg_pass`;

    const { data: existingRecord } = await supabase
      .from('student_passwords')
      .select('password_hash')
      .eq('email', email)
      .maybeSingle();

    let isCurrentValid = false;

    if (existingRecord && existingRecord.password_hash) {
      isCurrentValid = await bcrypt.compare(cleanCurrent, existingRecord.password_hash);
    } else {
      isCurrentValid = cleanCurrent === defaultPassword;
    }

    if (!isCurrentValid) {
      return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
    }

    // 2. Hash new password & upsert into student_passwords
    const newHash = await bcrypt.hash(cleanNew, 10);

    const { error: upsertError } = await supabase
      .from('student_passwords')
      .upsert({
        email: email,
        password_hash: newHash,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (upsertError) {
      console.error("Failed to update student password:", upsertError);
      return NextResponse.json({ error: "Failed to update password in database." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!"
    });

  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to process password change request." }, { status: 500 });
  }
}
