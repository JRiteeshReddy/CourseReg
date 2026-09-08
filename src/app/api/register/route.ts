import { NextResponse } from 'next/server';
import { getFullSession } from '@/lib/auth';
import { runWithRegistrationLock } from '@/lib/concurrency';
import { fetchRegistrations, upsertRegistration, checkStudentAuthorized, getRegistrationStatus } from '@/lib/google-sheets';
import { calculateDynamicSeats, COURSES, matchCourse, parseSportsDay, parseDay } from '@/lib/courses';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const sessionUser = await getFullSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if Registration is OPEN by Admin
  const isRegistrationOpen = await getRegistrationStatus();
  if (!isRegistrationOpen) {
    return NextResponse.json({
      error: "Course registration is currently CLOSED by the Administrator. Please try again when registration opens."
    }, { status: 403 });
  }

  try {
    const { s2Sports, s2StudentLife } = await request.json();

    // 1. Validation: Both Session 2 courses must be selected
    if (!s2Sports || !s2StudentLife) {
      return NextResponse.json({ error: "Please select both Session 2 Sports and Student Life courses." }, { status: 400 });
    }

    const student = await checkStudentAuthorized(sessionUser.email) || sessionUser;

    const allRegs = await fetchRegistrations();
    const calculatedCourses = calculateDynamicSeats(allRegs);

    // Resolve course objects
    const s2SportsObj = calculatedCourses.find(c => matchCourse(s2Sports, c.id, c.name));
    const s2LifeObj = calculatedCourses.find(c => matchCourse(s2StudentLife, c.id, c.name));

    const s1SportsName = "";
    const s1LifeName = "";
    const s2SportsName = s2Sports;
    const s2LifeName = s2StudentLife;

    // 3. Attempt Atomic Database Seat Reservation in Supabase Postgres RPC (locks natively across all serverless instances)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('reserve_courses', {
        p_reg_no: student.regNo,
        p_name: student.name,
        p_email: student.email.toLowerCase(),
        p_s1_sports: s1SportsName,
        p_s1_life: s1LifeName,
        p_s2_sports: s2SportsName,
        p_s2_life: s2LifeName,
        p_s1_sports_max: 80,
        p_s1_life_max: 50,
        p_s2_sports_max: s2SportsObj?.s2EffectiveMaxSeats || s2SportsObj?.maxSeats || 80,
        p_s2_life_max: s2LifeObj?.s2EffectiveMaxSeats || s2LifeObj?.maxSeats || 50,
      });

      if (!rpcError && rpcData) {
        if (rpcData.success) {
          // Sync local cache
          await upsertRegistration({
            regNo: student.regNo,
            name: student.name,
            email: student.email.toLowerCase(),
            s1Sports: s1SportsName,
            s1StudentLife: s1LifeName,
            s2Sports: s2SportsName,
            s2StudentLife: s2LifeName,
            timestamp: new Date().toISOString(),
            status: 'CONFIRMED',
          });

          return NextResponse.json({ success: true, message: "Registration completed successfully! Your choices are now locked." });
        } else if (rpcData.error) {
          return NextResponse.json({ error: rpcData.error }, { status: 400 });
        }
      }
    } catch (rpcErr) {
      console.warn("Supabase reserve_courses RPC fallback to app-level lock:", rpcErr);
    }

    // 4. Fallback execution under concurrency Mutex lock
    const result = await runWithRegistrationLock(async () => {
      const currentRegistrations = await fetchRegistrations();
      
      const existingReg = currentRegistrations.find(r => r.email.toLowerCase() === sessionUser.email.toLowerCase());
      if (existingReg && existingReg.status?.toUpperCase() === 'CONFIRMED') {
        return { error: "You have already completed your registration. Your course selections are locked and read-only." };
      }

      const computedSeats = calculateDynamicSeats(currentRegistrations);

      const s2SportsDay = parseSportsDay(s2Sports);
      const s2LifeDay = parseDay(s2StudentLife);
      if (s2SportsDay && s2LifeDay && s2SportsDay === s2LifeDay) {
        return { error: `Session 2 Sports and Student Life cannot be scheduled on the same day (${s2SportsDay}). Please select different class days.` };
      }

      const s2SportsCourse = computedSeats.find(c => matchCourse(s2Sports, c.id, c.name));
      if (!s2SportsCourse || s2SportsCourse.s2SeatsAvailable <= 0) {
        return { error: `Sorry, Session 2 Sports (${s2SportsCourse?.name || s2Sports}) is full.` };
      }
      if (s2SportsDay && s2SportsCourse.s2SportsDaysSeats && s2SportsCourse.s2SportsDaysSeats[s2SportsDay].available <= 0) {
        return { error: `Sorry, ${s2SportsDay} for ${s2SportsCourse.name} is full (20/20 seats taken). Please select another day.` };
      }

      const s2LifeCourse = computedSeats.find(c => matchCourse(s2StudentLife, c.id, c.name));
      if (!s2LifeCourse || s2LifeCourse.s2SeatsAvailable <= 0) {
        return { error: `Sorry, Session 2 Student Life (${s2LifeCourse?.name || s2LifeCourse}) is full.` };
      }
      if (s2LifeDay && s2LifeCourse.s2LifeDaysSeats) {
        if (!s2LifeCourse.s2LifeDaysSeats[s2LifeDay]) {
          return { error: `Sorry, ${s2LifeDay} is not currently open for ${s2LifeCourse.name}.` };
        }
        if (s2LifeCourse.s2LifeDaysSeats[s2LifeDay].available <= 0) {
          const dayMax = s2LifeCourse.s2LifeDaysSeats[s2LifeDay].maxSeats;
          return { error: `Sorry, ${s2LifeDay} for ${s2LifeCourse.name} is full (${dayMax}/${dayMax} seats taken). Please select another day.` };
        }
      }

      await upsertRegistration({
        regNo: student.regNo,
        name: student.name,
        email: student.email.toLowerCase(),
        s1Sports: s1SportsName,
        s1StudentLife: s1LifeName,
        s2Sports: s2Sports,
        s2StudentLife: s2StudentLife,
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
