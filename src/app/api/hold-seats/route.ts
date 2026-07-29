import { NextResponse } from 'next/server';
import { getFullSession } from '@/lib/auth';
import { fetchRegistrations, fetchActiveSeatHolds, upsertSeatHold } from '@/lib/google-sheets';
import { calculateDynamicSeats } from '@/lib/courses';

export async function POST(request: Request) {
  const sessionUser = await getFullSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const choices = await request.json();
    const activeHolds = upsertSeatHold(sessionUser.email, choices);

    const registrations = await fetchRegistrations();
    const updatedCourses = calculateDynamicSeats(registrations, activeHolds);

    return NextResponse.json({
      success: true,
      courses: updatedCourses,
    });
  } catch (err) {
    console.error("Error updating seat holds:", err);
    return NextResponse.json({ error: "Failed to update seat hold" }, { status: 500 });
  }
}
