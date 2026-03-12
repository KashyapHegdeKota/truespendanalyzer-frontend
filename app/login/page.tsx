"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, provider, signInWithPopup } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      "auth/user-not-found": "No account found with that email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
      "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    };
    return map[code] ?? "Something went wrong. Please try again.";
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/analyzer");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push("/analyzer");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif" }}
    >
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden bg-[#0077C5]">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#005999]/60 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md">
            <svg viewBox="0 0 20 20" className="w-5 h-5 fill-[#0077C5]">
              <rect x="2" y="2" width="6" height="16" rx="1.5" />
              <rect x="12" y="7" width="6" height="11" rx="1.5" />
            </svg>
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">TrueSpend</span>
        </div>

        {/* Illustration */}
        <div className="relative flex-1 flex items-center justify-center py-12">
          <div className="relative w-full max-w-sm">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Total Spending</p>
                  <p className="text-white text-3xl font-extrabold mt-1">$4,821<span className="text-white/50 text-lg font-normal">.36</span></p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-16 mb-4">
                {[40, 65, 35, 80, 55, 90, 60, 75, 45, 85, 50, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm" style={{
                    height: `${h}%`,
                    backgroundColor: i === 10 ? "rgba(34,197,94,0.9)" : "rgba(255,255,255,0.25)"
                  }} />
                ))}
              </div>
              <div className="border-t border-white/15 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span className="text-white/70 text-xs">vs last month</span>
                </div>
                <span className="text-[#86efac] text-sm font-bold">↓ 12% less spent</span>
              </div>
            </div>
            <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2.5 border border-[#e0e3e8]">
              <div className="w-7 h-7 rounded-lg bg-[#dbeafe] flex items-center justify-center text-sm">🍔</div>
              <div>
                <p className="text-[10px] text-[#6b7280] font-medium">Food & Dining</p>
                <p className="text-xs font-bold text-[#1a1a2e]">$842.50</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2.5 border border-[#e0e3e8]">
              <div className="w-7 h-7 rounded-lg bg-[#dcfce7] flex items-center justify-center text-sm">🏠</div>
              <div>
                <p className="text-[10px] text-[#6b7280] font-medium">Housing</p>
                <p className="text-xs font-bold text-[#1a1a2e]">$1,650.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-[#fbbf24]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/80 text-sm leading-relaxed italic">
              "TrueSpend showed me I was spending $340/month on subscriptions I forgot about. Game changer."
            </p>
            <div className="flex items-center gap-2.5 mt-3">
              <div className="w-7 h-7 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-[10px] font-bold">AM</div>
              <div>
                <p className="text-white text-xs font-semibold">Anjali M.</p>
                <p className="text-white/50 text-[10px]">Verified user</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#0077C5] flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
                <rect x="2" y="2" width="6" height="16" rx="1.5" />
                <rect x="12" y="7" width="6" height="11" rx="1.5" />
              </svg>
            </div>
            <span className="text-[#1a1a2e] font-bold text-xl">TrueSpend</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-[#6b7280] mt-2 text-sm">
              {mode === "signin"
                ? "Sign in to continue analyzing your spending."
                : "Start understanding your finances in seconds."}
            </p>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e0e3e8] rounded-xl text-sm font-semibold text-[#374151] hover:bg-[#f4f5f8] hover:border-[#c8d3df] transition-all active:scale-95 disabled:opacity-50 mb-5"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-[#c8d3df] border-t-[#0077C5] rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e0e3e8]" />
            <span className="text-xs text-[#9ca3af] font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-[#e0e3e8]" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-[#fff4f4] border border-[#fca5a5] rounded-xl px-4 py-3 mb-5">
              <svg className="w-4 h-4 text-[#dc2626] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-[#dc2626] font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email address</label>
              <div className={`relative flex items-center border rounded-xl transition-all duration-200 ${focusedField === "email" ? "border-[#0077C5] ring-[3px] ring-[#0077C5]/15" : "border-[#e0e3e8]"}`}>
                <div className="absolute left-3.5 text-[#9ca3af]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#1a1a2e] placeholder-[#9ca3af] bg-transparent outline-none"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-[#374151]">Password</label>
                {mode === "signin" && (
                  <button type="button" className="text-xs text-[#0077C5] font-semibold hover:text-[#005999] transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className={`relative flex items-center border rounded-xl transition-all duration-200 ${focusedField === "password" ? "border-[#0077C5] ring-[3px] ring-[#0077C5]/15" : "border-[#e0e3e8]"}`}>
                <div className="absolute left-3.5 text-[#9ca3af]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-[#1a1a2e] placeholder-[#9ca3af] bg-transparent outline-none"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 text-[#9ca3af] hover:text-[#6b7280] transition-colors" tabIndex={-1}>
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-[#9ca3af] mt-1.5 ml-1">Must be at least 6 characters.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || googleLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0077C5] hover:bg-[#005999] disabled:bg-[#93c5e8] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                mode === "signin" ? "Sign in to TrueSpend" : "Create account"
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-[#6b7280] mt-7">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="text-[#0077C5] font-bold hover:text-[#005999] transition-colors"
            >
              {mode === "signin" ? "Create one free" : "Sign in"}
            </button>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-10 pt-8 border-t border-[#f4f5f8]">
            {[{ icon: "🔒", label: "256-bit SSL" }, { icon: "🛡️", label: "SOC 2 Type II" }, { icon: "✅", label: "GDPR compliant" }].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[#9ca3af]">
                <span className="text-sm">{icon}</span>
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}