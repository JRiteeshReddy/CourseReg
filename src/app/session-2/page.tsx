"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalculatedCourse, SPORTS_DAYS, matchCourse, parseDay } from "@/lib/courses";
import { MasterStudent } from "@/lib/google-sheets";
import { Trophy, Compass, ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2, Ban, Info, Bell, Clock, AlertTriangle } from "lucide-react";

export default function Session2Page() {
  const [student, setStudent] = useState<MasterStudent | null>(null);
  const [courses, setCourses] = useState<CalculatedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Session 1 draft choices
  const [s1SportsChoice, setS1SportsChoice] = useState<string>("");
  const [s1LifeChoice, setS1LifeChoice] = useState<string>("");

  // Temporary Session 2 selections
  const [selectedSports, setSelectedSports] = useState<string>("");
  const [selectedStudentLife, setSelectedStudentLife] = useState<string>("");

  const router = useRouter();

  // Helper to send seat holds to backend
  const syncSeatHold = async (s2Sports: string, s2Life: string) => {
    try {
      const userEmail = (student?.email || "").toLowerCase();
      const s1Sports = (userEmail && localStorage.getItem(`s1Sports_${userEmail}`)) || sessionStorage.getItem("s1Sports") || "";
      const s1Life = (userEmail && localStorage.getItem(`s1StudentLife_${userEmail}`)) || sessionStorage.getItem("s1StudentLife") || "";

      const res = await fetch("/api/hold-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s1Sports, s1StudentLife: s1Life, s2Sports, s2StudentLife: s2Life }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.courses) setCourses(data.courses);
      }
    } catch (e) {
      console.warn("Failed to sync seat hold:", e);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/courses");
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setStudent(data.student);
        setCourses(data.courses || []);

        const userEmail = (data.student?.email || "").toLowerCase();
        const serverConfirmed = Boolean(
          data.registration && (data.registration.status?.toUpperCase() === "CONFIRMED" || data.registration.status?.toUpperCase() === "SUBMITTED")
        );

        if (!serverConfirmed && userEmail) {
          localStorage.removeItem(`confirmed_registration_${userEmail}`);
        }

        if (data.isRegistrationOpen === false || serverConfirmed) {
          router.push("/dashboard");
          return;
        }

        const savedS1Sports = (userEmail && localStorage.getItem(`s1Sports_${userEmail}`)) || sessionStorage.getItem("s1Sports") || data.registration?.s1Sports || "";
        const savedS1Life = (userEmail && localStorage.getItem(`s1StudentLife_${userEmail}`)) || sessionStorage.getItem("s1StudentLife") || data.registration?.s1StudentLife || "";

        setS1SportsChoice(savedS1Sports);
        setS1LifeChoice(savedS1Life);

        const savedS2Sports = (userEmail && localStorage.getItem(`s2Sports_${userEmail}`)) || sessionStorage.getItem("s2Sports") || data.registration?.s2Sports || "";
        const savedS2Life = (userEmail && localStorage.getItem(`s2StudentLife_${userEmail}`)) || sessionStorage.getItem("s2StudentLife") || data.registration?.s2StudentLife || "";

        setSelectedSports(savedS2Sports);
        setSelectedStudentLife(savedS2Life);

        if (savedS2Sports || savedS2Life) {
          syncSeatHold(savedS2Sports, savedS2Life);
        }

      } catch (err) {
        console.error("Failed to load Session 2 data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Poll every 3.5s for real-time dynamic seat updates across devices
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          if (data.courses) setCourses(data.courses);
        }
      } catch (e) {}
    }, 3500);

    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#041C19]">
        <Loader2 className="w-8 h-8 text-[#7ECEB7] animate-spin" />
      </div>
    );
  }

  const sportsCourses = courses.filter((c) => c.category === "Sports");
  const studentLifeCourses = courses.filter((c) => c.category === "Student Life");

  const sportsDay = parseDay(selectedSports);
  const studentLifeDay = parseDay(selectedStudentLife);
  const hasSameDayConflict = Boolean(sportsDay && studentLifeDay && sportsDay === studentLifeDay);

  const canContinue = Boolean(selectedSports && selectedStudentLife && !hasSameDayConflict);

  const handleContinue = () => {
    if (!canContinue) return;
    if (student?.email) {
      const userEmail = student.email.toLowerCase();
      localStorage.setItem(`s2Sports_${userEmail}`, selectedSports);
      localStorage.setItem(`s2StudentLife_${userEmail}`, selectedStudentLife);
    }
    sessionStorage.setItem("s2Sports", selectedSports);
    sessionStorage.setItem("s2StudentLife", selectedStudentLife);
    router.push("/review");
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-fade-in bg-[#041C19] text-[#F5EBE0]">
      {/* Header Banner */}
      <header className="glass-panel p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#7ECEB7]/20">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/session-1")}
            className="p-2 sm:p-2.5 rounded-xl glass-card hover:bg-[#037A74]/30 text-[#D6C7A1] transition-all border border-[#7ECEB7]/20 flex-shrink-0"
            title="Back to Session 1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-mono bg-[#A07850]/20 text-[#D6C7A1] border border-[#A07850]/40">
                SESSION 2 REGISTRATION
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-[#F5EBE0]">Select Session 2 Courses</h1>
            <p className="text-xs text-[#D6C7A1]">
              Student: <span className="text-[#F5EBE0] font-medium">{student?.name}</span> ({student?.regNo})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-[#D6C7A1] bg-[#072C28] p-2.5 sm:p-3 rounded-xl border border-[#7ECEB7]/20 w-full sm:w-auto">
            <Sparkles className="w-4 h-4 text-[#A07850] flex-shrink-0" />
            <span>Session 1 selections disabled for Session 2</span>
          </div>
        </div>
      </header>

      {/* SECTION 1: SPORTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#7ECEB7]/20 pb-3">
          <div className="flex items-center gap-2 text-[#7ECEB7] font-semibold text-base sm:text-lg">
            <Trophy className="w-5 h-5 flex-shrink-0" />
            <h2>Sports Category (Independent Session 2 Capacity)</h2>
          </div>
          <span className="text-xs font-mono text-[#D6C7A1]">
            {selectedSports ? `Selected: ${selectedSports}` : "0 / 1 Selected"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {sportsCourses.map((course) => {
            const isSelectedInSession1 = matchCourse(s1SportsChoice, course.id, course.name);
            const isAnyDaySelected = matchCourse(selectedSports, course.id, course.name);

            return (
              <div
                key={course.id}
                className={`glass-card p-4 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 transition-all border ${
                  isSelectedInSession1
                    ? "opacity-40 border-[#7ECEB7]/10 bg-[#041C19]"
                    : isAnyDaySelected
                    ? "border-[#7ECEB7] bg-[#037A74]/35 shadow-lg shadow-[#037A74]/30 scale-[1.02]"
                    : "border-[#7ECEB7]/15 hover:border-[#7ECEB7]/40"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#D6C7A1]">{course.id}</span>
                    {isSelectedInSession1 ? (
                      <span className="text-[10px] font-semibold text-[#7ECEB7] bg-[#7ECEB7]/15 border border-[#7ECEB7]/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Selected in S1
                      </span>
                    ) : isAnyDaySelected ? (
                      <CheckCircle2 className="w-5 h-5 text-[#7ECEB7]" />
                    ) : null}
                  </div>

                  <h3 className="font-bold text-base text-[#F5EBE0]">{course.name}</h3>

                  <div className="flex items-center justify-between text-xs text-[#D6C7A1] pt-0.5">
                    <span>Faculty: <strong className="text-[#F5EBE0] font-normal">{course.faculty || "Faculty"}</strong></span>
                    {course.docUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(course.docUrl, "_blank", "noopener,noreferrer");
                        }}
                        className="p-1 text-[#7ECEB7] hover:text-[#F5EBE0] hover:bg-[#7ECEB7]/20 rounded-full transition-colors inline-flex items-center justify-center"
                        title="View Course Google Doc"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#7ECEB7] bg-[#072C28] px-2 py-1 rounded border border-[#7ECEB7]/20">
                    <Clock className="w-3 h-3" />
                    <span>3:00 PM – 4:00 PM</span>
                  </div>

                  {/* Day-Wise Seat Selection Grid (Tue - Fri, 20 seats/day) */}
                  <div className="space-y-1.5 pt-2 border-t border-[#7ECEB7]/15">
                    <div className="text-[10px] font-semibold text-[#D6C7A1] uppercase tracking-wider flex items-center justify-between">
                      <span>Pick Class Day:</span>
                      <span className="text-[#7ECEB7]">20 seats/day</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {SPORTS_DAYS.map((day) => {
                        const dayInfo = course.s2SportsDaysSeats?.[day] || { day, maxSeats: 20, occupied: 0, available: 20 };
                        const isDayFull = dayInfo.available <= 0;
                        const isSameDayAsOther = Boolean(studentLifeDay && day === studentLifeDay);
                        const isDisabled = isSelectedInSession1 || isDayFull;
                        const formattedChoice = `${course.name} (${day})`;
                        const isThisDaySelected = selectedSports === formattedChoice;

                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled) {
                                setSelectedSports(formattedChoice);
                                syncSeatHold(formattedChoice, selectedStudentLife);
                              }
                            }}
                            className={`px-2 py-2 sm:px-2.5 sm:py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all border ${
                              isThisDaySelected
                                ? "bg-[#7ECEB7] text-[#041C19] font-bold border-[#7ECEB7] shadow-md scale-[1.03]"
                                : isDisabled
                                ? "bg-red-950/20 text-red-400/60 border-red-500/20 cursor-not-allowed line-through opacity-70"
                                : isSameDayAsOther
                                ? "bg-[#072C28] text-[#F5EBE0] border-amber-500/50 hover:border-amber-400"
                                : "bg-[#072C28] text-[#F5EBE0] hover:bg-[#037A74]/30 border-[#7ECEB7]/20 hover:border-[#7ECEB7]/40"
                            }`}
                          >
                            <span>{day.slice(0, 3)}</span>
                            {isSelectedInSession1 ? (
                              <span className="text-[9px] font-bold text-[#7ECEB7]">S1</span>
                            ) : isDayFull ? (
                              <span className="text-[9px] font-bold text-red-400 uppercase">FULL</span>
                            ) : isSameDayAsOther && !isThisDaySelected ? (
                              <span className="text-[8px] font-bold text-amber-400 uppercase px-1 py-0.2 rounded bg-amber-400/10">SAME DAY</span>
                            ) : (
                              <span className={`text-[10px] ${isThisDaySelected ? "text-[#041C19] font-bold" : "text-[#7ECEB7]"}`}>
                                {dayInfo.available} left
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: STUDENT LIFE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#7ECEB7]/20 pb-3">
          <div className="flex items-center gap-2 text-[#A07850] font-semibold text-base sm:text-lg">
            <Compass className="w-5 h-5 flex-shrink-0" />
            <h2>Student Life Category (Independent Session 2 Capacity)</h2>
          </div>
          <span className="text-xs font-mono text-[#D6C7A1]">
            {selectedStudentLife ? "1 / 1 Selected" : "0 / 1 Selected"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {studentLifeCourses.map((course) => {
            const isSelectedInSession1 = matchCourse(s1LifeChoice, course.id, course.name);
            const isAnyDaySelected = matchCourse(selectedStudentLife, course.id, course.name);
            const daysSeats = course.s2LifeDaysSeats ? Object.values(course.s2LifeDaysSeats) : [];

            return (
              <div
                key={course.id}
                className={`glass-card p-4 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 transition-all border ${
                  isSelectedInSession1
                    ? "opacity-40 border-[#7ECEB7]/10 bg-[#041C19]"
                    : isAnyDaySelected
                    ? "border-[#A07850] bg-[#A07850]/30 shadow-lg shadow-[#A07850]/20 scale-[1.02]"
                    : "border-[#7ECEB7]/15 hover:border-[#7ECEB7]/40"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#D6C7A1]">{course.id}</span>
                    {isSelectedInSession1 ? (
                      <span className="text-[10px] font-semibold text-[#A07850] bg-[#A07850]/15 border border-[#A07850]/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Selected in S1
                      </span>
                    ) : isAnyDaySelected ? (
                      <CheckCircle2 className="w-5 h-5 text-[#A07850]" />
                    ) : null}
                  </div>

                  <h3 className="font-bold text-base text-[#F5EBE0]">{course.name}</h3>

                  <div className="flex items-center justify-between text-xs text-[#D6C7A1] pt-0.5">
                    <span>Faculty: <strong className="text-[#F5EBE0] font-normal">{course.faculty || "Faculty"}</strong></span>
                    {course.docUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(course.docUrl, "_blank", "noopener,noreferrer");
                        }}
                        className="p-1 text-[#7ECEB7] hover:text-[#F5EBE0] hover:bg-[#7ECEB7]/20 rounded-full transition-colors inline-flex items-center justify-center"
                        title="View Course Google Doc"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#D6C7A1] bg-[#072C28] px-2 py-1 rounded border border-[#A07850]/30">
                    <Clock className="w-3 h-3 text-[#A07850]" />
                    <span>4:00 PM – 5:00 PM ({course.id === "SL03" ? "Thu & Fri" : course.id === "SL06" ? "Friday Only" : course.id === "SL08" ? (daysSeats.some(d => d.day === "Friday") ? "Wed & Fri" : "Wednesday Only (Fri opens if full)") : "Wed & Fri"})</span>
                  </div>

                  {/* Day-Wise Seat Selection Grid for Student Life */}
                  {daysSeats.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#7ECEB7]/15">
                      <div className="text-[10px] font-semibold text-[#D6C7A1] uppercase tracking-wider flex items-center justify-between">
                        <span>Pick Class Day:</span>
                        <span className="text-[#A07850]">30 seats/day</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {daysSeats.map((dayInfo) => {
                          const isDayFull = dayInfo.available <= 0;
                          const isSameDayAsOther = Boolean(sportsDay && dayInfo.day === sportsDay);
                          const isDisabled = isSelectedInSession1 || isDayFull;
                          const formattedChoice = `${course.name} (${dayInfo.day})`;
                          const isThisDaySelected = selectedStudentLife === formattedChoice;

                          return (
                            <button
                              key={dayInfo.day}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                if (!isDisabled) {
                                  setSelectedStudentLife(formattedChoice);
                                  syncSeatHold(selectedSports, formattedChoice);
                                }
                              }}
                              className={`px-2 py-2 sm:px-2.5 sm:py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all border ${
                                isThisDaySelected
                                  ? "bg-[#A07850] text-[#041C19] font-bold border-[#A07850] shadow-md scale-[1.03]"
                                  : isDisabled
                                  ? "bg-red-950/20 text-red-400/60 border-red-500/20 cursor-not-allowed line-through opacity-70"
                                  : isSameDayAsOther
                                  ? "bg-[#072C28] text-[#F5EBE0] border-amber-500/50 hover:border-amber-400"
                                  : "bg-[#072C28] text-[#F5EBE0] hover:bg-[#A07850]/30 border-[#A07850]/30 hover:border-[#A07850]/50"
                              }`}
                            >
                              <span>{dayInfo.day.slice(0, 3)}</span>
                              {isSelectedInSession1 ? (
                                <span className="text-[9px] font-bold text-[#A07850]">S1</span>
                              ) : isDayFull ? (
                                <span className="text-[9px] font-bold text-red-400 uppercase">FULL</span>
                              ) : isSameDayAsOther && !isThisDaySelected ? (
                                <span className="text-[8px] font-bold text-amber-400 uppercase px-1 py-0.2 rounded bg-amber-400/10">SAME DAY</span>
                              ) : (
                                <span className={`text-[10px] ${isThisDaySelected ? "text-[#041C19] font-bold" : "text-[#D6C7A1]"}`}>
                                  {dayInfo.available} left
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER ACTION BAR */}
      <footer className="glass-panel p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 sticky bottom-3 sm:bottom-6 shadow-2xl z-30 border-[#A07850]/30 backdrop-blur-xl">
        <div className="text-center sm:text-left">
          <h3 className="font-semibold text-sm sm:text-base text-[#F5EBE0]">Session 2 Selections</h3>
          <p className="text-xs text-[#D6C7A1]">
            {hasSameDayConflict ? (
              <span className="text-red-400 font-semibold flex items-center gap-1 justify-center sm:justify-start">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                Session 2 Sports and Student Life cannot be taken on the same day ({sportsDay}). Please select different class days.
              </span>
            ) : canContinue ? (
              "Session 2 selections ready. Proceed to final review!"
            ) : (
              "Please select 1 Sports course and 1 Student Life course."
            )}
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-bronze w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed text-[#F5EBE0]"
        >
          <span>Proceed to Final Review</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
