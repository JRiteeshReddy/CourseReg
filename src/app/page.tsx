"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Loader2, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#041C19] text-[#F5EBE0]">
      {/* Dynamic Background Glow Spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#037A74]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#A07850]/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glass Panel */}
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in relative overflow-hidden border border-[#7ECEB7]/20 shadow-2xl">
        {/* Top Decorative Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#A07850] via-[#7ECEB7] to-[#037A74]"></div>

        <div className="text-center mb-8 mt-2">
          <img 
            src="/images/2.png" 
            alt="Campus Life Logo" 
            className="h-16 w-auto object-contain mx-auto mb-4 drop-shadow-[0_4px_12px_rgba(126,206,183,0.3)]" 
          />
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#F5EBE0]">Student Portal</h1>
          <p className="text-[#D6C7A1] text-sm">
            University Campus Life Course Registration System
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3.5 rounded-xl mb-6 text-sm flex items-center gap-3 animate-fade-in">
            <div className="w-1.5 h-6 bg-red-400 rounded-full flex-shrink-0"></div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#D6C7A1] ml-1">University Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7ECEB7] pointer-events-none z-10" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@student.gitam.edu"
                className="input-glass input-glass-icon-left"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#D6C7A1] ml-1">Password</label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7ECEB7] pointer-events-none z-10" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`${hintPassword}`}
                className="input-glass input-glass-icon-left input-glass-icon-right"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7ECEB7]/70 hover:text-[#F5EBE0] z-10"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Format Hint */}
            <p className="text-xs text-[#D6C7A1]/80 ml-1">
              Default password format: <span className="font-mono text-[#7ECEB7] font-semibold">{hintPassword}</span>
            </p>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4 text-[#F5EBE0]"
            disabled={loading || !email || !password}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#F5EBE0]" /> : "Login & Access Portal"}
            {!loading && <ArrowRight className="w-5 h-5 text-[#F5EBE0]" />}
          </button>
        </form>
      </div>
    </div>
  );
}
