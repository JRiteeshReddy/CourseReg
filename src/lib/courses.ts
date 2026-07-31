export interface Course {
  id: string;
  name: string;
  category: "Sports" | "Student Life";
  maxSeats: number;
  faculty?: string;
  docUrl?: string;
}

export const COURSES: Course[] = [
  // 8 Sports Courses
  { id: "SP01", name: "Basketball", category: "Sports", maxSeats: 25, faculty: "Nagarjun Talawar", docUrl: "https://docs.google.com/document/d/1rgfw08lLhqR6a0hbKbm2bTPGgdq4h_2u/edit?usp=sharing&rtpof=true&sd=true" },
  { id: "SP02", name: "Cricket", category: "Sports", maxSeats: 25, faculty: "SAINATH C", docUrl: "https://docs.google.com/document/d/19KLq-7IdriQj08nn7CQWxA-lGkuvC5p6/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true" },
  { id: "SP03", name: "Fitness and Nutrition", category: "Sports", maxSeats: 25, faculty: "Bharath K G", docUrl: "https://docs.google.com/document/d/1ljZ2-zCs0Kp_AWOCxZAl68uyRdV-fSe2/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true" },
  { id: "SP04", name: "Football", category: "Sports", maxSeats: 25, faculty: "PAGUTHARIVALAN A", docUrl: "https://docs.google.com/document/d/1LfDwz4-Y2ecTt3RZTwKREN5g21ot0z2o/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true" },
  { id: "SP05", name: "Kabaddi", category: "Sports", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SP06", name: "Holistic Wellbeing and Yoga Therapy", category: "Sports", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SP07", name: "Throwball", category: "Sports", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SP08", name: "Volleyball", category: "Sports", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },

  // 11 Student Life Courses
  { id: "SL01", name: "Basics of Theatre Acting", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL02", name: "Communication, Life skills and Soft skills", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL03", name: "Contemporary Dance, Hip Hop and Freestyle", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL04", name: "Folk Dance", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL05", name: "Mental Wellbeing and Peer Support", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL06", name: "Introduction to traditional music", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL07", name: "Music Band- Contemporary and Light", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL08", name: "Rhythm Appreciation", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL09", name: "Creative Design, Innovation and Sustainability", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL10", name: "Social media and digital content creation", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
  { id: "SL11", name: "Invocatory Dances", category: "Student Life", maxSeats: 25, faculty: "<faculty name>", docUrl: "" },
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

export interface SeatHold {
  email: string;
  s1Sports?: string;
  s1StudentLife?: string;
  s2Sports?: string;
  s2StudentLife?: string;
  updatedAt: number;
}

export interface CalculatedCourse extends Course {
  s1SeatsOccupied: number;
  s1SeatsAvailable: number;
  s2SeatsOccupied: number;
  s2SeatsAvailable: number;
}

const DRAFT_HOLD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes temporary seat hold

/**
 * Calculates dynamic seat counts over confirmed registrations and active draft seat holds.
 */
export function calculateDynamicSeats(
  registrations: RegistrationRow[],
  seatHolds: SeatHold[] = []
): CalculatedCourse[] {
  const confirmed = registrations.filter(r => r.status?.toUpperCase() === 'CONFIRMED');
  const confirmedEmails = new Set(confirmed.map(r => r.email.toLowerCase()));

  const s1Counts: Record<string, number> = {};
  const s2Counts: Record<string, number> = {};

  // 1. Count confirmed registrations
  for (const reg of confirmed) {
    if (reg.s1Sports) s1Counts[reg.s1Sports] = (s1Counts[reg.s1Sports] || 0) + 1;
    if (reg.s1StudentLife) s1Counts[reg.s1StudentLife] = (s1Counts[reg.s1StudentLife] || 0) + 1;
    if (reg.s2Sports) s2Counts[reg.s2Sports] = (s2Counts[reg.s2Sports] || 0) + 1;
    if (reg.s2StudentLife) s2Counts[reg.s2StudentLife] = (s2Counts[reg.s2StudentLife] || 0) + 1;
  }

  // 2. Count active non-expired draft seat holds for unconfirmed students
  const now = Date.now();
  for (const hold of seatHolds) {
    if (!hold.email || confirmedEmails.has(hold.email.toLowerCase())) continue;
    if (now - hold.updatedAt > DRAFT_HOLD_TIMEOUT_MS) continue; // expired hold

    if (hold.s1Sports) s1Counts[hold.s1Sports] = (s1Counts[hold.s1Sports] || 0) + 1;
    if (hold.s1StudentLife) s1Counts[hold.s1StudentLife] = (s1Counts[hold.s1StudentLife] || 0) + 1;
    if (hold.s2Sports) s2Counts[hold.s2Sports] = (s2Counts[hold.s2Sports] || 0) + 1;
    if (hold.s2StudentLife) s2Counts[hold.s2StudentLife] = (s2Counts[hold.s2StudentLife] || 0) + 1;
  }

  return COURSES.map(course => {
    const s1Occupied = (s1Counts[course.id] || 0) + (s1Counts[course.name] || 0);
    const s2Occupied = (s2Counts[course.id] || 0) + (s2Counts[course.name] || 0);

    return {
      ...course,
      s1SeatsOccupied: s1Occupied,
      s1SeatsAvailable: Math.max(0, course.maxSeats - s1Occupied),
      s2SeatsOccupied: s2Occupied,
      s2SeatsAvailable: Math.max(0, course.maxSeats - s2Occupied),
    };
  });
}
