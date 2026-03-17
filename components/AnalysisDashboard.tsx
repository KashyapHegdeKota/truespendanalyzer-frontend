"use client";

import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface AnalysisResult {
  transactions: Transaction[];
  summary: Record<string, number>;
  total_in: number;
  total_out: number;
  insights: string[];
}

interface Props {
  result: AnalysisResult;
  cached?: boolean;
  cacheAgeSeconds?: number;
}

// ── Category colours ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining":         "#0077C5",
  "Transport":             "#22c55e",
  "Housing & Utilities":   "#f59e0b",
  "Healthcare":            "#ef4444",
  "Shopping":              "#8b5cf6",
  "Entertainment":         "#ec4899",
  "Travel":                "#06b6d4",
  "Income":                "#10b981",
  "Savings & Investments": "#6366f1",
  "Subscriptions":         "#f97316",
  "ATM & Cash":            "#84cc16",
  "Transfers":             "#64748b",
  "Other":                 "#94a3b8",
};

const categoryColor = (cat: string) => CATEGORY_COLORS[cat] ?? "#94a3b8";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Math.abs(n));

// ── Summary cards ─────────────────────────────────────────────────────────────

function SummaryCards({ result }: { result: AnalysisResult }) {
  const net = result.total_in - result.total_out;
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Money In",  value: fmt(result.total_in),  color: "text-[#22c55e]", bg: "bg-[#dcfce7]", sign: "↑" },
        { label: "Money Out", value: fmt(result.total_out), color: "text-[#ef4444]", bg: "bg-[#fee2e2]", sign: "↓" },
        { label: "Net",       value: fmt(net),              color: net >= 0 ? "text-[#0077C5]" : "text-[#ef4444]", bg: "bg-[#e8f4fc]", sign: net >= 0 ? "+" : "−" },
      ].map(({ label, value, color, bg, sign }) => (
        <div key={label} className="bg-white rounded-2xl border border-[#e0e3e8] px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{label}</span>
            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center font-bold text-sm ${color}`}>{sign}</div>
          </div>
          <p className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────

function DonutChart({ summary }: { summary: Record<string, number> }) {
  const data = Object.entries(summary)
    .filter(([, v]) => v < 0)
    .map(([name, value]) => ({ name, value: Math.abs(value) }))
    .sort((a, b) => b.value - a.value);

  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e8] shadow-sm p-6">
      <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-4">Spending by Category</h3>
      <div className="flex items-center gap-6">
        <div className="w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, i) => setActive(data[i].name)}
                onMouseLeave={() => setActive(null)}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={categoryColor(entry.name)}
                    opacity={active === null || active === entry.name ? 1 : 0.35}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => fmt(Number(v))}
                contentStyle={{ borderRadius: 10, border: "1px solid #e0e3e8", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto max-h-40 pr-1">
          {data.map(({ name, value }) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 cursor-default"
              onMouseEnter={() => setActive(name)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColor(name) }} />
                <span className={`text-xs truncate transition-colors ${active === name ? "font-semibold text-[#1a1a2e]" : "text-[#6b7280]"}`}>{name}</span>
              </div>
              <span className="text-xs font-semibold text-[#1a1a2e] flex-shrink-0">{fmt(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Cash flow bar chart ───────────────────────────────────────────────────────

function CashFlowBar({ transactions }: { transactions: Transaction[] }) {
  const byMonth = useMemo(() => {
    const map: Record<string, { month: string; in: number; out: number }> = {};
    for (const tx of transactions) {
      // Try to extract a readable month label from various date formats
      let month = tx.date;
      const namedMonth = tx.date.match(
        /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/i
      );
      if (namedMonth) month = namedMonth[0].slice(0, 3);
      if (!map[month]) map[month] = { month, in: 0, out: 0 };
      if (tx.amount >= 0) map[month].in  += tx.amount;
      else                map[month].out += Math.abs(tx.amount);
    }
    return Object.values(map);
  }, [transactions]);

  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e8] shadow-sm p-6">
      <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-4">Money In vs Out</h3>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={byMonth} barCategoryGap="28%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            formatter={(v, name) => [fmt(Number(v)), name === "in" ? "Money In" : "Money Out"]}
            contentStyle={{ borderRadius: 10, border: "1px solid #e0e3e8", fontSize: 12 }}
          />
          <Bar dataKey="in"  name="in"  fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="out" name="out" fill="#0077C5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-5 mt-2 justify-center">
        {[["#22c55e", "Money In"], ["#0077C5", "Money Out"]].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-[#6b7280]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Transaction table ─────────────────────────────────────────────────────────

type SortKey = "date" | "description" | "amount" | "category";
type SortDir = "asc" | "desc";

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const [sortKey, setSortKey]   = useState<SortKey>("date");
  const [sortDir, setSortDir]   = useState<SortDir>("asc");
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(transactions.map((t) => t.category))).sort()],
    [transactions]
  );

  const rows = useMemo(() => {
    let r = [...transactions];
    if (search) r = r.filter(
      (t) =>
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
    );
    if (catFilter !== "All") r = r.filter((t) => t.category === catFilter);
    r.sort((a, b) => {
      const cmp = sortKey === "amount"
        ? a.amount - b.amount
        : String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [transactions, sortKey, sortDir, search, catFilter]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const SortArrow = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? <span className="ml-1 text-[#0077C5]">{sortDir === "asc" ? "↑" : "↓"}</span>
      : <span className="ml-1 text-[#d1d5db]">↕</span>;

  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e8] shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e0e3e8] flex-wrap">
        <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider flex-shrink-0">Transactions</h3>
        <div className="relative flex-1 min-w-40">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#e0e3e8] rounded-lg outline-none focus:border-[#0077C5] focus:ring-2 focus:ring-[#0077C5]/10"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="text-xs border border-[#e0e3e8] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0077C5] text-[#374151]"
        >
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span className="text-xs text-[#9ca3af] ml-auto flex-shrink-0">{rows.length} of {transactions.length}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#e0e3e8]">
              {(["date", "description", "category", "amount"] as SortKey[]).map((k) => (
                <th
                  key={k}
                  onClick={() => toggleSort(k)}
                  className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-[#0077C5] transition-colors ${sortKey === k ? "text-[#0077C5]" : "text-[#6b7280]"} ${k === "amount" ? "text-right" : ""}`}
                >
                  {k.charAt(0).toUpperCase() + k.slice(1)}<SortArrow k={k} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((tx, i) => (
              <tr
                key={i}
                className={`border-b border-[#f4f5f8] hover:bg-[#f7fbff] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}
              >
                <td className="px-5 py-3 text-xs text-[#6b7280] whitespace-nowrap">{tx.date}</td>
                <td className="px-5 py-3 text-sm text-[#1a1a2e] max-w-[200px] truncate">{tx.description}</td>
                <td className="px-5 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: categoryColor(tx.category) + "20", color: categoryColor(tx.category) }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColor(tx.category) }} />
                    {tx.category}
                  </span>
                </td>
                <td className={`px-5 py-3 text-sm font-semibold tabular-nums text-right ${tx.amount >= 0 ? "text-[#22c55e]" : "text-[#1a1a2e]"}`}>
                  {tx.amount >= 0 ? "+" : ""}{fmt(tx.amount)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-[#9ca3af]">
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Insights ──────────────────────────────────────────────────────────────────

function Insights({ insights }: { insights: string[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e8] shadow-sm p-6">
      <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-4">✦ AI Insights</h3>
      <div className="space-y-3">
        {insights.map((text, i) => (
          <div key={i} className="flex items-start gap-3 bg-[#f0f7ff] border border-[#bfdbfe] rounded-xl px-4 py-3">
            <div className="w-5 h-5 rounded-full bg-[#0077C5] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-sm text-[#1e40af] leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AnalysisDashboard({ result, cached, cacheAgeSeconds }: Props) {
  const [view, setView] = useState<"charts" | "table">("charts");

  return (
    <div className="space-y-5">

      {/* Cache notice */}
      {cached && (
        <div className="flex items-center gap-2 bg-[#fffbeb] border border-[#fcd34d] rounded-xl px-4 py-2.5">
          <svg className="w-4 h-4 text-[#d97706] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-medium text-[#92400e]">
            Cached result from {Math.round((cacheAgeSeconds ?? 0) / 60)} min ago — identical statement already analyzed.
          </p>
        </div>
      )}

      {/* Summary row */}
      <SummaryCards result={result} />

      {/* Insights */}
      {result.insights?.length > 0 && <Insights insights={result.insights} />}

      {/* View toggle */}
      <div className="flex gap-2">
        {(["charts", "table"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setView(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              view === t
                ? "bg-[#0077C5] text-white shadow-sm"
                : "bg-white border border-[#e0e3e8] text-[#6b7280] hover:border-[#0077C5] hover:text-[#0077C5]"
            }`}
          >
            {t === "charts" ? "📊 Charts" : "📋 Transactions"}
          </button>
        ))}
      </div>

      {/* Charts */}
      {view === "charts" && (
        <div className="grid md:grid-cols-2 gap-5">
          <DonutChart summary={result.summary} />
          <CashFlowBar transactions={result.transactions} />
        </div>
      )}

      {/* Table */}
      {view === "table" && <TransactionTable transactions={result.transactions} />}
    </div>
  );
}