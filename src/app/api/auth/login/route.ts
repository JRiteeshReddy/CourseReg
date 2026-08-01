import { NextResponse } from 'next/server';
import { setSession, isAdminEmail } from '@/lib/auth';
import { checkStudentAuthorized } from '@/lib/google-sheets';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Compute default expected password: <prefix>@reg_pass
    const prefix = normalizedEmail.split('@')[0];
    const expectedPassword = `${prefix}@reg_pass`;

    // 1. Check if user has a custom password set in student_passwords
    let isValidPassword = false;
    try {
      const { data, error } = await supabase
        .from('student_passwords')
        .select('password_hash')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (!error && data && data.password_hash) {
        isValidPassword = await bcrypt.compare(cleanPassword, data.password_hash);
      } else {
        // Fall back to default password verification
        isValidPassword = cleanPassword === expectedPassword;
      }
    } catch (dbErr) {
      console.error("Error querying student_passwords table:", dbErr);
      isValidPassword = cleanPassword === expectedPassword;
    }

    if (!isValidPassword) {
      return NextResponse.json({
        error: `Invalid password. If you haven't changed your password, your default password is ${prefix || 'username'}@reg_pass`
      }, { status: 401 });
    }

    // 2. Check authorization against Master Students list or Admin Whitelist
    const isAdmin = isAdminEmail(normalizedEmail);
    const student = await checkStudentAuthorized(normalizedEmail);

    if (!isAdmin && !student) {
      return NextResponse.json(
        { error: "You are not authorized to access this portal." },
        { status: 403 }
      );
    }

    // 3. Set secure HTTP-Only session token
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to process login request" }, { status: 500 });
  }
}
