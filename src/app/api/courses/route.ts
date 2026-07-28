import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET() {
  const email = await getSession();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch courses from Supabase
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Failed to fetch courses from Supabase:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
  
  // Transform keys from snake_case to camelCase
  const formattedCourses = courses.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    maxSeats: c.max_seats,
    seats: c.seats
  }));

  // Fetch student registration
  const { data: registration } = await supabase
    .from('registrations')
    .select('*')
    .eq('email', email)
    .single();

  return NextResponse.json({
    courses: formattedCourses,
    registration: registration || { email, session1_course_id: null, session2_course_id: null }
  });
}
