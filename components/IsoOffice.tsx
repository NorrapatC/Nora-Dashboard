"use client";
// IsoOffice — isometric office, redesigned with:
//   • Per-agent floor tint (agent color, ~10% opacity) → each workspace = their "room"
//   • Role-specific desk props (monitors, server racks, drawing boards, books…)
//   • Character idle/work/blocked CSS animations
//   • Click a character → onSelect. Parameterised by `agents`.

import { useMemo } from "react";
import { usePipeline } from "@/contexts/PipelineContext";
import type { StageStatus } from "@/lib/pipeline";

export interface IsoAgent { id: string; name: string; color: string }

// ── Palette ──────────────────────────────────────────────────────────────────
const PAL = {
  bg: "#eceee0",
  floor: "#dee1cc", floorEdge: "#cdd2b6",
  wallL: "#e7e9d9", wallR: "#dcdfca",
  deskTop: "#e3c489", deskL: "#c69d5c", deskR: "#b1894e",
  skin: "#f0d3b2", pill: "#fbfbf3", pillBorder: "#d6d8c4", pillText: "#4a4f3e",
  shadow: "rgba(60,60,40,0.12)",
};

const STATUS_DOT: Record<StageStatus, string> = {
  in_progress: "#16a34a", completed: "#0ea5e9", blocked: "#ef4444", idle: "#9aa088",
};
const ANIM: Record<StageStatus, string> = {
  in_progress: "iso-type", completed: "iso-idle-slow", blocked: "iso-shake", idle: "iso-idle",
};

// ── ISO projection ────────────────────────────────────────────────────────────
const TW = 116, TH = 58, ZH = 38;
function iso(gx: number, gy: number, gz = 0) {
  return { sx: (gx - gy) * (TW / 2), sy: (gx + gy) * (TH / 2) - gz * ZH };
}
const pts = (arr: { sx: number; sy: number }[]) =>
  arr.map(p => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ");

// ── Colour helpers ────────────────────────────────────────────────────────────
function tint(hex: string, f: number): string {
  const x = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((x >> 16) & 0xff) * f));
  const g = Math.min(255, Math.round(((x >> 8)  & 0xff) * f));
  const b = Math.min(255, Math.round((x & 0xff) * f));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
}

// ── IsoBox helper ─────────────────────────────────────────────────────────────
interface BoxSpec {
  dx: number; dy: number; bz: number;
  w: number; d: number; h: number;
  top: string; right: string; front: string;
}
function box(dx: number, dy: number, w: number, d: number, h: number, col: string, bz = 0.45): BoxSpec {
  return { dx, dy, bz, w, d, h, top: tint(col, 1.15), right: tint(col, 0.58), front: tint(col, 0.76) };
}
// manual face colours (screen, paper, etc.)
function mbox(dx: number, dy: number, w: number, d: number, h: number,
              top: string, right: string, front: string, bz = 0.45): BoxSpec {
  return { dx, dy, bz, w, d, h, top, right, front };
}

function IsoBox({ gx, gy, b }: { gx: number; gy: number; b: BoxSpec }) {
  const x = gx + b.dx, y = gy + b.dy;
  const tl = iso(x-b.w, y-b.d, b.bz+b.h), tr = iso(x+b.w, y-b.d, b.bz+b.h);
  const br = iso(x+b.w, y+b.d, b.bz+b.h), bl = iso(x-b.w, y+b.d, b.bz+b.h);
  const trB = iso(x+b.w, y-b.d, b.bz), brB = iso(x+b.w, y+b.d, b.bz), blB = iso(x-b.w, y+b.d, b.bz);
  return (
    <g>
      <polygon points={pts([tr, br, brB, trB])} fill={b.right} />
      <polygon points={pts([bl, br, brB, blB])} fill={b.front} />
      <polygon points={pts([tl, tr, br, bl])}  fill={b.top} />
    </g>
  );
}

// ── Floor tint — agent-coloured diamond under each desk ───────────────────────
function FloorTint({ gx, gy, color }: { gx: number; gy: number; color: string }) {
  const s = 0.5;
  const a = iso(gx-s, gy-s), b = iso(gx+s, gy-s);
  const c = iso(gx+s, gy+s), d = iso(gx-s, gy+s);
  return <polygon points={pts([a, b, c, d])} fill={color} fillOpacity={0.11} />;
}

// ── Desk props per agent ──────────────────────────────────────────────────────
const DH = 0.45; // desk surface Z

const DESK_PROPS: Record<string, BoxSpec[]> = {
  // Secretary — dual monitors + coffee mug
  nora: [
    mbox(-0.13, -0.1, 0.065, 0.015, 0.2, "#aeb7a3", "#2a2f3c", "#303645"),
    mbox(0.09,  -0.1, 0.065, 0.015, 0.2, "#aeb7a3", "#2a2f3c", "#303645"),
    box(0.25, 0.1, 0.03, 0.03, 0.065, "#c96442"),
  ],
  // Tech Lead — tall whiteboard panel + blueprint stack
  aria: [
    mbox(0, -0.2, 0.21, 0.012, 0.38, "#f5f4e0", "#dddbc0", "#e8e7cc"),
    box(-0.2, 0.07, 0.09, 0.07, 0.02, "#6366f1"),
  ],
  // UI/UX — drawing pad + colour swatches
  nova: [
    mbox(-0.02, -0.02, 0.18, 0.13, 0.016, "#fce7f3", "#e9b8d9", "#f0c8e6"),
    box(0.23, -0.09, 0.025, 0.025, 0.035, "#f472b6"),
    box(0.23,  0.00, 0.025, 0.025, 0.035, "#a78bfa"),
    box(0.23,  0.09, 0.025, 0.025, 0.035, "#60a5fa"),
    box(0.23,  0.18, 0.025, 0.025, 0.035, "#34d399"),
  ],
  // DB Engineer — three stacked database tiers
  sage: [
    box(0.02, -0.06, 0.1, 0.08, 0.065, "#0ea5e9", DH),
    box(0.02, -0.06, 0.1, 0.08, 0.065, "#0284c7", DH + 0.065),
    box(0.02, -0.06, 0.1, 0.08, 0.065, "#0369a1", DH + 0.13),
  ],
  // Frontend Dev — tablet + colour cubes
  mia: [
    mbox(-0.02, -0.04, 0.18, 0.13, 0.016, "#ede9fe", "#c4b5fd", "#d8b4fe"),
    box(0.24,  0.07, 0.025, 0.025, 0.035, "#f43f5e"),
    box(0.24, -0.01, 0.025, 0.025, 0.035, "#8b5cf6"),
    box(0.24, -0.09, 0.025, 0.025, 0.035, "#06b6d4"),
  ],
  // Backend Dev — dark terminal + coffee
  luna: [
    mbox(0, -0.1, 0.065, 0.015, 0.2, "#1e3a1e", "#0d1f0d", "#142014"),
    box(0.25, 0.1, 0.03, 0.03, 0.065, "#334155"),
  ],
  // Security Engineer — alert screen + alarm cube
  vera: [
    mbox(0.05, -0.08, 0.09, 0.03, 0.26, "#fecaca", "#991b1b", "#b91c1c"),
    box(-0.23, 0.05, 0.04, 0.04, 0.07, "#ef4444"),
  ],
  // Code Reviewer — fanned paper stacks + pen
  iris: [
    mbox(-0.1,  0.00, 0.12, 0.09, 0.018, "#fefce8", "#c9b800", "#ddc900"),
    mbox(-0.07, -0.03, 0.12, 0.09, 0.018, "#fef9c3", "#c9a700", "#ddb500", DH + 0.018),
    mbox(-0.04, -0.06, 0.12, 0.09, 0.018, "#fef08a", "#b89300", "#cfa200", DH + 0.036),
    box(0.21, 0.08, 0.012, 0.012, 0.13, "#f59e0b"),
  ],
  // QA Engineer — phone + tablet
  zoe: [
    mbox(-0.1, 0, 0.048, 0.018, 0.1, "#cffafe", "#0891b2", "#0e7490"),
    mbox(0.1,  0, 0.1,   0.015, 0.14, "#ecfeff", "#0369a1", "#0e7090"),
  ],
  // DevOps — server rack + status LEDs
  rex: [
    mbox(0, -0.05, 0.22, 0.08, 0.34, "#e2e8f0", "#334155", "#475569"),
    box(0.17,  0.06, 0.02, 0.02, 0.02, "#22c55e"),
    box(0.17,  0.12, 0.02, 0.02, 0.02, "#ef4444"),
    box(0.17,  0.18, 0.02, 0.02, 0.02, "#f59e0b"),
  ],
  // Technical Writer — book stack + quill
  lyra: [
    box(-0.14, -0.04, 0.08, 0.1, 0.04, "#84cc16", DH),
    box(-0.11, -0.07, 0.075, 0.09, 0.04, "#4d7c0f", DH + 0.04),
    box(-0.08, -0.10, 0.07,  0.085, 0.04, "#a3e635", DH + 0.08),
    box(0.19,  0.06, 0.012, 0.012, 0.14, "#a16207"),
  ],
};

// ── Desk: iso box + cubicle divider + role props ──────────────────────────────
function Desk({ gx, gy, agentId }: { gx: number; gy: number; agentId: string }) {
  const s = 0.42, h = 0.45;
  const tlT = iso(gx-s, gy-s, h), trT = iso(gx+s, gy-s, h);
  const brT = iso(gx+s, gy+s, h), blT = iso(gx-s, gy+s, h);
  const trB = iso(gx+s, gy-s, 0), brB = iso(gx+s, gy+s, 0), blB = iso(gx-s, gy+s, 0);
  const pw = 0.48;
  const pbTL = iso(gx-s, gy-s, h+pw), pbTR = iso(gx+s, gy-s, h+pw);
  const pbBL = iso(gx-s, gy-s, 0),    pbBR = iso(gx+s, gy-s, 0);

  const props = DESK_PROPS[agentId] ?? [];

  return (
    <g>
      <polygon points={pts([pbTL, pbTR, pbBR, pbBL])} fill={PAL.wallR} stroke={PAL.floorEdge} strokeWidth={0.5} />
      <polygon points={pts([trT, brT, brB, trB])} fill={PAL.deskR} />
      <polygon points={pts([blT, brT, brB, blB])} fill={PAL.deskL} />
      <polygon points={pts([tlT, trT, brT, blT])} fill={PAL.deskTop} stroke={PAL.deskR} strokeWidth={0.5} />
      {props.map((b, i) => <IsoBox key={i} gx={gx} gy={gy} b={b} />)}
    </g>
  );
}

// ── Person: avatar + body + name pill + animation ─────────────────────────────
function Person({ gx, gy, id, color, name, dot, status, selected, animDelay, onClick }: {
  gx: number; gy: number; id: string; color: string; name: string; dot: string;
  status: StageStatus; selected: boolean; animDelay: number; onClick?: () => void;
}) {
  const p = iso(gx, gy + 0.34, 0);
  const R = 16;
  const ringColor = status === "in_progress" ? "#16a34a" : status === "blocked" ? "#ef4444" : selected ? color : "#fbfbf3";
  const animClass = ANIM[status] ?? "iso-idle";

  return (
    <g
      transform={`translate(${p.sx},${p.sy})`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", opacity: status === "idle" && !selected ? 0.65 : 1 }}
    >
      {/* shadow stays on floor — not animated */}
      <ellipse cx={0} cy={2} rx={16} ry={8} fill={PAL.shadow} />

      {/* animated body */}
      <g className={animClass} style={{ animationDelay: `${animDelay}s` }}>
        {/* shoulders */}
        <path d="M -12 -2 Q -13 -24 0 -25 Q 13 -24 12 -2 Z" fill={color}
          stroke={selected ? "#3a3f33" : "none"} strokeWidth={selected ? 2 : 0} />

        {/* avatar circle + animated sprite */}
        <g transform="translate(0,-40)">
          <circle r={R} fill={PAL.skin} />
          <g clipPath="url(#isoAvatarClip)">
            <g>
              {/* step through 4 frames: translate 0 → -32 → -64 → -96 */}
              <animateTransform attributeName="transform" type="translate"
                values={`0,0; ${-R*2},0; ${-R*4},0; ${-R*6},0`}
                dur="0.8s" calcMode="discrete" repeatCount="indefinite" />
              <image href={`/team/animated/${id}.png`}
                x={-R} y={-R} width={R*8} height={R*2}
                style={{ imageRendering: "pixelated" }} />
            </g>
          </g>

          {status === "in_progress" && (
            <circle r={R + 1.5} fill="none" stroke="#16a34a" strokeWidth={2} className="iso-work" />
          )}
          <circle r={R} fill="none" stroke={ringColor} strokeWidth={selected ? 3 : 2} />

          {status === "completed" && (
            <g transform="translate(11,-12)">
              <circle r={5.5} fill="#0ea5e9" stroke="#fff" strokeWidth={1} />
              <path d="M -2.4 0 L -0.6 2 L 2.6 -2" stroke="#fff" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {status === "in_progress" && (
            <g transform="translate(11,-12)">
              <circle r={5.5} fill="#16a34a" stroke="#fff" strokeWidth={1} />
              <path d="M 0 -3 L 0 0 L 2 1.5" stroke="#fff" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            </g>
          )}
          {status === "blocked" && (
            <g transform="translate(11,-12)">
              <circle r={5.5} fill="#ef4444" stroke="#fff" strokeWidth={1} />
              <text y={2.4} textAnchor="middle" fontSize={8} fontWeight={700} fill="#fff">!</text>
            </g>
          )}
        </g>

        {/* name pill */}
        <g transform="translate(0,-66)">
          <rect x={-Math.max(22, name.length * 4 + 12)} y={-9}
            width={Math.max(44, name.length * 8 + 24)} height={17} rx={8.5}
            fill={PAL.pill} stroke={selected ? color : PAL.pillBorder} strokeWidth={selected ? 1.5 : 1} />
          <circle cx={-Math.max(22, name.length * 4 + 12) + 10} cy={0} r={3} fill={dot} />
          <text x={4} y={3.5} textAnchor="middle" fontSize={10}
            fontFamily="ui-monospace, monospace" fill={PAL.pillText} fontWeight={selected ? 700 : 500}>
            {name}
          </text>
        </g>
      </g>
    </g>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IsoOffice({
  agents, selectedId, onSelect, cols = 4,
}: {
  agents: IsoAgent[]; selectedId?: string | null; onSelect?: (id: string) => void; cols?: number;
}) {
  const { getEffectiveStatus } = usePipeline();

  const { items, vb } = useMemo(() => {
    const placed = agents.map((a, i) => ({
      a, i,
      gx: (i % cols) * 1.05,
      gy: Math.floor(i / cols) * 1.05,
    }));

    type Item = { depth: number; el: React.ReactNode };
    const list: Item[] = [];

    for (const { a, i, gx, gy } of placed) {
      const d = gx + gy;
      const st = getEffectiveStatus(a.id);

      // floor tint — rendered just below desk
      list.push({ depth: d - 0.3, el: <FloorTint key={`ft-${a.id}`} gx={gx} gy={gy} color={a.color} /> });

      // desk + props
      list.push({ depth: d, el: <Desk key={`d-${a.id}`} gx={gx} gy={gy} agentId={a.id} /> });

      // person
      list.push({
        depth: d + 0.5,
        el: (
          <Person key={`p-${a.id}`} gx={gx} gy={gy} id={a.id} color={a.color} name={a.name}
            dot={STATUS_DOT[st] ?? STATUS_DOT.idle} status={st} selected={selectedId === a.id}
            animDelay={i * 0.22}
            onClick={onSelect ? () => onSelect(a.id) : undefined} />
        ),
      });
    }
    list.sort((x, y) => x.depth - y.depth);

    const xs: number[] = [], ys: number[] = [];
    for (const { gx, gy } of placed) {
      [iso(gx-0.6, gy-0.6), iso(gx+0.6, gy+0.6), iso(gx, gy, 0.5)].forEach(q => {
        xs.push(q.sx); ys.push(q.sy);
      });
      ys.push(iso(gx, gy + 0.34).sy - 80);
    }
    const pad = 60;
    const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
    return { items: list, vb: { minX, minY, w: maxX - minX, h: maxY - minY } };
  }, [agents, cols, selectedId, getEffectiveStatus, onSelect]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-auto" style={{ background: PAL.bg }}>
      <svg
        viewBox={`${vb.minX} ${vb.minY} ${vb.w} ${vb.h}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: "100%" }}
      >
        <defs>
          <clipPath id="isoAvatarClip">
            <circle cx={0} cy={0} r={16} />
          </clipPath>
          <style>{`
            @keyframes isoWork      { 0%,100%{opacity:.25} 50%{opacity:.9} }
            @keyframes isoIdle      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
            @keyframes isoIdleSlow  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
            @keyframes isoType      { 0%,20%{transform:translateY(0)} 40%{transform:translateY(-5px)} 60%{transform:translateY(-2px)} 80%{transform:translateY(-4px)} }
            @keyframes isoShake     { 0%,100%{transform:translateX(0)} 33%{transform:translateX(-2.5px)} 66%{transform:translateX(2.5px)} }
            .iso-work      { animation: isoWork     1.4s ease-in-out infinite }
            .iso-idle      { animation: isoIdle     2.5s ease-in-out infinite }
            .iso-idle-slow { animation: isoIdleSlow 3.5s ease-in-out infinite }
            .iso-type      { animation: isoType     0.45s linear    infinite }
            .iso-shake     { animation: isoShake    0.3s  ease-in-out infinite }
          `}</style>
        </defs>

        <FloorSlab agents={agents} cols={cols} />
        {items.map(it => it.el)}
      </svg>
    </div>
  );
}

// ── Floor slab (cream background tile) ───────────────────────────────────────
function FloorSlab({ agents, cols }: { agents: IsoAgent[]; cols: number }) {
  const rows = Math.ceil(agents.length / cols);
  const minC = -0.7, maxC = (cols - 1) * 1.05 + 0.7;
  const minR = -0.7, maxR = (rows - 1) * 1.05 + 0.7;
  const a = iso(minC, minR), b = iso(maxC, minR);
  const c = iso(maxC, maxR), d = iso(minC, maxR);
  return <polygon points={pts([a, b, c, d])} fill={PAL.floor} stroke={PAL.floorEdge} strokeWidth={2} />;
}
