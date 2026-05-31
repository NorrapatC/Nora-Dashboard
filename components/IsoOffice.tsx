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

// Per-agent face: hair colour + front-view style (+ glasses), from the portraits.
type Face = { hair: string; style: "bob" | "bun" | "ponytail" | "curly" | "short" | "spiky" | "medium"; glasses?: boolean };
const FACE: Record<string, Face> = {
  nora: { hair: "#1a1a1a", style: "bob" },
  aria: { hair: "#a0522d", style: "bun" },
  mia:  { hair: "#7a4a28", style: "bob" },
  luna: { hair: "#15151f", style: "ponytail" },
  sage: { hair: "#6d4c2f", style: "curly" },
  vera: { hair: "#1c1c1c", style: "medium", glasses: true },
  iris: { hair: "#cfd8dc", style: "bun" },
  zoe:  { hair: "#e6c200", style: "curly" },
  rex:  { hair: "#e65100", style: "short" },
  nova: { hair: "#9c27b0", style: "spiky" },
  lyra: { hair: "#a0522d", style: "ponytail" },
  safe: { hair: "#1f1b18", style: "short" },
};
const DEFAULT_FACE: Face = { hair: "#3a3128", style: "short" };

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
  return (
    <g>
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

// ── Face (front-view), relative to head centre. Order: back-hair, head, hair cap,
//    eyes, mouth, glasses — so features layer correctly. ──
function FaceArt({ face }: { face: Face }) {
  const c = face.hair;
  const topCap = "M -11 1 Q -12 -15 0 -15 Q 12 -15 11 1 Q 5 -5 0 -5 Q -5 -5 -11 1 Z";
  return (
    <g>
      {/* back hair (drawn before head) */}
      {face.style === "bun" && <circle cx={0} cy={-13} r={5.5} fill={c} />}
      {face.style === "ponytail" && <ellipse cx={11} cy={-1} rx={4.5} ry={9} fill={c} />}
      {(face.style === "medium" || face.style === "bob") && (
        <path d="M -11 -2 Q -12 9 -8 12 L -6 -2 Z M 11 -2 Q 12 9 8 12 L 6 -2 Z" fill={c} />
      )}

      {/* head */}
      <circle cx={0} cy={0} r={11} fill={PAL.skin} />

      {/* hair cap / style on top */}
      {face.style === "curly" ? (
        <g fill={c}>
          {[-8, -4, 0, 4, 8].map((x, i) => <circle key={i} cx={x} cy={-9 + (i % 2) * 2} r={4} />)}
          <path d={topCap} />
        </g>
      ) : face.style === "spiky" ? (
        <g fill={c}>
          <path d={topCap} />
          <path d="M -8 -9 L -6 -16 L -3 -10 M -1 -10 L 1 -17 L 4 -10 M 5 -10 L 8 -15 L 9 -9" />
        </g>
      ) : (
        <path d={topCap} fill={c} />
      )}

      {/* eyes */}
      <ellipse cx={-4} cy={-1} rx={1.7} ry={2.3} fill="#2a2320" />
      <ellipse cx={4} cy={-1} rx={1.7} ry={2.3} fill="#2a2320" />
      {/* mouth (smile) */}
      <path d="M -3.2 5 Q 0 8 3.2 5" stroke="#b5705f" strokeWidth={1.3} fill="none" strokeLinecap="round" />

      {/* glasses */}
      {face.glasses && (
        <g stroke="#2c2c2c" strokeWidth={1} fill="none">
          <rect x={-7.5} y={-3.5} width={6.5} height={5.5} rx={1.2} />
          <rect x={1} y={-3.5} width={6.5} height={5.5} rx={1.2} />
          <line x1={-1} y1={-1} x2={1} y2={-1} />
        </g>
      )}
    </g>
  );
}

// ── A seated character + name pill ──
function Person({ gx, gy, id, color, name, dot, selected, onClick }: {
  gx: number; gy: number; id: string; color: string; name: string; dot: string; selected: boolean; onClick?: () => void;
}) {
  const p = iso(gx, gy + 0.34, 0); // a touch in front of the desk
  const face = FACE[id] ?? DEFAULT_FACE;
  return (
    <g transform={`translate(${p.sx},${p.sy})`} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      {/* shadow */}
      <ellipse cx={0} cy={2} rx={16} ry={8} fill={PAL.shadow} />
      {/* body */}
      <path d={`M -11 -2 Q -12 -26 0 -27 Q 12 -26 11 -2 Z`} fill={color} stroke={selected ? "#3a3f33" : "none"} strokeWidth={selected ? 2 : 0} />
      {/* head + face */}
      <g transform="translate(0,-37)"><FaceArt face={face} /></g>
      {/* name pill */}
      <g transform="translate(0,-62)">
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
          dot={STATUS_DOT[st] ?? STATUS_DOT.idle} selected={selectedId === a.id}
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
