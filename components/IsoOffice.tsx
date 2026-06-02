"use client";
// IsoOffice — a 2D isometric office drawn in SVG (no WebGL / no Three.js), in the
// warm cream-sage-tan style of the reference (IMG_6832 "The Studio · Isometric
// Office"). Desks + little seated characters with name pills, depth-sorted
// back-to-front (painter's algorithm by gx+gy). Click a character → onSelect.
// Parameterized by `agents` so /hq shows the whole team and /hire shows a solo desk.

import { useMemo } from "react";
import { usePipeline } from "@/contexts/PipelineContext";
import type { StageStatus } from "@/lib/pipeline";

export interface IsoAgent { id: string; name: string; color: string }

// ── Warm palette (matched to the reference) ──
const PAL = {
  bg: "#eceee0",
  floor: "#dee1cc", floorEdge: "#cdd2b6",
  wallL: "#e7e9d9", wallR: "#dcdfca", wallTop: "#eef0e3",
  deskTop: "#e3c489", deskL: "#c69d5c", deskR: "#b1894e",
  mon: "#3b4150", monScreen: "#aeb7a3",
  skin: "#f0d3b2", pill: "#fbfbf3", pillBorder: "#d6d8c4", pillText: "#4a4f3e",
  shadow: "rgba(60,60,40,0.12)",
};

const STATUS_DOT: Record<StageStatus, string> = {
  in_progress: "#16a34a", completed: "#0ea5e9", blocked: "#ef4444", idle: "#9aa088",
};


// ── Isometric projection ──
const TW = 116, TH = 58, ZH = 38; // tile width / height, z unit height
function iso(gx: number, gy: number, gz = 0) {
  return { sx: (gx - gy) * (TW / 2), sy: (gx + gy) * (TH / 2) - gz * ZH };
}
const pts = (arr: { sx: number; sy: number }[]) => arr.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ");

// ── A desk (iso box + monitor), footprint ~0.8 grid, height 0.45 ──
function Desk({ gx, gy }: { gx: number; gy: number }) {
  const s = 0.42, h = 0.45;
  // top corners (z=h)
  const tlT = iso(gx - s, gy - s, h), trT = iso(gx + s, gy - s, h), brT = iso(gx + s, gy + s, h), blT = iso(gx - s, gy + s, h);
  // bottom corners (z=0) for the two viewer-facing side faces
  const trB = iso(gx + s, gy - s, 0), brB = iso(gx + s, gy + s, 0), blB = iso(gx - s, gy + s, 0);
  const m = iso(gx, gy - 0.15, h); // monitor sits at the back of the desktop
  // cubicle back divider panel (low sage wall behind the desk)
  const pw = 0.5; // panel half-height in z added above desk
  const pbTL = iso(gx - s, gy - s, h + pw), pbTR = iso(gx + s, gy - s, h + pw);
  const pbBL = iso(gx - s, gy - s, 0), pbBR = iso(gx + s, gy - s, 0);
  return (
    <g>
      {/* cubicle divider (behind everything in this cell) */}
      <polygon points={pts([pbTL, pbTR, pbBR, pbBL])} fill={PAL.wallR} stroke={PAL.floorEdge} strokeWidth={0.5} />
      {/* +x (right) face */}
      <polygon points={pts([trT, brT, brB, trB])} fill={PAL.deskR} />
      {/* +y (front) face */}
      <polygon points={pts([blT, brT, brB, blB])} fill={PAL.deskL} />
      {/* top */}
      <polygon points={pts([tlT, trT, brT, blT])} fill={PAL.deskTop} stroke={PAL.deskR} strokeWidth={0.5} />
      {/* monitor */}
      <g transform={`translate(${m.sx},${m.sy})`}>
        <rect x={-13} y={-30} width={26} height={20} rx={2} fill={PAL.mon} />
        <rect x={-10} y={-27} width={20} height={14} rx={1} fill={PAL.monScreen} />
        <rect x={-3} y={-10} width={6} height={6} fill={PAL.mon} />
      </g>
    </g>
  );
}

// ── A seated character: real portrait avatar (clipped circle) + body + name pill ──
function Person({ gx, gy, id, color, name, dot, status, selected, onClick }: {
  gx: number; gy: number; id: string; color: string; name: string; dot: string; status: StageStatus; selected: boolean; onClick?: () => void;
}) {
  const p = iso(gx, gy + 0.34, 0); // a touch in front of the desk
  const R = 16;
  // status drives the character's "activity" look
  const ringColor = status === "in_progress" ? "#16a34a" : status === "blocked" ? "#ef4444" : selected ? color : "#fbfbf3";
  return (
    <g transform={`translate(${p.sx},${p.sy})`} onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", opacity: status === "idle" && !selected ? 0.62 : 1 }}>
      {/* shadow */}
      <ellipse cx={0} cy={2} rx={16} ry={8} fill={PAL.shadow} />
      {/* body (shoulders) */}
      <path d={`M -12 -2 Q -13 -24 0 -25 Q 13 -24 12 -2 Z`} fill={color} stroke={selected ? "#3a3f33" : "none"} strokeWidth={selected ? 2 : 0} />
      {/* avatar (pixel-first, portrait fallback) + activity ring */}
      <g transform="translate(0,-40)">
        <circle r={R} fill={PAL.skin} />
        <image href={`/team/pixel/${id}.png`} x={-R} y={-R} width={R * 2} height={R * 2}
          preserveAspectRatio="xMidYMin slice" clipPath="url(#isoAvatarClip)"
          style={{ imageRendering: "pixelated" }}
          onError={(e) => {
            const t = e.currentTarget;
            if (!t.dataset.fallback) { t.dataset.fallback = "1"; t.setAttribute("href", `/team/${id}.png`); }
          }} />
        {/* working: pulsing activity ring */}
        {status === "in_progress" && (
          <circle r={R + 1.5} fill="none" stroke="#16a34a" strokeWidth={2} className="iso-work" />
        )}
        <circle r={R} fill="none" stroke={ringColor} strokeWidth={selected ? 3 : 2} />
        {/* status badge (top-right of avatar) */}
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
        <rect x={-Math.max(22, name.length * 4 + 12)} y={-9} width={Math.max(44, name.length * 8 + 24)} height={17} rx={8.5}
          fill={PAL.pill} stroke={selected ? color : PAL.pillBorder} strokeWidth={selected ? 1.5 : 1} />
        <circle cx={-Math.max(22, name.length * 4 + 12) + 10} cy={0} r={3} fill={dot} />
        <text x={4} y={3.5} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" fill={PAL.pillText} fontWeight={selected ? 700 : 500}>{name}</text>
      </g>
    </g>
  );
}

export default function IsoOffice({
  agents, selectedId, onSelect, cols = 4,
}: {
  agents: IsoAgent[]; selectedId?: string | null; onSelect?: (id: string) => void; cols?: number;
}) {
  const { getEffectiveStatus } = usePipeline();

  const { items, vb } = useMemo(() => {
    // grid positions (centered)
    const placed = agents.map((a, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      return { a, gx: c * 1.05, gy: r * 1.05 };
    });
    // depth-sorted drawables: each desk then its person, ordered by gx+gy
    type Item = { depth: number; el: React.ReactNode };
    const list: Item[] = [];
    for (const { a, gx, gy } of placed) {
      const d = gx + gy;
      list.push({ depth: d, el: <Desk key={`d-${a.id}`} gx={gx} gy={gy} /> });
      const st = getEffectiveStatus(a.id);
      list.push({
        depth: d + 0.5,
        el: <Person key={`p-${a.id}`} gx={gx} gy={gy} id={a.id} color={a.color} name={a.name}
          dot={STATUS_DOT[st] ?? STATUS_DOT.idle} status={st} selected={selectedId === a.id}
          onClick={onSelect ? () => onSelect(a.id) : undefined} />,
      });
    }
    list.sort((x, y) => x.depth - y.depth);

    // viewbox bounds from all desk/person screen points
    const xs: number[] = [], ys: number[] = [];
    for (const { gx, gy } of placed) {
      [iso(gx - 0.6, gy - 0.6), iso(gx + 0.6, gy + 0.6, 0), iso(gx, gy, 0.5)].forEach((q) => { xs.push(q.sx); ys.push(q.sy); });
      ys.push(iso(gx, gy + 0.34).sy - 70); // name pill top
    }
    const pad = 60;
    const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
    return { items: list, vb: { minX, minY, w: maxX - minX, h: maxY - minY } };
  }, [agents, cols, selectedId, getEffectiveStatus, onSelect]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-auto" style={{ background: PAL.bg }}>
      <svg viewBox={`${vb.minX} ${vb.minY} ${vb.w} ${vb.h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: "100%" }}>
        <defs>
          {/* circular crop for portrait avatars */}
          <clipPath id="isoAvatarClip" clipPathUnits="objectBoundingBox"><circle cx="0.5" cy="0.5" r="0.5" /></clipPath>
          <style>{`@keyframes isowork{0%,100%{opacity:.25}50%{opacity:.9}}.iso-work{animation:isowork 1.4s ease-in-out infinite}`}</style>
        </defs>
        {/* floor slab under the whole grid */}
        <FloorSlab agents={agents} cols={cols} />
        {items.map((it) => it.el)}
      </svg>
    </div>
  );
}

function FloorSlab({ agents, cols }: { agents: IsoAgent[]; cols: number }) {
  const rows = Math.ceil(agents.length / cols);
  const minC = -0.7, maxC = (cols - 1) * 1.05 + 0.7;
  const minR = -0.7, maxR = (rows - 1) * 1.05 + 0.7;
  const a = iso(minC, minR, 0), b = iso(maxC, minR, 0), c = iso(maxC, maxR, 0), d = iso(minC, maxR, 0);
  return (
    <>
      <polygon points={pts([a, b, c, d])} fill={PAL.floor} stroke={PAL.floorEdge} strokeWidth={2} />
      {/* subtle grid lines */}
    </>
  );
}
