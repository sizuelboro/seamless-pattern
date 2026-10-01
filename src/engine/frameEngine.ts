/**
 * Frames & borders. Label frames are parametric outlines (corner treatment + edge
 * displacement); page borders are rings of whole units sized so every corner lines up.
 * Output is a list of SVG path ops plus text items, shared by the live SVG preview,
 * the SVG exporter and the PNG renderer.
 */
import type { FrameFont, FrameSettings, FrameShape, Ornament } from '../types/frame';

export interface FrameOp { d: string; fill?: string; stroke?: string; sw?: number; alpha?: number }
export interface FrameText { text: string; x: number; y: number; size: number; font: FrameFont; fill: string; spacing: number }
export interface FrameDoc { width: number; height: number; ops: FrameOp[]; texts: FrameText[] }

type Corner = 'round' | 'concave' | 'chamfer' | 'step' | 'square';
type Edge = 'plain' | 'wave' | 'scallop' | 'stamp' | 'bulge' | 'double' | 'zigzag';

interface ShapeDef { name: string; corner: Corner; edge: Edge; topRound?: boolean; ellipse?: boolean; defaults: Partial<FrameSettings> }

export const FRAME_SHAPES: Record<FrameShape, ShapeDef> = {
  victorian: { name: 'Victorian', corner: 'concave', edge: 'bulge', defaults: { depth: 30, corner: 45 } },
  wavy: { name: 'Wavy', corner: 'round', edge: 'wave', defaults: { depth: 25, count: 5, corner: 40 } },
  scallop: { name: 'Scallop', corner: 'round', edge: 'scallop', defaults: { depth: 30, count: 7, corner: 30 } },
  ticket: { name: 'Ticket', corner: 'concave', edge: 'plain', defaults: { depth: 0, corner: 40 } },
  bracket: { name: 'Bracket', corner: 'concave', edge: 'double', defaults: { depth: 30, corner: 35 } },
  octagon: { name: 'Octagon', corner: 'chamfer', edge: 'plain', defaults: { depth: 0, corner: 45 } },
  stepped: { name: 'Stepped', corner: 'step', edge: 'plain', defaults: { depth: 0, corner: 35 } },
  stamp: { name: 'Stamp', corner: 'square', edge: 'stamp', defaults: { depth: 30, count: 12, corner: 0 } },
  arch: { name: 'Arch', corner: 'round', edge: 'plain', topRound: true, defaults: { depth: 0, corner: 20 } },
  rounded: { name: 'Rounded', corner: 'round', edge: 'plain', defaults: { depth: 0, corner: 35 } },
  oval: { name: 'Oval', corner: 'round', edge: 'plain', ellipse: true, defaults: { depth: 0 } },
  cloud: { name: 'Cloud', corner: 'round', edge: 'scallop', ellipse: true, defaults: { depth: 40, count: 9 } },
};
export const FRAME_SHAPE_IDS = Object.keys(FRAME_SHAPES) as FrameShape[];

export const FONT_STACK: Record<FrameFont, { family: string; weight: number; italic?: boolean; label: string }> = {
  serif: { family: "'DM Serif Display', Georgia, serif", weight: 400, label: 'Serif' },
  condensed: { family: "'Oswald', 'Arial Narrow', sans-serif", weight: 500, label: 'Condensed' },
  script: { family: "'Pacifico', 'Brush Script MT', cursive", weight: 400, label: 'Script' },
  italic: { family: "'Playfair Display', Georgia, serif", weight: 500, italic: true, label: 'Italic' },
  sans: { family: "Inter, system-ui, sans-serif", weight: 600, label: 'Sans' },
};

const n = (v: number) => String(Math.round(v * 100) / 100);
type Pt = [number, number];
const path = (pts: Pt[]) => (pts.length ? `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z` : '');

function edgeFn(edge: Edge, depth: number, k: number): (u: number) => number {
  switch (edge) {
    case 'wave': return (u) => depth * Math.sin(2 * Math.PI * k * u) * 0.5;
    case 'scallop': return (u) => depth * Math.abs(Math.sin(Math.PI * k * u));
    case 'stamp': return (u) => -depth * Math.pow(Math.abs(Math.sin(Math.PI * k * u)), 0.6);
    case 'bulge': return (u) => depth * Math.sin(Math.PI * u);
    case 'double': return (u) => depth * Math.abs(Math.sin(2 * Math.PI * u));
    case 'zigzag': return (u) => depth * (1 - Math.abs(((k * u * 2) % 2) - 1));
    default: return () => 0;
  }
}

/**
 * Closed outline of a w×h shape whose base rectangle sits at (x, y). Corners are not
 * displaced; straight sides get the edge displacement along their outward normal, with
 * a whole number of bumps per side so the outline is continuous at every corner.
 */
export function shapeOutline(shape: FrameShape, x: number, y: number, w: number, h: number, depthPx: number, count: number, cornerPx: number): Pt[] {
  const def = FRAME_SHAPES[shape];
  if (def.ellipse) {
    const cx = x + w / 2, cy = y + h / 2, a = w / 2, b = h / 2;
    const N = 360;
    const k = Math.max(3, Math.round(count * 2));
    const f = edgeFn(def.edge, depthPx, k);
    const pts: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const px = Math.cos(t), py = Math.sin(t);
      const nx = b * px, ny = a * py, nl = Math.hypot(nx, ny) || 1;
      const d = def.edge === 'plain' ? 0 : f(i / N);
      pts.push([cx + a * px + (nx / nl) * d, cy + b * py + (ny / nl) * d]);
    }
    return pts;
  }
  const rMax = Math.min(w, h) / 2;
  const r = Math.min(cornerPx, rMax * 0.95);
  const rTop = def.topRound ? Math.min(w / 2, h * 0.9) : r;
  const corners: { cx: number; cy: number; sx: number; sy: number; rr: number }[] = [
    { cx: x, cy: y, sx: -1, sy: -1, rr: rTop },          // TL
    { cx: x + w, cy: y, sx: 1, sy: -1, rr: rTop },       // TR
    { cx: x + w, cy: y + h, sx: 1, sy: 1, rr: r },       // BR
    { cx: x, cy: y + h, sx: -1, sy: 1, rr: r },          // BL
  ];
  const kind: Corner = def.corner;
  const pts: Pt[] = [];
  const longSide = Math.max(w, h);
  const side = (from: Pt, to: Pt) => {
    const [ax, ay] = from, [bx, by] = to;
    const L = Math.hypot(bx - ax, by - ay);
    if (L < 1e-6) return;
    const tx = (bx - ax) / L, ty = (by - ay) / L;
    const nx = ty, ny = -tx; // outward normal for clockwise order (y down)
    const k = Math.max(1, Math.round((count * L) / longSide));
    const f = edgeFn(def.edge, depthPx, k);
    const steps = def.edge === 'plain' ? 1 : Math.max(8, Math.ceil(L / 2));
    for (let i = 0; i < steps; i++) {
      const u = i / steps, d = f(u);
      pts.push([ax + tx * L * u + nx * d, ay + ty * L * u + ny * d]);
    }
  };
  // Clockwise: TL → top → TR → right → BR → bottom → BL → left
  const C = corners.map((c, idx) => {
    const rr = c.rr;
    const inPt: Pt = [[c.cx, c.cy + rr], [c.cx - rr, c.cy], [c.cx, c.cy - rr], [c.cx + rr, c.cy]][idx] as Pt;
    const outPt: Pt = [[c.cx + rr, c.cy], [c.cx, c.cy + rr], [c.cx - rr, c.cy], [c.cx, c.cy - rr]][idx] as Pt;
    return { ...c, inPt, outPt, inner: [c.cx - c.sx * rr, c.cy - c.sy * rr] as Pt };
  });
  const corner = (c: typeof C[number]) => {
    if (kind === 'square' || c.rr <= 0) { pts.push([c.cx, c.cy]); return; }
    if (kind === 'chamfer') { pts.push(c.inPt, c.outPt); return; }
    if (kind === 'step') { pts.push(c.inPt, c.inner, c.outPt); return; }
    const concave = kind === 'concave' && !(def.topRound && c.cy === y);
    const [ox, oy] = concave ? [c.cx, c.cy] : c.inner;
    const a0 = Math.atan2(c.inPt[1] - oy, c.inPt[0] - ox), a1 = Math.atan2(c.outPt[1] - oy, c.outPt[0] - ox);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const t = a0 + (da * i) / steps;
      pts.push([ox + Math.cos(t) * c.rr, oy + Math.sin(t) * c.rr]);
    }
  };
  for (let i = 0; i < 4; i++) {
    corner(C[i]);
    side(kind === 'square' ? [C[i].cx, C[i].cy] : C[i].outPt, kind === 'square' ? [C[(i + 1) % 4].cx, C[(i + 1) % 4].cy] : C[(i + 1) % 4].inPt);
  }
  return pts;
}

function ornamentPath(kind: Ornament, x: number, y: number, s: number, ruleW: number): string {
  if (kind === 'none') return '';
  if (kind === 'rule') {
    const t = Math.max(1, s * 0.09);
    const dm = s * 0.35;
    return `M${n(x - ruleW / 2)} ${n(y - t / 2)}H${n(x - dm * 1.6)}V${n(y + t / 2)}H${n(x - ruleW / 2)}Z` +
      `M${n(x + dm * 1.6)} ${n(y - t / 2)}H${n(x + ruleW / 2)}V${n(y + t / 2)}H${n(x + dm * 1.6)}Z` +
      `M${n(x)} ${n(y - dm)}L${n(x + dm)} ${n(y)}L${n(x)} ${n(y + dm)}L${n(x - dm)} ${n(y)}Z`;
  }
  if (kind === 'dot') { const r = s * 0.3; return `M${n(x + r)} ${n(y)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x - r)} ${n(y)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`; }
  const pts: Pt[] = [];
  if (kind === 'sparkle') {
    const k = s * 0.16;
    pts.push([x, y - s], [x + k, y - k], [x + s * 0.8, y], [x + k, y + k], [x, y + s], [x - k, y + k], [x - s * 0.8, y], [x - k, y - k]);
  } else {
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? s * 0.42 : s * 0.9; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  }
  return path(pts);
}

let measureCtx: CanvasRenderingContext2D | null = null;
/** Approximate rendered width of text at `size` px (falls back to a per-glyph estimate). */
function measure(text: string, font: FrameFont, size: number): number {
  try {
    if (!measureCtx && typeof document !== 'undefined') measureCtx = document.createElement('canvas').getContext('2d');
    if (measureCtx) {
      const f = FONT_STACK[font];
      measureCtx.font = `${f.italic ? 'italic ' : ''}${f.weight} ${size}px ${f.family}`;
      return measureCtx.measureText(text).width;
    }
  } catch { /* ignore */ }
  return text.length * size * 0.55;
}

/** Label frame inside the box (x, y, w, h). Size-relative values scale with the box. */
function labelOps(f: FrameSettings, x: number, y: number, w: number, h: number, ops: FrameOp[], texts: FrameText[]) {
  const unit = Math.min(w, h);
  const def = FRAME_SHAPES[f.shape];
  const depthPx = (f.depth / 100) * unit * 0.14;
  const outward = def.edge === 'stamp' ? 0 : Math.max(0, depthPx) * (def.edge === 'wave' ? 0.5 : 1);
  const shadowOff = f.shadow ? Math.max(3, unit * 0.035) : 0;
  const m = outward + f.stroke / 2 + 1;
  const bx = x + m, by = y + m, bw = w - 2 * m - shadowOff, bh = h - 2 * m - shadowOff;
  if (bw < 8 || bh < 8) return;
  const cornerPx = (f.corner / 100) * Math.min(bw, bh) * 0.5;
  const outer = path(shapeOutline(f.shape, bx, by, bw, bh, depthPx, f.count, cornerPx));
  if (f.shadow) {
    const sh = path(shapeOutline(f.shape, bx + shadowOff, by + shadowOff, bw, bh, depthPx, f.count, cornerPx));
    ops.push({ d: sh, fill: f.colors.shadow });
  }
  ops.push({ d: outer, fill: f.colors.fill, stroke: f.stroke > 0 ? f.colors.outline : undefined, sw: f.stroke });
  if (f.doubleLine) {
    const g = f.gap + f.stroke / 2;
    const innerCorner = def.corner === 'concave' ? cornerPx + g : def.corner === 'round' ? Math.max(0, cornerPx - g) : cornerPx * 0.8;
    const inner = path(shapeOutline(f.shape, bx + g, by + g, bw - 2 * g, bh - 2 * g, def.edge === 'stamp' ? 0 : depthPx * 0.9, f.count, innerCorner));
    ops.push({ d: inner, stroke: f.colors.inner, sw: Math.max(1, f.stroke * 0.5) });
  }
  // Text block
  const cx = bx + bw / 2, cy = by + bh / 2;
  const title = f.uppercase ? f.title.toUpperCase() : f.title;
  const lines = title.split('\n').filter((l, _i, a) => l.length || a.length === 1);
  let tSize = (f.textSize / 100) * bh * 0.32;
  // Shrink to fit: the widest line may use ~78% of the frame width.
  const widest = Math.max(1, ...lines.map((l) => measure(l, f.font, 100)));
  tSize = Math.min(tSize, (bw * 0.78 * 100) / widest);
  const subSize = Math.min(tSize * 0.36, (bw * 0.8 * 100) / Math.max(1, measure(f.subtitle.toUpperCase(), 'sans', 100) * 1.35));
  const hasSub = f.subtitle.trim().length > 0;
  const lineH = tSize * (f.font === 'script' ? 1.25 : 1.08);
  const subGap = subSize * 1.1;
  // Block = title lines (+ gap + subtitle cap height). Baselines are placed inside it.
  const blockH = lines.length * lineH + (hasSub ? subGap + subSize * 0.8 : 0);
  const top0 = cy - blockH / 2;
  const spacing = f.font === 'condensed' || f.font === 'sans' ? tSize * 0.04 : 0;
  lines.forEach((line, i) => {
    texts.push({ text: line, x: cx, y: top0 + i * lineH + lineH * 0.5 + tSize * 0.34, size: tSize, font: f.font, fill: f.colors.text, spacing });
  });
  if (hasSub) texts.push({ text: f.subtitle.toUpperCase(), x: cx, y: top0 + lines.length * lineH + subGap + subSize * 0.72, size: subSize, font: 'sans', fill: f.colors.text, spacing: subSize * 0.18 });
  if (f.ornament !== 'none') {
    const s = Math.max(4, unit * 0.045);
    const gapY = s * 1.9;
    const top = cy - blockH / 2 - gapY, bot = cy + blockH / 2 + gapY;
    const d = ornamentPath(f.ornament, cx, top, s, bw * 0.4) + ornamentPath(f.ornament, cx, bot, s, bw * 0.4);
    if (top > by + s && bot < by + bh - s) ops.push({ d, fill: f.colors.accent });
  }
}

/** Page border: a ring of whole units, each side fitted so corners meet exactly. */
function borderOps(f: FrameSettings, ops: FrameOp[]) {
  const W = f.width, H = f.height, c = f.colors;
  const target = Math.max(8, f.border.band);
  const nx = Math.max(3, Math.round(W / target)), ny = Math.max(3, Math.round(H / target));
  const ux = W / nx, uy = H / ny;
  ops.push({ d: `M0 0H${n(W)}V${n(H)}H0Z`, fill: c.page });
  const A: string[] = [], B: string[] = [], C: string[] = [];
  const rect = (x: number, y: number, w: number, h: number) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
  const ring: [number, number][] = [];
  for (let i = 0; i < nx; i++) { ring.push([i, 0]); ring.push([i, ny - 1]); }
  for (let j = 1; j < ny - 1; j++) { ring.push([0, j]); ring.push([nx - 1, j]); }
  const isCorner = (i: number, j: number) => (i === 0 || i === nx - 1) && (j === 0 || j === ny - 1);
  for (const [i, j] of ring) {
    const x = i * ux, y = j * uy;
    const corner = isCorner(i, j);
    if (corner && f.border.corners) { C.push(rect(x, y, ux, uy)); continue; }
    // Inward direction for edge-specific motifs
    const inX = i === 0 ? 1 : i === nx - 1 ? -1 : 0, inY = j === 0 ? 1 : j === ny - 1 ? -1 : 0;
    switch (f.border.style) {
      case 'checks':
        for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) if ((i * 2 + a + j * 2 + b) % 2 === 0) A.push(rect(x + (a * ux) / 2, y + (b * uy) / 2, ux / 2, uy / 2));
        else B.push(rect(x + (a * ux) / 2, y + (b * uy) / 2, ux / 2, uy / 2));
        break;
      case 'blocks': ((i + j) % 2 ? B : A).push(rect(x, y, ux, uy)); break;
      case 'diamonds': {
        A.push(rect(x, y, ux, uy));
        const cx = x + ux / 2, cy = y + uy / 2, k = 0.42;
        B.push(`M${n(cx)} ${n(cy - uy * k)}L${n(cx + ux * k)} ${n(cy)}L${n(cx)} ${n(cy + uy * k)}L${n(cx - ux * k)} ${n(cy)}Z`);
        break;
      }
      case 'dots': {
        A.push(rect(x, y, ux, uy));
        const r = Math.min(ux, uy) * 0.28, cx = x + ux / 2, cy = y + uy / 2;
        B.push(`M${n(cx + r)} ${n(cy)}A${n(r)} ${n(r)} 0 0 1 ${n(cx)} ${n(cy + r)}A${n(r)} ${n(r)} 0 0 1 ${n(cx - r)} ${n(cy)}A${n(r)} ${n(r)} 0 0 1 ${n(cx)} ${n(cy - r)}A${n(r)} ${n(r)} 0 0 1 ${n(cx + r)} ${n(cy)}Z`);
        break;
      }
      case 'scallop': {
        // solid outer half, semicircles on the inner half
        if (corner) { A.push(rect(x, y, ux, uy)); break; }
        if (inY) {
          const yb = inY > 0 ? y : y + uy / 2;
          A.push(rect(x, yb, ux, uy / 2));
          const ey = inY > 0 ? y + uy / 2 : y + uy / 2, r = ux / 2, ry = uy / 2, sweep = inY > 0 ? 0 : 1;
          A.push(`M${n(x)} ${n(ey)}A${n(r)} ${n(ry)} 0 0 ${sweep} ${n(x + ux)} ${n(ey)}Z`);
        } else {
          const xb = inX > 0 ? x : x + ux / 2;
          A.push(rect(xb, y, ux / 2, uy));
          const ex = x + ux / 2, r = uy / 2, rx = ux / 2, sweep = inX > 0 ? 1 : 0;
          A.push(`M${n(ex)} ${n(y)}A${n(rx)} ${n(r)} 0 0 ${sweep} ${n(ex)} ${n(y + uy)}Z`);
        }
        break;
      }
      case 'bunting': {
        if (corner) { A.push(rect(x, y, ux, uy)); break; }
        const tgt = (i + j) % 2 ? B : A;
        if (inY) { const y0 = inY > 0 ? y : y + uy, y1 = inY > 0 ? y + uy : y; tgt.push(`M${n(x)} ${n(y0)}L${n(x + ux)} ${n(y0)}L${n(x + ux / 2)} ${n(y1)}Z`); }
        else { const x0 = inX > 0 ? x : x + ux, x1 = inX > 0 ? x + ux : x; tgt.push(`M${n(x0)} ${n(y)}L${n(x0)} ${n(y + uy)}L${n(x1)} ${n(y + uy / 2)}Z`); }
        break;
      }
      case 'stripes': {
        A.push(rect(x, y, ux, uy));
        // one diagonal band per unit (continuous across neighbours)
        B.push(`M${n(x)} ${n(y + uy)}L${n(x + ux * 0.5)} ${n(y + uy)}L${n(x + ux)} ${n(y + uy * 0.5)}L${n(x + ux)} ${n(y)}L${n(x + ux * 0.5)} ${n(y)}L${n(x)} ${n(y + uy * 0.5)}Z`);
        break;
      }
    }
  }
  if (A.length) ops.push({ d: A.join(''), fill: c.band });
  if (B.length) ops.push({ d: B.join(''), fill: c.band2 });
  if (C.length) ops.push({ d: C.join(''), fill: c.accent });
  if (f.border.innerLine) {
    const g = Math.max(4, Math.min(ux, uy) * 0.35), lw = Math.max(1.5, Math.min(ux, uy) * 0.06);
    const x0 = ux + g, y0 = uy + g;
    ops.push({ d: rect(x0, y0, W - 2 * x0, H - 2 * y0), stroke: c.inner, sw: lw });
  }
  return { ux, uy };
}

export function buildFrame(f: FrameSettings): FrameDoc {
  const ops: FrameOp[] = [], texts: FrameText[] = [];
  if (f.mode === 'label') {
    labelOps(f, 0, 0, f.width, f.height, ops, texts);
  } else {
    const { ux, uy } = borderOps(f, ops);
    if (f.border.label) {
      const iw = f.width - 2 * ux, ih = f.height - 2 * uy;
      const lw = iw * 0.72, lh = Math.min(ih * 0.42, lw * 0.75);
      labelOps(f, (f.width - lw) / 2, (f.height - lh) / 2, lw, lh, ops, texts);
    } else if (f.title.trim()) {
      const size = (f.textSize / 100) * Math.min(f.width, f.height) * 0.09;
      texts.push({ text: f.uppercase ? f.title.toUpperCase() : f.title, x: f.width / 2, y: f.height / 2, size, font: f.font, fill: f.colors.text, spacing: 0 });
    }
  }
  return { width: f.width, height: f.height, ops, texts };
}

const esc = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));

export function frameToSvg(doc: FrameDoc, opts: { width?: number; height?: number } = {}): string {
  const body = doc.ops.map((o) => {
    const a = [`d="${o.d}"`, `fill="${o.fill ?? 'none'}"`];
    if (o.alpha != null && o.alpha < 1) a.push(`fill-opacity="${o.alpha}"`);
    if (o.stroke) a.push(`stroke="${o.stroke}"`, `stroke-width="${n(o.sw ?? 1)}"`, 'stroke-linejoin="round"');
    return `<path ${a.join(' ')}/>`;
  }).join('');
  const text = doc.texts.map((t) => {
    const f = FONT_STACK[t.font];
    return `<text x="${n(t.x)}" y="${n(t.y)}" text-anchor="middle" font-family="${esc(f.family)}" font-weight="${f.weight}"${f.italic ? ' font-style="italic"' : ''} font-size="${n(t.size)}"${t.spacing ? ` letter-spacing="${n(t.spacing)}"` : ''} fill="${t.fill}">${esc(t.text)}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.width ?? doc.width}" height="${opts.height ?? doc.height}" viewBox="0 0 ${n(doc.width)} ${n(doc.height)}">${body}${text}</svg>`;
}

export async function frameToPng(doc: FrameDoc, scale: number, background?: string): Promise<Blob> {
  const W = Math.round(doc.width * scale), H = Math.round(doc.height * scale);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  // Make sure the web fonts are ready before drawing text to the canvas.
  await Promise.all(doc.texts.map((t) => {
    const f = FONT_STACK[t.font];
    return document.fonts?.load(`${f.italic ? 'italic ' : ''}${f.weight} ${Math.round(t.size)}px ${f.family}`, t.text).catch(() => undefined);
  }));
  ctx.scale(scale, scale);
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, doc.width, doc.height); }
  for (const o of doc.ops) {
    const p = new Path2D(o.d);
    ctx.globalAlpha = o.alpha ?? 1;
    if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(p); }
    ctx.globalAlpha = 1;
    if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.sw ?? 1; ctx.lineJoin = 'round'; ctx.stroke(p); }
  }
  for (const t of doc.texts) {
    const f = FONT_STACK[t.font];
    ctx.font = `${f.italic ? 'italic ' : ''}${f.weight} ${t.size}px ${f.family}`;
    ctx.fillStyle = t.fill; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${t.spacing}px`;
    ctx.fillText(t.text, t.x, t.y);
  }
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'));
  c.width = c.height = 1;
  if (!blob) throw new Error('Could not encode PNG');
  return blob;
}
