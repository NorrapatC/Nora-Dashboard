"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PIPELINE_STAGES } from "@/lib/pipeline";

type FeedbackType = "achievement" | "suggestion" | "warning" | "note";

interface FeedbackItem {
  id: number;
  agent: string;
  message: string;
  type: FeedbackType;
  timestamp: string;
}

const TYPE_META: Record<FeedbackType, { card: string; badge: string; icon: string }> = {
  achievement: { card: "border-l-4 border-l-emerald-400", badge: "bg-emerald-100 text-emerald-700", icon: "🏆" },
  suggestion:  { card: "border-l-4 border-l-blue-400",   badge: "bg-blue-100 text-blue-700",       icon: "💡" },
  warning:     { card: "border-l-4 border-l-amber-400",  badge: "bg-amber-100 text-amber-700",     icon: "⚠️" },
  note:        { card: "border-l-4 border-l-slate-300",  badge: "bg-slate-100 text-slate-600",     icon: "📝" },
};

const AGENTS = PIPELINE_STAGES.map((s) => s.agent.name);
const STORAGE_KEY = "nora_feedback_v1";

export default function FeedbackPanel() {
  const { t } = useLanguage();

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, mounted]);
  const [filter, setFilter] = useState<FeedbackType | "all">("all");
  const [form, setForm] = useState<{ agent: string; message: string; type: FeedbackType }>({
    agent: "Nora", message: "", type: "note",
  });

  function addItem() {
    if (!form.message.trim()) return;
    setItems([{ id: Date.now(), ...form, timestamp: t.tsNow }, ...items]);
    setForm({ agent: "Nora", message: "", type: "note" });
    setShowForm(false);
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((f) => f.id !== id));
  }

  const filtered = filter === "all" ? items : items.filter((f) => f.type === filter);

  const typeLabel: Record<FeedbackType, string> = {
    achievement: t.achievement,
    suggestion: t.suggestion,
    warning: t.warning,
    note: t.note,
  };

  const filterCounts: Record<string, number> = {
    all: items.length,
    achievement: items.filter((f) => f.type === "achievement").length,
    suggestion: items.filter((f) => f.type === "suggestion").length,
    warning: items.filter((f) => f.type === "warning").length,
    note: items.filter((f) => f.type === "note").length,
  };

  const filterLabels: { key: FeedbackType | "all"; label: string }[] = [
    { key: "all", label: t.all },
    { key: "achievement", label: t.achievement },
    { key: "suggestion", label: t.suggestion },
    { key: "warning", label: t.warning },
    { key: "note", label: t.note },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{t.teamFeedback}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.achievements(items.filter((f) => f.type === "achievement").length)} · {t.warnings(items.filter((f) => f.type === "warning").length)}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
        >
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t.addFeedback}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-slate-100 px-4 py-2 overflow-x-auto">
        {filterLabels.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === key ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label} ({filterCounts[key]})
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.newFeedback}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.fromAgent}</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                value={form.agent}
                onChange={(e) => setForm({ ...form, agent: e.target.value })}
              >
                {AGENTS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.type}</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as FeedbackType })}
              >
                <option value="achievement">{t.achievement}</option>
                <option value="suggestion">{t.suggestion}</option>
                <option value="warning">{t.warning}</option>
                <option value="note">{t.note}</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t.message} <span className="text-red-400">*</span>
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none transition"
                placeholder={t.messagePlaceholder}
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setShowForm(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">
              {t.cancel}
            </button>
            <button onClick={addItem} className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors">
              {t.add}
            </button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-slate-400">{t.noFeedback}</p>
          </div>
        )}
        {filtered.map((item) => {
          const meta = TYPE_META[item.type];
          return (
            <div key={item.id} className={`group flex items-start justify-between gap-3 px-6 py-4 hover:bg-slate-50/50 transition-colors ${meta.card}`}>
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="mt-0.5 text-base leading-none shrink-0">{meta.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold text-slate-700">{item.agent}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}>
                      {typeLabel[item.type]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.message}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-start gap-1.5">
                <span className="text-xs text-slate-400 whitespace-nowrap">{item.timestamp}</span>
                <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-300 hover:text-red-400 transition-all" title={t.dismiss}>
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
