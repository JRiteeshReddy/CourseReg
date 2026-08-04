export interface Course {
  id: string;
  name: string;
  category: "Sports" | "Student Life";
  maxSeats: number;
  faculty?: string;
  docUrl?: string;
  schedule?: string;
}

export const COURSES: Course[] = [
  // 8 Sports Courses (Tuesday to Friday, 20/day = 80 maxSeats)
  { id: "SP01", name: "Basketball", category: "Sports", maxSeats: 80, faculty: "Nagarjun Talawar", docUrl: "https://docs.google.com/document/d/1rgfw08lLhqR6a0hbKbm2bTPGgdq4h_2u/edit?usp=sharing&rtpof=true&sd=true", schedule: "Tuesday | Wednesday | Thursday | Friday" },
  { id: "SP02", name: "Cricket", category: "Sports", maxSeats: 80, faculty: "Sainath C", docUrl: "https://docs.google.com/document/d/19KLq-7IdriQj08nn7CQWxA-lGkuvC5p6/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Tuesday | Wednesday | Thursday | Friday" },
  { id: "SP03", name: "Fitness and Nutrition", category: "Sports", maxSeats: 80, faculty: "Bharath K G", docUrl: "https://docs.google.com/document/d/1ljZ2-zCs0Kp_AWOCxZAl68uyRdV-fSe2/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Tuesday | Wednesday | Thursday | Friday" },
  { id: "SP04", name: "Football", category: "Sports", maxSeats: 80, faculty: "Pagutharivalan A", docUrl: "https://docs.google.com/document/d/1LfDwz4-Y2ecTt3RZTwKREN5g21ot0z2o/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Tuesday | Wednesday | Thursday | Friday" },
  { id: "SP05", name: "Kabaddi", category: "Sports", maxSeats: 80, faculty: "Mota Chandranna", docUrl: "https://docs.google.com/document/d/1pNszp6GA707bsFNCiuyni4vjgS6uZZ0X/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Tuesday | Wednesday | Thursday | Friday" },
  { id: "SP06", name: "Holistic Wellbeing and Yoga Therapy", category: "Sports", maxSeats: 80, faculty: "Dr. Prajwala H V", docUrl: "https://docs.google.com/document/d/1d9j62RwwNzfibMjCflUG-JPQX1Q2Ca0y/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Tuesday | Wednesday | Thursday | Friday" },
  { id: "SP07", name: "Throwball", category: "Sports", maxSeats: 80, faculty: "Prashanth V", docUrl: "https://docs.google.com/document/d/1HHMJxQ1wvQLgojdWuIUVCcrF2Kea0Zbm/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Tuesday | Wednesday | Thursday | Friday" },
  { id: "SP08", name: "Volleyball", category: "Sports", maxSeats: 80, faculty: "Kiran J", docUrl: "https://docs.google.com/document/d/1X1QRA-YhAA-T9QxL9YzLcTQjslrnJjX6/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Tuesday | Wednesday | Thursday | Friday" },

  // 11 Student Life Courses (Wednesday & Friday = 50 maxSeats, Exceptions = Friday only 25 maxSeats)
  { id: "SL01", name: "Basics of Theatre Acting", category: "Student Life", maxSeats: 50, faculty: "Dr. Charu Agaru", docUrl: "https://docs.google.com/document/d/1LQibgzRR2cnitJRCYjO14zJzPxgZ0ZLf/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL02", name: "Communication, Life skills and Soft skills", category: "Student Life", maxSeats: 50, faculty: "Mehul Shah", docUrl: "https://docs.google.com/document/d/1tMWN5atlY2ELa5Sh1GFW_kJAKfg1WaY5/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL03", name: "Contemporary Dance, Hip Hop and Freestyle", category: "Student Life", maxSeats: 25, faculty: "Rajesh Kumar", docUrl: "https://docs.google.com/document/d/18XTPM8tqzjbo_rHfhn_m0ogFZUryNVVl/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Friday" },
  { id: "SL04", name: "Folk Dance - FIPA", category: "Student Life", maxSeats: 50, faculty: "Dr. Anitha U S", docUrl: "https://docs.google.com/document/d/1as5vc9dTD5GvXKVtRE0zyL8LEx8eHuxB/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL05", name: "Mental Wellbeing and Peer Support", category: "Student Life", maxSeats: 50, faculty: "Dr. Prajwala H V", docUrl: "https://docs.google.com/document/d/1DCankpA0EbQ4Rl8pEr3gcVgNnKwwXQrG/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL06", name: "Introduction to Traditional Music", category: "Student Life", maxSeats: 25, faculty: "Seetha M I", docUrl: "https://docs.google.com/document/d/1Bneug18xXjnGbD85FmSOYRSRcdOHJhag/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Friday" },
  { id: "SL07", name: "Music Band Contemporary and Light Music", category: "Student Life", maxSeats: 50, faculty: "Sunil Kumar M P", docUrl: "https://docs.google.com/document/d/1KR3-ozpFjnGK3G54Tg6-MmjmSrHRunii/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL08", name: "Rhythm Appreciation", category: "Student Life", maxSeats: 50, faculty: "Sreekanth P V", docUrl: "https://docs.google.com/document/d/1ho8DU4CurHwYnGKnteO8hkrmPCawYRF_/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL09", name: "Creative Design, Innovation and Sustainability", category: "Student Life", maxSeats: 50, faculty: "Moses Kotikela", docUrl: "https://docs.google.com/document/d/1Orvu3IoWyK1uQAFORd1NeJ5vCgY6FPhk/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL10", name: "Social Media and Digital Content Creation", category: "Student Life", maxSeats: 50, faculty: "Meghna Ganguly", docUrl: "https://docs.google.com/document/d/1Q6qN97uzBwNMtZ5tVHYqV55V6x_SHe4r/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL11", name: "Invocatory_Dances", category: "Student Life", maxSeats: 50, faculty: "Dr. Divya Nedungadi", docUrl: "https://docs.google.com/document/d/17n0M-zWAIMtn7Chcqw8ds35I5xe7Q6f1/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
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
  facultyName?: string;
}

export interface MasterStudent {
  regNo: string;
  name: string;
  email: string;
  facultyName?: string;
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

// Legacy alias mapping to maintain backwards compatibility with existing registered data
const COURSE_ALIASES: Record<string, string[]> = {
  "SL04": ["Folk Dance", "Folk Dance - FIPA"],
  "SL05": ["Yoga Therapy & Wellness Consultant", "Mental Wellbeing and Peer Support", "Mental Well-being & Peer Support", "Mental Wellbeing & Peer Support"],
  "SL06": ["Traditional Music - Invocatory Song", "Introduction to Traditional Music"],
  "SL07": ["Introduction to Folk and Light Music", "Music Band Contemporary and Light Music"],
  "SL11": ["Traditional Dance", "Invocatory_Dances", "Invocatory Dances"],
};

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
    const aliases = COURSE_ALIASES[course.id] || [];
    const validKeys = [course.id, course.name, ...aliases];
    
    let s1Occupied = 0;
    let s2Occupied = 0;

    for (const key of validKeys) {
      s1Occupied += (s1Counts[key] || 0);
      s2Occupied += (s2Counts[key] || 0);
    }

    return {
      ...course,
      s1SeatsOccupied: s1Occupied,
      s1SeatsAvailable: Math.max(0, course.maxSeats - s1Occupied),
      s2SeatsOccupied: s2Occupied,
      s2SeatsAvailable: Math.max(0, course.maxSeats - s2Occupied),
    };
  });
}
