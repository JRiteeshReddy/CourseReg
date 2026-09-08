"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MasterStudent } from "@/lib/google-sheets";
import { 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  Trophy, 
  Compass, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  Printer
} from "lucide-react";

export default function ReviewPage() {
  const [student, setStudent] = useState<MasterStudent | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [timestamp, setTimestamp] = useState("");

  // Temporary draft selections
  const [s1Sports, setS1Sports] = useState("");
  const [s1Life, setS1Life] = useState("");
  const [s2Sports, setS2Sports] = useState("");
  const [s2Life, setS2Life] = useState("");

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
        if (typeof data.isRegistrationOpen === "boolean") {
          setIsRegistrationOpen(data.isRegistrationOpen);
          if (!data.isRegistrationOpen && data.registration?.status?.toUpperCase() !== "CONFIRMED") {
            setError("Course registration is currently CLOSED by the Administrator.");
          }
        }

        const userEmail = (data.student?.email || "").toLowerCase();
        const serverConfirmed = Boolean(
          data.registration && (data.registration.status?.toUpperCase() === "CONFIRMED" || data.registration.status?.toUpperCase() === "SUBMITTED")
        );

        if (!serverConfirmed && userEmail) {
          localStorage.removeItem(`confirmed_registration_${userEmail}`);
          localStorage.removeItem(`s1Sports_${userEmail}`);
          localStorage.removeItem(`s1StudentLife_${userEmail}`);
          localStorage.removeItem(`s2Sports_${userEmail}`);
          localStorage.removeItem(`s2StudentLife_${userEmail}`);
        }

        const draftS2Sports = serverConfirmed ? (data.registration?.s2Sports || "") : ((userEmail && localStorage.getItem(`s2Sports_${userEmail}`)) || sessionStorage.getItem("s2Sports") || "");
        const draftS2Life = serverConfirmed ? (data.registration?.s2StudentLife || "") : ((userEmail && localStorage.getItem(`s2StudentLife_${userEmail}`)) || sessionStorage.getItem("s2StudentLife") || "");

        setS2Sports(draftS2Sports);
        setS2Life(draftS2Life);

        if (serverConfirmed) {
          setIsCompleted(true);
          setTimestamp(data.registration?.timestamp || new Date().toISOString());
        }
      } catch (err) {
        console.error("Failed to load review data", err);
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

  const isAllSelected = Boolean(s2Sports && s2Life);

  const handleRegisterSubmit = async () => {
    if (submitting || isCompleted || !isAllSelected) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s2Sports,
          s2StudentLife: s2Life,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setIsCompleted(true);
        setTimestamp(new Date().toISOString());
        if (student?.email) {
          const userEmail = student.email.toLowerCase();
          localStorage.setItem(`confirmed_registration_${userEmail}`, "CONFIRMED");
          localStorage.setItem(`s2Sports_${userEmail}`, s2Sports);
          localStorage.setItem(`s2StudentLife_${userEmail}`, s2Life);
        }
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-fade-in bg-[#041C19] text-[#F5EBE0]">
      {/* HEADER BANNER */}
      <header className="glass-panel p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#7ECEB7]/20">
        <div className="flex items-center gap-3 sm:gap-4">
          {!isCompleted && (
            <button
              onClick={() => router.push("/session-2")}
              className="p-2 sm:p-2.5 rounded-xl glass-card hover:bg-[#037A74]/30 text-[#D6C7A1] transition-all border border-[#7ECEB7]/20 flex-shrink-0"
              title="Back to Session 2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-mono bg-[#7ECEB7]/20 text-[#7ECEB7] border border-[#7ECEB7]/30">
                FINAL REVIEW & REGISTRATION
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-[#F5EBE0]">
              {isCompleted ? "Registration Confirmed!" : "Review Selected Courses"}
            </h1>
            <p className="text-xs text-[#D6C7A1]">
              Student: <span className="text-[#F5EBE0] font-medium">{student?.name}</span> ({student?.regNo})
            </p>
          </div>
        </div>

        {isCompleted && (
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-xl bg-[#072C28] hover:bg-[#037A74]/30 text-[#F5EBE0] text-xs font-medium border border-[#7ECEB7]/20 transition-all"
          >
            <Printer className="w-4 h-4 text-[#7ECEB7]" /> Print Confirmation
          </button>
        )}
      </header>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS CONFIRMATION BANNER */}
      {isCompleted && (
        <div className="bg-[#7ECEB7]/10 border border-[#7ECEB7]/30 text-[#7ECEB7] p-5 sm:p-6 rounded-2xl space-y-2 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-[#7ECEB7] flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#F5EBE0]">Course Registration Complete!</h2>
              <p className="text-xs text-[#7ECEB7]">
                Your selections have been permanently recorded. Your registration is now locked and read-only.
              </p>
            </div>
          </div>
          {timestamp && (
            <p className="text-xs font-mono text-[#D6C7A1] pt-2 border-t border-[#7ECEB7]/20">
              Timestamp: {new Date(timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* SUMMARY REVIEW CARDS */}
      <div className="space-y-4 sm:space-y-6">
        {/* STUDENT PROFILE CARD */}
        <div className="glass-panel p-5 sm:p-6 space-y-3 border border-[#7ECEB7]/20">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D6C7A1] border-b border-[#7ECEB7]/15 pb-2">
            Student Profile Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-[#D6C7A1]/70 text-xs block">Student Name</span>
              <strong className="text-[#F5EBE0] font-medium">{student?.name}</strong>
            </div>
            <div>
              <span className="text-[#D6C7A1]/70 text-xs block">Registration Number</span>
              <strong className="text-[#F5EBE0] font-mono">{student?.regNo}</strong>
            </div>
            <div>
              <span className="text-[#D6C7A1]/70 text-xs block">University Email</span>
              <strong className="text-[#F5EBE0] font-mono break-all">{student?.email}</strong>
            </div>
          </div>
        </div>



        {/* SESSION 2 SUMMARY */}
        <div className="glass-panel p-5 sm:p-6 space-y-4 border-[#A07850]/40">
          <div className="flex items-center justify-between border-b border-[#7ECEB7]/15 pb-3">
            <div className="flex items-center gap-2 text-[#D6C7A1] font-bold">
              <Calendar className="w-5 h-5" />
              <h4>Session 2 Selections</h4>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#A07850]/20 text-[#D6C7A1] border border-[#A07850]/40">
              Session 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="glass-card p-3.5 sm:p-4 flex items-center gap-3 border-[#7ECEB7]/15">
              <Trophy className="w-5 h-5 text-[#7ECEB7] flex-shrink-0" />
              <div>
                <span className="text-xs text-[#D6C7A1] block">Sports Course</span>
                <strong className="text-[#F5EBE0] font-semibold text-xs sm:text-sm">{s2Sports || "None Selected"}</strong>
              </div>
            </div>

            <div className="glass-card p-3.5 sm:p-4 flex items-center gap-3 border-[#7ECEB7]/15">
              <Compass className="w-5 h-5 text-[#A07850] flex-shrink-0" />
              <div>
                <span className="text-xs text-[#D6C7A1] block">Student Life Course</span>
                <strong className="text-[#F5EBE0] font-semibold text-xs sm:text-sm">{s2Life || "None Selected"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL ACTION BAR / REGISTER BUTTON */}
      <footer className="glass-panel p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 sticky bottom-3 sm:bottom-6 shadow-2xl z-30 border-[#7ECEB7]/30 backdrop-blur-xl">
        <div className="text-center sm:text-left">
          <h3 className="font-semibold text-sm sm:text-base text-[#F5EBE0]">
            {isCompleted ? "Registration Confirmed" : "Final Step"}
          </h3>
          <p className="text-xs text-[#D6C7A1]">
            {isCompleted
              ? "Your course choices have been saved permanently."
              : "Once registered, your course selections become read-only."}
          </p>
        </div>

        {isCompleted ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-primary w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-[#F5EBE0]"
          >
            <span>Return to Dashboard</span>
          </button>
        ) : (
          <button
            onClick={handleRegisterSubmit}
            disabled={submitting || !isAllSelected || !isRegistrationOpen}
            className="btn-primary w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#037A74]/30 text-[#F5EBE0]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#F5EBE0]" />
                <span>Saving Registration...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-[#F5EBE0]" />
                <span>Confirm & Submit Registration</span>
              </>
            )}
          </button>
        )}
      </footer>
    </div>
  );
}
