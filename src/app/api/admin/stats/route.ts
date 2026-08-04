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

    const masterMap = new Map<string, string>();
    masterStudents.forEach((s) => {
      if (s.email) masterMap.set(s.email.toLowerCase(), s.facultyName || "");
      if (s.regNo) masterMap.set(s.regNo.toLowerCase(), s.facultyName || "");
    });

    const enrichedRegistrations = registrations.map((r) => ({
      ...r,
      facultyName:
        r.facultyName ||
        masterMap.get((r.email || "").toLowerCase()) ||
        masterMap.get((r.regNo || "").toLowerCase()) ||
        "",
    }));

    const coursesWithSeats = calculateDynamicSeats(enrichedRegistrations);
    const isRegistrationOpen = await getRegistrationStatus();

    return NextResponse.json({
      adminEmail: session.email,
      totalMasterStudents: masterStudents.length,
      totalRegisteredStudents: enrichedRegistrations.length,
      courses: coursesWithSeats,
      registrations: enrichedRegistrations,
      masterStudents,
      isRegistrationOpen,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
