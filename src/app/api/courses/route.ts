import { NextResponse } from 'next/server';
import { getFullSession } from '@/lib/auth';
import { fetchRegistrations, checkStudentAuthorized, getRegistrationStatus } from '@/lib/google-sheets';
import { calculateDynamicSeats } from '@/lib/courses';

export async function GET() {
  const sessionUser = await getFullSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await checkStudentAuthorized(sessionUser.email) || sessionUser;
    const registrations = await fetchRegistrations();
    const courses = calculateDynamicSeats(registrations);
    const isRegistrationOpen = await getRegistrationStatus();

    const userRegistration = registrations.find(r => r.email.toLowerCase() === sessionUser.email.toLowerCase()) || null;

    return NextResponse.json({
      student,
      courses,
      registration: userRegistration,
      isRegistrationOpen,
    });
  } catch (error: any) {
    console.error("Courses API error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
