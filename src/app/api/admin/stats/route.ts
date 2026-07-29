import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchRegistrations, fetchMasterStudents } from '@/lib/google-sheets';
import { calculateDynamicSeats, COURSES } from '@/lib/courses';

const ADMIN_EMAIL = 'jriteeshreddy@gmail.com';

export async function GET() {
  const email = await getSession();

  if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const masterStudents = await fetchMasterStudents();
    const registrations = await fetchRegistrations();
    const coursesWithSeats = calculateDynamicSeats(registrations);

    return NextResponse.json({
      totalMasterStudents: masterStudents.length,
      totalRegisteredStudents: registrations.length,
      courses: coursesWithSeats,
      registrations,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
