"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, provider, signInWithPopup } from "@/lib/firebase";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
      "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    };
    return map[code] ?? "Something went wrong. Please try again.";
  };

  const passwordStrength = (pw: string) => {
    if (!pw) return null;
    if (pw.length < 6) return { level: 0, label: "Too short", color: "bg-red-400" };
    if (pw.length < 8) return { level: 1, label: "Weak", color: "bg-orange-400" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score === 0) return { level: 1, label: "Weak", color: "bg-orange-400" };
    if (score === 1) return { level: 2, label: "Fair", color: "bg-yellow-400" };
    if (score === 2) return { level: 3, label: "Good", color: "bg-blue-400" };
    return { level: 4, label: "Strong", color: "bg-[#22c55e]" };
  };

  const strength = passwordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!email) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter a password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setError("");
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName.trim() });
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

  const inputClass = (field: string) =>
    `relative flex items-center border rounded-xl transition-all duration-200 ${
      focusedField === field
        ? "border-[#0077C5] ring-[3px] ring-[#0077C5]/15"
        : "border-[#e0e3e8]"
    }`;

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif" }}
    >
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0077C5] to-[#005490]">
        {/* Texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#003d6b]/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-[#22c55e]/20 rounded-full blur-2xl" />

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

        {/* Central content */}
        <div className="relative flex-1 flex flex-col justify-center gap-8 py-10">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              Take control of your<br />finances today.
            </h2>
            <p className="text-white/70 mt-3 text-sm leading-relaxed max-w-xs">
              Join thousands of people who use TrueSpend to understand and improve their spending habits.
            </p>
          </div>

          {/* Feature checklist */}
          <ul className="space-y-4">
            {[
              { icon: "📄", text: "Upload any PDF bank or credit card statement" },
              { icon: "📊", text: "Instant spending breakdowns by category" },
              { icon: "🔒", text: "End-to-end encrypted — your data stays private" },
              { icon: "⚡", text: "Results in under 3 seconds" },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                  {icon}
                </div>
                <span className="text-white/80 text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {["#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white/30 flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ backgroundColor: c }}>
                    {["SR", "KJ", "MP", "LT"][i]}
                  </div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-[#fbbf24]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-white/75 text-xs leading-relaxed italic">
              "Finally an app that just works. Uploaded my Chase statement and had a full breakdown in seconds."
            </p>
            <p className="text-white/50 text-[10px] mt-2 font-medium">— Sarah R., joined 2 weeks ago</p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[["2M+", "Statements"], ["99.8%", "Accuracy"], ["Free", "To start"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-white font-extrabold text-xl">{val}</p>
              <p className="text-white/50 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-16 bg-white overflow-y-auto py-10">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#0077C5] flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
                <rect x="2" y="2" width="6" height="16" rx="1.5" />
                <rect x="12" y="7" width="6" height="11" rx="1.5" />
              </svg>
            </div>
            <span className="text-[#1a1a2e] font-bold text-xl">TrueSpend</span>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight">Create your account</h1>
            <p className="text-[#6b7280] mt-2 text-sm">Free forever. No credit card required.</p>
          </div>

          {/* Google */}
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
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e0e3e8]" />
            <span className="text-xs text-[#9ca3af] font-medium">or sign up with email</span>
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

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Full name</label>
              <div className={inputClass("name")}>
                <div className="absolute left-3.5 text-[#9ca3af]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Jane Smith"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#1a1a2e] placeholder-[#9ca3af] bg-transparent outline-none"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email address</label>
              <div className={inputClass("email")}>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
              <div className={inputClass("password")}>
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
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-[#1a1a2e] placeholder-[#9ca3af] bg-transparent outline-none"
                  autoComplete="new-password"
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

              {/* Password strength meter */}
              {password && strength && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < strength.level ? strength.color : "bg-[#e0e3e8]"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${strength.level <= 1 ? "text-red-500" : strength.level === 2 ? "text-yellow-500" : strength.level === 3 ? "text-blue-500" : "text-[#22c55e]"}`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Confirm password</label>
              <div className={`${inputClass("confirm")} ${confirmPassword && confirmPassword !== password ? "border-red-400 ring-[3px] ring-red-400/15" : confirmPassword && confirmPassword === password ? "border-[#22c55e] ring-[3px] ring-[#22c55e]/15" : ""}`}>
                <div className="absolute left-3.5 text-[#9ca3af]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-[#1a1a2e] placeholder-[#9ca3af] bg-transparent outline-none"
                  autoComplete="new-password"
                />
                <div className="absolute right-3.5 flex items-center gap-2">
                  {confirmPassword && (
                    confirmPassword === password
                      ? <svg className="w-4 h-4 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      : <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="text-[#9ca3af] hover:text-[#6b7280] transition-colors" tabIndex={-1}>
                    {showConfirm ? (
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
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-[#9ca3af] leading-relaxed pt-1">
              By creating an account you agree to our{" "}
              <span className="text-[#0077C5] font-semibold cursor-pointer hover:underline">Terms of Service</span>
              {" "}and{" "}
              <span className="text-[#0077C5] font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={isLoading || googleLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0077C5] hover:bg-[#005999] disabled:bg-[#93c5e8] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating your account…
                </>
              ) : (
                "Create free account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b7280] mt-6">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-[#0077C5] font-bold hover:text-[#005999] transition-colors"
            >
              Sign in
            </button>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-8 pt-7 border-t border-[#f4f5f8]">
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