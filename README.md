# PatternForge

A seamless pattern generator built with React, TypeScript, Vite, Tailwind CSS and the Canvas API.

## Features
- True seamless tiling (motifs crossing edges wrap to the opposite side)
- 20 categories, 87 vector motifs, 10 layout modes, 12 palettes, 11 presets
- Seeded randomization, undo/redo, motif selection & editing, lock motifs
- Infinite preview, zoom/pan, tile boundaries, live seam check
- Export PNG / JPG / WebP / SVG up to 6000px+ (custom sizes, transparency, clipboard)
- Saved patterns (localStorage), mockups, dark mode, responsive layout
- **Geometric base layer**: 12 styles (stripes, pinstripe, diagonal, checks, gingham, plaid,
  harlequin, argyle, chevron, scallop, polka, waves) with repeats, cell ratio, weight, accents,
  outlines and per-slot colours. Always seamless (whole cells per tile); motifs can sit on top.
- **10 vintage geometric presets** and 3 new palettes (Nostalgia, Parlour, Bistro)
- **Indian Heritage category**: 17 original motifs (buta, kairi, Mughal flower, lotus, marigold,
  rangoli, mihrab arch, royal elephant, peacock, parrot, diya, kalash, Ajrakh star, kolam,
  bandhani, temple bell), 5 Indian base styles (Mughal ogee trellis, jali, bandhani, ikat,
  ethnic bands), a **Fit base** layout that drops one motif into every cell / arch of the base,
  6 palettes (Mughal, Rajwada, Kalamkari, Ajrakh, Haldi-Mehndi, Peacock) and 11 presets.
- **Frames studio**: 12 parametric label shapes (Victorian, wavy, scallop, ticket, bracket,
  octagon, stepped, stamp, arch, rounded, oval, cloud) with double lines, offset shadow,
  ornaments and auto-fitting text; 7 page-border styles (checks, blocks, diamonds, dots,
  scallop, bunting, stripes) whose units always meet cleanly at the corners.
  Export PNG (1–4×, transparent) or SVG with editable text.

## Getting started
```bash
npm install
npm run dev     # start dev server
npm run build   # production build in dist/
```

## Tests
`npx vite --port 5179` then, with `CHROME=/path/to/chromium`:
`node tests/run.mjs` (motif seams), `node tests/rungeo.mjs` (geometric seams + SVG parity),
`node tests/runsvg.mjs`, `node tests/ui.mjs`, `node tests/ui2.mjs`, `node tests/ui3.mjs`.
