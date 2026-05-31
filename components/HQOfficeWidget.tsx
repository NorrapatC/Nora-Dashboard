"use client";
// Homepage embed of the NRP office. Uses the same 2D isometric office (IsoOffice)
// as /hq so the whole app shows one consistent office. Display-only here (no
// onSelect); the header links to the full /hq Command Center.

import IsoOffice from "@/components/IsoOffice";
import { PIPELINE_STAGES } from "@/lib/pipeline";

const AGENTS = PIPELINE_STAGES.map((s) => ({ id: s.id, name: s.agent.name, color: s.agent.color }));

export default function HQOfficeWidget() {
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #ede9e3" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #f0ece6" }}>
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full" style={{ background: "#16a34a" }} />
          <span className="text-sm font-bold text-slate-800">NRP HQ</span>
          <span className="text-xs text-slate-400">— The Studio · 11 agents</span>
        </div>
        <a href="/hq"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: "#fdf3ef", color: "#c96442", border: "1px solid #f5d6c8" }}>
          เปิดเต็มจอ →
        </a>
      </div>

      {/* Isometric office */}
      <div className="relative" style={{ height: 440 }}>
        <IsoOffice agents={AGENTS} />
      </div>
    </div>
  );
}
