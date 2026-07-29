import { NextResponse } from 'next/server';
import { getFullSession } from '@/lib/auth';
import { clearRegistrationsCache } from '@/lib/google-sheets';
import { supabase } from '@/lib/supabase';

const RESET_SECURITY_PASSWORD = "##110ctO05";

export async function POST(request: Request) {
  try {
    const sessionUser = await getFullSession();
    if (!sessionUser || !sessionUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { confirmPassword } = await request.json();

    if (!confirmPassword || confirmPassword !== RESET_SECURITY_PASSWORD) {
      return NextResponse.json({
        error: "Incorrect security password. Access denied."
      }, { status: 401 });
    }

    // 1. Delete all rows from Supabase registrations table
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .neq('email', ''); // Deletes all rows

      if (error) {
        console.error("Supabase reset query error:", error.message);
      }
    } catch (err) {
      console.error("Supabase delete exception:", err);
    }

    // 2. Clear in-memory registrations cache
    clearRegistrationsCache();

    console.log(`[ADMIN RESET] All student registration test data cleared by ${sessionUser.email} using security password.`);

    return NextResponse.json({
      success: true,
      message: "All registration test data has been successfully cleared.",
    });

  } catch (error: any) {
    console.error("Admin reset error:", error);
    return NextResponse.json({ error: "Failed to reset registration data" }, { status: 500 });
  }
}
