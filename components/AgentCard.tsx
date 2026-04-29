"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { PipelineStage, StageStatus } from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";

const STATUS_CONFIG: Record<StageStatus, { dot: string; pulse: boolean; label: string; bg: string; color: string }> = {
  idle:        { dot: "#94a3b8", pulse: false, label: "Idle",    bg: "rgba(148,163,184,0.12)", color: "#64748b" },
  in_progress: { dot: "#f59e0b", pulse: true,  label: "Working", bg: "rgba(245,158,11,0.12)",  color: "#b45309" },
  completed:   { dot: "#10b981", pulse: false, label: "Done",    bg: "rgba(16,185,129,0.12)",  color: "#065f46" },
  blocked:     { dot: "#ef4444", pulse: false, label: "Blocked", bg: "rgba(239,68,68,0.12)",   color: "#b91c1c" },
};

function RoleModal({ stage, onClose }: { stage: PipelineStage; onClose: () => void }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { agent } = stage;

  useEffect(() => {
    fetch(`/api/roles/${agent.id}`)
      .then((r) => r.json())
      .then((d) => setContent(d.content ?? null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [agent.id]);

  const lines = content?.split("\n") ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f0ece6", background: "#1a1a19" }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: agent.color + "25" }}
          >
            {agent.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{agent.name}</p>
            <p className="text-[11px] text-white/40">{agent.role}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-3 bg-slate-100 rounded`} style={{ width: `${70 + (i % 3) * 10}%` }} />
              ))}
            </div>
          )}
          {!loading && !content && (
            <p className="text-sm text-slate-400">Role description not found.</p>
          )}
          {!loading && content && (
            <div className="space-y-1">
              {lines.map((line, i) => {
                if (line.startsWith("# ")) return (
                  <h2 key={i} className="text-base font-bold text-slate-800 mt-2 mb-1">{line.slice(2)}</h2>
                );
                if (line.startsWith("## ")) return (
                  <h3 key={i} className="text-sm font-semibold text-slate-700 mt-3 mb-0.5" style={{ color: agent.color }}>{line.slice(3)}</h3>
                );
                if (line.startsWith("### ")) return (
                  <h4 key={i} className="text-xs font-semibold text-slate-600 mt-2">{line.slice(4)}</h4>
                );
                if (line.startsWith("- ") || line.startsWith("* ")) return (
                  <p key={i} className="text-xs text-slate-600 pl-3">· {line.slice(2)}</p>
                );
                if (line.startsWith("> ")) return (
                  <p key={i} className="text-xs text-slate-500 italic pl-2 border-l-2 border-slate-200">{line.slice(2)}</p>
                );
                if (line.trim() === "" || line.startsWith("---")) return <div key={i} className="h-1" />;
                if (line.startsWith("|")) return null; // skip tables
                return <p key={i} className="text-xs text-slate-600 leading-relaxed">{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* Stage info footer */}
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderTop: "1px solid #f0ece6", background: "#fafaf9" }}>
          <span className="text-xs font-medium text-slate-500">{stage.label}</span>
          <span className="text-slate-200">·</span>
          <span className="text-xs text-slate-400">{stage.description}</span>
        </div>
      </div>
    </div>
  );
}

export default function AgentCard({ stage }: { stage: PipelineStage }) {
  const { getEffectiveStatus } = usePipeline();
  const [showModal, setShowModal] = useState(false);
  const status = getEffectiveStatus(stage.id);
  const s = STATUS_CONFIG[status];
  const { agent } = stage;
  const imgSrc = `/team/${agent.id}.png`;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group relative flex flex-col rounded-2xl bg-white overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
        style={{ border: "1px solid #ede9e3" }}
      >
        {/* Color accent strip */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${agent.color}, ${agent.color}88)` }}
        />

        {/* Photo area */}
        <div className="flex flex-col items-center pt-5 pb-3 px-4">
          <div className="relative mb-3">
            {status === "in_progress" && (
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ boxShadow: `0 0 0 3px ${agent.color}55`, borderRadius: "50%" }}
              />
            )}
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden"
              style={{ border: `2px solid ${agent.color}40` }}
            >
              <Image src={imgSrc} alt={agent.name} fill className="object-cover object-top" sizes="80px" />
            </div>
            <span
              className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${s.pulse ? "animate-pulse" : ""}`}
              style={{ backgroundColor: s.dot }}
            />
          </div>

          <h3 className="text-sm font-bold text-slate-800 text-center leading-tight">{agent.name}</h3>
          <span
            className="mt-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: agent.color + "18", color: agent.color }}
          >
            {agent.role}
          </span>
        </div>

        {/* Description */}
        <div className="px-4 pb-3 flex-1">
          <p className="text-[11px] leading-relaxed text-slate-400 text-center">{stage.description}</p>
        </div>

        {/* Status footer */}
        <div
          className="mx-4 mb-4 flex items-center justify-center gap-1.5 rounded-xl py-1.5"
          style={{ backgroundColor: s.bg }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${s.pulse ? "animate-pulse" : ""}`}
            style={{ backgroundColor: s.dot }}
          />
          <span className="text-[11px] font-semibold" style={{ color: s.color }}>{s.label}</span>
        </div>

        {/* Hover hint */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] text-slate-400 bg-white rounded px-1.5 py-0.5 shadow-sm border border-slate-100">View role</span>
        </div>
      </div>

      {showModal && <RoleModal stage={stage} onClose={() => setShowModal(false)} />}
    </>
  );
}
