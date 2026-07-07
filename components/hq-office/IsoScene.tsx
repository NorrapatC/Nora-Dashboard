"use client"

// ──────────────────────────────────────────────────────────────────────────
// IsoScene — Phase 2: five isometric rooms composed from sliced art
// (image/ folder), recreating the previewoffice.png direction.
// Characters sit at workstations as baked vignettes ("debugging" pose),
// playing their animation in place — no walking.
//
// 7 real vignettes placeable now (aria, iris, luna, mia, nora, rex, sage).
// The other 5 (vera, nova, lyra, zoe, safe) render as "syncing" placeholder
// seats — an empty chair + dimmed nameplate — until their sheets are sliced.
// Rule: vignette-only per placed character; never drop a bare standing sprite
// next to a vignette (it reads broken).
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"

// palette pulled from previewoffice.png
const FLOOR_DARK = "#16202e"
const FLOOR_MID = "#1b2a3a"
const GRID = "#27506b"
const NEON = "#36e0ff"
const GLASS_EDGE = "rgba(120,220,255,0.55)"

// ── iso geometry ───────────────────────────────────────────────────────────
const RW = 130 // floor diamond half-width
const RH = 72 // floor diamond half-height
const WALL = 72 // glass wall height
const STEP_X = 125
const STEP_Y = 70
const OX = 440
const OY = 180

const SCENE_W = 980
const SCENE_H = 620

const VIGNETTE_SCALE = 0.52
const OBJ = "/iso/obj/obj-office"

type Seat = {
  name: string
  frames?: number // debugging frame count (active seats)
  syncing?: boolean
}

type Obj = {
  src: string
  dx: number
  dy: number
  scale: number
}

type Room = {
  id: string
  label: string
  col: number
  row: number
  seats: Seat[]
  objs?: Obj[]
}

// 5 rooms on an iso grid — cells chosen to cluster like previewoffice
const ROOMS: Room[] = [
  {
    id: "cyber",
    label: "CYBERSECURITY",
    col: 0,
    row: 0,
    seats: [{ name: "iris", frames: 5 }, { name: "vera", syncing: true }],
    objs: [{ src: `${OBJ}/o03.png`, dx: -86, dy: -34, scale: 0.4 }],
  },
  {
    id: "tech",
    label: "TECH_HQ",
    col: 1,
    row: 0,
    seats: [{ name: "rex", frames: 5 }, { name: "sage", frames: 5 }],
    objs: [{ src: `${OBJ}/o03.png`, dx: -90, dy: -30, scale: 0.4 }],
  },
  {
    id: "innovate",
    label: "INNOVATE",
    col: 2,
    row: 0,
    seats: [
      { name: "nova", syncing: true },
      { name: "lyra", syncing: true },
      { name: "zoe", syncing: true },
    ],
    objs: [{ src: `${OBJ}/o56.png`, dx: -92, dy: 30, scale: 0.62 }],
  },
  {
    id: "dev",
    label: "NRP COMPANY",
    col: 0,
    row: 1,
    seats: [
      { name: "aria", frames: 5 },
      { name: "luna", frames: 6 },
      { name: "mia", frames: 5 },
    ],
    objs: [{ src: `${OBJ}/o62.png`, dx: -98, dy: 26, scale: 0.7 }],
  },
  {
    id: "secretary",
    label: "SECRETARY",
    col: 1,
    row: 1,
    seats: [{ name: "nora", frames: 5 }, { name: "safe", syncing: true }],
    objs: [{ src: `${OBJ}/o62.png`, dx: -96, dy: 28, scale: 0.68 }],
  },
]

// seat offsets (relative to room center) per seat-count — depth-staggered
const SEAT_SLOTS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [
    [-38, -10],
    [38, 10],
  ],
  3: [
    [0, -20],
    [-46, 12],
    [46, 12],
  ],
}

function center(col: number, row: number) {
  return { cx: OX + (col - row) * STEP_X, cy: OY + (col + row) * STEP_Y }
}

function pts(...p: [number, number][]) {
  return p.map(([x, y]) => `${x},${y}`).join(" ")
}

export default function IsoScene() {
  // depth-sort rooms for the SVG shell (further back renders first)
  const orderedRooms = [...ROOMS].sort(
    (a, b) => center(a.col, a.row).cy - center(b.col, b.row).cy,
  )

  // flatten every placeable into one list, depth-sorted by screen-y
  type Placed =
    | { kind: "seat"; seat: Seat; sx: number; sy: number; label: string }
    | { kind: "obj"; obj: Obj; sx: number; sy: number }
  const placed: Placed[] = []
  for (const room of ROOMS) {
    const { cx, cy } = center(room.col, room.row)
    for (const o of room.objs ?? []) {
      placed.push({ kind: "obj", obj: o, sx: cx + o.dx, sy: cy + o.dy })
    }
    const slots = SEAT_SLOTS[room.seats.length] ?? SEAT_SLOTS[1]
    room.seats.forEach((seat, i) => {
      const [ox, oy] = slots[i] ?? [0, 0]
      placed.push({
        kind: "seat",
        seat,
        sx: cx + ox,
        sy: cy + oy,
        label: room.label,
      })
    })
  }
  placed.sort((a, b) => a.sy - b.sy)

  return (
    <div
      style={{
        position: "relative",
        width: SCENE_W,
        height: SCENE_H,
        background:
          "radial-gradient(130% 100% at 50% 28%, #0e1620 0%, #0a0f16 100%)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        width={SCENE_W}
        height={SCENE_H}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="glassL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(90,190,225,0.28)" />
            <stop offset="1" stopColor="rgba(40,90,120,0.08)" />
          </linearGradient>
          <linearGradient id="glassR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(90,190,225,0.28)" />
            <stop offset="1" stopColor="rgba(40,90,120,0.08)" />
          </linearGradient>
        </defs>
        {orderedRooms.map((room) => (
          <RoomShell key={room.id} room={room} />
        ))}
      </svg>

      {/* objects + characters, globally depth-sorted */}
      {placed.map((p, i) =>
        p.kind === "obj" ? (
          <Sprite
            key={`o${i}`}
            src={p.obj.src}
            x={p.sx}
            y={p.sy}
            scale={p.obj.scale}
            z={p.sy}
          />
        ) : p.seat.syncing ? (
          <SyncingSeat
            key={`s${i}`}
            name={p.seat.name}
            x={p.sx}
            y={p.sy}
            z={p.sy}
          />
        ) : (
          <ActiveSeat
            key={`s${i}`}
            name={p.seat.name}
            frames={p.seat.frames ?? 5}
            x={p.sx}
            y={p.sy}
            z={p.sy}
          />
        ),
      )}

      {/* Room labels — HTML overlay so the iso skew + neon glow read crisply */}
      {ROOMS.map((room) => {
        const { cx, cy } = center(room.col, room.row)
        return (
          <div
            key={room.id}
            style={{
              position: "absolute",
              left: cx,
              top: cy - RH - WALL + 20,
              transform: "translateX(-50%) skewX(-12deg)",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 3,
              color: NEON,
              textShadow: `0 0 8px ${NEON}`,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 9000,
            }}
          >
            {room.label}
          </div>
        )
      })}
    </div>
  )
}

function RoomShell({ room }: { room: Room }) {
  const { cx, cy } = center(room.col, room.row)

  const top: [number, number] = [cx, cy - RH]
  const right: [number, number] = [cx + RW, cy]
  const bottom: [number, number] = [cx, cy + RH]
  const left: [number, number] = [cx - RW, cy]
  const topUp: [number, number] = [cx, cy - RH - WALL]
  const leftUp: [number, number] = [cx - RW, cy - WALL]
  const rightUp: [number, number] = [cx + RW, cy - WALL]

  return (
    <g>
      <polygon
        points={pts(top, left, leftUp, topUp)}
        fill="url(#glassL)"
        stroke={GLASS_EDGE}
        strokeWidth="1.2"
      />
      <polygon
        points={pts(top, right, rightUp, topUp)}
        fill="url(#glassR)"
        stroke={GLASS_EDGE}
        strokeWidth="1.2"
      />
      <polyline
        points={pts(leftUp, topUp, rightUp)}
        fill="none"
        stroke={NEON}
        strokeWidth="2"
        opacity="0.8"
      />
      <polygon
        points={pts(top, right, bottom, left)}
        fill={FLOOR_MID}
        stroke={NEON}
        strokeWidth="1.4"
        opacity="0.95"
      />
      <polygon
        points={pts(
          [cx, cy - RH + 10],
          [cx + RW - 16, cy],
          [cx, cy + RH - 10],
          [cx - RW + 16, cy],
        )}
        fill={FLOOR_DARK}
      />
      {Array.from({ length: 5 }).map((_, i) => {
        const t = (i + 1) / 6
        return (
          <g key={i} stroke={GRID} strokeWidth="1" opacity="0.4">
            <line
              x1={cx - RW * t}
              y1={cy - RH + RH * t}
              x2={cx - RW + RW * t}
              y2={cy + RH * t}
            />
            <line
              x1={cx + RW * t}
              y1={cy - RH + RH * t}
              x2={cx + RW - RW * t}
              y2={cy + RH * t}
            />
          </g>
        )
      })}
    </g>
  )
}

function ActiveSeat({
  name,
  frames,
  x,
  y,
  z,
}: {
  name: string
  frames: number
  x: number
  y: number
  z: number
}) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % frames), 170)
    return () => clearInterval(t)
  }, [frames])

  return (
    <>
      <Sprite
        src={`/iso/char/${name}/debugging_${frame}.png`}
        x={x}
        y={y}
        scale={VIGNETTE_SCALE}
        z={z}
        glow
      />
      <Nameplate label={name.toUpperCase()} x={x} y={y + 30} z={z} />
    </>
  )
}

function SyncingSeat({
  name,
  x,
  y,
  z,
}: {
  name: string
  x: number
  y: number
  z: number
}) {
  return (
    <>
      <Sprite src={`${OBJ}/o54.png`} x={x} y={y} scale={0.44} z={z} dim />
      <Nameplate label={`${name.toUpperCase()} · syncing`} x={x} y={y + 30} z={z} dim />
    </>
  )
}

function Nameplate({
  label,
  x,
  y,
  z,
  dim = false,
}: {
  label: string
  x: number
  y: number
  z: number
  dim?: boolean
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translateX(-50%)",
        background: "rgba(10,18,26,0.82)",
        border: `1px solid ${dim ? "rgba(120,160,180,0.45)" : NEON}`,
        borderRadius: 5,
        padding: "1px 6px",
        fontFamily: "ui-monospace, monospace",
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: 0.5,
        color: dim ? "rgba(150,190,210,0.7)" : NEON,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 1000 + Math.round(z),
      }}
    >
      {label}
    </div>
  )
}

function Sprite({
  src,
  x,
  y,
  scale = 1,
  z = 0,
  glow = false,
  dim = false,
}: {
  src: string
  x: number
  y: number
  scale?: number
  z?: number
  glow?: boolean
  dim?: boolean
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        imageRendering: "pixelated",
        zIndex: 100 + Math.round(z),
        opacity: dim ? 0.5 : 1,
        filter: glow ? `drop-shadow(0 6px 6px rgba(0,0,0,0.5))` : "none",
        pointerEvents: "none",
      }}
    />
  )
}
