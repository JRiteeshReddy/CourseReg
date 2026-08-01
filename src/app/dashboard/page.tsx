"use client";

import { useState, useEffect } from "react";
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
  BookOpen
} from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState<MasterStudent | null>(null);
  const [registration, setRegistration] = useState<RegistrationRow | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [coursesList, setCoursesList] = useState<CalculatedCourse[]>([]);
  const [catalogFilter, setCatalogFilter] = useState<"all" | "Sports" | "Student Life">("all");

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
        const isConfirmed =
          data.registration?.status?.toUpperCase() === "CONFIRMED" ||
          (userEmail && localStorage.getItem(`confirmed_registration_${userEmail}`) === "CONFIRMED");

        setIsAlreadyRegistered(Boolean(isConfirmed));

        // Read draft selections from localStorage (durable per user) or sessionStorage or confirmed registration
        const draftS1Sports = (userEmail && localStorage.getItem(`s1Sports_${userEmail}`)) || sessionStorage.getItem("s1Sports") || data.registration?.s1Sports || "";
        const draftS1Life = (userEmail && localStorage.getItem(`s1StudentLife_${userEmail}`)) || sessionStorage.getItem("s1StudentLife") || data.registration?.s1StudentLife || "";
        const draftS2Sports = (userEmail && localStorage.getItem(`s2Sports_${userEmail}`)) || sessionStorage.getItem("s2Sports") || data.registration?.s2Sports || "";
        const draftS2Life = (userEmail && localStorage.getItem(`s2StudentLife_${userEmail}`)) || sessionStorage.getItem("s2StudentLife") || data.registration?.s2StudentLife || "";

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#041C19]">
        <Loader2 className="w-8 h-8 text-[#7ECEB7] animate-spin" />
      </div>
    );
  }

  const steps = [
    { label: "Login", status: "completed" },
    { label: "Session 1", status: isSession1Complete || isAlreadyRegistered ? "completed" : "active" },
    { label: "Session 2", status: isSession2Complete || isAlreadyRegistered ? "completed" : isSession1Complete ? "active" : "locked" },
    { label: "Review", status: isAlreadyRegistered ? "completed" : isSession1Complete && isSession2Complete ? "active" : "upcoming" },
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

        <div className="flex items-center gap-3 z-10">
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

      {/* TWO CARDS: SESSION 1 & SESSION 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARD 1: SESSION 1 */}
        <div className="glass-panel p-8 space-y-6 relative overflow-hidden flex flex-col justify-between border-[#037A74]/40">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-[#037A74]/20 text-[#7ECEB7] border border-[#037A74]/40 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#7ECEB7]" /> Session 1 Selections
              </span>

              {isAlreadyRegistered ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#7ECEB7] bg-[#7ECEB7]/10 border border-[#7ECEB7]/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                </span>
              ) : isSession1Complete ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#7ECEB7] bg-[#7ECEB7]/10 border border-[#7ECEB7]/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved (Draft)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#D6C7A1]/70 bg-[#072C28] border border-[#7ECEB7]/15 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-[#A07850]" /> Pending Selection
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#F5EBE0] mb-2">Session 1 Courses</h3>
              <p className="text-[#D6C7A1] text-sm leading-relaxed">
                Registered sports activity and student life course for Session 1.
              </p>
            </div>

            {/* Course Summary Preview */}
            <div className="space-y-3 pt-2">
              <div className="glass-card p-4 flex items-center justify-between border-[#7ECEB7]/15">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-[#7ECEB7]" />
                  <span className="text-sm font-medium text-[#F5EBE0]">Sports Activity</span>
                </div>
                <span className="text-xs font-mono text-[#F5EBE0] font-bold bg-[#037A74]/30 text-[#7ECEB7] px-3 py-1 rounded-md border border-[#037A74]/50">
                  {s1Sports || "Not Selected"}
                </span>
              </div>

              <div className="glass-card p-4 flex items-center justify-between border-[#7ECEB7]/15">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-[#A07850]" />
                  <span className="text-sm font-medium text-[#F5EBE0]">Student Life Course</span>
                </div>
                <span className="text-xs font-mono text-[#F5EBE0] font-bold bg-[#A07850]/30 text-[#D6C7A1] px-3 py-1 rounded-md border border-[#A07850]/50">
                  {s1Life || "Not Selected"}
                </span>
              </div>
            </div>
          </div>

          {/* EDIT BUTTON HIDDEN IF ALREADY REGISTERED */}
          {!isAlreadyRegistered ? (
            <button
              onClick={() => { if (isRegistrationOpen) router.push("/session-1"); }}
              disabled={!isRegistrationOpen}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isRegistrationOpen ? (
                <>
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Registration Closed</span>
                </>
              ) : (
                <>
                  <span>{isSession1Complete ? "Edit Session 1 Choices" : "Select Session 1 Courses"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <div className="mt-4 p-3 bg-[#072C28]/80 border border-[#7ECEB7]/20 rounded-xl flex items-center justify-center gap-2 text-[#D6C7A1] text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-[#A07850]" />
              <span>Selection Locked (Read-Only)</span>
            </div>
          )}
        </div>

        {/* CARD 2: SESSION 2 */}
        <div className="glass-panel p-8 space-y-6 relative overflow-hidden flex flex-col justify-between border-[#A07850]/40">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-[#A07850]/20 text-[#D6C7A1] border border-[#A07850]/40 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#A07850]" /> Session 2 Selections
              </span>

              {isAlreadyRegistered ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#7ECEB7] bg-[#7ECEB7]/10 border border-[#7ECEB7]/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                </span>
              ) : isSession2Complete ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#7ECEB7] bg-[#7ECEB7]/10 border border-[#7ECEB7]/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved (Draft)
                </span>
              ) : isSession1Complete ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#A07850] bg-[#A07850]/15 border border-[#A07850]/30 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Ready for Selection
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#D6C7A1]/50 bg-[#072C28] border border-[#7ECEB7]/15 px-3 py-1 rounded-full">
                  <Lock className="w-3.5 h-3.5" /> Complete Session 1 First
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#F5EBE0] mb-2">Session 2 Courses</h3>
              <p className="text-[#D6C7A1] text-sm leading-relaxed">
                Registered sports activity and student life course for Session 2.
              </p>
            </div>

            {/* Course Summary Preview */}
            <div className="space-y-3 pt-2">
              <div className="glass-card p-4 flex items-center justify-between border-[#7ECEB7]/15">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-[#7ECEB7]" />
                  <span className="text-sm font-medium text-[#F5EBE0]">Sports Activity</span>
                </div>
                <span className="text-xs font-mono text-[#F5EBE0] font-bold bg-[#037A74]/30 text-[#7ECEB7] px-3 py-1 rounded-md border border-[#037A74]/50">
                  {s2Sports || "Not Selected"}
                </span>
              </div>

              <div className="glass-card p-4 flex items-center justify-between border-[#7ECEB7]/15">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-[#A07850]" />
                  <span className="text-sm font-medium text-[#F5EBE0]">Student Life Course</span>
                </div>
                <span className="text-xs font-mono text-[#F5EBE0] font-bold bg-[#A07850]/30 text-[#D6C7A1] px-3 py-1 rounded-md border border-[#A07850]/50">
                  {s2Life || "Not Selected"}
                </span>
              </div>
            </div>
          </div>

          {/* EDIT BUTTON HIDDEN IF ALREADY REGISTERED */}
          {!isAlreadyRegistered ? (
            <button
              onClick={() => { if (isRegistrationOpen && isSession1Complete) router.push("/session-2"); }}
              disabled={!isRegistrationOpen || !isSession1Complete}
              className={`w-full mt-4 flex items-center justify-center gap-2 transition-all ${
                !isSession1Complete
                  ? "py-3 rounded-xl bg-[#072C28] text-[#D6C7A1]/50 border border-[#7ECEB7]/15 text-sm font-semibold opacity-60 cursor-not-allowed"
                  : "btn-bronze text-sm font-bold"
              }`}
            >
              {!isRegistrationOpen ? (
                <>
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Registration Closed</span>
                </>
              ) : !isSession1Complete ? (
                <>
                  <Lock className="w-4 h-4 text-[#A07850]" />
                  <span>Complete Session 1 First</span>
                </>
              ) : (
                <>
                  <span>{isSession2Complete ? "Edit Session 2 Choices" : "Select Session 2 Courses"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <div className="mt-4 p-3 bg-[#072C28]/80 border border-[#7ECEB7]/20 rounded-xl flex items-center justify-center gap-2 text-[#D6C7A1] text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-[#A07850]" />
              <span>Selection Locked (Read-Only)</span>
            </div>
          )}
        </div>

      </section>

      {/* PROCEED TO REVIEW BANNER WHEN BOTH SESSIONS ARE READY */}
      {isSession1Complete && isSession2Complete && !isAlreadyRegistered && (
        <div className="glass-panel p-6 border-2 border-[#7ECEB7] bg-[#037A74]/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7ECEB7] text-[#041C19] flex items-center justify-center font-bold shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F5EBE0]">All 4 Courses Selected!</h3>
              <p className="text-xs text-[#D6C7A1]">
                Session 1 & Session 2 courses are selected. Click below to review and submit your final registration.
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
    </div>
  );
}
