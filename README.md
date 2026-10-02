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
- **Chintz, damask & tribal**: 15 more original motifs (chintz fan flower, peony, exotic bloom,
  pomegranate, carnation, serrated & curl leaves, berry sprig, bud, fern, damask paisley and lotus,
  Aztec diamond / arrow / cross).
  - **Vine layout**: a seeded web of S-curved stems that wraps across every tile edge, with
    flowers on the nodes, leaves, tendrils and buds along the stems and sprigs filling the ground
    (stem thickness, curl and colour controls).
  - **Damask layout**: mirror-symmetric centrepiece + paired ornaments in half-drop.
  - **Aztec base style**: stepped medallions, hourglass triangles, arrow and sawtooth borders.
  - **Print textures** over any pattern: distressed (worn block print), grain, linen, canvas —
    seeded vector geometry that repeats with the tile and exports to PNG and SVG.
  - 4 palettes (Chintz, Jacobean, Mulberry, Mesa) and 9 presets.
- **Bodo Agor category**: 7 original woven-grid motifs inspired by Bodo dokhona agor
  (pharwo megon, hajw agor, bwigri bibar, daorai agor, agor star, buti, chain), drawn as crisp
  pixel-thread runs; a **Bodo Agor base style** (stripes, zigzags, pigeon-eye diamonds and field
  butis like a dokhona border); 4 palettes (Dokhona, Aronai, Gamsa, Bodo Green) and 7 presets.
  - **Bodo Aronai**: a printed *Aronai* base style (fishbone arrow teeth, flower-diamond chain,
    herringbone lines, sunburst medallions with paisleys and arrow-leaf stars) and a woven
    *Aronai Weave* style (serrated net-filled teeth and a chain of rosette diamonds); 3 motifs
    (sunburst, paisley, arrows), 2 palettes (Aronai Orange, Aronai Yellow) and 6 presets.
  - **Aronai Hajw Leaf** base style: woven pointed hajw leaves projecting from a narrow
    diamond-chain band with green flowers; toggle *Leaves on both sides*, Weight sets leaf length; 3 presets.
  - **Hajw Agor** sadri: one band per tile (hills up, centred chain, hills down). Pick a *Centre design*
    (Eye, Rosette, Oval, Diamonds, Zigzag, Jaali) and a *Hill design* (Herringbone, Jaali net, Bold leaf,
    Dotted); 5 extra presets.
  - **Agor library upgrade** (names and meanings from *An Introduction to the Bodo Agor*,
    Narzary & Boro 2024, and Balipara Foundation textile notes; drawings are original):
    12 new woven motifs — Dingkhia (fern), Gabsab (round flower), Khangkrikhola (teasel-gourd
    flower), Makhri (spider), Sikhri (butterfly), Khaseo bikha (tortoise back), Jong (spearhead),
    San (sun), Khamrenga (starfruit), Mauji apha (cat paw), Dao (bird), Thakhamala (chain of
    coins); Hajw agor redrawn as a herringbone mountain. 5 woven base styles: **Agor Gubwi**
    dokhona stripes, **Makhri** diamond bands, **Hajw** jwmbaigra hill border, **Dingkhia Bijou**
    rosettes and ferns, **Khangkrikhola** chains; 5 palettes and 7 presets.
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
