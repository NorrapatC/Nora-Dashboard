// OfficeData.ts — Static data: employees, rooms, activity pools
// WHY: Centralising all static data here keeps the rendering components clean
//      and makes it easy to add employees or change room assignments later.

export type Activity =
  | "typing"
  | "coding"
  | "debugging"
  | "reviewing"
  | "coffee"
  | "walking"
  | "meeting"
  | "idle"
  | "presenting"

export type Mood = "happy" | "focused" | "tired" | "caffeinated"

export type Direction = "down" | "left" | "right"

export type FurnitureItem = {
  type: "desk" | "pc" | "plant" | "bookshelf" | "whiteboard"
  /** Position as % of room width/height */
  xPct: number
  yPct: number
}

export type RoomDef = {
  id: string
  label: string
  /** CSS grid-area value */
  gridArea: string
  /** Background tint color */
  color: string
  /** Optional earthy room background image (public path) */
  bgImage?: string
  furniture: FurnitureItem[]
  /** Tile-space bounding box for this room (used by game canvas + pathfinding) */
  tileRect: { x: number; y: number; w: number; h: number }
}

export type EmployeeData = {
  id: string
  name: string
  /** Thai display name / role */
  thaiRole: string
  role: string
  roomId: string
  /** Index into /public/sprites/char_*.png */
  charIndex: number
  /** Portrait path: /team/pixel/{id}.png — 256×256 */
  portraitSrc: string
  /** Activities weighted toward this role */
  activities: Activity[]
  /** Starting tile position (home desk) */
  homeTile: { x: number; y: number }
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
//
// CSS grid layout (3 rows × 4 cols):
//   "boss  nora   meeting  pantry"
//   "dev   dev    sec      lounge"
//   "design qa    ops      lounge"
//
// Earthy room image mapping (from officeearthtone.png, sliced into 6 rooms):
//   top_left   → boss room    (bright professional space)
//   top_center → nora's room  (centre-top, coordination hub)
//   top_right  → meeting room (upper-right, shared)
//   bot_left   → dev zone     (debug + architecture labels)
//   bot_center → design/qa    (creative workspace)
//   bot_right  → sec/ops      (structured, utilitarian)
export const ROOMS: RoomDef[] = [
  {
    id: "boss",
    label: "Boss Room",
    gridArea: "boss",
    color: "#fef3c7",
    bgImage: "/rooms/earthy/top_left.png",
    tileRect: { x: 1, y: 1, w: 7, h: 7 },
    furniture: [
      { type: "desk",      xPct: 35, yPct: 30 },
      { type: "bookshelf", xPct: 65, yPct: 15 },
      { type: "plant",     xPct: 15, yPct: 60 },
    ],
  },
  {
    id: "nora",
    label: "Nora's Office",
    gridArea: "nora",
    color: "#eff6ff",
    bgImage: "/rooms/earthy/top_center.png",
    tileRect: { x: 9, y: 1, w: 7, h: 7 },
    furniture: [
      { type: "desk",  xPct: 30, yPct: 30 },
      { type: "pc",    xPct: 30, yPct: 20 },
      { type: "plant", xPct: 65, yPct: 60 },
    ],
  },
  {
    id: "dev",
    label: "Developer Zone",
    gridArea: "dev",
    color: "#f0fdf4",
    bgImage: "/rooms/earthy/bot_left.png",
    tileRect: { x: 1, y: 10, w: 16, h: 8 },
    furniture: [
      { type: "desk",       xPct: 15, yPct: 25 },
      { type: "pc",         xPct: 15, yPct: 15 },
      { type: "desk",       xPct: 38, yPct: 25 },
      { type: "pc",         xPct: 38, yPct: 15 },
      { type: "desk",       xPct: 60, yPct: 25 },
      { type: "pc",         xPct: 60, yPct: 15 },
      { type: "desk",       xPct: 82, yPct: 25 },
      { type: "pc",         xPct: 82, yPct: 15 },
      { type: "whiteboard", xPct: 45, yPct: 65 },
    ],
  },
  {
    id: "sec",
    label: "Security Zone",
    gridArea: "sec",
    color: "#faf5ff",
    bgImage: "/rooms/earthy/bot_right.png",
    tileRect: { x: 18, y: 10, w: 8, h: 8 },
    furniture: [
      { type: "desk",      xPct: 20, yPct: 25 },
      { type: "pc",        xPct: 20, yPct: 15 },
      { type: "desk",      xPct: 60, yPct: 25 },
      { type: "pc",        xPct: 60, yPct: 15 },
      { type: "bookshelf", xPct: 40, yPct: 65 },
    ],
  },
  {
    id: "design",
    label: "Design Room",
    gridArea: "design",
    color: "#fff1f2",
    bgImage: "/rooms/earthy/bot_center.png",
    tileRect: { x: 1, y: 20, w: 7, h: 3 },
    furniture: [
      { type: "desk",       xPct: 25, yPct: 30 },
      { type: "whiteboard", xPct: 55, yPct: 20 },
      { type: "plant",      xPct: 75, yPct: 65 },
    ],
  },
  {
    id: "qa",
    label: "QA & Docs",
    gridArea: "qa",
    color: "#fffbeb",
    bgImage: "/rooms/earthy/top_right.png",
    tileRect: { x: 9, y: 20, w: 8, h: 3 },
    furniture: [
      { type: "desk",      xPct: 20, yPct: 25 },
      { type: "desk",      xPct: 60, yPct: 25 },
      { type: "bookshelf", xPct: 40, yPct: 65 },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    gridArea: "ops",
    color: "#f0f9ff",
    tileRect: { x: 18, y: 20, w: 8, h: 3 },
    furniture: [
      { type: "desk",  xPct: 30, yPct: 30 },
      { type: "pc",    xPct: 30, yPct: 20 },
      { type: "plant", xPct: 65, yPct: 60 },
    ],
  },
  {
    id: "meeting",
    label: "Meeting Room",
    gridArea: "meeting",
    color: "#f8fafc",
    tileRect: { x: 17, y: 1, w: 9, h: 6 },
    furniture: [
      { type: "whiteboard", xPct: 40, yPct: 20 },
      { type: "plant",      xPct: 75, yPct: 60 },
    ],
  },
  {
    id: "pantry",
    label: "Pantry",
    gridArea: "pantry",
    color: "#fefce8",
    tileRect: { x: 27, y: 1, w: 4, h: 6 },
    furniture: [
      { type: "plant", xPct: 25, yPct: 55 },
      { type: "plant", xPct: 65, yPct: 40 },
    ],
  },
  {
    id: "lounge",
    label: "Lounge",
    gridArea: "lounge",
    color: "#fdf4ff",
    tileRect: { x: 27, y: 10, w: 4, h: 13 },
    furniture: [
      { type: "plant", xPct: 20, yPct: 30 },
      { type: "plant", xPct: 60, yPct: 70 },
    ],
  },
]

// ─── Employees ────────────────────────────────────────────────────────────────
//
// charIndex matches gen_sprites.py AGENTS order:
//   0=Nora 1=Mia 2=Luna 3=Aria 4=Vera 5=Rex 6=Sage 7=Iris 8=Zoe 9=Nova 10=Lyra 11=Safe
//
export const EMPLOYEES: EmployeeData[] = [
  {
    id: "safe",
    name: "Safe",
    thaiRole: "เจ้าของ / ผู้กำกับ",
    role: "Owner & Director",
    roomId: "boss",
    charIndex: 11,
    portraitSrc: "/team/pixel/nora.png", // placeholder — Safe's portrait
    activities: ["meeting", "reviewing", "walking", "coffee", "idle"],
    homeTile: { x: 4, y: 4 },
  },
  {
    id: "nora",
    name: "Nora",
    thaiRole: "เลขา / Chief of Staff",
    role: "AI Secretary",
    roomId: "nora",
    charIndex: 0,
    portraitSrc: "/team/pixel/nora.png",
    activities: ["reviewing", "meeting", "typing", "coffee", "idle"],
    homeTile: { x: 12, y: 4 },
  },
  {
    id: "aria",
    name: "Aria",
    thaiRole: "Tech Lead",
    role: "System Architect",
    roomId: "dev",
    charIndex: 3,
    portraitSrc: "/team/pixel/aria.png",
    activities: ["coding", "presenting", "reviewing", "meeting", "idle"],
    homeTile: { x: 3, y: 13 },
  },
  {
    id: "mia",
    name: "Mia",
    thaiRole: "Frontend Developer",
    role: "UI Engineer",
    roomId: "dev",
    charIndex: 1,
    portraitSrc: "/team/pixel/mia.png",
    activities: ["coding", "debugging", "typing", "coffee", "idle"],
    homeTile: { x: 7, y: 13 },
  },
  {
    id: "luna",
    name: "Luna",
    thaiRole: "Backend Developer",
    role: "API Engineer",
    roomId: "dev",
    charIndex: 2,
    portraitSrc: "/team/pixel/luna.png",
    activities: ["coding", "debugging", "typing", "idle"],
    homeTile: { x: 11, y: 13 },
  },
  {
    id: "sage",
    name: "Sage",
    thaiRole: "Database Engineer",
    role: "DB & Query",
    roomId: "dev",
    charIndex: 6,
    portraitSrc: "/team/pixel/sage.png",
    activities: ["typing", "reviewing", "coffee", "coding", "idle"],
    homeTile: { x: 15, y: 13 },
  },
  {
    id: "vera",
    name: "Vera",
    thaiRole: "Security Engineer",
    role: "OWASP & Hardening",
    roomId: "sec",
    charIndex: 4,
    portraitSrc: "/team/pixel/vera.png",
    activities: ["reviewing", "debugging", "typing", "idle"],
    homeTile: { x: 20, y: 13 },
  },
  {
    id: "iris",
    name: "Iris",
    thaiRole: "Code Reviewer",
    role: "Quality Assurance",
    roomId: "sec",
    charIndex: 7,
    portraitSrc: "/team/pixel/iris.png",
    activities: ["reviewing", "typing", "coffee", "idle"],
    homeTile: { x: 24, y: 13 },
  },
  {
    id: "nova",
    name: "Nova",
    thaiRole: "UI/UX Designer",
    role: "Design System",
    roomId: "design",
    charIndex: 9,
    portraitSrc: "/team/pixel/nova.png",
    activities: ["typing", "presenting", "coffee", "walking", "idle"],
    homeTile: { x: 3, y: 21 },
  },
  {
    id: "zoe",
    name: "Zoe",
    thaiRole: "QA Engineer",
    role: "Test & Quality",
    roomId: "qa",
    charIndex: 8,
    portraitSrc: "/team/pixel/zoe.png",
    activities: ["debugging", "typing", "reviewing", "coffee", "idle"],
    homeTile: { x: 10, y: 21 },
  },
  {
    id: "lyra",
    name: "Lyra",
    thaiRole: "Technical Writer",
    role: "Docs & Runbooks",
    roomId: "qa",
    charIndex: 10,
    portraitSrc: "/team/pixel/lyra.png",
    activities: ["typing", "reviewing", "coffee", "idle"],
    homeTile: { x: 14, y: 21 },
  },
  {
    id: "rex",
    name: "Rex",
    thaiRole: "DevOps Engineer",
    role: "CI/CD & Deploy",
    roomId: "ops",
    charIndex: 5,
    portraitSrc: "/team/pixel/rex.png",
    activities: ["typing", "debugging", "coffee", "idle"],
    homeTile: { x: 20, y: 21 },
  },
]

// ─── Display helpers ───────────────────────────────────────────────────────────

export const ACTIVITY_LABELS: Record<Activity, string> = {
  typing:     "✏️ Typing",
  coding:     "💻 Coding",
  debugging:  "🔍 Debugging",
  reviewing:  "📋 Reviewing",
  coffee:     "☕ Coffee break",
  walking:    "🚶 Walking",
  meeting:    "📅 In meeting",
  idle:       "💭 Thinking",
  presenting: "📊 Presenting",
}

export const MOOD_LABELS: Record<Mood, string> = {
  happy:       "😊 Happy",
  focused:     "🎯 Focused",
  tired:       "😴 Tired",
  caffeinated: "⚡ Caffeinated",
}

export const MOOD_COLORS: Record<Mood, string> = {
  happy:       "#16a34a",
  focused:     "#2563eb",
  tired:       "#9ca3af",
  caffeinated: "#f59e0b",
}
