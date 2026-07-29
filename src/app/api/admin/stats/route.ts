import { NextResponse } from 'next/server';
import { getFullSession, isAdminEmail } from '@/lib/auth';
import { fetchRegistrations, fetchMasterStudents, getRegistrationStatus } from '@/lib/google-sheets';
import { calculateDynamicSeats } from '@/lib/courses';

export async function GET() {
  const session = await getFullSession();

  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json({ error: "Access Denied. Admin authorization required." }, { status: 403 });
  }

  try {
    const masterStudents = await fetchMasterStudents();
    const registrations = await fetchRegistrations();
    const coursesWithSeats = calculateDynamicSeats(registrations);
    const isRegistrationOpen = await getRegistrationStatus();

    return NextResponse.json({
      adminEmail: session.email,
      totalMasterStudents: masterStudents.length,
      totalRegisteredStudents: registrations.length,
      courses: coursesWithSeats,
      registrations,
      isRegistrationOpen,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
