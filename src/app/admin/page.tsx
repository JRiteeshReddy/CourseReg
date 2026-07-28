"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, AlertTriangle, Users, BookOpen, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

type Student = {
  regNo: string;
  name: string;
  email: string;
  timestamp: string;
};

type AdminCourse = {
  id: string;
  name: string;
  category: string;
  maxCapacity: number;
  s1Taken: number;
  s2Taken: number;
  s1Remaining: number;
  s2Remaining: number;
  s1Students: Student[];
  s2Students: Student[];
};

export default function AdminDashboard() {
  const [data, setData] = useState<{ totalRegistrations: number; courses: AdminCourse[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401 || res.status === 403) {
        setError("You are not authorized to view this page.");
        setLoading(false);
        return;
      }
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load stats");
      
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (courseName: string, session: 1 | 2, students: Student[]) => {
    if (students.length === 0) {
      alert("No students registered for this session yet.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
      "Registration Number": s.regNo,
      "Student Name": s.name,
      "Email": s.email,
      "Registration Time": new Date(s.timestamp).toLocaleString()
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    
    const fileName = `${courseName.replace(/\s+/g, '_')}_Session${session}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleLogout = () => {
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

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={handleLogout} className="btn-primary w-full">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-400" /> Admin Portal
        </h1>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Registrations</p>
            <p className="text-3xl font-bold text-white">{data?.totalRegistrations}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-300 text-sm">
                <th className="p-4 border-b border-white/10">Course Name</th>
                <th className="p-4 border-b border-white/10">Category</th>
                <th className="p-4 border-b border-white/10">S1 Taken</th>
                <th className="p-4 border-b border-white/10">S2 Taken</th>
                <th className="p-4 border-b border-white/10 text-right">Actions (S1 / S2)</th>
              </tr>
            </thead>
            <tbody>
              {data?.courses.map((course, idx) => (
                <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{course.name}</td>
                  <td className="p-4 text-slate-400">
                    <span className={`px-2 py-1 rounded-full text-xs ${course.category === 'Sports' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                      {course.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${course.s1Remaining === 0 ? 'bg-red-500' : 'bg-blue-500'}`} 
                          style={{ width: `${(course.s1Taken / course.maxCapacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300">{course.s1Taken} / {course.maxCapacity}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${course.s2Remaining === 0 ? 'bg-red-500' : 'bg-purple-500'}`} 
                          style={{ width: `${(course.s2Taken / course.maxCapacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300">{course.s2Taken} / {course.maxCapacity}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleDownload(course.name, 1, course.s1Students)}
                        className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-slate-300 flex items-center gap-2 text-xs"
                        title="Download Session 1 Excel"
                      >
                        <Download className="w-4 h-4" /> S1
                      </button>
                      <button 
                        onClick={() => handleDownload(course.name, 2, course.s2Students)}
                        className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-slate-300 flex items-center gap-2 text-xs"
                        title="Download Session 2 Excel"
                      >
                        <Download className="w-4 h-4" /> S2
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
