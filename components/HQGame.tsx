"use client";
// WHY this component exists as a separate file (not inlined in page.tsx):
// Next.js dynamic() with ssr:false must wrap the component that imports Phaser.
// If it were inlined, the static import at the top of page.tsx would still be
// evaluated by the Node.js bundler during SSR — crashing on window/document.

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

// ─── Agent config ─────────────────────────────────────────────────────────────
interface AgentConfig {
  id: number;
  stageId: string; // pipeline id (nora, aria, …) — used for click → AGENT DETAIL
  name: string;
  role: string;
  spriteKey: string;
  deskX: number;
  deskY: number;
}

// All 11 NRP agents. deskX/deskY here are placeholders — create() overrides them
// with a proportional 4×3 grid based on canvas size. spriteKey order matches
// scripts/gen_sprites.py (char_0 = Nora … char_10 = Lyra).
const AGENTS: AgentConfig[] = [
  { id: 0,  stageId: "nora", name: "Nora", role: "Secretary", spriteKey: "char_0",  deskX: 150, deskY: 150 },
  { id: 1,  stageId: "mia",  name: "Mia",  role: "Frontend",  spriteKey: "char_1",  deskX: 350, deskY: 150 },
  { id: 2,  stageId: "luna", name: "Luna", role: "Backend",   spriteKey: "char_2",  deskX: 550, deskY: 150 },
  { id: 3,  stageId: "aria", name: "Aria", role: "Tech Lead", spriteKey: "char_3",  deskX: 150, deskY: 320 },
  { id: 4,  stageId: "vera", name: "Vera", role: "Security",  spriteKey: "char_4",  deskX: 350, deskY: 320 },
  { id: 5,  stageId: "rex",  name: "Rex",  role: "DevOps",    spriteKey: "char_5",  deskX: 550, deskY: 320 },
  { id: 6,  stageId: "sage", name: "Sage", role: "Database",  spriteKey: "char_6",  deskX: 150, deskY: 480 },
  { id: 7,  stageId: "iris", name: "Iris", role: "Reviewer",  spriteKey: "char_7",  deskX: 350, deskY: 480 },
  { id: 8,  stageId: "zoe",  name: "Zoe",  role: "QA",        spriteKey: "char_8",  deskX: 550, deskY: 480 },
  { id: 9,  stageId: "nova", name: "Nova", role: "UI/UX",     spriteKey: "char_9",  deskX: 150, deskY: 480 },
  { id: 10, stageId: "lyra", name: "Lyra", role: "Writer",    spriteKey: "char_10", deskX: 350, deskY: 480 },
];

// Bridge for click → React. A ref-like holder so the (once-built) Phaser scene
// always calls the latest callback without being rebuilt.
type ClickHolder = { current?: (stageId: string) => void };

// ─── Sprite animation frame indices ──────────────────────────────────────────
// Spritesheet: 112×96px, 16×32 frames, 7 cols × 3 rows = 21 total frames
// WHY 16×32 (not 16×16): each character is 16px wide × 32px tall.
// Reading as 16×16 splits every character in half — top 16px = head only,
// bottom 16px = body only. 16×32 gives the full character per frame.
//
// Row 0 (y=0–31)  → Front-facing: walkDown + idle + sit
//   col 0: walk step 1 | col 1: idle/neutral | col 2: walk step 2
//   col 5: sit at desk  | col 6: sit variant
// Row 1 (y=32–63) → Back-facing:  walkUp
//   col 0: walk step 1 | col 1: idle back | col 2: walk step 2
// Row 2 (y=64–95) → Side-facing:  walkLeft (cols 0-2) + walkRight (cols 3-5)
const FRAME = {
  walkDown:  [0, 1, 2]      as number[],
  walkUp:    [7, 8, 9]      as number[],
  walkLeft:  [14, 15, 16]   as number[],
  walkRight: [17, 18, 19]   as number[],
  sit:       [5, 6]         as number[],
  idleDown:  1,
};

// WHY 3: at 11 agents, capping at 3 keeps ≥8 desks occupied at all times while
// adding a little more life than the old 6-agent / cap-2 setup.
const MAX_WALKING = 3;

// WHY 70px radius (was 100): with a denser 4-column grid the columns sit closer
// together, so a smaller wander radius keeps agents in their own zone without
// brushing a neighbour's desk.
const WALK_RADIUS = 70;

type AgentState = "sitting" | "walking" | "returning";

interface AgentObject {
  cfg: AgentConfig;
  sprite: Phaser.GameObjects.Sprite;
  nameTag: Phaser.GameObjects.Text;
  roleTag: Phaser.GameObjects.Text;
  state: AgentState;
}

// ─── Build the Phaser scene object config ────────────────────────────────────
// WHY object config instead of class: avoids the TypeScript limitation where
// a class returned from a factory function loses its `extends Phaser.Scene`
// type information. With an object config, Phaser's own runtime wires up the
// scene systems — no `extends` needed, no TS errors.
// The return type is `object` because Phaser accepts a plain object with
// {key, preload, create} even though the TS type `CreateSceneFromObjectConfig`
// doesn't include `key` (key lives in SettingsConfig which gets merged at runtime).
function buildSceneConfig(PH: typeof Phaser, clickHolder: ClickHolder): Phaser.Types.Scenes.CreateSceneFromObjectConfig & { key: string } {
  const agents: AgentObject[] = [];

  // WHY module-level counter inside closure (not on AgentObject):
  // We need a single shared value across all agents. A closure variable is the
  // simplest approach — no global pollution, no ref passing, naturally scoped
  // to one game instance (each call to buildSceneConfig gets its own counter).
  let walkingCount = 0;

  // ── helpers ────────────────────────────────────────────────────────────────

  function chooseWalkAnim(spriteKey: string, dx: number, dy: number): string {
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax >= ay) return `${spriteKey}_walk_${dx > 0 ? "right" : "left"}`;
    return `${spriteKey}_walk_${dy > 0 ? "down" : "up"}`;
  }

  function updateLabels(agent: AgentObject): void {
    // WHY -68/-60: sprite origin is (0.5,1) bottom-center. With 16×32 frames at
    // scale 2, rendered height = 64px → head top at sprite.y-64. Labels at -68/-60
    // float 4–8px above the head, always clear of the character.
    agent.nameTag.setPosition(agent.sprite.x, agent.sprite.y - 68);
    agent.roleTag.setPosition(agent.sprite.x, agent.sprite.y - 60);
  }

  function walkTo(
    scene: Phaser.Scene,
    agent: AgentObject,
    tx: number,
    ty: number,
    onDone: () => void
  ): void {
    const dx = tx - agent.sprite.x;
    const dy = ty - agent.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) { onDone(); return; }

    const animKey = chooseWalkAnim(agent.cfg.spriteKey, dx, dy);
    agent.sprite.play(animKey, true);

    const duration = (dist / 80) * 1000; // 80px/sec

    scene.tweens.add({
      targets: agent.sprite,
      x: tx,
      y: ty,
      duration,
      ease: "Linear",
      onUpdate: () => updateLabels(agent),
      onComplete: () => onDone(),
    });
  }

  function scheduleWalk(scene: Phaser.Scene, agent: AgentObject): void {
    // If this agent is already in motion, reschedule a check for later.
    // WHY: without this guard, a queued delayedCall could fire while the agent
    // is already mid-walk (e.g. from a concurrent scheduleWalk call), leading
    // to two simultaneous tweens on the same sprite.
    if (agent.state !== "sitting") {
      scene.time.delayedCall(PH.Math.Between(2000, 5000), () => scheduleWalk(scene, agent));
      return;
    }

    // Concurrency gate — at most MAX_WALKING agents walking at once.
    // WHY check here (not earlier): we want to retry soon so the agent eventually
    // leaves its desk, but only once a slot opens up.
    if (walkingCount >= MAX_WALKING) {
      scene.time.delayedCall(PH.Math.Between(1500, 3500), () => scheduleWalk(scene, agent));
      return;
    }

    walkingCount++;
    agent.state = "walking";

    // Constrain walk target to within WALK_RADIUS of the agent's own desk.
    // WHY: agents stay in their zone → office feels inhabited, not chaotic.
    // We clamp to [60, W-60] / [80, H*0.82] to stay inside visible floor area.
    const W = scene.scale.width;
    const H = scene.scale.height;
    const { deskX, deskY } = agent.cfg;
    const minX = Math.max(60, deskX - WALK_RADIUS);
    const maxX = Math.min(W - 60, deskX + WALK_RADIUS);
    // WHY 126: with 16×32 frames at scale 2, rendered height = 64px.
    // Head top = sprite.y - 64. Wall baseboard ends at y=62.
    // To keep head clear: sprite.y >= 62 + 64 = 126.
    const minY = Math.max(126, deskY - WALK_RADIUS);
    const maxY = Math.min(Math.round(H * 0.82), deskY + WALK_RADIUS);
    const tx = PH.Math.Between(minX, maxX);
    const ty = PH.Math.Between(minY, maxY);

    walkTo(scene, agent, tx, ty, () => {
      agent.state = "returning";
      agent.sprite.setFrame(FRAME.idleDown);

      // Brief pause at destination before returning to desk.
      scene.time.delayedCall(PH.Math.Between(600, 2000), () => {
        // WHY deskY + 4: sprite origin is (0.5, 1) — bottom-center.
        // Feet land at the y coordinate, so +4 places feet on the desk surface
        // (desk is drawn at deskY+4 with height 24, surface = top of desk body).
        // This is consistent with how spawnAgent positions the sprite initially.
        walkTo(scene, agent, deskX, deskY + 20, () => {
          walkingCount--;
          agent.state = "sitting";
          agent.sprite.setFrame(FRAME.idleDown);
          updateLabels(agent);
          // WHY 8000–20000ms: previous 3–7s was too short — agents barely sat
          // before leaving again. 8–20s gives a natural work-then-stretch feel.
          scene.time.delayedCall(PH.Math.Between(8000, 20000), () => scheduleWalk(scene, agent));
        });
      });
    });
  }

  function drawOffice(scene: Phaser.Scene, rows: number[]): void {
    const W = scene.scale.width;
    const H = scene.scale.height;

    // ── Floor ──────────────────────────────────────────────────────────────────
    // WHY tileSprite + setTileScale(2,2): renders the 16×16 wood-plank sprite at
    // 32×32 per tile, covering the full canvas below the wall strip.
    scene.add.tileSprite(W / 2, 58 + (H - 58) / 2, W, H - 58, 'floor_tile')
      .setTileScale(2, 2)
      .setTint(0x9c6b35)
      .setDepth(-1);

    // ── Wall strip ─────────────────────────────────────────────────────────────
    scene.add.rectangle(W / 2, 28, W, 56, 0x1c2230);
    scene.add.rectangle(W / 2, 58, W, 4, 0x2d3e54); // baseboard

    // NRP HQ sign (brand color)
    scene.add.text(W / 2, 22, "◆  NRP HQ  ◆", {
      fontSize: "13px", fontFamily: "monospace",
      color: "#c96442", stroke: "#3a1a08", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);
    scene.add.text(44, 22, "[ v0.1 ]", {
      fontSize: "9px", fontFamily: "monospace", color: "#3d4a5c",
    }).setOrigin(0.5).setDepth(10);
    scene.add.text(W - 44, 22, "[ ONLINE ]", {
      fontSize: "9px", fontFamily: "monospace", color: "#1a4a22",
    }).setOrigin(0.5).setDepth(10);

    // ── Wall furniture ─────────────────────────────────────────────────────────
    // Bookshelves left + right, whiteboard center — origin bottom so they sit on wall base
    scene.add.image(Math.round(W * 0.18), 60, 'bookshelf').setScale(2).setOrigin(0.5, 0).setDepth(1);
    scene.add.image(Math.round(W * 0.82), 60, 'bookshelf').setScale(2).setOrigin(0.5, 0).setDepth(1);
    scene.add.image(Math.round(W * 0.5),  60, 'whiteboard').setScale(2).setOrigin(0.5, 0).setDepth(1);

    // Plants at corners (tall, against wall)
    scene.add.image(28,     58, 'plant').setScale(1.5).setOrigin(0.5, 0).setDepth(1);
    scene.add.image(W - 28, 58, 'plant').setScale(1.5).setOrigin(0.5, 0).setDepth(1);

    // ── Workspace label ──────────────────────────────────────────────────────
    // WHY single label (was A/B): with 3 desk rows there's no clean two-zone split,
    // so one header under the wall reads cleaner than crowding each row with a tag.
    scene.add.text(W / 2, 86, "◇  WORKSPACE  ◇", {
      fontSize: "7px", fontFamily: "monospace", color: "#7a5a28", letterSpacing: 4,
    }).setOrigin(0.5).setDepth(10);

    // ── Zone dividers (warm dashed lines between each pair of desk rows) ────────
    // WHY midpoints: a divider sits halfway between consecutive rows, visually
    // separating the rows without overlapping any desk or character.
    const dashGfx = scene.add.graphics().setDepth(0);
    dashGfx.lineStyle(1, 0x9a7040, 0.4);
    for (let r = 0; r < rows.length - 1; r++) {
      const divY = Math.round((rows[r] + rows[r + 1]) / 2);
      for (let dx = 0; dx < W; dx += 14) dashGfx.lineBetween(dx, divY, dx + 8, divY);
    }

    // ── Server rack (right wall, beside the top desk row) ──────────────────────
    // WHY anchored to rows[0]-30 (was rowB+70): with a 3rd row filling the lower
    // canvas there's no empty space below the bottom row, so the rack moves up to
    // sit against the wall beside the first row where there's still clear floor.
    const srY = Math.max(96, Math.round(rows[0] - 30));
    scene.add.rectangle(W - 42, srY, 20, 50, 0x1e1e1c).setStrokeStyle(1, 0x2a2a28).setDepth(1);
    for (let bay = 0; bay < 3; bay++) {
      scene.add.rectangle(W - 42, srY - 18 + bay * 10, 14, 8, 0x252520).setDepth(1);
    }
    for (let li = 0; li < 6; li++) {
      scene.add.rectangle(W - 36 + li * 3, srY - 18, 2, 2,
        li % 2 === 0 ? 0x00cc44 : 0xc96442).setDepth(2);
    }
  }

  function spawnAgent(scene: Phaser.Scene, cfg: AgentConfig): void {
    const x = cfg.deskX;
    const y = cfg.deskY;

    // Pixel Agents style: real desk + PC sprites, character in front of desk.
    // depth 0 = desk, depth 1 = character, depth 2 = PC monitor (on top of both)

    // Desk sprite (behind character, depth 0)
    scene.add.image(x, y, 'desk').setScale(2).setOrigin(0.5, 0.5).setDepth(0);

    // PC monitor on desk back surface (depth 2 — always visible above character)
    scene.add.image(x, y - 18, 'pc').setScale(2).setOrigin(0.5, 0.5).setDepth(2);

    // Character sprite — feet at y+20, stands in front of desk (depth 1)
    // WHY y+20: desk center at y, desk half-height at 2x = 32px → desk bottom at y+32.
    // Character standing at y+20 puts the character body overlapping with the desk front,
    // giving the "sitting at desk" look from a top-down perspective.
    const sprite = scene.add.sprite(x, y + 20, cfg.spriteKey);
    sprite.setScale(2).setOrigin(0.5, 1).setDepth(1);

    // Click the character → open its AGENT DETAIL panel in React.
    // useHandCursor gives a pointer; clickHolder.current is the latest React
    // callback (kept fresh via a ref so the scene never needs rebuilding).
    sprite.setInteractive({ useHandCursor: true });
    sprite.on("pointerdown", () => clickHolder.current?.(cfg.stageId));

    // Register animations (guard with .exists to avoid duplicate-key errors)
    const sitKey = `${cfg.spriteKey}_sit`;
    if (!scene.anims.exists(sitKey)) {
      scene.anims.create({
        key: sitKey,
        frames: scene.anims.generateFrameNumbers(cfg.spriteKey, { frames: FRAME.sit }),
        frameRate: 4,
        repeat: -1,
      });
    }

    const dirs: Array<{ suffix: string; frames: number[] }> = [
      { suffix: "down",  frames: FRAME.walkDown  },
      { suffix: "left",  frames: FRAME.walkLeft  },
      { suffix: "right", frames: FRAME.walkRight },
      { suffix: "up",    frames: FRAME.walkUp    },
    ];
    for (const { suffix, frames } of dirs) {
      const key = `${cfg.spriteKey}_walk_${suffix}`;
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(cfg.spriteKey, { frames }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }

    // WHY idleDown instead of sitKey: sit frames 28-30 are a top-down hunched view
    // (character seen from above, leaning over keyboard) which looks like a blob at
    // our render scale. idleDown (frame 1) is the front-facing standing pose — matches
    // the walk animation perspective and looks clean and readable.
    sprite.setFrame(FRAME.idleDown);

    // Name tag — initial position matches updateLabels at rest (sprite.y = cfg.deskY+20)
    // WHY cfg.deskY-48: sprite.y-68 = (cfg.deskY+20)-68 = cfg.deskY-48.
    // With 16×32 frames at scale 2, head top at sprite.y-64 → labels clear by 4px.
    // WHY depth 4: above desk(0), character(1), PC(2), so always readable.
    const nameTag = scene.add.text(cfg.deskX, cfg.deskY - 48, cfg.name, {
      fontSize: "8px",
      fontFamily: "monospace",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(4);

    // Role tag — cfg.deskY-40 = sprite.y-60 = (cfg.deskY+20)-60
    const roleTag = scene.add.text(cfg.deskX, cfg.deskY - 40, cfg.role, {
      fontSize: "7px",
      fontFamily: "monospace",
      color: "#c96442",
      stroke: "#000000",
      strokeThickness: 1,
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(4);

    // WHY cfg (from positioned spread) is stored directly on AgentObject:
    // The `positioned` array in create() spreads AGENTS with proportional
    // deskX/deskY values. Storing that spread object here means agent.cfg.deskX
    // and agent.cfg.deskY always hold the runtime canvas-proportional positions,
    // NOT the original hardcoded values from the AGENTS constant.
    // walkTo return destination (deskX, deskY + 4) therefore correctly targets
    // the proportional desk — not an off-screen hardcoded coordinate.
    agents.push({ cfg, sprite, nameTag, roleTag, state: "sitting" });
  }

  // ── Scene lifecycle ────────────────────────────────────────────────────────
  return {
    key: "HQScene",

    preload(this: Phaser.Scene): void {
      for (const ag of AGENTS) {
        this.load.spritesheet(ag.spriteKey, `/sprites/${ag.spriteKey}.png`, {
          frameWidth: 16,
          frameHeight: 32, // WHY 32: character sprites are 16×32px — reading as 16×16 cuts each frame in half
        });
      }
      this.load.image('floor_tile',  '/furniture/floor.png');
      this.load.image('desk',        '/furniture/desk.png');
      this.load.image('pc',          '/furniture/pc.png');
      this.load.image('plant',       '/furniture/plant.png');
      this.load.image('bookshelf',   '/furniture/bookshelf.png');
      this.load.image('whiteboard',  '/furniture/whiteboard.png');
    },

    create(this: Phaser.Scene): void {
      const W = this.scale.width;
      const H = this.scale.height;

      // 4-column × 3-row grid = 12 slots for 11 agents (last slot empty).
      // WHY proportional (not fixed px): the canvas uses Scale.RESIZE, so columns
      // and rows must track the actual rendered size to stay centered and spaced.
      const cols = [0.18, 0.39, 0.61, 0.82].map((f) => Math.round(W * f));
      // WHY top row at 0.34 (not 0.30): the bookshelves hang from the wall down to
      // y≈92, and outer columns (0.18/0.82) sit directly under them. At the 440px
      // homepage-widget height, a top row at 0.30 puts Nora/Aria's name labels at
      // y≈84 — behind the shelves. 0.34 drops the top row's labels clear (~y100)
      // at both the widget height and the full-screen /hq height. Rows stay evenly
      // spaced (0.34 / 0.57 / 0.80) with ≥100px gaps — well past WALK_RADIUS.
      const rows = [0.34, 0.57, 0.80].map((f) => Math.round(H * f));

      // WHY spread here (not mutating AGENTS):
      // AGENTS is a module-level constant. Mutating it would bleed state across
      // React StrictMode double-invocations and hot reloads.
      // Each spread object gets its own proportional deskX/deskY, and that object
      // reference is what gets stored in agents[] via spawnAgent → cfg param.
      const positioned = AGENTS.map((ag, i) => ({
        ...ag,
        deskX: cols[i % 4],
        deskY: rows[Math.floor(i / 4)],
      }));

      drawOffice(this, rows);
      for (const cfg of positioned) spawnAgent(this, cfg);

      // Staggered initial walk delays — agents don't all move at scene start.
      // The MAX_WALKING gate inside scheduleWalk will further throttle concurrent
      // walkers even if multiple timers fire close together.
      for (const agent of agents) {
        const delay = PH.Math.Between(1000, 6000);
        this.time.delayedCall(delay, () => scheduleWalk(this, agent));
      }
    },
    // update() not needed — Phaser tweens + timers drive everything
  };
}

// ─── React component ──────────────────────────────────────────────────────────
export default function HQGame({ onAgentClick }: { onAgentClick?: (stageId: string) => void } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  // Keep the latest click callback in a ref so the (once-built) Phaser scene
  // always calls the current handler without re-initializing the game.
  const clickHolder = useRef<((stageId: string) => void) | undefined>(undefined);
  clickHolder.current = onAgentClick;

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    let destroyed = false;

    // WHY dynamic import inside useEffect:
    // Even with ssr:false, Next.js static analysis can trace top-level imports
    // and attempt to evaluate them in the worker thread. Importing inside
    // useEffect guarantees we're fully in browser context with window defined.
    import("phaser").then((mod) => {
      if (destroyed || !containerRef.current) return;

      const PH = mod.default;
      const sceneConfig = buildSceneConfig(PH, clickHolder);

      gameRef.current = new PH.Game({
        type: PH.AUTO,
        parent: containerRef.current,
        scale: {
          mode: PH.Scale.RESIZE,
          autoCenter: PH.Scale.CENTER_BOTH,
        },
        backgroundColor: "#2a1d12",
        pixelArt: true,       // WHY: disables canvas smoothing → crisp sprites at 2× scale
        antialias: false,
        roundPixels: true,    // WHY: snaps positions to integer pixels → no sub-pixel blur
        scene: [sceneConfig],
      });
    });

    return () => {
      destroyed = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        maxHeight: "520px",
        imageRendering: "pixelated",
      }}
    />
  );
}
