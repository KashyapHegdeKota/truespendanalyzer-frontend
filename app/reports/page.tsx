"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/lib/AuthGuard";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { getReports, SavedReport } from "@/lib/Reports";
import AnalysisDashboard from "@/components/AnalysisDashboard";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: SavedReport["savedAt"]) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts as unknown as string);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Math.abs(n));

function ReportCard({ report }: { report: SavedReport }) {
  const [expanded, setExpanded] = useState(false);
  const net = (report.totalIn ?? 0) - (report.totalOut ?? 0);

  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e8] shadow-sm overflow-hidden">
      {/* Summary row */}
      <div
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#f7fbff] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* File icon */}
        <div className="w-10 h-10 rounded-xl bg-[#fee2e2] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-[#dc2626]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1a1a2e] truncate">{report.fileName}</p>
          <p className="text-xs text-[#6b7280] mt-0.5">
            {formatDate(report.savedAt)} · {report.transactionsFound} transactions · {formatFileSize(report.fileSize)}
          </p>
        </div>

        {/* Totals */}
        <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">In</p>
            <p className="text-sm font-bold text-[#22c55e]">{fmt(report.totalIn ?? 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">Out</p>
            <p className="text-sm font-bold text-[#ef4444]">{fmt(report.totalOut ?? 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">Net</p>
            <p className={`text-sm font-bold ${net >= 0 ? "text-[#0077C5]" : "text-[#ef4444]"}`}>{fmt(net)}</p>
          </div>
        </div>

        {/* Anomaly badge */}
        {(report.result as Record<string, unknown[]>)?.anomalies?.length > 0 && (
          <div className="flex-shrink-0 flex items-center gap-1 bg-[#fff1f2] border border-[#fecdd3] px-2.5 py-1 rounded-full">
            <span className="text-xs">⚠️</span>
            <span className="text-xs font-semibold text-[#be123c]">
              {(report.result as Record<string, unknown[]>).anomalies.length} anomal{(report.result as Record<string, unknown[]>).anomalies.length === 1 ? "y" : "ies"}
            </span>
          </div>
        )}

        {/* Expand chevron */}
        <svg
          className={`w-5 h-5 text-[#9ca3af] flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Expanded full dashboard */}
      {expanded && (
        <div className="border-t border-[#e0e3e8] bg-[#f4f5f8] p-6">
          <AnalysisDashboard
            result={report.result as Parameters<typeof AnalysisDashboard>[0]["result"]}
            cached={false}
          />
        </div>
      )}
    </div>
  );
}

function ReportsInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getReports(user.uid)
      .then(setReports)
      .catch(() => setError("Failed to load reports."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSignOut = async () => { await signOut(auth); };

  return (
    <div className="min-h-screen bg-[#f4f5f8]" style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif" }}>

      {/* Nav */}
      <nav className="bg-[#0077C5] shadow-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-white flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-[#0077C5]">
                <rect x="2" y="2" width="6" height="16" rx="1.5" />
                <rect x="12" y="7" width="6" height="11" rx="1.5" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TrueSpend</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-blue-200 text-sm font-medium hover:text-white transition-colors">Dashboard</a>
            <a href="/analyzer" className="text-blue-200 text-sm font-medium hover:text-white transition-colors">Analyzer</a>
            <span className="text-white text-sm font-semibold border-b-2 border-white pb-0.5">Reports</span>
            <button onClick={handleSignOut} className="text-blue-200 text-xs font-medium hover:text-white transition-colors">Sign out</button>
            <div className="w-8 h-8 rounded-full bg-[#005999] flex items-center justify-center text-white text-xs font-bold">
              {user?.displayName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <div className="bg-white border-b border-[#e0e3e8]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6b7280] uppercase tracking-widest font-semibold mb-1">History</p>
            <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">Your Reports</h1>
            <p className="text-sm text-[#6b7280] mt-1">
              {loading ? "Loading…" : `${reports.length} statement${reports.length !== 1 ? "s" : ""} analyzed`}
            </p>
          </div>
          <button
            onClick={() => router.push("/analyzer")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077C5] text-white text-sm font-semibold hover:bg-[#005999] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Analysis
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-4">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-[#fff4f4] border border-[#f87171] rounded-xl px-5 py-4">
            <svg className="w-5 h-5 text-[#dc2626] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-[#991b1b] font-medium">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-[#e0e3e8] border-t-[#0077C5] animate-spin" />
              <p className="text-sm text-[#6b7280]">Loading your reports…</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reports.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#e8f4fc] flex items-center justify-center text-3xl">📂</div>
            <div>
              <p className="text-base font-semibold text-[#1a1a2e]">No reports yet</p>
              <p className="text-sm text-[#6b7280] mt-1">Upload a bank statement to generate your first analysis.</p>
            </div>
            <button
              onClick={() => router.push("/analyzer")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077C5] text-white text-sm font-semibold hover:bg-[#005999] transition-colors"
            >
              Analyze a statement
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}

        {/* Report list */}
        {!loading && reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AuthGuard>
      <ReportsInner />
    </AuthGuard>
  );
}