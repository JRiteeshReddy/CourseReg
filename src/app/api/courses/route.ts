import { NextResponse } from 'next/server';
import { getRegistrations } from '@/lib/db';
import { ALL_COURSES } from '@/lib/courses';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await getRegistrations();

    const courseStats = ALL_COURSES.map(course => {
      // Calculate seats taken in session 1
      const s1Taken = registrations.filter(r => 
        r.s1Sports === course.id || r.s1StudentLife === course.id
      ).length;

      // Calculate seats taken in session 2
      const s2Taken = registrations.filter(r => 
        r.s2Sports === course.id || r.s2StudentLife === course.id
      ).length;

      return {
        ...course,
        session1Remaining: Math.max(0, course.maxCapacity - s1Taken),
        session2Remaining: Math.max(0, course.maxCapacity - s2Taken)
      };
    });

    // Also get the current user's registration if any
    const userRegistration = registrations.find(r => r.email === session.email);

    return NextResponse.json({
      courses: courseStats,
      userRegistration: userRegistration || null
    });
  } catch (error) {
    console.error("Courses API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
