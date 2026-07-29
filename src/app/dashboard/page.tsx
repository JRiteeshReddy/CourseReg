"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MasterStudent } from "@/lib/google-sheets";
import { 
  CheckCircle2, 
  Lock, 
  LogOut, 
  Loader2, 
  UserCheck, 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  Trophy, 
  Compass, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState<MasterStudent | null>(null);
  const [loading, setLoading] = useState(true);

  // Track session completion state for unlocking
  const [isSession1Complete, setIsSession1Complete] = useState(false);
  const [isSession2Complete, setIsSession2Complete] = useState(false);

  // Selected courses preview
  const [s1Sports, setS1Sports] = useState("");
  const [s1Life, setS1Life] = useState("");
  const [s2Sports, setS2Sports] = useState("");
  const [s2Life, setS2Life] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await fetch("/api/courses");
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setStudent(data.student);

        if (data.registration) {
          if (data.registration.s1Sports && data.registration.s1StudentLife) {
            setIsSession1Complete(true);
            setS1Sports(data.registration.s1Sports);
            setS1Life(data.registration.s1StudentLife);
          }
          if (data.registration.s2Sports && data.registration.s2StudentLife) {
            setIsSession2Complete(true);
            setS2Sports(data.registration.s2Sports);
            setS2Life(data.registration.s2StudentLife);
          }
        }
      } catch (err) {
        console.error("Failed to load student data", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Calculate current progress step (1 to 5)
  const currentStep = isSession2Complete ? 4 : isSession1Complete ? 3 : 2;

  const steps = [
    { label: "Login", status: "completed" },
    { label: "Session 1", status: isSession1Complete ? "completed" : "active" },
    { label: "Session 2", status: isSession2Complete ? "completed" : isSession1Complete ? "active" : "locked" },
    { label: "Review", status: isSession1Complete && isSession2Complete ? "active" : "upcoming" },
    { label: "Completed", status: "upcoming" },
  ];

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* HEADER / WELCOME BANNER */}
      <header className="glass-panel p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welcome, {student?.name || "Student"}
              </h1>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mt-1">
              <span>Reg No: <strong className="text-slate-200 font-mono">{student?.regNo || "N/A"}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-slate-200">{student?.email}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </header>

      {/* PROGRESS TRACKER */}
      <section className="glass-panel p-6 md:p-8 space-y-4">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Registration Progress</h2>
        
        <div className="flex items-center justify-between relative">
          {/* Progress Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>

          {steps.map((step, idx) => {
            const isDone = step.status === "completed";
            const isActive = step.status === "active";
            const isLocked = step.status === "locked";

            return (
              <div key={idx} className="flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-2 border-emerald-400"
                      : isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-500/20 border-2 border-blue-400 scale-110"
                      : "bg-slate-900 text-slate-500 border border-slate-700"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isDone
                      ? "text-emerald-400 font-semibold"
                      : isActive
                      ? "text-blue-400 font-semibold"
                      : "text-slate-500"
                  }`}
                >
                  {step.label} {isDone && "✓"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* TWO LARGE CARDS: SESSION 1 & SESSION 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LARGE CARD 1: SESSION 1 */}
        <div className="glass-panel p-8 space-y-6 relative overflow-hidden flex flex-col justify-between border-blue-500/30 hover:border-blue-500/60 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Session 1
              </span>

              {isSession1Complete ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  In Progress
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Session 1 Course Selection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Choose 1 Sports activity and 1 Student Life course for your first semester session.
              </p>
            </div>

            {/* Course Summary Preview */}
            <div className="space-y-3 pt-2">
              <div className="glass-card p-4 flex items-center justify-between border-slate-800">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">Sports Activity</span>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                  {s1Sports || "Not Selected"}
                </span>
              </div>

              <div className="glass-card p-4 flex items-center justify-between border-slate-800">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium">Student Life Course</span>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                  {s1Life || "Not Selected"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/session-1")}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 group-hover:shadow-blue-500/30"
          >
            {isSession1Complete ? "Edit Session 1 Choices" : "Select Session 1 Courses"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* LARGE CARD 2: SESSION 2 (LOCKED UNTIL SESSION 1 IS COMPLETE) */}
        <div
          className={`glass-panel p-8 space-y-6 relative overflow-hidden flex flex-col justify-between transition-all ${
            !isSession1Complete
              ? "border-slate-800/80 bg-slate-950/80"
              : "border-purple-500/30 hover:border-purple-500/60"
          }`}
        >
          {/* LOCKED OVERLAY (If Session 1 is incomplete) */}
          {!isSession1Complete && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xl">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-lg font-bold text-white">Session 2 Locked</h4>
                <p className="text-xs text-slate-400">
                  Complete your Session 1 selections first to unlock Session 2.
                </p>
              </div>
              <button
                onClick={() => setIsSession1Complete(true)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
              >
                (Demo: Click to simulate Session 1 completion)
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Session 2
              </span>

              {isSession2Complete ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  Unlocked
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Session 2 Course Selection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Choose 1 Sports activity and 1 Student Life course for your second semester session.
              </p>
            </div>

            {/* Course Summary Preview */}
            <div className="space-y-3 pt-2">
              <div className="glass-card p-4 flex items-center justify-between border-slate-800">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">Sports Activity</span>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                  {s2Sports || "Not Selected"}
                </span>
              </div>

              <div className="glass-card p-4 flex items-center justify-between border-slate-800">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium">Student Life Course</span>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                  {s2Life || "Not Selected"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/session-2")}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
          >
            {isSession2Complete ? "Edit Session 2 Choices" : "Select Session 2 Courses"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>
    </div>
  );
}
