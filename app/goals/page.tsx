"use client";
import { useState, useEffect, useId, useMemo } from "react";
import TopBar from "@/components/TopBar";
import NoraSuggestions from "@/components/NoraSuggestions";

const CLAUDE_ORANGE = "#c96442";

type Priority = "high" | "medium" | "low";

interface Goal {
  id: string;
  text: string;
  priority: Priority;
  done: boolean;
  createdAt: number;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  high:   { label: "High",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",   dot: "bg-red-400" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  dot: "bg-amber-400" },
  low:    { label: "Low",    color: "#94a3b8", bg: "rgba(148,163,184,0.08)", dot: "bg-slate-300" },
};

function dateKey(date: Date) {
  return `nora_goals_${date.toISOString().slice(0, 10)}`;
}

function todayKey() {
  return dateKey(new Date());
}

function todayLabel() {
  return new Date().toLocaleDateString("th-TH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function getHistoryDays(count = 14): { key: string; date: Date; label: string }[] {
  const days = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: dateKey(d),
      date: d,
      label: d.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" }),
    });
  }
  return days;
}

export default function GoalsPage() {
  const uid = useId();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [historyData, setHistoryData] = useState<{ key: string; date: Date; label: string; goals: Goal[] }[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(todayKey());
      if (raw) setGoals(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(todayKey(), JSON.stringify(goals));
  }, [goals, mounted]);

  useEffect(() => {
    if (activeTab !== "history" || !mounted) return;
    const days = getHistoryDays(14);
    const data = days
      .map((day) => {
        try {
          const raw = localStorage.getItem(day.key);
          const goals: Goal[] = raw ? JSON.parse(raw) : [];
          return { ...day, goals };
        } catch {
          return { ...day, goals: [] };
        }
      })
      .filter((d) => d.goals.length > 0);
    setHistoryData(data);
  }, [activeTab, mounted]);

  function addGoal(customText?: string, customPriority?: Priority) {
    const trimmed = (customText ?? text).trim();
    if (!trimmed) return;
    setGoals((prev) => [
      ...prev,
      { id: `${uid}-${Date.now()}`, text: trimmed, priority: customPriority ?? priority, done: false, createdAt: Date.now() },
    ]);
    if (!customText) setText("");
  }

  function toggleDone(id: string) {
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, done: !g.done } : g));
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function clearDone() {
    setGoals((prev) => prev.filter((g) => !g.done));
  }

  const sorted = [
    ...goals.filter((g) => !g.done).sort((a, b) => {
      const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }),
    ...goals.filter((g) => g.done),
  ];

  const doneCount = goals.filter((g) => g.done).length;
  const total = goals.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const addedTexts = useMemo(() => new Set(goals.map((g) => g.text)), [goals]);

  return (
    <>
      <TopBar />

      <main className="px-6 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-sm" style={{ color: "#9a9a94" }}>{mounted ? todayLabel() : ""}</p>

          {/* Tab switcher */}
          <div className="flex gap-1 rounded-xl p-1" style={{ background: "#f0ece6" }}>
            {([["today", "วันนี้"], ["history", "ประวัติ"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="rounded-lg px-4 py-1.5 text-xs font-semibold transition-all"
                style={activeTab === key
                  ? { background: "#fff", color: CLAUDE_ORANGE, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                  : { color: "#94a3b8" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TODAY TAB ── */}
        {activeTab === "today" && (
          <div className="grid gap-6 lg:grid-cols-5">

            {/* Left: My Goals */}
            <div className="lg:col-span-3 space-y-5">

              {total > 0 && (
                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Progress วันนี้</span>
                    <span className="text-xs font-bold" style={{ color: CLAUDE_ORANGE }}>{doneCount}/{total} done</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${CLAUDE_ORANGE}, #e08060)` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{pct}% complete</p>
                </div>
              )}

              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">เพิ่ม Goal เอง</h2>
                <div className="flex gap-2 mb-3">
                  <input
                    className="flex-1 rounded-xl px-3 py-2 text-sm text-slate-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-200 placeholder:text-slate-300"
                    style={{ border: "1px solid #e8e4de" }}
                    placeholder="อยากทำอะไรวันนี้?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGoal()}
                  />
                  <button
                    onClick={() => addGoal()}
                    className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}
                  >
                    Add
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 mr-1">Priority:</span>
                  {(["high", "medium", "low"] as Priority[]).map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    return (
                      <button key={p} onClick={() => setPriority(p)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                        style={priority === p
                          ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }
                          : { background: "transparent", color: "#94a3b8", border: "1px solid #e8e4de" }
                        }>
                        <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #ede9e3" }}>
                <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid #f0ece6" }}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Today&apos;s Goals</h2>
                  {doneCount > 0 && (
                    <button onClick={clearDone} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                      Clear done ({doneCount})
                    </button>
                  )}
                </div>

                {sorted.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-stone-100">
                      <svg className="size-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-400">ยังไม่มี goal วันนี้</p>
                    <p className="text-xs text-slate-300 mt-0.5">เพิ่มเองด้านบน หรือเลือกจาก Nora แนะนำ →</p>
                  </div>
                ) : (
                  <ul className="divide-y" style={{ borderColor: "#f7f4f0" }}>
                    {sorted.map((goal) => {
                      const cfg = PRIORITY_CONFIG[goal.priority];
                      return (
                        <li key={goal.id} className="flex items-center gap-3 px-5 py-3.5 group hover:bg-stone-50/50 transition-colors">
                          <button onClick={() => toggleDone(goal.id)}
                            className="shrink-0 flex size-5 items-center justify-center rounded-full border-2 transition-all"
                            style={goal.done
                              ? { borderColor: CLAUDE_ORANGE, background: CLAUDE_ORANGE }
                              : { borderColor: "#d1ccc4", background: "transparent" }
                            }>
                            {goal.done && (
                              <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span className="flex-1 text-sm transition-all"
                            style={goal.done ? { color: "#b0a99e", textDecoration: "line-through" } : { color: "#1e1c1a" }}>
                            {goal.text}
                          </span>
                          <span className="shrink-0 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          <button onClick={() => removeGoal(goal.id)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-slate-500">
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {total > 0 && (
                  <div className="px-5 py-2.5 flex items-center gap-4" style={{ borderTop: "1px solid #f0ece6", background: "#fafaf9" }}>
                    <span className="text-xs text-slate-400">{total - doneCount} remaining</span>
                    <span className="text-xs" style={{ color: CLAUDE_ORANGE }}>{doneCount} done</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Nora Suggestions */}
            <div className="lg:col-span-2">
              <NoraSuggestions onAdd={(t, p) => addGoal(t, p)} addedTexts={addedTexts} />
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="max-w-2xl space-y-4">
            {!mounted ? null : historyData.length === 0 ? (
              <div className="rounded-2xl bg-white px-5 py-16 text-center shadow-sm" style={{ border: "1px solid #ede9e3" }}>
                <p className="text-2xl mb-3">📭</p>
                <p className="text-sm font-medium text-slate-400">ยังไม่มีประวัติ Goals ค่ะ</p>
                <p className="text-xs text-slate-300 mt-1">Goals จะบันทึกอัตโนมัติทุกวัน ลองมาอีกครั้งพรุ่งนี้นะคะ</p>
              </div>
            ) : (
              historyData.map(({ key, label, goals: dayGoals }) => {
                const done = dayGoals.filter((g) => g.done).length;
                const total = dayGoals.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={key} className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #ede9e3" }}>
                    <div className="px-5 py-3 flex items-center justify-between gap-3"
                      style={{ borderBottom: "1px solid #f0ece6", background: "#fafaf9" }}>
                      <p className="text-sm font-semibold text-slate-700">{label}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{done}/{total} done</span>
                        <div className="w-20 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: pct === 100
                                ? "linear-gradient(90deg, #16a34a, #22c55e)"
                                : `linear-gradient(90deg, ${CLAUDE_ORANGE}, #e08060)`,
                            }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: pct === 100 ? "#16a34a" : CLAUDE_ORANGE }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <ul className="divide-y" style={{ borderColor: "#f7f4f0" }}>
                      {dayGoals.map((g) => {
                        const cfg = PRIORITY_CONFIG[g.priority as Priority] ?? PRIORITY_CONFIG.medium;
                        return (
                          <li key={g.id} className="flex items-center gap-3 px-5 py-3">
                            <span className="shrink-0 flex size-4 items-center justify-center rounded-full"
                              style={g.done
                                ? { background: CLAUDE_ORANGE }
                                : { border: "2px solid #d1ccc4" }}>
                              {g.done && (
                                <svg className="size-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            <span className="flex-1 text-sm"
                              style={g.done ? { color: "#b0a99e", textDecoration: "line-through" } : { color: "#1e1c1a" }}>
                              {g.text}
                            </span>
                            <span className="shrink-0 text-[10px] font-semibold rounded px-2 py-0.5"
                              style={{ background: cfg.bg, color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </>
  );
}
