"use client";
// NRP HQ — Reference HUD view. Recreates the look of the reference command-center:
// a glowing workflow-graph centerpiece, framed by a grid of role panels that each
// pair the agent's HD portrait with their live status + a headline role metric.
// This is the "characters and their work, together, in one neon language" view.

import Image from "next/image";
import { PIPELINE_STAGES, type StageStatus } from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";
import HQWorkflowGraph from "@/components/HQWorkflowGraph";

const C = {
  panel: "#0f1623", panelHi: "#131c2e", border: "#1e2a3d",
  cyan: "#22d3ee", green: "#34d399", amber: "#fbbf24", red: "#f87171",
  brand: "#c96442", text: "#cbd5e1", muted: "#5b6b85", dim: "#3d4d68",
};
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const STATUS_META: Record<StageStatus, { label: string; color: string }> = {
  in_progress: { label: "WORKING", color: C.green },
  completed:   { label: "DONE",    color: C.cyan },
  blocked:     { label: "BLOCKED", color: C.red },
  idle:        { label: "IDLE",    color: C.dim },
};

// One headline metric per role (mock flavour — matches the reference's per-role widgets).
const HEADLINE: Record<string, string> = {
  nora: "Queue 3", aria: "ADR 4", nova: "AA ✓", sage: "8 tables", mia: "23 cmp",
  luna: "12 endpts", vera: "0 threats", iris: "0 critical", zoe: "47 tests ✓",
  rex: "CI green", lyra: "6 docs",
};

export default function HQHud({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const { getEffectiveStatus } = usePipeline();

  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: MONO }}>
      {/* Graph centerpiece */}
      <div className="relative min-h-0 flex-[3]" style={{ borderBottom: `1px solid ${C.border}` }}>
        <HQWorkflowGraph selectedId={selectedId} onSelect={onSelect} />
      </div>

      {/* Role panels — portrait + status + headline metric */}
      <div className="flex-[2] min-h-0 overflow-y-auto p-2">
        <div className="grid gap-1.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {PIPELINE_STAGES.map((s) => {
            const status = getEffectiveStatus(s.id);
            const meta = STATUS_META[status];
            const sel = selectedId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="flex items-center gap-2 rounded-md p-1.5 text-left transition-all"
                style={{
                  background: sel ? C.panelHi : C.panel,
                  border: `1px solid ${sel ? meta.color : C.border}`,
                  boxShadow: sel ? `0 0 8px ${meta.color}44` : "none",
                }}
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded"
                  style={{ border: `1px solid ${s.agent.color}88`, boxShadow: `0 0 6px ${s.agent.color}33` }}>
                  <Image src={`/team/${s.id}.png`} alt={s.agent.name} fill className="object-cover object-top" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span style={{ color: C.text, fontSize: 10, fontWeight: 700 }}>{s.agent.name}</span>
                    <span className={`inline-block size-1.5 rounded-full ${status === "in_progress" ? "animate-pulse" : ""}`}
                      style={{ background: meta.color, boxShadow: `0 0 5px ${meta.color}` }} />
                  </div>
                  <div className="truncate" style={{ color: meta.color, fontSize: 8, letterSpacing: 0.5 }}>{HEADLINE[s.id]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
