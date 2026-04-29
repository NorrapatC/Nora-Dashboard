"use client";
import { useState, useEffect } from "react";

const CLAUDE_ORANGE = "#c96442";
const FULL_W = 1280;
const CARD_W = 288;
const CARD_H = 200;
const CARD_SCALE = CARD_W / FULL_W;

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function Stars({ n = 5, filled = 5, color = "#f59e0b" }: { n?: number; filled?: number; color?: string }) {
  return (
    <span>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ color: i < filled ? color : "#d1d5db", fontSize: 12 }}>★</span>
      ))}
    </span>
  );
}

// SVG Line chart
function LineChart({ color = CLAUDE_ORANGE, points = "0,90 60,70 120,80 180,40 240,55 300,20 360,35 420,10 480,25 540,15 600,5" }: { color?: string; points?: string }) {
  const filled = points + ` 600,120 0,120`;
  return (
    <svg width="100%" height="100" viewBox="0 0 600 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={filled} fill={`url(#g${color.replace("#", "")})`} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.split(" ").map((p, i) => {
        const [x, y] = p.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />;
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 1 — Landing Page Simple
// ─────────────────────────────────────────────────────────────────────────────

function LandingSimplePreview() {
  const accent = "#6366f1";
  return (
    <div style={{ width: FULL_W, fontFamily: "'Inter',sans-serif", background: "#fff", color: "#111" }}>

      {/* Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 56px", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accent }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: "#111" }}>Launchly</span>
        </div>
        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {["Product", "Features", "Pricing", "Blog"].map((n) => (
            <span key={n} style={{ fontSize: 15, color: "#6b7280", fontWeight: 500, cursor: "pointer" }}>{n}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ padding: "9px 22px", borderRadius: 9, border: "1px solid #e5e7eb", fontSize: 14, fontWeight: 600, color: "#374151" }}>Log in</div>
          <div style={{ padding: "9px 22px", borderRadius: 9, background: accent, fontSize: 14, fontWeight: 700, color: "#fff", boxShadow: `0 4px 14px ${accent}40` }}>Get started free</div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg,#f0f1ff 0%,#fff 70%)", padding: "88px 56px 0", display: "flex", alignItems: "flex-start", gap: 80 }}>
        <div style={{ flex: 1, paddingTop: 16 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eef2ff", border: "1px solid #c7d2fe", color: accent, padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: accent, display: "inline-block" }} />
            New: AI-powered templates just dropped
          </div>
          <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.08, marginBottom: 22, letterSpacing: -2, color: "#111" }}>
            Launch Your<br /><span style={{ color: accent }}>Dream Website</span><br />In Minutes
          </h1>
          <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.8, marginBottom: 38, maxWidth: 480 }}>
            Build stunning, high-converting websites without writing a single line of code. 50+ templates, drag-and-drop editor, live in seconds.
          </p>
          <div style={{ display: "flex", gap: 14, marginBottom: 36 }}>
            <div style={{ background: accent, color: "#fff", padding: "15px 34px", borderRadius: 12, fontSize: 16, fontWeight: 800, boxShadow: `0 8px 28px ${accent}35` }}>Start for free →</div>
            <div style={{ border: "2px solid #e5e7eb", color: "#374151", padding: "15px 34px", borderRadius: 12, fontSize: 16, fontWeight: 600 }}>▶ Watch demo</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["#6366f1","#8b5cf6","#a855f7","#ec4899","#f43f5e"].map((c, i) => (
                <div key={c} style={{ width: 32, height: 32, borderRadius: 16, background: c, border: "2px solid #fff", marginLeft: i > 0 ? -8 : 0 }} />
              ))}
            </div>
            <div>
              <Stars filled={5} color={accent} />
              <span style={{ fontSize: 13, color: "#6b7280", marginLeft: 6 }}><strong style={{ color: "#111" }}>4.9/5</strong> from 2,400+ reviews</span>
            </div>
          </div>
        </div>

        {/* Browser mockup */}
        <div style={{ flex: 1, maxWidth: 580 }}>
          <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 32px 80px rgba(99,102,241,0.18), 0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #e0e7ff" }}>
            <div style={{ background: "#f3f4f6", padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />)}
              </div>
              <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 7, height: 22, display: "flex", alignItems: "center", padding: "0 12px" }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>🔒 launchly.io/demo</span>
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #eef2ff, #f5f3ff)", height: 280, display: "flex", flexDirection: "column", gap: 12, padding: 24 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 2, background: "rgba(255,255,255,0.7)", borderRadius: 10, height: 36, display: "flex", alignItems: "center", padding: "0 14px" }}>
                  <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700 }}>✨ Hero Section</span>
                </div>
                <div style={{ flex: 1, background: accent, borderRadius: 10, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>CTA Button</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flex: 1 }}>
                {["Features","About","Gallery"].map((label, i) => (
                  <div key={label} style={{ flex: 1, background: `rgba(255,255,255,${0.4 + i * 0.15})`, borderRadius: 10, display: "flex", flexDirection: "column", gap: 6, padding: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, opacity: 0.6 + i * 0.1 }} />
                    <div style={{ height: 8, background: "#c7d2fe", borderRadius: 4, width: "70%" }} />
                    <div style={{ height: 6, background: "#e0e7ff", borderRadius: 4 }} />
                    <div style={{ height: 6, background: "#e0e7ff", borderRadius: 4, width: "80%" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof logos */}
      <div style={{ padding: "40px 56px", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6" }}>
        <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 24 }}>Trusted by teams at</p>
        <div style={{ display: "flex", gap: 56, justifyContent: "center", alignItems: "center" }}>
          {["Airbnb","Stripe","Notion","Figma","Linear","Vercel"].map((name) => (
            <span key={name} style={{ fontSize: 18, fontWeight: 800, color: "#d1d5db", letterSpacing: -0.5 }}>{name}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "80px 56px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Features</p>
          <h2 style={{ fontSize: 44, fontWeight: 900, color: "#111", letterSpacing: -1.5, marginBottom: 14 }}>Everything You Need to Succeed</h2>
          <p style={{ fontSize: 18, color: "#6b7280", maxWidth: 560, margin: "0 auto" }}>A complete toolkit to build, launch, and grow your online presence.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { icon: "⚡", title: "Blazing Fast Performance", desc: "99/100 Lighthouse score. Optimized images, code splitting, and edge CDN included automatically.", badge: "Core Web Vitals" },
            { icon: "🎨", title: "Professional Templates", desc: "50+ designer-crafted templates for every industry. Fully customizable to match your brand perfectly.", badge: "50+ Templates" },
            { icon: "📱", title: "Mobile-First Design", desc: "Every layout is pixel-perfect on phones, tablets, and desktops. Test live on any device instantly.", badge: "Responsive" },
            { icon: "🔒", title: "Enterprise Security", desc: "SSL, DDoS protection, and SOC 2 compliance. Your data and your customers' data are always safe.", badge: "SOC 2 Certified" },
            { icon: "📊", title: "Built-in Analytics", desc: "Track visitors, conversions, and revenue in real-time. No third-party tools needed — it's all built in.", badge: "Real-time" },
            { icon: "🔗", title: "200+ Integrations", desc: "Connect Stripe, Mailchimp, HubSpot, Zapier and more. One-click setup, no code required.", badge: "Plug & Play" },
          ].map((f) => (
            <div key={f.title} style={{ background: "#fafafa", borderRadius: 18, padding: 32, border: "1px solid #f0f0f0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 20, right: 20, background: "#eef2ff", color: accent, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{f.badge}</div>
              <div style={{ width: 52, height: 52, background: "#eef2ff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 18 }}>{f.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.8 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ background: "#fafafa", padding: "72px 56px", borderTop: "1px solid #f0f0f0" }}>
        <h2 style={{ fontSize: 38, fontWeight: 900, color: "#111", textAlign: "center", letterSpacing: -1, marginBottom: 48 }}>Loved by Thousands of Creators</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
          {[
            { name: "Sarah K.", role: "Founder @ Bloom Studio", text: "Launchly cut our website launch time from 3 weeks to 2 days. The templates are stunning and easy to customize.", avatar: "#6366f1" },
            { name: "Marcus T.", role: "Head of Marketing @ ScaleUp", text: "Our conversion rate went up 34% after switching. The built-in analytics finally helped us understand our users.", avatar: "#10b981" },
            { name: "Priya M.", role: "Freelance Designer", text: "I use Launchly for every client project now. The speed and quality is unmatched. My clients are always impressed.", avatar: "#f59e0b" },
          ].map((t) => (
            <div key={t.name} style={{ background: "#fff", borderRadius: 18, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ color: "#f59e0b", fontSize: 18, marginBottom: 14 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, marginBottom: 20 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, background: t.avatar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: accent, padding: "80px 56px", textAlign: "center" }}>
        <h2 style={{ fontSize: 46, fontWeight: 900, color: "#fff", letterSpacing: -1.5, marginBottom: 14 }}>Start Building Today</h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 19, marginBottom: 40 }}>No credit card required. Free plan available forever.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <div style={{ background: "#fff", color: accent, padding: "16px 40px", borderRadius: 12, fontSize: 17, fontWeight: 800 }}>Get started free →</div>
          <div style={{ border: "2px solid rgba(255,255,255,0.35)", color: "#fff", padding: "16px 40px", borderRadius: 12, fontSize: 17, fontWeight: 600 }}>See pricing</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 2 — Landing Page Pro
// ─────────────────────────────────────────────────────────────────────────────

function LandingProPreview() {
  const accent = "#a855f7";
  const accentAlt = "#6366f1";
  return (
    <div style={{ width: FULL_W, fontFamily: "'Inter',sans-serif", background: "#09090b", color: "#fff" }}>

      {/* Nav */}
      <div style={{ padding: "0 56px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${accent},${accentAlt})` }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>ProForge</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Platform","Solutions","Pricing","Enterprise","Blog"].map((n) => (
            <span key={n} style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{n}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ padding: "9px 22px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Sign in</div>
          <div style={{ padding: "9px 22px", borderRadius: 9, background: `linear-gradient(135deg,${accent},${accentAlt})`, fontSize: 14, fontWeight: 700, color: "#fff", boxShadow: `0 4px 20px ${accent}40` }}>Start free →</div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "96px 56px 80px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse,${accent}20 0%,transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${accent}18`, border: `1px solid ${accent}40`, padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 32, color: "#c084fc" }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: "#c084fc", display: "inline-block" }} />
          ProForge 3.0 — The future of work is here
        </div>
        <h1 style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.02, marginBottom: 24, maxWidth: 900, margin: "0 auto 24px", letterSpacing: -3 }}>
          <span style={{ background: `linear-gradient(135deg,#fff 40%,rgba(255,255,255,0.4))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Build Products<br />10× Faster with AI
          </span>
        </h1>
        <p style={{ fontSize: 20, color: "rgba(255,255,255,0.48)", maxWidth: 580, margin: "0 auto 48px", lineHeight: 1.8 }}>
          The all-in-one platform for modern product teams. Ship with confidence, scale without limits.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 64 }}>
          <div style={{ background: `linear-gradient(135deg,${accent},${accentAlt})`, color: "#fff", padding: "17px 40px", borderRadius: 13, fontSize: 17, fontWeight: 800, boxShadow: `0 10px 36px ${accent}40` }}>Get started free →</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", padding: "17px 40px", borderRadius: 13, fontSize: 17, fontWeight: 600 }}>▶ Watch 2-min demo</div>
        </div>
        {/* Metrics */}
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden" }}>
          {[["100K+","Active users"],["99.99%","Uptime SLA"],["4.9 ★","App Store"],["<50ms","Avg latency"]].map(([val, lbl], i) => (
            <div key={lbl} style={{ padding: "22px 40px", textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature showcase */}
      <div style={{ padding: "80px 56px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <p style={{ color: "#c084fc", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 18 }}>Core Platform</p>
            <h2 style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 20 }}>One platform.<br />Infinite possibilities.</h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 36 }}>From ideation to deployment, ProForge handles every step of your product lifecycle so your team can focus on what matters.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "🤖", title: "AI Copilot", desc: "Write code, tests, and docs 10× faster with built-in AI." },
                { icon: "🔄", title: "Real-time Collaboration", desc: "Work together seamlessly with live cursors and instant sync." },
                { icon: "🚀", title: "One-click Deploy", desc: "Push to production in seconds with zero-downtime deployments." },
              ].map((f) => (
                <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}18`, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Mock UI */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              {["rgba(255,255,255,0.06)","rgba(255,255,255,0.04)","rgba(255,255,255,0.04)"].map((bg, i) => (
                <div key={i} style={{ flex: 1, height: 32, background: bg, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }} />
              ))}
            </div>
            {[100, 70, 90, 55, 80].map((w, i) => (
              <div key={i} style={{ height: 10, background: `rgba(168,85,247,${0.08 + i * 0.04})`, borderRadius: 5, width: `${w}%` }} />
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "6px 0" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, height: 72, background: `${accent}15`, borderRadius: 12, border: `1px solid ${accent}25` }} />
              <div style={{ flex: 1, height: 72, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }} />
              <div style={{ flex: 1, height: 72, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }} />
            </div>
            <div style={{ height: 48, background: `linear-gradient(135deg,${accent},${accentAlt})`, borderRadius: 12, opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding: "80px 56px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: -1.5, marginBottom: 12 }}>Simple, Transparent Pricing</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17 }}>Start free. Scale as you grow. No surprises.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { name: "Hobby", price: "Free", period: "forever", color: "rgba(255,255,255,0.5)", features: ["5 projects","10K API calls/mo","Community support","Basic analytics"], highlight: false },
            { name: "Pro", price: "฿1,490", period: "/month", color: "#c084fc", features: ["Unlimited projects","1M API calls/mo","Priority support","Advanced analytics","Custom domain","Team (5 seats)"], highlight: true },
            { name: "Enterprise", price: "Custom", period: "pricing", color: "rgba(255,255,255,0.5)", features: ["Unlimited everything","SLA 99.99%","Dedicated support","SSO / SAML","Audit logs","Custom contracts"], highlight: false },
          ].map((plan) => (
            <div key={plan.name} style={{ padding: 32, borderRadius: 20, border: `1px solid ${plan.highlight ? `${accent}50` : "rgba(255,255,255,0.07)"}`, background: plan.highlight ? `linear-gradient(160deg,${accent}12,${accentAlt}08)` : "rgba(255,255,255,0.02)", position: "relative" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${accent},${accentAlt})`, color: "#fff", padding: "4px 16px", borderRadius: 20, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>MOST POPULAR</div>
              )}
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: plan.highlight ? "#c084fc" : "#fff" }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: plan.highlight ? "#c084fc" : "#4ade80", fontWeight: 800, fontSize: 14 }}>✓</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "13px 0", borderRadius: 11, background: plan.highlight ? `linear-gradient(135deg,${accent},${accentAlt})` : "rgba(255,255,255,0.06)", textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                {plan.name === "Enterprise" ? "Contact sales" : "Get started →"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 3 — Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────

function DashboardPreview() {
  return (
    <div style={{ width: FULL_W, height: 960, fontFamily: "'Inter',sans-serif", display: "flex", background: "#f1f5f9", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{ width: 230, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${CLAUDE_ORANGE},#a04e32)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff" }}>N</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>NoraDash</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>Admin v2.4</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 12px 8px" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 1.5, padding: "0 10px", marginBottom: 8 }}>Main Menu</p>
          {[
            { icon: "▦", label: "Overview", active: true, badge: "" },
            { icon: "📊", label: "Analytics", active: false, badge: "" },
            { icon: "🛒", label: "Orders", active: false, badge: "12" },
            { icon: "👥", label: "Customers", active: false, badge: "" },
            { icon: "📦", label: "Products", active: false, badge: "" },
            { icon: "📋", label: "Reports", active: false, badge: "" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, marginBottom: 2, background: item.active ? `rgba(201,100,66,0.15)` : "transparent" }}>
              <span style={{ fontSize: 15, opacity: item.active ? 1 : 0.5 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: item.active ? 600 : 400, color: item.active ? CLAUDE_ORANGE : "rgba(255,255,255,0.4)", flex: 1 }}>{item.label}</span>
              {item.badge && <div style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 8 }}>{item.badge}</div>}
              {item.active && <div style={{ width: 6, height: 6, borderRadius: 3, background: CLAUDE_ORANGE }} />}
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 12px" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 1.5, padding: "0 10px", marginBottom: 8 }}>Settings</p>
          {[{ icon: "⚙️", label: "Settings" }, { icon: "🔔", label: "Notifications" }, { icon: "🛡️", label: "Security" }].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, marginBottom: 2 }}>
              <span style={{ fontSize: 15, opacity: 0.5 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: `linear-gradient(135deg,${CLAUDE_ORANGE},#a04e32)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>S</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Safe Norrapat</div>
              <div style={{ fontSize: 10, color: "#475569" }}>Administrator</div>
            </div>
            <span style={{ color: "#475569", fontSize: 16 }}>⋯</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 28px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Good morning, Safe 👋</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>Monday, 27 April 2026 — Overview</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "9px 18px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>🔍</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Search anything...</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "1px solid #e2e8f0" }}>🔔</div>
              <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, background: "#ef4444", borderRadius: 7, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 7, fontWeight: 900, color: "#fff" }}>3</span>
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 19, background: `linear-gradient(135deg,${CLAUDE_ORANGE},#a04e32)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: "#fff" }}>S</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { label: "Total Revenue", value: "฿2.84M", change: "+18.2%", up: true, icon: "💰", color: CLAUDE_ORANGE, bg: "#fdf3ef", border: "#f5d6c8" },
              { label: "Active Users",  value: "12,847", change: "+9.4%",  up: true, icon: "👥", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
              { label: "New Orders",    value: "3,429",  change: "+24%",   up: true, icon: "📦", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Churn Rate",    value: "2.1%",   change: "-0.4%",  up: false, icon: "📉", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 18, padding: "20px 22px", border: `1px solid ${s.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</span>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, color: s.color, marginBottom: 8, letterSpacing: -1 }}>{s.value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: s.up ? "#16a34a" : "#ef4444", background: s.up ? "#dcfce7" : "#fee2e2", padding: "2px 7px", borderRadius: 6 }}>{s.change}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 16 }}>
            {/* Line chart */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Revenue Overview</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Monthly · Jan–Dec 2026</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {["1W","1M","3M","YTD"].map((p, i) => (
                    <div key={p} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, background: i === 1 ? CLAUDE_ORANGE : "#f1f5f9", color: i === 1 ? "#fff" : "#64748b" }}>{p}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: -1 }}>฿2.84M</div>
                  <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>↑ 18.2% this month</div>
                </div>
              </div>
              <LineChart color={CLAUDE_ORANGE} points="0,80 55,65 110,75 165,42 220,55 275,28 330,38 385,16 440,28 495,18 550,8 600,12" />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m) => (
                  <span key={m} style={{ fontSize: 10, color: "#94a3b8" }}>{m}</span>
                ))}
              </div>
            </div>

            {/* Donut + breakdown */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Revenue by Channel</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>This month</div>
              {/* Fake donut */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke={CLAUDE_ORANGE} strokeWidth="18" strokeDasharray="95 144" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="18" strokeDasharray="58 144" strokeDashoffset="-95" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="18" strokeDasharray="34 144" strokeDashoffset="-153" transform="rotate(-90 50 50)" />
                  <text x="50" y="46" textAnchor="middle" style={{ fontSize: 12, fontWeight: 800, fill: "#0f172a" }}>฿2.8M</text>
                  <text x="50" y="60" textAnchor="middle" style={{ fontSize: 8, fill: "#94a3b8" }}>Total</text>
                </svg>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Direct", pct: "66%", color: CLAUDE_ORANGE },
                    { label: "Organic", pct: "21%", color: "#6366f1" },
                    { label: "Referral", pct: "13%", color: "#10b981" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#64748b", flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Recent Orders</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: CLAUDE_ORANGE, background: "#fdf3ef", padding: "5px 14px", borderRadius: 8, border: `1px solid #f5d6c8` }}>View all →</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr", padding: "10px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
              {["Customer","Product","Amount","Date","Status"].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
              ))}
            </div>
            {[
              { name: "สมชาย วิลาวัลย์", product: "Pro Plan Annual", amount: "฿17,880", date: "Apr 27", status: "paid", statusColor: "#16a34a", statusBg: "#f0fdf4" },
              { name: "Startup XYZ Ltd.", product: "Enterprise", amount: "฿89,000", date: "Apr 27", status: "processing", statusColor: CLAUDE_ORANGE, statusBg: "#fdf3ef" },
              { name: "มาลี ดอกไม้", product: "Pro Monthly", amount: "฿1,490", date: "Apr 26", status: "paid", statusColor: "#16a34a", statusBg: "#f0fdf4" },
              { name: "Tech Corp Asia", product: "Enterprise", amount: "฿124,000", date: "Apr 26", status: "pending", statusColor: "#6366f1", statusBg: "#eef2ff" },
              { name: "Pita Studio", product: "Pro Annual", amount: "฿17,880", date: "Apr 25", status: "paid", statusColor: "#16a34a", statusBg: "#f0fdf4" },
            ].map((row) => (
              <div key={row.name} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr", padding: "14px 24px", borderBottom: "1px solid #f8fafc", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>{row.name[0]}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{row.name}</span>
                </div>
                <span style={{ fontSize: 13, color: "#64748b" }}>{row.product}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{row.amount}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{row.date}</span>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: row.statusColor, background: row.statusBg, padding: "4px 10px", borderRadius: 7 }}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 4 — Web App (Kanban)
// ─────────────────────────────────────────────────────────────────────────────

function WebAppPreview() {
  const accent = "#10b981";
  const kanban: { col: string; color: string; bg: string; border: string; tasks: { title: string; tag: string; tagColor: string; priority: string; priColor: string; assignee: string; avatarBg: string; comments: number; attachments: number }[] }[] = [
    {
      col: "📋 To Do", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0",
      tasks: [
        { title: "Design system audit", tag: "Design", tagColor: "#ec4899", priority: "High", priColor: "#ef4444", assignee: "N", avatarBg: "#6366f1", comments: 3, attachments: 2 },
        { title: "Setup CI/CD pipeline", tag: "DevOps", tagColor: "#f59e0b", priority: "Medium", priColor: "#f59e0b", assignee: "R", avatarBg: "#10b981", comments: 1, attachments: 0 },
        { title: "Write API documentation", tag: "Backend", tagColor: "#8b5cf6", priority: "Low", priColor: "#94a3b8", assignee: "L", avatarBg: "#8b5cf6", comments: 5, attachments: 3 },
      ],
    },
    {
      col: "🔄 In Progress", color: CLAUDE_ORANGE, bg: "#fdf3ef", border: "#f5d6c8",
      tasks: [
        { title: "Build checkout flow UI", tag: "Frontend", tagColor: "#6366f1", priority: "High", priColor: "#ef4444", assignee: "M", avatarBg: "#ec4899", comments: 4, attachments: 1 },
        { title: "Implement OAuth login", tag: "Backend", tagColor: "#8b5cf6", priority: "High", priColor: "#ef4444", assignee: "L", avatarBg: "#8b5cf6", comments: 2, attachments: 0 },
        { title: "Mobile responsive fixes", tag: "Frontend", tagColor: "#6366f1", priority: "Medium", priColor: "#f59e0b", assignee: "M", avatarBg: "#ec4899", comments: 6, attachments: 2 },
      ],
    },
    {
      col: "✅ Done", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
      tasks: [
        { title: "Database schema design", tag: "Database", tagColor: "#0ea5e9", priority: "High", priColor: "#ef4444", assignee: "S", avatarBg: CLAUDE_ORANGE, comments: 8, attachments: 4 },
        { title: "Homepage hero section", tag: "Frontend", tagColor: "#6366f1", priority: "Medium", priColor: "#f59e0b", assignee: "M", avatarBg: "#ec4899", comments: 3, attachments: 1 },
        { title: "User research report", tag: "Design", tagColor: "#ec4899", priority: "Low", priColor: "#94a3b8", assignee: "N", avatarBg: "#6366f1", comments: 2, attachments: 3 },
        { title: "Set up Notion workspace", tag: "Mgmt", tagColor: "#f59e0b", priority: "Low", priColor: "#94a3b8", assignee: "S", avatarBg: CLAUDE_ORANGE, comments: 1, attachments: 0 },
      ],
    },
  ];

  return (
    <div style={{ width: FULL_W, fontFamily: "'Inter',sans-serif", background: "#f8fafc", display: "flex", flexDirection: "column", minHeight: 900 }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: accent }} />
            <span style={{ fontWeight: 800, fontSize: 17, color: "#0f172a" }}>TaskFlow</span>
          </div>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>/ Q2 Launch 2026</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex" }}>
            {[CLAUDE_ORANGE, "#6366f1", "#ec4899", "#10b981"].map((c, i) => (
              <div key={c} style={{ width: 28, height: 28, borderRadius: 14, background: c, border: "2px solid #fff", marginLeft: i > 0 ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
                {["S","A","M","R"][i]}
              </div>
            ))}
            <div style={{ width: 28, height: 28, borderRadius: 14, background: "#f1f5f9", border: "2px solid #fff", marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>+2</div>
          </div>
          <div style={{ height: 20, width: 1, background: "#e2e8f0" }} />
          <div style={{ background: "#f1f5f9", borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>🔍 Search tasks...</span>
          </div>
          <div style={{ background: accent, color: "#fff", padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700 }}>+ Add Task</div>
        </div>
      </div>

      {/* Sub-nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", display: "flex", alignItems: "center", gap: 4, height: 44 }}>
        {[
          { label: "📋 Board", active: true },
          { label: "📄 List", active: false },
          { label: "📅 Timeline", active: false },
          { label: "📊 Reports", active: false },
        ].map((tab) => (
          <div key={tab.label} style={{ padding: "0 16px", height: "100%", display: "flex", alignItems: "center", fontSize: 13, fontWeight: tab.active ? 700 : 500, color: tab.active ? "#0f172a" : "#94a3b8", borderBottom: tab.active ? `2px solid ${accent}` : "2px solid transparent" }}>
            {tab.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {["Filter", "Sort", "Group by"].map((label) => (
          <div key={label} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#64748b", border: "1px solid #e2e8f0", background: "#f8fafc" }}>{label}</div>
        ))}
      </div>

      {/* Kanban */}
      <div style={{ flex: 1, padding: 24, display: "flex", gap: 18, alignItems: "flex-start" }}>
        {kanban.map((col) => (
          <div key={col.col} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: col.bg, border: `1px solid ${col.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: col.color }}>{col.col}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: col.color, background: "rgba(255,255,255,0.7)", padding: "1px 7px", borderRadius: 8 }}>{col.tasks.length}</span>
              </div>
              <span style={{ fontSize: 18, color: col.color, opacity: 0.5, cursor: "pointer" }}>+</span>
            </div>
            {/* Tasks */}
            {col.tasks.map((task) => (
              <div key={task.title} style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.5, flex: 1 }}>{task.title}</p>
                  <span style={{ fontSize: 16, color: "#d1d5db", marginLeft: 8 }}>⋯</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: task.tagColor, background: `${task.tagColor}18`, padding: "3px 8px", borderRadius: 6 }}>{task.tag}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: task.priColor, background: `${task.priColor}15`, padding: "3px 8px", borderRadius: 6 }}>● {task.priority}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>💬</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{task.comments}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>📎</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{task.attachments}</span>
                    </div>
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: 13, background: task.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{task.assignee}</div>
                </div>
              </div>
            ))}
            {/* Add task */}
            <div style={{ padding: "10px 14px", borderRadius: 12, border: `1.5px dashed ${col.border}`, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <span style={{ fontSize: 16, color: "#d1d5db" }}>+</span>
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>Add task</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 5 — E-commerce
// ─────────────────────────────────────────────────────────────────────────────

function EcommercePreview() {
  const accent = "#f59e0b";
  const products = [
    { name: "เสื้อ Polo Premium", brand: "UrbanWear", price: "฿890", old: "฿1,290", rating: 4, sold: 234, gradient: "linear-gradient(135deg,#fbbf24,#f59e0b)", icon: "👕" },
    { name: "หูฟัง Wireless Pro", brand: "SoundMax", price: "฿2,490", old: "฿3,990", rating: 5, sold: 891, gradient: "linear-gradient(135deg,#818cf8,#6366f1)", icon: "🎧" },
    { name: "กระเป๋าเป้ Canvas", brand: "TrailPack", price: "฿1,290", old: "", rating: 4, sold: 156, gradient: "linear-gradient(135deg,#34d399,#10b981)", icon: "🎒" },
    { name: "สนีกเกอร์ Running", brand: "RunFast", price: "฿3,490", old: "฿4,990", rating: 5, sold: 642, gradient: "linear-gradient(135deg,#fb7185,#f43f5e)", icon: "👟" },
    { name: "Smart Watch Series 5", brand: "TechWrist", price: "฿5,990", old: "฿7,490", rating: 5, sold: 1204, gradient: "linear-gradient(135deg,#38bdf8,#0ea5e9)", icon: "⌚" },
    { name: "แว่นกันแดด UV400", brand: "SunStyle", price: "฿890", old: "", rating: 4, sold: 98, gradient: "linear-gradient(135deg,#c084fc,#a855f7)", icon: "🕶️" },
    { name: "หมวก Baseball Cap", brand: "CapCo", price: "฿590", old: "฿790", rating: 4, sold: 312, gradient: "linear-gradient(135deg,#fb923c,#f97316)", icon: "🧢" },
    { name: "กระเป๋าหนัง Crossbody", brand: "LuxLeather", price: "฿2,190", old: "", rating: 5, sold: 87, gradient: "linear-gradient(135deg,#a3a3a3,#737373)", icon: "👜" },
  ];
  return (
    <div style={{ width: FULL_W, fontFamily: "'Inter',sans-serif", background: "#fff", color: "#111" }}>

      {/* Top bar */}
      <div style={{ background: "#111", padding: "8px 56px", display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 13, color: "#fbbf24", fontWeight: 600 }}>🎉 SUMMER SALE — ลดสูงสุด 50% ทั้งร้าน!</span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>|</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>ส่งฟรี เมื่อสั่งครบ ฿499</span>
      </div>

      {/* Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 56px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${accent},#ea580c)` }} />
          <span style={{ fontWeight: 900, fontSize: 22, color: "#111" }}>ShopNow</span>
        </div>
        <div style={{ flex: 1, maxWidth: 520, margin: "0 36px" }}>
          <div style={{ display: "flex", border: "2px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <input style={{ flex: 1, padding: "10px 18px", fontSize: 14, color: "#374151", border: "none", outline: "none" }} placeholder="ค้นหาสินค้า..." readOnly />
            <div style={{ background: accent, padding: "10px 22px", display: "flex", alignItems: "center" }}>
              <span style={{ color: "#fff", fontSize: 16 }}>🔍</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["เสื้อผ้า","อิเล็กทรอนิกส์","กีฬา","ความงาม"].map((n) => (
            <span key={n} style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{n}</span>
          ))}
          <div style={{ display: "flex", gap: 16, marginLeft: 8 }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>🤍</span>
              <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>3</span>
              </div>
            </div>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>🛒</span>
              <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: "#ef4444", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg,#111 0%,#1c1c1e 100%)", padding: "0 56px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 280, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, top: 0, width: 500, height: "100%", background: `linear-gradient(135deg,${accent}30,transparent)`, pointerEvents: "none" }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ display: "inline-block", background: accent, color: "#fff", padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 800, marginBottom: 18, textTransform: "uppercase", letterSpacing: 1 }}>Summer Collection 2026</div>
          <h1 style={{ fontSize: 54, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 16, letterSpacing: -2 }}>
            Style That<br /><span style={{ color: accent }}>Speaks For You</span>
          </h1>
          <p style={{ fontSize: 17, color: "#9ca3af", marginBottom: 32, maxWidth: 440 }}>ค้นพบคอลเลคชั่นใหม่ล่าสุด ลดสูงสุด 50% เฉพาะสัปดาห์นี้เท่านั้น</p>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ background: accent, color: "#fff", padding: "14px 34px", borderRadius: 12, fontSize: 16, fontWeight: 800 }}>ช้อปเลย →</div>
            <div style={{ border: "2px solid rgba(255,255,255,0.2)", color: "#fff", padding: "14px 34px", borderRadius: 12, fontSize: 16, fontWeight: 600 }}>ดูคอลเลคชั่น</div>
          </div>
        </div>
        {/* Hero product display */}
        <div style={{ display: "flex", gap: 16, zIndex: 1 }}>
          {["linear-gradient(135deg,#fbbf24,#f59e0b)","linear-gradient(135deg,#818cf8,#6366f1)","linear-gradient(135deg,#34d399,#10b981)"].map((g, i) => (
            <div key={i} style={{ width: 140, height: 180, borderRadius: 16, background: g, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: "0 16px 40px rgba(0,0,0,0.3)", transform: i === 1 ? "translateY(-12px)" : "translateY(0)" }}>
              {["👕","🎧","👟"][i]}
            </div>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div style={{ padding: "24px 56px", borderBottom: "1px solid #f3f4f6", display: "flex", gap: 12, overflowX: "hidden" }}>
        {[
          { icon: "👕", label: "เสื้อผ้า", active: true },
          { icon: "🎧", label: "อิเล็กทรอนิกส์", active: false },
          { icon: "👟", label: "รองเท้า", active: false },
          { icon: "🎒", label: "กระเป๋า", active: false },
          { icon: "⌚", label: "นาฬิกา", active: false },
          { icon: "🕶️", label: "แว่นตา", active: false },
          { icon: "💄", label: "ความงาม", active: false },
          { icon: "🏃", label: "กีฬา", active: false },
        ].map((cat) => (
          <div key={cat.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 50, border: `2px solid ${cat.active ? accent : "#e5e7eb"}`, background: cat.active ? `${accent}15` : "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 16 }}>{cat.icon}</span>
            <span style={{ fontSize: 13, fontWeight: cat.active ? 700 : 500, color: cat.active ? "#b45309" : "#374151" }}>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Product grid */}
      <div style={{ padding: "32px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>สินค้าแนะนำ</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>แสดง {products.length} จาก 1,247 รายการ</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>เรียงตาม:</span>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
              ขายดีที่สุด <span style={{ color: "#9ca3af" }}>▾</span>
            </div>
            <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "7px 12px", background: "#f9fafb" }}>▦</div>
              <div style={{ padding: "7px 12px" }}>☰</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {products.map((p) => (
            <div key={p.name} style={{ background: "#fff", borderRadius: 18, border: "1px solid #f3f4f6", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "relative" }}>
              {p.old && (
                <div style={{ position: "absolute", top: 12, left: 12, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, zIndex: 1 }}>
                  SALE
                </div>
              )}
              <div style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, cursor: "pointer" }}>
                <span style={{ fontSize: 14 }}>🤍</span>
              </div>
              {/* Product image */}
              <div style={{ height: 180, background: p.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>
                {p.icon}
              </div>
              {/* Info */}
              <div style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>{p.brand}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 8, lineHeight: 1.4 }}>{p.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <Stars filled={p.rating} color={accent} />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>({p.sold.toLocaleString()})</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>{p.price}</span>
                  {p.old && <span style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through" }}>{p.old}</span>}
                </div>
                <button style={{ width: "100%", background: "#111", color: "#fff", padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <span>🛒</span> เพิ่มลงตะกร้า
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ background: "#f9fafb", borderTop: "1px solid #f0f0f0", padding: "32px 56px", display: "flex", justifyContent: "center", gap: 64 }}>
        {[
          { icon: "🚚", title: "ส่งฟรีทั่วไทย", sub: "เมื่อสั่งครบ ฿499" },
          { icon: "↩️", title: "คืนสินค้าได้ 30 วัน", sub: "ไม่พอใจ คืนเงินทันที" },
          { icon: "🔒", title: "ชำระเงินปลอดภัย", sub: "SSL 256-bit encryption" },
          { icon: "⭐", title: "รับประกันคุณภาพ", sub: "สินค้าแท้ 100%" },
        ].map((b) => (
          <div key={b.title} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28 }}>{b.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{b.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: "landing-simple", name: "Landing Page",    tier: "Simple",     tag: "Frontend",   tagColor: "#6366f1", desc: "Clean SaaS landing — hero, features, testimonials, CTA",      accentColor: "#6366f1", Preview: LandingSimplePreview },
  { id: "landing-pro",    name: "Landing Page",    tier: "Pro",        tag: "Frontend",   tagColor: "#a855f7", desc: "Dark premium — hero, stats, feature grid, pricing plans",      accentColor: "#a855f7", Preview: LandingProPreview },
  { id: "dashboard",      name: "Admin Dashboard", tier: "Full-stack", tag: "Full-stack", tagColor: CLAUDE_ORANGE, desc: "Analytics panel — KPI cards, line chart, donut, data table", accentColor: CLAUDE_ORANGE, Preview: DashboardPreview },
  { id: "webapp",         name: "Web App",         tier: "CRUD",       tag: "Full-stack", tagColor: "#10b981", desc: "Kanban board — drag-drop tasks, assignees, labels, filters",   accentColor: "#10b981", Preview: WebAppPreview },
  { id: "ecommerce",      name: "E-Commerce",      tier: "Shop",       tag: "Full-stack", tagColor: "#f59e0b", desc: "Online store — product grid, hero banner, cart, categories",   accentColor: "#f59e0b", Preview: EcommercePreview },
];

// ─────────────────────────────────────────────────────────────────────────────
// Gallery Component
// ─────────────────────────────────────────────────────────────────────────────

export default function TemplateGallery() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [win, setWin] = useState({ w: 1280, h: 900 });
  const openTpl = TEMPLATES.find((t) => t.id === openId) ?? null;

  // Responsive window size
  useEffect(() => {
    const update = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ESC key to close modal
  useEffect(() => {
    if (!openId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenId(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openId]);

  const isMobile = win.w < 640;
  const isTablet = win.w < 1024;

  // Modal dimensions
  const modalW = isMobile ? win.w - 16 : isTablet ? Math.round(win.w * 0.96) : Math.min(Math.round(win.w * 0.92), 1200);
  const modalScale = modalW / FULL_W;
  // Inner container height at full scale — content scrolls inside
  const modalInnerH = Math.round((win.h * 0.84 - 130) / modalScale);

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Web Templates Preview</h2>
            <p className="text-xs text-slate-300 mt-0.5">กดดูตัวอย่าง live ของแต่ละ package — โชว์ลูกค้าได้เลย</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: "#fdf3ef", color: CLAUDE_ORANGE, border: "1px solid #f5d6c8" }}>
            {TEMPLATES.length} templates
          </span>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setOpenId(tpl.id)}
              className="group rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-200 text-left overflow-hidden w-full"
              style={{ border: "1px solid #ede9e3" }}
            >
              {/* Mini preview — clips scaled content */}
              <div className="w-full relative overflow-hidden" style={{ height: CARD_H, background: "#f8fafc" }}>
                <div style={{
                  width: FULL_W,
                  transformOrigin: "top left",
                  transform: `scale(${CARD_SCALE})`,
                  pointerEvents: "none",
                  userSelect: "none",
                }}>
                  <tpl.Preview />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.45)" }}>
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-lg"
                    style={{ background: tpl.accentColor }}>
                    <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </div>
                </div>
              </div>

              {/* Card info */}
              <div className="px-4 py-3.5" style={{ borderTop: "1px solid #f5f2ee" }}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight truncate">{tpl.name}</p>
                    <p className="text-xs font-bold" style={{ color: tpl.accentColor }}>{tpl.tier}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `${tpl.tagColor}15`, color: tpl.tagColor }}>
                    {tpl.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-snug line-clamp-2">{tpl.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Modal ── */}
      {openTpl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ padding: isMobile ? 8 : 16, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              width: modalW,
              maxHeight: isMobile ? "100dvh" : "92vh",
              background: "#fff",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Browser chrome header */}
            <div className="flex items-center justify-between shrink-0"
              style={{ padding: isMobile ? "10px 14px" : "12px 20px", borderBottom: "1px solid #f0ece6", background: "#fff" }}>
              <div className="flex items-center gap-2 min-w-0">
                {/* Traffic lights — hide on very small screens */}
                {!isMobile && (
                  <div className="flex gap-1.5 shrink-0">
                    {["#ef4444","#f59e0b","#22c55e"].map((c) => (
                      <div key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 min-w-0 flex-1"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", maxWidth: isMobile ? 160 : 260 }}>
                  <svg className="size-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  <span className="text-xs text-slate-400 truncate">preview.yourclient.com</span>
                </div>
                <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg hidden sm:inline"
                  style={{ background: `${openTpl.accentColor}15`, color: openTpl.accentColor }}>
                  {openTpl.name} — {openTpl.tier}
                </span>
              </div>
              <button onClick={() => setOpenId(null)}
                className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-all">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview — inner scroll at full scale, outer clips visually */}
            <div className="flex-1 overflow-hidden relative" style={{ width: modalW }}>
              <div
                style={{
                  width: FULL_W,
                  height: modalInnerH,
                  transformOrigin: "top left",
                  transform: `scale(${modalScale})`,
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <openTpl.Preview />
              </div>
            </div>

            {/* Footer — template switcher */}
            <div className="flex items-center justify-between shrink-0"
              style={{ padding: isMobile ? "10px 14px" : "12px 20px", borderTop: "1px solid #f0ece6", background: "#fafaf9" }}>
              <div className="flex gap-1.5 flex-wrap">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => setOpenId(t.id)}
                    className="rounded-lg text-xs font-semibold transition-all"
                    style={{
                      padding: isMobile ? "5px 10px" : "6px 14px",
                      ...(t.id === openId
                        ? { background: openTpl.accentColor, color: "#fff" }
                        : { background: "#f1f5f9", color: "#64748b" }),
                    }}>
                    {isMobile ? t.tier.slice(0, 4) : t.tier}
                  </button>
                ))}
              </div>
              {!isMobile && (
                <p className="text-xs text-slate-400 shrink-0 ml-4">ESC เพื่อปิด</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
