"use client"
// CharacterLayer.tsx — Absolutely-positioned full-body chibi sprites that the
// rAF loop moves via ref.style.transform.
//
// WHY absolutely-positioned divs and not canvas:
//   Characters need click handlers, ARIA labels, and CSS animations. Canvas
//   can't do any of these without reimplementing the browser's event model.
//   Absolute divs give every DOM affordance while the rAF loop writes transform
//   directly — zero React re-renders per frame.
//
// Sprite source — REAL sliced artwork from the image/ activity sheets:
//   /sprites/<key>/idle.png  — one 128px standing frame (bg removed → transparent)
//   /sprites/<key>/walk.png  — horizontal strip of N×128px side-walk frames
//   These are true side-view chibi walk cycles, so a moving character DOES turn
//   to face its travel direction: art faces RIGHT by default, and the rAF loop
//   adds .face-left to mirror it (scaleX(-1)) when walking left.
//
// Animation split (never triggers React re-render):
//   - position   → rAF writes outer div transform (translate)
//   - facing     → rAF toggles .face-left on outer div  → CSS mirrors the sprite
//   - walk/idle  → rAF toggles .is-walking on outer div → CSS swaps idle.png for
//                  the walk strip + steps() frame animation
//   - bob/mood   → React-driven class (changes only a few ×/min)

import { useEffect } from "react"
import type { EmployeeData } from "./OfficeData"
import type { EmployeeState } from "./types"
import { tileCenterPixel } from "./TileMap"

// ─── Sprite geometry ───────────────────────────────────────────────────────────
// Source cells are 128px. We render each at SIZE px. Tiles are 48px, so a ~76px
// chibi reads clearly as a character standing on its tile without swamping it.

const SIZE = 76                          // displayed sprite cell (px)
export const OFFSET_X = SIZE / 2         // 38 — horizontal centre over the tile
export const OFFSET_Y = SIZE - 4         // 72 — feet sit near the bottom of the cell

// ─── Sprite registry — what art actually exists ────────────────────────────────
// frames = walk-strip frame count (must match the sliced walk.png).
type SpriteDef = { frames: number; walkDur: number }
const SPRITES: Record<string, SpriteDef> = {
  safe:     { frames: 8, walkDur: 0.7 },
  zoe:      { frames: 8, walkDur: 0.7 },
  redwoman: { frames: 6, walkDur: 0.6 },
}

// Employee → sprite key.
//   INTERIM: only 3 distinct sheets are sliced clean so far (safe, zoe, redwoman).
//   The other 9 reuse these until more art is extracted — the remaining-art
//   options are presented to Safe after this renderer is runtime-verified.
const SPRITE_OF: Record<string, string> = {
  safe: "safe",
  zoe:  "zoe",
  nora: "redwoman",
  aria: "safe",
  mia:  "zoe",
  luna: "redwoman",
  sage: "safe",
  vera: "zoe",
  iris: "redwoman",
  nova: "zoe",
  lyra: "redwoman",
  rex:  "safe",
}

function spriteKeyFor(id: string): string {
  return SPRITE_OF[id] ?? "safe"
}

const STYLE_ID = "hq-char-layer-keyframes"

function injectStyles(): void {
  if (typeof document === "undefined") return
  if (document.getElementById(STYLE_ID)) return

  // Per-sprite walk rules — emitted with LITERAL frame counts so steps() is exact
  // (steps() with a CSS var() is unreliable across engines).
  const spriteRules = Object.entries(SPRITES)
    .map(([key, def]) => {
      const stripW = def.frames * SIZE
      return `
    .hq-sprite[data-sprite="${key}"] {
      background-image: url(/sprites/${key}/idle.png);
      background-size: ${SIZE}px ${SIZE}px;
    }
    .is-walking .hq-sprite[data-sprite="${key}"] {
      background-image: url(/sprites/${key}/walk.png);
      background-size: ${stripW}px ${SIZE}px;
      animation: hq-walk-${key} ${def.walkDur}s steps(${def.frames}) infinite;
    }
    @keyframes hq-walk-${key} {
      from { background-position-x: 0; }
      to   { background-position-x: -${stripW}px; }
    }`
    })
    .join("\n")

  const el = document.createElement("style")
  el.id = STYLE_ID
  el.textContent = `
    /* Sprite frame — background-image carries the art; position is on the outer div. */
    .hq-sprite {
      width: ${SIZE}px;
      height: ${SIZE}px;
      background-repeat: no-repeat;
      background-position: 0 0;
      image-rendering: auto;
      filter: drop-shadow(0 2px 2px rgba(0,0,0,.28));
    }
    /* Facing: art faces RIGHT; mirror when walking left. */
    .face-left .hq-sprite { transform: scaleX(-1); }

    ${spriteRules}

    /* Idle bobs — applied to the bob wrapper (transform only; never clobbers position). */
    @keyframes hq-type-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
    @keyframes hq-think    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
    @keyframes hq-walk-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }

    .hq-bob--type-bob { animation: hq-type-bob 0.45s ease-in-out infinite; }
    .hq-bob--think    { animation: hq-think 1.6s ease-in-out infinite; }
    .hq-bob--idle     { animation: none; }
    /* While walking, replace idle bob with a gentle stride bob. */
    .is-walking .hq-bob { animation: hq-walk-bob 0.36s ease-in-out infinite !important; }

    /* Ground shadow pulse — grounds the sprite on the floor. */
    @keyframes hq-shadow { 0%,100% { transform: translateX(-50%) scaleX(1);   opacity:.30 }
                           50%      { transform: translateX(-50%) scaleX(.9); opacity:.22 } }

    /* Selected: soft brand halo behind the sprite. */
    @keyframes hq-glow {
      0%,100% { box-shadow: 0 0 0 0 rgba(201,100,66,0); }
      50%     { box-shadow: 0 0 0 7px rgba(201,100,66,.28); }
    }
    .hq-char-selected .hq-halo {
      animation: hq-glow 1.5s ease-in-out infinite;
      background: radial-gradient(ellipse at center, rgba(201,100,66,.22), rgba(201,100,66,0) 70%);
    }
  `
  document.head.appendChild(el)
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  employees: EmployeeData[]
  employeeStates: Record<string, EmployeeState>
  charDivRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  selectedId: string | null
  onSelect: (id: string) => void
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CharacterLayer({
  employees,
  employeeStates,
  charDivRefs,
  selectedId,
  onSelect,
}: Props) {
  useEffect(() => { injectStyles() }, [])

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {employees.map((emp) => {
        const empState = employeeStates[emp.id]
        if (!empState) return null

        const isSelected = selectedId === emp.id
        const center = tileCenterPixel(emp.homeTile.x, emp.homeTile.y)
        const spriteKey = spriteKeyFor(emp.id)

        // Initial transform matches exactly what the rAF loop writes — no frame-1 snap.
        const initTransform = `translate(${center.px - OFFSET_X}px, ${center.py - OFFSET_Y}px)`

        return (
          <div
            key={emp.id}
            ref={(el) => { charDivRefs.current[emp.id] = el }}
            role="button"
            tabIndex={0}
            aria-label={`${emp.name} — ${empState.activity}`}
            onClick={() => { onSelect(emp.id) }}
            onKeyDown={(e) => { if (e.key === "Enter") onSelect(emp.id) }}
            className={isSelected ? "hq-char-selected" : ""}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: SIZE,
              transform: initTransform,   // loop overwrites every frame
              pointerEvents: "auto",
              cursor: "pointer",
              zIndex: isSelected ? 6 : 5,
            }}
          >
            {/* Mood icon floating above the head */}
            <div
              style={{
                position: "absolute",
                top: -4,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 15,
                lineHeight: 1,
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,.3))",
                userSelect: "none",
                pointerEvents: "none",
                zIndex: 4,
              }}
            >
              {MOOD_ICON[empState.mood]}
            </div>

            {/* Ground shadow — grounds the character on the floor */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                width: SIZE * 0.4,
                height: SIZE * 0.11,
                transform: "translateX(-50%)",
                background: "radial-gradient(ellipse at center, rgba(0,0,0,.34), rgba(0,0,0,0) 70%)",
                animation: "hq-shadow 1.6s ease-in-out infinite",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* Selection halo — soft brand glow behind the sprite */}
            <div
              className="hq-halo"
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                width: SIZE * 0.62,
                height: SIZE * 0.62,
                transform: "translateX(-50%)",
                borderRadius: "50%",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* Bob wrapper — carries idle/stride bob */}
            <div
              className={`hq-bob hq-bob--${empState.idleAnimClass}`}
              style={{ position: "relative", width: SIZE, height: SIZE, zIndex: 1 }}
            >
              {/* Sprite frame — idle.png static, walk.png stepped while .is-walking */}
              <div className="hq-sprite" data-sprite={spriteKey} aria-hidden="true" />
            </div>

            {/* Name label */}
            <div
              style={{
                position: "relative",
                marginTop: -8,
                fontSize: 10,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                letterSpacing: 0.4,
                color: isSelected ? "#ffffff" : "#3b3530",
                background: isSelected ? "#c96442" : "rgba(255,255,255,.85)",
                padding: "1px 7px",
                borderRadius: 7,
                whiteSpace: "nowrap",
                userSelect: "none",
                fontWeight: 700,
                textAlign: "center",
                width: "fit-content",
                marginInline: "auto",
                boxShadow: "0 1px 2px rgba(0,0,0,.15)",
                zIndex: 2,
              }}
            >
              {emp.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const MOOD_ICON: Record<string, string> = {
  happy:       "😊",
  focused:     "🎯",
  tired:       "😴",
  caffeinated: "⚡",
}
