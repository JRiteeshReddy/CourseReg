export interface Course {
  id: string;
  name: string;
  category: "Sports" | "Student Life";
  maxSeats: number;
}

export const COURSES: Course[] = [
  // Session 1 & 2 Available Sports
  { id: "SP01", name: "Basketball", category: "Sports", maxSeats: 25 },
  { id: "SP02", name: "Tennis", category: "Sports", maxSeats: 25 },
  { id: "SP03", name: "Swimming", category: "Sports", maxSeats: 25 },
  { id: "SP04", name: "Football", category: "Sports", maxSeats: 25 },

  // Session 1 & 2 Available Student Life
  { id: "SL01", name: "Photography", category: "Student Life", maxSeats: 25 },
  { id: "SL02", name: "Music Band", category: "Student Life", maxSeats: 25 },
  { id: "SL03", name: "Debate Club", category: "Student Life", maxSeats: 25 },
  { id: "SL04", name: "Art Workshop", category: "Student Life", maxSeats: 25 },
];

export interface RegistrationRow {
  regNo: string;
  name: string;
  email: string;
  s1Sports: string;
  s1StudentLife: string;
  s2Sports: string;
  s2StudentLife: string;
  timestamp: string;
  status: string;
}

export interface CalculatedCourse extends Course {
  s1SeatsOccupied: number;
  s1SeatsAvailable: number;
  s2SeatsOccupied: number;
  s2SeatsAvailable: number;
}

/**
 * Calculates dynamic seat counts over confirmed registration rows.
 * No static seat counter columns exist.
 */
export function calculateDynamicSeats(registrations: RegistrationRow[]): CalculatedCourse[] {
  const confirmed = registrations.filter(r => r.status?.toUpperCase() === 'CONFIRMED');

  const s1Counts: Record<string, number> = {};
  const s2Counts: Record<string, number> = {};

  for (const reg of confirmed) {
    if (reg.s1Sports) s1Counts[reg.s1Sports] = (s1Counts[reg.s1Sports] || 0) + 1;
    if (reg.s1StudentLife) s1Counts[reg.s1StudentLife] = (s1Counts[reg.s1StudentLife] || 0) + 1;
    if (reg.s2Sports) s2Counts[reg.s2Sports] = (s2Counts[reg.s2Sports] || 0) + 1;
    if (reg.s2StudentLife) s2Counts[reg.s2StudentLife] = (s2Counts[reg.s2StudentLife] || 0) + 1;
  }

  return COURSES.map(course => {
    const s1Occupied = s1Counts[course.id] || s1Counts[course.name] || 0;
    const s2Occupied = s2Counts[course.id] || s2Counts[course.name] || 0;

    return {
      ...course,
      s1SeatsOccupied: s1Occupied,
      s1SeatsAvailable: Math.max(0, course.maxSeats - s1Occupied),
      s2SeatsOccupied: s2Occupied,
      s2SeatsAvailable: Math.max(0, course.maxSeats - s2Occupied),
    };
  });
}
