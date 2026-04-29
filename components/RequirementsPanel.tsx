"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Priority, ReqStatus, Requirement } from "@/lib/notion";

export type { Priority, ReqStatus, Requirement };

interface Props {
  projectName?: string;
  onStatsChange?: (done: number, pending: number) => void;
  onWorkflowTrigger?: (title: string, assignedTo?: string) => void;
}

const PRIORITY_STYLE: Record<Priority, { bg: string; color: string }> = {
  High:   { bg: "rgba(239,68,68,0.08)",   color: "#dc2626" },
  Medium: { bg: "rgba(245,158,11,0.10)",  color: "#b45309" },
  Low:    { bg: "rgba(148,163,184,0.12)", color: "#475569" },
};

const STATUS_STYLE: Record<ReqStatus, { bg: string; color: string; next: ReqStatus }> = {
  Pending:       { bg: "rgba(148,163,184,0.10)", color: "#475569", next: "In Progress" },
  "In Progress": { bg: "rgba(59,130,246,0.10)",  color: "#2563eb", next: "Done" },
  Done:          { bg: "rgba(16,185,129,0.10)",  color: "#059669", next: "Pending" },
  Blocked:       { bg: "rgba(239,68,68,0.10)",   color: "#dc2626", next: "Pending" },
};

const AGENTS = ["Nora","Aria","Nova","Sage","Mia","Luna","Vera","Iris","Zoe","Rex","Lyra"];
const SIZES  = ["S", "M", "L", "XL"];
const ORANGE = "#c96442";

export default function RequirementsPanel({ projectName, onStatsChange, onWorkflowTrigger }: Props) {
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const { t, lang } = useLanguage();

  const [reqs, setReqs]           = useState<Requirement[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [filterStatus, setFilterStatus] = useState<ReqStatus | "All">("All");
  const [filterAgent,  setFilterAgent]  = useState<string>("All");
  const [search,       setSearch]       = useState("");

  const [form, setForm] = useState({
    title: "", description: "", priority: "Medium" as Priority,
    assignedTo: "Nora", size: "M",
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchReqs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const qs = projectName ? `?project=${encodeURIComponent(projectName)}` : "";
      const res = await fetch(`/api/requirements${qs}`);
      if (!res.ok) throw new Error(await res.text());
      const data: Requirement[] = await res.json();
      setReqs(data);
      onStatsChange?.(
        data.filter((r) => r.status === "Done").length,
        data.filter((r) => r.status === "Pending").length,
      );
    } catch {
      if (!silent) setError("ไม่สามารถโหลดข้อมูลจาก Notion ได้ — ตรวจสอบ API key ใน .env.local");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [projectName, onStatsChange]);

  useEffect(() => {
    fetchReqs();
    timerRef.current = setInterval(() => fetchReqs(true), 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchReqs]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  async function addReq() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, project: projectName ?? "" }),
      });
      if (!res.ok) throw new Error();
      onWorkflowTrigger?.(form.title.trim(), form.assignedTo);
      setForm({ title: "", description: "", priority: "Medium", assignedTo: "Nora", size: "M" });
      setShowForm(false);
      await fetchReqs();
    } catch {
      alert("บันทึกไม่สำเร็จ — ลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  async function cycleStatus(req: Requirement) {
    const next = STATUS_STYLE[req.status].next;
    setReqs((prev) => prev.map((r) => r.id === req.id ? { ...r, status: next } : r));
    await fetch(`/api/requirements/${req.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    onStatsChange?.(
      reqs.filter((r) => r.id === req.id ? next === "Done" : r.status === "Done").length,
      reqs.filter((r) => r.id === req.id ? next === "Pending" : r.status === "Pending").length,
    );
  }

  async function removeReq(req: Requirement) {
    setReqs((prev) => prev.filter((r) => r.id !== req.id));
    await fetch(`/api/requirements/${req.id}`, { method: "DELETE" });
    onStatsChange?.(
      reqs.filter((r) => r.id !== req.id && r.status === "Done").length,
      reqs.filter((r) => r.id !== req.id && r.status === "Pending").length,
    );
  }

  // ── Brief ──────────────────────────────────────────────────────────────────

  function generateBrief() {
    const today = new Date().toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const done = reqs.filter((r) => r.status === "Done").length;
    const inProg = reqs.filter((r) => r.status === "In Progress").length;
    const sorted = [...reqs].sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[a.priority] - order[b.priority];
    });
    const rows = sorted
      .map((r, i) => `| ${i + 1} | ${r.title} | ${r.priority} | ${r.assignedTo} | ${r.size} | ${r.status} |`)
      .join("\n");
    return `## 📋 Requirement Brief for Nora\n\n**Project:** ${projectName || "Untitled"}\n**Date:** ${today}\n**Total:** ${reqs.length} — ${done} done · ${inProg} in progress\n\n---\n\n### Requirements\n\n| # | Title | Priority | Assigned | Size | Status |\n|---|-------|----------|----------|------|--------|\n${rows}\n\n---\n_Generated from Nora Dashboard · Synced with Notion_`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generateBrief());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const done    = reqs.filter((r) => r.status === "Done").length;
  const inProg  = reqs.filter((r) => r.status === "In Progress").length;
  const pct     = reqs.length ? Math.round((done / reqs.length) * 100) : 0;

  const filtered = reqs.filter((r) => {
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    if (filterAgent  !== "All" && r.assignedTo !== filterAgent)  return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const STATUS_FILTERS: { key: ReqStatus | "All"; label: string; count: number }[] = [
    { key: "All",         label: "All",         count: reqs.length },
    { key: "Pending",     label: "Pending",     count: reqs.filter((r) => r.status === "Pending").length },
    { key: "In Progress", label: "In Progress", count: reqs.filter((r) => r.status === "In Progress").length },
    { key: "Blocked",     label: "Blocked",     count: reqs.filter((r) => r.status === "Blocked").length },
    { key: "Done",        label: "Done",        count: reqs.filter((r) => r.status === "Done").length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#ede9e3" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f0ece6" }}>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">{t.requirements}</h3>
              {/* Notion badge */}
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(0,0,0,0.06)", color: "#6b7280" }}
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2.5C2 1.67 2.67 1 3.5 1h7.586a1.5 1.5 0 011.06.44l1.414 1.414A1.5 1.5 0 0114 3.914V13.5c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 012 13.5v-11z"/>
                </svg>
                Notion Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.reqDone(done, reqs.length)} · {t.reqInProgress(inProg)} · {t.reqComplete(pct)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReqs()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh from Notion"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setShowBrief(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ background: "rgba(201,100,66,0.1)", color: ORANGE, border: `1px solid rgba(201,100,66,0.25)` }}
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {t.sendToNora}
            </button>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
              style={{ background: ORANGE }}
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t.addRequirement}
            </button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="h-1 bg-slate-100">
          <div className="h-1 transition-all duration-700"
            style={{ background: `linear-gradient(to right, ${ORANGE}, #e8855e)`, width: `${pct}%` }} />
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-col gap-0" style={{ borderBottom: "1px solid #f0ece6", background: "#fafaf9" }}>
          {/* Search */}
          <div className="px-4 pt-2.5 pb-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search requirements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
          {/* Status + Agent filters */}
          <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto">
            <div className="flex gap-1 shrink-0">
              {STATUS_FILTERS.map(({ key, label, count }) => (
                <button key={key} onClick={() => setFilterStatus(key)}
                  className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap"
                  style={filterStatus === key
                    ? { background: ORANGE, color: "#fff" }
                    : { background: "transparent", color: "#94a3b8" }}>
                  {label} {count > 0 && <span className="ml-0.5 opacity-70">({count})</span>}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="rounded-md px-2 py-1 text-xs font-medium border-0 bg-transparent text-slate-500 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="All">All agents</option>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {(filterStatus !== "All" || filterAgent !== "All" || search) && (
              <button
                onClick={() => { setFilterStatus("All"); setFilterAgent("All"); setSearch(""); }}
                className="ml-auto shrink-0 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Add form ── */}
        {showForm && (
          <div className="px-6 py-5 space-y-3 bg-stone-50/80" style={{ borderBottom: "1px solid #f0ece6" }}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.newRequirement}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {t.reqTitle} <span className="text-red-400">*</span>
                </label>
                <input
                  autoFocus
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                  placeholder={t.reqTitlePlaceholder}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addReq()}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">{t.reqDescription}</label>
                <input
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                  placeholder={t.reqDescPlaceholder}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t.priority}</label>
                <select
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                >
                  <option value="High">{t.High}</option>
                  <option value="Medium">{t.Medium}</option>
                  <option value="Low">{t.Low}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t.assignTo}</label>
                <select
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                >
                  {AGENTS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">{t.taskSize}</label>
                <div className="flex gap-2">
                  {SIZES.map((s) => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, size: s })}
                      className="flex-1 rounded-lg border py-2 text-xs font-semibold transition-all"
                      style={form.size === s
                        ? { background: ORANGE, color: "#fff", borderColor: ORANGE }
                        : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-stone-200 transition-colors">
                {t.cancel}
              </button>
              <button onClick={addReq} disabled={saving}
                className="rounded-lg px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                style={{ background: ORANGE }}>
                {saving ? "Saving…" : t.add}
              </button>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="px-6 py-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-4 h-4 rounded-full bg-slate-100 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="px-6 py-6 text-center">
            <p className="text-sm text-red-500 mb-1">⚠ {error}</p>
            <button onClick={() => fetchReqs()} className="text-xs text-slate-400 underline">ลองใหม่</button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && reqs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-stone-100">
              <svg className="size-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">{t.noRequirements}</p>
            <p className="text-xs text-slate-400 mt-0.5">{t.noRequirementsHint}</p>
          </div>
        )}

        {/* ── Empty filtered ── */}
        {!loading && !error && reqs.length > 0 && filtered.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            No requirements match the current filter.
          </div>
        )}

        {/* ── List ── */}
        {!loading && !error && (
          <div className="divide-y" style={{ borderColor: "#f7f4f0" }}>
            {filtered.map((req) => {
              const ps = PRIORITY_STYLE[req.priority];
              const ss = STATUS_STYLE[req.status];
              const isActive = activeReqId === req.id;
              return (
                <div key={req.id}
                  onClick={() => {
                    setActiveReqId(req.id);
                    onWorkflowTrigger?.(req.title, req.assignedTo);
                  }}
                  className="group flex items-start justify-between gap-4 px-6 py-4 transition-colors cursor-pointer"
                  style={{ backgroundColor: isActive ? "#fdf9f7" : undefined }}>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{ backgroundColor: "#c96442" }} />}
                  {/* Left */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Status toggle circle */}
                    <button onClick={(e) => { e.stopPropagation(); cycleStatus(req); }}
                      className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                      style={req.status === "Done"
                        ? { borderColor: "#10b981", backgroundColor: "#10b981" }
                        : req.status === "In Progress"
                        ? { borderColor: "#3b82f6", backgroundColor: "#eff6ff" }
                        : { borderColor: "#cbd5e1", backgroundColor: "transparent" }}>
                      {req.status === "Done" && (
                        <svg className="size-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {req.status === "In Progress" && (
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium leading-snug ${req.status === "Done" ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {req.title}
                        </p>
                        {req.size && (
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-stone-100 text-stone-500">
                            {req.size}
                          </span>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{req.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">{req.assignedTo}</span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: ps.bg, color: ps.color }}>
                      {req.priority}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); cycleStatus(req); }}
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                      style={{ backgroundColor: ss.bg, color: ss.color }}>
                      {req.status}
                    </button>
                    {/* Open in Notion */}
                    {req.notionUrl && (
                      <a href={req.notionUrl} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-slate-600 transition-all"
                        title="Open in Notion">
                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    {/* Delete */}
                    <button onClick={(e) => { e.stopPropagation(); removeReq(req); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-400 transition-all"
                      title={t.remove}>
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Brief Modal ── */}
      {showBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && setShowBrief(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f0ece6" }}>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{t.briefModalTitle}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.briefModalSubtitle}</p>
              </div>
              <button onClick={() => setShowBrief(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {reqs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">{t.noReqsToBrief}</div>
            ) : (
              <>
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed"
                    style={{ background: "#f9f7f4", borderRadius: "8px", padding: "16px", border: "1px solid #ede9e3" }}>
                    {generateBrief()}
                  </pre>
                </div>
                <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: "1px solid #f0ece6" }}>
                  <button onClick={() => setShowBrief(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors">
                    {t.closeBrief}
                  </button>
                  <button onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-all"
                    style={{ background: copied ? "#2d9e6b" : ORANGE }}>
                    {copied ? "✓ " + t.briefCopied : t.copyBrief}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
