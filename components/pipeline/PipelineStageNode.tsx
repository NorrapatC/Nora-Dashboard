"use client";
import { PipelineStage, StageStatus } from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";

interface Props {
  stage: PipelineStage;
  isSelected: boolean;
  reqCount?: number;
  onSelect: () => void;
}

const STATUS_STYLE: Record<StageStatus, {
  ring: string; bg: string; dot: string; pulse: boolean;
  label: string; labelColor: string;
}> = {
  idle:        { ring: "#ede9e3", bg: "#ffffff",  dot: "#cbd5e1", pulse: false, label: "Idle",        labelColor: "#94a3b8" },
  in_progress: { ring: "#fbbf24", bg: "#fffbeb",  dot: "#f59e0b", pulse: true,  label: "In Progress", labelColor: "#b45309" },
  completed:   { ring: "#6ee7b7", bg: "#f0fdf9",  dot: "#10b981", pulse: false, label: "Done",        labelColor: "#065f46" },
  blocked:     { ring: "#fca5a5", bg: "#fff5f5",  dot: "#ef4444", pulse: false, label: "Blocked",     labelColor: "#b91c1c" },
};

export default function PipelineStageNode({ stage, isSelected, reqCount = 0, onSelect }: Props) {
  const { getEffectiveStatus, canAdvance } = usePipeline();
  const status = getEffectiveStatus(stage.id);
  const s = STATUS_STYLE[status];
  const ready = canAdvance(stage.id) && status === "idle";

  return (
    <button
      onClick={onSelect}
      className="group flex flex-col gap-2.5 w-40 rounded-2xl p-3.5 text-left transition-all duration-200 focus:outline-none"
      style={{
        backgroundColor: s.bg,
        border: `2px solid ${isSelected ? stage.agent.color : s.ring}`,
        boxShadow: isSelected
          ? `0 0 0 3px ${stage.agent.color}22, 0 4px 12px ${stage.agent.color}18`
          : "0 1px 3px rgba(0,0,0,0.06)",
        transform: isSelected ? "translateY(-2px)" : undefined,
      }}
    >
      {/* Top row: avatar + status dot */}
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: stage.agent.color + "18" }}
        >
          {stage.agent.emoji}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {reqCount > 0 && (
              <span
                className="text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none"
                style={{ background: stage.agent.color + "25", color: stage.agent.color }}
              >
                {reqCount}
              </span>
            )}
            <span
              className={`w-2 h-2 rounded-full ${s.pulse ? "animate-pulse" : ""}`}
              style={{ backgroundColor: s.dot }}
            />
          </div>
          {ready && (
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#c96442" }}>
              Ready
            </span>
          )}
        </div>
      </div>

      {/* Name + role */}
      <div>
        <p className="text-sm font-bold text-slate-800 leading-tight">{stage.agent.name}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{stage.agent.role}</p>
      </div>

      {/* Stage label */}
      <p className="text-[11px] text-slate-500 font-medium leading-snug">{stage.label}</p>

      {/* Status badge */}
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: s.dot }}
        />
        <span className="text-[10px] font-semibold" style={{ color: s.labelColor }}>
          {s.label}
        </span>
      </div>
    </button>
  );
}
