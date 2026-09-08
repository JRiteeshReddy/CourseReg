"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MasterStudent } from "@/lib/google-sheets";
import { CalculatedCourse, COURSES, RegistrationRow } from "@/lib/courses";
import { 
  CheckCircle2, 
  Lock, 
  LogOut, 
  Loader2, 
  UserCheck, 
  Sparkles, 
  Calendar, 
  Trophy, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Printer,
  AlertTriangle,
  Clock,
  Info,
  BookOpen,
  KeyRound,
  X,
  Eye,
  EyeOff,
  Bell,
  Ban
} from "lucide-react";

export default function StudentDashboard() {
  const [mounted, setMounted] = useState(false);
  const [student, setStudent] = useState<MasterStudent | null>(null);
  const [registration, setRegistration] = useState<RegistrationRow | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [coursesList, setCoursesList] = useState<CalculatedCourse[]>([]);
  const [catalogFilter, setCatalogFilter] = useState<"all" | "Sports" | "Student Life">("all");

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordMsgType, setPasswordMsgType] = useState<"success" | "error" | "">("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Track session completion state for unlocking
  const [isSession1Complete, setIsSession1Complete] = useState(false);
  const [isSession2Complete, setIsSession2Complete] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  // Selected courses preview
  const [s1Sports, setS1Sports] = useState("");
  const [s1Life, setS1Life] = useState("");
  const [s2Sports, setS2Sports] = useState("");
  const [s2Life, setS2Life] = useState("");

  const router = useRouter();

  const getCourseName = (idOrName: string) => {
    if (!idOrName) return "";
    const found = COURSES.find(c => c.id === idOrName || c.name === idOrName);
    return found ? found.name : idOrName;
  };

  useEffect(() => {
    setMounted(true);
    async function loadStudent() {
      try {
        const res = await fetch("/api/courses");
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setStudent(data.student);
        setRegistration(data.registration);
        if (data.courses) {
          setCoursesList(data.courses);
        }
        if (typeof data.isRegistrationOpen === "boolean") {
          setIsRegistrationOpen(data.isRegistrationOpen);
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
          sessionStorage.removeItem("s1Sports");
          sessionStorage.removeItem("s1StudentLife");
          sessionStorage.removeItem("s2Sports");
          sessionStorage.removeItem("s2StudentLife");
        }

        const isConfirmed = serverConfirmed;
        setIsAlreadyRegistered(isConfirmed);

        // Read draft selections from localStorage (durable per user) or sessionStorage or confirmed registration
        const draftS1Sports = isConfirmed ? (data.registration?.s1Sports || "") : ((userEmail && localStorage.getItem(`s1Sports_${userEmail}`)) || sessionStorage.getItem("s1Sports") || "");
        const draftS1Life = isConfirmed ? (data.registration?.s1StudentLife || "") : ((userEmail && localStorage.getItem(`s1StudentLife_${userEmail}`)) || sessionStorage.getItem("s1StudentLife") || "");
        const draftS2Sports = isConfirmed ? (data.registration?.s2Sports || "") : ((userEmail && localStorage.getItem(`s2Sports_${userEmail}`)) || sessionStorage.getItem("s2Sports") || "");
        const draftS2Life = isConfirmed ? (data.registration?.s2StudentLife || "") : ((userEmail && localStorage.getItem(`s2StudentLife_${userEmail}`)) || sessionStorage.getItem("s2StudentLife") || "");

        const resolvedS1Sports = getCourseName(draftS1Sports);
        const resolvedS1Life = getCourseName(draftS1Life);
        const resolvedS2Sports = getCourseName(draftS2Sports);
        const resolvedS2Life = getCourseName(draftS2Life);

        setS1Sports(resolvedS1Sports);
        setS1Life(resolvedS1Life);
        setS2Sports(resolvedS2Sports);
        setS2Life(resolvedS2Life);

        const s1Done = Boolean(resolvedS1Sports && resolvedS1Life);
        const s2Done = Boolean(resolvedS2Sports && resolvedS2Life);

        setIsSession1Complete(s1Done || isConfirmed);
        setIsSession2Complete(s2Done || isConfirmed);
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

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordMsgType("");

    if (newPassword !== confirmPassword) {
      setPasswordMsg("New password and confirm password do not match.");
      setPasswordMsgType("error");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg("New password must be at least 6 characters.");
      setPasswordMsgType("error");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPasswordMsg(data.error || "Failed to update password.");
        setPasswordMsgType("error");
      } else {
        setPasswordMsg("Password changed successfully!");
        setPasswordMsgType("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordMsg("");
          setPasswordMsgType("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setPasswordMsg("An error occurred while changing password.");
      setPasswordMsgType("error");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#041C19]">
        <Loader2 className="w-8 h-8 text-[#7ECEB7] animate-spin" />
      </div>
    );
  }

  const steps = [
    { label: "Login", status: "completed" },
    { label: "Session 2 Selection", status: isSession2Complete || isAlreadyRegistered ? "completed" : "active" },
    { label: "Review & Submit", status: isAlreadyRegistered ? "completed" : isSession2Complete ? "active" : "upcoming" },
    { label: "Completed", status: isAlreadyRegistered ? "completed" : "upcoming" },
  ];

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in bg-[#041C19] text-[#F5EBE0]">
      {/* HEADER / WELCOME BANNER */}
      <header className="glass-panel p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-[#7ECEB7]/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#037A74]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#037A74] to-[#7ECEB7] rounded-2xl flex items-center justify-center shadow-lg shadow-[#037A74]/30 border border-[#7ECEB7]/40">
            <UserCheck className="w-8 h-8 text-[#F5EBE0]" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5EBE0]">
                Welcome, {student?.name || "Student"}
              </h1>
              {isAlreadyRegistered ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7ECEB7]/20 text-[#7ECEB7] border border-[#7ECEB7]/30 flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#7ECEB7]" /> Registration Completed
                </span>
              ) : (
                <Sparkles className="w-5 h-5 text-[#A07850] animate-pulse" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#D6C7A1] mt-1">
              <span>Reg No: <strong className="text-[#F5EBE0] font-mono">{student?.regNo || "N/A"}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-[#F5EBE0]">{student?.email}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 flex-wrap">
          <button
            onClick={() => {
              setPasswordMsg("");
              setPasswordMsgType("");
              setShowPasswordModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#072C28] hover:bg-[#037A74]/40 text-[#F5EBE0] text-xs font-medium border border-[#7ECEB7]/20 transition-all shadow-sm"
          >
            <KeyRound className="w-4 h-4 text-[#7ECEB7]" /> Change Password
          </button>

          {isAlreadyRegistered && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#072C28] hover:bg-[#037A74]/40 text-[#F5EBE0] text-xs font-medium border border-[#7ECEB7]/20 transition-all"
            >
              <Printer className="w-4 h-4 text-[#7ECEB7]" /> Print Confirmation
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </header>

      {/* REGISTRATION CLOSED BANNER */}
      {!isRegistrationOpen && !isAlreadyRegistered && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-6 rounded-2xl flex items-center gap-4 animate-fade-in shadow-lg">
          <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-red-200">Course Registration is Currently Closed</h3>
            <p className="text-xs text-red-300/80 mt-0.5">
              The administrator has closed course registration. Course selection and submission are disabled until the administrator reopens registration.
            </p>
          </div>
        </div>
      )}

      {/* PERMANENTLY LOCKED NOTIFICATION BANNER IF REGISTERED */}
      {isAlreadyRegistered && (
        <div className="bg-[#7ECEB7]/10 border border-[#7ECEB7]/30 text-[#7ECEB7] p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#7ECEB7] flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-[#F5EBE0]">Course Registration Complete & Locked</h3>
              <p className="text-xs text-[#7ECEB7]">
                Your course choices have been saved permanently. Your registration is now locked and read-only.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/review")}
            className="btn-primary px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-[#F5EBE0] whitespace-nowrap shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Confirmation</span>
          </button>
        </div>
      )}

      {/* PROGRESS TRACKER */}
      <section className="glass-panel p-6 md:p-8 space-y-4 border border-[#7ECEB7]/20">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-[#D6C7A1] mb-2">Registration Progress</h2>
        
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#072C28] -translate-y-1/2 z-0"></div>

          {steps.map((step, idx) => {
            const isDone = step.status === "completed";
            const isActive = step.status === "active";

            return (
              <div key={idx} className="flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isDone
                      ? "bg-[#7ECEB7] text-[#041C19] shadow-lg shadow-[#7ECEB7]/30 border-2 border-[#7ECEB7]"
                      : isActive
                      ? "bg-[#037A74] text-[#F5EBE0] shadow-lg shadow-[#037A74]/40 ring-4 ring-[#037A74]/30 border-2 border-[#7ECEB7] scale-110"
                      : "bg-[#072C28] text-[#D6C7A1]/50 border border-[#7ECEB7]/20"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isDone
                      ? "text-[#7ECEB7] font-semibold"
                      : isActive
                      ? "text-[#D6C7A1] font-semibold"
                      : "text-[#D6C7A1]/50"
                  }`}
                >
                  {step.label} {isDone && "✓"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* SINGLE SESSION CARD: SESSION 2 */}
      <section className="max-w-2xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#7ECEB7]/25 bg-gradient-to-b from-[#072C28]/95 via-[#062421]/95 to-[#041C19]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 transition-all duration-300 hover:border-[#7ECEB7]/40 flex flex-col justify-between space-y-6">
          {/* Subtle ambient lighting effects */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7ECEB7]/40 to-transparent pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#037A74]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#7ECEB7]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Header: Badge & Status */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#037A74]/25 text-[#7ECEB7] border border-[#7ECEB7]/30 shadow-sm backdrop-blur-sm">
                <Calendar className="w-3.5 h-3.5 text-[#7ECEB7]" />
                Session 2 Registration
              </span>

              {isAlreadyRegistered ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ECEB7] bg-[#7ECEB7]/15 border border-[#7ECEB7]/30 px-3 py-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed
                </span>
              ) : isSession2Complete ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ECEB7] bg-[#7ECEB7]/15 border border-[#7ECEB7]/30 px-3 py-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Choices Saved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D6C7A1] bg-[#A07850]/15 border border-[#A07850]/30 px-3 py-1 rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#D6C7A1]" />
                  Ready for Selection
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EBE0]">
                Session 2 Courses
              </h3>
              <p className="text-sm text-[#D6C7A1]/85 leading-relaxed font-normal">
                Select 1 sports activity and 1 student life course for Session 2.
              </p>
            </div>

            {/* Selection Progress Indicator */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#D6C7A1]/70 font-medium">Requirements Met</span>
                <span className="text-[#F5EBE0] font-semibold">
                  {((s2Sports ? 1 : 0) + (s2Life ? 1 : 0))}/2 Selected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 h-1.5 w-full">
                <div className={`rounded-full transition-all duration-300 ${s2Sports ? "bg-[#7ECEB7] shadow-sm shadow-[#7ECEB7]/40" : "bg-white/10"}`} />
                <div className={`rounded-full transition-all duration-300 ${s2Life ? "bg-[#7ECEB7] shadow-sm shadow-[#7ECEB7]/40" : "bg-white/10"}`} />
              </div>
            </div>

            {/* Course Summary Preview Slots */}
            <div className="space-y-3 pt-1">
              {/* Sports Activity Slot */}
              <div className={`group p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                s2Sports
                  ? "bg-[#037A74]/15 border-[#7ECEB7]/35 shadow-sm shadow-[#037A74]/15"
                  : "bg-[#041C19]/60 hover:bg-[#072C28]/60 border-white/[0.08] hover:border-[#7ECEB7]/25"
              }`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    s2Sports
                      ? "bg-[#037A74]/40 text-[#7ECEB7] border border-[#7ECEB7]/30"
                      : "bg-[#072C28] text-[#7ECEB7]/70 border border-white/[0.08] group-hover:text-[#7ECEB7]"
                  }`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F5EBE0] tracking-tight">Sports Activity</p>
                    <p className="text-xs truncate mt-0.5">
                      {s2Sports ? (
                        <span className="text-[#7ECEB7] font-medium">{s2Sports}</span>
                      ) : (
                        <span className="text-[#D6C7A1]/60">1 Course Required</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {s2Sports ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ECEB7] bg-[#7ECEB7]/15 border border-[#7ECEB7]/30 px-3 py-1 rounded-full shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D6C7A1]/65 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" /> Not Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Student Life Slot */}
              <div className={`group p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                s2Life
                  ? "bg-[#A07850]/15 border-[#D6C7A1]/35 shadow-sm shadow-[#A07850]/15"
                  : "bg-[#041C19]/60 hover:bg-[#072C28]/60 border-white/[0.08] hover:border-[#7ECEB7]/25"
              }`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    s2Life
                      ? "bg-[#A07850]/30 text-[#D6C7A1] border border-[#A07850]/40"
                      : "bg-[#072C28] text-[#A07850]/70 border border-white/[0.08] group-hover:text-[#A07850]"
                  }`}>
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F5EBE0] tracking-tight">Student Life Course</p>
                    <p className="text-xs truncate mt-0.5">
                      {s2Life ? (
                        <span className="text-[#D6C7A1] font-medium">{s2Life}</span>
                      ) : (
                        <span className="text-[#D6C7A1]/60">1 Course Required</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {s2Life ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D6C7A1] bg-[#A07850]/20 border border-[#A07850]/40 px-3 py-1 rounded-full shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D6C7A1]/65 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" /> Not Selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            {!isAlreadyRegistered ? (
              <button
                onClick={() => { if (isRegistrationOpen) router.push("/session-2"); }}
                disabled={!isRegistrationOpen}
                className="group relative w-full mt-2 py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#037A74]/30 hover:shadow-[#037A74]/50 active:scale-[0.99] border border-[#7ECEB7]/35 hover:border-[#7ECEB7]/60 bg-gradient-to-r from-[#037A74] via-[#048C85] to-[#037A74] text-[#F5EBE0] hover:brightness-110"
              >
                {!isRegistrationOpen ? (
                  <>
                    <Lock className="w-4 h-4 text-red-400" />
                    <span>Registration Closed</span>
                  </>
                ) : (
                  <>
                    <span>{isSession2Complete ? "Edit Session 2 Choices" : "Select Session 2 Courses"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            ) : (
              <div className="mt-2 p-3.5 bg-[#072C28]/80 border border-[#7ECEB7]/20 rounded-xl flex items-center justify-center gap-2 text-[#D6C7A1] text-xs font-medium">
                <Lock className="w-3.5 h-3.5 text-[#A07850]" />
                <span>Selection Locked (Registration Confirmed)</span>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* PROCEED TO REVIEW BANNER WHEN SESSION 2 IS READY */}
      {isSession2Complete && !isAlreadyRegistered && (
        <div className="glass-panel p-6 border-2 border-[#7ECEB7] bg-[#037A74]/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7ECEB7] text-[#041C19] flex items-center justify-center font-bold shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F5EBE0]">Session 2 Courses Selected!</h3>
              <p className="text-xs text-[#D6C7A1]">
                Session 2 courses are selected. Click below to review and submit your final registration.
              </p>
            </div>
          </div>

          <button
            onClick={() => { if (isRegistrationOpen) router.push("/review"); }}
            disabled={!isRegistrationOpen}
            className="btn-primary px-8 py-3.5 flex items-center gap-2 text-base font-bold text-[#F5EBE0] shadow-lg shadow-[#037A74]/40"
          >
            <span>Proceed to Review & Register</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* AVAILABLE COURSES & FACULTY DIRECTORY */}
      <section className="glass-panel p-6 md:p-8 space-y-6 border border-[#7ECEB7]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#7ECEB7]/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#7ECEB7]">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#F5EBE0]">Course & Faculty Directory</h2>
            </div>
            <p className="text-xs text-[#D6C7A1] mt-1">
              Explore all offered Sports & Student Life subjects, assigned faculty, and syllabus documents.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCatalogFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                catalogFilter === "all"
                  ? "bg-[#037A74] text-[#F5EBE0] border border-[#7ECEB7]/40"
                  : "bg-[#072C28] text-[#D6C7A1] hover:text-[#F5EBE0]"
              }`}
            >
              All Subjects ({(coursesList.length > 0 ? coursesList : COURSES).length})
            </button>
            <button
              onClick={() => setCatalogFilter("Sports")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                catalogFilter === "Sports"
                  ? "bg-[#037A74] text-[#F5EBE0] border border-[#7ECEB7]/40"
                  : "bg-[#072C28] text-[#D6C7A1] hover:text-[#F5EBE0]"
              }`}
            >
              Sports ({(coursesList.length > 0 ? coursesList : COURSES).filter(c => c.category === "Sports").length})
            </button>
            <button
              onClick={() => setCatalogFilter("Student Life")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                catalogFilter === "Student Life"
                  ? "bg-[#A07850] text-[#F5EBE0] border border-[#A07850]/40"
                  : "bg-[#072C28] text-[#D6C7A1] hover:text-[#F5EBE0]"
              }`}
            >
              Student Life ({(coursesList.length > 0 ? coursesList : COURSES).filter(c => c.category === "Student Life").length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(catalogFilter === "all"
            ? (coursesList.length > 0 ? coursesList : COURSES)
            : (coursesList.length > 0 ? coursesList : COURSES).filter(c => c.category === catalogFilter)
          ).map((course) => (
            <div
              key={course.id}
              className="glass-card p-5 flex flex-col justify-between space-y-3 border-[#7ECEB7]/15 hover:border-[#7ECEB7]/40 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#D6C7A1]">{course.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      course.category === "Sports"
                        ? "bg-[#037A74]/20 text-[#7ECEB7] border-[#037A74]/40"
                        : "bg-[#A07850]/20 text-[#D6C7A1] border-[#A07850]/40"
                    }`}
                  >
                    {course.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#F5EBE0]">{course.name}</h3>

                <div className="flex items-center gap-1.5 text-xs text-[#D6C7A1] pt-1">
                  <span>Faculty: <strong className="text-[#F5EBE0] font-normal">{course.faculty || "<faculty name>"}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      if (course.docUrl) {
                        window.open(course.docUrl, "_blank", "noopener,noreferrer");
                      } else {
                        alert(`Syllabus/Docs for ${course.name} will be available soon.`);
                      }
                    }}
                    className="p-1 text-[#7ECEB7] hover:text-[#F5EBE0] hover:bg-[#7ECEB7]/20 rounded-full transition-colors inline-flex items-center justify-center"
                    title="View Course Google Doc"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                {course.schedule && (
                  <div className="pt-1.5 flex flex-wrap items-center gap-1">
                    {course.schedule.split(" | ").map((day, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#7ECEB7]/15 text-[#7ECEB7] border border-[#7ECEB7]/30"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#7ECEB7]/15 flex items-center justify-between text-xs font-mono text-[#D6C7A1]">
                <span>Capacity:</span>
                <span className="text-[#F5EBE0] font-medium">{course.maxSeats} Seats</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-backdrop-fade">
          <div className="glass-panel p-6 md:p-8 max-w-md w-full border border-[#7ECEB7]/30 shadow-2xl relative space-y-5 bg-[#041C19] animate-modal-pop">
            <div className="flex items-center justify-between border-b border-[#7ECEB7]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#037A74]/30 border border-[#7ECEB7]/40 flex items-center justify-center text-[#7ECEB7]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F5EBE0]">Change Password</h3>
                  <p className="text-xs text-[#D6C7A1]">Update your portal login password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-[#D6C7A1] hover:text-[#F5EBE0] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                  passwordMsgType === "success"
                    ? "bg-[#7ECEB7]/15 border-[#7ECEB7]/30 text-[#7ECEB7]"
                    : "bg-red-500/15 border-red-500/30 text-red-300"
                }`}
              >
                {passwordMsgType === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{passwordMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D6C7A1] mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-[#F5EBE0] placeholder-[#D6C7A1]/40 text-sm focus:outline-none focus:border-[#7ECEB7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7ECEB7]/70 hover:text-[#F5EBE0] p-1 transition-colors"
                    title={showCurrentPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D6C7A1] mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-[#F5EBE0] placeholder-[#D6C7A1]/40 text-sm focus:outline-none focus:border-[#7ECEB7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7ECEB7]/70 hover:text-[#F5EBE0] p-1 transition-colors"
                    title={showNewPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D6C7A1] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-[#F5EBE0] placeholder-[#D6C7A1]/40 text-sm focus:outline-none focus:border-[#7ECEB7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7ECEB7]/70 hover:text-[#F5EBE0] p-1 transition-colors"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#7ECEB7]/15">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#072C28] text-[#D6C7A1] hover:text-[#F5EBE0] text-xs font-semibold border border-[#7ECEB7]/15 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="btn-primary px-5 py-2.5 text-xs font-bold text-[#F5EBE0] flex items-center gap-2 disabled:opacity-50"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#F5EBE0]" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
