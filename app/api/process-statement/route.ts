export const runtime = "nodejs";
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
    // unpdf is edge-runtime safe — no native canvas/DOMMatrix dependencies
    const { extractText, getDocumentProxy } = await import("unpdf");
    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text: rawText, totalPages: numPages } = await extractText(pdf, { mergePages: true });

    const info: Record<string, string> = {};  // unpdf doesn't expose metadata — add if needed

    // ── Step 3: Scrub PII in-process ──
    const { text: cleanText, redactions } = scrubPII(rawText as string);
    console.log("Cleaned text: ", cleanText);
    // ── Step 4: Forward clean text to external backend ──
    const backendUrl = process.env.ANALYZE_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: "ANALYZE_API_URL is not configured." },
        { status: 500 }
      );
    }
    console.log(cleanText)
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
      return NextResponse.json(
        { error: "Analysis backend returned an error.", detail },
        { status: backendRes.status }
      );
    }

    const analysis = await backendRes.json();

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      numPages,
      numRenderedPages: numPages,
      info,
      text: rawText,
      redactions,
      analysis,
    });
  } catch (err) {
    console.error("process-statement error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}