import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchRegistrations, checkStudentAuthorized } from '@/lib/google-sheets';
import { calculateDynamicSeats } from '@/lib/courses';

export async function GET() {
  const email = await getSession();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await checkStudentAuthorized(email);
    const registrations = await fetchRegistrations();
    const courses = calculateDynamicSeats(registrations);

    const userRegistration = registrations.find(r => r.email.toLowerCase() === email.toLowerCase()) || null;

    return NextResponse.json({
      student: student || { email, name: email.split('@')[0], regNo: 'N/A' },
      courses,
      registration: userRegistration,
    });
  } catch (error: any) {
    console.error("Courses API error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
