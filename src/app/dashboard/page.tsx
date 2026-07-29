"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalculatedCourse } from "@/lib/courses";
import { RegistrationRow } from "@/lib/courses";
import { MasterStudent } from "@/lib/google-sheets";
import { Trophy, Compass, CheckCircle2, AlertTriangle, LogOut, Loader2, Sparkles, UserCheck } from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState<MasterStudent | null>(null);
  const [courses, setCourses] = useState<CalculatedCourse[]>([]);
  const [registration, setRegistration] = useState<RegistrationRow | null>(null);

  const [s1Sports, setS1Sports] = useState<string>("");
  const [s1StudentLife, setS1StudentLife] = useState<string>("");
  const [s2Sports, setS2Sports] = useState<string>("");
  const [s2StudentLife, setS2StudentLife] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const router = useRouter();

  const loadData = async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setStudent(data.student);
      setCourses(data.courses || []);
      setRegistration(data.registration);

      if (data.registration) {
        setS1Sports(data.registration.s1Sports || "");
        setS1StudentLife(data.registration.s1StudentLife || "");
        setS2Sports(data.registration.s2Sports || "");
        setS2StudentLife(data.registration.s2StudentLife || "");
      }
    } catch (err) {
      setError("Failed to load course catalogue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s1Sports, s1StudentLife, s2Sports, s2StudentLife }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccessMsg(data.message || "Registration confirmed!");
        await loadData();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const sportsCourses = courses.filter((c) => c.category === "Sports");
  const studentLifeCourses = courses.filter((c) => c.category === "Student Life");

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Bar */}
      <header className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
            <UserCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{student?.name || "Student Portal"}</h1>
            <p className="text-sm text-slate-400">
              Reg No: <span className="text-slate-200 font-mono">{student?.regNo}</span> | Email: <span className="text-slate-200">{student?.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </header>

      {/* Notifications */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Course Selection Form */}
      <form onSubmit={handleRegister} className="space-y-8">
        {/* SESSION 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold">Session 1 Selections</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session 1 Sports */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-medium">
                <Trophy className="w-5 h-5" />
                <h3>Sports Category</h3>
              </div>

              <div className="space-y-3">
                {sportsCourses.map((c) => {
                  const isFull = c.s1SeatsAvailable <= 0;
                  const isSelected = s1Sports === c.id;

                  return (
                    <label
                      key={c.id}
                      className={`glass-card p-4 flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/10"
                          : isFull
                          ? "opacity-50 border-slate-800 cursor-not-allowed"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="s1Sports"
                          value={c.id}
                          disabled={isFull}
                          checked={isSelected}
                          onChange={(e) => setS1Sports(e.target.value)}
                          className="accent-blue-500"
                        />
                        <span className="font-medium text-sm">{c.name}</span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${isFull ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                          {isFull ? "FULL" : `${c.s1SeatsAvailable} / ${c.maxSeats} left`}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Session 1 Student Life */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-medium">
                <Compass className="w-5 h-5" />
                <h3>Student Life Category</h3>
              </div>

              <div className="space-y-3">
                {studentLifeCourses.map((c) => {
                  const isFull = c.s1SeatsAvailable <= 0;
                  const isSelected = s1StudentLife === c.id;

                  return (
                    <label
                      key={c.id}
                      className={`glass-card p-4 flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/10"
                          : isFull
                          ? "opacity-50 border-slate-800 cursor-not-allowed"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="s1StudentLife"
                          value={c.id}
                          disabled={isFull}
                          checked={isSelected}
                          onChange={(e) => setS1StudentLife(e.target.value)}
                          className="accent-purple-500"
                        />
                        <span className="font-medium text-sm">{c.name}</span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${isFull ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                          {isFull ? "FULL" : `${c.s1SeatsAvailable} / ${c.maxSeats} left`}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SESSION 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold">Session 2 Selections</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session 2 Sports */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-medium">
                <Trophy className="w-5 h-5" />
                <h3>Sports Category</h3>
              </div>

              <div className="space-y-3">
                {sportsCourses.map((c) => {
                  const isFull = c.s2SeatsAvailable <= 0;
                  const isSelected = s2Sports === c.id;

                  return (
                    <label
                      key={c.id}
                      className={`glass-card p-4 flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/10"
                          : isFull
                          ? "opacity-50 border-slate-800 cursor-not-allowed"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="s2Sports"
                          value={c.id}
                          disabled={isFull}
                          checked={isSelected}
                          onChange={(e) => setS2Sports(e.target.value)}
                          className="accent-blue-500"
                        />
                        <span className="font-medium text-sm">{c.name}</span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${isFull ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                          {isFull ? "FULL" : `${c.s2SeatsAvailable} / ${c.maxSeats} left`}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Session 2 Student Life */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-medium">
                <Compass className="w-5 h-5" />
                <h3>Student Life Category</h3>
              </div>

              <div className="space-y-3">
                {studentLifeCourses.map((c) => {
                  const isFull = c.s2SeatsAvailable <= 0;
                  const isSelected = s2StudentLife === c.id;

                  return (
                    <label
                      key={c.id}
                      className={`glass-card p-4 flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/10"
                          : isFull
                          ? "opacity-50 border-slate-800 cursor-not-allowed"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="s2StudentLife"
                          value={c.id}
                          disabled={isFull}
                          checked={isSelected}
                          onChange={(e) => setS2StudentLife(e.target.value)}
                          className="accent-purple-500"
                        />
                        <span className="font-medium text-sm">{c.name}</span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${isFull ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                          {isFull ? "FULL" : `${c.s2SeatsAvailable} / ${c.maxSeats} left`}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <div className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-medium">Ready to confirm your choices?</h4>
            <p className="text-xs text-slate-400">You can edit your selections at any time while seats are available.</p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            disabled={submitting || !s1Sports || !s1StudentLife || !s2Sports || !s2StudentLife}
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Course Registration"}
          </button>
        </div>
      </form>
    </div>
  );
}
