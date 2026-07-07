// TileMap.ts — Tile map constants, walkable grid, and BFS pathfinding
//
// WHY pure TypeScript (no React):
//   This module is imported by both the game loop (runs in rAF, no React) and
//   GameCanvas (draws the world). Zero React dependency keeps it testable and
//   prevents accidental re-render coupling.
//
// Layout reference (32×24 tiles at 48px each = 1536×1152px canvas):
//   Row 0       = outer top wall
//   Row 1–7     = boss(x1-7) + nora(x9-15) + meeting(x17-25) + pantry(x27-30)
//   Row 8–9     = corridor
//   Row 10–17   = dev(x1-16) + sec(x18-25) + lounge(x27-30)
//   Row 18–19   = corridor
//   Row 20–22   = design(x1-7) + qa(x9-16) + ops(x18-25)
//   Row 23      = outer bottom wall
//   Col 0       = outer left wall
//   Col 31      = outer right wall

export const MAP_W = 32
export const MAP_H = 24
export const TILE_SIZE = 48

// ─── Walkable map ──────────────────────────────────────────────────────────────
//
// 0 = walkable, 1 = blocked
// Outer border + internal wall tiles = blocked.
// Room interiors + corridors = walkable.
//
let _walkable: Uint8Array | null = null

export function buildWalkableMap(): Uint8Array {
  const map = new Uint8Array(MAP_W * MAP_H)

  // Default: everything walkable
  map.fill(0)

  // Outer border — all four edges
  for (let x = 0; x < MAP_W; x++) {
    map[0 * MAP_W + x] = 1           // top row
    map[(MAP_H - 1) * MAP_W + x] = 1 // bottom row
  }
  for (let y = 0; y < MAP_H; y++) {
    map[y * MAP_W + 0] = 1           // left col
    map[y * MAP_W + (MAP_W - 1)] = 1 // right col
  }

  // Internal walls — the vertical wall between lounge (col 26) and rooms to its left
  // Lounge spans x=27-30, rooms end at x=25. Col 26 = wall between them.
  for (let y = 1; y < MAP_H - 1; y++) {
    map[y * MAP_W + 26] = 1
  }
  // But leave a corridor gap at rows 8-9 and 18-19 for horizontal movement
  map[8 * MAP_W + 26] = 0
  map[9 * MAP_W + 26] = 0
  map[18 * MAP_W + 26] = 0
  map[19 * MAP_W + 26] = 0

  // Vertical wall between meeting/sec/ops (ends at x=25) and lounge already handled.
  // Horizontal wall between top rooms (rows 1-7) and dev/sec (rows 10-17).
  // Row 8-9 are corridors — leave walkable.
  // Horizontal wall between dev/sec (rows 10-17) and design/qa/ops (rows 20-22).
  // Rows 18-19 are corridors — leave walkable.

  // Internal room separator walls:
  // Between boss (x1-7) and nora (x9-15): col 8 = wall
  for (let y = 1; y < 8; y++) {
    map[y * MAP_W + 8] = 1
  }
  // Between nora (x9-15) and meeting (x17-25): col 16 = wall
  for (let y = 1; y < 7; y++) {
    map[y * MAP_W + 16] = 1
  }
  // Between meeting (x17-25) and lounge (x27-30): wall at col 26 already done above.

  // Between dev (x1-16) and sec (x18-25): col 17 = wall
  for (let y = 10; y < 18; y++) {
    map[y * MAP_W + 17] = 1
  }

  // Between design (x1-7) and qa (x9-16): col 8 = wall (lower section)
  for (let y = 20; y < 23; y++) {
    map[y * MAP_W + 8] = 1
  }
  // Between qa (x9-16) and ops (x18-25): col 17 = wall (lower section)
  for (let y = 20; y < 23; y++) {
    map[y * MAP_W + 17] = 1
  }

  return map
}

export function getWalkable(): Uint8Array {
  if (!_walkable) _walkable = buildWalkableMap()
  return _walkable
}

export function isWalkable(x: number, y: number): boolean {
  if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return false
  return getWalkable()[y * MAP_W + x] === 0
}

// ─── Coordinate helpers ────────────────────────────────────────────────────────

/** Top-left pixel of a tile */
export function tileToPixel(tx: number, ty: number): { px: number; py: number } {
  return { px: tx * TILE_SIZE, py: ty * TILE_SIZE }
}

/** Center pixel of a tile */
export function tileCenterPixel(tx: number, ty: number): { px: number; py: number } {
  return {
    px: tx * TILE_SIZE + TILE_SIZE / 2,
    py: ty * TILE_SIZE + TILE_SIZE / 2,
  }
}

// ─── BFS Pathfinding ───────────────────────────────────────────────────────────
//
// WHY BFS (not A*):
//   Map is only 32×24 = 768 tiles — BFS is fast enough and always finds the
//   shortest path. A* adds complexity with no meaningful performance gain here.
//
export type TilePos = { x: number; y: number }

const DIRS: TilePos[] = [
  { x: 0, y: -1 }, // up
  { x: 0, y: 1 },  // down
  { x: -1, y: 0 }, // left
  { x: 1, y: 0 },  // right
]

export function findPath(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): TilePos[] {
  // Same tile — no movement needed
  if (x0 === x1 && y0 === y1) return []

  // Guard: if destination is blocked, try to find nearest walkable neighbor
  if (!isWalkable(x1, y1)) {
    // Try neighbors of target in all 4 directions
    for (const d of DIRS) {
      const nx = x1 + d.x
      const ny = y1 + d.y
      if (isWalkable(nx, ny)) {
        return findPath(x0, y0, nx, ny)
      }
    }
    return [] // no walkable neighbor found
  }

  type Node = { x: number; y: number; path: TilePos[] }

  const queue: Node[] = [{ x: x0, y: y0, path: [] }]
  const visited = new Set<number>()
  visited.add(y0 * MAP_W + x0)

  while (queue.length > 0) {
    const node = queue.shift()!

    for (const dir of DIRS) {
      const nx = node.x + dir.x
      const ny = node.y + dir.y
      const key = ny * MAP_W + nx

      if (!isWalkable(nx, ny)) continue
      if (visited.has(key)) continue
      visited.add(key)

      const newPath = [...node.path, { x: nx, y: ny }]

      if (nx === x1 && ny === y1) {
        return newPath
      }

      queue.push({ x: nx, y: ny, path: newPath })
    }
  }

  // No path found — character stays put
  return []
}
