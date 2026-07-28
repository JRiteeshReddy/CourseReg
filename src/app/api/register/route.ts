import { NextResponse } from 'next/server';
import { getRegistrations, saveRegistration, checkEmailExists } from '@/lib/db';
import { ALL_COURSES } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { registrationMutex } from '@/lib/lock';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { s1Sports, s1StudentLife, s2Sports, s2StudentLife } = body;

    if (!s1Sports || !s1StudentLife || !s2Sports || !s2StudentLife) {
      return NextResponse.json({ error: "Missing selections" }, { status: 400 });
    }

    // Validate no duplicates between sessions
    if (s1Sports === s2Sports || s1StudentLife === s2StudentLife) {
      return NextResponse.json({ error: "Cannot select the same course in both sessions" }, { status: 400 });
    }

    const student = await checkEmailExists(session.email);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Lock for atomic operations
    await registrationMutex.lock();

    try {
      const registrations = await getRegistrations();
      
      // Check if already registered
      if (registrations.some(r => r.email === session.email)) {
        return NextResponse.json({ error: "Already registered" }, { status: 400 });
      }

      // Re-calculate seats to ensure capacity
      const s1SportsCount = registrations.filter(r => r.s1Sports === s1Sports).length;
      const s1SLCount = registrations.filter(r => r.s1StudentLife === s1StudentLife).length;
      const s2SportsCount = registrations.filter(r => r.s2Sports === s2Sports).length;
      const s2SLCount = registrations.filter(r => r.s2StudentLife === s2StudentLife).length;

      const getCap = (id: string) => ALL_COURSES.find(c => c.id === id)?.maxCapacity || 0;

      if (
        s1SportsCount >= getCap(s1Sports) ||
        s1SLCount >= getCap(s1StudentLife) ||
        s2SportsCount >= getCap(s2Sports) ||
        s2SLCount >= getCap(s2StudentLife)
      ) {
        return NextResponse.json({ error: "One or more selected courses are full" }, { status: 409 });
      }

      // Save registration
      await saveRegistration({
        regNo: student.regNo,
        name: student.name,
        email: student.email,
        s1Sports,
        s1StudentLife,
        s2Sports,
        s2StudentLife,
        timestamp: new Date().toISOString()
      });

    } finally {
      registrationMutex.unlock();
    }

    return NextResponse.json({ success: true, message: "Registration confirmed" });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
