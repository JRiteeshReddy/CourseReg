"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalculatedCourse } from "@/lib/courses";
import { MasterStudent } from "@/lib/google-sheets";
import { Trophy, Compass, ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function Session1Page() {
  const [student, setStudent] = useState<MasterStudent | null>(null);
  const [courses, setCourses] = useState<CalculatedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Temporary selections
  const [selectedSports, setSelectedSports] = useState<string>("");
  const [selectedStudentLife, setSelectedStudentLife] = useState<string>("");

  const router = useRouter();

  // Helper to send seat holds to backend
  const syncSeatHold = async (sports: string, life: string) => {
    try {
      const res = await fetch("/api/hold-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s1Sports: sports, s1StudentLife: life }),
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

        if (data.isRegistrationOpen === false || data.registration?.status?.toUpperCase() === "CONFIRMED") {
          router.push("/dashboard");
          return;
        }

        // Load existing draft if available
        const userEmail = (data.student?.email || "").toLowerCase();
        const savedSports = (userEmail && localStorage.getItem(`s1Sports_${userEmail}`)) || sessionStorage.getItem("s1Sports") || data.registration?.s1Sports || "";
        const savedLife = (userEmail && localStorage.getItem(`s1StudentLife_${userEmail}`)) || sessionStorage.getItem("s1StudentLife") || data.registration?.s1StudentLife || "";

        if (savedSports) setSelectedSports(savedSports);
        if (savedLife) setSelectedStudentLife(savedLife);

        if (savedSports || savedLife) {
          syncSeatHold(savedSports, savedLife);
        }
      } catch (err) {
        console.error("Failed to load Session 1 data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Poll every 5s for real-time dynamic seat updates across devices
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          if (data.courses) setCourses(data.courses);
        }
      } catch (e) {}
    }, 5000);

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

  const canContinue = Boolean(selectedSports && selectedStudentLife);

  const handleContinue = () => {
    if (!canContinue) return;
    if (student?.email) {
      const userEmail = student.email.toLowerCase();
      localStorage.setItem(`s1Sports_${userEmail}`, selectedSports);
      localStorage.setItem(`s1StudentLife_${userEmail}`, selectedStudentLife);
    }
    sessionStorage.setItem("s1Sports", selectedSports);
    sessionStorage.setItem("s1StudentLife", selectedStudentLife);
    router.push("/session-2");
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in bg-[#041C19] text-[#F5EBE0]">
      {/* Header Banner */}
      <header className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#7ECEB7]/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2.5 rounded-xl glass-card hover:bg-[#037A74]/30 text-[#D6C7A1] transition-all border border-[#7ECEB7]/20"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#037A74]/30 text-[#7ECEB7] border border-[#037A74]/50">
                SESSION 1 REGISTRATION
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1 text-[#F5EBE0]">Select Session 1 Courses</h1>
            <p className="text-xs text-[#D6C7A1]">
              Student: <span className="text-[#F5EBE0] font-medium">{student?.name}</span> ({student?.regNo})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#D6C7A1] bg-[#072C28] p-3 rounded-xl border border-[#7ECEB7]/20">
          <Sparkles className="w-4 h-4 text-[#A07850]" />
          <span>Pick exactly 1 Sports + 1 Student Life course</span>
        </div>
      </header>

      {/* SECTION 1: SPORTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#7ECEB7]/20 pb-3">
          <div className="flex items-center gap-2 text-[#7ECEB7] font-semibold text-lg">
            <Trophy className="w-5 h-5" />
            <h2>Sports Category ({sportsCourses.length} Courses)</h2>
          </div>
          <span className="text-xs font-mono text-[#D6C7A1]">
            {selectedSports ? "1 / 1 Selected" : "0 / 1 Selected"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sportsCourses.map((course) => {
            const seatsRemaining = course.s1SeatsAvailable;
            const isFull = seatsRemaining <= 0;
            const isSelected = selectedSports === course.id || selectedSports === course.name;

            return (
              <div
                key={course.id}
                onClick={() => {
                  if (!isFull) {
                    setSelectedSports(course.id);
                    syncSeatHold(course.id, selectedStudentLife);
                  }
                }}
                className={`glass-card p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isFull
                    ? "opacity-50 cursor-not-allowed border-red-500/20 bg-red-950/10"
                    : isSelected
                    ? "border-[#7ECEB7] bg-[#037A74]/35 shadow-lg shadow-[#037A74]/30 scale-[1.02] cursor-pointer"
                    : "border-[#7ECEB7]/15 hover:border-[#7ECEB7]/40 cursor-pointer"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#D6C7A1]">{course.id}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#7ECEB7]" />}
                  </div>
                  <h3 className="font-bold text-base text-[#F5EBE0]">{course.name}</h3>
                </div>

                <div className="pt-2 border-t border-[#7ECEB7]/15 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#D6C7A1]">Seats:</span>
                  {isFull ? (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                      Course Full
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded ${isSelected ? "bg-[#7ECEB7]/20 text-[#7ECEB7] font-bold" : "bg-[#072C28] text-[#D6C7A1]"}`}>
                      {seatsRemaining} / {course.maxSeats} Seats Remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: STUDENT LIFE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#7ECEB7]/20 pb-3">
          <div className="flex items-center gap-2 text-[#A07850] font-semibold text-lg">
            <Compass className="w-5 h-5" />
            <h2>Student Life Category ({studentLifeCourses.length} Courses)</h2>
          </div>
          <span className="text-xs font-mono text-[#D6C7A1]">
            {selectedStudentLife ? "1 / 1 Selected" : "0 / 1 Selected"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {studentLifeCourses.map((course) => {
            const seatsRemaining = course.s1SeatsAvailable;
            const isFull = seatsRemaining <= 0;
            const isSelected = selectedStudentLife === course.id || selectedStudentLife === course.name;

            return (
              <div
                key={course.id}
                onClick={() => {
                  if (!isFull) {
                    setSelectedStudentLife(course.id);
                    syncSeatHold(selectedSports, course.id);
                  }
                }}
                className={`glass-card p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isFull
                    ? "opacity-50 cursor-not-allowed border-red-500/20 bg-red-950/10"
                    : isSelected
                    ? "border-[#A07850] bg-[#A07850]/30 shadow-lg shadow-[#A07850]/20 scale-[1.02] cursor-pointer"
                    : "border-[#7ECEB7]/15 hover:border-[#7ECEB7]/40 cursor-pointer"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#D6C7A1]">{course.id}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#D6C7A1]" />}
                  </div>
                  <h3 className="font-bold text-base text-[#F5EBE0]">{course.name}</h3>
                </div>

                <div className="pt-2 border-t border-[#7ECEB7]/15 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#D6C7A1]">Seats:</span>
                  {isFull ? (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                      Course Full
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded ${isSelected ? "bg-[#A07850]/25 text-[#D6C7A1] font-bold" : "bg-[#072C28] text-[#D6C7A1]"}`}>
                      {seatsRemaining} / {course.maxSeats} Seats Remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER ACTION BAR */}
      <footer className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-6 shadow-2xl z-30 border-[#7ECEB7]/30">
        <div>
          <h3 className="font-semibold text-[#F5EBE0]">Session 1 Selections</h3>
          <p className="text-xs text-[#D6C7A1]">
            {canContinue
              ? "Both Sports & Student Life selected. Ready to continue!"
              : "Please select 1 Sports course and 1 Student Life course to unlock Continue."}
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed text-[#F5EBE0]"
        >
          <span>Continue to Session 2</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
