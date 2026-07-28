"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Loader2, ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        // Login Flow (No OTP needed for returning users)
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to log in");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Signup Flow (Requires OTP)
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to sign up");
        } else {
          setStep("otp");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-400 text-sm">
            University Campus Life Course Registration Portal
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md mb-6 text-sm flex items-center gap-2">
            <div className="w-1 h-full bg-red-500 rounded-full"></div>
            {error}
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="input-glass pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass pl-10"
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading || !email || !password}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === "login" ? "Sign In" : "Create Account")}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
                className="text-sm text-blue-400 hover:underline"
              >
                {mode === "login" 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-300">
                We sent a 6-digit code to verify your email <br/>
                <span className="font-semibold text-white">{email}</span>
              </p>
              <button 
                type="button" 
                onClick={() => { setStep("credentials"); setOtp(""); setError(""); }}
                className="text-blue-400 text-xs mt-2 hover:underline"
              >
                Go back
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">One-Time Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="input-glass pl-10 tracking-[0.5em] font-mono text-center"
                  disabled={loading}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading || otp.length < 6}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Complete Signup"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
