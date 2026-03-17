import { NextRequest, NextResponse } from "next/server";
import { scrubPII } from "@/lib/ScrubPII";

export async function POST(req: NextRequest) {
  try {
    // ── Step 1: Extract file from FormData ──
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF." }, { status: 400 });
    }

    // ── Step 2: Parse PDF → raw text ──
    const { extractText, getDocumentProxy } = await import("unpdf");
    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text: rawText, totalPages: numPages } = await extractText(pdf, { mergePages: true });

    // ── Step 3: Scrub PII in-process ──
    const { text: cleanText, redactions } = scrubPII(rawText as string);

    // ── Step 4: Forward to external backend (optional — skip if not configured) ──
    const backendUrl = process.env.ANALYZE_API_URL;
    let analysis: Record<string, unknown> | null = null;

    if (backendUrl) {
      const backendRes = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          fileName: file.name,
          fileSize: file.size,
          numPages,
          meta: { redactions },
        }),
      });

      if (!backendRes.ok) {
        const detail = await backendRes.text();
        console.error("Backend error:", backendRes.status, detail);
        // Don't crash — return parse results and surface the backend error
        return NextResponse.json({
          fileName: file.name,
          fileSize: file.size,
          numPages,
          numRenderedPages: numPages,
          info: {},
          text: rawText,
          redactions,
          analysis: null,
          backendError: `Backend returned ${backendRes.status}: ${detail}`,
        });
      }

      const backendData = await backendRes.json();
      // Flatten: backend wraps categorization in { result: {...}, transactions_found, cached }
      // Frontend expects analysis.transactions directly, not analysis.result.transactions
      analysis = {
        ...backendData.result,
        _cached: backendData.cached ?? false,
        _cacheAgeSeconds: backendData.cache_age_seconds ?? 0,
        _extractionMode: backendData.extraction_mode ?? "unknown",
        _transactionsFound: backendData.transactions_found ?? 0,
      };
    }

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      numPages,
      numRenderedPages: numPages,
      info: {},
      text: rawText,
      redactions,
      analysis,
      // Let the UI know backend isn't wired up yet
      backendError: !backendUrl ? "ANALYZE_API_URL is not set — skipping analysis." : undefined,
    });

  } catch (err) {
    console.error("process-statement error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}