import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

const ADMIN_EMAIL = 'jriteeshreddy@gmail.com';

export async function GET() {
  const email = await getSession();
  
  if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    // Fetch courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('name');
      
    if (coursesError) throw coursesError;

    // Fetch registrations
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('*');
      
    if (regError) throw regError;

    // Generate CSV export data
    const exportData = [];

    for (const course of courses) {
      // Find all students registered for this course in either session 1 or 2
      const registeredStudents = registrations.filter(
        r => r.session1_course_id === course.id || r.session2_course_id === course.id
      );

      for (const reg of registeredStudents) {
        exportData.push({
          CourseID: course.id,
          CourseName: course.name,
          Category: course.category,
          StudentEmail: reg.email,
          Session: reg.session1_course_id === course.id ? 1 : 2,
          RegisteredAt: reg.created_at
        });
      }
    }

    return NextResponse.json({
      courses: courses.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        maxSeats: c.max_seats,
        seats: c.seats
      })),
      exportData
    });

  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
