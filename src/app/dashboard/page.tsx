"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertTriangle, Calendar, Info, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  name: string;
  category: "Sports" | "Student Life";
  session1Remaining: number;
  session2Remaining: number;
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Registration State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: S1, 2: S2, 3: Review, 4: Complete
  const [s1Sports, setS1Sports] = useState("");
  const [s1SL, setS1SL] = useState("");
  const [s2Sports, setS2Sports] = useState("");
  const [s2SL, setS2SL] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setCourses(data.courses);
      if (data.userRegistration) {
        setUserRegistration(data.userRegistration);
        setStep(4);
      }
    } catch (err) {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s1Sports,
          s1StudentLife: s1SL,
          s2Sports,
          s2StudentLife: s2SL,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");
      
      // On success, refetch to get updated registration and go to step 4
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      setStep(3); // Go back to review
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    // Basic logout - we'd normally hit a /api/auth/logout route to clear cookie
    // For now, redirect to / (which might auto login if cookie isn't cleared, so let's clear it)
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const sportsCourses = courses.filter((c) => c.category === "Sports");
  const slCourses = courses.filter((c) => c.category === "Student Life");

  const isS1Complete = s1Sports !== "" && s1SL !== "";
  const isS2Complete = s2Sports !== "" && s2SL !== "";

  const renderCourseGrid = (
    title: string,
    list: Course[],
    selected: string,
    onSelect: (id: string) => void,
    session: 1 | 2,
    prevSelection?: string
  ) => {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((c) => {
            const isPrevSelected = prevSelection === c.id;
            const remaining = session === 1 ? c.session1Remaining : c.session2Remaining;
            const isFull = remaining <= 0;
            const isDisabled = isPrevSelected || isFull;
            const isSelected = selected === c.id;

            return (
              <div
                key={c.id}
                onClick={() => !isDisabled && onSelect(c.id)}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : isDisabled
                    ? "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                    : "glass-card cursor-pointer"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-100">{c.name}</h4>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="text-sm mt-4">
                  {isPrevSelected ? (
                    <span className="text-yellow-500">Selected in Session 1</span>
                  ) : isFull ? (
                    <span className="text-red-400">Course Full</span>
                  ) : (
                    <span className="text-blue-300 font-medium">{remaining} / 25 Seats Remaining</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Course Registration Portal
        </h1>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {step < 4 && (
        <div className="mb-8 bg-white/5 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-in">
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 text-blue-100">
            <Info className="w-5 h-5 flex-shrink-0 text-blue-400" />
            <div>
              <p className="font-semibold mb-1">Session 1 Selections</p>
              <p className="text-sm text-blue-200/80">Please select one Sports course and one Student Life course for your first session.</p>
            </div>
          </div>
          
          {renderCourseGrid("Sports", sportsCourses, s1Sports, setS1Sports, 1)}
          {renderCourseGrid("Student Life", slCourses, s1SL, setS1SL, 1)}
          
          <div className="flex justify-end mt-8">
            <button 
              onClick={() => setStep(2)} 
              disabled={!isS1Complete}
              className="btn-primary"
            >
              Next: Session 2
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg flex gap-3 text-purple-100">
            <Info className="w-5 h-5 flex-shrink-0 text-purple-400" />
            <div>
              <p className="font-semibold mb-1">Session 2 Selections</p>
              <p className="text-sm text-purple-200/80">Select one Sports and one Student Life course. You cannot pick courses you already selected in Session 1.</p>
            </div>
          </div>
          
          {renderCourseGrid("Sports", sportsCourses, s2Sports, setS2Sports, 2, s1Sports)}
          {renderCourseGrid("Student Life", slCourses, s2SL, setS2SL, 2, s1SL)}
          
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)} className="px-6 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
              Back
            </button>
            <button 
              onClick={() => setStep(3)} 
              disabled={!isS2Complete}
              className="btn-primary"
            >
              Review Selections
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Review Your Registration</h2>
          
          <div className="glass-panel p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-blue-400 border-b border-white/10 pb-2">Session 1</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Sports</p>
                <p className="font-medium text-lg">{courses.find(c => c.id === s1Sports)?.name}</p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Student Life</p>
                <p className="font-medium text-lg">{courses.find(c => c.id === s1SL)?.name}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4 text-purple-400 border-b border-white/10 pb-2">Session 2</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Sports</p>
                <p className="font-medium text-lg">{courses.find(c => c.id === s2Sports)?.name}</p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Student Life</p>
                <p className="font-medium text-lg">{courses.find(c => c.id === s2SL)?.name}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={() => setStep(2)} disabled={submitting} className="px-6 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
              Edit Selections
            </button>
            <button 
              onClick={submitRegistration} 
              disabled={submitting}
              className="btn-primary min-w-[200px] flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Registration"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && userRegistration && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Registration Complete</h2>
            <p className="text-slate-300">
              Your course selections have been locked and saved successfully.
            </p>
          </div>
          
          <div className="glass-panel p-6 mb-8">
            <div className="mb-6 flex flex-wrap gap-4 justify-between border-b border-white/10 pb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Student Name</p>
                <p className="font-medium">{userRegistration.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Registration No</p>
                <p className="font-medium font-mono text-blue-300">{userRegistration.regNo}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">Session 1</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 bg-white/5 p-3 rounded-md border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 block"></span>
                    {courses.find(c => c.id === userRegistration.s1Sports)?.name} (Sports)
                  </li>
                  <li className="flex items-center gap-3 bg-white/5 p-3 rounded-md border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 block"></span>
                    {courses.find(c => c.id === userRegistration.s1StudentLife)?.name} (Life)
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Session 2</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 bg-white/5 p-3 rounded-md border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 block"></span>
                    {courses.find(c => c.id === userRegistration.s2Sports)?.name} (Sports)
                  </li>
                  <li className="flex items-center gap-3 bg-white/5 p-3 rounded-md border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 block"></span>
                    {courses.find(c => c.id === userRegistration.s2StudentLife)?.name} (Life)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 bg-black/40">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-300" /> Timetable
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-medium text-blue-300 mb-2">Sports</p>
                <p className="text-sm text-slate-300">Tuesday, Wednesday, Thursday, Friday</p>
                <p className="text-xs text-slate-400 mt-1">4:00 PM to 5:00 PM</p>
              </div>
              <div>
                <p className="font-medium text-purple-300 mb-2">Student Life</p>
                <p className="text-sm text-slate-300">Wednesday, Friday</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
