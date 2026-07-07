"use client"
// HQOffice.tsx — Root component: RPG tile-map office + activity loop + side panel
//
// Architecture overview:
//
//   Layer 1: <GameCanvas>   — static canvas, drawn once, never re-drawn
//   Layer 2: <CharacterLayer> — absolutely-positioned divs, rAF loop writes transform
//   Layer 3: <EmployeeStatusPanel> — React UI at z-index 50
//
// State split (WHY):
//   React useReducer  → activity, mood, idleAnimClass, productivity, history
//                       (anything that needs to drive React re-renders)
//   MutableRef (charGameRef) → pixelX/Y, tileX/Y, facing, isMoving, pathQueue
//                       (anything written ~60×/sec — must NEVER go through setState)
//   MutableRef (stateRef)   → mirror of latest React state for tick() to read
//                       (prevents stale closure — tick uses [] deps but reads live state)
//
// rAF loop rules:
//   - Reads from refs, writes to refs and DOM (divRef.style.transform)
//   - NEVER calls dispatch/setState
//   - Cancelled on unmount via cancelAnimationFrame
//   - dt capped at 50ms to handle tab-switch / background pauses
//
// Walk animation:
//   - Game loop adds "is-walking" class to outer char div while pathQueue.length > 0
//   - "is-walking" swaps the idle bob for a stronger stride bob + faster idle cycle
//   - The character art is a front-facing circular avatar (no directional frames),
//     so movement reads through position + bob, not by turning to face travel dir
//   - On arrival, "is-walking" removed, idle animation resumes

import { useReducer, useEffect, useCallback, useRef } from "react"
import { EMPLOYEES } from "./OfficeData"
import {
  getNextActivity,
  updateMood,
  calcProductivityDelta,
  clampProductivity,
  getActivityDuration,
  getStaggerOffset,
  getTargetTile,
  getIdleAnimClass,
} from "./ActivitySystem"
import type { EmployeeState, CharGameState, HistoryEntry } from "./types"
import { tileCenterPixel, findPath } from "./TileMap"
import GameCanvas from "./GameCanvas"
import IsoScene from "./IsoScene"
import CharacterLayer, { OFFSET_X, OFFSET_Y } from "./CharacterLayer"
import EmployeeStatusPanel from "./EmployeeStatusPanel"

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPEED_PX_PER_SEC = 96       // pixels per second walking speed
const ARRIVAL_THRESHOLD = 3       // pixels — how close = "arrived at tile center"
const MAX_DT = 50                 // ms — cap delta-time to prevent jump after tab-switch

// ─── State ─────────────────────────────────────────────────────────────────────

type OfficeState = {
  employees: Record<string, EmployeeState>
  selectedId: string | null
}

type OfficeAction =
  | { type: "TICK"; employeeId: string; next: Partial<EmployeeState> }
  | { type: "SELECT"; id: string | null }

function buildInitialEmployeeState(id: string): EmployeeState {
  const emp = EMPLOYEES.find((e) => e.id === id)!
  const activity = emp.activities[0]
  return {
    activity,
    mood: "focused",
    idleAnimClass: getIdleAnimClass(activity),
    productivity: 70 + Math.floor(Math.random() * 20),  // start 70–90
    activityHistory: [],
  }
}

function buildInitialState(): OfficeState {
  const employees: Record<string, EmployeeState> = {}
  for (const emp of EMPLOYEES) {
    employees[emp.id] = buildInitialEmployeeState(emp.id)
  }
  return { employees, selectedId: null }
}

function officeReducer(state: OfficeState, action: OfficeAction): OfficeState {
  switch (action.type) {
    case "TICK": {
      const current = state.employees[action.employeeId]
      if (!current) return state

      const nextPartial = action.next
      const newEntry: HistoryEntry | null =
        nextPartial.activity && nextPartial.activity !== current.activity
          ? { activity: current.activity, mood: current.mood, timestamp: Date.now() }
          : null

      const newHistory = newEntry
        ? [...current.activityHistory, newEntry].slice(-10)  // keep last 10
        : current.activityHistory

      return {
        ...state,
        employees: {
          ...state.employees,
          [action.employeeId]: {
            ...current,
            ...nextPartial,
            activityHistory: newHistory,
          },
        },
      }
    }
    case "SELECT":
      return {
        ...state,
        selectedId: state.selectedId === action.id ? null : action.id,
      }
    default:
      return state
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HQOffice() {
  const [state, dispatch] = useReducer(officeReducer, null, buildInitialState)

  // ── stateRef — keeps tick() from reading stale closure state ──────────────
  // WHY: tick() uses empty deps [], so it captures `state` at mount.
  //      stateRef is updated every render so tick always reads the latest values.
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state })

  // ── charGameRef — per-character physics state, never in React state ────────
  const charGameRef = useRef<Record<string, CharGameState>>({})

  // ── DOM refs — game loop writes directly to these ──────────────────────────
  const charDivRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ── Init charGameRef from home tiles on mount ─────────────────────────────
  useEffect(() => {
    for (const emp of EMPLOYEES) {
      const center = tileCenterPixel(emp.homeTile.x, emp.homeTile.y)
      charGameRef.current[emp.id] = {
        pixelX: center.px,
        pixelY: center.py,
        tileX: emp.homeTile.x,
        tileY: emp.homeTile.y,
        facing: "down",
        isMoving: false,
        pathQueue: [],
      }
    }
  }, []) // [] — one-time init, home tiles are static

  // ── rAF game loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number
    let lastTime: number | null = null

    function loop(now: number): void {
      const dt = Math.min(lastTime !== null ? now - lastTime : 16, MAX_DT) / 1000
      lastTime = now

      for (const emp of EMPLOYEES) {
        const gs = charGameRef.current[emp.id]
        const divEl = charDivRefs.current[emp.id]
        if (!gs || !divEl) continue

        if (gs.pathQueue.length > 0) {
          // ── Moving toward next tile ─────────────────────────────────────
          const target = gs.pathQueue[0]
          const targetPx = tileCenterPixel(target.x, target.y)

          const dx = targetPx.px - gs.pixelX
          const dy = targetPx.py - gs.pixelY
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Determine facing direction.
          // Sprites are side-view only (left/right). Set L/R when horizontal
          // travel dominates; for vertical-dominant motion KEEP the previous
          // facing so the character doesn't snap to a non-existent up/down frame.
          if (Math.abs(dx) > Math.abs(dy)) {
            gs.facing = dx > 0 ? "right" : "left"
          }

          if (dist <= ARRIVAL_THRESHOLD) {
            // Snap to tile center, pop path
            gs.pixelX = targetPx.px
            gs.pixelY = targetPx.py
            gs.tileX  = target.x
            gs.tileY  = target.y
            gs.pathQueue = gs.pathQueue.slice(1)

            if (gs.pathQueue.length === 0) {
              // Arrived at destination
              gs.isMoving = false
              divEl.classList.remove("is-walking")
            }
          } else {
            // Step toward target
            const step = SPEED_PX_PER_SEC * dt
            gs.pixelX += (dx / dist) * step
            gs.pixelY += (dy / dist) * step
            gs.isMoving = true
            divEl.classList.add("is-walking")
          }
        } else {
          // Idle
          gs.isMoving = false
          divEl.classList.remove("is-walking")
        }

        // Write position to DOM — no React state involved.
        divEl.style.transform = `translate(${gs.pixelX - OFFSET_X}px, ${gs.pixelY - OFFSET_Y}px)`
        // Mirror the side-view sprite when facing left (art faces right by default).
        divEl.classList.toggle("face-left", gs.facing === "left")
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(rafId) }
  }, []) // [] is intentional — loop reads from refs, not closed-over state

  // ── Activity tick — reads stateRef so closure is never stale ─────────────
  const tick = useCallback((employeeId: string) => {
    const empState = stateRef.current.employees[employeeId]
    if (!empState) return

    const nextActivity = getNextActivity(employeeId, empState.mood, empState.activity)
    const nextMood = updateMood(empState.mood, nextActivity)
    const delta = calcProductivityDelta(nextActivity, nextMood)
    const nextProd = clampProductivity(empState.productivity + delta)

    dispatch({
      type: "TICK",
      employeeId,
      next: {
        activity:      nextActivity,
        mood:          nextMood,
        idleAnimClass: getIdleAnimClass(nextActivity),
        productivity:  nextProd,
      },
    })

    // Compute path and assign to charGameRef — game loop picks it up next frame
    const gs = charGameRef.current[employeeId]
    if (gs) {
      const target = getTargetTile(employeeId, nextActivity)
      const path   = findPath(gs.tileX, gs.tileY, target.x, target.y)
      gs.pathQueue = path
    }
  }, []) // [] is safe — reads stateRef.current (always current), writes to refs

  // ── Staggered activity timers ─────────────────────────────────────────────
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const intervals: ReturnType<typeof setInterval>[] = []

    EMPLOYEES.forEach((emp, i) => {
      const stagger  = getStaggerOffset(i)
      const duration = getActivityDuration()

      const t = setTimeout(() => {
        tick(emp.id)

        const interval = setInterval(() => {
          tick(emp.id)
        }, duration)
        intervals.push(interval)
      }, stagger)

      timeouts.push(t)
    })

    return () => {
      timeouts.forEach(clearTimeout)
      intervals.forEach(clearInterval)
    }
  }, [tick]) // tick is stable (empty dep useCallback)

  // ── Selection handlers ────────────────────────────────────────────────────
  const handleSelect = useCallback((id: string) => {
    dispatch({ type: "SELECT", id })
  }, [])

  const handleClose = useCallback(() => {
    dispatch({ type: "SELECT", id: null })
  }, [])

  const selectedEmployee = state.selectedId
    ? EMPLOYEES.find((e) => e.id === state.selectedId)
    : null
  const selectedState = state.selectedId
    ? state.employees[state.selectedId]
    : null

  // ─── Canvas dimensions ──────────────────────────────────────────────────────
  const CANVAS_W = 32 * 48  // MAP_W * TILE_SIZE = 1536
  const CANVAS_H = 24 * 48  // MAP_H * TILE_SIZE = 1152

  return (
    // Outer = positioning context only (NOT scrollable) so the side panel can
    // anchor to the visible viewport instead of the tall scrolled content.
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#ede4d8",
        overflow: "hidden",
      }}
    >
      {/* Scroll region — the game world scrolls here; the panel does NOT. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
      {/* Header strip */}
      <div
        style={{
          padding: "10px 16px 8px",
          borderBottom: "1px solid #c8b89a",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f5ede0",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#64748b",
          }}
        >
          ⊞ NRP OFFICE — FLOOR PLAN
        </span>
        <span
          style={{
            fontSize: 9,
            color: "#94a3b8",
            marginLeft: 4,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          7 active · 5 syncing
        </span>
        {state.selectedId && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              color: "#c96442",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            ● {state.selectedId.toUpperCase()} SELECTED
          </span>
        )}
      </div>

      {/* ── Game world (canvas + character layer) ───────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: CANVAS_W,
          height: CANVAS_H,
          flexShrink: 0,
        }}
      >
        {/* Phase 1 thin-slice: isometric DEVELOPER room (replaces top-down RPG) */}
        <IsoScene />
        {false && (
          <>
            <GameCanvas />
            <CharacterLayer
              employees={EMPLOYEES}
              employeeStates={state.employees}
              charDivRefs={charDivRefs}
              selectedId={state.selectedId}
              onSelect={handleSelect}
            />
          </>
        )}
      </div>
      </div>
      {/* end scroll region */}

      {/* ── Side panel (conditional render) ─────────────────────────────────── */}
      {selectedEmployee && selectedState && (
        <EmployeeStatusPanel
          employeeId={selectedEmployee.id}
          state={selectedState}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
