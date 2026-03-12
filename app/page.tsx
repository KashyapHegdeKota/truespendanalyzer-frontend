"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = ["Products", "Pricing", "Resources", "Support"];

const FEATURES = [
  {
    icon: "document",
    title: "Instant PDF Parsing",
    desc: "Upload any bank or credit card statement and get clean, structured text extracted in seconds.",
    color: "bg-[#dbeafe] text-[#1d4ed8]",
  },
  {
    icon: "chart",
    title: "Spending Insights",
    desc: "Automatically categorize transactions and surface patterns in your monthly cash flow.",
    color: "bg-[#dcfce7] text-[#15803d]",
  },
  {
    icon: "shield",
    title: "Secure & Private",
    desc: "Your documents are processed in-memory and never stored. Bank-level security, always.",
    color: "bg-[#fef9c3] text-[#a16207]",
  },
];

const STATS = [
  { value: "2M+", label: "Statements analyzed" },
  { value: "99.8%", label: "Parse accuracy" },
  { value: "< 3s", label: "Average processing time" },
  { value: "256-bit", label: "Encryption standard" },
];

function FeatureIcon({ type }: { type: string }) {
  if (type === "document") return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
  if (type === "chart") return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#0077C5]/20 via-[#00a3ff]/10 to-transparent blur-2xl" />
      <svg viewBox="0 0 480 360" className="relative w-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="440" height="320" rx="20" fill="white" stroke="#e0e3e8" strokeWidth="1.5" />
        <rect x="20" y="20" width="440" height="56" rx="20" fill="#0077C5" />
        <rect x="20" y="56" width="440" height="20" fill="#0077C5" />
        <circle cx="52" cy="48" r="6" fill="white" fillOpacity="0.3" />
        <circle cx="72" cy="48" r="6" fill="white" fillOpacity="0.3" />
        <circle cx="92" cy="48" r="6" fill="white" fillOpacity="0.3" />
        <text x="140" y="53" fill="white" fontSize="11" fontWeight="700" fontFamily="sans-serif">TrueSpend</text>
        <rect x="340" y="39" width="60" height="18" rx="9" fill="white" fillOpacity="0.2" />
        <text x="354" y="52" fill="white" fontSize="9" fontFamily="sans-serif">Analyze</text>
        <rect x="36" y="92" width="120" height="64" rx="12" fill="#f0f7ff" stroke="#dbeafe" strokeWidth="1" />
        <text x="52" y="114" fill="#6b7280" fontSize="8" fontFamily="sans-serif" fontWeight="600">PAGES</text>
        <text x="52" y="136" fill="#0077C5" fontSize="22" fontFamily="sans-serif" fontWeight="800">12</text>
        <rect x="172" y="92" width="120" height="64" rx="12" fill="#f0fdf4" stroke="#dcfce7" strokeWidth="1" />
        <text x="188" y="114" fill="#6b7280" fontSize="8" fontFamily="sans-serif" fontWeight="600">WORDS</text>
        <text x="188" y="136" fill="#15803d" fontSize="22" fontFamily="sans-serif" fontWeight="800">4,821</text>
        <rect x="308" y="92" width="132" height="64" rx="12" fill="#fefce8" stroke="#fef9c3" strokeWidth="1" />
        <text x="324" y="114" fill="#6b7280" fontSize="8" fontFamily="sans-serif" fontWeight="600">CHARS</text>
        <text x="324" y="136" fill="#a16207" fontSize="22" fontFamily="sans-serif" fontWeight="800">27.4k</text>
        <rect x="36" y="172" width="260" height="140" rx="12" fill="#f9fafb" stroke="#e0e3e8" strokeWidth="1" />
        <text x="52" y="193" fill="#374151" fontSize="9" fontFamily="sans-serif" fontWeight="700">Monthly Spending</text>
        {[
          [56, 60, "#0077C5"], [88, 80, "#0077C5"], [120, 45, "#0077C5"],
          [152, 90, "#0077C5"], [184, 55, "#0077C5"], [216, 100, "#22c55e"], [248, 70, "#0077C5"]
        ].map(([x, h, color], i) => (
          <g key={i}>
            <rect x={x} y={282 - (h as number)} width="22" height={h} rx="4" fill={color as string} fillOpacity="0.15" />
            <rect x={x} y={282 - (h as number)} width="22" height="4" rx="2" fill={color as string} />
          </g>
        ))}
        <line x1="52" y1="283" x2="276" y2="283" stroke="#e0e3e8" strokeWidth="1" />
        <rect x="312" y="172" width="128" height="140" rx="12" fill="#f9fafb" stroke="#e0e3e8" strokeWidth="1" />
        <text x="328" y="193" fill="#374151" fontSize="9" fontFamily="sans-serif" fontWeight="700">Categories</text>
        <circle cx="376" cy="262" r="36" fill="none" stroke="#e0e3e8" strokeWidth="12" />
        <circle cx="376" cy="262" r="36" fill="none" stroke="#0077C5" strokeWidth="12" strokeDasharray="80 146" strokeDashoffset="25" strokeLinecap="round" />
        <circle cx="376" cy="262" r="36" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="50 176" strokeDashoffset="-55" strokeLinecap="round" />
        <circle cx="376" cy="262" r="36" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="30 196" strokeDashoffset="-105" strokeLinecap="round" />
        <text x="376" y="258" fill="#1a1a2e" fontSize="11" fontFamily="sans-serif" fontWeight="800" textAnchor="middle">64%</text>
        <text x="376" y="270" fill="#6b7280" fontSize="7" fontFamily="sans-serif" textAnchor="middle">Food</text>
      </svg>
      <div className="absolute -top-3 -right-3 bg-[#22c55e] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5" style={{ animation: "bounce 2s infinite" }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Parsed!
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white border border-[#e0e3e8] rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center text-base">📄</div>
        <div>
          <p className="text-[10px] font-semibold text-[#1a1a2e]">statement_jan.pdf</p>
          <p className="text-[9px] text-[#6b7280]">Processing complete</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif" }}>

      {/* Sticky nav */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md border-b border-[#e0e3e8]" : "bg-white/80 backdrop-blur-md"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0077C5] flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
                <rect x="2" y="2" width="6" height="16" rx="1.5" />
                <rect x="12" y="7" width="6" height="11" rx="1.5" />
              </svg>
            </div>
            <span className="text-[#1a1a2e] font-bold text-xl tracking-tight">TrueSpend</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <span key={l} className="text-sm font-medium text-[#374151] hover:text-[#0077C5] cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-semibold text-[#0077C5] hover:text-[#005999] transition-colors">Sign in</button>
            <button
              onClick={() => router.push("/analyzer")}
              className="bg-[#0077C5] hover:bg-[#005999] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-white to-[#f4f5f8] pt-20 pb-28">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#0077C5 1px, transparent 1px), linear-gradient(90deg, #0077C5 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0077C5]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#22c55e]/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 bg-[#dbeafe] text-[#1d4ed8] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-pulse" />
              AI-powered spending analysis
            </div>

            <h1 className="text-5xl font-extrabold text-[#1a1a2e] leading-[1.1] tracking-tight">
              Know exactly where{" "}
              <span className="text-[#0077C5] relative inline-block">
                your money goes
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" preserveAspectRatio="none">
                  <path d="M0 6 Q75 1 150 5 Q225 9 300 4" stroke="#0077C5" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />
                </svg>
              </span>
            </h1>

            <p className="text-lg text-[#4b5563] leading-relaxed max-w-md">
              Upload your PDF bank or credit card statement and TrueSpend instantly extracts, categorizes, and visualizes every transaction — no manual entry, no spreadsheets.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => router.push("/analyzer")}
                className="flex items-center gap-2 bg-[#0077C5] hover:bg-[#005999] active:scale-95 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
              >
                Analyze my statement
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <button
                onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm font-semibold text-[#374151] hover:text-[#0077C5] transition-colors flex items-center gap-1.5"
              >
                See how it works
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {["#0077C5", "#22c55e", "#f59e0b", "#8b5cf6"].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: c }}>
                    {["JK", "AM", "SR", "LT"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6b7280]">
                <span className="font-semibold text-[#1a1a2e]">2,000+</span> people analyzed their spending this week
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="bg-[#0077C5]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
              <p className="text-sm text-blue-200 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featuresRef} className="py-24 bg-[#f4f5f8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#0077C5] uppercase tracking-widest mb-3">Why TrueSpend</p>
            <h2 className="text-4xl font-extrabold text-[#1a1a2e] tracking-tight">Everything you need to understand your spending</h2>
            <p className="text-[#6b7280] mt-4 max-w-xl mx-auto text-base">From raw PDF to clear financial picture in under 5 seconds.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-[#e0e3e8] p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <FeatureIcon type={icon} />
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">{title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#0077C5] uppercase tracking-widest mb-3">Simple as 1-2-3</p>
            <h2 className="text-4xl font-extrabold text-[#1a1a2e] tracking-tight">How it works</h2>
          </div>
          <div className="relative">
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-[#0077C5] via-[#22c55e] to-[#f59e0b] hidden md:block" />
            <div className="grid md:grid-cols-3 gap-10 relative">
              {[
                { step: "01", label: "Upload your PDF", detail: "Drag and drop any bank or credit card statement PDF onto the analyzer.", color: "bg-[#0077C5]" },
                { step: "02", label: "We extract the data", detail: "Our parser reads every line — transactions, dates, amounts, and merchant names.", color: "bg-[#22c55e]" },
                { step: "03", label: "See your insights", detail: "Get a clear breakdown of spending by category, week, or merchant.", color: "bg-[#f59e0b]" },
              ].map(({ step, label, detail, color }) => (
                <div key={step} className="flex flex-col items-center text-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${color} text-white font-extrabold text-xl flex items-center justify-center shadow-lg z-10`}>{step}</div>
                  <h3 className="text-base font-bold text-[#1a1a2e]">{label}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-gradient-to-r from-[#005999] to-[#0077C5] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Ready to take control of your finances?</h2>
          <p className="text-blue-100 text-base">Upload your first statement in seconds — no account required.</p>
          <button
            onClick={() => router.push("/analyzer")}
            className="inline-flex items-center gap-2 bg-white text-[#0077C5] font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-blue-50 active:scale-95 transition-all text-base"
          >
            Start analyzing for free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1a2e] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0077C5] flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-white">
                <rect x="2" y="2" width="6" height="16" rx="1.5" />
                <rect x="12" y="7" width="6" height="11" rx="1.5" />
              </svg>
            </div>
            <span className="text-white font-bold text-base">TrueSpend</span>
          </div>
          <p className="text-[#6b7280] text-xs">© 2026 TrueSpend. Built for better financial clarity.</p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <span key={l} className="text-xs text-[#6b7280] hover:text-white cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}