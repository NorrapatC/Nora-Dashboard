// Design Preview — HQ Office Interactive System
// localhost:3000/hq/office-design
// ──────────────────────────────────────────────
// Static mockup showing every visual element before implementation:
//   1. Character sprites (all 12, all 7 frames × 3 directions)
//   2. Furniture reference (all 6 pieces)
//   3. Floor plan layout (all rooms + furniture + characters)
//   4. Status panel mockup

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"
const BRAND = "#c96442"

// ── Data ─────────────────────────────────────────────────────────────────────

const CHARS = [
  { name: "Nora",  role: "Secretary",    i: 0,  room: "Nora's Office",  color: "#1565c0" },
  { name: "Mia",   role: "Frontend",     i: 1,  room: "Developer Zone", color: "#e57399" },
  { name: "Luna",  role: "Backend",      i: 2,  room: "Developer Zone", color: "#37474f" },
  { name: "Aria",  role: "Tech Lead",    i: 3,  room: "Developer Zone", color: "#9e9e9e" },
  { name: "Vera",  role: "Security",     i: 4,  room: "Security Zone",  color: "#283593" },
  { name: "Rex",   role: "DevOps",       i: 5,  room: "Operations",     color: "#3949ab" },
  { name: "Sage",  role: "Database",     i: 6,  room: "Developer Zone", color: "#4caf50" },
  { name: "Iris",  role: "Reviewer",     i: 7,  room: "Security Zone",  color: "#b0bec5" },
  { name: "Zoe",   role: "QA",           i: 8,  room: "QA & Docs",      color: "#d81b60" },
  { name: "Nova",  role: "UI/UX",        i: 9,  room: "Design Room",    color: "#f5c518" },
  { name: "Lyra",  role: "Tech Writer",  i: 10, room: "QA & Docs",      color: "#7cb342" },
  { name: "Safe",  role: "Owner",        i: 11, room: "Boss Room",      color: BRAND     },
]

const FURNITURE = [
  { name: "Desk",       file: "desk",       w: 48, h: 32, desc: "48 × 32" },
  { name: "PC",         file: "pc",         w: 16, h: 32, desc: "16 × 32" },
  { name: "Plant",      file: "plant",      w: 16, h: 32, desc: "16 × 32" },
  { name: "Bookshelf",  file: "bookshelf",  w: 32, h: 16, desc: "32 × 16" },
  { name: "Whiteboard", file: "whiteboard", w: 32, h: 32, desc: "32 × 32" },
  { name: "Floor tile", file: "floor",      w: 16, h: 16, desc: "16 × 16 (repeat)" },
]

// Sprite sheet: 112×96px — 7 cols × 3 rows, cell = 16×32
const DIRS = [
  { label: "Down",  top: 0  },
  { label: "Left",  top: 32 },
  { label: "Right", top: 64 },
]
const FRAMES = [0, 1, 2, 3, 4, 5, 6]

// ── Room layout data ──────────────────────────────────────────────────────────

type FurniturePlace = { file: string; w: number; h: number; xPct: number; yPct: number }
type RoomData = {
  id: string; label: string; gridArea: string
  bg: string; chars: number[]; furniture: FurniturePlace[]
}

const ROOMS: RoomData[] = [
  {
    id: "boss", label: "Boss Room", gridArea: "boss", bg: "#fef3c7",
    chars: [11],
    furniture: [
      { file: "desk",      w: 48, h: 32, xPct: 38, yPct: 28 },
      { file: "bookshelf", w: 32, h: 16, xPct: 72, yPct: 18 },
      { file: "plant",     w: 16, h: 32, xPct: 16, yPct: 58 },
    ],
  },
  {
    id: "nora", label: "Nora's Office", gridArea: "nora", bg: "#eff6ff",
    chars: [0],
    furniture: [
      { file: "desk",  w: 48, h: 32, xPct: 32, yPct: 28 },
      { file: "pc",    w: 16, h: 32, xPct: 32, yPct: 14 },
      { file: "plant", w: 16, h: 32, xPct: 68, yPct: 58 },
    ],
  },
  {
    id: "dev", label: "Developer Zone", gridArea: "dev", bg: "#f0fdf4",
    chars: [3, 1, 2, 6],
    furniture: [
      { file: "desk", w: 48, h: 32, xPct: 12, yPct: 22 },
      { file: "pc",   w: 16, h: 32, xPct: 12, yPct: 10 },
      { file: "desk", w: 48, h: 32, xPct: 35, yPct: 22 },
      { file: "pc",   w: 16, h: 32, xPct: 35, yPct: 10 },
      { file: "desk", w: 48, h: 32, xPct: 58, yPct: 22 },
      { file: "pc",   w: 16, h: 32, xPct: 58, yPct: 10 },
      { file: "desk", w: 48, h: 32, xPct: 82, yPct: 22 },
      { file: "pc",   w: 16, h: 32, xPct: 82, yPct: 10 },
      { file: "whiteboard", w: 32, h: 32, xPct: 48, yPct: 62 },
    ],
  },
  {
    id: "sec", label: "Security Zone", gridArea: "sec", bg: "#faf5ff",
    chars: [4, 7],
    furniture: [
      { file: "desk",      w: 48, h: 32, xPct: 22, yPct: 24 },
      { file: "pc",        w: 16, h: 32, xPct: 22, yPct: 12 },
      { file: "desk",      w: 48, h: 32, xPct: 65, yPct: 24 },
      { file: "pc",        w: 16, h: 32, xPct: 65, yPct: 12 },
      { file: "bookshelf", w: 32, h: 16, xPct: 42, yPct: 64 },
    ],
  },
  {
    id: "design", label: "Design Room", gridArea: "design", bg: "#fff1f2",
    chars: [9],
    furniture: [
      { file: "desk",       w: 48, h: 32, xPct: 28, yPct: 28 },
      { file: "whiteboard", w: 32, h: 32, xPct: 62, yPct: 20 },
      { file: "plant",      w: 16, h: 32, xPct: 80, yPct: 62 },
    ],
  },
  {
    id: "qa", label: "QA & Docs", gridArea: "qa", bg: "#fffbeb",
    chars: [8, 10],
    furniture: [
      { file: "desk",      w: 48, h: 32, xPct: 22, yPct: 24 },
      { file: "desk",      w: 48, h: 32, xPct: 65, yPct: 24 },
      { file: "bookshelf", w: 32, h: 16, xPct: 42, yPct: 64 },
    ],
  },
  {
    id: "ops", label: "Operations", gridArea: "ops", bg: "#f0f9ff",
    chars: [5],
    furniture: [
      { file: "desk",  w: 48, h: 32, xPct: 32, yPct: 28 },
      { file: "pc",    w: 16, h: 32, xPct: 32, yPct: 14 },
      { file: "plant", w: 16, h: 32, xPct: 68, yPct: 58 },
    ],
  },
  {
    id: "meeting", label: "Meeting Room", gridArea: "meeting", bg: "#f8fafc",
    chars: [],
    furniture: [
      { file: "whiteboard", w: 32, h: 32, xPct: 42, yPct: 22 },
      { file: "plant",      w: 16, h: 32, xPct: 76, yPct: 58 },
    ],
  },
  {
    id: "pantry", label: "Pantry", gridArea: "pantry", bg: "#fefce8",
    chars: [],
    furniture: [
      { file: "plant", w: 16, h: 32, xPct: 28, yPct: 52 },
      { file: "plant", w: 16, h: 32, xPct: 68, yPct: 36 },
    ],
  },
  {
    id: "lounge", label: "Lounge", gridArea: "lounge", bg: "#fdf4ff",
    chars: [],
    furniture: [
      { file: "plant", w: 16, h: 32, xPct: 32, yPct: 30 },
      { file: "plant", w: 16, h: 32, xPct: 55, yPct: 65 },
    ],
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 24px 10px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ height: 1, width: 20, background: BRAND }} />
      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: BRAND }}>
        {children}
      </span>
      <div style={{ height: 1, flex: 1, background: "#f0ece6" }} />
    </div>
  )
}

// Single sprite frame via crop window
function SpriteFrame({
  charIndex, frameX = 0, dirTop = 0, scale = 3,
}: {
  charIndex: number; frameX?: number; dirTop?: number; scale?: number
}) {
  return (
    <div style={{ overflow: "hidden", width: 16, height: 32, transform: `scale(${scale})`, transformOrigin: "top left", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/sprites/char_${charIndex}.png`}
        alt=""
        width={112} height={96}
        style={{
          position: "relative",
          top: -dirTop,
          left: -(frameX * 16),
          imageRendering: "pixelated",
          display: "block",
        }}
      />
    </div>
  )
}

// ── Room tile ─────────────────────────────────────────────────────────────────

function RoomTile({ room }: { room: RoomData }) {
  return (
    <div
      style={{
        gridArea: room.id,
        position: "relative",
        background: room.bg,
        backgroundImage: `url(/furniture/floor.png)`,
        backgroundSize: "16px 16px",
        backgroundRepeat: "repeat",
        imageRendering: "pixelated",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        minHeight: 130,
        overflow: "hidden",
      }}
    >
      {/* Room label */}
      <span style={{
        position: "absolute", top: 5, left: 6, zIndex: 3,
        fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: 0.8,
        color: "#94a3b8", textTransform: "uppercase", pointerEvents: "none",
      }}>
        {room.label}
      </span>

      {/* Furniture */}
      {room.furniture.map((f, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${f.xPct}%`, top: `${f.yPct}%`,
          transform: "translate(-50%, -50%)",
          zIndex: 2, pointerEvents: "none",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/furniture/${f.file}.png`} alt={f.file}
            width={f.w} height={f.h}
            style={{ imageRendering: "pixelated", display: "block" }} />
        </div>
      ))}

      {/* Characters */}
      <div style={{
        position: "absolute", bottom: 4, left: 0, right: 0, zIndex: 10,
        display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap",
        padding: "0 4px",
      }}>
        {room.chars.map((ci) => {
          const ch = CHARS.find((c) => c.i === ci)!
          return (
            <div key={ci} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              {/* 3× scaled sprite frame */}
              <div style={{ width: 48, height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SpriteFrame charIndex={ci} frameX={0} dirTop={0} scale={3} />
              </div>
              <span style={{
                fontFamily: MONO, fontSize: 7, color: "#64748b",
                letterSpacing: 0.4, whiteSpace: "nowrap",
              }}>
                {ch.name.toUpperCase()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Mock side panel ───────────────────────────────────────────────────────────

function MockPanel() {
  const ch = CHARS[0] // Nora as example
  return (
    <div style={{
      width: 260,
      background: "rgba(255,255,255,0.97)",
      border: "1px solid #f5d6c8",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: "14px 14px 12px", background: "#fdf3ef", borderBottom: "1px solid #f5d6c8", display: "flex", gap: 10 }}>
        {/* Portrait */}
        <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", border: "2px solid #f5d6c8", flexShrink: 0, background: "#f1f5f9" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/team/pixel/${ch.name.toLowerCase()}.png`} alt={ch.name} width={56} height={56}
            style={{ imageRendering: "pixelated", objectFit: "cover", width: 56, height: 56 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "#1e1c1a" }}>{ch.name}</div>
          <div style={{ fontSize: 11, color: BRAND, fontWeight: 600, marginTop: 2 }}>เลขา / Chief of Staff</div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>AI Secretary</div>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid #f5d6c8", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8", fontWeight: 700, cursor: "default" }}>✕</div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Status badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "#fdf3ef", border: "1px solid #f5d6c8", color: BRAND, fontWeight: 600 }}>
            📋 Reviewing
          </span>
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "#2563eb18", border: "1px solid #2563eb40", color: "#2563eb", fontWeight: 600 }}>
            🎯 Focused
          </span>
        </div>

        {/* Productivity */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontFamily: MONO, color: "#64748b", letterSpacing: 0.5 }}>PRODUCTIVITY</span>
            <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 700, color: "#16a34a" }}>82%</span>
          </div>
          <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "82%", background: "#16a34a", borderRadius: 999 }} />
          </div>
        </div>

        {/* Room */}
        <div>
          <span style={{ fontSize: 9, fontFamily: MONO, color: "#64748b", letterSpacing: 0.5, display: "block", marginBottom: 3 }}>ROOM</span>
          <span style={{ fontSize: 11, color: "#1e1c1a", fontWeight: 600 }}>Nora's Office</span>
        </div>

        {/* Activity history */}
        <div>
          <span style={{ fontSize: 9, fontFamily: MONO, color: "#64748b", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>ACTIVITY HISTORY</span>
          {[
            { time: "09:14:22", act: "📋 Reviewing",   mood: "FOCUSED",     mc: "#2563eb" },
            { time: "09:02:08", act: "💭 Thinking",    mood: "TIRED",       mc: "#9ca3af" },
            { time: "08:48:55", act: "☕ Coffee break", mood: "CAFFEINATED", mc: "#f59e0b" },
            { time: "08:31:10", act: "✏️ Typing",      mood: "HAPPY",       mc: "#16a34a" },
            { time: "08:16:44", act: "📅 In meeting",  mood: "HAPPY",       mc: "#16a34a" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 8, fontFamily: MONO, color: "#94a3b8", minWidth: 56 }}>{row.time}</span>
              <span style={{ fontSize: 10, flex: 1 }}>{row.act}</span>
              <span style={{ fontSize: 8, fontFamily: MONO, color: row.mc, letterSpacing: 0.4 }}>{row.mood}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OfficeDesignPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9f7f4", fontFamily: "Geist, sans-serif" }}>

      {/* Page header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e9e5df", background: "#fff", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: BRAND }}>
          ⊞ OFFICE DESIGN PREVIEW
        </span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: "#94a3b8" }}>
          — static mockup — localhost:3000/hq/office-design
        </span>
        <a href="/hq" style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9, color: "#94a3b8", textDecoration: "none" }}>
          ← back to /hq
        </a>
      </div>

      <div style={{ padding: "0 0 40px" }}>

        {/* ── 1. CHARACTER SPRITES ───────────────────────────────────────────── */}
        <SectionTitle>1 — CHARACTER SPRITES (all 12)</SectionTitle>
        <div style={{ padding: "0 24px 8px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 20, minWidth: "max-content" }}>
            {CHARS.map((ch) => (
              <div key={ch.i} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                {/* Portrait */}
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", border: `2px solid ${ch.color}40`, background: "#f1f5f9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/team/pixel/${ch.name.toLowerCase()}.png`} alt={ch.name} width={40} height={40}
                    style={{ imageRendering: "pixelated", objectFit: "cover", width: 40, height: 40 }} />
                </div>
                {/* Name + role */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: "#1e1c1a", letterSpacing: 0.5 }}>{ch.name}</div>
                  <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 1 }}>{ch.role}</div>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: ch.color, marginTop: 1 }}>char_{ch.i}.png</div>
                </div>
                {/* Sprite sheet rows: down / left / right */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {DIRS.map((dir) => (
                    <div key={dir.label} style={{ display: "flex", gap: 3, alignItems: "center" }}>
                      <span style={{ fontFamily: MONO, fontSize: 6, color: "#94a3b8", width: 24, textAlign: "right" }}>{dir.label}</span>
                      {/* All 7 frames */}
                      {FRAMES.map((fi) => (
                        <div key={fi} style={{
                          overflow: "hidden", width: 16, height: 32,
                          border: fi === 0 ? `1px solid ${ch.color}60` : "1px solid #f0ece6",
                          borderRadius: 2,
                          background: dir.top === 0 ? `${ch.color}08` : "#fafafa",
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/sprites/char_${ch.i}.png`} alt=""
                            width={112} height={96}
                            style={{
                              position: "relative",
                              top: -dir.top, left: -(fi * 16),
                              imageRendering: "pixelated", display: "block",
                            }} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. FURNITURE REFERENCE ─────────────────────────────────────────── */}
        <SectionTitle>2 — FURNITURE REFERENCE (all 6)</SectionTitle>
        <div style={{ padding: "4px 24px 8px", display: "flex", gap: 24, flexWrap: "wrap" }}>
          {FURNITURE.map((f) => (
            <div key={f.file} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {/* 1× */}
              <div style={{ padding: 4, border: "1px dashed #e2e8f0", borderRadius: 4, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 40, minHeight: 40 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/furniture/${f.file}.png`} alt={f.name} width={f.w} height={f.h}
                  style={{ imageRendering: "pixelated", display: "block" }} />
              </div>
              {/* 3× */}
              <div style={{ padding: 4, border: "1px solid #e2e8f0", borderRadius: 4, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 40, minHeight: 40 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/furniture/${f.file}.png`} alt={f.name} width={f.w * 3} height={f.h * 3}
                  style={{ imageRendering: "pixelated", display: "block" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: "#1e1c1a" }}>{f.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: "#94a3b8" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 3. FLOOR PLAN ──────────────────────────────────────────────────── */}
        <SectionTitle>3 — FLOOR PLAN (all rooms + furniture + characters)</SectionTitle>
        <div style={{ padding: "4px 24px 8px", overflowX: "auto" }}>
          {/* Header strip mock */}
          <div style={{ background: "#fff", borderRadius: "8px 8px 0 0", border: "1px solid #e2e8f0", borderBottom: "none", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "#64748b" }}>⊞ NRP OFFICE — FLOOR PLAN</span>
            <span style={{ fontFamily: MONO, fontSize: 8, color: "#94a3b8" }}>12 employees active</span>
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 8, color: BRAND, fontWeight: 600 }}>● NORA SELECTED</span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateAreas: `
              "boss  nora   meeting  pantry"
              "dev   dev    sec      lounge"
              "design qa    ops      lounge"
            `,
            gridTemplateColumns: "1fr 1fr 1fr 0.65fr",
            gridTemplateRows: "auto auto auto",
            gap: 5,
            background: "#f0ece6",
            padding: 5,
            border: "1px solid #e2e8f0",
            borderRadius: "0 0 8px 8px",
            minWidth: 720,
          }}>
            {ROOMS.map((room) => <RoomTile key={room.id} room={room} />)}
          </div>
        </div>

        {/* ── 4. STATUS PANEL ────────────────────────────────────────────────── */}
        <SectionTitle>4 — STATUS PANEL (on character click)</SectionTitle>
        <div style={{ padding: "4px 24px 8px", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Panel */}
          <MockPanel />

          {/* Annotation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280 }}>
            {[
              { label: "Portrait",       desc: "/team/pixel/{name}.png  56×56 px" },
              { label: "Name + Role",    desc: "Thai role (primary) + English role" },
              { label: "Activity badge", desc: "Current activity with emoji" },
              { label: "Mood badge",     desc: "happy / focused / tired / caffeinated" },
              { label: "Productivity",   desc: "0–100% bar — green/amber/red" },
              { label: "Activity log",   desc: "Last 5 entries + timestamp + mood" },
              { label: "Slide in/out",   desc: "panel-slide-in 0.2s ease-out" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: BRAND, minWidth: 90 }}>{item.label}</span>
                <span style={{ fontSize: 10, color: "#64748b" }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. ANIMATION STATES ────────────────────────────────────────────── */}
        <SectionTitle>5 — ANIMATION STATES (per activity)</SectionTitle>
        <div style={{ padding: "4px 24px 8px", display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { act: "typing / coding",   anim: "type-bob",  desc: "wrapper translateY -2px @ 0.3s", dir: "Down"  },
            { act: "debugging",         anim: "type-bob",  desc: "wrapper translateY -2px @ 0.3s", dir: "Right" },
            { act: "walking",           anim: "walk",      desc: "img translateX -112px steps(7)",  dir: "Right" },
            { act: "idle / coffee",     anim: "think",     desc: "wrapper translateY -1px @ 1.2s", dir: "Down"  },
            { act: "reviewing / meeting", anim: "static",  desc: "no animation — frame 0",         dir: "Down"  },
          ].map((row) => (
            <div key={row.act} style={{
              background: "#fff", border: "1px solid #e9e5df", borderRadius: 8,
              padding: "10px 14px", display: "flex", gap: 12, alignItems: "center", minWidth: 280,
            }}>
              {/* Preview: char_0, frame 0 */}
              <div style={{ width: 48, height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SpriteFrame charIndex={0} frameX={0} dirTop={row.dir === "Right" ? 64 : 0} scale={3} />
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: "#1e1c1a", marginBottom: 3 }}>
                  {row.act}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: BRAND, marginBottom: 2 }}>
                  anim: {row.anim}
                </div>
                <div style={{ fontSize: 9, color: "#64748b" }}>{row.desc}</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: "#94a3b8", marginTop: 2 }}>
                  dir: {row.dir}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
