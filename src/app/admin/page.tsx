"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CalculatedCourse, RegistrationRow, MasterStudent } from "@/lib/courses";
import {
  ShieldCheck,
  Download,
  Users,
  BookOpen,
  AlertCircle,
  Loader2,
  LogOut,
  FileSpreadsheet,
  Trash2,
  KeyRound,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Dumbbell,
  GraduationCap,
  Layers,
  RefreshCw,
  UserCheck,
  User,
  ClipboardList,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<CalculatedCourse[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [masterStudents, setMasterStudents] = useState<MasterStudent[]>([]);
  const [totalMaster, setTotalMaster] = useState(0);
  const [totalReg, setTotalReg] = useState(0);
  const [adminEmail, setAdminEmail] = useState("");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Filtering States for Faculty Attendance Section
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [facultySearchQuery, setFacultySearchQuery] = useState("");
  const [facultyStudentSearchQuery, setFacultyStudentSearchQuery] = useState("");

  // Filtering States for Course Cards Section
  const [courseCategoryTab, setCourseCategoryTab] = useState<"ALL" | "Sports" | "Student Life">("ALL");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [inCardSearchQuery, setInCardSearchQuery] = useState<Record<string, string>>({});

  // Filtering States for Student Roster Table Section
  const [rosterSearchQuery, setRosterSearchQuery] = useState("");
  const [rosterCategoryFilter, setRosterCategoryFilter] = useState<"ALL" | "Sports" | "Student Life">("ALL");
  const [rosterCourseFilter, setRosterCourseFilter] = useState("ALL");
  const [rosterSessionFilter, setRosterSessionFilter] = useState<"ALL" | "S1" | "S2">("ALL");

  const [loading, setLoading] = useState(true);
  const [togglingReg, setTogglingReg] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAdminResetPassword, setShowAdminResetPassword] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [resetError, setResetError] = useState("");
  const [error, setError] = useState("");

  // Student Password Reset State
  const [targetStudentEmail, setTargetStudentEmail] = useState("");
  const [resetStudentMsg, setResetStudentMsg] = useState("");
  const [resetStudentMsgType, setResetStudentMsgType] = useState<"success" | "error" | "">("");
  const [resettingStudentPassword, setResettingStudentPassword] = useState(false);

  // Admin Own Password Change State
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminPasswordMsg, setAdminPasswordMsg] = useState("");
  const [adminPasswordMsgType, setAdminPasswordMsgType] = useState<"success" | "error" | "">("");
  const [adminChangingPassword, setAdminChangingPassword] = useState(false);
  const [showAdminCurrentPw, setShowAdminCurrentPw] = useState(false);
  const [showAdminNewPw, setShowAdminNewPw] = useState(false);
  const [showAdminConfirmPw, setShowAdminConfirmPw] = useState(false);
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
      setMasterStudents(data.masterStudents || []);
      setTotalMaster(data.totalMasterStudents || 0);
      setTotalReg(data.totalRegisteredStudents || 0);
      setAdminEmail(data.adminEmail || "");
      if (typeof data.isRegistrationOpen === "boolean") {
        setIsRegistrationOpen(data.isRegistrationOpen);
      }
    } catch (err) {
      setError("Failed to fetch admin dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadAdminData();
  }, []);

  const handleToggleRegistration = async (newStatus: boolean) => {
    setTogglingReg(true);
    try {
      const res = await fetch("/api/admin/toggle-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsRegistrationOpen(data.isRegistrationOpen);
      } else {
        alert(data.error || "Failed to update registration status");
      }
    } catch (err) {
      alert("Error toggling registration status");
    } finally {
      setTogglingReg(false);
    }
  };

  const handleClearAllRegistrations = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    setResetError("");

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmPassword: resetPasswordInput }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Incorrect security password.");
      } else {
        await loadAdminData();
        setShowResetModal(false);
        setResetPasswordInput("");
      }
    } catch (err) {
      setResetError("Error resetting registrations.");
    } finally {
      setResetting(false);
    }
  };

  const handleResetStudentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStudentMsg("");
    setResetStudentMsgType("");

    if (!targetStudentEmail.trim()) {
      setResetStudentMsg("Please enter a valid student email address.");
      setResetStudentMsgType("error");
      return;
    }

    setResettingStudentPassword(true);
    try {
      const res = await fetch("/api/admin/reset-student-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail: targetStudentEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResetStudentMsg(data.error || "Failed to reset student password.");
        setResetStudentMsgType("error");
      } else {
        setResetStudentMsg(data.message || "Student password reset to default successfully!");
        setResetStudentMsgType("success");
        setTargetStudentEmail("");
      }
    } catch (err) {
      console.error(err);
      setResetStudentMsg("An error occurred while resetting student password.");
      setResetStudentMsgType("error");
    } finally {
      setResettingStudentPassword(false);
    }
  };

  const handleAdminChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordMsg("");
    setAdminPasswordMsgType("");

    if (adminNewPassword !== adminConfirmPassword) {
      setAdminPasswordMsg("New password and confirm password do not match.");
      setAdminPasswordMsgType("error");
      return;
    }

    if (adminNewPassword.length < 6) {
      setAdminPasswordMsg("New password must be at least 6 characters.");
      setAdminPasswordMsgType("error");
      return;
    }

    setAdminChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: adminCurrentPassword,
          newPassword: adminNewPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAdminPasswordMsg(data.error || "Failed to update admin password.");
        setAdminPasswordMsgType("error");
      } else {
        setAdminPasswordMsg("Admin password updated successfully!");
        setAdminPasswordMsgType("success");
        setAdminCurrentPassword("");
        setAdminNewPassword("");
        setAdminConfirmPassword("");
        setTimeout(() => {
          setShowAdminPasswordModal(false);
          setAdminPasswordMsg("");
          setAdminPasswordMsgType("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setAdminPasswordMsg("An error occurred while changing admin password.");
      setAdminPasswordMsgType("error");
    } finally {
      setAdminChangingPassword(false);
    }
  };

  // Matching helper function for legacy strings & aliases
  const matchCourse = (val: string, id: string, name: string) => {
    if (!val) return false;
    if (val === id || val === name) return true;
    if (id === "SL04" && (val === "Folk Dance" || val === "Folk Dance - FIPA")) return true;
    if (
      id === "SL05" &&
      (val === "Yoga Therapy & Wellness Consultant" ||
        val.includes("Mental Wellbeing") ||
        val.includes("Mental Well-being"))
    )
      return true;
    if (
      id === "SL06" &&
      (val === "Traditional Music - Invocatory Song" || val === "Introduction to Traditional Music")
    )
      return true;
    if (
      id === "SL07" &&
      (val === "Introduction to Folk and Light Music" || val.includes("Music Band"))
    )
      return true;
    if (
      id === "SL11" &&
      (val === "Traditional Dance" || val === "Invocatory_Dances" || val === "Invocatory Dances")
    )
      return true;
    return false;
  };

  // Master Export
  const isFridayOnlyS1Choice = (choice: string | undefined | null) => {
    if (!choice) return false;
    const c = choice.trim().toLowerCase();
    const specialIds = ["sl01", "sl05", "sl09", "sl10"];
    const specialNames = [
      "basics of theatre acting",
      "mental wellbeing and peer support",
      "creative design, innovation and sustainability",
      "social media and digital content creation"
    ];
    return specialIds.includes(c) || specialNames.some((n) => c.includes(n));
  };

  const exportAllToExcel = () => {
    if (registrations.length === 0) {
      alert("No registration data available to export.");
      return;
    }

    const allExportRows = registrations.map((r) => ({
      "Registration Number": r.regNo,
      "Student Name": r.name,
      "Student Email": r.email,
      "Session 1 Sports": r.s1Sports,
      "Session 1 Student Life": r.s1StudentLife,
      "Session 2 Sports": r.s2Sports,
      "Session 2 Student Life": r.s2StudentLife,
      "Friday-Only S1 Course": isFridayOnlyS1Choice(r.s1StudentLife) ? "YES" : "NO",
      "Registration Timestamp": r.timestamp,
      Status: r.status,
    }));

    const fridayOnlyS1Rows = registrations
      .filter((r) => isFridayOnlyS1Choice(r.s1StudentLife))
      .map((r) => ({
        "Registration Number": r.regNo,
        "Student Name": r.name,
        "Student Email": r.email,
        "Session 1 Sports": r.s1Sports,
        "Session 1 Student Life (Friday-Only Course)": r.s1StudentLife,
        "Session 2 Sports": r.s2Sports,
        "Session 2 Student Life": r.s2StudentLife,
        "Registration Timestamp": r.timestamp,
        Status: r.status,
      }));

    const workbook = XLSX.utils.book_new();

    const mainWorksheet = XLSX.utils.json_to_sheet(allExportRows);
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "All Registrations");

    if (fridayOnlyS1Rows.length > 0) {
      const specialWorksheet = XLSX.utils.json_to_sheet(fridayOnlyS1Rows);
      XLSX.utils.book_append_sheet(workbook, specialWorksheet, "Friday-Only S1 Registrations");
    }

    XLSX.writeFile(
      workbook,
      `Master_University_Course_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const exportFridayOnlyS1ToExcel = () => {
    const fridayOnlyS1Students = registrations.filter((r) => isFridayOnlyS1Choice(r.s1StudentLife));

    if (fridayOnlyS1Students.length === 0) {
      alert("No students have registered for Friday-Only Session 1 courses yet.");
      return;
    }

    const exportRows = fridayOnlyS1Students.map((r) => ({
      "Registration Number": r.regNo,
      "Student Name": r.name,
      "Student Email": r.email,
      "Faculty Mentor": r.facultyName || "Unassigned",
      "Session 1 Sports": r.s1Sports,
      "Session 1 Friday-Only Student Life Course": r.s1StudentLife,
      "Session 2 Sports": r.s2Sports,
      "Session 2 Student Life": r.s2StudentLife,
      "Registration Timestamp": r.timestamp,
      Status: r.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Friday-Only S1 Students");
    XLSX.writeFile(
      workbook,
      `Friday_Only_Session1_Special_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Category specific export
  const exportCategoryToExcel = (category: "Sports" | "Student Life") => {
    const categoryCourses = courses.filter((c) => c.category === category);
    const categoryCourseIds = new Set(categoryCourses.map((c) => c.id));

    const exportRows = registrations
      .filter((r) => {
        if (category === "Sports") return Boolean(r.s1Sports || r.s2Sports);
        return Boolean(r.s1StudentLife || r.s2StudentLife);
      })
      .map((r) => ({
        "Registration Number": r.regNo,
        "Student Name": r.name,
        "Student Email": r.email,
        "Session 1 Sports": r.s1Sports,
        "Session 1 Student Life": r.s1StudentLife,
        "Session 2 Sports": r.s2Sports,
        "Session 2 Student Life": r.s2StudentLife,
        "Registration Timestamp": r.timestamp,
        Status: r.status,
      }));

    if (exportRows.length === 0) {
      alert(`No registrations found for category: ${category}`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${category} Registrations`);
    XLSX.writeFile(
      workbook,
      `${category}_Course_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Course-Specific Dynamic Combined Excel Export (Session 1 + Session 2 in 1 File)
  const exportCourseExcel = (courseId: string, courseName: string, category: string) => {
    const s1Students = registrations.filter((r) => {
      if (r.status?.toUpperCase() !== "CONFIRMED" && r.status?.toUpperCase() !== "SUBMITTED") return false;
      return matchCourse(r.s1Sports, courseId, courseName) || matchCourse(r.s1StudentLife, courseId, courseName);
    });

    const s2Students = registrations.filter((r) => {
      if (r.status?.toUpperCase() !== "CONFIRMED" && r.status?.toUpperCase() !== "SUBMITTED") return false;
      return matchCourse(r.s2Sports, courseId, courseName) || matchCourse(r.s2StudentLife, courseId, courseName);
    });

    if (s1Students.length === 0 && s2Students.length === 0) {
      alert(`No students are currently registered for ${courseName} in either session.`);
      return;
    }

    const aoaData: any[][] = [];

    // Course Title & Metadata Header
    aoaData.push(["COURSE NAME:", courseName]);
    aoaData.push(["COURSE CODE:", courseId]);
    aoaData.push(["CATEGORY:", category]);
    aoaData.push([]); // blank spacing row

    // Session 1 Section
    aoaData.push([`--- SESSION 1 REGISTERED STUDENTS (${s1Students.length}) ---`]);
    aoaData.push(["S.No", "Registration Number", "Student Name", "Email Address", "Faculty Attendance"]);

    if (s1Students.length > 0) {
      s1Students.forEach((r, idx) => {
        const facultyVal = r.facultyName && r.facultyName.trim() ? r.facultyName.trim() : " ";
        aoaData.push([
          idx + 1,
          r.regNo,
          r.name,
          r.email,
          facultyVal,
        ]);
      });
    } else {
      aoaData.push(["-", "No students registered for Session 1", "-", "-", "-"]);
    }

    aoaData.push([]); // blank spacing row
    aoaData.push([]); // blank spacing row

    // Session 2 Section
    aoaData.push([`--- SESSION 2 REGISTERED STUDENTS (${s2Students.length}) ---`]);
    aoaData.push(["S.No", "Registration Number", "Student Name", "Email Address", "Faculty Attendance"]);

    if (s2Students.length > 0) {
      s2Students.forEach((r, idx) => {
        const facultyVal = r.facultyName && r.facultyName.trim() ? r.facultyName.trim() : " ";
        aoaData.push([
          idx + 1,
          r.regNo,
          r.name,
          r.email,
          facultyVal,
        ]);
      });
    } else {
      aoaData.push(["-", "No students registered for Session 2", "-", "-", "-"]);
    }

    const workbook = XLSX.utils.book_new();
    const mainWorksheet = XLSX.utils.aoa_to_sheet(aoaData);
    mainWorksheet["!cols"] = [
      { wch: 8 }, // S.No
      { wch: 22 }, // Reg No
      { wch: 28 }, // Name
      { wch: 35 }, // Email
      { wch: 25 }, // Faculty Attendance
    ];
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Course Roster");

    const safeFileName = courseName.replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(workbook, `${safeFileName}_Combined_Course_Roster.xlsx`);
  };

  // Faculty-Specific Attendance Excel Export (based on Master Student Data & Registrations)
  const exportFacultyExcel = (targetFaculty: string) => {
    const facMaster = masterStudents.filter(
      (m) => (m.facultyName || "").trim().toLowerCase() === targetFaculty.trim().toLowerCase()
    );

    const targetRegistered = registrations.filter((r) => {
      if (r.status?.toUpperCase() !== "CONFIRMED" && r.status?.toUpperCase() !== "SUBMITTED") return false;
      const facName = (r.facultyName || "").trim();
      if (!facName) return targetFaculty === "Unassigned Faculty";
      return facName.toLowerCase() === targetFaculty.trim().toLowerCase();
    });

    const regEmails = new Set(targetRegistered.map((r) => (r.email || "").toLowerCase()));
    const regNos = new Set(targetRegistered.map((r) => (r.regNo || "").toLowerCase()));
    const pendingStudents = facMaster.filter(
      (m) => !regEmails.has((m.email || "").toLowerCase()) && !regNos.has((m.regNo || "").toLowerCase())
    );

    const totalStudentsCount = Math.max(facMaster.length, targetRegistered.length);

    if (totalStudentsCount === 0) {
      alert(`No master or registered students found assigned to faculty: ${targetFaculty}`);
      return;
    }

    const targetCourses = courses.filter((c) => {
      return targetRegistered.some((r) =>
        matchCourse(r.s1Sports, c.id, c.name) ||
        matchCourse(r.s1StudentLife, c.id, c.name) ||
        matchCourse(r.s2Sports, c.id, c.name) ||
        matchCourse(r.s2StudentLife, c.id, c.name)
      );
    });

    const aoaData: any[][] = [];
    aoaData.push(["FACULTY MENTOR / NAME:", targetFaculty]);
    aoaData.push(["TOTAL MASTER ASSIGNED STUDENTS:", facMaster.length || totalStudentsCount]);
    aoaData.push(["COMPLETED REGISTRATIONS:", targetRegistered.length]);
    aoaData.push(["PENDING REGISTRATIONS:", pendingStudents.length]);
    aoaData.push(["REPORT GENERATION DATE:", new Date().toLocaleDateString()]);
    aoaData.push([]); // blank row

    // Group registered students by chosen subjects
    targetCourses.forEach((c) => {
      const s1Students = targetRegistered.filter(
        (r) => matchCourse(r.s1Sports, c.id, c.name) || matchCourse(r.s1StudentLife, c.id, c.name)
      );

      const s2Students = targetRegistered.filter(
        (r) => matchCourse(r.s2Sports, c.id, c.name) || matchCourse(r.s2StudentLife, c.id, c.name)
      );

      if (s1Students.length === 0 && s2Students.length === 0) return;

      aoaData.push([`=== CHOSEN SUBJECT: ${c.name} (${c.id}) | Category: ${c.category} ===`]);
      aoaData.push([]);

      // Session 1 Table
      aoaData.push([`--- SESSION 1 REGISTERED STUDENTS (${s1Students.length}) ---`]);
      aoaData.push(["S.No", "Registration Number", "Student Name", "Email Address", "Attendance Verification"]);

      if (s1Students.length > 0) {
        s1Students.forEach((r, idx) => {
          aoaData.push([idx + 1, r.regNo, r.name, r.email, "[   ] Present"]);
        });
      } else {
        aoaData.push(["-", "No students registered for Session 1", "-", "-", "-"]);
      }

      aoaData.push([]);

      // Session 2 Table
      aoaData.push([`--- SESSION 2 REGISTERED STUDENTS (${s2Students.length}) ---`]);
      aoaData.push(["S.No", "Registration Number", "Student Name", "Email Address", "Attendance Verification"]);

      if (s2Students.length > 0) {
        s2Students.forEach((r, idx) => {
          aoaData.push([idx + 1, r.regNo, r.name, r.email, "[   ] Present"]);
        });
      } else {
        aoaData.push(["-", "No students registered for Session 2", "-", "-", "-"]);
      }

      aoaData.push([]);
      aoaData.push([]);
    });

    // Section for Pending / Unregistered Students assigned to this faculty
    if (pendingStudents.length > 0) {
      aoaData.push([`=== PENDING REGISTRATIONS (${pendingStudents.length} Students Not Yet Registered) ===`]);
      aoaData.push(["S.No", "Registration Number", "Student Name", "Email Address", "Registration Status"]);
      pendingStudents.forEach((m, idx) => {
        aoaData.push([idx + 1, m.regNo, m.name, m.email, "Pending Registration"]);
      });
      aoaData.push([]);
    }

    const workbook = XLSX.utils.book_new();
    const mainWorksheet = XLSX.utils.aoa_to_sheet(aoaData);
    mainWorksheet["!cols"] = [
      { wch: 8 },  // S.No
      { wch: 22 }, // Reg No
      { wch: 28 }, // Name
      { wch: 35 }, // Email
      { wch: 28 }, // Attendance
    ];
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Faculty Attendance Roster");

    const safeFileName = targetFaculty.replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(workbook, `Faculty_Attendance_${safeFileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Master Export for ALL Faculties into One Workbook
  const exportAllFacultiesExcel = () => {
    const allFacultyNames = (Array.from(
      new Set([
        ...masterStudents.map((m) => m.facultyName?.trim()).filter(Boolean),
        ...registrations.map((r) => r.facultyName?.trim()).filter(Boolean),
      ])
    ) as string[])
      .filter((fac) => {
        const hasMaster = masterStudents.some(
          (m) => (m.facultyName || "").trim().toLowerCase() === fac.trim().toLowerCase()
        );
        const hasReg = registrations.some(
          (r) =>
            (r.status?.toUpperCase() === "CONFIRMED" || r.status?.toUpperCase() === "SUBMITTED") &&
            (r.facultyName || "").trim().toLowerCase() === fac.trim().toLowerCase()
        );
        return hasMaster || hasReg;
      })
      .sort();

    if (allFacultyNames.length === 0) {
      alert("No faculty data available to export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    allFacultyNames.forEach((fac) => {
      const facMaster = masterStudents.filter(
        (m) => (m.facultyName || "").trim().toLowerCase() === fac.trim().toLowerCase()
      );
      const targetRegistered = registrations.filter((r) => {
        if (r.status?.toUpperCase() !== "CONFIRMED" && r.status?.toUpperCase() !== "SUBMITTED") return false;
        return (r.facultyName || "").trim().toLowerCase() === fac.trim().toLowerCase();
      });

      if (facMaster.length === 0 && targetRegistered.length === 0) return;

      const regEmails = new Set(targetRegistered.map((r) => (r.email || "").toLowerCase()));
      const regNos = new Set(targetRegistered.map((r) => (r.regNo || "").toLowerCase()));
      const pendingStudents = facMaster.filter(
        (m) => !regEmails.has((m.email || "").toLowerCase()) && !regNos.has((m.regNo || "").toLowerCase())
      );

      const targetCourses = courses.filter((c) => {
        return targetRegistered.some((r) =>
          matchCourse(r.s1Sports, c.id, c.name) ||
          matchCourse(r.s1StudentLife, c.id, c.name) ||
          matchCourse(r.s2Sports, c.id, c.name) ||
          matchCourse(r.s2StudentLife, c.id, c.name)
        );
      });

      const aoaData: any[][] = [];
      aoaData.push(["FACULTY MENTOR / NAME:", fac]);
      aoaData.push(["TOTAL MASTER ASSIGNED STUDENTS:", facMaster.length || targetRegistered.length]);
      aoaData.push(["COMPLETED REGISTRATIONS:", targetRegistered.length]);
      aoaData.push(["PENDING REGISTRATIONS:", pendingStudents.length]);
      aoaData.push([]);

      targetCourses.forEach((c) => {
        const s1Students = targetRegistered.filter(
          (r) => matchCourse(r.s1Sports, c.id, c.name) || matchCourse(r.s1StudentLife, c.id, c.name)
        );

        const s2Students = targetRegistered.filter(
          (r) => matchCourse(r.s2Sports, c.id, c.name) || matchCourse(r.s2StudentLife, c.id, c.name)
        );

        aoaData.push([`=== SUBJECT: ${c.name} (${c.id}) ===`]);
        aoaData.push([`--- SESSION 1 (${s1Students.length} Students) ---`]);
        aoaData.push(["S.No", "Registration Number", "Student Name", "Email Address", "Attendance"]);

        if (s1Students.length > 0) {
          s1Students.forEach((r, idx) => {
            aoaData.push([idx + 1, r.regNo, r.name, r.email, "[  ] Present"]);
          });
        } else {
          aoaData.push(["-", "No students registered", "-", "-", "-"]);
        }

        aoaData.push([]);
        aoaData.push([`--- SESSION 2 (${s2Students.length} Students) ---`]);
        aoaData.push(["S.No", "Registration Number", "Student Name", "Email Address", "Attendance"]);

        if (s2Students.length > 0) {
          s2Students.forEach((r, idx) => {
            aoaData.push([idx + 1, r.regNo, r.name, r.email, "[  ] Present"]);
          });
        } else {
          aoaData.push(["-", "No students registered", "-", "-", "-"]);
        }

        aoaData.push([]);
      });

      if (pendingStudents.length > 0) {
        aoaData.push([`=== PENDING REGISTRATIONS (${pendingStudents.length} Students Not Yet Registered) ===`]);
        aoaData.push(["S.No", "Registration Number", "Student Name", "Email Address", "Status"]);
        pendingStudents.forEach((m, idx) => {
          aoaData.push([idx + 1, m.regNo, m.name, m.email, "Pending Registration"]);
        });
        aoaData.push([]);
      }

      const sheet = XLSX.utils.aoa_to_sheet(aoaData);
      sheet["!cols"] = [{ wch: 8 }, { wch: 22 }, { wch: 28 }, { wch: 35 }, { wch: 25 }];
      const safeSheetName = fac.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30) || "Faculty";
      XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName);
    });

    XLSX.writeFile(
      workbook,
      `Master_All_Faculties_Attendance_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // Filtered courses for Course Occupancy Grid
  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      courseCategoryTab === "ALL" || course.category === courseCategoryTab;
    const matchesSearch =
      !courseSearchQuery ||
      course.name.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      course.id.toLowerCase().includes(courseSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered registrations for Master Roster Table
  const filteredRegistrations = registrations.filter((r) => {
    const q = rosterSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.name?.toLowerCase().includes(q) ||
      r.regNo?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Category filter
    if (rosterCategoryFilter === "Sports") {
      if (!r.s1Sports && !r.s2Sports) return false;
    } else if (rosterCategoryFilter === "Student Life") {
      if (!r.s1StudentLife && !r.s2StudentLife) return false;
    }

    // Specific Course filter
    if (rosterCourseFilter !== "ALL") {
      const selectedCourseObj = courses.find((c) => c.id === rosterCourseFilter);
      const cId = rosterCourseFilter;
      const cName = selectedCourseObj ? selectedCourseObj.name : "";
      const inS1 =
        matchCourse(r.s1Sports, cId, cName) || matchCourse(r.s1StudentLife, cId, cName);
      const inS2 =
        matchCourse(r.s2Sports, cId, cName) || matchCourse(r.s2StudentLife, cId, cName);
      if (!inS1 && !inS2) return false;
    }

    // Session filter
    if (rosterSessionFilter === "S1") {
      if (!r.s1Sports && !r.s1StudentLife) return false;
    } else if (rosterSessionFilter === "S2") {
      if (!r.s2Sports && !r.s2StudentLife) return false;
    }

    return true;
  });

  // Sports & Student Life Stats Calculation
  const sportsCourses = courses.filter((c) => c.category === "Sports");
  const sportsS1Total = sportsCourses.reduce((acc, c) => acc + c.s1SeatsOccupied, 0);
  const sportsS2Total = sportsCourses.reduce((acc, c) => acc + c.s2SeatsOccupied, 0);

  const studentLifeCourses = courses.filter((c) => c.category === "Student Life");
  const studentLifeS1Total = studentLifeCourses.reduce((acc, c) => acc + c.s1SeatsOccupied, 0);
  const studentLifeS2Total = studentLifeCourses.reduce((acc, c) => acc + c.s2SeatsOccupied, 0);

  // Unique faculty list derived from master student list & registrations
  const allFaculties = (Array.from(
    new Set([
      ...masterStudents.map((m) => m.facultyName?.trim()).filter(Boolean),
      ...registrations.map((r) => r.facultyName?.trim()).filter(Boolean),
    ])
  ) as string[])
    .filter((facName) => {
      const hasMaster = masterStudents.some(
        (m) => (m.facultyName || "").trim().toLowerCase() === facName.trim().toLowerCase()
      );
      const hasReg = registrations.some(
        (r) =>
          (r.status?.toUpperCase() === "CONFIRMED" || r.status?.toUpperCase() === "SUBMITTED") &&
          (r.facultyName || "").trim().toLowerCase() === facName.trim().toLowerCase()
      );
      return hasMaster || hasReg;
    })
    .sort();

  // Filter faculties by search query (faculty name or subject chosen by their assigned students)
  const filteredFaculties = allFaculties.filter((fac) => {
    if (!facultySearchQuery.trim()) return true;
    const q = facultySearchQuery.toLowerCase().trim();
    if (fac.toLowerCase().includes(q)) return true;

    const facRegs = registrations.filter(
      (r) => (r.facultyName || "").trim().toLowerCase() === fac.toLowerCase()
    );
    return facRegs.some(
      (r) =>
        r.s1Sports?.toLowerCase().includes(q) ||
        r.s1StudentLife?.toLowerCase().includes(q) ||
        r.s2Sports?.toLowerCase().includes(q) ||
        r.s2StudentLife?.toLowerCase().includes(q)
    );
  });

  // Default selected faculty if none selected
  const activeFaculty = selectedFaculty || filteredFaculties[0] || allFaculties[0] || "";

  // Master students assigned to activeFaculty (e.g. 31 for Nagarjun Talawar)
  const activeFacultyMasterStudents = masterStudents.filter(
    (m) => (m.facultyName || "").trim().toLowerCase() === activeFaculty.trim().toLowerCase()
  );

  // Registered students belonging to activeFaculty (e.g. 25 for Nagarjun Talawar)
  const activeFacultyRegisteredStudents = registrations.filter((r) => {
    if (r.status?.toUpperCase() !== "CONFIRMED" && r.status?.toUpperCase() !== "SUBMITTED") return false;
    const facName = (r.facultyName || "").trim();
    if (!facName) return activeFaculty === "Unassigned Faculty";
    return facName.toLowerCase() === activeFaculty.trim().toLowerCase();
  });

  // Pending / Unregistered students assigned to activeFaculty
  const activeRegisteredEmails = new Set(activeFacultyRegisteredStudents.map((r) => (r.email || "").toLowerCase()));
  const activeRegisteredRegNos = new Set(activeFacultyRegisteredStudents.map((r) => (r.regNo || "").toLowerCase()));
  const activeFacultyPendingStudents = activeFacultyMasterStudents.filter(
    (m) => !activeRegisteredEmails.has((m.email || "").toLowerCase()) && !activeRegisteredRegNos.has((m.regNo || "").toLowerCase())
  );

  // Total assigned student count for activeFaculty
  const activeFacultyTotalAssignedCount = Math.max(activeFacultyMasterStudents.length, activeFacultyRegisteredStudents.length);

  // Unique subjects chosen by registered students assigned to activeFaculty
  const activeFacultySubjects = courses.filter((c) => {
    return activeFacultyRegisteredStudents.some(
      (r) =>
        matchCourse(r.s1Sports, c.id, c.name) ||
        matchCourse(r.s1StudentLife, c.id, c.name) ||
        matchCourse(r.s2Sports, c.id, c.name) ||
        matchCourse(r.s2StudentLife, c.id, c.name)
    );
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#041C19] min-h-screen">
        <Loader2 className="w-8 h-8 text-[#7ECEB7] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-[#041C19] min-h-screen">
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
      {showResetModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-backdrop-fade">
            <div className="glass-panel max-w-md w-full p-6 space-y-5 border border-red-500/30 bg-[#041C19] shadow-2xl animate-modal-pop">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-[#F5EBE0]">Clear All Test Registrations?</h3>
                <p className="text-xs text-[#D6C7A1] leading-relaxed">
                  Enter the security password to confirm wiping all test records. Live registration data will be cleared.
                </p>
              </div>

              {resetError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs font-medium text-center">
                  {resetError}
                </div>
              )}

              <form onSubmit={handleClearAllRegistrations} className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7ECEB7]/70" />
                  <input
                    type={showAdminResetPassword ? "text" : "password"}
                    required
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                    placeholder="Enter Security Password"
                    className="input-glass input-glass-icon-left input-glass-icon-right text-sm"
                    disabled={resetting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminResetPassword(!showAdminResetPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7ECEB7]/70 hover:text-[#F5EBE0] p-1 transition-colors"
                    title={showAdminResetPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showAdminResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetError("");
                      setResetPasswordInput("");
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-[#072C28] hover:bg-[#037A74]/30 text-[#D6C7A1] text-xs font-semibold border border-[#7ECEB7]/20 transition-all"
                    disabled={resetting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetting || !resetPasswordInput}
                    className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50"
                  >
                    {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Wipe"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ADMIN CHANGE PASSWORD MODAL */}
      {showAdminPasswordModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-backdrop-fade">
            <div className="glass-panel p-6 md:p-8 max-w-md w-full border border-[#7ECEB7]/30 shadow-2xl relative space-y-5 bg-[#041C19] animate-modal-pop">
              <div className="flex items-center justify-between border-b border-[#7ECEB7]/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#037A74]/30 border border-[#7ECEB7]/40 flex items-center justify-center text-[#7ECEB7]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#F5EBE0]">Change Admin Password</h3>
                    <p className="text-xs text-[#D6C7A1]">Update your admin account password</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminPasswordModal(false)}
                  className="text-[#D6C7A1] hover:text-[#F5EBE0] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {adminPasswordMsg && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                    adminPasswordMsgType === "success"
                      ? "bg-[#7ECEB7]/15 border-[#7ECEB7]/30 text-[#7ECEB7]"
                      : "bg-red-500/15 border-red-500/30 text-red-300"
                  }`}
                >
                  {adminPasswordMsgType === "success" ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{adminPasswordMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdminChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D6C7A1] mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminCurrentPw ? "text" : "password"}
                      required
                      placeholder="Enter current password"
                      value={adminCurrentPassword}
                      onChange={(e) => setAdminCurrentPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-[#F5EBE0] placeholder-[#D6C7A1]/40 text-sm focus:outline-none focus:border-[#7ECEB7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminCurrentPw(!showAdminCurrentPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7ECEB7]/70 hover:text-[#F5EBE0] p-1 transition-colors"
                      title={showAdminCurrentPw ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showAdminCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D6C7A1] mb-1.5">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminNewPw ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Enter new password"
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-[#F5EBE0] placeholder-[#D6C7A1]/40 text-sm focus:outline-none focus:border-[#7ECEB7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminNewPw(!showAdminNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7ECEB7]/70 hover:text-[#F5EBE0] p-1 transition-colors"
                      title={showAdminNewPw ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showAdminNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D6C7A1] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminConfirmPw ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Re-enter new password"
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-[#F5EBE0] placeholder-[#D6C7A1]/40 text-sm focus:outline-none focus:border-[#7ECEB7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminConfirmPw(!showAdminConfirmPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7ECEB7]/70 hover:text-[#F5EBE0] p-1 transition-colors"
                      title={showAdminConfirmPw ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showAdminConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#7ECEB7]/15">
                  <button
                    type="button"
                    onClick={() => setShowAdminPasswordModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#072C28] text-[#D6C7A1] hover:text-[#F5EBE0] text-xs font-semibold border border-[#7ECEB7]/15 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adminChangingPassword}
                    className="btn-primary px-5 py-2.5 text-xs font-bold text-[#F5EBE0] flex items-center gap-2 disabled:opacity-50"
                  >
                    {adminChangingPassword ? (
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

      {/* Admin Header */}
      <header className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#7ECEB7]/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#037A74]/20 rounded-full flex items-center justify-center border border-[#7ECEB7]/30">
            <ShieldCheck className="w-6 h-6 text-[#7ECEB7]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5EBE0]">Admin Portal</h1>
            <p className="text-sm text-[#D6C7A1]">
              Authenticated Admin:{" "}
              <span className="text-[#7ECEB7] font-mono font-medium">{adminEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setAdminPasswordMsg("");
              setAdminPasswordMsgType("");
              setShowAdminPasswordModal(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#072C28] hover:bg-[#037A74]/40 text-[#F5EBE0] text-xs font-semibold border border-[#7ECEB7]/20 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <KeyRound className="w-4 h-4 text-[#7ECEB7]" /> Change Password
          </button>

          <button
            onClick={() => {
              setShowResetModal(true);
              setResetError("");
              setResetPasswordInput("");
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            title="Clear all test registrations"
          >
            <Trash2 className="w-4 h-4 text-red-400" /> Clear Test Data
          </button>

          <button
            onClick={exportAllToExcel}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold text-[#F5EBE0] py-2.5 px-4"
          >
            <Download className="w-4 h-4 text-[#F5EBE0]" /> Export All (.xlsx)
          </button>

          <button
            onClick={exportFridayOnlyS1ToExcel}
            className="px-4 py-2.5 rounded-xl bg-[#037A74]/40 hover:bg-[#037A74]/60 text-[#7ECEB7] border border-[#7ECEB7]/30 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            title="Export students registered for Friday-Only S1 courses"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#7ECEB7]" /> Export Friday-Only S1 (.xlsx)
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

      {/* REGISTRATION OPEN / CLOSE CONTROL PANEL */}
      <section
        className={`glass-panel p-6 border transition-all ${
          isRegistrationOpen
            ? "border-emerald-500/30 bg-emerald-950/10"
            : "border-red-500/30 bg-red-950/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
                isRegistrationOpen
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-red-500/20 text-red-400 border-red-500/40"
              }`}
            >
              {isRegistrationOpen ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#F5EBE0]">Course Registration Control</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono border flex items-center gap-1.5 ${
                    isRegistrationOpen
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-red-500/20 text-red-300 border-red-500/40"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-ping ${
                      isRegistrationOpen ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  ></span>
                  REGISTRATION {isRegistrationOpen ? "OPEN" : "CLOSED"}
                </span>
              </div>
              <p className="text-xs text-[#D6C7A1] mt-1">
                {isRegistrationOpen
                  ? "Students can currently select courses and submit their course registration."
                  : "Registration is CLOSED. Students cannot select courses or submit new registrations."}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleRegistration(!isRegistrationOpen)}
            disabled={togglingReg}
            className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg border disabled:opacity-50 ${
              isRegistrationOpen
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40 shadow-red-500/20"
                : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20"
            }`}
          >
            {togglingReg ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegistrationOpen ? (
              <>
                <Lock className="w-4 h-4 text-red-400" />
                <span>Close Registration</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>Open Registration</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* STUDENT PASSWORD RESET PANEL */}
      <section className="glass-panel p-6 border border-[#7ECEB7]/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#037A74]/20 border border-[#7ECEB7]/30 flex items-center justify-center text-[#7ECEB7]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F5EBE0]">Reset Student Password</h2>
            <p className="text-xs text-[#D6C7A1]">
              Enter a student&apos;s email address to revert their password back to default (
              <span className="font-mono text-[#7ECEB7]">&lt;prefix&gt;@reg_pass</span>).
            </p>
          </div>
        </div>

        {resetStudentMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              resetStudentMsgType === "success"
                ? "bg-[#7ECEB7]/15 border-[#7ECEB7]/30 text-[#7ECEB7]"
                : "bg-red-500/15 border-red-500/30 text-red-300"
            }`}
          >
            <span>{resetStudentMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleResetStudentPassword}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <input
            type="email"
            required
            placeholder="student@domain.com"
            value={targetStudentEmail}
            onChange={(e) => setTargetStudentEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-[#F5EBE0] placeholder-[#D6C7A1]/40 text-sm focus:outline-none focus:border-[#7ECEB7]"
          />
          <button
            type="submit"
            disabled={resettingStudentPassword || !targetStudentEmail.trim()}
            className="btn-primary px-6 py-2.5 text-xs font-bold text-[#F5EBE0] flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {resettingStudentPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#F5EBE0]" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Reset Password to Default</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* OVERVIEW STATS & CATEGORY BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Master Roster */}
        <div className="glass-panel p-5 space-y-2 border border-[#7ECEB7]/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D6C7A1]">
            <span className="text-xs uppercase tracking-wider font-semibold">Master Roster</span>
            <Users className="w-5 h-5 text-[#7ECEB7]" />
          </div>
          <div className="text-3xl font-bold text-[#F5EBE0]">{totalMaster}</div>
          <p className="text-xs text-[#D6C7A1]/70">Eligible students in sheet</p>
        </div>

        {/* Total Registered */}
        <div className="glass-panel p-5 space-y-2 border border-[#7ECEB7]/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D6C7A1]">
            <span className="text-xs uppercase tracking-wider font-semibold">Registered Students</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-[#F5EBE0]">{totalReg}</div>
          <p className="text-xs text-[#D6C7A1]/70">Confirmed course submissions</p>
        </div>

        {/* Sports Category Summary Card */}
        <div
          onClick={() => setCourseCategoryTab("Sports")}
          className={`glass-panel p-5 space-y-2 border transition-all cursor-pointer hover:border-[#7ECEB7]/50 ${
            courseCategoryTab === "Sports"
              ? "border-[#7ECEB7] bg-[#037A74]/20 shadow-lg shadow-[#037A74]/20"
              : "border-[#7ECEB7]/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#7ECEB7] flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" /> Sports (8)
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                exportCategoryToExcel("Sports");
              }}
              title="Export Sports Excel"
              className="text-[#7ECEB7] hover:text-white p-1 rounded hover:bg-white/10"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-[#F5EBE0]">
              {sportsS1Total + sportsS2Total} <span className="text-xs font-normal text-[#D6C7A1]">seats</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#072C28] text-[#7ECEB7]">
              S1: {sportsS1Total} | S2: {sportsS2Total}
            </span>
          </div>
          <p className="text-xs text-[#D6C7A1]/70">Click to filter Sports courses below</p>
        </div>

        {/* Student Life Category Summary Card */}
        <div
          onClick={() => setCourseCategoryTab("Student Life")}
          className={`glass-panel p-5 space-y-2 border transition-all cursor-pointer hover:border-[#A07850]/50 ${
            courseCategoryTab === "Student Life"
              ? "border-[#A07850] bg-[#A07850]/20 shadow-lg shadow-[#A07850]/20"
              : "border-[#7ECEB7]/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#A07850] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> Student Life (11)
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                exportCategoryToExcel("Student Life");
              }}
              title="Export Student Life Excel"
              className="text-[#A07850] hover:text-white p-1 rounded hover:bg-white/10"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-[#F5EBE0]">
              {studentLifeS1Total + studentLifeS2Total} <span className="text-xs font-normal text-[#D6C7A1]">seats</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#072C28] text-[#A07850]">
              S1: {studentLifeS1Total} | S2: {studentLifeS2Total}
            </span>
          </div>
          <p className="text-xs text-[#D6C7A1]/70">Click to filter Student Life courses</p>
        </div>
      </div>

      {/* COURSE-SPECIFIC OCCUPANCY & ENROLLED STUDENT QUERY SECTION */}
      <section className="glass-panel p-6 space-y-6 border border-[#7ECEB7]/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7ECEB7]/15 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#F5EBE0] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#7ECEB7]" />
              Subject Offerings & Session Occupancy
            </h2>
            <p className="text-xs text-[#D6C7A1] mt-0.5">
              Inspect student enrollments by subject and session, or export detailed Excel rosters.
            </p>
          </div>

          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Category Filter Tabs */}
            <div className="flex items-center bg-[#072C28] p-1 rounded-xl border border-[#7ECEB7]/20 text-xs font-semibold">
              <button
                onClick={() => setCourseCategoryTab("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  courseCategoryTab === "ALL"
                    ? "bg-[#037A74] text-white shadow-sm"
                    : "text-[#D6C7A1] hover:text-white"
                }`}
              >
                All ({courses.length})
              </button>
              <button
                onClick={() => setCourseCategoryTab("Sports")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  courseCategoryTab === "Sports"
                    ? "bg-[#037A74] text-white shadow-sm"
                    : "text-[#D6C7A1] hover:text-white"
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" /> Sports ({sportsCourses.length})
              </button>
              <button
                onClick={() => setCourseCategoryTab("Student Life")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  courseCategoryTab === "Student Life"
                    ? "bg-[#A07850] text-white shadow-sm"
                    : "text-[#D6C7A1] hover:text-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Student Life ({studentLifeCourses.length})
              </button>
            </div>

            {/* Course Search */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7ECEB7]/70" />
              <input
                type="text"
                placeholder="Search subject..."
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-xs text-[#F5EBE0] placeholder-[#D6C7A1]/40 focus:outline-none focus:border-[#7ECEB7]"
              />
              {courseSearchQuery && (
                <button
                  onClick={() => setCourseSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#D6C7A1] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COURSES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const s1Percentage = Math.round((course.s1SeatsOccupied / course.maxSeats) * 100);
            const s2Percentage = Math.round((course.s2SeatsOccupied / course.maxSeats) * 100);
            const isExpanded = expandedCourseId === course.id;

            const s1Students = registrations.filter((r) => {
              if (r.status?.toUpperCase() !== "CONFIRMED" && r.status?.toUpperCase() !== "SUBMITTED") return false;
              return matchCourse(r.s1Sports, course.id, course.name) || matchCourse(r.s1StudentLife, course.id, course.name);
            });

            const s2Students = registrations.filter((r) => {
              if (r.status?.toUpperCase() !== "CONFIRMED" && r.status?.toUpperCase() !== "SUBMITTED") return false;
              return matchCourse(r.s2Sports, course.id, course.name) || matchCourse(r.s2StudentLife, course.id, course.name);
            });

            const cardQuery = (inCardSearchQuery[course.id] || "").toLowerCase().trim();

            const s1Filtered = s1Students.filter((s) => {
              if (!cardQuery) return true;
              return (
                s.name?.toLowerCase().includes(cardQuery) ||
                s.regNo?.toLowerCase().includes(cardQuery) ||
                s.email?.toLowerCase().includes(cardQuery)
              );
            });

            const s2Filtered = s2Students.filter((s) => {
              if (!cardQuery) return true;
              return (
                s.name?.toLowerCase().includes(cardQuery) ||
                s.regNo?.toLowerCase().includes(cardQuery) ||
                s.email?.toLowerCase().includes(cardQuery)
              );
            });

            const isSports = course.category === "Sports";

            return (
              <div
                key={course.id}
                className={`glass-card p-5 space-y-4 flex flex-col justify-between border transition-all ${
                  isSports ? "border-[#7ECEB7]/25 hover:border-[#7ECEB7]/40" : "border-[#A07850]/25 hover:border-[#A07850]/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#F5EBE0]">{course.name}</h3>
                      </div>
                      {course.faculty && (
                        <p className="text-xs text-[#D6C7A1]/80 mt-0.5">Faculty: {course.faculty}</p>
                      )}
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-mono whitespace-nowrap flex items-center gap-1 ${
                        isSports
                          ? "bg-[#037A74]/20 border-[#7ECEB7]/30 text-[#7ECEB7]"
                          : "bg-[#A07850]/20 border-[#A07850]/30 text-[#A07850]"
                      }`}
                    >
                      {isSports ? <Dumbbell className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                      {course.category} ({course.id})
                    </span>
                  </div>

                  {/* Session 1 Fill Bar */}
                  <div className="space-y-1 bg-[#072C28]/60 p-2.5 rounded-xl border border-[#7ECEB7]/10">
                    <div className="flex justify-between text-xs font-medium text-[#D6C7A1]">
                      <span className="flex items-center gap-1 text-[#7ECEB7] font-semibold">
                        Session 1 Occupancy
                      </span>
                      <span>
                        <strong className="text-white">{course.s1SeatsOccupied}</strong> Registered / {course.s1EffectiveMaxSeats || course.maxSeats} Cap ({course.s1SeatsAvailable} Remaining)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#041C19] rounded-full overflow-hidden border border-[#7ECEB7]/10">
                      <div
                        className={`h-full transition-all duration-500 ${
                          s1Percentage >= 100 ? "bg-red-500" : "bg-[#037A74]"
                        }`}
                        style={{ width: `${Math.min(100, s1Percentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Session 2 Fill Bar */}
                  <div className="space-y-1 bg-[#072C28]/60 p-2.5 rounded-xl border border-[#7ECEB7]/10">
                    <div className="flex justify-between text-xs font-medium text-[#D6C7A1]">
                      <span className="flex items-center gap-1 text-[#A07850] font-semibold">
                        Session 2 Occupancy
                      </span>
                      <span>
                        <strong className="text-white">{course.s2SeatsOccupied}</strong> Registered / {course.s2EffectiveMaxSeats || course.maxSeats} Cap ({course.s2SeatsAvailable} Remaining)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#041C19] rounded-full overflow-hidden border border-[#7ECEB7]/10">
                      <div
                        className={`h-full transition-all duration-500 ${
                          s2Percentage >= 100 ? "bg-red-500" : "bg-[#A07850]"
                        }`}
                        style={{ width: `${Math.min(100, s2Percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE INLINE ROSTER QUERY VIEW */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#7ECEB7]/15 space-y-4 animate-fade-in text-xs bg-[#041C19]/60 p-3 rounded-xl">
                    {/* Search inside this course card */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7ECEB7]/70" />
                      <input
                        type="text"
                        placeholder="Search student in this subject..."
                        value={inCardSearchQuery[course.id] || ""}
                        onChange={(e) =>
                          setInCardSearchQuery((prev) => ({
                            ...prev,
                            [course.id]: e.target.value,
                          }))
                        }
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#072C28] border border-[#7ECEB7]/20 text-xs text-[#F5EBE0] placeholder-[#D6C7A1]/40 focus:outline-none focus:border-[#7ECEB7]"
                      />
                    </div>

                    {/* Session 1 List */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#7ECEB7] flex items-center gap-1.5">
                          <span>Session 1 Enrolled</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#037A74]/30 text-white text-[10px] font-mono">
                            {s1Filtered.length}
                          </span>
                        </h4>
                      </div>
                      {s1Filtered.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto space-y-1 bg-[#072C28] p-2 rounded-lg border border-[#7ECEB7]/15">
                          {s1Filtered.map((s, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] font-mono text-[#F5EBE0] py-1 border-b border-[#7ECEB7]/10 last:border-none px-1 hover:bg-[#037A74]/10 rounded"
                            >
                              <span className="text-[#D6C7A1] font-semibold min-w-[70px]">{s.regNo}</span>
                              <span className="truncate max-w-[130px] font-sans font-medium text-white">
                                {s.name}
                              </span>
                              <span className="text-[#D6C7A1]/70 truncate max-w-[130px]">{s.email}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#D6C7A1]/50 italic p-1">
                          No matching students for Session 1.
                        </p>
                      )}
                    </div>

                    {/* Session 2 List */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#A07850] flex items-center gap-1.5">
                          <span>Session 2 Enrolled</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#A07850]/30 text-white text-[10px] font-mono">
                            {s2Filtered.length}
                          </span>
                        </h4>
                      </div>
                      {s2Filtered.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto space-y-1 bg-[#072C28] p-2 rounded-lg border border-[#7ECEB7]/15">
                          {s2Filtered.map((s, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] font-mono text-[#F5EBE0] py-1 border-b border-[#7ECEB7]/10 last:border-none px-1 hover:bg-[#A07850]/10 rounded"
                            >
                              <span className="text-[#D6C7A1] font-semibold min-w-[70px]">{s.regNo}</span>
                              <span className="truncate max-w-[130px] font-sans font-medium text-white">
                                {s.name}
                              </span>
                              <span className="text-[#D6C7A1]/70 truncate max-w-[130px]">{s.email}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#D6C7A1]/50 italic p-1">
                          No matching students for Session 2.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="pt-3 border-t border-[#7ECEB7]/15 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#072C28] hover:bg-[#037A74]/20 text-[#D6C7A1] hover:text-white border border-[#7ECEB7]/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#7ECEB7]" />
                    <span>
                      {isExpanded ? "Hide Roster" : `View Students (${s1Students.length + s2Students.length})`}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => exportCourseExcel(course.id, course.name, course.category)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#037A74]/20 hover:bg-[#037A74]/35 text-[#7ECEB7] border border-[#037A74]/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#7ECEB7]" />
                    <span>Export Excel (.xlsx)</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredCourses.length === 0 && (
            <div className="col-span-full p-8 text-center glass-panel border border-[#7ECEB7]/15 text-[#D6C7A1]/60">
              No subjects found matching current category & search criteria.
            </div>
          )}
        </div>
      </section>

      {/* FACULTY ATTENDANCE & ROSTER SHEETS SECTION */}
      <section className="glass-panel p-6 space-y-6 border border-[#7ECEB7]/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7ECEB7]/15 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#F5EBE0] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#7ECEB7]" />
              Faculty Attendance Roster & Search
            </h2>
            <p className="text-xs text-[#D6C7A1] mt-0.5">
              Select any faculty tab to view students enrolled under their subjects or export formatted Excel sheets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Faculty */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7ECEB7]/70" />
              <input
                type="text"
                placeholder="Search faculty or subject..."
                value={facultySearchQuery}
                onChange={(e) => setFacultySearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#072C28] border border-[#7ECEB7]/20 text-xs text-[#F5EBE0] placeholder-[#D6C7A1]/40 focus:outline-none focus:border-[#7ECEB7]"
              />
              {facultySearchQuery && (
                <button
                  onClick={() => setFacultySearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#D6C7A1] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Master Export All Faculties */}
            <button
              onClick={exportAllFacultiesExcel}
              className="px-4 py-2 rounded-xl bg-[#072C28] hover:bg-[#037A74]/30 text-[#7ECEB7] border border-[#7ECEB7]/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap"
              title="Export attendance workbook for all faculties"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#7ECEB7]" />
              <span>Export All Faculties (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* FACULTY SELECTION TABS */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#D6C7A1] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#7ECEB7]" />
            Faculty Members ({filteredFaculties.length})
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#7ECEB7]/30">
            {filteredFaculties.map((fac) => {
              const isSelected = activeFaculty === fac;
              
              const masterCount = masterStudents.filter(
                (m) => (m.facultyName || "").trim().toLowerCase() === fac.trim().toLowerCase()
              ).length;

              const regCount = registrations.filter((r) => {
                if (r.status?.toUpperCase() !== "CONFIRMED" && r.status?.toUpperCase() !== "SUBMITTED") return false;
                return (r.facultyName || "").trim().toLowerCase() === fac.trim().toLowerCase();
              }).length;

              const totalAssigned = Math.max(masterCount, regCount);

              return (
                <button
                  key={fac}
                  onClick={() => setSelectedFaculty(fac)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 whitespace-nowrap border ${
                    isSelected
                      ? "bg-[#037A74] text-white border-[#7ECEB7] shadow-lg shadow-[#037A74]/30"
                      : "bg-[#072C28] text-[#D6C7A1] hover:text-white border-[#7ECEB7]/20 hover:border-[#7ECEB7]/40"
                  }`}
                >
                  <User className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#7ECEB7]"}`} />
                  <span>{fac}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#041C19] text-[#7ECEB7]"
                    }`}
                  >
                    {totalAssigned} Assigned ({regCount} Registered)
                  </span>
                </button>
              );
            })}

            {filteredFaculties.length === 0 && (
              <p className="text-xs text-[#D6C7A1]/60 italic p-2">
                No faculties matching &quot;{facultySearchQuery}&quot;
              </p>
            )}
          </div>
        </div>

        {/* SELECTED FACULTY DETAILS & ROSTER CARD */}
        {activeFaculty ? (
          <div className="glass-card p-5 space-y-5 border border-[#7ECEB7]/30 bg-[#041C19]/80 rounded-2xl">
            {/* Faculty Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#7ECEB7]/15 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#F5EBE0]">{activeFaculty}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#037A74]/20 border border-[#7ECEB7]/30 text-[#7ECEB7] text-xs font-mono">
                    {activeFacultyTotalAssignedCount} Master Assigned ({activeFacultyRegisteredStudents.length} Registered, {activeFacultyPendingStudents.length} Pending)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#D6C7A1]">
                  <span>Subjects Chosen by Registered Students:</span>
                  {activeFacultySubjects.length > 0 ? (
                    activeFacultySubjects.map((c) => (
                      <span key={c.id} className="font-semibold text-white bg-[#072C28] px-2 py-0.5 rounded border border-[#7ECEB7]/15">
                        {c.name} ({c.id})
                      </span>
                    ))
                  ) : (
                    <span className="italic text-[#D6C7A1]/60">No course selections submitted yet.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search student inside active faculty */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7ECEB7]/70" />
                  <input
                    type="text"
                    placeholder="Search student in faculty roster..."
                    value={facultyStudentSearchQuery}
                    onChange={(e) => setFacultyStudentSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-[#072C28] border border-[#7ECEB7]/20 text-xs text-[#F5EBE0] placeholder-[#D6C7A1]/40 focus:outline-none focus:border-[#7ECEB7]"
                  />
                  {facultyStudentSearchQuery && (
                    <button
                      onClick={() => setFacultyStudentSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#D6C7A1] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Export single faculty Excel button */}
                <button
                  onClick={() => exportFacultyExcel(activeFaculty)}
                  className="btn-primary px-4 py-2 text-xs font-bold text-[#F5EBE0] flex items-center gap-1.5 shadow-md whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-[#F5EBE0]" />
                  <span>Download Attendance Sheet (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* SUBJECT ROSTER TABLES FOR THIS FACULTY */}
            <div className="space-y-6">
              {activeFacultySubjects.map((c) => {
                const s1All = activeFacultyRegisteredStudents.filter(
                  (r) => matchCourse(r.s1Sports, c.id, c.name) || matchCourse(r.s1StudentLife, c.id, c.name)
                );

                const s2All = activeFacultyRegisteredStudents.filter(
                  (r) => matchCourse(r.s2Sports, c.id, c.name) || matchCourse(r.s2StudentLife, c.id, c.name)
                );

                const q = facultyStudentSearchQuery.trim().toLowerCase();
                const s1Filtered = s1All.filter(
                  (s) => !q || s.name?.toLowerCase().includes(q) || s.regNo?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
                );
                const s2Filtered = s2All.filter(
                  (s) => !q || s.name?.toLowerCase().includes(q) || s.regNo?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
                );

                const isSports = c.category === "Sports";

                return (
                  <div key={c.id} className="space-y-4 bg-[#072C28]/40 p-4 rounded-xl border border-[#7ECEB7]/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isSports ? <Dumbbell className="w-4 h-4 text-[#7ECEB7]" /> : <GraduationCap className="w-4 h-4 text-[#A07850]" />}
                        <h4 className="font-bold text-sm text-[#F5EBE0]">{c.name} ({c.id})</h4>
                        <span className="text-xs text-[#D6C7A1] font-mono">[{c.category}]</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#7ECEB7]">
                        Registered Students: {s1All.length + s2All.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Session 1 List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#7ECEB7] border-b border-[#7ECEB7]/15 pb-1">
                          <span>Session 1 ({s1Filtered.length})</span>
                        </div>
                        {s1Filtered.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg border border-[#7ECEB7]/15 bg-[#041C19]">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#072C28] text-[#D6C7A1]">
                                <tr>
                                  <th className="p-2">#</th>
                                  <th className="p-2">Reg No</th>
                                  <th className="p-2">Student Name</th>
                                  <th className="p-2">Email</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#7ECEB7]/10 text-[#F5EBE0]">
                                {s1Filtered.map((st, idx) => (
                                  <tr key={idx} className="hover:bg-[#037A74]/15">
                                    <td className="p-2 text-[#D6C7A1]">{idx + 1}</td>
                                    <td className="p-2 font-mono text-[#7ECEB7] font-semibold">{st.regNo}</td>
                                    <td className="p-2 font-medium text-white">{st.name}</td>
                                    <td className="p-2 font-mono text-[11px] text-[#D6C7A1]/80">{st.email}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-[#D6C7A1]/50 italic p-2">No Session 1 students.</p>
                        )}
                      </div>

                      {/* Session 2 List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#A07850] border-b border-[#A07850]/15 pb-1">
                          <span>Session 2 ({s2Filtered.length})</span>
                        </div>
                        {s2Filtered.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg border border-[#7ECEB7]/15 bg-[#041C19]">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#072C28] text-[#D6C7A1]">
                                <tr>
                                  <th className="p-2">#</th>
                                  <th className="p-2">Reg No</th>
                                  <th className="p-2">Student Name</th>
                                  <th className="p-2">Email</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#7ECEB7]/10 text-[#F5EBE0]">
                                {s2Filtered.map((st, idx) => (
                                  <tr key={idx} className="hover:bg-[#A07850]/15">
                                    <td className="p-2 text-[#D6C7A1]">{idx + 1}</td>
                                    <td className="p-2 font-mono text-[#A07850] font-semibold">{st.regNo}</td>
                                    <td className="p-2 font-medium text-white">{st.name}</td>
                                    <td className="p-2 font-mono text-[11px] text-[#D6C7A1]/80">{st.email}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-[#D6C7A1]/50 italic p-2">No Session 2 students.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* PENDING / UNREGISTERED STUDENTS TABLE */}
              {activeFacultyPendingStudents.length > 0 && (
                <div className="space-y-3 bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-yellow-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Pending / Unregistered Students ({activeFacultyPendingStudents.length})
                    </h4>
                    <span className="text-xs text-[#D6C7A1]">Assigned in master sheet, course submission pending</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-yellow-500/20 bg-[#041C19]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#072C28] text-[#D6C7A1]">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Reg No</th>
                          <th className="p-2">Student Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#7ECEB7]/10 text-[#F5EBE0]">
                        {activeFacultyPendingStudents.map((pst, idx) => (
                          <tr key={idx} className="hover:bg-yellow-500/10">
                            <td className="p-2 text-[#D6C7A1]">{idx + 1}</td>
                            <td className="p-2 font-mono text-yellow-300 font-semibold">{pst.regNo}</td>
                            <td className="p-2 font-medium text-white">{pst.name}</td>
                            <td className="p-2 font-mono text-[11px] text-[#D6C7A1]/80">{pst.email}</td>
                            <td className="p-2">
                              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-mono border border-yellow-500/30">
                                Pending Registration
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center glass-panel border border-[#7ECEB7]/15 text-[#D6C7A1]/60">
            Select a faculty member above to view their attendance roster.
          </div>
        )}
      </section>

      {/* MASTER REGISTERED STUDENT ROSTER TABLE WITH ADVANCED MULTI-FILTERING */}
      <section className="glass-panel p-6 space-y-6 overflow-hidden border border-[#7ECEB7]/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#7ECEB7]/15 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#F5EBE0] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#7ECEB7]" />
              Master Student Registration Roster
            </h2>
            <p className="text-xs text-[#D6C7A1] mt-0.5">
              Query registered students by search term, category, subject, or session.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#7ECEB7] bg-[#072C28] px-3 py-1.5 rounded-xl border border-[#7ECEB7]/20">
            <span>Showing {filteredRegistrations.length} of {registrations.length} registrations</span>
          </div>
        </div>

        {/* MULTI-FILTER BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#072C28]/60 p-4 rounded-xl border border-[#7ECEB7]/15">
          {/* Search Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#D6C7A1] uppercase tracking-wider flex items-center gap-1">
              <Search className="w-3 h-3 text-[#7ECEB7]" /> Search Student
            </label>
            <input
              type="text"
              placeholder="Name, Reg No, or Email..."
              value={rosterSearchQuery}
              onChange={(e) => setRosterSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#041C19] border border-[#7ECEB7]/20 text-xs text-[#F5EBE0] placeholder-[#D6C7A1]/40 focus:outline-none focus:border-[#7ECEB7]"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#D6C7A1] uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#7ECEB7]" /> Category
            </label>
            <select
              value={rosterCategoryFilter}
              onChange={(e) => setRosterCategoryFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#041C19] border border-[#7ECEB7]/20 text-xs text-[#F5EBE0] focus:outline-none focus:border-[#7ECEB7]"
            >
              <option value="ALL">All Categories</option>
              <option value="Sports">Sports Only</option>
              <option value="Student Life">Student Life Only</option>
            </select>
          </div>

          {/* Specific Course Dropdown Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#D6C7A1] uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#7ECEB7]" /> Filter Subject
            </label>
            <select
              value={rosterCourseFilter}
              onChange={(e) => setRosterCourseFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#041C19] border border-[#7ECEB7]/20 text-xs text-[#F5EBE0] focus:outline-none focus:border-[#7ECEB7]"
            >
              <option value="ALL">All Subjects (19)</option>
              <optgroup label="Sports Courses">
                {sportsCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Student Life Courses">
                {studentLifeCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Session Dropdown Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#D6C7A1] uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#7ECEB7]" /> Session Filter
            </label>
            <select
              value={rosterSessionFilter}
              onChange={(e) => setRosterSessionFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#041C19] border border-[#7ECEB7]/20 text-xs text-[#F5EBE0] focus:outline-none focus:border-[#7ECEB7]"
            >
              <option value="ALL">All Sessions (S1 & S2)</option>
              <option value="S1">Registered in Session 1</option>
              <option value="S2">Registered in Session 2</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        {(rosterSearchQuery || rosterCategoryFilter !== "ALL" || rosterCourseFilter !== "ALL" || rosterSessionFilter !== "ALL") && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#D6C7A1]/80">Active filters applied</span>
            <button
              onClick={() => {
                setRosterSearchQuery("");
                setRosterCategoryFilter("ALL");
                setRosterCourseFilter("ALL");
                setRosterSessionFilter("ALL");
              }}
              className="text-[#7ECEB7] hover:text-white flex items-center gap-1 underline"
            >
              <RefreshCw className="w-3 h-3" /> Clear All Filters
            </button>
          </div>
        )}

        {/* ROSTER TABLE */}
        <div className="overflow-x-auto rounded-xl border border-[#7ECEB7]/15">
          <table className="w-full text-left text-sm text-[#F5EBE0]">
            <thead className="bg-[#072C28] text-[#D6C7A1] uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Reg No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5 text-[#7ECEB7]">S1 Sports</th>
                <th className="p-3.5 text-[#A07850]">S1 Student Life</th>
                <th className="p-3.5 text-[#7ECEB7]">S2 Sports</th>
                <th className="p-3.5 text-[#A07850]">S2 Student Life</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7ECEB7]/15 bg-[#041C19]/40">
              {filteredRegistrations.map((r, i) => (
                <tr key={i} className="hover:bg-[#037A74]/15 transition-colors">
                  <td className="p-3.5 font-mono text-[#D6C7A1] font-semibold">{r.regNo}</td>
                  <td className="p-3.5 font-medium text-white">{r.name}</td>
                  <td className="p-3.5 font-mono text-xs text-[#D6C7A1]/80">{r.email}</td>
                  <td className="p-3.5 font-medium text-xs text-[#7ECEB7]">{r.s1Sports || <span className="text-gray-600">-</span>}</td>
                  <td className="p-3.5 font-medium text-xs text-[#A07850]">{r.s1StudentLife || <span className="text-gray-600">-</span>}</td>
                  <td className="p-3.5 font-medium text-xs text-[#7ECEB7]">{r.s2Sports || <span className="text-gray-600">-</span>}</td>
                  <td className="p-3.5 font-medium text-xs text-[#A07850]">{r.s2StudentLife || <span className="text-gray-600">-</span>}</td>
                  <td className="p-3.5">
                    <span className="bg-[#7ECEB7]/20 text-[#7ECEB7] border border-[#7ECEB7]/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold">
                      {r.status || "CONFIRMED"}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRegistrations.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[#D6C7A1]/50 italic">
                    No student registrations found matching your query.
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
