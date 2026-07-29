import { NextResponse } from 'next/server';
import { getFullSession } from '@/lib/auth';
import { runWithRegistrationLock } from '@/lib/concurrency';
import { fetchRegistrations, upsertRegistration, checkStudentAuthorized } from '@/lib/google-sheets';
import { calculateDynamicSeats } from '@/lib/courses';

export async function POST(request: Request) {
  const sessionUser = await getFullSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { s1Sports, s1StudentLife, s2Sports, s2StudentLife } = await request.json();

    // 1. Validation: All 4 courses must be selected
    if (!s1Sports || !s1StudentLife || !s2Sports || !s2StudentLife) {
      return NextResponse.json({ error: "Please select all 4 required courses (Session 1 Sports & Student Life, Session 2 Sports & Student Life)." }, { status: 400 });
    }

    // 2. Validation: Selected courses cannot be identical across sessions
    if (s1Sports === s2Sports) {
      return NextResponse.json({ error: "You cannot select the same Sports course for both Session 1 and Session 2." }, { status: 400 });
    }
    if (s1StudentLife === s2StudentLife) {
      return NextResponse.json({ error: "You cannot select the same Student Life course for both Session 1 and Session 2." }, { status: 400 });
    }

    // Execute under concurrency Mutex lock to guarantee serial seat reservation and prevent race conditions
    const result = await runWithRegistrationLock(async () => {
      const student = await checkStudentAuthorized(sessionUser.email) || sessionUser;

      const currentRegistrations = await fetchRegistrations();
      
      // 3. Validation: Student has not already completed registration (Read-only forever after registration)
      const existingReg = currentRegistrations.find(r => r.email.toLowerCase() === sessionUser.email.toLowerCase());
      if (existingReg && existingReg.status?.toUpperCase() === 'CONFIRMED') {
        return { error: "You have already completed your registration. Your course selections are locked and read-only." };
      }

      // Compute dynamic seat counts over current registrations
      const computedSeats = calculateDynamicSeats(currentRegistrations);

      // 4. Validation: Check seat capacity for all 4 courses
      const s1SportsCourse = computedSeats.find(c => c.id === s1Sports || c.name === s1Sports);
      if (!s1SportsCourse || s1SportsCourse.s1SeatsAvailable <= 0) {
        return { error: `Sorry, Session 1 Sports (${s1SportsCourse?.name || s1Sports}) is full.` };
      }

      const s1LifeCourse = computedSeats.find(c => c.id === s1StudentLife || c.name === s1StudentLife);
      if (!s1LifeCourse || s1LifeCourse.s1SeatsAvailable <= 0) {
        return { error: `Sorry, Session 1 Student Life (${s1LifeCourse?.name || s1StudentLife}) is full.` };
      }

      const s2SportsCourse = computedSeats.find(c => c.id === s2Sports || c.name === s2Sports);
      if (!s2SportsCourse || s2SportsCourse.s2SeatsAvailable <= 0) {
        return { error: `Sorry, Session 2 Sports (${s2SportsCourse?.name || s2Sports}) is full.` };
      }

      const s2LifeCourse = computedSeats.find(c => c.id === s2StudentLife || c.name === s2StudentLife);
      if (!s2LifeCourse || s2LifeCourse.s2SeatsAvailable <= 0) {
        return { error: `Sorry, Session 2 Student Life (${s2LifeCourse?.name || s2LifeCourse}) is full.` };
      }

      // Atomically save: RegNo, Student Name, Email, Session 1 Sports, Session 1 Life, Session 2 Sports, Session 2 Life, Timestamp
      await upsertRegistration({
        regNo: student.regNo,
        name: student.name,
        email: student.email.toLowerCase(),
        s1Sports: s1SportsCourse.name,
        s1StudentLife: s1LifeCourse.name,
        s2Sports: s2SportsCourse.name,
        s2StudentLife: s2LifeCourse.name,
        timestamp: new Date().toISOString(),
        status: 'CONFIRMED',
      });

      return { success: true };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Registration completed successfully! Your choices are now locked." });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to complete registration" }, { status: 500 });
  }
}
