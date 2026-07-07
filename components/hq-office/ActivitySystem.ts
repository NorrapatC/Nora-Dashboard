// ActivitySystem.ts — Activity rotation, mood transitions, animation mapping
// WHY: Isolating all "behaviour" logic here keeps components pure and makes
//      the activity system easy to tune without touching render code.

import type { Activity, Mood, Direction } from "./OfficeData"
import { EMPLOYEES } from "./OfficeData"
import type { TilePos } from "./TileMap"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AnimationState = {
  /** Which sprite sheet row to use for direction */
  direction: Direction
  /** CSS animation class to apply */
  animClass: "walk" | "type-bob" | "idle" | "think"
}

// ─── Activity → animation mapping ─────────────────────────────────────────────
//
// WHY step mapping: each activity has a "feel".
// coding/debugging = typing fast (type-bob + face down)
// meeting/presenting = stand still facing camera (idle down)
// walking = walk animation with direction
// coffee/idle = idle + slow think bob
//
const ACTIVITY_ANIMATION: Record<Activity, AnimationState> = {
  typing:     { direction: "down",  animClass: "type-bob" },
  coding:     { direction: "down",  animClass: "type-bob" },
  debugging:  { direction: "right", animClass: "type-bob" },
  reviewing:  { direction: "down",  animClass: "idle"     },
  coffee:     { direction: "down",  animClass: "think"    },
  walking:    { direction: "right", animClass: "walk"     },
  meeting:    { direction: "down",  animClass: "idle"     },
  idle:       { direction: "down",  animClass: "think"    },
  presenting: { direction: "down",  animClass: "idle"     },
}

export function getActivityAnimation(activity: Activity): AnimationState {
  return ACTIVITY_ANIMATION[activity]
}

// ─── Activity → sprite pose cell ──────────────────────────────────────────────
//
// The character sheets (safe_activity.png and the team sheets) are 8×8 grids of
// 128px cells. Each cell is a *pose*, not a walk-direction frame. We map each
// activity to the cell that best depicts it:
//
//   Row 0 → standing / idle (front)
//   Row 2 → 8-frame walk cycle  (animated separately, see WALK_POSE)
//   Row 3 → sitting at a laptop (heads-down work)
//   Row 4 → standing holding a document (review)
//   Row 5 → presenting beside a chart (cols 4-7)
//   Row 7 → standing holding a coffee  (cols 4-7)
//
export type SpritePose = { row: number; col: number }

/** Walk cycle lives on row 2; CSS animates the 8 columns. */
export const WALK_POSE: SpritePose = { row: 2, col: 0 }
export const WALK_FRAMES = 8

const ACTIVITY_POSE: Record<Activity, SpritePose> = {
  typing:     { row: 3, col: 1 },  // sitting, laptop
  coding:     { row: 3, col: 0 },  // sitting, laptop
  debugging:  { row: 3, col: 2 },  // sitting, laptop (alt)
  reviewing:  { row: 4, col: 1 },  // standing, document
  coffee:     { row: 7, col: 4 },  // standing, coffee cup
  walking:    WALK_POSE,           // overridden by walk animation
  meeting:    { row: 5, col: 4 },  // presenting beside chart
  idle:       { row: 0, col: 0 },  // standing, front
  presenting: { row: 5, col: 5 },  // presenting beside chart (alt)
}

export function getActivityPose(activity: Activity): SpritePose {
  return ACTIVITY_POSE[activity]
}

// ─── Activity selection ────────────────────────────────────────────────────────
//
// Picks next activity weighted toward the employee's role + current mood.
// "coffee" after "tired" mood: if mood = tired → bump coffee weight.
// "walking" is universal but rare.

function weightedPick<T>(pool: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

export function getNextActivity(
  employeeId: string,
  currentMood: Mood,
  currentActivity: Activity,
): Activity {
  const emp = EMPLOYEES.find((e) => e.id === employeeId)
  if (!emp) return "idle"

  const pool = emp.activities
  const weights = pool.map((act) => {
    let w = 1
    // Avoid repeating the same activity twice in a row (bias away)
    if (act === currentActivity) w *= 0.3
    // If tired → coffee more likely
    if (act === "coffee" && currentMood === "tired") w *= 3
    // If caffeinated → active work more likely, coffee less
    if (act === "coffee" && currentMood === "caffeinated") w *= 0.2
    if ((act === "coding" || act === "typing") && currentMood === "caffeinated") w *= 2
    // If happy → social activities (meeting, presenting) more likely
    if ((act === "meeting" || act === "presenting") && currentMood === "happy") w *= 2
    return w
  })

  return weightedPick(pool, weights)
}

// ─── Mood transitions ──────────────────────────────────────────────────────────
//
// Mood follows a probabilistic state machine.
// coffee → caffeinated (75% chance)
// coding/debugging × 2 rounds → focused
// idle/walking × 2 rounds → tired
// All states drift toward "focused" over time (steady state).
//
const MOOD_TRANSITION: Record<Mood, Partial<Record<Activity, Mood>>> = {
  happy: {
    coding:    "focused",
    debugging: "focused",
    idle:      "tired",
    coffee:    "caffeinated",
  },
  focused: {
    idle:    "tired",
    walking: "tired",
    coffee:  "caffeinated",
    meeting: "happy",
  },
  tired: {
    coffee:     "caffeinated",
    idle:       "tired",     // stays tired until coffee
    coding:     "tired",     // can't snap out easily
    reviewing:  "tired",
  },
  caffeinated: {
    idle:      "happy",
    walking:   "happy",
    coffee:    "caffeinated", // double coffee — stays wired
    debugging: "focused",
    coding:    "focused",
  },
}

export function updateMood(current: Mood, activity: Activity): Mood {
  const transitions = MOOD_TRANSITION[current]
  const next = transitions[activity]
  if (!next) return current

  // Add some randomness — don't always transition
  // WHY: prevents all employees from having perfectly predictable mood cycles
  if (Math.random() > 0.5) return current
  return next
}

// ─── Productivity scoring ──────────────────────────────────────────────────────
//
// Returns a 0–100 productivity delta based on current activity + mood.
// Used by HQOffice reducer to adjust the productivity gauge.
//
const ACTIVITY_PROD_DELTA: Record<Activity, number> = {
  typing:     +8,
  coding:     +12,
  debugging:  +6,
  reviewing:  +8,
  coffee:     -2,
  walking:    -4,
  meeting:    +2,
  idle:       -6,
  presenting: +4,
}

const MOOD_PROD_MULTIPLIER: Record<Mood, number> = {
  focused:     1.4,
  happy:       1.1,
  caffeinated: 1.2,
  tired:       0.6,
}

export function calcProductivityDelta(activity: Activity, mood: Mood): number {
  const base = ACTIVITY_PROD_DELTA[activity]
  const mult = MOOD_PROD_MULTIPLIER[mood]
  return Math.round(base * mult)
}

export function clampProductivity(p: number): number {
  return Math.max(10, Math.min(100, p))
}

// ─── Interval helpers ──────────────────────────────────────────────────────────

/** How long (ms) each activity lasts before changing — 12-24s, staggered */
export function getActivityDuration(): number {
  return 12_000 + Math.random() * 12_000
}

/** Stagger offset for each employee to avoid synchronized ticks — 0-15s */
export function getStaggerOffset(index: number): number {
  // Use a deterministic offset so layout is consistent on re-mount
  return (index * 1237) % 15_000
}

// ─── RPG game routing ──────────────────────────────────────────────────────────
//
// Rotating meeting seats — 4 positions around a table.
// Each employee index selects a seat so they don't pile on the same tile.
//
const MEETING_SEATS: TilePos[] = [
  { x: 19, y: 3 },
  { x: 21, y: 3 },
  { x: 23, y: 3 },
  { x: 19, y: 5 },
]

/**
 * Returns the target tile for a character given their current activity.
 * coffee      → pantry counter (29, 4)
 * meeting     → rotating seat based on employee index
 * walking     → offset from home tile (+2 x, same y, clamped inside room)
 * default     → home tile (desk)
 */
export function getTargetTile(employeeId: string, activity: Activity): TilePos {
  const emp = EMPLOYEES.find((e) => e.id === employeeId)
  if (!emp) return { x: 4, y: 4 }

  switch (activity) {
    case "coffee":
      return { x: 29, y: 4 }

    case "meeting":
    case "presenting": {
      const idx = EMPLOYEES.indexOf(emp)
      return MEETING_SEATS[idx % MEETING_SEATS.length]
    }

    case "walking": {
      // Move 2 tiles right from home (light stroll) — clamped to MAP_W - 2
      const wx = Math.min(emp.homeTile.x + 2, 29)
      return { x: wx, y: emp.homeTile.y }
    }

    default:
      return { x: emp.homeTile.x, y: emp.homeTile.y }
  }
}

/**
 * Returns the CSS idle animation class for an activity.
 * Game loop applies this to the sprite wrapper div while the character is stopped.
 */
export function getIdleAnimClass(activity: Activity): "type-bob" | "think" | "idle" {
  switch (activity) {
    case "typing":
    case "coding":
    case "debugging":
      return "type-bob"

    case "idle":
    case "coffee":
      return "think"

    default:
      return "idle"
  }
}
