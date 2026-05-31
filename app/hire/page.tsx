"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const TemplateGallery = dynamic(() => import("@/components/TemplateGallery"), { ssr: false });
const HeroRoom3D = dynamic(() => import("@/components/HeroRoom3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-slate-300">โหลดห้อง 3D…</div>
  ),
});

const ORANGE = "#c96442";

// ── Contact Info ─────────────────────────────────────────────────────────────

const ME = {
  name: "Safe Norrapat",
  nameEn: "Chanapolnorrapat Norrapat",
  title: "Full-Stack Developer",
  bio: "นักพัฒนา Full-Stack ที่เชี่ยวชาญ Next.js, TypeScript และ Node.js รับงาน web app, landing page และ dashboard ทุกขนาด — ส่งงานตรงเวลา พร้อม support หลังส่งมอบ",
  email: "chanapolnorrapat@gmail.com",
  line: "@safe.dev",
  github: "github.com/safe-norrapat",
  responseTime: "ตอบภายใน 24 ชม.",
  availability: true,
  stack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Node.js", "Prisma", "PostgreSQL", "React", "REST API"],
  location: "Thailand 🇹🇭",
};

// ── Services ─────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "landing-simple",
    icon: "🚀",
    name: "Landing Page",
    tier: "Simple",
    desc: "1–3 sections, static, responsive — เหมาะสำหรับ product / personal brand",
    days: "3–5 วัน",
    thb: { min: 8_000, max: 15_000 },
    tag: "Frontend",
    tagColor: "#6366f1",
    features: ["Responsive ทุก device", "SEO-ready", "Contact form", "Deploy ให้พร้อมใช้"],
  },
  {
    id: "landing-pro",
    icon: "✨",
    name: "Landing Page",
    tier: "Pro",
    desc: "Multi-section, animations, เชื่อมต่อ CMS/API — เหมาะสำหรับ SaaS / startup",
    days: "5–10 วัน",
    thb: { min: 15_000, max: 30_000 },
    tag: "Frontend",
    tagColor: "#6366f1",
    features: ["ทุกอย่างจาก Simple", "Scroll animations", "CMS integration", "A/B test ready"],
  },
  {
    id: "webapp",
    icon: "⚙️",
    name: "Web Application",
    tier: "Full-stack",
    desc: "Auth + CRUD + API — task manager, booking system, internal tool",
    days: "2–4 สัปดาห์",
    thb: { min: 30_000, max: 60_000 },
    tag: "Full-stack",
    tagColor: "#10b981",
    features: ["Authentication", "Database design", "REST API", "Admin panel"],
  },
  {
    id: "dashboard",
    icon: "📊",
    name: "Dashboard / Admin",
    tier: "Full-stack",
    desc: "Data visualization, report, role-based access — เหมาะกับ business ที่ต้องการ monitor ข้อมูล",
    days: "2–3 สัปดาห์",
    thb: { min: 25_000, max: 50_000 },
    tag: "Full-stack",
    tagColor: "#10b981",
    features: ["Charts & analytics", "Export PDF/Excel", "Role & permission", "Real-time updates"],
  },
  {
    id: "ecommerce",
    icon: "🛒",
    name: "E-commerce",
    tier: "Shop",
    desc: "Product catalog, cart, checkout, order management — ร้านค้าออนไลน์ครบวงจร",
    days: "4–6 สัปดาห์",
    thb: { min: 50_000, max: 100_000 },
    tag: "Full-stack",
    tagColor: "#f59e0b",
    features: ["Product management", "Payment gateway", "Order tracking", "Inventory"],
  },
  {
    id: "retainer",
    icon: "🔧",
    name: "Monthly Maintenance",
    tier: "/เดือน",
    desc: "Retainer: bug fix, minor features, updates — เหมาะสำหรับ project ที่ต้องการดูแลต่อเนื่อง",
    days: "Ongoing",
    thb: { min: 3_000, max: 8_000 },
    tag: "/month",
    tagColor: "#0ea5e9",
    features: ["Bug fixes", "Minor features", "Performance monitor", "Monthly report"],
  },
];

const WHY = [
  { icon: "⚡", title: "ส่งงานตรงเวลา", body: "ทำงานด้วย checkpoint ชัดเจน — client รู้ทุกขั้นตอนตลอดการพัฒนา" },
  { icon: "🎨", title: "Design ที่ดีมาพร้อมกัน", body: "ไม่ใช่แค่ code — ทุก project ผ่าน UX review เพื่อ conversion ที่ดีขึ้น" },
  { icon: "🔒", title: "Code quality สูง", body: "TypeScript strict, responsive ทุก device, SEO-ready ทุก project" },
  { icon: "💬", title: "สื่อสารดี ตอบเร็ว", body: "ตอบภายใน 24 ชม. มี progress update ทุกวัน ไม่หายหัว" },
];

function fmt(n: number) { return n.toLocaleString("th-TH"); }

function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", project: "", budget: "", detail: "" });
  const [sent, setSent] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(ME.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSend() {
    if (!form.name.trim() || !form.detail.trim()) return;
    const subject = encodeURIComponent(`[Freelance Inquiry] ${form.project || "โปรเจกต์ใหม่"} — ${form.name}`);
    const body = encodeURIComponent(
      `สวัสดีครับ\n\nชื่อ: ${form.name}\nโปรเจกต์: ${form.project}\nงบประมาณ: ${form.budget}\n\nรายละเอียด:\n${form.detail}\n\nขอบคุณครับ`
    );
    window.open(`mailto:${ME.email}?subject=${subject}&body=${body}`);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <section id="contact" className="py-20 px-6" style={{ background: "#fafaf9" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Contact</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ letterSpacing: -1 }}>
            พร้อมรับงานใหม่ — ติดต่อได้เลย
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">มีโปรเจกต์ในใจแล้วหรือยังไม่แน่ใจ? ส่งรายละเอียดมาก่อนได้เลย ไม่มีค่าใช้จ่ายในการปรึกษา</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* Left — contact info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
              <div className="flex items-center gap-4 mb-5">
                <div className="size-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}>
                  S
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{ME.name}</p>
                  <p className="text-sm text-slate-500">{ME.title}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-600">
                      {ME.availability ? "พร้อมรับงาน" : "ไม่ว่างชั่วคราว"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{ME.bio}</p>
              <div className="space-y-3">
                {/* Email */}
                <button onClick={copyEmail}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:opacity-80"
                  style={{ background: "#fdf3ef", border: `1px solid #f5d6c8` }}>
                  <span className="text-lg">📧</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-medium">Email</p>
                    <p className="text-sm font-bold truncate" style={{ color: ORANGE }}>{ME.email}</p>
                  </div>
                  <span className="text-xs font-semibold shrink-0" style={{ color: ORANGE }}>
                    {copied ? "✓ Copied!" : "Copy"}
                  </span>
                </button>
                {/* Response time */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <span className="text-lg">⏱️</span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Response time</p>
                    <p className="text-sm font-bold text-emerald-700">{ME.responseTime}</p>
                  </div>
                </div>
                {/* Location */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Location</p>
                    <p className="text-sm font-bold text-slate-700">{ME.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stack */}
            <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {ME.stack.map((s) => (
                  <span key={s} className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                    style={{ background: `${ORANGE}12`, color: ORANGE, border: `1px solid ${ORANGE}25` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — inquiry form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
              <p className="text-sm font-bold text-slate-800 mb-5">ส่งรายละเอียดโปรเจกต์</p>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">ชื่อ / บริษัท *</label>
                    <input
                      className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none transition"
                      style={{ border: "1px solid #e2e8f0", background: "#fafafa" }}
                      placeholder="เช่น คุณสมชาย / Startup XYZ"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">ประเภทงาน</label>
                    <select
                      className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none transition"
                      style={{ border: "1px solid #e2e8f0", background: "#fafafa" }}
                      value={form.project}
                      onChange={(e) => setForm({ ...form, project: e.target.value })}
                    >
                      <option value="">เลือกประเภทงาน...</option>
                      {SERVICES.map((s) => (
                        <option key={s.id} value={`${s.name} (${s.tier})`}>{s.name} — {s.tier}</option>
                      ))}
                      <option value="ปรึกษาก่อน">ยังไม่แน่ใจ — อยากปรึกษาก่อน</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">งบประมาณ (ถ้ามี)</label>
                  <input
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none transition"
                    style={{ border: "1px solid #e2e8f0", background: "#fafafa" }}
                    placeholder="เช่น ฿20,000 หรือยังไม่ได้กำหนด"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">รายละเอียดโปรเจกต์ *</label>
                  <textarea
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none resize-none transition"
                    style={{ border: "1px solid #e2e8f0", background: "#fafafa" }}
                    placeholder="อธิบายสิ่งที่อยากได้ — ฟีเจอร์หลัก, กลุ่มผู้ใช้, deadline, reference ที่ชอบ..."
                    rows={5}
                    value={form.detail}
                    onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!form.name.trim() || !form.detail.trim()}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}
                >
                  {sent ? "✓ เปิด Email Client แล้ว — ส่งได้เลย!" : "📧 ส่ง Inquiry →"}
                </button>
                <p className="text-xs text-center text-slate-400">
                  กดแล้วจะเปิด Email app พร้อม draft ให้อัตโนมัติ · ไม่มีค่าใช้จ่ายในการปรึกษา
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HirePage() {
  return (
    <div className="min-h-screen" style={{ background: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md" style={{ borderBottom: "1px solid #f0ece6" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}>
              S
            </div>
            <span className="font-bold text-slate-900">Safe.dev</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {[["#services", "Packages"], ["#templates", "Templates"], ["#contact", "Contact"]].map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">{label}</a>
            ))}
          </div>
          <a href="#contact"
            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}>
            ติดต่องาน
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-20 pb-16" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Availability badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700">พร้อมรับงานใหม่</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight"
              style={{ letterSpacing: -2 }}>
              Full-Stack<br />
              <span style={{ color: ORANGE }}>Developer</span><br />
              พร้อมช่วย
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
              สร้าง web app, landing page และ dashboard ที่ดูดีและใช้งานได้จริง
              ด้วย <strong className="text-slate-700">Next.js + TypeScript</strong> — ส่งงานตรงเวลา พร้อม support
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {ME.stack.slice(0, 5).map((s) => (
                <span key={s} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  {s}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="#contact"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}>
                ติดต่อได้เลย →
              </a>
              <a href="#services"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-slate-700"
                style={{ border: "1.5px solid #e2e8f0" }}>
                ดู Packages
              </a>
            </div>
          </div>

          {/* 3D isometric workspace (auto-rotating, low-poly) */}
          <div className="relative h-[340px] sm:h-[420px] w-full">
            <HeroRoom3D />
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
          {[
            { label: "Projects delivered", value: "10+", color: ORANGE, bg: "#fdf3ef", border: "#f5d6c8" },
            { label: "Avg. delivery time", value: "7 วัน", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
            { label: "Tech stack", value: "8+", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
            { label: "Response time", value: "< 24h", color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <p className="text-3xl font-black mb-2" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Work With Me ── */}
      <section className="px-6 py-16" style={{ background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY.map((w) => (
              <div key={w.title} className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
                <div className="text-2xl mb-3">{w.icon}</div>
                <p className="text-sm font-bold text-slate-800 mb-2">{w.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages / Pricing ── */}
      <section id="services" className="px-6 py-20">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Packages</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ letterSpacing: -1 }}>
              ราคาชัดเจน ไม่มีค่าใช้จ่ายซ่อน
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">ราคาเป็น estimate — ราคาจริงขึ้นอยู่กับ scope ของ project ปรึกษาฟรีก่อนเริ่ม</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((svc) => (
              <div key={svc.id}
                className="rounded-2xl bg-white p-6 shadow-sm flex flex-col"
                style={{ border: "1px solid #ede9e3" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${svc.tagColor}15` }}>
                    {svc.icon}
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{ background: `${svc.tagColor}15`, color: svc.tagColor }}>
                    {svc.tag}
                  </span>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: svc.tagColor }}>
                  {svc.tier}
                </p>
                <h3 className="text-base font-bold text-slate-900 mb-2">{svc.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{svc.desc}</p>

                <div className="space-y-2 mb-5">
                  {svc.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-xs">✓</span>
                      <span className="text-xs text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid #f0ece6" }}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-black text-slate-900">
                      ฿{fmt(svc.thb.min)}
                    </span>
                    <span className="text-sm text-slate-400">— ฿{fmt(svc.thb.max)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">⏱ {svc.days}</span>
                    <a href="#contact"
                      className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all hover:opacity-80"
                      style={{ background: `${svc.tagColor}15`, color: svc.tagColor }}>
                      ติดต่อ →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hourly note */}
          <div className="mt-6 rounded-2xl px-6 py-4 flex items-center gap-3"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span className="text-lg">💡</span>
            <p className="text-sm text-slate-600">
              <strong>Bug Fix / Feature Add:</strong> ฿600–800 / ชม. · <strong>Consultation:</strong> ฟรี (30 นาทีแรก) · รับ deposit 30–50% ก่อนเริ่มงาน
            </p>
          </div>
        </div>
      </section>

      {/* ── Template Gallery ── */}
      <section id="templates" className="px-6 pb-20" style={{ background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="text-center mb-10 pt-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Live Previews</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ letterSpacing: -1 }}>
              ตัวอย่างงานที่ทำได้
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">กดที่ template เพื่อดู live preview — ทุกอันสร้างจาก Next.js + Tailwind CSS พร้อม responsive ทุก device</p>
          </div>
          <TemplateGallery />
        </div>
      </section>

      {/* ── Contact ── */}
      <ContactSection />

      {/* ── Footer ── */}
      <footer className="px-6 py-8 text-center" style={{ borderTop: "1px solid #f0ece6" }}>
        <p className="text-sm text-slate-400">
          © 2026 {ME.name} · <a href={`mailto:${ME.email}`} className="hover:underline" style={{ color: ORANGE }}>{ME.email}</a>
        </p>
      </footer>
    </div>
  );
}
