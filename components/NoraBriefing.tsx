"use client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  activeCount: number;
  doneCount: number;
  pendingCount: number;
  pipelinePct: number;
  pipelineCompleted: number;
  pipelineTotal: number;
  idleCount: number;
}

export default function NoraBriefing({
  activeCount, doneCount, pendingCount,
  pipelinePct, pipelineCompleted, pipelineTotal, idleCount,
}: Props) {
  const { t } = useLanguage();

  const stats = [
    { label: t.activeAgents, value: activeCount,  color: "#c96442", bg: "#fdf3ef", border: "#f5d6c8" },
    { label: t.completed,    value: doneCount,    color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: t.standingBy,   value: idleCount,    color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
    { label: t.requirements, value: pendingCount, color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" },
  ];

  return (
    <div className="space-y-3">

      {/* ── Main Banner ── */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #ede9e3" }}>
        {/* Orange accent top bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #c96442, #e8855e, #f5c6b0)" }} />

        <div className="p-6">
          <div className="flex items-start gap-5">

            {/* Avatar */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div
                className="flex size-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #c96442, #a04e32)" }}
              >
                N
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            </div>

            {/* Right content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                    {t.noraBriefingLabel}
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">{t.noraBriefingTitle}</h2>
                </div>
                <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "#fdf3ef", color: "#c96442", border: "1px solid #f5d6c8" }}>
                  {t.noraBriefingRole}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-2xl">
                {t.noraBriefingMessage}
              </p>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl px-3 py-2.5"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <p className="text-[10px] font-medium text-slate-500 mb-1 truncate">{s.label}</p>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Pipeline bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pipeline
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {pipelineCompleted}/{pipelineTotal} stages · {pipelinePct}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pipelinePct}%`,
                      background: pipelinePct === 100
                        ? "linear-gradient(to right, #16a34a, #22c55e)"
                        : "linear-gradient(to right, #c96442, #e8855e)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
