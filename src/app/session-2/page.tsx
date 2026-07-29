"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalculatedCourse } from "@/lib/courses";
import { MasterStudent } from "@/lib/google-sheets";
import { Trophy, Compass, ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2, Ban } from "lucide-react";

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

        const userEmail = (data.student?.email || "").toLowerCase();

        const savedS1Sports = (userEmail && localStorage.getItem(`s1Sports_${userEmail}`)) || sessionStorage.getItem("s1Sports") || data.registration?.s1Sports || "";
        const savedS1Life = (userEmail && localStorage.getItem(`s1StudentLife_${userEmail}`)) || sessionStorage.getItem("s1StudentLife") || data.registration?.s1StudentLife || "";

        setS1SportsChoice(savedS1Sports);
        setS1LifeChoice(savedS1Life);

        const savedS2Sports = (userEmail && localStorage.getItem(`s2Sports_${userEmail}`)) || sessionStorage.getItem("s2Sports") || data.registration?.s2Sports || "";
        const savedS2Life = (userEmail && localStorage.getItem(`s2StudentLife_${userEmail}`)) || sessionStorage.getItem("s2StudentLife") || data.registration?.s2StudentLife || "";

        setSelectedSports(savedS2Sports);
        setSelectedStudentLife(savedS2Life);

      } catch (err) {
        console.error("Failed to load Session 2 data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
      localStorage.setItem(`s2Sports_${userEmail}`, selectedSports);
      localStorage.setItem(`s2StudentLife_${userEmail}`, selectedStudentLife);
    }
    sessionStorage.setItem("s2Sports", selectedSports);
    sessionStorage.setItem("s2StudentLife", selectedStudentLife);
    router.push("/review");
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in bg-[#041C19] text-[#F5EBE0]">
      {/* Header Banner */}
      <header className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#7ECEB7]/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/session-1")}
            className="p-2.5 rounded-xl glass-card hover:bg-[#037A74]/30 text-[#D6C7A1] transition-all border border-[#7ECEB7]/20"
            title="Back to Session 1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#A07850]/20 text-[#D6C7A1] border border-[#A07850]/40">
                SESSION 2 REGISTRATION
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1 text-[#F5EBE0]">Select Session 2 Courses</h1>
            <p className="text-xs text-[#D6C7A1]">
              Student: <span className="text-[#F5EBE0] font-medium">{student?.name}</span> ({student?.regNo})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#D6C7A1] bg-[#072C28] p-3 rounded-xl border border-[#7ECEB7]/20">
          <Sparkles className="w-4 h-4 text-[#A07850]" />
          <span>Session 1 selections are automatically disabled for Session 2</span>
        </div>
      </header>

      {/* SECTION 1: SPORTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#7ECEB7]/20 pb-3">
          <div className="flex items-center gap-2 text-[#7ECEB7] font-semibold text-lg">
            <Trophy className="w-5 h-5" />
            <h2>Sports Category (Independent Session 2 Capacity)</h2>
          </div>
          <span className="text-xs font-mono text-[#D6C7A1]">
            {selectedSports ? "1 / 1 Selected" : "0 / 1 Selected"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sportsCourses.map((course) => {
            const seatsRemaining = course.s2SeatsAvailable;
            const isFull = seatsRemaining <= 0;
            const isSelectedInSession1 = course.id === s1SportsChoice || course.name === s1SportsChoice;
            const isDisabled = isFull || isSelectedInSession1;
            const isSelected = selectedSports === course.id || selectedSports === course.name;

            return (
              <div
                key={course.id}
                onClick={() => {
                  if (!isDisabled) setSelectedSports(course.id);
                }}
                className={`glass-card p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isSelectedInSession1
                    ? "opacity-40 cursor-not-allowed border-[#7ECEB7]/10 bg-[#041C19]"
                    : isFull
                    ? "opacity-50 cursor-not-allowed border-red-500/20 bg-red-950/10"
                    : isSelected
                    ? "border-[#7ECEB7] bg-[#037A74]/35 shadow-lg shadow-[#037A74]/30 scale-[1.02] cursor-pointer"
                    : "border-[#7ECEB7]/15 hover:border-[#7ECEB7]/40 cursor-pointer"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#D6C7A1]">{course.id}</span>
                    {isSelectedInSession1 ? (
                      <span className="text-[10px] font-semibold text-[#A07850] bg-[#A07850]/15 border border-[#A07850]/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Selected in S1
                      </span>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-[#7ECEB7]" />
                    ) : null}
                  </div>
                  <h3 className="font-bold text-base text-[#F5EBE0]">{course.name}</h3>
                </div>

                <div className="pt-2 border-t border-[#7ECEB7]/15 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#D6C7A1]">Seats:</span>
                  {isSelectedInSession1 ? (
                    <span className="px-2 py-0.5 rounded bg-[#072C28] text-[#D6C7A1]/50 border border-[#7ECEB7]/10">
                      Disabled
                    </span>
                  ) : isFull ? (
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
            <h2>Student Life Category (Independent Session 2 Capacity)</h2>
          </div>
          <span className="text-xs font-mono text-[#D6C7A1]">
            {selectedStudentLife ? "1 / 1 Selected" : "0 / 1 Selected"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {studentLifeCourses.map((course) => {
            const seatsRemaining = course.s2SeatsAvailable;
            const isFull = seatsRemaining <= 0;
            const isSelectedInSession1 = course.id === s1LifeChoice || course.name === s1LifeChoice;
            const isDisabled = isFull || isSelectedInSession1;
            const isSelected = selectedStudentLife === course.id || selectedStudentLife === course.name;

            return (
              <div
                key={course.id}
                onClick={() => {
                  if (!isDisabled) setSelectedStudentLife(course.id);
                }}
                className={`glass-card p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isSelectedInSession1
                    ? "opacity-40 cursor-not-allowed border-[#7ECEB7]/10 bg-[#041C19]"
                    : isFull
                    ? "opacity-50 cursor-not-allowed border-red-500/20 bg-red-950/10"
                    : isSelected
                    ? "border-[#A07850] bg-[#A07850]/30 shadow-lg shadow-[#A07850]/20 scale-[1.02] cursor-pointer"
                    : "border-[#7ECEB7]/15 hover:border-[#7ECEB7]/40 cursor-pointer"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#D6C7A1]">{course.id}</span>
                    {isSelectedInSession1 ? (
                      <span className="text-[10px] font-semibold text-[#A07850] bg-[#A07850]/15 border border-[#A07850]/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Selected in S1
                      </span>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-[#D6C7A1]" />
                    ) : null}
                  </div>
                  <h3 className="font-bold text-base text-[#F5EBE0]">{course.name}</h3>
                </div>

                <div className="pt-2 border-t border-[#7ECEB7]/15 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#D6C7A1]">Seats:</span>
                  {isSelectedInSession1 ? (
                    <span className="px-2 py-0.5 rounded bg-[#072C28] text-[#D6C7A1]/50 border border-[#7ECEB7]/10">
                      Disabled
                    </span>
                  ) : isFull ? (
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
      <footer className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-6 shadow-2xl z-30 border-[#A07850]/30">
        <div>
          <h3 className="font-semibold text-[#F5EBE0]">Session 2 Selections</h3>
          <p className="text-xs text-[#D6C7A1]">
            {canContinue
              ? "Session 2 selections ready. Proceed to final review!"
              : "Please select 1 Sports course and 1 Student Life course to unlock Continue."}
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-bronze w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed text-[#F5EBE0]"
        >
          <span>Proceed to Final Review</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
