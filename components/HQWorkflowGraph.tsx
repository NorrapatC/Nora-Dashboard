"use client";
// NRP HQ — Workflow Graph view (the reference's "command center" centerpiece).
// Renders the REAL pipeline as a dependency graph: nodes = agents laid out by
// dependency depth (tier), edges = `dependsOn`, colors = live status, and edges
// whose upstream agent is WORKING animate a flowing dash. Click a node → the same
// AGENT DETAIL panel the office/list use. Pure SVG + CSS → zero runtime cost.

import { PIPELINE_STAGES, type StageStatus } from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";

const COL: Record<StageStatus, string> = {
  in_progress: "#34d399",
  completed: "#22d3ee",
  blocked: "#f87171",
  idle: "#3d4d68",
};

export default function HQWorkflowGraph({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { getEffectiveStatus } = usePipeline();

  // ── Tier (dependency depth) per stage: 0 = no deps, else 1 + max(dep depths) ──
  const depth = new Map<string, number>();
  const depthOf = (id: string): number => {
    if (depth.has(id)) return depth.get(id)!;
    const st = PIPELINE_STAGES.find((s) => s.id === id);
    const v = st && st.dependsOn.length ? 1 + Math.max(...st.dependsOn.map(depthOf)) : 0;
    depth.set(id, v);
    return v;
  };
  PIPELINE_STAGES.forEach((s) => depthOf(s.id));
  const maxTier = Math.max(...depth.values());

  // group stages by tier (column)
  const tiers: string[][] = [];
  PIPELINE_STAGES.forEach((s) => {
    const t = depth.get(s.id)!;
    (tiers[t] ||= []).push(s.id);
  });

  // ── Layout: tiers across X, members stacked down Y ──
  const W = 840, H = 380, padX = 56, padY = 36;
  const colW = (W - padX * 2) / Math.max(1, maxTier);
  const pos = new Map<string, { x: number; y: number }>();
  tiers.forEach((ids, t) => {
    const x = padX + t * colW;
    const gap = (H - padY * 2) / ids.length;
    ids.forEach((id, i) => pos.set(id, { x, y: padY + gap * (i + 0.5) }));
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <style>{`@keyframes hqflow{to{stroke-dashoffset:-16}}.hq-flow{animation:hqflow .6s linear infinite}`}</style>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* faint central glow — the "AI core" feel */}
        <defs>
          <radialGradient id="hqcore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={W / 2} cy={H / 2} r={150} fill="url(#hqcore)" />

        {/* edges */}
        {PIPELINE_STAGES.flatMap((s) =>
          s.dependsOn.map((dep) => {
            const a = pos.get(dep);
            const b = pos.get(s.id);
            if (!a || !b) return null;
            const up = getEffectiveStatus(dep);
            const working = up === "in_progress";
            const mx = (a.x + b.x) / 2;
            return (
              <path
                key={`${dep}-${s.id}`}
                d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`}
                fill="none"
                stroke={COL[up]}
                strokeWidth={1.5}
                strokeOpacity={0.55}
                strokeDasharray={working ? "4 4" : undefined}
                className={working ? "hq-flow" : undefined}
              />
            );
          })
        )}

        {/* nodes */}
        {PIPELINE_STAGES.map((s) => {
          const p = pos.get(s.id)!;
          const status = getEffectiveStatus(s.id);
          const c = COL[status];
          const sel = selectedId === s.id;
          return (
            <g
              key={s.id}
              transform={`translate(${p.x},${p.y})`}
              onClick={() => onSelect(s.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                r={sel ? 18 : 15}
                fill="#0f1623"
                stroke={c}
                strokeWidth={sel ? 3 : 2}
                style={{ filter: `drop-shadow(0 0 ${sel ? 9 : 4}px ${c})` }}
              />
              <text textAnchor="middle" dy="4.5" fontSize="13">{s.agent.emoji}</text>
              <text textAnchor="middle" y="30" fontSize="9" fill="#cbd5e1" fontFamily="monospace" fontWeight={sel ? 700 : 400}>
                {s.agent.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
