"use client";
// NRP HQ — Command Center HUD.
// A pixel/neon operations dashboard that FRAMES the Phaser walking office:
//   ┌ header (title + live clock) ──────────────────────────┐
//   │ TEAM STATUS │   [ Phaser office ]   │ DETAIL / FEED    │
//   └ bottom metrics bar ───────────────────────────────────┘
//
// Per-agent status is REAL: pulled from the pipeline (usePipeline) — the same
// state the homepage pipeline board uses. Clicking an agent in TEAM STATUS swaps
// the right column to a per-agent DETAIL panel (portrait + current task + times +
// blockers). The bottom metrics (queue / runs / success) stay decorative for now —
// each block is isolated so a real source (n8n→Notion) can replace it later.
// Aesthetic is original — inspired by HUD dashboards, not copied.

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PIPELINE_STAGES, type StageStatus } from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";

// Phaser office — same dynamic(ssr:false) pattern used on the /hq page.
const HQGame = dynamic(() => import("@/components/HQGame"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: "#0a0e17" }}>
      <div className="text-center space-y-3">
        <div className="mx-auto size-7 animate-spin rounded-full border-2"
          style={{ borderColor: "#1e2a3d", borderTopColor: "#22d3ee" }} />
        <p style={{ color: "#3d5170", fontSize: "11px", fontFamily: "monospace" }}>BOOTING HQ...</p>
      </div>
    </div>
  ),
});

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0e17",
  panel: "#0f1623",
  panelHi: "#131c2e",
  border: "#1e2a3d",
  cyan: "#22d3ee",
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
  brand: "#c96442",
  text: "#cbd5e1",
  muted: "#5b6b85",
  dim: "#3d4d68",
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

// Faint HUD grid for the background (very low alpha → never fights the text).
const GRID =
  "repeating-linear-gradient(0deg, rgba(34,211,238,0.035) 0 1px, transparent 1px 40px)," +
  "repeating-linear-gradient(90deg, rgba(34,211,238,0.035) 0 1px, transparent 1px 40px)";

// Group the 11 agents by department for the TEAM STATUS list.
const DEPARTMENTS: { name: string; ids: string[] }[] = [
  { name: "COMMAND",     ids: ["nora", "aria"] },
  { name: "DEVELOPMENT", ids: ["mia", "luna", "sage"] },
  { name: "OPERATIONS",  ids: ["vera", "iris", "zoe", "rex"] },
  { name: "CREATIVE",    ids: ["nova", "lyra"] },
];

// Mock hourly "runs" for the bottom-bar sparkline (decorative).
const RUNS_SPARK = [3, 5, 4, 8, 6, 9, 7, 11, 8, 12, 10, 14];

// Map the pipeline's real StageStatus → HUD label + color.
const STATUS_META: Record<StageStatus, { label: string; color: string; glow: boolean }> = {
  in_progress: { label: "WORKING", color: C.green, glow: true },
  completed:   { label: "DONE",    color: C.cyan,  glow: true },
  blocked:     { label: "BLOCKED", color: C.red,   glow: true },
  idle:        { label: "IDLE",    color: C.dim,   glow: false },
};

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

// ─── Small building blocks ────────────────────────────────────────────────────
function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.cyan, fontSize: 9 }}>◆</span>
      <span style={{ color: C.cyan, fontFamily: MONO, fontSize: 10, letterSpacing: 2 }}>{children}</span>
    </div>
  );
}

function Dot({ color, glow = true, pulse = false }: { color: string; glow?: boolean; pulse?: boolean }) {
  return (
    <span
      className={`inline-block size-2 rounded-full shrink-0 ${pulse ? "animate-pulse" : ""}`}
      style={{ background: color, boxShadow: glow ? `0 0 6px ${color}` : "none" }}
    />
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-sm" style={{ background: "#0a0f1a" }}>
      <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
    </div>
  );
}

// ─── Count-up animation (numbers tick up on mount) ────────────────────────────
function useCountUp(target: number, ms = 800): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

function CountUp({ end, decimals = 0, suffix = "" }: { end: number; decimals?: number; suffix?: string }) {
  const n = useCountUp(end);
  return <>{n.toFixed(decimals)}{suffix}</>;
}

// ─── Sparkline (tiny inline bar chart) ────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px" style={{ height: 14 }}>
      {data.map((v, i) => (
        <span key={i} className="inline-block w-1 rounded-sm"
          style={{ height: `${Math.max(12, (v / max) * 100)}%`, background: color, opacity: 0.45 + 0.55 * (v / max) }} />
      ))}
    </div>
  );
}

// ─── Live clock (client-only → no hydration mismatch) ──────────────────────────
function useClock() {
  const [t, setT] = useState("--:--:--");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// Mock activity feed lines.
const ACTIVITY: Array<{ who: string; msg: string; color: string }> = [
  { who: "Luna", msg: "API validation deployed", color: "#10b981" },
  { who: "Vera", msg: "security scan — 0 threats", color: "#ef4444" },
  { who: "Mia",  msg: "component tree optimized", color: "#8b5cf6" },
  { who: "Sage", msg: "query plan tuned", color: "#0ea5e9" },
  { who: "Iris", msg: "review — 0 critical", color: "#f59e0b" },
  { who: "Zoe",  msg: "47 tests passing", color: "#06b6d4" },
  { who: "Rex",  msg: "CI/CD all green", color: "#64748b" },
  { who: "Nova", msg: "tokens synced", color: "#ec4899" },
];

export default function HQCommandCenter() {
  const clock = useClock();
  const { getEffectiveStatus, progress } = usePipeline();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg, backgroundImage: GRID, fontFamily: MONO }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between py-2.5 shrink-0 pl-16 pr-4 md:px-4"
        style={{ background: C.panel, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: C.brand, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>◆ NRP HQ</span>
          <span style={{ color: C.muted, fontSize: 10, letterSpacing: 3 }}>COMMAND CENTER</span>
          <span style={{ color: C.dim, fontSize: 9 }}>v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5" style={{ color: C.green, fontSize: 10 }}>
            <Dot color={C.green} /> ALL SYSTEMS ONLINE
          </span>
          <span style={{ color: C.text, fontSize: 12, letterSpacing: 1 }}>⏱ {clock}</span>
        </div>
      </div>

      {/* ── Main row: TEAM | OFFICE | DETAIL/FEED ──────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* Left — TEAM STATUS (click a row → detail on the right) */}
        <aside className="hidden md:flex w-[248px] shrink-0 flex-col" style={{ background: C.panel, borderRight: `1px solid ${C.border}` }}>
          <PanelTitle>TEAM STATUS</PanelTitle>
          <div className="flex-1 overflow-y-auto">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.name}>
                <div className="px-3 pt-2.5 pb-1" style={{ color: C.dim, fontSize: 8, letterSpacing: 2 }}>
                  ▸ {dept.name}
                </div>
                {dept.ids.map((id) => {
                  const s = PIPELINE_STAGES.find((st) => st.id === id);
                  if (!s) return null;
                  const status = getEffectiveStatus(id);
                  const meta = STATUS_META[status];
                  const active = selectedId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedId(active ? null : id)}
                      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors"
                      style={{
                        borderLeft: `2px solid ${active ? meta.color : "transparent"}`,
                        background: active ? C.panelHi : "transparent",
                      }}
                    >
                      <Dot color={meta.color} glow={meta.glow} pulse={status === "in_progress"} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span style={{ color: C.text, fontSize: 11, fontWeight: 700 }}>{s.agent.name}</span>
                          <span className="truncate" style={{ color: C.dim, fontSize: 9 }}>{s.agent.role}</span>
                        </div>
                      </div>
                      <span style={{ color: meta.color, fontSize: 8, letterSpacing: 1 }}>[{meta.label}]</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Stats block — real counts from the pipeline */}
          <div className="grid grid-cols-2 gap-px shrink-0" style={{ background: C.border, borderTop: `1px solid ${C.border}` }}>
            <Stat label="ACTIVE" value={<><CountUp end={progress.inProgress} />/{progress.total}</>} color={C.green} />
            <Stat label="DONE" value={<CountUp end={progress.completed} />} color={C.cyan} />
            <Stat label="PROGRESS" value={<CountUp end={progress.pct} suffix="%" />} color={C.amber} bar={progress.pct} />
            <Stat label="BLOCKED" value={<CountUp end={progress.blocked} />} color={progress.blocked ? C.red : C.green} />
          </div>
        </aside>

        {/* Center — COMMAND CENTER (Phaser office) */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          <PanelTitle>COMMAND CENTER — LIVE OFFICE · คลิกตัวละครเพื่อดูรายละเอียด</PanelTitle>
          <div className="relative flex-1" style={{ minHeight: 0, background: "#1a1a19" }}>
            <HQGame onAgentClick={setSelectedId} />
            {/* CRT scanline overlay — purely cosmetic; pointer-events-none lets
                clicks pass straight through to the Phaser canvas underneath. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 3px)" }}
            />
          </div>
        </main>

        {/* Right — AGENT DETAIL when selected, else ACTIVITY FEED */}
        <aside className="hidden lg:flex w-[260px] shrink-0 flex-col" style={{ background: C.panel, borderLeft: `1px solid ${C.border}` }}>
          {selectedId
            ? <AgentDetail stageId={selectedId} onClose={() => setSelectedId(null)} />
            : <ActivityFeed />}
        </aside>
      </div>

      {/* ── Bottom metrics bar ─────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 shrink-0"
        style={{ background: C.panel, borderTop: `1px solid ${C.border}` }}>
        <Metric label="PIPELINE" value={`${progress.completed}/${progress.total}`} color={C.cyan} />
        <Sep />
        <Metric label="AUTO MODE" value="ON" color={C.green} />
        <Sep />
        <Metric label="QUEUE" value={<CountUp end={3} />} color={C.text} />
        <Sep />
        <div className="flex items-center gap-1.5 px-2 shrink-0">
          <span style={{ color: C.muted, fontSize: 9, letterSpacing: 1 }}>RUNS TODAY</span>
          <span style={{ color: C.text, fontSize: 11, fontWeight: 700 }}><CountUp end={128} /></span>
          <Sparkline data={RUNS_SPARK} color={C.cyan} />
        </div>
        <Sep />
        <Metric label="SUCCESS" value={<CountUp end={98.7} decimals={1} suffix="%" />} color={C.green} />
        <Sep />
        <div className="flex items-center gap-2 px-2 shrink-0">
          <span style={{ color: C.muted, fontSize: 9, letterSpacing: 1 }}>SYSTEM HEALTH</span>
          <div className="flex items-center gap-0.5">
            {[C.green, C.green, C.green, C.green, C.amber].map((c, i) => (
              <span key={i} className="inline-block" style={{ width: 5, height: 12, background: c, boxShadow: `0 0 4px ${c}` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Right column: ACTIVITY FEED (default) ────────────────────────────────────
function ActivityFeed() {
  return (
    <>
      <PanelTitle>ACTIVITY FEED</PanelTitle>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {ACTIVITY.map((a, i) => (
          <div key={i} className="leading-tight">
            <div className="flex items-center gap-1.5">
              <Dot color={a.color} glow={false} />
              <span style={{ color: C.text, fontSize: 10, fontWeight: 700 }}>{a.who}</span>
            </div>
            <p className="pl-3.5" style={{ color: C.muted, fontSize: 9 }}>{a.msg} ✓</p>
          </div>
        ))}
      </div>
      <div className="shrink-0 px-3 py-2.5 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
        <span style={{ color: C.cyan, fontSize: 9, letterSpacing: 2 }}>CONFIDENCE</span>
        <Bar pct={92} color={C.green} />
        <div className="flex justify-between" style={{ color: C.muted, fontSize: 9 }}>
          <span>INDEXED 12,842</span><span style={{ color: C.green }}>92%</span>
        </div>
      </div>
    </>
  );
}

// ─── Right column: per-agent AGENT DETAIL ─────────────────────────────────────
// Real data from the pipeline: status, task label/description, started/completed
// timestamps, note, and which upstream agents this one is waiting on.
function AgentDetail({ stageId, onClose }: { stageId: string; onClose: () => void }) {
  const { getStageState, getEffectiveStatus } = usePipeline();
  const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
  if (!stage) return <ActivityFeed />;

  const state = getStageState(stageId);
  const status = getEffectiveStatus(stageId);
  const meta = STATUS_META[status];
  const deps = stage.dependsOn
    .map((id) => PIPELINE_STAGES.find((s) => s.id === id))
    .filter((s): s is (typeof PIPELINE_STAGES)[number] => Boolean(s));

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
        <span style={{ color: C.cyan, fontFamily: MONO, fontSize: 10, letterSpacing: 2 }}>◆ AGENT DETAIL</span>
        <button onClick={onClose} style={{ color: C.muted, fontSize: 14, lineHeight: 1 }} aria-label="Close detail">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Portrait + identity */}
        <div className="flex items-center gap-3 px-3 py-3" style={{ borderBottom: `1px solid #0c1320` }}>
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg"
            style={{ border: `1px solid ${meta.color}`, boxShadow: `0 0 8px ${meta.color}66` }}>
            <Image src={`/team/${stage.agent.id}.png`} alt={stage.agent.name} fill className="object-cover object-top" sizes="56px" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 13 }}>{stage.agent.emoji}</span>
              <span style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{stage.agent.name}</span>
            </div>
            <div style={{ color: C.dim, fontSize: 10 }}>{stage.agent.role}</div>
            <div className="mt-1 inline-flex items-center gap-1.5">
              <Dot color={meta.color} glow={meta.glow} />
              <span style={{ color: meta.color, fontSize: 9, letterSpacing: 1 }}>[{meta.label}]</span>
            </div>
          </div>
        </div>

        {/* Current task */}
        <Field label="CURRENT TASK">
          <div style={{ color: C.text, fontSize: 11, fontWeight: 700 }}>{stage.label}</div>
          <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.4 }}>{stage.description}</div>
        </Field>

        {/* Timestamps */}
        <Field label="TIMING">
          <Row k="Started" v={fmtTime(state.startedAt)} />
          <Row k="Completed" v={fmtTime(state.completedAt)} />
        </Field>

        {/* Note */}
        {state.note && (
          <Field label="NOTE">
            <div style={{ color: C.text, fontSize: 10, lineHeight: 1.4 }}>{state.note}</div>
          </Field>
        )}

        {/* Blockers / dependencies */}
        {deps.length > 0 && (
          <Field label="WAITING ON">
            {deps.map((dp) => {
              const dStatus = getEffectiveStatus(dp.id);
              const dMeta = STATUS_META[dStatus];
              return (
                <div key={dp.id} className="flex items-center gap-1.5 py-0.5">
                  <Dot color={dMeta.color} glow={false} />
                  <span style={{ color: C.text, fontSize: 10 }}>{dp.agent.name}</span>
                  <span style={{ color: dMeta.color, fontSize: 8, letterSpacing: 1 }}>[{dMeta.label}]</span>
                </div>
              );
            })}
          </Field>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-2.5 space-y-1" style={{ borderBottom: `1px solid #0c1320` }}>
      <div style={{ color: C.dim, fontSize: 8, letterSpacing: 1.5 }}>{label}</div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: C.muted, fontSize: 10 }}>{k}</span>
      <span style={{ color: C.text, fontSize: 10 }}>{v}</span>
    </div>
  );
}

function Stat({ label, value, color, bar }: { label: string; value: React.ReactNode; color: string; bar?: number }) {
  return (
    <div className="px-3 py-2" style={{ background: "#0f1623" }}>
      <div style={{ color: C.dim, fontSize: 8, letterSpacing: 1 }}>{label}</div>
      <div style={{ color, fontSize: 14, fontWeight: 700 }}>{value}</div>
      {typeof bar === "number" && <div className="mt-1"><Bar pct={bar} color={color} /></div>}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 shrink-0">
      <span style={{ color: C.muted, fontSize: 9, letterSpacing: 1 }}>{label}</span>
      <span style={{ color, fontSize: 11, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function Sep() {
  return <span className="shrink-0" style={{ color: C.border }}>│</span>;
}
