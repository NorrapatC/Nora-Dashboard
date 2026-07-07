// types.ts — Shared runtime state types for HQ Office
// WHY: Extracted here so CharacterLayer / EmployeeStatusPanel / HQOffice can all
//      import these without creating circular dependencies.

import type { Activity, Mood } from "./OfficeData"
import type { TilePos } from "./TileMap"

export type { TilePos }

export type HistoryEntry = {
  activity: Activity
  mood: Mood
  timestamp: number  // Date.now() at time of change
}

// ─── Per-character game state (lives in MutableRef — never in React state) ─────
//
// WHY MutableRef and not useState:
//   The rAF loop reads and writes these values ~60 times/sec. Putting them in
//   React state would trigger 60 re-renders/sec and melt the CPU. Refs give us
//   mutable slots that survive renders without causing them.
//
export type CharGameState = {
  pixelX: number         // current pixel center-X of character
  pixelY: number         // current pixel center-Y of character
  tileX: number          // current tile X (integer)
  tileY: number          // current tile Y (integer)
  facing: "down" | "left" | "right"
  isMoving: boolean
  pathQueue: TilePos[]   // remaining tiles to walk through
}

// ─── React-managed employee state ─────────────────────────────────────────────
//
// idleAnimClass replaces the old animState: it tells the sprite which CSS
// keyframe to use while standing still. The walking animation is handled
// entirely by the game loop toggling the "is-walking" class.
//
export type EmployeeState = {
  activity: Activity
  mood: Mood
  idleAnimClass: "type-bob" | "think" | "idle"
  productivity: number             // 0–100
  activityHistory: HistoryEntry[]  // last 10 entries
}
