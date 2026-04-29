"use client";
import { useState, useEffect, useId } from "react";
import TopBar from "@/components/TopBar";

const ORANGE = "#c96442";
const KEY = "nora_skills";

type Category = "Frontend" | "Backend" | "Database" | "DevOps" | "Language" | "Soft Skill" | "Other";
type Level = "Beginner" | "Intermediate" | "Advanced" | "Expert";

interface Skill {
  id: string;
  name: string;
  category: Category;
  level: Level;
  progress: number;
  notes: string;
  updatedAt: number;
}

const CATS: { key: Category; icon: string; color: string; bg: string }[] = [
  { key: "Frontend",   icon: "🎨", color: "#6366f1", bg: "#eef2ff" },
  { key: "Backend",    icon: "⚙️", color: "#f59e0b", bg: "#fffbeb" },
  { key: "Database",   icon: "🗄️", color: "#0ea5e9", bg: "#f0f9ff" },
  { key: "DevOps",     icon: "🚀", color: "#10b981", bg: "#f0fdf4" },
  { key: "Language",   icon: "🌐", color: "#8b5cf6", bg: "#faf5ff" },
  { key: "Soft Skill", icon: "💬", color: "#ec4899", bg: "#fdf2f8" },
  { key: "Other",      icon: "📌", color: "#64748b", bg: "#f8fafc" },
];

const LEVELS: Level[] = ["Beginner", "Intermediate", "Advanced", "Expert"];

const LEVEL_COLOR: Record<Level, string> = {
  Beginner:     "#94a3b8",
  Intermediate: "#f59e0b",
  Advanced:     "#10b981",
  Expert:       ORANGE,
};

const DEFAULT_SKILLS: Skill[] = [
  { id: "s1", name: "Next.js",      category: "Frontend", level: "Advanced",     progress: 80, notes: "App Router, Server Components", updatedAt: Date.now() },
  { id: "s2", name: "TypeScript",   category: "Frontend", level: "Intermediate", progress: 65, notes: "Generics ยังต้องเพิ่มค่ะ",       updatedAt: Date.now() },
  { id: "s3", name: "Tailwind CSS", category: "Frontend", level: "Advanced",     progress: 85, notes: "",                              updatedAt: Date.now() },
  { id: "s4", name: "Node.js",      category: "Backend",  level: "Intermediate", progress: 55, notes: "Middleware, error handling",    updatedAt: Date.now() },
  { id: "s5", name: "SQL / PostgreSQL", category: "Database", level: "Intermediate", progress: 50, notes: "JOIN, subquery ต้องฝึกเพิ่ม", updatedAt: Date.now() },
  { id: "s6", name: "Prisma",       category: "Database", level: "Intermediate", progress: 60, notes: "",                              updatedAt: Date.now() },
  { id: "s7", name: "Git",          category: "DevOps",   level: "Advanced",     progress: 75, notes: "",                              updatedAt: Date.now() },
  { id: "s8", name: "English",      category: "Language", level: "Intermediate", progress: 55, notes: "Technical writing OK แต่ speaking ต้องฝึก", updatedAt: Date.now() },
];

function catCfg(cat: Category) { return CATS.find((c) => c.key === cat) ?? CATS[6]; }

const EMPTY: Omit<Skill, "id" | "updatedAt"> = {
  name: "", category: "Frontend", level: "Beginner", progress: 0, notes: "",
};

export default function SkillsPage() {
  const uid = useId();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filterCat, setFilterCat] = useState<Category | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Skill, "id" | "updatedAt">>(EMPTY);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      setSkills(raw ? JSON.parse(raw) : DEFAULT_SKILLS);
    } catch { setSkills(DEFAULT_SKILLS); }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(KEY, JSON.stringify(skills));
  }, [skills, mounted]);

  function openAdd() { setForm(EMPTY); setEditId(null); setShowForm(true); }
  function openEdit(s: Skill) {
    setForm({ name: s.name, category: s.category, level: s.level, progress: s.progress, notes: s.notes });
    setEditId(s.id); setShowForm(true);
  }
  function save() {
    if (!form.name.trim()) return;
    if (editId) {
      setSkills((p) => p.map((s) => s.id === editId ? { ...s, ...form, updatedAt: Date.now() } : s));
    } else {
      setSkills((p) => [...p, { id: `${uid}-${Date.now()}`, ...form, updatedAt: Date.now() }]);
    }
    setShowForm(false);
  }
  function remove(id: string) { setSkills((p) => p.filter((s) => s.id !== id)); }
  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm((p) => ({ ...p, [k]: v })); }

  const visible = filterCat === "All" ? skills : skills.filter((s) => s.category === filterCat);
  const avgProgress = skills.length ? Math.round(skills.reduce((a, s) => a + s.progress, 0) / skills.length) : 0;

  if (!mounted) return null;

  return (
    <>
      <TopBar />
      <main className="px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Skills Tracker</h1>
            <p className="text-sm text-slate-400 mt-0.5">track ทักษะและ progress ของ Safe ค่ะ</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}>
            + เพิ่ม Skill
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <p className="text-xs text-slate-400 mb-1">ทักษะทั้งหมด</p>
            <p className="text-3xl font-black" style={{ color: ORANGE }}>{skills.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <p className="text-xs text-slate-400 mb-1">Expert</p>
            <p className="text-3xl font-black text-amber-500">{skills.filter((s) => s.level === "Expert").length}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <p className="text-xs text-slate-400 mb-1">Advanced</p>
            <p className="text-3xl font-black text-emerald-500">{skills.filter((s) => s.level === "Advanced").length}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <p className="text-xs text-slate-400 mb-1">Avg Progress</p>
            <p className="text-3xl font-black text-slate-700">{avgProgress}%</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Overall Skill Progress</span><span style={{ color: ORANGE }}>{avgProgress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${avgProgress}%`, background: `linear-gradient(to right, ${ORANGE}, #e8855e)` }} />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {(["All", ...CATS.map((c) => c.key)] as (Category | "All")[]).map((cat) => {
            const cfg = cat === "All" ? null : catCfg(cat);
            const count = cat === "All" ? skills.length : skills.filter((s) => s.category === cat).length;
            return (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                style={filterCat === cat
                  ? { background: cfg?.color ?? ORANGE, color: "#fff" }
                  : { background: "#f1f5f9", color: "#64748b" }}>
                {cfg?.icon ?? "🔍"} {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Skill grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((skill) => {
            const cfg = catCfg(skill.category);
            return (
              <div key={skill.id} className="rounded-2xl bg-white p-5 shadow-sm group relative"
                style={{ border: "1px solid #ede9e3" }}>
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl flex items-center justify-center text-lg" style={{ background: cfg.bg }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{skill.name}</p>
                      <p className="text-[10px] font-semibold" style={{ color: cfg.color }}>{skill.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(skill)}
                      className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                      </svg>
                    </button>
                    <button onClick={() => remove(skill.id)}
                      className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Level */}
                <div className="flex gap-1.5 mb-3">
                  {LEVELS.map((lv) => (
                    <div key={lv} className="flex-1 h-1.5 rounded-full transition-all"
                      style={{ background: LEVELS.indexOf(lv) <= LEVELS.indexOf(skill.level) ? LEVEL_COLOR[skill.level] : "#f1f5f9" }} />
                  ))}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] font-semibold mb-1">
                    <span style={{ color: LEVEL_COLOR[skill.level] }}>{skill.level}</span>
                    <span className="text-slate-500">{skill.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${skill.progress}%`, background: LEVEL_COLOR[skill.level] }} />
                  </div>
                </div>

                {skill.notes && (
                  <p className="text-xs text-slate-400 leading-snug border-t pt-2.5" style={{ borderColor: "#f0ece6" }}>
                    {skill.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <p className="text-2xl mb-2">📚</p>
            <p className="text-sm text-slate-400">ยังไม่มี skill ใน category นี้ค่ะ</p>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowForm(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" style={{ border: "1px solid #e2e8f0" }}
              onClick={(e) => e.stopPropagation()}>
              <p className="text-base font-bold text-slate-800 mb-5">{editId ? "แก้ไข Skill" : "เพิ่ม Skill ใหม่"}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">ชื่อ Skill *</label>
                  <input value={form.name} onChange={(e) => setF("name", e.target.value)}
                    autoFocus
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none"
                    style={{ border: "1px solid #e2e8f0" }} placeholder="เช่น React, Python, Docker" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
                    <select value={form.category} onChange={(e) => setF("category", e.target.value as Category)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none"
                      style={{ border: "1px solid #e2e8f0" }}>
                      {CATS.map((c) => <option key={c.key} value={c.key}>{c.icon} {c.key}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Level</label>
                    <select value={form.level} onChange={(e) => setF("level", e.target.value as Level)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none"
                      style={{ border: "1px solid #e2e8f0" }}>
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Progress: <span className="font-bold text-slate-800">{form.progress}%</span>
                  </label>
                  <input type="range" min={0} max={100} step={5} value={form.progress}
                    onChange={(e) => setF("progress", Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: LEVEL_COLOR[form.level] }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notes (ถ้ามี)</label>
                  <input value={form.notes} onChange={(e) => setF("notes", e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none"
                    style={{ border: "1px solid #e2e8f0" }} placeholder="สิ่งที่ต้องฝึกเพิ่ม, resource ที่ใช้..." />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-slate-600"
                  style={{ border: "1px solid #e2e8f0" }}>ยกเลิก</button>
                <button onClick={save} disabled={!form.name.trim()}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}>
                  {editId ? "บันทึก" : "เพิ่มเลยค่ะ"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
