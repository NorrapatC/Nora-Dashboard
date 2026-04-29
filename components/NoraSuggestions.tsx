"use client";
import { useState, useEffect } from "react";

const CLAUDE_ORANGE = "#c96442";

type Priority = "high" | "medium" | "low";
type Category = "urgent" | "learning" | "health" | "work" | "freelance";

interface Suggestion {
  text: string;
  category: Category;
  priority: Priority;
  showUntil?: string; // YYYY-MM-DD — hide after this date
  showFrom?: string;  // YYYY-MM-DD — show only from this date
}

interface NoraSuggestionsProps {
  onAdd: (text: string, priority: Priority) => void;
  addedTexts: Set<string>;
}

// ─── Suggestion Pool ────────────────────────────────────────────────────────
const ALL_SUGGESTIONS: Suggestion[] = [
  // Learning — Backend & SQL (top priority path to Senior)
  { text: "ฝึก SQL query 30 นาที — JOIN, GROUP BY, subquery", category: "learning", priority: "high" },
  { text: "เรียน Node.js 30 นาที — error handling, middleware pattern", category: "learning", priority: "high" },
  { text: "อ่าน 1 บทจาก Clean Code หรือ Design Patterns", category: "learning", priority: "medium" },
  { text: "เรียน System Design concept 1 หัวข้อ (caching, load balancing, DB sharding)", category: "learning", priority: "medium" },
  { text: "ทบทวน TypeScript advanced — generics, utility types, discriminated union", category: "learning", priority: "medium" },
  { text: "เรียน 1 Design Pattern: ลองเขียน code ตัวอย่างจริง", category: "learning", priority: "medium" },
  { text: "ดู 1 วิดีโอ System Architecture บน YouTube แล้วจดสรุป", category: "learning", priority: "low" },
  { text: "ลองเขียน OOP class จริง — encapsulation, inheritance, polymorphism", category: "learning", priority: "medium" },

  // Health — Safe ให้ priority health สูงมาก
  { text: "ออกกำลังกาย 1 ชั่วโมง (gym หรือวิ่ง หรือ badminton)", category: "health", priority: "high" },
  { text: "Meditation 5–10 นาที ตอนเช้า ก่อนเริ่มงาน", category: "health", priority: "medium" },
  { text: "Stretching 15 นาที — ช่วยให้ focus ดีขึ้น", category: "health", priority: "low" },
  { text: "ดื่มน้ำครบ 8 แก้ว ตลอดวัน", category: "health", priority: "low" },
  { text: "นอน 7–8 ชั่วโมง — ห้ามดึกเกิน 23:00", category: "health", priority: "medium" },

  // Work — daily good habits
  { text: "Review code ที่เขียนเมื่อวานก่อนเริ่มงานใหม่", category: "work", priority: "medium" },
  { text: "เทส Leave Management — ใส่ Notion token แล้วลองรัน", category: "work", priority: "medium" },
  { text: "Update PROJECTS.md — อัปเดต status project ปัจจุบัน", category: "work", priority: "low" },
  { text: "กำหนด 1 top priority ของวันนี้ก่อนเปิด code", category: "work", priority: "medium" },
  { text: "เขียน commit message ให้ชัดเจนทุก commit", category: "work", priority: "low" },

  // Freelance — long term goal
  { text: "ดู Fastwork — ดูราคาคู่แข่ง Next.js developer", category: "freelance", priority: "medium" },
  { text: "เลือก 3 project ที่ดีที่สุด สำหรับ portfolio", category: "freelance", priority: "medium" },
  { text: "เขียน 1-paragraph bio สำหรับ Freelance profile", category: "freelance", priority: "low" },
  { text: "ปรับ GitHub README ของ 1 project ให้ดูดีขึ้น", category: "freelance", priority: "low" },
];

const CATEGORY_CONFIG: Record<Category, { label: string; color: string; bg: string; icon: string }> = {
  urgent:   { label: "Urgent",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",   icon: "🔴" },
  learning: { label: "Learning", color: "#6366f1", bg: "rgba(99,102,241,0.08)",  icon: "📚" },
  health:   { label: "Health",   color: "#10b981", bg: "rgba(16,185,129,0.08)",  icon: "💪" },
  work:     { label: "Work",     color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  icon: "⚙️" },
  freelance:{ label: "Freelance",color: CLAUDE_ORANGE, bg: "rgba(201,100,66,0.08)", icon: "💼" },
};

// ─── Picking Logic ───────────────────────────────────────────────────────────
function getTodaySuggestions(seed: number): Suggestion[] {
  const today = new Date().toISOString().slice(0, 10);
  const dayOfWeek = new Date().getDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Filter by date range
  const available = ALL_SUGGESTIONS.filter((s) => {
    if (s.showUntil && today > s.showUntil) return false;
    if (s.showFrom && today < s.showFrom) return false;
    return true;
  });

  const urgent   = available.filter((s) => s.category === "urgent");
  const learning = available.filter((s) => s.category === "learning");
  const health   = available.filter((s) => s.category === "health");
  const work     = available.filter((s) => s.category === "work");
  const freelance= available.filter((s) => s.category === "freelance");

  // Deterministic shuffle using seed (changes each time user clicks refresh)
  function pick<T>(arr: T[], n: number, offset = 0): T[] {
    if (arr.length === 0) return [];
    const out: T[] = [];
    const used = new Set<number>();
    for (let i = 0; i < n && out.length < arr.length; i++) {
      const idx = ((seed + offset + i * 7) % arr.length + arr.length) % arr.length;
      if (!used.has(idx)) { used.add(idx); out.push(arr[idx]); }
      else {
        for (let j = 0; j < arr.length; j++) {
          if (!used.has(j)) { used.add(j); out.push(arr[j]); break; }
        }
      }
    }
    return out;
  }

  const result: Suggestion[] = [];

  // Always show urgent items first (up to 2)
  result.push(...pick(urgent, 2, 0));

  // Health: always 1
  result.push(...pick(health, 1, seed));

  // Weekend → more learning/freelance, less work
  if (isWeekend) {
    result.push(...pick(learning, 2, seed + 1));
    result.push(...pick(freelance, 1, seed + 2));
  } else {
    result.push(...pick(learning, 1, seed + 1));
    result.push(...pick(work, 1, seed + 2));
  }

  // Fill to 5 if not enough
  const rest = available.filter((s) => !result.includes(s));
  while (result.length < 5 && rest.length > 0) {
    result.push(rest.splice((seed + result.length) % rest.length, 1)[0]);
  }

  return result.slice(0, 5);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function NoraSuggestions({ onAdd, addedTexts }: NoraSuggestionsProps) {
  const [seed, setSeed] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initial seed = day of year so suggestions are consistent within a day
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    setSeed(dayOfYear);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setSuggestions(getTodaySuggestions(seed));
  }, [seed, mounted]);

  if (!mounted) return null;

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #ede9e3" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid #f0ece6" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}
          >
            N
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">Nora แนะนำ</p>
            <p className="text-[10px] leading-tight" style={{ color: "#9a9a94" }}>
              เลือกเพิ่มเข้า goals ของวันนี้
            </p>
          </div>
        </div>
        <button
          onClick={() => setSeed((s) => s + 13)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:opacity-80"
          style={{ background: "#f5f2ee", color: "#9a9a94", border: "1px solid #e8e4de" }}
          title="สุ่มใหม่"
        >
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          สุ่มใหม่
        </button>
      </div>

      {/* Suggestions list */}
      <ul className="divide-y" style={{ borderColor: "#f7f4f0" }}>
        {suggestions.map((s, i) => {
          const cfg = CATEGORY_CONFIG[s.category];
          const alreadyAdded = addedTexts.has(s.text);
          return (
            <li key={i} className="flex items-center gap-3 px-5 py-3 group hover:bg-stone-50/50 transition-colors">
              {/* Category icon */}
              <span className="text-base shrink-0 w-5 text-center leading-none">{cfg.icon}</span>

              {/* Text */}
              <span className="flex-1 text-sm text-slate-700 leading-snug">{s.text}</span>

              {/* Category badge */}
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold hidden sm:inline-flex"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>

              {/* Add button */}
              <button
                onClick={() => !alreadyAdded && onAdd(s.text, s.priority)}
                disabled={alreadyAdded}
                className="shrink-0 flex size-7 items-center justify-center rounded-full transition-all"
                style={
                  alreadyAdded
                    ? { background: "rgba(45,158,107,0.12)", color: "#2d9e6b", cursor: "default" }
                    : { background: `rgba(201,100,66,0.1)`, color: CLAUDE_ORANGE }
                }
                title={alreadyAdded ? "เพิ่มแล้ว" : "เพิ่มเข้า Goals"}
              >
                {alreadyAdded ? (
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer note */}
      <div className="px-5 py-2.5" style={{ background: "#fafaf9", borderTop: "1px solid #f0ece6" }}>
        <p className="text-[10px]" style={{ color: "#b0a99e" }}>
          Nora รู้จัก context ของ Safe — urgent items จะแสดงตามกำหนดเวลา
        </p>
      </div>
    </div>
  );
}
