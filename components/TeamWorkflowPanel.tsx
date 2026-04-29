"use client";
import { useEffect, useState } from "react";

interface Member {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  keywords: string[];
  analyze: (topic: string) => string[];
}

const ALL_MEMBERS: Member[] = [
  {
    id: "nora", name: "Nora", role: "Secretary", emoji: "📋", color: "#c96442",
    keywords: ["plan","สรุป","requirement","organize","summary","วางแผน","req"],
    analyze: (t) => [
      `สรุป scope ของ "${t}" แบ่งเป็น deliverable ชัดเจน`,
      "จัดลำดับ priority และ assign ให้แต่ละ member",
      "ตั้ง checkpoint และ definition of done",
    ],
  },
  {
    id: "aria", name: "Aria", role: "Tech Lead", emoji: "⚡", color: "#6366f1",
    keywords: ["architecture","system","api","backend","structure","database","db","design","ระบบ"],
    analyze: (t) => [
      `ออกแบบ system architecture สำหรับ "${t}"`,
      "เลือก tech stack ที่เหมาะสม และวาง dependency graph",
      "เขียน ADR (Architecture Decision Record) ไว้อ้างอิง",
    ],
  },
  {
    id: "mia", name: "Mia", role: "Frontend", emoji: "🎨", color: "#ec4899",
    keywords: ["ui","frontend","page","หน้า","component","layout","dashboard","form","table","button","display"],
    analyze: (t) => [
      `วาง component structure และ state management สำหรับ "${t}"`,
      "ระบุ reusable components และ props interface",
      "เช็ค responsive breakpoint และ accessibility",
    ],
  },
  {
    id: "luna", name: "Luna", role: "Backend", emoji: "🌙", color: "#8b5cf6",
    keywords: ["api","endpoint","route","backend","service","logic","integration","server","request"],
    analyze: (t) => [
      `ออกแบบ API endpoints สำหรับ "${t}" พร้อม request/response schema`,
      "วาง business logic และ validation rules",
      "เช็ค error handling และ HTTP status codes",
    ],
  },
  {
    id: "sage", name: "Sage", role: "Database", emoji: "🗄️", color: "#0ea5e9",
    keywords: ["database","db","schema","prisma","migration","table","query","sql","data","store"],
    analyze: (t) => [
      `ออกแบบ schema สำหรับ "${t}" พร้อม relations และ indexes`,
      "เขียน migration script และ seed data",
      "วิเคราะห์ query performance และ N+1 risks",
    ],
  },
  {
    id: "nova", name: "Nova", role: "UI/UX Designer", emoji: "✨", color: "#f59e0b",
    keywords: ["wireframe","ux","mockup","prototype","visual","design","สีหน้า","interface"],
    analyze: (t) => [
      `สร้าง wireframe flow สำหรับ "${t}"`,
      "กำหนด color, typography, spacing ให้ consistent กับ design system",
      "วิเคราะห์ user journey และ pain points",
    ],
  },
  {
    id: "rex", name: "Rex", role: "DevOps", emoji: "🔧", color: "#10b981",
    keywords: ["deploy","ci","cd","docker","server","build","pipeline","infra","host","environment","vercel","netlify","aws","gcp","cloud","container","kubernetes","k8s","nginx","pm2","monitoring","log","ssl","domain","dns","github actions","workflow","release","production","staging","env","secret","scale","load","backup"],
    analyze: (t) => {
      const lower = t.toLowerCase();
      const isWeb = /next|react|vue|frontend|web|vercel|netlify|static/.test(lower);
      const isDocker = /docker|container|k8s|kubernetes|compose/.test(lower);
      const isCloud = /aws|gcp|azure|cloud|ec2|s3|lambda/.test(lower);
      const isDB = /database|db|postgres|mysql|redis|mongo/.test(lower);
      const isCI = /ci|cd|github action|workflow|pipeline|test|build/.test(lower);

      const base = [
        `วาง CI/CD pipeline สำหรับ "${t}" — แนะนำ GitHub Actions: build → test → deploy อัตโนมัติ`,
        "กำหนด environment variables ด้วย .env.local (dev) และ Secrets ใน CI — ห้าม hardcode ใน code",
        "เขียน health check endpoint (/api/health) และตั้ง auto-restart กรณี crash",
        "วาง rollback strategy: deploy ผ่าน immutable releases หรือ blue-green deployment",
        "ตั้ง monitoring + alerting — Uptime Robot (free) หรือ Sentry สำหรับ runtime errors",
      ];

      const extras: string[] = [];

      if (isWeb) extras.push("สำหรับ Next.js: deploy บน Vercel ง่ายสุด — auto-preview ทุก PR, edge network ฟรี");
      if (isDocker) extras.push("เขียน multi-stage Dockerfile: builder stage แยกจาก production image ลด size 60–70%");
      if (isCloud) extras.push("ใช้ IAM roles แทน Access Keys — หมุน secrets ทุก 90 วัน, เปิด CloudTrail/audit log");
      if (isDB) extras.push("ตั้ง automated daily backup + ทดสอบ restore ทุกเดือน — database ไม่มี backup = time bomb");
      if (isCI) extras.push("เพิ่ม cache dependencies ใน CI (actions/cache) ลด build time 50–80%");

      return [...base, ...extras].slice(0, 5);
    },
  },
  {
    id: "vera", name: "Vera", role: "Security", emoji: "🛡️", color: "#ef4444",
    keywords: ["auth","security","login","token","permission","encrypt","password","access"],
    analyze: (t) => [
      `ตรวจ attack surface สำหรับ "${t}" (injection, XSS, CSRF)`,
      "กำหนด authentication และ authorization rules",
      "เช็ค sensitive data ที่ไม่ควร expose ใน response",
    ],
  },
  {
    id: "iris", name: "Iris", role: "Code Review", emoji: "👁️", color: "#6b7280",
    keywords: ["review","code","quality","refactor","bug","fix","แก้","clean","pattern"],
    analyze: (t) => [
      `กำหนด review checklist สำหรับ "${t}"`,
      "ระบุ code smell ที่ต้องระวัง และ naming conventions",
      "วาง PR template และ acceptance criteria",
    ],
  },
  {
    id: "zoe", name: "Zoe", role: "QA Engineer", emoji: "🧪", color: "#84cc16",
    keywords: ["test","qa","bug","verify","validate","ทดสอบ","check","coverage"],
    analyze: (t) => [
      `เขียน test cases สำหรับ "${t}" — happy path และ edge cases`,
      "กำหนด acceptance criteria และ regression scope",
      "วาง E2E test scenario ที่ต้องผ่านก่อน ship",
    ],
  },
  {
    id: "lyra", name: "Lyra", role: "Tech Writer", emoji: "📝", color: "#f97316",
    keywords: ["doc","readme","document","คู่มือ","guide","write","explain"],
    analyze: (t) => [
      `เขียน README และ usage guide สำหรับ "${t}"`,
      "Document API endpoints พร้อม request/response examples",
      "สร้าง changelog entry และ migration notes",
    ],
  },
];

const AGENT_NAME_TO_ID: Record<string, string> = {
  Nora: "nora", Aria: "aria", Nova: "nova", Sage: "sage", Mia: "mia",
  Luna: "luna", Vera: "vera", Iris: "iris", Zoe: "zoe", Rex: "rex", Lyra: "lyra",
};

type Stage = "idle" | "reading" | "analyzing" | "done";

interface MemberState {
  member: Member;
  stage: Stage;
  findings: string[];
}

export interface Props {
  topic: string | null;
  assignedTo?: string;
  runKey: number;
}

function resolveTeam(topic: string, assignedTo?: string): Member[] {
  const lower = topic.toLowerCase();
  const byKeyword = ALL_MEMBERS.filter((m) => m.keywords.some((k) => lower.includes(k)));
  const primary: Member[] = [ALL_MEMBERS[0]]; // Nora always leads
  if (assignedTo) {
    const id = AGENT_NAME_TO_ID[assignedTo];
    const m = ALL_MEMBERS.find((m) => m.id === id);
    if (m && m.id !== "nora") primary.push(m);
  }
  const seen = new Set(primary.map((m) => m.id));
  for (const m of byKeyword) {
    if (!seen.has(m.id)) { primary.push(m); seen.add(m.id); }
  }
  if (primary.length < 3) {
    [ALL_MEMBERS[1], ALL_MEMBERS[2]].forEach((m) => {
      if (!seen.has(m.id)) { primary.push(m); seen.add(m.id); }
    });
  }
  return primary.slice(0, 6);
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export default function TeamWorkflowPanel({ topic, assignedTo, runKey }: Props) {
  const [states, setStates] = useState<MemberState[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isDone, setIsDone] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!topic) return;
    setIsDone(false);
    setExpanded(new Set());
    const team = resolveTeam(topic, assignedTo);
    setStates(team.map((m) => ({ member: m, stage: "idle", findings: [] })));
    setIsRunning(true);
    let cancelled = false;

    (async () => {
      for (let i = 0; i < team.length; i++) {
        if (cancelled) return;
        await delay(i === 0 ? 150 : 80);
        setStates((p) => p.map((s, idx) => idx === i ? { ...s, stage: "reading" } : s));
        await delay(500 + Math.random() * 300);
        if (cancelled) return;
        setStates((p) => p.map((s, idx) => idx === i ? { ...s, stage: "analyzing" } : s));
        await delay(900 + Math.random() * 600);
        if (cancelled) return;
        const findings = team[i].analyze(topic);
        setStates((p) => p.map((s, idx) => idx === i ? { ...s, stage: "done", findings } : s));
        setExpanded((prev) => new Set([...prev, team[i].id]));
      }
      if (!cancelled) { setIsRunning(false); setIsDone(true); }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  if (!topic || states.length === 0) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm px-6 py-8 text-center" style={{ borderColor: "#ede9e3" }}>
        <p className="text-2xl mb-2">📋</p>
        <p className="text-sm font-medium text-slate-500">พิมพ์หัวข้อแล้วกด "ส่งให้ทีม"</p>
        <p className="text-xs text-slate-400 mt-1">Nora จะ dispatch ไปยัง member ที่เกี่ยวข้อง</p>
      </div>
    );
  }

  const doneCount = states.filter((s) => s.stage === "done").length;

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#ede9e3" }}>
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderBottom: "1px solid #f0ece6" }}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Team Analysis</p>
          <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{topic}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">{doneCount}/{states.length}</span>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
            style={isDone
              ? { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }
              : { background: "#eef2ff", color: "#6366f1", border: "1px solid #c7d2fe" }}>
            {isDone ? "✓ Complete" : "● Analyzing"}
          </span>
        </div>
      </div>

      {/* Member cards */}
      <div className="divide-y" style={{ borderColor: "#f7f4f0" }}>
        {states.map((ms) => {
          const isExpanded = expanded.has(ms.member.id);
          return (
            <div key={ms.member.id}>
              {/* Member row */}
              <button
                onClick={() => ms.stage === "done" && setExpanded((p) => {
                  const n = new Set(p);
                  n.has(ms.member.id) ? n.delete(ms.member.id) : n.add(ms.member.id);
                  return n;
                })}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/60 transition-colors"
              >
                <div className="relative shrink-0">
                  <div className="size-8 rounded-lg flex items-center justify-center text-base"
                    style={{ background: ms.member.color + "15" }}>
                    {ms.member.emoji}
                  </div>
                  {ms.stage === "analyzing" && (
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                  {ms.stage === "done" && (
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                  )}
                  {ms.stage === "reading" && (
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-amber-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">{ms.member.name}
                    <span className="ml-1.5 font-normal text-slate-400">{ms.member.role}</span>
                  </p>
                  <p className="text-[10px] mt-0.5"
                    style={{ color: ms.stage === "analyzing" ? "#6366f1" : ms.stage === "done" ? "#16a34a" : ms.stage === "reading" ? "#d97706" : "#94a3b8" }}>
                    {ms.stage === "analyzing" ? "กำลังวิเคราะห์..." : ms.stage === "done" ? `${ms.findings.length} ข้อ พร้อมแล้ว` : ms.stage === "reading" ? "กำลังอ่านหัวข้อ..." : "รอ"}
                  </p>
                </div>

                {ms.stage === "analyzing" && (
                  <div className="flex gap-0.5 shrink-0">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-0.5 rounded-full bg-indigo-400"
                        style={{ height: `${6 + (i % 3) * 3}px`, animation: `bounce 0.7s ${i * 0.12}s ease-in-out infinite alternate` }} />
                    ))}
                  </div>
                )}

                {ms.stage === "done" && (
                  <svg className="size-3.5 text-slate-300 shrink-0 transition-transform duration-200"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "" }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Findings */}
              {ms.stage === "done" && isExpanded && (
                <div className="px-4 pb-3 space-y-1.5 bg-slate-50/40">
                  {ms.findings.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2">
                      <span className="text-[10px] font-bold mt-0.5 shrink-0" style={{ color: ms.member.color }}>
                        {fi + 1}.
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">{f}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDone && (
        <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid #f0ece6" }}>
          <p className="text-[11px] text-slate-400">
            ✅ ทีมวิเคราะห์เสร็จแล้ว — พร้อม implement
          </p>
        </div>
      )}
    </div>
  );
}
