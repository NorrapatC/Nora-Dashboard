"use client";
// NRP HQ — "The Studio" Mission Control. A single WARM page (matches the app theme
// + the IMG_6832 reference): topbar + left context panel (week / today's focus /
// team) + central isometric studio (IsoOffice, chibi-pixel team) + right detail /
// activity + bottom stats bar. Per-agent "activity" is driven by pipeline status.
// Replaces the old neon-dark 4-view toggle.

import Image from "next/image";
import { useEffect, useState } from "react";
import { PIPELINE_STAGES, type StageStatus } from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";
import IsoOffice from "@/components/IsoOffice";

// ── Warm palette (app theme) ──
const C = {
  bg: "#f3efe6", panel: "#ffffff", panelAlt: "#faf6ee", border: "#ece1d0", border2: "#f0e8db",
  brand: "#c96442", text: "#4a4032", sub: "#7a6e5c", muted: "#a89a85", dim: "#c4b8a4",
  sage: "#cdd2b6",
};
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const STATUS: Record<StageStatus, { label: string; color: string }> = {
  in_progress: { label: "WORKING", color: "#16a34a" },
  completed:   { label: "DONE",    color: "#0ea5e9" },
  blocked:     { label: "BLOCKED", color: "#ef4444" },
  idle:        { label: "IDLE",    color: "#b8ad97" },
};

const ISO_AGENTS = PIPELINE_STAGES.map((s) => ({ id: s.id, name: s.agent.name, color: s.agent.color }));

// Mock activity feed (decorative until real data is wired).
const ACTIVITY = [
  { who: "Luna", msg: "API validation deployed", color: "#10b981" },
  { who: "Vera", msg: "security scan — 0 threats", color: "#ef4444" },
  { who: "Mia",  msg: "component tree optimized", color: "#8b5cf6" },
  { who: "Sage", msg: "query plan tuned", color: "#0ea5e9" },
  { who: "Iris", msg: "review — 0 critical", color: "#f59e0b" },
  { who: "Zoe",  msg: "47 tests passing", color: "#06b6d4" },
];

function useClock() {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function PixelAvatar({ id, size }: { id: string; size: number }) {
  return (
    <span className="relative inline-block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size, border: `1px solid ${C.border}`, background: "#f0d3b2" }}>
      <Image src={`/team/pixel/${id}.png`} alt="" fill sizes={`${size}px`} className="object-cover object-top"
        style={{ imageRendering: "pixelated" }} />
    </span>
  );
}

export default function HQStudio() {
  const clock = useClock();
  const { getEffectiveStatus, getStageState, progress } = usePipeline();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const statusOf = (id: string) => getEffectiveStatus(id);
  const working = PIPELINE_STAGES.filter((s) => statusOf(s.id) === "in_progress");
  const focus = (working.length ? working : PIPELINE_STAGES.filter((s) => statusOf(s.id) !== "completed")).slice(0, 3);

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg, color: C.text }}>
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between py-3 shrink-0 pl-16 pr-4 md:px-5"
        style={{ background: C.panel, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-baseline gap-2.5">
          <span style={{ color: C.brand, fontWeight: 800, letterSpacing: 0.5 }}>◆ NRP HQ</span>
          <span style={{ color: C.muted, fontSize: 11, letterSpacing: 2, fontFamily: MONO }}>MISSION CONTROL</span>
        </div>
        <div className="flex items-center gap-3" style={{ fontFamily: MONO, fontSize: 11 }}>
          <span style={{ color: C.sub }}>
            <b style={{ color: "#16a34a" }}>{progress.inProgress}</b> / {progress.total} active
          </span>
          <span style={{ color: C.muted }}>⏱ {clock}</span>
        </div>
      </header>

      {/* ── Main: context | studio | detail ── */}
      <div className="flex min-h-0 flex-1">
        {/* Left context panel */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-3 overflow-y-auto p-3"
          style={{ borderRight: `1px solid ${C.border}` }}>
          {/* This week */}
          <div className="rounded-xl p-3" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
            <p style={{ color: C.muted, fontSize: 10, letterSpacing: 1.5, fontFamily: MONO }}>THIS WEEK</p>
            <p className="mt-1" style={{ fontSize: 13, fontWeight: 700 }}>
              <b style={{ color: C.brand, fontSize: 18 }}>{progress.completed}</b>
              <span style={{ color: C.muted }}> / {progress.total} shipped</span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "#eee5d6" }}>
              <div className="h-full rounded-full" style={{ width: `${progress.pct}%`, background: C.brand }} />
            </div>
          </div>
          {/* Today's focus */}
          <div className="rounded-xl p-3" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
            <p style={{ color: C.muted, fontSize: 10, letterSpacing: 1.5, fontFamily: MONO }}>TODAY&apos;S FOCUS</p>
            <div className="mt-2 space-y-2">
              {focus.map((s, i) => (
                <div key={s.id} className="flex items-start gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: "#fdf3ef", color: C.brand }}>{i + 1}</span>
                  <span style={{ fontSize: 11, color: C.sub, lineHeight: 1.3 }}>{s.label} <span style={{ color: C.dim }}>· {s.agent.name}</span></span>
                </div>
              ))}
            </div>
          </div>
          {/* Team */}
          <div className="rounded-xl p-2 flex-1" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
            <p className="px-1 pb-1" style={{ color: C.muted, fontSize: 10, letterSpacing: 1.5, fontFamily: MONO }}>TEAM · {PIPELINE_STAGES.length}</p>
            <div className="space-y-0.5">
              {PIPELINE_STAGES.map((s) => {
                const st = STATUS[statusOf(s.id)];
                const active = selectedId === s.id;
                return (
                  <button key={s.id} onClick={() => setSelectedId(active ? null : s.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors"
                    style={{ background: active ? "#fdf3ef" : "transparent" }}>
                    <PixelAvatar id={s.id} size={22} />
                    <span className="flex-1 truncate" style={{ fontSize: 11.5, fontWeight: 600 }}>{s.agent.name}</span>
                    <span className="size-1.5 rounded-full" style={{ background: st.color }} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center: the studio */}
        <main className="relative min-w-0 flex-1" style={{ background: "#eceee0" }}>
          <IsoOffice agents={ISO_AGENTS} selectedId={selectedId} onSelect={setSelectedId} />
        </main>

        {/* Right: detail or activity */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col overflow-y-auto"
          style={{ background: C.panel, borderLeft: `1px solid ${C.border}` }}>
          {selectedId
            ? <AgentDetail stageId={selectedId} onClose={() => setSelectedId(null)} getStageState={getStageState} statusOf={statusOf} />
            : <ActivityFeed />}
        </aside>
      </div>

      {/* ── Bottom stats bar ── */}
      <footer className="flex items-center gap-4 overflow-x-auto px-4 py-2.5 shrink-0"
        style={{ background: C.panel, borderTop: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11 }}>
        <Stat label="READY" value={progress.total - progress.completed - progress.inProgress - progress.blocked} color={C.sub} />
        <Stat label="IN PROGRESS" value={progress.inProgress} color="#16a34a" />
        <Stat label="DONE" value={progress.completed} color="#0ea5e9" />
        <Stat label="BLOCKED" value={progress.blocked} color={progress.blocked ? "#ef4444" : C.sub} />
        <span style={{ color: C.border }}>│</span>
        <Stat label="QUEUE" value={3} color={C.sub} />
        <Stat label="RUNS TODAY" value={128} color={C.sub} />
        <span className="ml-auto" style={{ color: C.muted }}>● all systems online</span>
      </footer>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-center gap-1.5 shrink-0">
      <span style={{ color: "#a89a85", letterSpacing: 1 }}>{label}</span>
      <b style={{ color, fontSize: 13 }}>{value}</b>
    </span>
  );
}

function ActivityFeed() {
  return (
    <>
      <PanelTitle>ACTIVITY</PanelTitle>
      <div className="flex-1 space-y-2.5 px-3 py-2">
        {ACTIVITY.map((a, i) => (
          <div key={i} className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ background: a.color }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{a.who}</span>
            </div>
            <p className="pl-3" style={{ fontSize: 10.5, color: C.muted }}>{a.msg} ✓</p>
          </div>
        ))}
      </div>
    </>
  );
}

function AgentDetail({ stageId, onClose, getStageState, statusOf }: {
  stageId: string; onClose: () => void;
  getStageState: (id: string) => { startedAt: string | null; completedAt: string | null; note: string | null };
  statusOf: (id: string) => StageStatus;
}) {
  const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
  if (!stage) return <ActivityFeed />;
  const meta = STATUS[statusOf(stageId)];
  const state = getStageState(stageId);
  const fmt = (iso: string | null) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); } catch { return "—"; }
  };
  return (
    <>
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
        <span style={{ color: C.brand, fontSize: 10, letterSpacing: 2, fontFamily: MONO }}>◆ AGENT</span>
        <button onClick={onClose} style={{ color: C.muted, fontSize: 14 }} aria-label="Close">✕</button>
      </div>
      <div className="flex items-center gap-3 px-3 py-3" style={{ borderBottom: `1px solid ${C.border2}` }}>
        <PixelAvatar id={stage.id} size={52} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span>{stage.agent.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{stage.agent.name}</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>{stage.agent.role}</div>
          <div className="mt-1 inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: meta.color }} />
            <span style={{ fontSize: 9, letterSpacing: 1, color: meta.color, fontFamily: MONO }}>[{meta.label}]</span>
          </div>
        </div>
      </div>
      <Field label="CURRENT TASK">
        <div style={{ fontSize: 12, fontWeight: 700 }}>{stage.label}</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{stage.description}</div>
      </Field>
      <Field label="TIMING">
        <Row k="Started" v={fmt(state.startedAt)} />
        <Row k="Completed" v={fmt(state.completedAt)} />
      </Field>
      {state.note && <Field label="NOTE"><div style={{ fontSize: 11, color: C.text }}>{state.note}</div></Field>}
    </>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.brand, fontSize: 10, letterSpacing: 2, fontFamily: MONO }}>◆ {children}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-2.5 space-y-1" style={{ borderBottom: `1px solid ${C.border2}` }}>
      <div style={{ color: C.muted, fontSize: 9, letterSpacing: 1.5, fontFamily: MONO }}>{label}</div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ fontSize: 11, color: C.muted }}>{k}</span>
      <span style={{ fontSize: 11, color: C.text }}>{v}</span>
    </div>
  );
}
