import { NextResponse } from 'next/server';
import { getRegistrations } from '@/lib/db';
import { ALL_COURSES } from '@/lib/courses';
import { getSession } from '@/lib/auth';

const ADMIN_EMAILS = ['jriteshreddy@gmail.com'];

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_EMAILS.includes(session.email.toLowerCase())) {
      return NextResponse.json({ error: "Forbidden: Admins Only" }, { status: 403 });
    }

    const registrations = await getRegistrations();

    const courseStats = ALL_COURSES.map(course => {
      // Find students in Session 1
      const s1Students = registrations.filter(r => 
        r.s1Sports === course.id || r.s1StudentLife === course.id
      ).map(r => ({ regNo: r.regNo, name: r.name, email: r.email, timestamp: r.timestamp }));

      // Find students in Session 2
      const s2Students = registrations.filter(r => 
        r.s2Sports === course.id || r.s2StudentLife === course.id
      ).map(r => ({ regNo: r.regNo, name: r.name, email: r.email, timestamp: r.timestamp }));

      return {
        ...course,
        s1Taken: s1Students.length,
        s2Taken: s2Students.length,
        s1Remaining: Math.max(0, course.maxCapacity - s1Students.length),
        s2Remaining: Math.max(0, course.maxCapacity - s2Students.length),
        s1Students,
        s2Students
      };
    });

    return NextResponse.json({
      totalRegistrations: registrations.length,
      courses: courseStats
    });
    
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
