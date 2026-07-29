"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalculatedCourse } from "@/lib/courses";
import { RegistrationRow } from "@/lib/courses";
import { ShieldCheck, Download, Users, BookOpen, AlertCircle, Loader2, LogOut } from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
  const [courses, setCourses] = useState<CalculatedCourse[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [totalMaster, setTotalMaster] = useState(0);
  const [totalReg, setTotalReg] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadAdminData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 403) {
        setError("Access Denied. Only authorized admins (jriteeshreddy@gmail.com) can access this page.");
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
    } catch (err) {
      setError("Failed to fetch admin dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const exportToExcel = () => {
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Course Registrations");
    XLSX.writeFile(workbook, `University_Course_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-red-400">Access Restricted</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <button onClick={() => router.push("/")} className="btn-primary w-full">
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Admin Header */}
      <header className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-sm text-slate-400">Live Course Registration Analytics & Reporting</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={exportToExcel}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          >
            <Download className="w-4 h-4" /> Export Excel (.xlsx)
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-lg glass-card hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Master Roster</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{totalMaster}</div>
          <p className="text-xs text-slate-500">Pre-approved students in Google Sheet</p>
        </div>

        <div className="glass-panel p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Registered Students</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold">{totalReg}</div>
          <p className="text-xs text-slate-500">Confirmed course selections</p>
        </div>

        <div className="glass-panel p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Total Courses</span>
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold">{courses.length}</div>
          <p className="text-xs text-slate-500">Sports & Student Life offerings</p>
        </div>
      </div>

      {/* Live Seat Occupancy Gauges */}
      <section className="glass-panel p-6 space-y-6">
        <h2 className="text-lg font-bold border-b border-slate-800 pb-3">Course Seat Capacity Monitor</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const s1Percentage = Math.round((course.s1SeatsOccupied / course.maxSeats) * 100);
            const s2Percentage = Math.round((course.s2SeatsOccupied / course.maxSeats) * 100);

            return (
              <div key={course.id} className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">{course.name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    {course.category} ({course.id})
                  </span>
                </div>

                {/* Session 1 Fill Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Session 1 Occupancy</span>
                    <span>{course.s1SeatsOccupied} / {course.maxSeats} seats</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${s1Percentage >= 100 ? "bg-red-500" : "bg-blue-500"}`}
                      style={{ width: `${s1Percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Session 2 Fill Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Session 2 Occupancy</span>
                    <span>{course.s2SeatsOccupied} / {course.maxSeats} seats</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${s2Percentage >= 100 ? "bg-red-500" : "bg-purple-500"}`}
                      style={{ width: `${s2Percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Student Registration Roster Table */}
      <section className="glass-panel p-6 space-y-4 overflow-hidden">
        <h2 className="text-lg font-bold border-b border-slate-800 pb-3">Registered Student Roster ({registrations.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Session 1 Sports</th>
                <th className="p-3">Session 1 Life</th>
                <th className="p-3">Session 2 Sports</th>
                <th className="p-3">Session 2 Life</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {registrations.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-medium text-white">{r.name}</td>
                  <td className="p-3 font-mono text-slate-400">{r.email}</td>
                  <td className="p-3">{r.s1Sports}</td>
                  <td className="p-3">{r.s1StudentLife}</td>
                  <td className="p-3">{r.s2Sports}</td>
                  <td className="p-3">{r.s2StudentLife}</td>
                  <td className="p-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-mono">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}

              {registrations.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
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
