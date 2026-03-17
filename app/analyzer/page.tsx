"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useRef, useEffect } from "react";
import AuthGuard from "@/lib/AuthGuard";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { redactionSummary } from "@/lib/ScrubPII";
import AnalysisDashboard, { AnalysisResult } from "@/components/AnalysisDashboard";
import { saveReport } from "@/lib/Reports";

interface ParsedPDF {
  text: string;
  numPages: number;
  numRenderedPages: number;
  info: Record<string, string>;
  fileName: string;
  fileSize: number;
}

// Pipeline step shown in the loading UI
type Step = "parsing" | "scrubbing" | "analyzing" | "done";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PDFParserInner() {
  const { user } = useAuth();
  const handleSignOut = async () => { await signOut(auth); };

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("parsing");
  const [parsed, setParsed] = useState<ParsedPDF | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [redactionNote, setRedactionNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "analysis" | "meta">("analysis");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setParsed(null);
    setAnalysis(null);
    setRedactionNote("");

    try {
      // ── Single route handles parse → scrub → analyze ──
      setStep("parsing");
      const formData = new FormData();
      formData.append("file", file);

      // Optimistically advance the step indicators as time passes
      const scrubTimer = setTimeout(() => setStep("scrubbing"), 800);
      const analyzeTimer = setTimeout(() => setStep("analyzing"), 1400);

      const res = await fetch("/api/process-statement", { method: "POST", body: formData });

      clearTimeout(scrubTimer);
      clearTimeout(analyzeTimer);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");

      // Shape matches what the old separate routes returned
      setParsed({
        text: data.text,
        numPages: data.numPages,
        numRenderedPages: data.numRenderedPages,
        info: data.info,
        fileName: data.fileName,
        fileSize: data.fileSize,
      });
      setAnalysis(data.analysis);
      if (data.redactions) {
        setRedactionNote(redactionSummary(data.redactions));
      }
      setStep("done");

      // Auto-save report to Firestore (non-blocking — don't fail the UI if this errors)
      if (data.analysis && auth.currentUser) {
        saveReport(auth.currentUser.uid, {
          fileName: data.fileName,
          fileSize: data.fileSize,
          numPages: data.numPages,
          transactionsFound: data.analysis._transactionsFound ?? data.analysis.transactions?.length ?? 0,
          extractionMode: data.analysis._extractionMode ?? "unknown",
          result: data.analysis,
        }).catch((e) => console.warn("Failed to save report:", e));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const copyText = () => {
    if (parsed?.text) {
      navigator.clipboard.writeText(parsed.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setParsed(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const wordCount = parsed?.text?.split(/\s+/).filter(Boolean).length ?? 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f4f5f8]" style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif" }}>

      {/* Top nav */}
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
            <span className="text-white text-sm font-semibold border-b-2 border-white pb-0.5 cursor-pointer">Analyzer</span>
            <a href="/reports" className="text-blue-200 text-sm font-medium hover:text-white transition-colors">Reports</a>
            <button onClick={handleSignOut} className="text-blue-200 text-xs font-medium hover:text-white transition-colors">Sign out</button>
            <div className="w-8 h-8 rounded-full bg-[#005999] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {user?.displayName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <div className="bg-white border-b border-[#e0e3e8]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6b7280] uppercase tracking-widest font-semibold mb-1">Document Processing</p>
            <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">Statement Analyzer</h1>
            <p className="text-sm text-[#6b7280] mt-1">Upload a PDF bank or credit card statement to extract and analyze your spending data.</p>
          </div>
          {parsed && (
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#0077C5] text-[#0077C5] text-sm font-semibold hover:bg-[#e8f4fc] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Upload New File
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-[#fff4f4] border border-[#f87171] rounded-xl px-5 py-4">
            <svg className="w-5 h-5 text-[#dc2626] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-[#991b1b] font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-[#dc2626] hover:text-[#991b1b]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Upload zone */}
        {!parsed && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`bg-white rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
              ${isDragging ? "border-[#0077C5] bg-[#e8f4fc]" : "border-[#c8d3df] hover:border-[#0077C5] hover:bg-[#f7fbff]"}`}
          >
            <div className="py-16 flex flex-col items-center gap-5">
              {isLoading ? (
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#e0e3e8] border-t-[#0077C5] animate-spin" />
                  <div className="flex flex-col gap-2.5 w-64">
                    {([
                      { id: "parsing",   label: "Extracting text from PDF" },
                      { id: "scrubbing", label: "Scrubbing PII from text" },
                      { id: "analyzing", label: "Sending to analysis backend" },
                    ] as const).map(({ id, label }) => {
                      const order = ["parsing", "scrubbing", "analyzing"];
                      const currentIdx = order.indexOf(step);
                      const thisIdx = order.indexOf(id);
                      const isDone = thisIdx < currentIdx;
                      const isActive = thisIdx === currentIdx;
                      return (
                        <div key={id} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isDone ? "bg-[#22c55e]" : isActive ? "bg-[#0077C5] animate-pulse" : "bg-[#e0e3e8]"
                          }`}>
                            {isDone
                              ? <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                              : <div className={`w-2 h-2 rounded-full ${isActive ? "bg-white" : "bg-[#c8d3df]"}`} />
                            }
                          </div>
                          <span className={`text-sm transition-all ${isDone ? "text-[#22c55e] font-medium" : isActive ? "text-[#0077C5] font-semibold" : "text-[#9ca3af]"}`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-[#e8f4fc] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#0077C5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[#1a1a2e] font-semibold text-base">Drag & drop your PDF here</p>
                    <p className="text-sm text-[#6b7280] mt-1">
                      or <span className="text-[#0077C5] font-semibold underline underline-offset-2">browse to upload</span>
                    </p>
                    <p className="text-xs text-[#9ca3af] mt-3">PDF files only · Max 50 MB</p>
                  </div>
                  <div className="flex items-center gap-6 pt-1">
                    {["Bank Statements", "Credit Card Bills", "Invoices"].map((label) => (
                      <span key={label} className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                        <svg className="w-3.5 h-3.5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {/* Results */}
        {parsed && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Pages Parsed", value: parsed.numPages, color: "text-[#0077C5]", bg: "bg-[#e8f4fc]", emoji: "📄" },
                { label: "Words Extracted", value: wordCount.toLocaleString(), color: "text-[#6b21a8]", bg: "bg-[#f3e8ff]", emoji: "📝" },
                { label: "Characters", value: (parsed.text?.length ?? 0).toLocaleString(), color: "text-[#0d9488]", bg: "bg-[#ccfbf1]", emoji: "🔤" },
              ].map(({ label, value, color, bg, emoji }) => (
                <div key={label} className="bg-white rounded-2xl border border-[#e0e3e8] px-6 py-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{label}</span>
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center text-base`}>{emoji}</div>
                  </div>
                  <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* File pill */}
            <div className="flex items-center gap-3 bg-white rounded-xl border border-[#e0e3e8] px-5 py-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#fee2e2] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#dc2626]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a2e] truncate">{parsed.fileName}</p>
                <p className="text-xs text-[#6b7280]">{formatFileSize(parsed.fileSize)} · {parsed.numPages} page{parsed.numPages !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#dcfce7] px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                <span className="text-xs font-semibold text-[#15803d]">Parsed successfully</span>
              </div>
            </div>

            {/* PII redaction notice */}
            {redactionNote && (
              <div className="flex items-start gap-3 bg-[#fffbeb] border border-[#fcd34d] rounded-xl px-5 py-3.5">
                <svg className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <div>
                  <p className="text-xs font-bold text-[#92400e] uppercase tracking-wide mb-0.5">PII Scrubbed Before Sending</p>
                  <p className="text-xs text-[#92400e]">{redactionNote}</p>
                </div>
              </div>
            )}

            {/* Tab card */}
            <div className="bg-white rounded-2xl border border-[#e0e3e8] shadow-sm overflow-hidden">
              <div className="flex border-b border-[#e0e3e8] px-2 pt-2 bg-[#f9fafb]">
                {(["analysis", "text", "meta"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all mr-1
                      ${activeTab === tab
                        ? "bg-white border border-b-white border-[#e0e3e8] text-[#0077C5] -mb-px shadow-sm"
                        : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-white/60"
                      }`}
                  >
                    {tab === "analysis" ? "Analysis" : tab === "text" ? "Extracted Text" : "Metadata"}
                  </button>
                ))}
                {activeTab === "text" && (
                  <div className="ml-auto flex items-center pr-3 pb-1">
                    <button onClick={copyText}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${copied ? "bg-[#dcfce7] text-[#15803d]" : "bg-white border border-[#e0e3e8] text-[#6b7280] hover:border-[#0077C5] hover:text-[#0077C5]"}`}
                    >
                      {copied ? (
                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Copied!</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>Copy Text</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Analysis tab */}
              {activeTab === "analysis" && (
                <div className="p-6">
                  {(analysis?.transactions?.length ?? 0) > 0 ? (
                    <AnalysisDashboard
                      result={analysis!}
                      cached={analysis!._cached}
                      cacheAgeSeconds={analysis!._cacheAgeSeconds}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#f4f5f8] flex items-center justify-center text-2xl">📊</div>
                      <p className="text-sm text-[#6b7280]">
                        {analysis
                          ? "Backend returned no transactions. Check your parser regex."
                          : "Analysis results will appear here once your backend responds."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "text" && (
                <div className="p-6">
                  <pre className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap break-words overflow-auto max-h-[480px] bg-[#f9fafb] rounded-xl p-5 border border-[#e0e3e8]"
                    style={{ fontFamily: "'Courier New', monospace", scrollbarColor: "#c8d3df transparent" }}>
                    {parsed.text || <span className="text-[#9ca3af] italic">No text content found. This may be a scanned or image-based PDF.</span>}
                  </pre>
                </div>
              )}

              {activeTab === "meta" && (
                <div className="p-6">
                  <div className="rounded-xl border border-[#e0e3e8] overflow-hidden">
                    {[
                      ["File Name", parsed.fileName],
                      ["File Size", formatFileSize(parsed.fileSize)],
                      ["Total Pages", String(parsed.numPages)],
                      ["Rendered Pages", String(parsed.numRenderedPages)],
                      ...(parsed.info ? Object.entries(parsed.info).filter(([, v]) => v && String(v).trim()) : []),
                    ].map(([key, value], i) => (
                      <div key={key} className={`flex items-start gap-6 px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"} ${i !== 0 ? "border-t border-[#e0e3e8]" : ""}`}>
                        <span className="text-[#6b7280] font-medium w-40 flex-shrink-0">{key}</span>
                        <span className="text-[#1a1a2e] break-all">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!parsed && !isLoading && (
          <p className="text-center text-xs text-[#9ca3af]">
            🔒 Your files are processed securely and never stored on our servers.
          </p>
        )}
      </div>
    </div>
  );
}

export default function PDFParser() {
  return (
    <AuthGuard>
      <PDFParserInner />
    </AuthGuard>
  );
}