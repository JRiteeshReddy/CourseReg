import { NextResponse } from 'next/server';
import { getFullSession } from '@/lib/auth';
import { deleteStudentRegistration, fetchRegistrations } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const sessionUser = await getFullSession();
    if (!sessionUser || !sessionUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { studentEmail, studentQuery } = await request.json();
    const query = (studentQuery || studentEmail || '').trim();

    if (!query) {
      return NextResponse.json({ error: "Student email address or Registration Number is required." }, { status: 400 });
    }

    const registrations = await fetchRegistrations();
    const targetReg = registrations.find(
      r => r.email.toLowerCase() === query.toLowerCase() || r.regNo.toLowerCase() === query.toLowerCase()
    );

    const result = await deleteStudentRegistration(query);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to reset student registration." }, { status: 400 });
    }

    const studentInfo = targetReg 
      ? `${targetReg.name} (${targetReg.regNo} - ${targetReg.email})` 
      : query;

    return NextResponse.json({
      success: true,
      message: `Course registration for ${studentInfo} has been reset successfully. The student can now register again.`,
    });

  } catch (error: any) {
    console.error("Reset student registration error:", error);
    return NextResponse.json({ error: "Failed to process course registration reset request." }, { status: 500 });
  }
}
