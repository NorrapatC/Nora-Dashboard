# Pixel avatars — drop AI-generated files here

The isometric office (`components/IsoOffice.tsx`) loads each character's avatar from
this folder **first**, and falls back to the smooth portrait in `../{id}.png` if the
pixel file isn't here yet. So you can add them one at a time and they appear automatically.

## How to add
Generate a pixel-art avatar (same AI tool you used for the portraits) for each agent
and save it here with the agent's id as the filename:

```
public/team/pixel/nora.png
public/team/pixel/aria.png
public/team/pixel/mia.png
public/team/pixel/luna.png
public/team/pixel/sage.png
public/team/pixel/vera.png
public/team/pixel/iris.png
public/team/pixel/zoe.png
public/team/pixel/rex.png
public/team/pixel/nova.png
public/team/pixel/lyra.png
public/team/pixel/safe.png      ← used on /hire (Safe's avatar)
```

## Recommended
- **Square** image (e.g. 256×256 or 512×512), face/bust centered near the **top**
  (the avatar is cropped top-aligned + clipped to a circle).
- Transparent or solid background is fine.
- Consistent style across all 11 (same palette/lighting) so the office looks cohesive.
- Prompt idea: "pixel-art character bust portrait of {description}, 32-bit, clean
  outline, soft shading, facing forward" — keep the per-agent hair/outfit from each
  portrait so they stay recognizable.

No code change needed after dropping files — just refresh.
