"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalculatedCourse } from "@/lib/courses";
import { MasterStudent } from "@/lib/google-sheets";
import { Trophy, Compass, ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2, Lock, Ban } from "lucide-react";

export default function Session2Page() {
  const [student, setStudent] = useState<MasterStudent | null>(null);
  const [courses, setCourses] = useState<CalculatedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Session 1 draft choices (must be excluded from Session 2)
  const [s1SportsChoice, setS1SportsChoice] = useState<string>("");
  const [s1LifeChoice, setS1LifeChoice] = useState<string>("");

  // Temporary Session 2 selections (Do NOT write to DB yet)
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

        // Read Session 1 draft choices from sessionStorage or registration
        const savedS1Sports = sessionStorage.getItem("s1Sports") || data.registration?.s1Sports || "";
        const savedS1Life = sessionStorage.getItem("s1StudentLife") || data.registration?.s1StudentLife || "";

        setS1SportsChoice(savedS1Sports);
        setS1LifeChoice(savedS1Life);

        // Load existing Session 2 draft if available
        const savedS2Sports = sessionStorage.getItem("s2Sports") || data.registration?.s2Sports || "";
        const savedS2Life = sessionStorage.getItem("s2StudentLife") || data.registration?.s2StudentLife || "";

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
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const sportsCourses = courses.filter((c) => c.category === "Sports");
  const studentLifeCourses = courses.filter((c) => c.category === "Student Life");

  // Validation: Exactly 1 Sports AND 1 Student Life must be selected to activate Continue
  const canContinue = Boolean(selectedSports && selectedStudentLife);

  const handleContinue = () => {
    if (!canContinue) return;
    // Save draft temporary selections to sessionStorage (no DB write yet)
    sessionStorage.setItem("s2Sports", selectedSports);
    sessionStorage.setItem("s2StudentLife", selectedStudentLife);
    router.push("/review");
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <header className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/session-1")}
            className="p-2.5 rounded-xl glass-card hover:bg-slate-800 text-slate-300 transition-all border border-slate-800"
            title="Back to Session 1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30">
                SESSION 2 REGISTRATION
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Select Session 2 Courses</h1>
            <p className="text-xs text-slate-400">
              Student: <span className="text-white font-medium">{student?.name}</span> ({student?.regNo})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Session 1 selections are automatically disabled for Session 2</span>
        </div>
      </header>

      {/* SECTION 1: SPORTS (EXACTLY 8 COURSES) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-lg">
            <Trophy className="w-5 h-5" />
            <h2>Sports Category (Independent Session 2 Capacity)</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
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
                    ? "opacity-40 cursor-not-allowed border-slate-800 bg-slate-950/60"
                    : isFull
                    ? "opacity-50 cursor-not-allowed border-red-500/20 bg-red-950/10"
                    : isSelected
                    ? "border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/10 scale-[1.02] cursor-pointer"
                    : "border-slate-800 hover:border-slate-700 cursor-pointer"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">{course.id}</span>
                    {isSelectedInSession1 ? (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Selected in Session 1
                      </span>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    ) : null}
                  </div>
                  <h3 className="font-bold text-base text-white">{course.name}</h3>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Seats:</span>
                  {isSelectedInSession1 ? (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
                      Disabled
                    </span>
                  ) : isFull ? (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      Course Full
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded ${isSelected ? "bg-blue-500/20 text-blue-300 font-bold" : "bg-slate-800 text-slate-300"}`}>
                      {seatsRemaining} / {course.maxSeats} Seats Remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: STUDENT LIFE (EXACTLY 11 COURSES) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-lg">
            <Compass className="w-5 h-5" />
            <h2>Student Life Category (Independent Session 2 Capacity)</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
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
                    ? "opacity-40 cursor-not-allowed border-slate-800 bg-slate-950/60"
                    : isFull
                    ? "opacity-50 cursor-not-allowed border-red-500/20 bg-red-950/10"
                    : isSelected
                    ? "border-purple-500 bg-purple-500/15 shadow-lg shadow-purple-500/10 scale-[1.02] cursor-pointer"
                    : "border-slate-800 hover:border-slate-700 cursor-pointer"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">{course.id}</span>
                    {isSelectedInSession1 ? (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Selected in Session 1
                      </span>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    ) : null}
                  </div>
                  <h3 className="font-bold text-base text-white">{course.name}</h3>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Seats:</span>
                  {isSelectedInSession1 ? (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
                      Disabled
                    </span>
                  ) : isFull ? (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      Course Full
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded ${isSelected ? "bg-purple-500/20 text-purple-300 font-bold" : "bg-slate-800 text-slate-300"}`}>
                      {seatsRemaining} / {course.maxSeats} Seats Remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM ACTION BAR / CONTINUE BUTTON */}
      <footer className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-6 shadow-2xl z-30 border-purple-500/30">
        <div>
          <h3 className="font-semibold text-white">Session 2 Selections</h3>
          <p className="text-xs text-slate-400">
            {canContinue
              ? "Session 2 selections ready. Proceed to final review!"
              : "Please select 1 Sports course and 1 Student Life course to unlock Continue."}
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Proceed to Final Review</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
