export interface Course {
  id: string;
  name: string;
  category: "Sports" | "Student Life";
  maxSeats: number;
  faculty?: string;
  docUrl?: string;
  schedule?: string;
  isFrozen?: boolean;
  isClosed?: boolean;
  isS1Frozen?: boolean;
  isS2Frozen?: boolean;
  isS1FridayOnly?: boolean;
  s1SlotsLeft?: number;
  s2SlotsLeft?: number;
  statusNotice?: string;
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

  // 11 Student Life Courses
  { 
    id: "SL01", 
    name: "Basics of Theatre Acting", 
    category: "Student Life", 
    maxSeats: 50, 
    faculty: "Dr. Charu Agaru", 
    docUrl: "https://docs.google.com/document/d/1LQibgzRR2cnitJRCYjO14zJzPxgZ0ZLf/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", 
    schedule: "Friday",
    s1SlotsLeft: 18,
    isS1FridayOnly: true,
    statusNotice: "Open for Friday Class Only (18 slots left)" 
  },
  { 
    id: "SL02", 
    name: "Communication, Life skills and Soft skills", 
    category: "Student Life", 
    maxSeats: 50, 
    faculty: "Mehul Shah", 
    docUrl: "https://docs.google.com/document/d/1tMWN5atlY2ELa5Sh1GFW_kJAKfg1WaY5/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", 
    schedule: "Frozen",
    isFrozen: true,
    statusNotice: "Completely Frozen — No new students accepted" 
  },
  { 
    id: "SL03", 
    name: "Contemporary Dance, Hip Hop and Freestyle", 
    category: "Student Life", 
    maxSeats: 25, 
    faculty: "Rajesh Kumar", 
    docUrl: "https://docs.google.com/document/d/18XTPM8tqzjbo_rHfhn_m0ogFZUryNVVl/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", 
    schedule: "Closed",
    isClosed: true,
    statusNotice: "Closed Completely" 
  },
  { id: "SL04", name: "Folk Dance - FIPA", category: "Student Life", maxSeats: 50, faculty: "Dr. Anitha U S", docUrl: "https://docs.google.com/document/d/1as5vc9dTD5GvXKVtRE0zyL8LEx8eHuxB/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { 
    id: "SL05", 
    name: "Mental Wellbeing and Peer Support", 
    category: "Student Life", 
    maxSeats: 50, 
    faculty: "Dr. Prajwala H V", 
    docUrl: "https://docs.google.com/document/d/1DCankpA0EbQ4Rl8pEr3gcVgNnKwwXQrG/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", 
    schedule: "Friday",
    s1SlotsLeft: 11,
    isS1FridayOnly: true,
    statusNotice: "Open for Friday Class Only (11 slots left)" 
  },
  { id: "SL06", name: "Introduction to Traditional Music", category: "Student Life", maxSeats: 25, faculty: "Seetha M I", docUrl: "https://docs.google.com/document/d/1Bneug18xXjnGbD85FmSOYRSRcdOHJhag/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Friday" },
  { id: "SL07", name: "Music Band Contemporary and Light Music", category: "Student Life", maxSeats: 50, faculty: "Sunil Kumar M P", docUrl: "https://docs.google.com/document/d/1KR3-ozpFjnGK3G54Tg6-MmjmSrHRunii/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { id: "SL08", name: "Rhythm Appreciation", category: "Student Life", maxSeats: 50, faculty: "Sreekanth P V", docUrl: "https://docs.google.com/document/d/1ho8DU4CurHwYnGKnteO8hkrmPCawYRF_/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", schedule: "Wednesday | Friday" },
  { 
    id: "SL09", 
    name: "Creative Design, Innovation and Sustainability", 
    category: "Student Life", 
    maxSeats: 50, 
    faculty: "Moses Kotikela", 
    docUrl: "https://docs.google.com/document/d/1Orvu3IoWyK1uQAFORd1NeJ5vCgY6FPhk/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", 
    schedule: "Friday",
    s1SlotsLeft: 26,
    isS1FridayOnly: true,
    statusNotice: "Open for Friday Class Only (26 slots left)" 
  },
  { 
    id: "SL10", 
    name: "Social Media and Digital Content Creation", 
    category: "Student Life", 
    maxSeats: 50, 
    faculty: "Meghna Ganguly", 
    docUrl: "https://docs.google.com/document/d/1Q6qN97uzBwNMtZ5tVHYqV55V6x_SHe4r/edit?usp=sharing&ouid=117607264633629638910&rtpof=true&sd=true", 
    schedule: "Friday Only",
    s1SlotsLeft: 13,
    isS1FridayOnly: true,
    statusNotice: "Open for Friday Class ONLY (13 slots left)" 
  },
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

export const SPORTS_DAYS = ["Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export type SportsDay = typeof SPORTS_DAYS[number];

export interface SportsDaySeatInfo {
  day: SportsDay;
  maxSeats: number;
  occupied: number;
  available: number;
}

export interface CalculatedCourse extends Course {
  s1SeatsOccupied: number;
  s1SeatsAvailable: number;
  s1EffectiveMaxSeats: number;
  s2SeatsOccupied: number;
  s2SeatsAvailable: number;
  s2EffectiveMaxSeats: number;
  s1SportsDaysSeats?: Record<SportsDay, SportsDaySeatInfo>;
  s2SportsDaysSeats?: Record<SportsDay, SportsDaySeatInfo>;
}

const DRAFT_HOLD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes temporary seat hold

// Legacy alias mapping to maintain backwards compatibility with existing registered data
const COURSE_ALIASES: Record<string, string[]> = {
  "SL04": ["Folk Dance", "Folk Dance - FIPA"],
  "SL05": ["Yoga Therapy & Wellness Consultant", "Mental Wellbeing and Peer Support", "Mental Well-being & Peer Support"],
  "SL06": ["Traditional Music - Invocatory Song", "Introduction to Traditional Music"],
  "SL07": ["Introduction to Folk and Light Music", "Music Band Contemporary and Light Music"],
  "SL11": ["Traditional Dance", "Invocatory_Dances", "Invocatory Dances"],
};

export function parseSportsDay(val: string | undefined | null): SportsDay | null {
  if (!val) return null;
  const v = val.toLowerCase();
  if (v.includes("tuesday")) return "Tuesday";
  if (v.includes("wednesday")) return "Wednesday";
  if (v.includes("thursday")) return "Thursday";
  if (v.includes("friday")) return "Friday";
  return null;
}

export function matchCourse(val: string | undefined | null, id: string, name: string): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  const idLower = id.toLowerCase();
  const nameLower = name.toLowerCase();
  if (v === idLower || v === nameLower) return true;
  if (v.startsWith(idLower) || v.startsWith(nameLower)) return true;
  const aliases = COURSE_ALIASES[id] || [];
  return aliases.some((a) => a.toLowerCase() === v || v.startsWith(a.toLowerCase()));
}

export const SPORTS_INITIAL_OCCUPIED: Record<string, Record<SportsDay, number>> = {
  SP01: { Tuesday: 12, Wednesday: 3, Thursday: 6, Friday: 8 },  // Basketball
  SP02: { Tuesday: 1, Wednesday: 5, Thursday: 20, Friday: 12 }, // Cricket (Thu 20 -> BLOCKED)
  SP03: { Tuesday: 14, Wednesday: 0, Thursday: 15, Friday: 12 }, // Fitness and Nutrition
  SP04: { Tuesday: 2, Wednesday: 2, Thursday: 9, Friday: 5 },   // Football
  SP05: { Tuesday: 4, Wednesday: 0, Thursday: 8, Friday: 16 },  // Kabaddi
  SP06: { Tuesday: 16, Wednesday: 0, Thursday: 7, Friday: 4 },  // Holistic Wellbeing and Yoga Therapy
  SP07: { Tuesday: 1, Wednesday: 2, Thursday: 12, Friday: 12 }, // Throwball
  SP08: { Tuesday: 13, Wednesday: 0, Thursday: 10, Friday: 9 }, // Volleyball
};

/**
 * Calculates dynamic seat counts over confirmed registrations and active draft seat holds.
 */
export function calculateDynamicSeats(
  registrations: RegistrationRow[],
  seatHolds: SeatHold[] = []
): CalculatedCourse[] {
  const confirmed = registrations.filter((r) => {
    const s = (r.status || "CONFIRMED").toUpperCase();
    return s === "CONFIRMED" || s === "SUBMITTED";
  });

  const confirmedEmails = new Set(confirmed.map((r) => (r.email || "").toLowerCase()));
  const now = Date.now();
  const activeHolds = seatHolds.filter((h) => {
    if (!h.email || confirmedEmails.has(h.email.toLowerCase())) return false;
    return now - h.updatedAt <= DRAFT_HOLD_TIMEOUT_MS;
  });

  return COURSES.map((course) => {
    let s1Occupied = 0;
    let s2Occupied = 0;

    // 1. Count confirmed/submitted registrations
    for (const reg of confirmed) {
      if (course.category === "Sports") {
        if (matchCourse(reg.s1Sports, course.id, course.name)) s1Occupied++;
        if (matchCourse(reg.s2Sports, course.id, course.name)) s2Occupied++;
      } else {
        if (matchCourse(reg.s1StudentLife, course.id, course.name)) s1Occupied++;
        if (matchCourse(reg.s2StudentLife, course.id, course.name)) s2Occupied++;
      }
    }

    // 2. Count active non-expired draft seat holds
    for (const hold of activeHolds) {
      if (course.category === "Sports") {
        if (matchCourse(hold.s1Sports, course.id, course.name)) s1Occupied++;
        if (matchCourse(hold.s2Sports, course.id, course.name)) s2Occupied++;
      } else {
        if (matchCourse(hold.s1StudentLife, course.id, course.name)) s1Occupied++;
        if (matchCourse(hold.s2StudentLife, course.id, course.name)) s2Occupied++;
      }
    }

    let s1MaxSeats = course.maxSeats;
    let s2MaxSeats = course.maxSeats;
    let s1Available = Math.max(0, s1MaxSeats - s1Occupied);
    let s2Available = Math.max(0, s2MaxSeats - s2Occupied);

    let s1SportsDaysSeats: Record<SportsDay, SportsDaySeatInfo> | undefined;
    let s2SportsDaysSeats: Record<SportsDay, SportsDaySeatInfo> | undefined;

    if (course.category === "Sports") {
      const initOcc = SPORTS_INITIAL_OCCUPIED[course.id] || { Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };

      const s1DayOcc: Record<SportsDay, number> = { ...initOcc };
      const s2DayOcc: Record<SportsDay, number> = { ...initOcc };

      const s1DayHolds: Record<SportsDay, number> = { Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };
      const s2DayHolds: Record<SportsDay, number> = { Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };

      for (const reg of confirmed) {
        if (matchCourse(reg.s1Sports, course.id, course.name)) {
          const day = parseSportsDay(reg.s1Sports);
          if (day) {
            s1DayOcc[day]++;
          }
        }
        if (matchCourse(reg.s2Sports, course.id, course.name)) {
          const day = parseSportsDay(reg.s2Sports);
          if (day) {
            s2DayOcc[day]++;
          }
        }
      }

      for (const hold of activeHolds) {
        if (matchCourse(hold.s1Sports, course.id, course.name)) {
          const day = parseSportsDay(hold.s1Sports);
          if (day) s1DayHolds[day]++;
        }
        if (matchCourse(hold.s2Sports, course.id, course.name)) {
          const day = parseSportsDay(hold.s2Sports);
          if (day) s2DayHolds[day]++;
        }
      }

      s1SportsDaysSeats = {
        Tuesday: { day: "Tuesday", maxSeats: 20, occupied: s1DayOcc.Tuesday, available: Math.max(0, 20 - s1DayOcc.Tuesday - s1DayHolds.Tuesday) },
        Wednesday: { day: "Wednesday", maxSeats: 20, occupied: s1DayOcc.Wednesday, available: Math.max(0, 20 - s1DayOcc.Wednesday - s1DayHolds.Wednesday) },
        Thursday: { day: "Thursday", maxSeats: 20, occupied: s1DayOcc.Thursday, available: Math.max(0, 20 - s1DayOcc.Thursday - s1DayHolds.Thursday) },
        Friday: { day: "Friday", maxSeats: 20, occupied: s1DayOcc.Friday, available: Math.max(0, 20 - s1DayOcc.Friday - s1DayHolds.Friday) },
      };

      s2SportsDaysSeats = {
        Tuesday: { day: "Tuesday", maxSeats: 20, occupied: s2DayOcc.Tuesday, available: Math.max(0, 20 - s2DayOcc.Tuesday - s2DayHolds.Tuesday) },
        Wednesday: { day: "Wednesday", maxSeats: 20, occupied: s2DayOcc.Wednesday, available: Math.max(0, 20 - s2DayOcc.Wednesday - s2DayHolds.Wednesday) },
        Thursday: { day: "Thursday", maxSeats: 20, occupied: s2DayOcc.Thursday, available: Math.max(0, 20 - s2DayOcc.Thursday - s2DayHolds.Thursday) },
        Friday: { day: "Friday", maxSeats: 20, occupied: s2DayOcc.Friday, available: Math.max(0, 20 - s2DayOcc.Friday - s2DayHolds.Friday) },
      };
    }

    if (course.isFrozen || course.isClosed) {
      s1Available = 0;
      s2Available = 0;
    } else {
      if (course.isS1Frozen) {
        s1Available = 0;
      } else if (typeof course.s1SlotsLeft === "number") {
        let s1Holds = 0;
        for (const hold of activeHolds) {
          if (course.category === "Sports") {
            if (matchCourse(hold.s1Sports, course.id, course.name)) s1Holds++;
          } else {
            if (matchCourse(hold.s1StudentLife, course.id, course.name)) s1Holds++;
          }
        }
        // Calculate new seat cap: current occupied + remaining slots requested (capped at course.maxSeats, e.g. 50)
        const targetCap = s1Occupied + course.s1SlotsLeft;
        s1MaxSeats = targetCap > course.maxSeats ? course.maxSeats : targetCap;
        s1Available = Math.max(0, s1MaxSeats - s1Occupied - s1Holds);
      }

      if (course.isS2Frozen) {
        s2Available = 0;
      } else if (typeof course.s2SlotsLeft === "number") {
        let s2Holds = 0;
        for (const hold of activeHolds) {
          if (course.category === "Sports") {
            if (matchCourse(hold.s2Sports, course.id, course.name)) s2Holds++;
          } else {
            if (matchCourse(hold.s2StudentLife, course.id, course.name)) s2Holds++;
          }
        }
        const targetCap = s2Occupied + course.s2SlotsLeft;
        s2MaxSeats = targetCap > course.maxSeats ? course.maxSeats : targetCap;
        s2Available = Math.max(0, s2MaxSeats - s2Occupied - s2Holds);
      }
    }

    return {
      ...course,
      s1SeatsOccupied: s1Occupied,
      s1SeatsAvailable: s1Available,
      s1EffectiveMaxSeats: s1MaxSeats,
      s2SeatsOccupied: s2Occupied,
      s2SeatsAvailable: s2Available,
      s2EffectiveMaxSeats: s2MaxSeats,
      s1SportsDaysSeats,
      s2SportsDaysSeats,
    };
  });
}
