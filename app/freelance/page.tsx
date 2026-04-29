"use client";
import { useState, useEffect, useId } from "react";
import TopBar from "@/components/TopBar";
import dynamic from "next/dynamic";
const TemplateGallery = dynamic(() => import("@/components/TemplateGallery"), { ssr: false });

const CLAUDE_ORANGE = "#c96442";

// ── Types ─────────────────────────────────────────────────────────────────────

type ClientStage = "lead" | "proposed" | "active" | "done" | "paid";

interface ServiceItem {
  id: string;
  name: string;
  desc: string;
  days: string;
  hours: number;
  thb: { min: number; max: number };
  usd: { min: number; max: number };
  tag: string;
  tagColor: string;
}

interface FreelanceClient {
  id: string;
  name: string;
  service: string;
  budgetTHB: number;
  stage: ClientStage;
  notes: string;
  createdAt: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICES: ServiceItem[] = [
  { id: "landing-simple", name: "Landing Page (Simple)",  desc: "1–3 sections, static, responsive",               days: "3–5 วัน",     hours: 24,  thb: { min: 8_000,  max: 15_000 },  usd: { min: 220,  max: 420  }, tag: "Frontend",   tagColor: "#6366f1" },
  { id: "landing-pro",    name: "Landing Page (Pro)",      desc: "Multi-section, animations, contact form",        days: "5–10 วัน",    hours: 48,  thb: { min: 15_000, max: 30_000 },  usd: { min: 420,  max: 840  }, tag: "Frontend",   tagColor: "#6366f1" },
  { id: "webapp-simple",  name: "Web App (CRUD)",          desc: "Auth + CRUD พื้นฐาน (task, booking, etc.)",      days: "2–4 สัปดาห์", hours: 100, thb: { min: 30_000, max: 60_000 },  usd: { min: 840,  max: 1680 }, tag: "Full-stack", tagColor: "#10b981" },
  { id: "dashboard",      name: "Dashboard / Admin Panel", desc: "Data viz, ตาราง, report, role-based access",     days: "2–3 สัปดาห์", hours: 80,  thb: { min: 25_000, max: 50_000 },  usd: { min: 700,  max: 1400 }, tag: "Full-stack", tagColor: "#10b981" },
  { id: "api",            name: "API / Backend Only",      desc: "REST endpoints, auth, business logic",           days: "1–3 สัปดาห์", hours: 60,  thb: { min: 15_000, max: 40_000 },  usd: { min: 420,  max: 1100 }, tag: "Backend",    tagColor: "#f59e0b" },
  { id: "ecommerce",      name: "E-commerce (Simple)",     desc: "Catalog, cart, checkout, order management",      days: "4–6 สัปดาห์", hours: 160, thb: { min: 50_000, max: 100_000 }, usd: { min: 1400, max: 2800 }, tag: "Full-stack", tagColor: "#10b981" },
  { id: "bugfix",         name: "Bug Fix / Feature Add",   desc: "Hourly rate สำหรับ codebase เดิม",               days: "—",           hours: 0,   thb: { min: 600,    max: 800 },     usd: { min: 18,   max: 25   }, tag: "Hourly",     tagColor: "#ec4899" },
  { id: "retainer",       name: "Monthly Maintenance",     desc: "Retainer: updates, bug fix, minor features",     days: "Ongoing",     hours: 0,   thb: { min: 3_000,  max: 8_000 },   usd: { min: 85,   max: 225  }, tag: "/month",     tagColor: "#0ea5e9" },
];

const TIPS = [
  { icon: "🏁", title: "เริ่มจาก network ส่วนตัว",    body: "Client คนแรกมักมาจากคนรู้จัก — ไม่ต้องรอ portfolio สมบูรณ์" },
  { icon: "💰", title: "อย่า underprice ตัวเอง",       body: "ราคาต่ำมาก = client คาดหวังสูง + เหนื่อยฟรี เริ่มที่ ฿650/hr แล้วขึ้นทุก project" },
  { icon: "📄", title: "ต้องมี contract ทุกครั้ง",    body: "ระบุ scope, deliverable, payment milestone และ revision policy ก่อนเริ่ม" },
  { icon: "🎯", title: "เลือก niche ก่อน",             body: "เน้น Next.js + Tailwind dashboard — pitch งานประเภทนี้ก่อนแทนที่จะรับทุกอย่าง" },
  { icon: "🚀", title: "Platforms ที่แนะนำ",           body: "ไทย: Fastwork, Freelance.co.th | ต่างประเทศ: Upwork, Contra — เริ่มไทยก่อน" },
  { icon: "📦", title: "Package ดีกว่า hourly",        body: "เสนอ package (Landing ฿15,000 all-in) — client ตัดสินใจง่ายกว่า ทำงานได้ตรงขึ้น" },
];

const STAGES: ClientStage[] = ["lead", "proposed", "active", "done", "paid"];

const STAGE_CONFIG: Record<ClientStage, { label: string; color: string; bg: string; border: string }> = {
  lead:     { label: "Lead",    color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
  proposed: { label: "Proposed",color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  active:   { label: "Active",  color: "#c96442", bg: "#fdf3ef", border: "#f5d6c8" },
  done:     { label: "Done",    color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
  paid:     { label: "Paid ✓", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

const CLIENTS_KEY       = "nora_freelance_clients";
const MONTHLY_TARGET_KEY = "nora_freelance_monthly_target";
const THB_RATE = 650;
const USD_RATE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString("th-TH"); }

// ── Component ─────────────────────────────────────────────────────────────────

export default function FreelancePage() {
  const uid = useId();
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState<"thb" | "usd">("thb");

  // ── Clients ────────────────────────────────────────────────────────────────
  const [clients, setClients] = useState<FreelanceClient[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", service: "landing-simple", budgetTHB: "", notes: "" });
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // ── Monthly target ─────────────────────────────────────────────────────────
  const [monthlyTarget, setMonthlyTarget] = useState(30_000);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");

  // ── Calculator ────────────────────────────────────────────────────────────
  const [calcHours, setCalcHours] = useState(80);
  const [calcService, setCalcService] = useState("dashboard");

  // ── Proposal generator ────────────────────────────────────────────────────
  const [propClient, setPropClient]   = useState("");
  const [propService, setPropService] = useState("dashboard");
  const [propHours, setPropHours]     = useState(80);
  const [propDeposit, setPropDeposit] = useState<50 | 30>(50);
  const [propCopied, setPropCopied]   = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(CLIENTS_KEY);
      if (raw) setClients(JSON.parse(raw));
    } catch {}
    try {
      const t = localStorage.getItem(MONTHLY_TARGET_KEY);
      if (t) setMonthlyTarget(Number(t));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }, [clients, mounted]);

  // ── Client actions ────────────────────────────────────────────────────────
  function addClient() {
    if (!newClient.name.trim()) return;
    const svc = SERVICES.find((s) => s.id === newClient.service);
    const budget = Number(newClient.budgetTHB) || (svc ? Math.round((svc.thb.min + svc.thb.max) / 2) : 0);
    setClients((prev) => [
      ...prev,
      {
        id: `${uid}-${Date.now()}`,
        name: newClient.name.trim(),
        service: newClient.service,
        budgetTHB: budget,
        stage: "lead",
        notes: newClient.notes.trim(),
        createdAt: Date.now(),
      },
    ]);
    setNewClient({ name: "", service: "landing-simple", budgetTHB: "", notes: "" });
    setShowAdd(false);
  }

  function moveStage(id: string, dir: 1 | -1) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = STAGES.indexOf(c.stage);
        const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, idx + dir))];
        return { ...c, stage: next };
      })
    );
  }

  function removeClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  function saveNote(id: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, notes: noteText } : c)));
    setEditingNote(null);
  }

  function saveTarget() {
    const v = Number(targetDraft.replace(/,/g, ""));
    if (v > 0) {
      setMonthlyTarget(v);
      localStorage.setItem(MONTHLY_TARGET_KEY, String(v));
    }
    setEditingTarget(false);
  }

  // ── Income stats ──────────────────────────────────────────────────────────
  const earned    = clients.filter((c) => c.stage === "paid").reduce((s, c) => s + c.budgetTHB, 0);
  const active    = clients.filter((c) => c.stage === "active").reduce((s, c) => s + c.budgetTHB, 0);
  const proposed  = clients.filter((c) => c.stage === "proposed").reduce((s, c) => s + c.budgetTHB, 0);
  const pipeline  = clients.reduce((s, c) => s + c.budgetTHB, 0);
  const targetPct = monthlyTarget > 0 ? Math.min(100, Math.round((earned / monthlyTarget) * 100)) : 0;

  // ── Calculator ────────────────────────────────────────────────────────────
  const calcSvc     = SERVICES.find((s) => s.id === calcService) ?? SERVICES[3];
  const calcEstimate = calcHours * (currency === "thb" ? THB_RATE : USD_RATE);

  // ── Proposal ──────────────────────────────────────────────────────────────
  const propSvc   = SERVICES.find((s) => s.id === propService) ?? SERVICES[3];
  const propTotal = propHours * THB_RATE;
  const deposit   = Math.round(propTotal * (propDeposit / 100));
  const remaining = propTotal - deposit;

  const proposalText = `สวัสดีครับ คุณ${propClient || "[ชื่อลูกค้า]"}

ขอบคุณที่สนใจบริการของผมนะครับ 🙏

📋 Project: ${propSvc.name}
🔧 รายละเอียด: ${propSvc.desc}
⏱ ระยะเวลาโดยประมาณ: ${propSvc.days}

💰 ราคา: ฿${fmt(propTotal)}
   (${propHours} ชั่วโมง × ฿${THB_RATE}/ชม.)

📌 เงื่อนไขการชำระเงิน:
• ${propDeposit}% แรก — ฿${fmt(deposit)} (ก่อนเริ่มงาน)
• ${100 - propDeposit}% หลัง — ฿${fmt(remaining)} (หลัง approve งาน)

✅ รวมใน package:
• Source code ทั้งหมด (ส่งทาง GitHub หรือ ZIP)
• Deploy ขึ้น production
• Revisions ${propDeposit === 50 ? "2" : "3"} รอบ
• Support 7 วัน หลัง deliver

📝 ขั้นตอนถัดไป:
1. Confirm scope + วันเริ่มงาน
2. ชำระ deposit ฿${fmt(deposit)}
3. เริ่ม development ทันที

รบกวน reply กลับเพื่อ confirm ด้วยนะครับ ขอบคุณครับ 🙏

— Safe (norrapat_c)
📧 chanapolnorrapat@gmail.com`;

  function copyProposal() {
    navigator.clipboard.writeText(proposalText).then(() => {
      setPropCopied(true);
      setTimeout(() => setPropCopied(false), 2000);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <TopBar />
      <main className="px-6 py-6 space-y-8 max-w-5xl">

        {/* ─── Hero ─── */}
        <div
          className="rounded-2xl px-6 py-5 text-white shadow-md overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1a1a19 0%, #2d1f18 100%)", border: "1px solid #3a2a20" }}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: CLAUDE_ORANGE }}>
                Freelance Rate Guide — 2026
              </p>
              <h2 className="text-xl font-bold text-white">Safe · Mid-level Developer</h2>
              <p className="text-sm mt-1" style={{ color: "#9a9a94" }}>Next.js · TypeScript · Tailwind · Node.js</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Supabase", "Prisma"].map((s) => (
                  <span key={s} className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                    style={{ background: "rgba(255,255,255,0.07)", color: "#c8c4bc", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl px-5 py-4 text-center shrink-0"
              style={{ background: "rgba(201,100,66,0.15)", border: "1px solid rgba(201,100,66,0.3)" }}>
              <p className="text-xs text-slate-400 mb-1">Base Hourly Rate</p>
              <p className="text-3xl font-bold" style={{ color: CLAUDE_ORANGE }}>฿{THB_RATE}</p>
              <p className="text-xs text-slate-500 mt-0.5">/ hr · ${USD_RATE} international</p>
            </div>
          </div>
        </div>

        {/* ─── Income Summary ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Income Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">เป้าหมายเดือนนี้:</span>
              {editingTarget ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">฿</span>
                  <input
                    autoFocus
                    className="w-28 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                    style={{ border: `1px solid ${CLAUDE_ORANGE}`, background: "#fff" }}
                    placeholder="30000"
                    value={targetDraft}
                    onChange={(e) => setTargetDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveTarget(); if (e.key === "Escape") setEditingTarget(false); }}
                  />
                  <button onClick={saveTarget}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-white"
                    style={{ background: CLAUDE_ORANGE }}>
                    บันทึก
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setTargetDraft(String(monthlyTarget)); setEditingTarget(true); }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                  style={{ background: "#fdf3ef", color: CLAUDE_ORANGE, border: "1px solid #f5d6c8" }}>
                  ฿{fmt(monthlyTarget)} ✏️
                </button>
              )}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "รับแล้ว (Paid)",   value: earned,   color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "กำลังทำ (Active)", value: active,   color: CLAUDE_ORANGE, bg: "#fdf3ef", border: "#f5d6c8" },
              { label: "รอ approve",        value: proposed, color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
              { label: "Pipeline รวม",      value: pipeline, color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl px-4 py-3.5 shadow-sm"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <p className="text-[10px] font-medium text-slate-500 mb-1">{s.label}</p>
                <p className="text-xl font-bold" style={{ color: s.color }}>฿{fmt(s.value)}</p>
              </div>
            ))}
          </div>

          {/* Monthly target progress */}
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Progress ต่อเป้าหมายเดือนนี้</span>
              <span className="text-xs font-bold" style={{ color: CLAUDE_ORANGE }}>
                ฿{fmt(earned)} / ฿{fmt(monthlyTarget)} ({targetPct}%)
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${targetPct}%`,
                  background: targetPct >= 100
                    ? "linear-gradient(90deg, #16a34a, #22c55e)"
                    : "linear-gradient(90deg, #c96442, #e8855e)",
                }} />
            </div>
            {targetPct >= 100 && (
              <p className="text-xs font-semibold mt-1.5" style={{ color: "#16a34a" }}>🎉 ถึงเป้าหมายแล้ว!</p>
            )}
          </div>
        </section>

        {/* ─── Template Gallery ─── */}
        <TemplateGallery />

        {/* ─── Client Pipeline Tracker ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Client Pipeline</h2>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}>
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              เพิ่ม Client
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm mb-4" style={{ border: `1px solid ${CLAUDE_ORANGE}40` }}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">ข้อมูล Client ใหม่</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">ชื่อ Client / บริษัท *</label>
                  <input
                    autoFocus
                    className="w-full rounded-xl px-3 py-2 text-sm text-slate-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    style={{ border: "1px solid #e8e4de" }}
                    placeholder="เช่น คุณสมชาย หรือ Startup XYZ"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addClient()}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">ประเภทงาน</label>
                  <select
                    className="w-full rounded-xl px-3 py-2 text-sm text-slate-800 bg-stone-50 focus:outline-none"
                    style={{ border: "1px solid #e8e4de" }}
                    value={newClient.service}
                    onChange={(e) => {
                      const svc = SERVICES.find((s) => s.id === e.target.value);
                      setNewClient({
                        ...newClient,
                        service: e.target.value,
                        budgetTHB: svc ? String(Math.round((svc.thb.min + svc.thb.max) / 2)) : newClient.budgetTHB,
                      });
                    }}>
                    {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Budget (THB) — ปรับได้</label>
                  <input
                    type="number"
                    className="w-full rounded-xl px-3 py-2 text-sm text-slate-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    style={{ border: "1px solid #e8e4de" }}
                    placeholder="เช่น 25000"
                    value={newClient.budgetTHB}
                    onChange={(e) => setNewClient({ ...newClient, budgetTHB: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Notes (optional)</label>
                  <input
                    className="w-full rounded-xl px-3 py-2 text-sm text-slate-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    style={{ border: "1px solid #e8e4de" }}
                    placeholder="เช่น ติดต่อผ่าน Line, รอ quote"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={addClient}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}>
                  เพิ่ม Client
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-500 bg-stone-100 transition-all">
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Stage summary pills */}
          {clients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {STAGES.map((stage) => {
                const count = clients.filter((c) => c.stage === stage).length;
                const cfg = STAGE_CONFIG[stage];
                return (
                  <span key={stage} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {cfg.label} <span className="opacity-70">({count})</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Client list */}
          {clients.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm" style={{ border: "1px solid #ede9e3" }}>
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm font-medium text-slate-400">ยังไม่มี client</p>
              <p className="text-xs text-slate-300 mt-0.5">กด "เพิ่ม Client" เพื่อเริ่ม track งาน</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #ede9e3" }}>
              <div className="divide-y" style={{ borderColor: "#f7f4f0" }}>
                {clients.map((client) => {
                  const cfg = STAGE_CONFIG[client.stage];
                  const stageIdx = STAGES.indexOf(client.stage);
                  const svcName = SERVICES.find((s) => s.id === client.service)?.name ?? client.service;
                  const isEditNote = editingNote === client.id;

                  return (
                    <div key={client.id} className="px-5 py-4 hover:bg-stone-50/40 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Stage badge */}
                        <span className="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                          <p className="text-xs text-slate-400">{svcName} · <span className="font-semibold" style={{ color: CLAUDE_ORANGE }}>฿{fmt(client.budgetTHB)}</span></p>
                          {isEditNote ? (
                            <div className="flex items-center gap-2 mt-1.5">
                              <input
                                autoFocus
                                className="flex-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none"
                                style={{ border: `1px solid ${CLAUDE_ORANGE}` }}
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") saveNote(client.id); if (e.key === "Escape") setEditingNote(null); }}
                              />
                              <button onClick={() => saveNote(client.id)}
                                className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium"
                                style={{ background: CLAUDE_ORANGE }}>บันทึก</button>
                            </div>
                          ) : client.notes ? (
                            <p
                              className="text-xs text-slate-400 mt-0.5 cursor-pointer hover:text-slate-600 transition-colors"
                              onClick={() => { setEditingNote(client.id); setNoteText(client.notes); }}>
                              📝 {client.notes}
                            </p>
                          ) : (
                            <button
                              className="text-[10px] text-slate-300 mt-0.5 hover:text-slate-400 transition-colors"
                              onClick={() => { setEditingNote(client.id); setNoteText(""); }}>
                              + เพิ่ม note
                            </button>
                          )}
                        </div>

                        {/* Stage controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveStage(client.id, -1)}
                            disabled={stageIdx === 0}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-stone-100 disabled:opacity-20 transition-all">
                            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveStage(client.id, 1)}
                            disabled={stageIdx === STAGES.length - 1}
                            className="flex size-7 items-center justify-center rounded-lg hover:bg-stone-100 disabled:opacity-20 transition-all"
                            style={{ color: CLAUDE_ORANGE }}>
                            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeClient(client.id)}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-200 hover:text-red-400 hover:bg-red-50 transition-all ml-1">
                            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Stage progress bar */}
                      <div className="flex items-center gap-1 mt-3 ml-0">
                        {STAGES.map((s, i) => {
                          const isCurrent = s === client.stage;
                          const isPast = i < stageIdx;
                          const cfg2 = STAGE_CONFIG[s];
                          return (
                            <div key={s} className="flex-1 h-1 rounded-full transition-all"
                              style={{
                                background: isCurrent ? cfg2.color : isPast ? "#c9c4bc" : "#f0ece8",
                              }} />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ─── Currency toggle ─── */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">แสดงราคาเป็น:</span>
          <div className="flex rounded-xl overflow-hidden text-xs font-semibold shadow-sm" style={{ border: "1px solid #e0dbd4" }}>
            {(["thb", "usd"] as const).map((c) => (
              <button key={c} onClick={() => setCurrency(c)}
                className="px-4 py-1.5 transition-colors"
                style={currency === c ? { background: CLAUDE_ORANGE, color: "#fff" } : { background: "#fff", color: "#94a3b8" }}>
                {c === "thb" ? "฿ THB" : "$ USD"}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Service Catalog ─── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Service Catalog</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SERVICES.map((s) => {
              const isUnit = s.id === "bugfix" || s.id === "retainer";
              const primary = currency === "thb"
                ? `฿${s.thb.min.toLocaleString()}–฿${s.thb.max.toLocaleString()}${isUnit && s.id === "bugfix" ? "/hr" : isUnit ? "/mo" : ""}`
                : `$${s.usd.min.toLocaleString()}–$${s.usd.max.toLocaleString()}${isUnit && s.id === "bugfix" ? "/hr" : isUnit ? "/mo" : ""}`;
              const secondary = currency === "thb"
                ? `$${s.usd.min.toLocaleString()}–$${s.usd.max.toLocaleString()}`
                : `฿${s.thb.min.toLocaleString()}–฿${s.thb.max.toLocaleString()}`;
              return (
                <div key={s.id} className="rounded-2xl bg-white px-4 py-4 shadow-sm hover:shadow-md transition-shadow"
                  style={{ border: "1px solid #ede9e3" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 leading-snug">{s.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{s.desc}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap"
                      style={{ background: `${s.tagColor}18`, color: s.tagColor }}>
                      {s.tag}
                    </span>
                  </div>
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid #f5f2ee" }}>
                    <p className="text-base font-bold" style={{ color: CLAUDE_ORANGE }}>{primary}</p>
                    <p className="text-[10px] text-slate-400">{secondary}</p>
                    {s.days !== "—" && (
                      <span className="mt-2 inline-block text-xs text-slate-400 bg-stone-100 rounded-lg px-2 py-0.5 font-medium">
                        {s.days}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Calculator ─── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Project Estimator</h2>
          <div className="rounded-2xl bg-white px-6 py-5 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">Project Type</label>
                <select
                  value={calcService}
                  onChange={(e) => {
                    setCalcService(e.target.value);
                    const svc = SERVICES.find((s) => s.id === e.target.value);
                    if (svc && svc.hours > 0) setCalcHours(svc.hours);
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-stone-50 focus:outline-none"
                  style={{ border: "1px solid #e8e4de" }}>
                  {SERVICES.filter((s) => s.hours > 0).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1.5">{calcSvc.desc}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">
                  ชั่วโมงประมาณ: <span className="font-bold text-slate-700">{calcHours} ชม.</span>
                </label>
                <input type="range" min={8} max={320} step={8} value={calcHours}
                  onChange={(e) => setCalcHours(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: CLAUDE_ORANGE }} />
                <div className="flex justify-between text-[10px] text-slate-300 mt-1">
                  <span>8 ชม.</span><span>320 ชม.</span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 rounded-2xl px-5 py-4"
              style={{ background: "rgba(201,100,66,0.05)", border: "1px solid rgba(201,100,66,0.15)" }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">ราคาประมาณ</p>
                  <p className="text-4xl font-bold" style={{ color: CLAUDE_ORANGE }}>
                    {currency === "thb" ? `฿${calcEstimate.toLocaleString()}` : `$${calcEstimate.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {calcHours} ชม. × {currency === "thb" ? `฿${THB_RATE}/hr` : `$${USD_RATE}/hr`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">ช่วงราคาตาม catalog</p>
                  <p className="text-base font-bold text-slate-700">
                    {currency === "thb"
                      ? `฿${calcSvc.thb.min.toLocaleString()} – ฿${calcSvc.thb.max.toLocaleString()}`
                      : `$${calcSvc.usd.min.toLocaleString()} – $${calcSvc.usd.max.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-slate-400">{calcSvc.days}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Proposal Generator ─── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Proposal Generator</h2>
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #ede9e3" }}>
            {/* Config */}
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #f0ece6" }}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">ชื่อ Client</label>
                  <input
                    className="w-full rounded-xl px-3 py-2 text-sm text-slate-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    style={{ border: "1px solid #e8e4de" }}
                    placeholder="เช่น คุณมานี"
                    value={propClient}
                    onChange={(e) => setPropClient(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">ประเภทงาน</label>
                  <select
                    className="w-full rounded-xl px-3 py-2 text-sm text-slate-800 bg-stone-50 focus:outline-none"
                    style={{ border: "1px solid #e8e4de" }}
                    value={propService}
                    onChange={(e) => {
                      setPropService(e.target.value);
                      const svc = SERVICES.find((s) => s.id === e.target.value);
                      if (svc && svc.hours > 0) setPropHours(svc.hours);
                    }}>
                    {SERVICES.filter((s) => s.hours > 0).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    ชั่วโมง: <span className="font-bold text-slate-700">{propHours} ชม.</span>
                  </label>
                  <input type="range" min={8} max={320} step={8} value={propHours}
                    onChange={(e) => setPropHours(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer mt-2"
                    style={{ accentColor: CLAUDE_ORANGE }} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Deposit</label>
                  <div className="flex rounded-xl overflow-hidden text-xs font-semibold" style={{ border: "1px solid #e0dbd4" }}>
                    {([50, 30] as const).map((d) => (
                      <button key={d} onClick={() => setPropDeposit(d)}
                        className="flex-1 py-2 transition-colors"
                        style={propDeposit === d ? { background: CLAUDE_ORANGE, color: "#fff" } : { background: "#fff", color: "#94a3b8" }}>
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price preview */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">ราคารวม:</span>
                  <span className="text-base font-bold" style={{ color: CLAUDE_ORANGE }}>฿{fmt(propTotal)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Deposit {propDeposit}%:</span>
                  <span className="text-sm font-semibold text-slate-700">฿{fmt(deposit)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">จ่ายหลัง:</span>
                  <span className="text-sm font-semibold text-slate-700">฿{fmt(remaining)}</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="px-6 py-4 bg-stone-50" style={{ borderBottom: "1px solid #f0ece6" }}>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-mono">
                {proposalText}
              </pre>
            </div>

            {/* Copy button */}
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-slate-400">พร้อม copy ไปส่ง Line / Email ได้เลย</p>
              <button
                onClick={copyProposal}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all"
                style={{ background: propCopied ? "#16a34a" : `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}>
                {propCopied ? (
                  <>
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Proposal
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ─── Tips ─── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Tips — เริ่ม Freelance</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TIPS.map((tip) => (
              <div key={tip.title} className="rounded-2xl bg-white px-4 py-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
                <p className="text-xl mb-2">{tip.icon}</p>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{tip.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-center text-slate-400 pb-4">
          อ้างอิงจากตลาด Freelance ไทย (2026) · ระดับ Mid-level Frontend/Full-stack
        </p>

        {/* ─── Contact Me / Public Page ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Contact Me · Public Page</h2>
            <a href="/hire" target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              style={{ background: "#fdf3ef", color: CLAUDE_ORANGE, border: "1px solid #f5d6c8" }}>
              เปิด Public Page →
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Contact card */}
            <div className="rounded-2xl bg-white shadow-sm p-5" style={{ border: "1px solid #ede9e3" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl flex items-center justify-center text-base font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}>
                  S
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Safe Norrapat</p>
                  <p className="text-xs text-slate-400">Full-Stack Developer</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: "#fdf3ef" }}>
                  <span>📧</span>
                  <span className="text-xs font-semibold" style={{ color: CLAUDE_ORANGE }}>chanapolnorrapat@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: "#f0fdf4" }}>
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">พร้อมรับงาน</span>
                </div>
              </div>
            </div>

            {/* Public page preview */}
            <div className="rounded-2xl bg-white shadow-sm p-5 sm:col-span-1 lg:col-span-2"
              style={{ border: "1px solid #ede9e3" }}>
              <p className="text-xs font-semibold text-slate-500 mb-3">Public Page มีอะไรบ้าง</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { icon: "🚀", label: "Hero + Availability" },
                  { icon: "💼", label: "Packages & Pricing" },
                  { icon: "🖼️", label: "Template Gallery" },
                  { icon: "📧", label: "Contact Form" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-medium text-slate-600">{item.label}</span>
                  </div>
                ))}
              </div>
              <a href="/hire" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                ดู Public Page (/hire)
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
