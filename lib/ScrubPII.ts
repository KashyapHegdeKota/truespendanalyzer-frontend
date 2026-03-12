/**
 * scrubPII.ts
 *
 * Strips PII from extracted bank statement text before sending to the backend.
 * Dollar/pound amounts and transaction figures are intentionally preserved —
 * they are needed for spend analysis.
 *
 * Patterns covered:
 *  - Card numbers (grouped with separators: 4-4-4-4)
 *  - SSNs (XXX-XX-XXXX with separators)
 *  - Routing / account numbers (when explicitly labelled)
 *  - Bare 8-17 digit ID runs (not inside financial figures)
 *  - Email addresses
 *  - US phone numbers
 *  - Street addresses
 *  - Date of birth (when labelled)
 *  - ZIP codes (standalone, not inside currency amounts)
 *  - Name labels ("Account Holder: Jane Doe")
 */

export interface ScrubResult {
  text: string;
  redactions: Record<string, number>;
}

const PATTERNS: Array<{ name: string; regex: RegExp; replacement: string }> = [
  // Card numbers — require space/dash separator pattern (4-4-4-4 or similar)
  {
    name: "CARD_NUMBER",
    regex: /\b\d{4}(?:[ -]\d{4}){3,}\b/g,
    replacement: "[CARD]",
  },

  // SSN — must have separators (XXX-XX-XXXX or XXX XX XXXX)
  {
    name: "SSN",
    regex: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g,
    replacement: "[SSN]",
  },

  // Routing number — only when explicitly labelled
  {
    name: "ROUTING_NUMBER",
    regex: /(?:routing(?:\s+number)?|ABA)[:\s#]*\d{9}\b/gi,
    replacement: "[ROUTING]",
  },

  // Account number — only when explicitly labelled
  {
    name: "ACCOUNT_NUMBER",
    regex: /(?:account(?:\s+(?:number|no|#))?|acct\.?)[:\s#]*[\dX*]{4,17}\b/gi,
    replacement: "[ACCOUNT]",
  },

  // Bare 8–17 digit runs that are NOT part of a financial figure.
  // Negative lookbehind/lookahead excludes digits adjacent to , . £ $ € ¥
  {
    name: "NUMERIC_ID",
    regex: /(?<![,.\d£$€¥])\b\d{8,17}\b(?![,.\d])/g,
    replacement: "[ID]",
  },

  // Email addresses
  {
    name: "EMAIL",
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: "[EMAIL]",
  },

  // Phone numbers — US formats
  {
    name: "PHONE",
    regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g,
    replacement: "[PHONE]",
  },

  // Date of birth — only when explicitly labelled
  {
    name: "DOB",
    regex: /(?:date of birth|dob|born)[:\s]+\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/gi,
    replacement: "[DOB]",
  },

  // Street addresses — number + street name + type keyword
  {
    name: "ADDRESS",
    regex: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:St(?:reet)?|Ave(?:nue)?|Blvd|Rd|Road|Dr(?:ive)?|Ln|Lane|Ct|Court|Way|Pl(?:ace)?|Pkwy|Hwy)\b\.?/g,
    replacement: "[ADDRESS]",
  },

  // ZIP codes — 5 digits NOT preceded or followed by comma, period, or digit.
  // This prevents £44,079.83 from matching (the "079" won't be 5 digits, but
  // "44079" would without this guard). The lookbehind/lookahead ensures the
  // 5-digit block is truly standalone.
  {
    name: "ZIP",
    regex: /(?<![,.\d])\b\d{5}(?:-\d{4})?\b(?![,.\d])/g,
    replacement: "[ZIP]",
  },

  // Name labels — "Name: John Smith", "Account Holder: Jane Doe"
  {
    name: "NAME",
    regex: /(?:(?:account\s+)?holder|customer|member|name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/g,
    replacement: "[NAME]",
  },
];

/**
 * Scrubs PII from raw extracted PDF text.
 * Returns cleaned text and a count of each redaction type.
 */
export function scrubPII(rawText: string): ScrubResult {
  const redactions: Record<string, number> = {};
  let text = rawText;

  for (const { name, regex, replacement } of PATTERNS) {
    regex.lastIndex = 0;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      redactions[name] = (redactions[name] ?? 0) + matches.length;
      text = text.replace(regex, replacement);
    }
  }

  return { text, redactions };
}

/**
 * Returns a human-readable summary of what was redacted.
 */
export function redactionSummary(redactions: Record<string, number>): string {
  const total = Object.values(redactions).reduce((a, b) => a + b, 0);
  if (total === 0) return "No PII detected.";

  const lines = Object.entries(redactions)
    .map(([k, v]) => `${v}× ${k.replace(/_/g, " ").toLowerCase()}`)
    .join(", ");

  return `${total} item${total !== 1 ? "s" : ""} redacted: ${lines}.`;
}