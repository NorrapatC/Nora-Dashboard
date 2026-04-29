"use client";
import { useState, useMemo, useEffect } from "react";
import {
  PIPELINE_STAGES, PipelineStage, StageStatus,
  toWaves, canTransition, buildStateMap,
} from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";
import PipelineStageNode from "./PipelineStageNode";
import type { Requirement } from "@/components/RequirementsPanel";

const ORANGE = "#c96442";

const STATUS_NEXT: Partial<Record<StageStatus, StageStatus>> = {
  idle: "in_progress",
  in_progress: "completed",
  completed: "idle",
  blocked: "idle",
};

// ─── Detail Panel ────────────────────────────────────────────────────────────

function DetailPanel({ stage, onClose }: { stage: PipelineStage; onClose: () => void }) {
  const { getEffectiveStatus, getStageState, setStageStatus, pipeline } = usePipeline();
  const stateMap = useMemo(() => buildStateMap(pipeline.stages), [pipeline.stages]);

  const status   = getEffectiveStatus(stage.id);
  const state    = getStageState(stage.id);
  const next     = STATUS_NEXT[status];
  const deps     = PIPELINE_STAGES.filter((s) => stage.dependsOn.includes(s.id));

  const { allowed, reason } = next
    ? canTransition(stage, next, stateMap)
    : { allowed: false, reason: undefined };

  const btnLabel: Record<StageStatus, string> = {
    idle:        "▶  Start Stage",
    in_progress: "✓  Mark Complete",
    completed:   "↺  Reset to Idle",
    blocked:     "↺  Reset to Idle",
  };

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 h-full bg-white"
      style={{ border: `1px solid ${stage.agent.color}30` }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: stage.agent.color + "18" }}>
            {stage.agent.emoji}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{stage.agent.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stage.agent.role}</p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xs">
          ✕
        </button>
      </div>

      {/* Label + description */}
      <div>
        <p className="text-xs font-semibold text-slate-700 mb-1">{stage.label}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{stage.description}</p>
      </div>

      {/* Dependencies */}
      {deps.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Depends On</p>
          <div className="flex flex-wrap gap-1.5">
            {deps.map((d) => {
              const done = (stateMap.get(d.id) ?? "idle") === "completed";
              return (
                <span key={d.id}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium"
                  style={done
                    ? { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }
                    : { background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>
                  {d.agent.emoji} {d.agent.name} {done ? "✓" : ""}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Timestamps */}
      {(state.startedAt || state.completedAt) && (
        <div className="space-y-1 border-t border-slate-100 pt-3">
          {state.startedAt && (
            <p className="text-[10px] text-slate-400">Started · {new Date(state.startedAt).toLocaleString()}</p>
          )}
          {state.completedAt && (
            <p className="text-[10px] text-slate-400">Completed · {new Date(state.completedAt).toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {next && (
          <button onClick={() => allowed && setStageStatus(stage.id, next)} disabled={!allowed}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: allowed ? stage.agent.color : "#94a3b8" }}>
            {btnLabel[status]}
          </button>
        )}
        {status !== "blocked" && status !== "completed" && (
          <button onClick={() => setStageStatus(stage.id, "blocked")}
            className="w-full py-2 rounded-xl text-xs font-medium transition-colors"
            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            ✕ Mark as Blocked
          </button>
        )}
        {!allowed && reason && (
          <p className="text-[10px] px-3 py-2 rounded-lg leading-relaxed"
            style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Wave Arrow ──────────────────────────────────────────────────────────────

function WaveArrow() {
  return (
    <div className="flex items-center self-center mx-1 shrink-0">
      <div className="w-5 h-px bg-slate-200" />
      <svg width="6" height="10" viewBox="0 0 6 10" className="text-slate-300">
        <path d="M0 0l6 5-6 5V0z" fill="currentColor" />
      </svg>
    </div>
  );
}

// ─── Pipeline Board ──────────────────────────────────────────────────────────

export default function PipelineBoard() {
  const { progress, resetPipeline, pipeline } = usePipeline();
  const [selectedId, setSelectedId] = useState<string | null>("nora");
  const [reqs, setReqs] = useState<Requirement[]>([]);
  const waves = useMemo(() => toWaves(PIPELINE_STAGES), []);
  const selectedStage = PIPELINE_STAGES.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    fetch("/api/requirements").then((r) => r.json()).then(setReqs).catch(() => {});
  }, []);

  const reqCountByAgent = useMemo(() => {
    const map: Record<string, number> = {};
    reqs.filter((r) => (r.status as string) === "In Progress" || (r.status as string) === "Blocked").forEach((r) => {
      const agent = r.assignedTo.toLowerCase();
      map[agent] = (map[agent] ?? 0) + 1;
    });
    return map;
  }, [reqs]);

  const legendItems = [
    { dot: "#cbd5e1", label: "Idle" },
    { dot: "#f59e0b", label: "Active" },
    { dot: "#10b981", label: "Done" },
    { dot: "#ef4444", label: "Blocked" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid #ede9e3", backgroundColor: "#ffffff" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-4"
        style={{ borderBottom: "1px solid #f0ece6" }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              Development Pipeline
            </span>
            {pipeline.projectName && (
              <span className="text-xs text-slate-400">— {pipeline.projectName}</span>
            )}
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: "rgba(201,100,66,0.1)", color: ORANGE }}
            >
              {progress.pct}% done
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {progress.completed}/{progress.total} stages
            {progress.inProgress > 0 && ` · ${progress.inProgress} active`}
            {progress.blocked > 0 && ` · ${progress.blocked} blocked`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.dot }} />
                <span className="text-[10px] text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { if (confirm("Reset all stages to idle?")) resetPipeline(); }}
            className="text-[11px] text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-0.5 bg-slate-100">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${progress.pct}%`,
            background: `linear-gradient(90deg, ${ORANGE}, #e8824e)`,
          }}
        />
      </div>

      {/* ── Body ── */}
      <div className="flex gap-0">
        {/* Flow */}
        <div className="flex-1 min-w-0 overflow-x-auto p-5">
          <div className="flex items-center gap-0 min-w-max">
            {waves.map((wave, wi) => {
              const isParallel = wave.length > 1;

              return (
                <div key={wi} className="flex items-center">
                  {/* Wave column */}
                  <div className="flex flex-col items-center gap-2">
                    {/* Parallel label */}
                    {isParallel && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-0.5"
                        style={{ background: "rgba(251,191,36,0.12)", color: "#d97706" }}
                      >
                        Parallel
                      </span>
                    )}

                    {/* Nodes with vertical connector */}
                    <div className="relative flex flex-col gap-2">
                      {isParallel && (
                        <div
                          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 -z-0"
                          style={{ backgroundColor: "#f0ece6" }}
                        />
                      )}
                      {wave.map((stage) => (
                        <div key={stage.id} className="relative z-10">
                          <PipelineStageNode
                            stage={stage}
                            isSelected={selectedId === stage.id}
                            reqCount={reqCountByAgent[stage.id] ?? 0}
                            onSelect={() =>
                              setSelectedId(selectedId === stage.id ? null : stage.id)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow to next wave */}
                  {wi < waves.length - 1 && <WaveArrow />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel — desktop */}
        <div
          className="w-64 shrink-0 hidden lg:block p-4"
          style={{ borderLeft: "1px solid #f0ece6", backgroundColor: "#faf9f7" }}
        >
          {selectedStage ? (
            <DetailPanel
              stage={selectedStage}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-8">
              <span className="text-3xl opacity-30">🎯</span>
              <p className="text-xs text-slate-300">
                Click a stage to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel — mobile */}
      {selectedStage && (
        <div
          className="lg:hidden px-5 pb-5"
          style={{ borderTop: "1px solid #f0ece6" }}
        >
          <div className="mt-4">
            <DetailPanel
              stage={selectedStage}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
