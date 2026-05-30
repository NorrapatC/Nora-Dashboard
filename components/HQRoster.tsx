"use client";
// NRP HQ — Roster view. A full-HUD grid of "character cards": each agent shows a
// pixel-sprite avatar, live status, and RPG-style power stats (SPD/QLT/PWR/FOC) + LV.
// Power values are flavour data (mock) tuned per role; status is REAL (usePipeline).
// Click a card → the same AGENT DETAIL panel. Pure CSS, zero runtime cost.

import { PIPELINE_STAGES, type StageStatus } from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";

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

// stageId → spritesheet index (matches scripts/gen_sprites.py order).
const SPRITE_IDX: Record<string, number> = {
  nora: 0, mia: 1, luna: 2, aria: 3, vera: 4, rex: 5, sage: 6, iris: 7, zoe: 8, nova: 9, lyra: 10,
};

// Power stats (mock, tuned per role) + level. SPD=speed, QLT=quality, PWR=power, FOC=focus.
const STATS: Record<string, { lv: string; spd: number; qlt: number; pwr: number; foc: number }> = {
  nora: { lv: "MAX", spd: 95, qlt: 90, pwr: 85, foc: 92 },
  aria: { lv: "MAX", spd: 80, qlt: 95, pwr: 92, foc: 90 },
  mia:  { lv: "85",  spd: 88, qlt: 90, pwr: 78, foc: 85 },
  luna: { lv: "85",  spd: 82, qlt: 92, pwr: 88, foc: 87 },
  sage: { lv: "85",  spd: 75, qlt: 95, pwr: 85, foc: 90 },
  vera: { lv: "85",  spd: 78, qlt: 94, pwr: 90, foc: 95 },
  iris: { lv: "85",  spd: 80, qlt: 96, pwr: 82, foc: 93 },
  zoe:  { lv: "85",  spd: 85, qlt: 93, pwr: 80, foc: 90 },
  rex:  { lv: "85",  spd: 90, qlt: 85, pwr: 88, foc: 82 },
  nova: { lv: "80",  spd: 84, qlt: 90, pwr: 80, foc: 86 },
  lyra: { lv: "80",  spd: 86, qlt: 88, pwr: 75, foc: 84 },
};

function statColor(v: number): string {
  if (v >= 90) return C.green;
  if (v >= 80) return C.cyan;
  return C.amber;
}

// Pixel-sprite avatar: crops the idle-front frame (col1,row0 = 16,0) out of the
// 112×96 spritesheet and scales it up with nearest-neighbour (pixelated).
function SpriteAvatar({ idx, scale = 2 }: { idx: number; scale?: number }) {
  return (
    <div
      className="shrink-0"
      style={{
        width: 16 * scale,
        height: 32 * scale,
        backgroundImage: `url(/sprites/char_${idx}.png)`,
        backgroundSize: `${112 * scale}px ${96 * scale}px`,
        backgroundPosition: `-${16 * scale}px 0px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  const c = statColor(value);
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: C.dim, fontSize: 8, width: 22, letterSpacing: 0.5 }}>{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-sm" style={{ background: "#0a0f1a" }}>
        <div className="h-full rounded-sm" style={{ width: `${value}%`, background: c, boxShadow: `0 0 5px ${c}` }} />
      </div>
      <span style={{ color: C.text, fontSize: 8, width: 16, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default function HQRoster({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const { getEffectiveStatus } = usePipeline();

  return (
    <div className="absolute inset-0 overflow-y-auto p-3" style={{ fontFamily: MONO }}>
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PIPELINE_STAGES.map((s) => {
          const status = getEffectiveStatus(s.id);
          const meta = STATUS_META[status];
          const st = STATS[s.id];
          const sel = selectedId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="flex flex-col gap-2 rounded-lg p-2.5 text-left transition-all"
              style={{
                background: sel ? C.panelHi : C.panel,
                border: `1px solid ${sel ? meta.color : C.border}`,
                boxShadow: sel ? `0 0 10px ${meta.color}44` : "none",
              }}
            >
              {/* header: avatar + identity + status */}
              <div className="flex items-center gap-2.5">
                <div className="rounded-md p-1" style={{ background: "#0a0f1a", border: `1px solid ${s.agent.color}55` }}>
                  <SpriteAvatar idx={SPRITE_IDX[s.id]} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>{s.agent.name}</span>
                    <span style={{ color: C.brand, fontSize: 8, fontWeight: 700 }}>LV.{st.lv}</span>
                  </div>
                  <div className="truncate" style={{ color: C.dim, fontSize: 9 }}>{s.agent.role}</div>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className={`inline-block size-1.5 rounded-full ${status === "in_progress" ? "animate-pulse" : ""}`}
                      style={{ background: meta.color, boxShadow: `0 0 5px ${meta.color}` }} />
                    <span style={{ color: meta.color, fontSize: 8, letterSpacing: 1 }}>[{meta.label}]</span>
                  </div>
                </div>
              </div>
              {/* power stats */}
              <div className="space-y-1">
                <StatBar label="SPD" value={st.spd} />
                <StatBar label="QLT" value={st.qlt} />
                <StatBar label="PWR" value={st.pwr} />
                <StatBar label="FOC" value={st.foc} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
