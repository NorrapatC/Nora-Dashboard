"use client"
// GameCanvas.tsx — Static canvas tile map drawn once on mount
//
// WHY canvas and not divs:
//   The world never changes — floor, walls, furniture, labels are static.
//   Canvas draws the entire 1536×1152 world in one pass and never touches it
//   again. No DOM nodes, no re-renders, no layout thrashing.
//
// WHY real tile assets (not flat rectangles):
//   floor_gray / floor_green are seamless 32px textures; furniture sprites are
//   hand-drawn. Tiling them via createPattern + drawing furniture gives a real
//   game-floor look instead of pastel CSS blocks.
//
// WHY drawn once, after images load:
//   The map is static. We load every texture, then paint a single frame.

import { useEffect, useRef } from "react"
import { ROOMS } from "./OfficeData"
import type { FurnitureItem } from "./OfficeData"
import { MAP_W, MAP_H, TILE_SIZE, getWalkable } from "./TileMap"

const CANVAS_W = MAP_W * TILE_SIZE  // 1536
const CANVAS_H = MAP_H * TILE_SIZE  // 1152

// Furniture is drawn at this multiple of its native pixel size.
const FURN_SCALE = 2.4
const FURN_SRC: Record<FurnitureItem["type"], string> = {
  desk:       "/furniture/desk.png",
  pc:         "/furniture/pc.png",
  plant:      "/furniture/plant.png",
  bookshelf:  "/furniture/bookshelf.png",
  whiteboard: "/furniture/whiteboard.png",
}

const WALL_TOP   = "#6f5b46"   // warm wall face
const WALL_SHADE = "#5a4837"   // wall side / shadow
const LABEL_BG   = "rgba(58,46,36,.62)"
const LABEL_FG   = "#f4ece2"

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawWorld(
  ctx: CanvasRenderingContext2D,
  tex: { gray: HTMLImageElement; green: HTMLImageElement },
  furn: Record<string, HTMLImageElement>,
): void {
  const grayPat = ctx.createPattern(tex.gray, "repeat")!
  const greenPat = ctx.createPattern(tex.green, "repeat")!
  const walkable = getWalkable()

  // 1. Base floor: gray everywhere (corridors)
  ctx.fillStyle = grayPat
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // 2. Room interiors: green carpet
  ctx.fillStyle = greenPat
  for (const room of ROOMS) {
    const { x, y, w, h } = room.tileRect
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, w * TILE_SIZE, h * TILE_SIZE)
  }

  // 3. Walls — every blocked tile gets a chunky wall block with a darker base
  //    edge so it reads as 3D rather than a flat line.
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      if (walkable[ty * MAP_W + tx] !== 1) continue
      const px = tx * TILE_SIZE
      const py = ty * TILE_SIZE
      ctx.fillStyle = WALL_TOP
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)
      // bottom shade strip = faux depth
      ctx.fillStyle = WALL_SHADE
      ctx.fillRect(px, py + TILE_SIZE - 6, TILE_SIZE, 6)
      // top highlight
      ctx.fillStyle = "rgba(255,255,255,.06)"
      ctx.fillRect(px, py, TILE_SIZE, 3)
    }
  }

  // 4. Soft inner shadow around each room edge (depth where floor meets wall)
  for (const room of ROOMS) {
    const { x, y, w } = room.tileRect
    const px = x * TILE_SIZE, py = y * TILE_SIZE
    const pw = w * TILE_SIZE
    const g = ctx.createLinearGradient(0, py, 0, py + 14)
    g.addColorStop(0, "rgba(0,0,0,.18)")
    g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = g
    ctx.fillRect(px, py, pw, 14)
  }

  // 5. Furniture — anchored bottom-centre at its room-relative position
  for (const room of ROOMS) {
    const { x, y, w, h } = room.tileRect
    const rx = x * TILE_SIZE, ry = y * TILE_SIZE
    const rw = w * TILE_SIZE, rh = h * TILE_SIZE
    for (const item of room.furniture) {
      const img = furn[item.type]
      if (!img) continue
      const dw = img.width * FURN_SCALE
      const dh = img.height * FURN_SCALE
      const cx = rx + (item.xPct / 100) * rw
      const cy = ry + (item.yPct / 100) * rh
      // contact shadow
      ctx.save()
      ctx.fillStyle = "rgba(0,0,0,.18)"
      ctx.beginPath()
      ctx.ellipse(cx, cy, dw * 0.34, dh * 0.12, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      ctx.drawImage(img, cx - dw / 2, cy - dh, dw, dh)
    }
  }

  // 6. Room labels — compact chip near top of each room
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = "700 12px ui-monospace, SFMono-Regular, Menlo, monospace"
  for (const room of ROOMS) {
    const { x, y, w } = room.tileRect
    const label = room.label.toUpperCase()
    const cx = (x + w / 2) * TILE_SIZE
    const cy = y * TILE_SIZE + 16
    const textW = ctx.measureText(label).width
    const padX = 8
    ctx.fillStyle = LABEL_BG
    roundRect(ctx, cx - textW / 2 - padX, cy - 9, textW + padX * 2, 18, 5)
    ctx.fill()
    ctx.fillStyle = LABEL_FG
    ctx.fillText(label, cx, cy + 1)
  }

  // 7. Vignette — subtle darkening at the edges for focus
  const vig = ctx.createRadialGradient(
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.35,
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.75,
  )
  vig.addColorStop(0, "rgba(0,0,0,0)")
  vig.addColorStop(1, "rgba(0,0,0,.22)")
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const furnTypes = Array.from(new Set(ROOMS.flatMap((r) => r.furniture.map((f) => f.type))))

    Promise.all([
      loadImage("/office/floor_gray.png"),
      loadImage("/office/floor_green.png"),
      ...furnTypes.map((t) => loadImage(FURN_SRC[t])),
    ])
      .then((imgs) => {
        if (cancelled) return
        const [gray, green, ...furnImgs] = imgs
        const furn: Record<string, HTMLImageElement> = {}
        furnTypes.forEach((t, i) => { furn[t] = furnImgs[i] })
        drawWorld(ctx, { gray, green }, furn)
      })
      .catch((err) => { console.error("GameCanvas asset load failed:", err) })

    return () => { cancelled = true }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        display: "block",
        width: CANVAS_W,
        height: CANVAS_H,
        borderRadius: 12,
      }}
    />
  )
}
