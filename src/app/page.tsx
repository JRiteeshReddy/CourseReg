"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Loader2, ArrowRight, ShieldCheck, Sun, Moon, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const emailPrefix = email.trim() ? email.split('@')[0].toLowerCase() : 'username';
  const hintPassword = `${emailPrefix}@reg_pass`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to log in");
      } else {
        router.push(data.redirectTo || "/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full glass-card hover:scale-105 transition-all text-slate-300 hover:text-white"
        title="Toggle Light / Dark Mode"
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
      </button>

      {/* Main Glass Panel */}
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Student Portal</h1>
          <p className="text-slate-400 text-sm">
            University Campus Life Course Registration System
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-lg mb-6 text-sm flex items-center gap-3 animate-fade-in">
            <div className="w-1.5 h-6 bg-red-500 rounded-full flex-shrink-0"></div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">University Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="input-glass pl-11"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`${hintPassword}`}
                className="input-glass pl-11 pr-11"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Format Hint */}
            <p className="text-xs text-slate-400 ml-1">
              Default password format: <span className="font-mono text-blue-400 font-semibold">{hintPassword}</span>
            </p>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
            disabled={loading || !email || !password}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login & Access Portal"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
