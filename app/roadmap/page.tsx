"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import TopBar from "@/components/TopBar";

const ORANGE = "#c96442";
const STORAGE_KEY = "safe-devops-roadmap-v2";

// ─── Types ────────────────────────────────────────────────
interface Subtask { id: string; label: string }
interface Task { id: string; label: string; est: string; desc: string; subtasks: Subtask[] }
interface Sprint {
  id: string;
  num: number;
  title: string;
  weeks: string;
  difficulty: string;
  why: string;
  color: string;
  bg: string;
  tasks: Task[];
  projects: string[];
  videos: string[];
  output: string;
}

// ─── Data ─────────────────────────────────────────────────
const SPRINTS: Sprint[] = [
  {
    id: "s1", num: 1, title: "Git & Deploy", weeks: "Week 1–2", difficulty: "Beginner",
    color: ORANGE, bg: "rgba(201,100,66,0.08)",
    why: "Safe ใช้ Git อยู่แล้ว แต่ workflow ยังไม่เป็นระบบ — ถ้า workflow แข็ง ทำงานเป็นทีมได้ทันที + freelance ส่งงานเป็นมืออาชีพ",
    tasks: [
      {
        id: "1-1", label: "Git branching strategy", est: "2 hr",
        desc: "main / develop / feature/* / fix/* — ไม่ push ตรง main อีกต่อไป",
        subtasks: [
          { id: "1-1-a", label: "สร้าง branch: main / develop" },
          { id: "1-1-b", label: "สร้าง feature branch: feature/xxx ทำงานจริง 1 feature" },
          { id: "1-1-c", label: "ลอง fix branch: fix/xxx แก้ bug 1 ตัว" },
          { id: "1-1-d", label: "Merge feature → develop → main ผ่าน PR" },
        ],
      },
      {
        id: "1-2", label: "Commit message convention", est: "30 min",
        desc: "Conventional Commits: feat: / fix: / chore: / docs: / refactor:",
        subtasks: [
          { id: "1-2-a", label: "เรียนรู้ format: feat: / fix: / chore: / docs: / refactor:" },
          { id: "1-2-b", label: "ใช้จริงกับ commits 10 ครั้งถัดไป" },
        ],
      },
      {
        id: "1-3", label: "PR workflow — self review", est: "1 hr",
        desc: "สร้าง PR ให้ตัวเอง review ก่อน merge ทุกครั้ง ฝึกเป็นนิสัย",
        subtasks: [
          { id: "1-3-a", label: "สร้าง PR template (.github/pull_request_template.md)" },
          { id: "1-3-b", label: "สร้าง PR จริง 3 ครั้ง — review diff ตัวเองก่อน merge" },
          { id: "1-3-c", label: "ใช้ GitHub Labels: feature / bugfix / docs" },
        ],
      },
      {
        id: "1-4", label: "Deploy income-expense บน Vercel", est: "2 hr",
        desc: "Deploy project จริงที่มี Prisma + SQLite — ตั้ง env vars, preview URL",
        subtasks: [
          { id: "1-4-a", label: "Connect GitHub repo กับ Vercel" },
          { id: "1-4-b", label: "ตั้ง Environment Variables บน Vercel dashboard" },
          { id: "1-4-c", label: "แก้ build errors — ส่วนใหญ่จะเจอ prisma generate" },
          { id: "1-4-d", label: "ทดสอบ production URL — ลอง CRUD จริง" },
        ],
      },
      {
        id: "1-5", label: "Preview deployments", est: "30 min",
        desc: "ทุก PR มี preview URL อัตโนมัติ — ดูผลจริงก่อน merge",
        subtasks: [
          { id: "1-5-a", label: "สร้าง PR → ดู Vercel bot comment preview URL" },
          { id: "1-5-b", label: "คลิก preview URL → ทดสอบ feature ใน preview env" },
        ],
      },
    ],
    projects: ["income-expense", "dashboard"],
    videos: ["Fireship — Git for Professionals (13 min)", "Vercel — Deploy Next.js (10 min)"],
    output: "project ที่ deploy ได้จริง + PR workflow ที่เป็นระบบ",
  },
  {
    id: "s2", num: 2, title: "CI/CD Pipeline", weeks: "Week 3–4", difficulty: "Beginner-Mid",
    color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",
    why: "ทุกบริษัทใช้ CI/CD — ถ้าทำเป็น Safe จะโดดเด่นในทีม NIS ทันที และ push → auto deploy ไม่ต้องทำมือ",
    tasks: [
      {
        id: "2-1", label: "เข้าใจ CI/CD concept", est: "1 hr",
        desc: "CI = test auto ทุก push | CD = deploy auto ถ้า test ผ่าน",
        subtasks: [
          { id: "2-1-a", label: "เข้าใจ: trigger → job → step → action" },
          { id: "2-1-b", label: "workflow file อยู่ที่ .github/workflows/*.yml" },
          { id: "2-1-c", label: "ดู GitHub Actions marketplace — เข้าใจว่า action = plugin" },
        ],
      },
      {
        id: "2-2", label: "สร้าง CI workflow แรก", est: "2 hr",
        desc: "on push → install → tsc --noEmit → build — ถ้า fail จะไม่ merge ได้",
        subtasks: [
          { id: "2-2-a", label: "สร้างไฟล์ .github/workflows/ci.yml" },
          { id: "2-2-b", label: "Push → ดู Actions tab บน GitHub → เห็น workflow run" },
          { id: "2-2-c", label: "ลอง push code ที่ fail (type error) → ดูว่า CI จับได้" },
          { id: "2-2-d", label: "แก้ให้ pass → เข้าใจ feedback loop" },
        ],
      },
      {
        id: "2-3", label: "เพิ่ม Lint + cache", est: "1 hr",
        desc: "ESLint auto-check ทุก PR + npm cache ลดเวลา CI จาก 2 นาที → 45 วินาที",
        subtasks: [
          { id: "2-3-a", label: "ตั้ง ESLint config (ถ้ายังไม่มี)" },
          { id: "2-3-b", label: "เพิ่ม step: npm run lint ก่อน tsc" },
          { id: "2-3-c", label: "ใช้ actions/setup-node กับ cache: 'npm'" },
        ],
      },
      {
        id: "2-4", label: "Branch protection rules", est: "30 min",
        desc: "main ไม่สามารถ push ตรงได้ — ต้องผ่าน PR + CI เท่านั้น",
        subtasks: [
          { id: "2-4-a", label: "GitHub Settings → Branches → Add rule สำหรับ main" },
          { id: "2-4-b", label: "Require status checks (CI) to pass before merging" },
          { id: "2-4-c", label: "ลอง push ตรง main → ต้อง reject" },
        ],
      },
      {
        id: "2-5", label: "Status badge + README", est: "15 min",
        desc: "ใส่ CI badge ใน README — บอก recruiter / client ว่า project มี CI",
        subtasks: [
          { id: "2-5-a", label: "GitHub Actions → workflow → ... → Create status badge" },
          { id: "2-5-b", label: "วาง badge markdown ไว้บนสุดของ README.md" },
        ],
      },
    ],
    projects: ["dashboard", "income-expense"],
    videos: ["TechWorld with Nana — GitHub Actions Tutorial", "Fireship — CI/CD in 100 Seconds"],
    output: "pipeline ที่ auto lint → type check → build ทุก PR",
  },
  {
    id: "s3", num: 3, title: "Docker", weeks: "Week 5–7", difficulty: "Mid",
    color: "#3b82f6", bg: "rgba(59,130,246,0.08)",
    why: "Docker = ภาษากลางของ DevOps — 'มันทำงานบนเครื่องฉัน' จะไม่เกิดอีก เพราะ container เหมือนกันทุกที่",
    tasks: [
      {
        id: "3-1", label: "Docker mental model", est: "2 hr",
        desc: "Image = recipe | Container = dish ที่ run ได้ | Volume = data ที่ persist",
        subtasks: [
          { id: "3-1-a", label: "ติดตั้ง Docker Desktop" },
          { id: "3-1-b", label: "docker run hello-world → เข้าใจ pull + run" },
          { id: "3-1-c", label: "docker run -it node:20-alpine sh → เข้าไปใน container" },
          { id: "3-1-d", label: "docker ps, docker images, docker stop — basic commands" },
          { id: "3-1-e", label: "เข้าใจ: image layers, caching, why alpine is small" },
        ],
      },
      {
        id: "3-2", label: "เขียน Dockerfile ให้ income-expense", est: "3 hr",
        desc: "Containerize project จริงที่มี Prisma — layer order สำคัญมาก",
        subtasks: [
          { id: "3-2-a", label: "สร้าง Dockerfile — FROM node:20-alpine" },
          { id: "3-2-b", label: "COPY package*.json ก่อน → RUN npm ci (layer caching)" },
          { id: "3-2-c", label: "RUN npx prisma generate → COPY . . → RUN npm run build" },
          { id: "3-2-d", label: "สร้าง .dockerignore (node_modules, .next, .git)" },
          { id: "3-2-e", label: "docker build + docker run -p 3001:3001 → เทสจริง" },
        ],
      },
      {
        id: "3-3", label: "Docker Compose", est: "2 hr",
        desc: "Run app + database ด้วย command เดียว — docker compose up",
        subtasks: [
          { id: "3-3-a", label: "สร้าง docker-compose.yml — service: app" },
          { id: "3-3-b", label: "ใช้ volumes mount SQLite file → data persist" },
          { id: "3-3-c", label: "docker compose up -d → logs → down" },
        ],
      },
      {
        id: "3-4", label: "Docker networking basics", est: "1 hr",
        desc: "container คุยกันยังไง — port mapping, service discovery",
        subtasks: [
          { id: "3-4-a", label: "เข้าใจ -p 3001:3001 → host:container" },
          { id: "3-4-b", label: "ลอง 2 containers ใน compose คุยกันผ่าน service name" },
          { id: "3-4-c", label: "docker network ls, docker network inspect" },
        ],
      },
    ],
    projects: ["income-expense"],
    videos: ["TechWorld with Nana — Docker Tutorial (3 hrs)", "Fireship — Docker in 100 Seconds"],
    output: "project ที่ run ได้ใน Docker container + compose file",
  },
  {
    id: "s4", num: 4, title: "Env & Secrets", weeks: "Week 8–9", difficulty: "Beginner-Mid",
    color: "#22c55e", bg: "rgba(34,197,94,0.08)",
    why: "env vars ที่จัดการไม่ดี = security incident รอเกิด — Freelance project ทุกตัวต้องทำให้ถูกตั้งแต่วันแรก",
    tasks: [
      {
        id: "4-1", label: "แยก environments ชัดเจน", est: "1 hr",
        desc: ".env.development / .env.production — เข้าใจ NEXT_PUBLIC_ prefix",
        subtasks: [
          { id: "4-1-a", label: "แยก .env.development กับ .env.production สำหรับ dashboard" },
          { id: "4-1-b", label: "เข้าใจ: Next.js load .env ตามลำดับไหน" },
          { id: "4-1-c", label: "เข้าใจ NEXT_PUBLIC_ — client vs server env vars" },
        ],
      },
      {
        id: "4-2", label: "Vercel env vars management", est: "30 min",
        desc: "ตั้ง secrets ผ่าน Vercel dashboard แยก Production / Preview / Dev",
        subtasks: [
          { id: "4-2-a", label: "ตั้ง env vars → เลือก scope (Production/Preview/Dev)" },
          { id: "4-2-b", label: "ใช้ vercel env pull → sync env vars มา local" },
        ],
      },
      {
        id: "4-3", label: ".env.example template", est: "30 min",
        desc: "ให้คนอื่น (หรือตัวเอง 6 เดือนหน้า) setup ได้ทันที",
        subtasks: [
          { id: "4-3-a", label: "สร้าง .env.example สำหรับทุก project" },
          { id: "4-3-b", label: "ใส่ comment อธิบายว่าแต่ละ var ใช้ทำอะไร" },
        ],
      },
      {
        id: "4-4", label: "Runtime env validation", est: "1.5 hr",
        desc: "App crash ทันทีตอน startup ถ้า env ขาด — ด้วย zod schema",
        subtasks: [
          { id: "4-4-a", label: "สร้าง env.ts — validate ด้วย zod ตอน startup" },
          { id: "4-4-b", label: "ลอง ลบ env var → app ต้อง crash พร้อม error message ชัด" },
          { id: "4-4-c", label: "ใช้ env.ts แทน process.env ตรงๆ ทุกที่" },
        ],
      },
      {
        id: "4-5", label: ".gitignore audit", est: "30 min",
        desc: "ตรวจว่า .gitignore ครบ — ไม่มี .env, credentials, SQLite DB หลุดเข้า repo",
        subtasks: [
          { id: "4-5-a", label: "เช็ค .gitignore ทุก project — มี .env*, *.db, .next" },
          { id: "4-5-b", label: "git log --all -- '*.env*' เช็คว่าเคย commit .env ไหม" },
        ],
      },
    ],
    projects: ["dashboard", "income-expense"],
    videos: [],
    output: "env ที่ validate ได้ + .env.example + gitignore ที่ครบ",
  },
  {
    id: "s5", num: 5, title: "Monitoring", weeks: "Week 10–12", difficulty: "Mid",
    color: "#06b6d4", bg: "rgba(6,182,212,0.08)",
    why: "Deploy แล้วไม่รู้ว่า app พังไหม = ขับรถปิดตา — Monitoring ทำให้รู้ก่อน user ว่ามีปัญหา",
    tasks: [
      {
        id: "5-1", label: "Sentry error tracking", est: "2 hr",
        desc: "รู้ทันทีเมื่อ user เจอ error พร้อม stack trace + user context",
        subtasks: [
          { id: "5-1-a", label: "สร้าง Sentry account (free) + project สำหรับ Next.js" },
          { id: "5-1-b", label: "npx @sentry/wizard@latest -i nextjs → auto setup" },
          { id: "5-1-c", label: "ลอง throw error ใน code → ดูว่า Sentry จับได้" },
          { id: "5-1-d", label: "ตั้ง alert → ส่ง email เมื่อเจอ error ใหม่" },
        ],
      },
      {
        id: "5-2", label: "Error boundary + error.tsx", est: "1.5 hr",
        desc: "App crash → user เห็นหน้า error สวยๆ แทนที่จะเป็นจอขาว",
        subtasks: [
          { id: "5-2-a", label: "สร้าง error.tsx + global-error.tsx ใน app/" },
          { id: "5-2-b", label: "ต่อกับ Sentry → error boundary report อัตโนมัติ" },
          { id: "5-2-c", label: "ออกแบบ error page ให้ user friendly (retry, go home)" },
        ],
      },
      {
        id: "5-3", label: "UptimeRobot", est: "30 min",
        desc: "เช็คว่า app ยังอยู่ทุก 5 นาที — alert ทาง email ถ้า down",
        subtasks: [
          { id: "5-3-a", label: "สร้าง UptimeRobot account (free 50 monitors)" },
          { id: "5-3-b", label: "Add monitor สำหรับ production URL" },
          { id: "5-3-c", label: "สร้าง /api/health endpoint สำหรับ health check" },
        ],
      },
      {
        id: "5-4", label: "Vercel Analytics + Web Vitals", est: "30 min",
        desc: "เปิด Vercel Analytics — ดู LCP, CLS, FID ฟรี",
        subtasks: [
          { id: "5-4-a", label: "เปิด Analytics ใน Vercel dashboard" },
          { id: "5-4-b", label: "เข้าใจ Core Web Vitals: LCP, CLS, FID" },
        ],
      },
      {
        id: "5-5", label: "Structured logging", est: "1 hr",
        desc: "เปลี่ยน console.log → logger utility ที่ search ได้ filter ได้",
        subtasks: [
          { id: "5-5-a", label: "สร้าง logger: logger.info() / logger.error() / logger.warn()" },
          { id: "5-5-b", label: "Log format: { timestamp, level, message, context }" },
          { id: "5-5-c", label: "แทนที่ console.log ใน API routes ด้วย logger" },
        ],
      },
    ],
    projects: ["income-expense", "dashboard"],
    videos: ["Fireship — Sentry in 100 Seconds", "Vercel — Analytics Overview"],
    output: "error tracking + uptime monitor + structured logging",
  },
  {
    id: "s6", num: 6, title: "Linux & Networking", weeks: "Week 13–16", difficulty: "Mid-Advanced",
    color: "#ec4899", bg: "rgba(236,72,153,0.08)",
    why: "Vercel ซ่อน infrastructure ให้หมด แต่ถ้า freelance client ต้อง deploy บน VPS ต้องรู้พื้นฐานนี้",
    tasks: [
      {
        id: "6-1", label: "Linux command line", est: "3 hr",
        desc: "Terminal commands ที่ใช้จริงบน server — file, permissions, processes",
        subtasks: [
          { id: "6-1-a", label: "File: ls, cd, cp, mv, rm, mkdir, cat, grep" },
          { id: "6-1-b", label: "Permissions: chmod, chown, rwx notation (755, 644)" },
          { id: "6-1-c", label: "Process: ps, htop, kill, systemctl, journalctl" },
          { id: "6-1-d", label: "Pipe: |, >, >>, 2>&1" },
          { id: "6-1-e", label: "Practice: docker run -it ubuntu bash → Linux playground" },
        ],
      },
      {
        id: "6-2", label: "SSH basics", est: "1 hr",
        desc: "เข้า server ระยะไกล ใช้ key pair แทน password",
        subtasks: [
          { id: "6-2-a", label: "ssh-keygen → สร้าง key pair" },
          { id: "6-2-b", label: "เข้าใจ public key vs private key (ล็อค vs กุญแจ)" },
          { id: "6-2-c", label: "เพิ่ม SSH key ใน GitHub → clone ผ่าน SSH" },
        ],
      },
      {
        id: "6-3", label: "DNS & Domain", est: "1.5 hr",
        desc: "domain → IP address เกิดขึ้นยังไง — A record, CNAME, NS, TTL",
        subtasks: [
          { id: "6-3-a", label: "dig/nslookup → query DNS record จริง" },
          { id: "6-3-b", label: "เข้าใจ: A, AAAA, CNAME, MX, TXT records" },
          { id: "6-3-c", label: "เข้าใจ TTL — ทำไม DNS change ใช้เวลา propagate" },
        ],
      },
      {
        id: "6-4", label: "SSL/TLS & HTTPS", est: "1 hr",
        desc: "ทำไมต้อง HTTPS — certificate ทำงานยังไง, Let's Encrypt คืออะไร",
        subtasks: [
          { id: "6-4-a", label: "เข้าใจ: TLS handshake, certificate, CA" },
          { id: "6-4-b", label: "เข้าใจ: Let's Encrypt → free SSL certificate" },
          { id: "6-4-c", label: "ดู certificate ของ website จริงใน browser (click lock icon)" },
        ],
      },
      {
        id: "6-5", label: "Nginx reverse proxy", est: "2 hr",
        desc: "ตั้ง Nginx เป็น reverse proxy route traffic เข้า Node.js app",
        subtasks: [
          { id: "6-5-a", label: "Run Nginx ใน Docker → ดู default page" },
          { id: "6-5-b", label: "เขียน nginx.conf → proxy_pass ไป Node.js app" },
          { id: "6-5-c", label: "Docker compose: nginx + app → run ด้วย command เดียว" },
        ],
      },
      {
        id: "6-6", label: "Deploy บน Railway", est: "2 hr",
        desc: "ลอง deploy platform อื่นนอกจาก Vercel — เข้าใจ trade-offs",
        subtasks: [
          { id: "6-6-a", label: "Deploy e-commerce บน Railway ใช้ Dockerfile ที่มี" },
          { id: "6-6-b", label: "ตั้ง env vars + persistent volume สำหรับ SQLite" },
          { id: "6-6-c", label: "เปรียบเทียบ: Vercel vs Railway" },
        ],
      },
    ],
    projects: ["e-commerce", "income-expense"],
    videos: ["NetworkChuck — Linux for Hackers", "Fireship — Networking in 100 Seconds", "TechWorld with Nana — Nginx Tutorial"],
    output: "SSH + Nginx + Railway deploy + networking fundamentals",
  },
];

const ALL_IDS = SPRINTS.flatMap((s) =>
  s.tasks.flatMap((t) => [t.id, ...t.subtasks.map((st) => st.id)])
);
const TOTAL = ALL_IDS.length;

// ─── Hooks ────────────────────────────────────────────────
function useChecked() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch { setChecked({}); }
    setMounted(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { checked, toggle, mounted };
}

// ─── Animated Number ──────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    ref.current = 0;
    const step = value / 30;
    const interval = setInterval(() => {
      ref.current = Math.min(ref.current + step, value);
      setDisplay(Math.round(ref.current));
      if (ref.current >= value) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [value]);
  return <>{display}</>;
}

// ─── Reveal animation ─────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Sprint Card ──────────────────────────────────────────
function SprintCard({ sprint, checked, toggle }: {
  sprint: Sprint;
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const taskIds = sprint.tasks.flatMap((t) => [t.id, ...t.subtasks.map((st) => st.id)]);
  const done = taskIds.filter((id) => checked[id]).length;
  const pct = taskIds.length > 0 ? Math.round((done / taskIds.length) * 100) : 0;
  const allDone = pct === 100;

  return (
    <div
      className="rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-200"
      style={{ border: allDone ? `1px solid rgba(34,197,94,0.3)` : "1px solid #ede9e3" }}
    >
      {/* Header */}
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-4 group"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Number badge */}
        <div
          className="size-10 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0"
          style={{ background: allDone ? "#22c55e" : `linear-gradient(135deg, ${sprint.color}, ${sprint.color}cc)` }}
        >
          {allDone ? "✓" : sprint.num}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-slate-800">{sprint.title}</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: sprint.color }}
            >
              {sprint.weeks}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-slate-500"
              style={{ background: "#f1f5f9" }}>
              {sprint.difficulty}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: allDone ? "#22c55e" : sprint.color }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: sprint.color }}>
              {done}/{taskIds.length}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <svg
          className="size-4 text-slate-400 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible body */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "2000px" : "0px" }}
      >
        <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: "#f0ece6" }}>
          {/* WHY */}
          <div className="mt-4 px-3 py-2.5 rounded-xl text-xs text-slate-500 leading-relaxed"
            style={{ background: sprint.bg, borderLeft: `3px solid ${sprint.color}` }}>
            <span className="font-bold text-slate-700">ทำไม: </span>{sprint.why}
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {sprint.tasks.map((task) => {
              const taskDone = checked[task.id];
              const isExpanded = expandedTask === task.id;
              return (
                <div key={task.id}>
                  {/* Task row */}
                  <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <button
                      className="mt-0.5 size-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200"
                      style={{
                        borderColor: taskDone ? "#22c55e" : "#d1d5db",
                        background: taskDone ? "#22c55e" : "transparent",
                      }}
                      onClick={() => toggle(task.id)}
                    >
                      {taskDone && (
                        <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        className="w-full text-left"
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm font-semibold transition-all"
                            style={{ color: taskDone ? "#94a3b8" : "#1e293b", textDecoration: taskDone ? "line-through" : "none" }}
                          >
                            {task.label}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-slate-400"
                            style={{ background: "#f8fafc" }}>
                            {task.est}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{task.desc}</p>
                      </button>
                    </div>
                    <button
                      className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5"
                      onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                    >
                      <svg
                        className="size-3.5 transition-transform duration-200"
                        style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Subtasks */}
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isExpanded ? "600px" : "0px" }}
                  >
                    <div className="ml-8 mt-1 space-y-1 pb-2 pl-3 border-l-2" style={{ borderColor: "#f0ece6" }}>
                      {task.subtasks.map((sub) => {
                        const subDone = checked[sub.id];
                        return (
                          <div key={sub.id} className="flex items-start gap-2.5 py-1 pr-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <button
                              className="mt-0.5 size-4 rounded shrink-0 border-2 flex items-center justify-center transition-all"
                              style={{
                                borderColor: subDone ? "#22c55e" : "#e2e8f0",
                                background: subDone ? "#22c55e" : "transparent",
                              }}
                              onClick={() => toggle(sub.id)}
                            >
                              {subDone && (
                                <svg className="size-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <span
                              className="text-xs transition-all"
                              style={{ color: subDone ? "#cbd5e1" : "#64748b", textDecoration: subDone ? "line-through" : "none" }}
                            >
                              {sub.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer tags */}
          <div className="pt-2 border-t space-y-2" style={{ borderColor: "#f0ece6" }}>
            {sprint.projects.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-12">Project</span>
                {sprint.projects.map((p) => (
                  <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(201,100,66,0.1)", color: ORANGE }}>
                    {p}
                  </span>
                ))}
              </div>
            )}
            {sprint.videos.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-12">Watch</span>
                {sprint.videos.map((v) => (
                  <span key={v} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                    {v}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-12">Output</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                {sprint.output}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function RoadmapPage() {
  const { checked, toggle, mounted } = useChecked();

  const totalDone = ALL_IDS.filter((id) => checked[id]).length;
  const pct = TOTAL > 0 ? Math.round((totalDone / TOTAL) * 100) : 0;

  const sprintProgress = SPRINTS.map((s) => {
    const ids = s.tasks.flatMap((t) => [t.id, ...t.subtasks.map((st) => st.id)]);
    const done = ids.filter((id) => checked[id]).length;
    return { done, total: ids.length };
  });

  if (!mounted) return null;

  return (
    <>
      <TopBar />
      <main className="px-6 py-6 space-y-6 max-w-3xl">

        {/* ── Header ── */}
        <Reveal>
          <div>
            <h1 className="text-xl font-black text-slate-900">DevOps Roadmap</h1>
            <p className="text-sm text-slate-400 mt-0.5">16 สัปดาห์ · 6 Sprints · ออกแบบเฉพาะสำหรับ Safe ค่ะ</p>
          </div>
        </Reveal>

        {/* ── Stat cards ── */}
        <Reveal delay={60}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Sprints", value: 6, color: ORANGE },
              { label: "Weeks", value: 16, color: "#8b5cf6" },
              { label: "Tasks done", value: totalDone, color: "#22c55e" },
              { label: "Progress", value: pct, suffix: "%", color: "#3b82f6" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className="text-3xl font-black" style={{ color: s.color }}>
                  <AnimatedNumber value={s.value} />{s.suffix ?? ""}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Overall progress ── */}
        <Reveal delay={120}>
          <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-black text-slate-800">Overall Progress</p>
                <p className="text-xs text-slate-400">{totalDone} / {TOTAL} items completed</p>
              </div>
              <span className="text-2xl font-black tabular-nums" style={{ color: ORANGE }}>{pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: `linear-gradient(to right, ${ORANGE}, #e8855e)` }}
              />
            </div>
            {/* Sprint progress mini */}
            <div className="grid grid-cols-6 gap-2">
              {SPRINTS.map((s, i) => {
                const { done, total } = sprintProgress[i];
                const p = total > 0 ? Math.round((done / total) * 100) : 0;
                const allDone = p === 100;
                return (
                  <div key={s.id} className="text-center">
                    <div
                      className="h-1.5 rounded-full mb-1 transition-all duration-700"
                      style={{ background: allDone ? "#22c55e" : p > 0 ? s.color : "#f1f5f9" }}
                    />
                    <p className="text-[9px] font-bold text-slate-400">S{s.num}</p>
                    <p className="text-[9px] text-slate-300">{done}/{total}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* ── Skip list ── */}
        <Reveal delay={150}>
          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
            <p className="text-xs font-black text-slate-800 mb-2">🚫 ยังไม่ต้องเรียนตอนนี้</p>
            <div className="flex gap-2 flex-wrap">
              {["Kubernetes", "Terraform", "AWS Deep Dive", "Ansible", "Prometheus", "Service Mesh"].map((t) => (
                <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full line-through"
                  style={{ background: "#f1f5f9", color: "#94a3b8" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Sprints ── */}
        <div className="space-y-3">
          {SPRINTS.map((sprint, i) => (
            <Reveal key={sprint.id} delay={i * 60}>
              <SprintCard sprint={sprint} checked={checked} toggle={toggle} />
            </Reveal>
          ))}
        </div>

        {/* ── Outcome ── */}
        <Reveal>
          <div
            className="rounded-2xl p-6"
            style={{ background: "linear-gradient(135deg, #1a1a19 0%, #2d2520 60%, #1e1a1e 100%)" }}
          >
            <p className="text-sm font-black text-white mb-1">จบ 4 เดือน Safe จะทำอะไรได้</p>
            <p className="text-xs mb-4" style={{ color: "#8a8078" }}>ไม่ใช่แค่ &quot;รู้&quot; แต่ &quot;ทำได้จริง&quot; กับ project จริง</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { e: "🚀", t: "Deploy ได้เอง", d: "code → test → build → deploy → monitor" },
                { e: "🔄", t: "CI/CD อัตโนมัติ", d: "push → auto lint → type check → build" },
                { e: "📊", t: "Monitor Production", d: "รู้ก่อน user ว่า app มีปัญหา" },
                { e: "🐳", t: "Containerize ได้", d: "'บนเครื่องฉัน' จะไม่เกิดอีก" },
                { e: "🔐", t: "Security-Conscious", d: "จัดการ secrets ถูกต้องตั้งแต่แรก" },
                { e: "💼", t: "Freelance Ready", d: "รับงาน + deploy + monitor ครบ loop" },
              ].map((o) => (
                <div key={o.t} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-lg mb-1">{o.e}</p>
                  <p className="text-xs font-bold text-white mb-0.5">{o.t}</p>
                  <p className="text-[10px]" style={{ color: "#8a8078" }}>{o.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="h-6" />
      </main>
    </>
  );
}
