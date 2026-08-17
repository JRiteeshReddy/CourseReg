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

    const student = await checkStudentAuthorized(sessionUser.email) || sessionUser;

    const allRegs = await fetchRegistrations();
    const calculatedCourses = calculateDynamicSeats(allRegs);

    // Resolve course objects
    const s1SportsObj = calculatedCourses.find(c => matchCourse(s1Sports, c.id, c.name));
    const s1LifeObj = calculatedCourses.find(c => matchCourse(s1StudentLife, c.id, c.name));
    const s2SportsObj = calculatedCourses.find(c => matchCourse(s2Sports, c.id, c.name));
    const s2LifeObj = calculatedCourses.find(c => matchCourse(s2StudentLife, c.id, c.name));

    const s1SportsName = s1Sports;
    const s1LifeName = s1StudentLife;
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
        p_s1_sports_max: s1SportsObj?.s1EffectiveMaxSeats || s1SportsObj?.maxSeats || 80,
        p_s1_life_max: s1LifeObj?.s1EffectiveMaxSeats || s1LifeObj?.maxSeats || 50,
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

      const s1SportsCourse = computedSeats.find(c => matchCourse(s1Sports, c.id, c.name));
      if (!s1SportsCourse || s1SportsCourse.s1SeatsAvailable <= 0) {
        return { error: `Sorry, Session 1 Sports (${s1SportsCourse?.name || s1Sports}) is full.` };
      }
      const s1Day = parseSportsDay(s1Sports);
      if (s1Day && s1SportsCourse.s1SportsDaysSeats && s1SportsCourse.s1SportsDaysSeats[s1Day].available <= 0) {
        return { error: `Sorry, ${s1Day} for ${s1SportsCourse.name} is full (20/20 seats taken). Please select another day.` };
      }

      const s1LifeCourse = computedSeats.find(c => matchCourse(s1StudentLife, c.id, c.name));
      if (!s1LifeCourse || s1LifeCourse.s1SeatsAvailable <= 0) {
        return { error: `Sorry, Session 1 Student Life (${s1LifeCourse?.name || s1StudentLife}) is full.` };
      }
      const s1LifeDay = parseDay(s1StudentLife);
      if (s1LifeDay && s1LifeCourse.s1LifeDaysSeats) {
        if (!s1LifeCourse.s1LifeDaysSeats[s1LifeDay]) {
          return { error: `Sorry, ${s1LifeDay} is not currently open for ${s1LifeCourse.name}.` };
        }
        if (s1LifeCourse.s1LifeDaysSeats[s1LifeDay].available <= 0) {
          return { error: `Sorry, ${s1LifeDay} for ${s1LifeCourse.name} is full. Please select another day.` };
        }
      }

      const s2SportsCourse = computedSeats.find(c => matchCourse(s2Sports, c.id, c.name));
      if (!s2SportsCourse || s2SportsCourse.s2SeatsAvailable <= 0) {
        return { error: `Sorry, Session 2 Sports (${s2SportsCourse?.name || s2Sports}) is full.` };
      }
      const s2Day = parseSportsDay(s2Sports);
      if (s2Day && s2SportsCourse.s2SportsDaysSeats && s2SportsCourse.s2SportsDaysSeats[s2Day].available <= 0) {
        return { error: `Sorry, ${s2Day} for ${s2SportsCourse.name} is full (20/20 seats taken). Please select another day.` };
      }

      const s2LifeCourse = computedSeats.find(c => matchCourse(s2StudentLife, c.id, c.name));
      if (!s2LifeCourse || s2LifeCourse.s2SeatsAvailable <= 0) {
        return { error: `Sorry, Session 2 Student Life (${s2LifeCourse?.name || s2LifeCourse}) is full.` };
      }
      const s2LifeDay = parseDay(s2StudentLife);
      if (s2LifeDay && s2LifeCourse.s2LifeDaysSeats) {
        if (!s2LifeCourse.s2LifeDaysSeats[s2LifeDay]) {
          return { error: `Sorry, ${s2LifeDay} is not currently open for ${s2LifeCourse.name}.` };
        }
        if (s2LifeCourse.s2LifeDaysSeats[s2LifeDay].available <= 0) {
          return { error: `Sorry, ${s2LifeDay} for ${s2LifeCourse.name} is full. Please select another day.` };
        }
      }

      await upsertRegistration({
        regNo: student.regNo,
        name: student.name,
        email: student.email.toLowerCase(),
        s1Sports: s1Sports,
        s1StudentLife: s1StudentLife,
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
