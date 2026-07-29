"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalculatedCourse } from "@/lib/courses";
import { RegistrationRow } from "@/lib/courses";
import { ShieldCheck, Download, Users, BookOpen, AlertCircle, Loader2, LogOut, FileSpreadsheet, Trash2, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
  const [courses, setCourses] = useState<CalculatedCourse[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [totalMaster, setTotalMaster] = useState(0);
  const [totalReg, setTotalReg] = useState(0);
  const [adminEmail, setAdminEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadAdminData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 403) {
        setError("Access Denied. You are not authorized to view the admin dashboard.");
        setLoading(false);
        return;
      }
      if (res.status === 401) {
        router.push("/");
        return;
      }

      const data = await res.json();
      setCourses(data.courses || []);
      setRegistrations(data.registrations || []);
      setTotalMaster(data.totalMasterStudents || 0);
      setTotalReg(data.totalRegisteredStudents || 0);
      setAdminEmail(data.adminEmail || "");
    } catch (err) {
      setError("Failed to fetch admin dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleClearAllRegistrations = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      if (!res.ok) {
        alert("Failed to reset registrations.");
      } else {
        await loadAdminData();
        setShowResetModal(false);
      }
    } catch (err) {
      alert("Error resetting registrations.");
    } finally {
      setResetting(false);
    }
  };

  // Full Master Export
  const exportAllToExcel = () => {
    if (registrations.length === 0) {
      alert("No registration data available to export.");
      return;
    }

    const exportRows = registrations.map((r) => ({
      "Registration Number": r.regNo,
      "Student Name": r.name,
      "Student Email": r.email,
      "Session 1 Sports": r.s1Sports,
      "Session 1 Student Life": r.s1StudentLife,
      "Session 2 Sports": r.s2Sports,
      "Session 2 Student Life": r.s2StudentLife,
      "Registration Timestamp": r.timestamp,
      "Status": r.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Registrations");
    XLSX.writeFile(workbook, `Master_University_Course_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Course-Specific Dynamic Export for Session 1 or Session 2
  const exportCourseExcel = (courseId: string, courseName: string, sessionNum: 1 | 2) => {
    const filteredStudents = registrations.filter((r) => {
      if (r.status?.toUpperCase() !== "CONFIRMED") return false;
      if (sessionNum === 1) {
        return r.s1Sports === courseId || r.s1Sports === courseName || r.s1StudentLife === courseId || r.s1StudentLife === courseName;
      } else {
        return r.s2Sports === courseId || r.s2Sports === courseName || r.s2StudentLife === courseId || r.s2StudentLife === courseName;
      }
    });

    if (filteredStudents.length === 0) {
      alert(`No students are currently registered for ${courseName} in Session ${sessionNum}.`);
      return;
    }

    const exportData = filteredStudents.map((r) => ({
      "Registration Number": r.regNo,
      "Student Name": r.name,
      "Email": r.email,
      "Timestamp": r.timestamp,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${courseName} S${sessionNum}`);
    
    const safeFileName = courseName.replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(workbook, `${safeFileName}_Session_${sessionNum}_Students.xlsx`);
  };

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

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-[#041C19]">
        <div className="glass-panel max-w-md w-full p-8 text-center space-y-4 border border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-red-400">Access Restricted</h2>
          <p className="text-sm text-[#D6C7A1]">{error}</p>
          <button onClick={() => router.push("/")} className="btn-primary w-full text-[#F5EBE0]">
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in bg-[#041C19] text-[#F5EBE0]">
      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 space-y-5 border border-red-500/30">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-[#F5EBE0]">Clear All Test Registrations?</h3>
              <p className="text-xs text-[#D6C7A1] leading-relaxed">
                This will permanently delete all student course registrations from the database and reset seat occupancies back to zero. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-[#072C28] hover:bg-[#037A74]/30 text-[#D6C7A1] text-xs font-semibold border border-[#7ECEB7]/20 transition-all"
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllRegistrations}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30"
              >
                {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Wipe All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#7ECEB7]/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#037A74]/20 rounded-full flex items-center justify-center border border-[#7ECEB7]/30">
            <ShieldCheck className="w-6 h-6 text-[#7ECEB7]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5EBE0]">Admin Portal</h1>
            <p className="text-sm text-[#D6C7A1]">
              Authenticated Admin: <span className="text-[#7ECEB7] font-mono font-medium">{adminEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowResetModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            title="Clear all test registrations"
          >
            <Trash2 className="w-4 h-4 text-red-400" /> Clear Test Data
          </button>

          <button
            onClick={exportAllToExcel}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm text-[#F5EBE0]"
          >
            <Download className="w-4 h-4 text-[#F5EBE0]" /> Export All (.xlsx)
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-lg glass-card hover:bg-red-500/10 text-[#D6C7A1] hover:text-red-400 border border-[#7ECEB7]/15 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 space-y-2 border border-[#7ECEB7]/20">
          <div className="flex items-center justify-between text-[#D6C7A1]">
            <span className="text-sm font-medium">Master Roster</span>
            <Users className="w-5 h-5 text-[#7ECEB7]" />
          </div>
          <div className="text-3xl font-bold text-[#F5EBE0]">{totalMaster}</div>
          <p className="text-xs text-[#D6C7A1]/70">Pre-approved students in Google Sheet</p>
        </div>

        <div className="glass-panel p-6 space-y-2 border border-[#7ECEB7]/20">
          <div className="flex items-center justify-between text-[#D6C7A1]">
            <span className="text-sm font-medium">Registered Students</span>
            <ShieldCheck className="w-5 h-5 text-[#7ECEB7]" />
          </div>
          <div className="text-3xl font-bold text-[#F5EBE0]">{totalReg}</div>
          <p className="text-xs text-[#D6C7A1]/70">Confirmed course selections</p>
        </div>

        <div className="glass-panel p-6 space-y-2 border border-[#7ECEB7]/20">
          <div className="flex items-center justify-between text-[#D6C7A1]">
            <span className="text-sm font-medium">Total Offerings</span>
            <BookOpen className="w-5 h-5 text-[#A07850]" />
          </div>
          <div className="text-3xl font-bold text-[#F5EBE0]">{courses.length}</div>
          <p className="text-xs text-[#D6C7A1]/70">8 Sports + 11 Student Life courses</p>
        </div>
      </div>

      {/* Course-Specific Dynamic Export Cards */}
      <section className="glass-panel p-6 space-y-6 border border-[#7ECEB7]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#7ECEB7]/15 pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#F5EBE0]">Course-Specific Excel Export & Occupancy</h2>
            <p className="text-xs text-[#D6C7A1]">Download registration roster for individual courses by session.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const s1Percentage = Math.round((course.s1SeatsOccupied / course.maxSeats) * 100);
            const s2Percentage = Math.round((course.s2SeatsOccupied / course.maxSeats) * 100);

            return (
              <div key={course.id} className="glass-card p-5 space-y-4 flex flex-col justify-between border-[#7ECEB7]/15">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base text-[#F5EBE0]">{course.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#072C28] border border-[#7ECEB7]/20 text-[#D6C7A1] font-mono">
                      {course.category} ({course.id})
                    </span>
                  </div>

                  {/* Session 1 Fill Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-[#D6C7A1]">
                      <span>Session 1 Occupancy</span>
                      <span>{course.s1SeatsOccupied} / {course.maxSeats} seats</span>
                    </div>
                    <div className="w-full h-2 bg-[#072C28] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${s1Percentage >= 100 ? "bg-red-500" : "bg-[#037A74]"}`}
                        style={{ width: `${s1Percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Session 2 Fill Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-[#D6C7A1]">
                      <span>Session 2 Occupancy</span>
                      <span>{course.s2SeatsOccupied} / {course.maxSeats} seats</span>
                    </div>
                    <div className="w-full h-2 bg-[#072C28] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${s2Percentage >= 100 ? "bg-red-500" : "bg-[#A07850]"}`}
                        style={{ width: `${s2Percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* COURSE SPECIFIC EXPORT BUTTONS */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#7ECEB7]/15">
                  <button
                    onClick={() => exportCourseExcel(course.id, course.name, 1)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#037A74]/20 hover:bg-[#037A74]/30 text-[#7ECEB7] border border-[#037A74]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export Session 1 Excel
                  </button>

                  <button
                    onClick={() => exportCourseExcel(course.id, course.name, 2)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#A07850]/20 hover:bg-[#A07850]/30 text-[#D6C7A1] border border-[#A07850]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export Session 2 Excel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Student Registration Roster Table */}
      <section className="glass-panel p-6 space-y-4 overflow-hidden border border-[#7ECEB7]/20">
        <h2 className="text-lg font-bold border-b border-[#7ECEB7]/15 pb-3 text-[#F5EBE0]">Registered Student Roster ({registrations.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#F5EBE0]">
            <thead className="bg-[#072C28] text-[#D6C7A1] uppercase text-xs">
              <tr>
                <th className="p-3">Registration No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Session 1 Sports</th>
                <th className="p-3">Session 1 Life</th>
                <th className="p-3">Session 2 Sports</th>
                <th className="p-3">Session 2 Life</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7ECEB7]/15">
              {registrations.map((r, i) => (
                <tr key={i} className="hover:bg-[#037A74]/15 transition-colors">
                  <td className="p-3 font-mono text-[#D6C7A1]">{r.regNo}</td>
                  <td className="p-3 font-medium text-[#F5EBE0]">{r.name}</td>
                  <td className="p-3 font-mono text-[#D6C7A1]">{r.email}</td>
                  <td className="p-3">{r.s1Sports}</td>
                  <td className="p-3">{r.s1StudentLife}</td>
                  <td className="p-3">{r.s2Sports}</td>
                  <td className="p-3">{r.s2StudentLife}</td>
                  <td className="p-3">
                    <span className="bg-[#7ECEB7]/20 text-[#7ECEB7] border border-[#7ECEB7]/30 px-2.5 py-0.5 rounded-full text-xs font-mono">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}

              {registrations.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#D6C7A1]/50">
                    No registered students found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
