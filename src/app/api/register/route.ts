import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { runWithRegistrationLock } from '@/lib/concurrency';
import { fetchRegistrations, upsertRegistration, checkStudentAuthorized } from '@/lib/google-sheets';
import { calculateDynamicSeats, COURSES } from '@/lib/courses';

export async function POST(request: Request) {
  const email = await getSession();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { s1Sports, s1StudentLife, s2Sports, s2StudentLife } = await request.json();

    if (!s1Sports || !s1StudentLife || !s2Sports || !s2StudentLife) {
      return NextResponse.json({ error: "Please select all 4 required courses (Session 1 & Session 2)." }, { status: 400 });
    }

    // Execute under concurrency Mutex lock to guarantee serial seat reservation
    const result = await runWithRegistrationLock(async () => {
      const student = await checkStudentAuthorized(email);
      const regNo = student ? student.regNo : 'N/A';
      const name = student ? student.name : email.split('@')[0];

      // Fetch fresh registrations and check dynamic seat availability
      const currentRegistrations = await fetchRegistrations();
      
      // Filter out this student's existing registration when calculating seat availability
      // so editing their own choices does not count against themselves
      const otherRegistrations = currentRegistrations.filter(r => r.email.toLowerCase() !== email.toLowerCase());
      const computedSeats = calculateDynamicSeats(otherRegistrations);

      const requestedCourseIds = [s1Sports, s1StudentLife, s2Sports, s2StudentLife];

      for (const courseId of requestedCourseIds) {
        const course = computedSeats.find(c => c.id === courseId || c.name === courseId);
        if (!course) {
          return { error: `Invalid course selection: ${courseId}` };
        }

        const isS1 = (courseId === s1Sports || courseId === s1StudentLife);
        const seatsAvailable = isS1 ? course.s1SeatsAvailable : course.s2SeatsAvailable;

        if (seatsAvailable <= 0) {
          return { error: `Sorry, ${course.name} is full (${course.maxSeats}/${course.maxSeats} seats filled). Please choose another course.` };
        }
      }

      // Upsert registration (Ensures every student appears ONLY ONCE)
      await upsertRegistration({
        regNo,
        name,
        email: email.toLowerCase(),
        s1Sports,
        s1StudentLife,
        s2Sports,
        s2StudentLife,
        timestamp: new Date().toISOString(),
        status: 'CONFIRMED',
      });

      return { success: true };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Course registration confirmed successfully!" });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to process registration" }, { status: 500 });
  }
}
