/**
 * Geometric base patterns — stripes, checks, gingham, plaid, harlequin, argyle, chevron,
 * scallop, dots and waves.
 *
 * Every style is defined inside one repeating cell. The tile holds an integer number of
 * cells in each direction (cw = W / cols, ch = H / rows), so the layer is periodic with
 * the tile by construction. Shapes are emitted for a ring of extra cells around the
 * tile, so anything that overflows a cell is drawn by its neighbour and clipped by the
 * tile edge. The output is a list of SVG path strings that the canvas renderer (Path2D)
 * and the SVG exporter share, so both outputs are identical.
 */
import type { GeoSettings, GeoStyle, GeoAccent } from '../types/pattern';
import { mod } from './random';
import { dd, runs, type Lit } from './pixelGrid';
import { fern, gourdChain, hajwSadri, rosette, type Key } from './agorPatterns';
import { fishbone, paisley, starFlower, sunburst } from './aronaiShapes';

export interface GeoOp { d: string; fill?: string; stroke?: string; sw?: number; alpha?: number; rule?: 'evenodd' }

/** Colour slots: 0 base (-1 = use background), 1 main, 2 line, 3 accent, 4 alternate. */
export interface GeoStyleMeta {
  id: GeoStyle;
  name: string;
  hint: string;
  roles: [slot: number, label: string][];
  outline?: string;            // label for the secondary toggle, if supported
  rotate?: 'transpose' | 'mirror';
  accent?: boolean;
  defaults: Partial<GeoSettings>;
}

export const GEO_STYLES: GeoStyleMeta[] = [
  { id: 'stripes', name: 'Stripes', hint: 'Classic awning stripes', roles: [[0, 'Base'], [1, 'Stripe'], [2, 'Pinline'], [3, 'Accent']], outline: 'Pinlines', rotate: 'transpose', accent: true, defaults: { repeat: 8, aspect: 1, weight: 50 } },
  { id: 'pinstripe', name: 'Pinstripe', hint: 'Bold band with thin lines', roles: [[0, 'Base'], [1, 'Band'], [2, 'Lines'], [3, 'Accent']], rotate: 'transpose', accent: true, defaults: { repeat: 6, aspect: 1, weight: 40 } },
  { id: 'diagonal', name: 'Diagonal', hint: 'Bias-cut stripes', roles: [[0, 'Base'], [1, 'Stripe'], [2, 'Pinline']], outline: 'Pinline', rotate: 'mirror', defaults: { repeat: 6, aspect: 1, weight: 50 } },
  { id: 'check', name: 'Checks', hint: 'Checkerboard — stretch it with cell ratio', roles: [[0, 'Base'], [1, 'Check'], [3, 'Accent']], accent: true, defaults: { repeat: 6, aspect: 1, weight: 50 } },
  { id: 'gingham', name: 'Gingham', hint: 'Picnic-cloth weave', roles: [[0, 'Base'], [1, 'Band'], [2, 'Cross'], [3, 'Accent']], accent: true, defaults: { repeat: 10, aspect: 1, weight: 50 } },
  { id: 'plaid', name: 'Plaid', hint: 'Tartan with double pinlines', roles: [[0, 'Base'], [1, 'Band'], [2, 'Lines'], [3, 'Accent']], outline: 'Centre line', accent: true, defaults: { repeat: 4, aspect: 1, weight: 40 } },
  { id: 'harlequin', name: 'Harlequin', hint: 'Diamond lattice', roles: [[0, 'Base'], [1, 'Diamond'], [2, 'Outline'], [3, 'Accent']], outline: 'Outline', accent: true, defaults: { repeat: 6, aspect: 1.5, weight: 100 } },
  { id: 'argyle', name: 'Argyle', hint: 'Diamonds with stitched lines', roles: [[0, 'Base'], [1, 'Diamond'], [2, 'Stitch'], [3, 'Accent']], accent: true, defaults: { repeat: 4, aspect: 1.4, weight: 100 } },
  { id: 'chevron', name: 'Chevron', hint: 'Zig-zag bands', roles: [[0, 'Base'], [1, 'Chevron'], [2, 'Pinline']], outline: 'Pinline', rotate: 'transpose', defaults: { repeat: 6, aspect: 0.6, weight: 45 } },
  { id: 'scallop', name: 'Scallop', hint: 'Fish-scale rows', roles: [[0, 'Base'], [1, 'Scale'], [2, 'Outline'], [4, 'Alt scale'], [3, 'Accent']], outline: 'Alternate rows', rotate: 'transpose', accent: true, defaults: { repeat: 8, aspect: 1, weight: 30 } },
  { id: 'dots', name: 'Polka', hint: 'Half-drop polka dots', roles: [[0, 'Base'], [1, 'Dot'], [2, 'Ring']], outline: 'Rings', defaults: { repeat: 8, aspect: 1, weight: 55 } },
  { id: 'ogee', name: 'Ogee', hint: 'Mughal onion trellis', roles: [[0, 'Base'], [1, 'Onion'], [2, 'Lattice'], [3, 'Accent']], outline: 'Fill onions', accent: true, defaults: { repeat: 5, aspect: 1.35, weight: 40, outline: true } },
  { id: 'jali', name: 'Jali', hint: 'Star-and-cross screen', roles: [[0, 'Base'], [1, 'Star'], [2, 'Cross'], [3, 'Accent']], outline: 'Outline', accent: true, defaults: { repeat: 6, aspect: 1, weight: 80 } },
  { id: 'bandhani', name: 'Bandhani', hint: 'Tie-dye dot clusters', roles: [[0, 'Base'], [1, 'Dots'], [2, 'Dot centres'], [3, 'Accent']], outline: 'Dot centres', accent: true, defaults: { repeat: 7, aspect: 1, weight: 55, outline: true } },
  { id: 'ikat', name: 'Ikat', hint: 'Feathered diamonds', roles: [[0, 'Base'], [1, 'Diamond'], [2, 'Inner'], [3, 'Accent']], accent: true, rotate: 'transpose', defaults: { repeat: 5, aspect: 1.6, weight: 85 } },
  { id: 'bands', name: 'Ethnic bands', hint: 'Temple, diamond and check borders', roles: [[0, 'Base'], [1, 'Bands'], [2, 'Temples'], [3, 'Diamonds']], rotate: 'transpose', defaults: { repeat: 6, aspect: 1.2, weight: 60 } },
  { id: 'aztec', name: 'Aztec', hint: 'Tribal medallions with arrow and sawtooth borders', roles: [[0, 'Base'], [1, 'Main'], [2, 'Arrows'], [3, 'Accent']], rotate: 'transpose', defaults: { repeat: 4, aspect: 1.7, weight: 70 } },
  { id: 'agor', name: 'Bodo Agor', hint: 'Dokhona border: stripes, zigzags and a pigeon-eye diamond on a counted thread grid', roles: [[0, 'Base'], [1, 'Border'], [2, 'Zigzag'], [3, 'Eye'], [4, 'Field buti']], outline: 'Field buti', rotate: 'transpose', defaults: { repeat: 6, aspect: 1.8, weight: 60, outline: true } },
  { id: 'aronai', name: 'Bodo Aronai', hint: 'Aronai panel: fishbone teeth, flower-diamond chain, sunburst medallions with paisleys', roles: [[0, 'Base'], [1, 'Hajw teeth & medallion'], [2, 'Lines'], [3, 'Flowers'], [4, 'Paisleys & leaves']], outline: 'Paisleys', rotate: 'transpose', defaults: { repeat: 2, aspect: 1.1, weight: 60, outline: true } },
  { id: 'aronaiweave', name: 'Aronai Weave', hint: 'Woven aronai: serrated net teeth and a chain of rosette diamonds', roles: [[0, 'Base'], [1, 'Hajw teeth'], [2, 'Lines'], [3, 'Diamond chain'], [4, 'Rosettes']], outline: 'Rosettes', rotate: 'transpose', defaults: { repeat: 2, aspect: 1, weight: 60, outline: true } },
  { id: 'gubwi', name: 'Agor Gubwi', hint: 'Dokhona stripes: orange bands, green zigzags round a purple dash row, dotted lines', roles: [[0, 'Base'], [1, 'Bands'], [2, 'Zigzag'], [3, 'Dashes'], [4, 'Dots']], outline: 'Zigzag bands', rotate: 'transpose', defaults: { repeat: 8, aspect: 2.5, weight: 60, outline: true } },
  { id: 'makhri', name: 'Makhri Agor', hint: 'Spider agor: bands of linked floral diamonds, one colour per band', roles: [[0, 'Base'], [1, 'Colour A'], [2, 'Colour B'], [3, 'Colour C'], [4, 'Dots & centres']], rotate: 'transpose', defaults: { repeat: 16, aspect: 4.8, weight: 60 } },
  { id: 'hajw', name: 'Hajw Agor', hint: 'Jwmbaigra sadri: herringbone hills up and down round a chain of eye medallions', roles: [[0, 'Base'], [1, 'Hills'], [2, 'Lines'], [3, 'Medallions'], [5, 'Centres'], [4, 'Divider stripes']], outline: 'Divider stripes', rotate: 'transpose', defaults: { repeat: 6, aspect: 5, weight: 60, outline: true } },
  { id: 'dingkhia', name: 'Dingkhia Bijou', hint: 'Jwmbaigra: round rosette band, fern fronds and rosettes in the field', roles: [[0, 'Base'], [1, 'Rosettes'], [2, 'Lines'], [3, 'Ferns'], [4, 'Centres']], outline: 'Field rosettes', rotate: 'transpose', defaults: { repeat: 6, aspect: 4.33, weight: 60, outline: true } },
  { id: 'khangkri', name: 'Khangkrikhola', hint: 'Teasel-gourd flower chains between dash and dot rows', roles: [[0, 'Base'], [1, 'Chains'], [2, 'Dashes'], [3, 'Diamonds'], [4, 'Dots']], rotate: 'transpose', defaults: { repeat: 6, aspect: 0.75, weight: 60 } },
  { id: 'wave', name: 'Waves', hint: 'Wavy ribbons', roles: [[0, 'Base'], [1, 'Wave'], [2, 'Pinline']], outline: 'Pinline', rotate: 'transpose', defaults: { repeat: 4, aspect: 0.5, weight: 45 } },
];
export const GEO_MAP = Object.fromEntries(GEO_STYLES.map((s) => [s.id, s])) as Record<GeoStyle, GeoStyleMeta>;

export const GEO_ACCENTS: { id: GeoAccent; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'dot', label: 'Dot' }, { id: 'sparkle', label: 'Sparkle' },
  { id: 'star', label: 'Star' }, { id: 'diamond', label: 'Diamond' }, { id: 'flower', label: 'Flower' },
];

export const DEFAULT_GEO: GeoSettings = {
  enabled: false, style: 'harlequin', repeat: 6, aspect: 1.5, weight: 100,
  colors: [-1, 0, 1, 2, 3], accent: 'none', rotate: false, outline: false,
};

export function geoWithStyle(g: GeoSettings, style: GeoStyle): GeoSettings {
  return { ...g, ...GEO_MAP[style].defaults, style };
}

const n = (v: number) => String(Math.round(v * 1000) / 1000);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Cell grid for a tile. Shared with the UI so it can show the real cell size. */
export function geoGrid(g: GeoSettings, W: number, H: number) {
  const meta = GEO_MAP[g.style];
  const mode = g.rotate ? meta.rotate : undefined;
  const BW = mode === 'transpose' ? H : W, BH = mode === 'transpose' ? W : H;
  const cols = clamp(Math.round(g.repeat), 1, 64);
  const cw = BW / cols;
  // Hajw agor is a single sadri band: exactly one band fills the tile height.
  const rows = g.rowsOverride ? g.rowsOverride : g.style === 'hajw' ? 1 : clamp(Math.round(BH / (cw * clamp(g.aspect, 0.2, 8))), 1, 128);
  return { mode, BW, BH, cols, rows, cw, ch: BH / rows };
}

type Seg = [[number, number], [number, number], [number, number], [number, number]];
const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** de Casteljau split of a cubic at t = ½. */
function split(s: Seg): [Seg, Seg] {
  const [p0, p1, p2, p3] = s;
  const a = lerp(p0, p1, 0.5), b = lerp(p1, p2, 0.5), c = lerp(p2, p3, 0.5), d = lerp(a, b, 0.5), e = lerp(b, c, 0.5), m = lerp(d, e, 0.5);
  return [[p0, a, d, m], [m, e, c, p3]];
}
const off = (s: Seg, dx: number, dy: number): Seg => s.map(([x, y]) => [x + dx, y + dy]) as Seg;
const rev = (s: Seg): Seg => [s[3], s[2], s[1], s[0]];

const FLAT_STEPS = 20;
function flatten([p0, p1, p2, p3]: Seg, withStart: boolean): [number, number][] {
  const out: [number, number][] = [];
  for (let k = withStart ? 0 : 1; k <= FLAT_STEPS; k++) {
    const t = k / FLAT_STEPS, u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
  }
  return out;
}

class PathBuilder {
  parts: string[] = [];
  constructor(private P: (x: number, y: number) => string) {}
  poly(pts: [number, number][]) {
    if (pts.length < 2) return;
    this.parts.push(`M${pts.map(([x, y]) => this.P(x, y)).join('L')}Z`);
  }
  rect(x: number, y: number, w: number, h: number) {
    if (w <= 0 || h <= 0) return;
    this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  }
  line(x1: number, y1: number, x2: number, y2: number) {
    this.parts.push(`M${this.P(x1, y1)}L${this.P(x2, y2)}`);
  }
  polyline(pts: [number, number][]) {
    this.parts.push(`M${pts.map(([x, y]) => this.P(x, y)).join('L')}`);
  }
  circle(cx: number, cy: number, r: number) {
    if (r <= 0) return;
    // Four quarter arcs: unambiguous at any rounding (a 180° arc's large-arc flag is not).
    const rr = n(r);
    const q = [this.P(cx + r, cy), this.P(cx, cy + r), this.P(cx - r, cy), this.P(cx, cy - r)];
    this.parts.push(`M${q[0]}A${rr} ${rr} 0 0 1 ${q[1]}A${rr} ${rr} 0 0 1 ${q[2]}A${rr} ${rr} 0 0 1 ${q[3]}A${rr} ${rr} 0 0 1 ${q[0]}Z`);
  }
  /** Béziers are flattened to short lines: curve rasterisation varies with absolute position, lines don't. */
  curve(s: Seg) {
    this.polyline(flatten(s, true));
  }
  closedCurves(list: Seg[]) {
    this.poly(list.flatMap((s, i) => flatten(s, i === 0)));
  }
  get d() { return this.parts.join(''); }
  get empty() { return this.parts.length === 0; }
}

let cacheKey = '';
let cacheOps: GeoOp[] = [];

/** Build the geometric layer for a W×H tile, optionally shifted by (ox, oy) tile px. */
export function buildGeo(g: GeoSettings, palette: string[], W: number, H: number, ox = 0, oy = 0): GeoOp[] {
  const key = JSON.stringify([g, palette, W, H, ox, oy]);
  if (key === cacheKey) return cacheOps;
  const ops = buildGeoUncached(g, palette, W, H, ox, oy);
  cacheKey = key; cacheOps = ops;
  return ops;
}

function buildGeoUncached(g: GeoSettings, palette: string[], W: number, H: number, ox: number, oy: number): GeoOp[] {
  const meta = GEO_MAP[g.style] ?? GEO_MAP.stripes;
  const { mode, BW, BH, cols, rows, cw, ch } = geoGrid(g, W, H);
  const [bx, by] = mode === 'transpose' ? [oy, ox] : [ox, oy];
  const offx = mod(mode === 'mirror' ? -bx : bx, cw), offy = mod(by, ch);
  const P = (x: number, y: number) => {
    let X = x + offx; const Y = y + offy;
    if (mode === 'mirror') X = BW - X;
    return mode === 'transpose' ? `${n(Y)} ${n(X)}` : `${n(X)} ${n(Y)}`;
  };
  const pb = () => new PathBuilder(P);
  const len = palette.length || 1;
  const col = (slot: number): string | null => {
    const i = g.colors[slot] ?? slot - 1;
    if (i < 0) return null;
    return palette[mod(i, len)] ?? '#000000';
  };
  const wt = clamp(g.weight, 2, 100) / 100;
  const unit = Math.min(cw, ch);
  const lw = Math.max(unit * 0.035, 0.6);
  const I0 = -2, I1 = cols + 1, J0 = -2, J1 = rows + 1;
  const top = -2 * ch, bottom = BH + 2 * ch, left = -2 * cw, right = BW + 2 * cw;
  const ops: GeoOp[] = [];
  const base = col(0);
  if (base) ops.push({ d: `M0 0H${n(W)}V${n(H)}H0Z`, fill: base });
  const fill = (b: PathBuilder, slot: number, alpha?: number) => { const c = col(slot); if (c && !b.empty) ops.push({ d: b.d, fill: c, alpha }); };
  const stroke = (b: PathBuilder, slot: number, sw: number) => { const c = col(slot); if (c && !b.empty) ops.push({ d: b.d, stroke: c, sw }); };
  const accents: [number, number][] = [];
  const each = (fn: (x0: number, y0: number, i: number, j: number) => void) => {
    for (let j = J0; j <= J1; j++) for (let i = I0; i <= I1; i++) fn(i * cw, j * ch, i, j);
  };

  switch (g.style) {
    case 'stripes': {
      const bw = cw * wt;
      const a = pb(), l = pb();
      for (let i = I0; i <= I1; i++) {
        const x0 = i * cw;
        a.rect(x0, top, bw, bottom - top);
        if (g.outline) { l.rect(x0 + bw + lw * 1.2, top, lw, bottom - top); l.rect(x0 - lw * 2.2, top, lw, bottom - top); }
      }
      fill(a, 1); fill(l, 2);
      each((x0, y0) => accents.push([x0 + bw + (cw - bw) / 2, y0 + ch / 2]));
      break;
    }
    case 'pinstripe': {
      const bw = cw * wt, gap = cw - bw;
      const a = pb(), l = pb();
      for (let i = I0; i <= I1; i++) {
        const x0 = i * cw;
        a.rect(x0, top, bw, bottom - top);
        l.rect(x0 + bw + gap / 3 - lw / 2, top, lw, bottom - top);
        l.rect(x0 + bw + (2 * gap) / 3 - lw / 2, top, lw, bottom - top);
      }
      fill(a, 1); fill(l, 2);
      each((x0, y0) => accents.push([x0 + bw / 2, y0 + ch / 2]));
      break;
    }
    case 'diagonal': {
      const a = pb(), l = pb();
      const xAt = (k: number, y: number) => (k - y / ch) * cw;
      for (let k = -4; k <= cols + rows + 4; k++) {
        a.poly([[xAt(k, top), top], [xAt(k + wt, top), top], [xAt(k + wt, bottom), bottom], [xAt(k, bottom), bottom]]);
        if (g.outline) {
          const m = k + wt + (1 - wt) / 2;
          const dk = (lw / 2) * Math.hypot(1 / cw, 1 / ch);
          l.poly([[xAt(m - dk, top), top], [xAt(m + dk, top), top], [xAt(m + dk, bottom), bottom], [xAt(m - dk, bottom), bottom]]);
        }
      }
      fill(a, 1); fill(l, 2);
      break;
    }
    case 'check': {
      const sx = cw * wt, sy = ch * wt;
      const a = pb();
      each((x0, y0) => { a.rect(x0, y0, sx, sy); a.rect(x0 + sx, y0 + sy, cw - sx, ch - sy); accents.push([x0 + sx + (cw - sx) / 2, y0 + sy / 2]); });
      fill(a, 1);
      break;
    }
    case 'gingham': {
      const bwx = cw * wt, bh = ch * wt;
      const v = pb(), h = pb(), x = pb();
      for (let i = I0; i <= I1; i++) v.rect(i * cw, top, bwx, bottom - top);
      for (let j = J0; j <= J1; j++) h.rect(left, j * ch, right - left, bh);
      each((x0, y0) => { x.rect(x0, y0, bwx, bh); accents.push([x0 + bwx + (cw - bwx) / 2, y0 + bh + (ch - bh) / 2]); });
      fill(v, 1); fill(h, 1); fill(x, 2);
      break;
    }
    case 'plaid': {
      const bw = cw * wt * 0.6, bh = ch * wt * 0.6;
      const v = pb(), h = pb(), l = pb(), c = pb();
      const thin = lw * 0.8;
      for (let i = I0; i <= I1; i++) {
        const x0 = i * cw, mid = x0 + bw + (cw - bw) / 2;
        v.rect(x0, top, bw, bottom - top);
        l.rect(mid - thin * 2, top, thin, bottom - top); l.rect(mid + thin, top, thin, bottom - top);
        if (g.outline) c.rect(x0 + bw / 2 - thin / 2, top, thin, bottom - top);
      }
      for (let j = J0; j <= J1; j++) {
        const y0 = j * ch, mid = y0 + bh + (ch - bh) / 2;
        h.rect(left, y0, right - left, bh);
        l.rect(left, mid - thin * 2, right - left, thin); l.rect(left, mid + thin, right - left, thin);
        if (g.outline) c.rect(left, y0 + bh / 2 - thin / 2, right - left, thin);
      }
      fill(v, 1, 0.55); fill(h, 1, 0.55); fill(l, 2); fill(c, 3);
      each((x0, y0) => accents.push([x0 + bw / 2, y0 + bh / 2]));
      break;
    }
    case 'harlequin':
    case 'argyle': {
      const a = pb(), o = pb(), st = pb();
      const hx = (cw / 2) * wt, hy = (ch / 2) * wt;
      each((x0, y0) => {
        const cx = x0 + cw / 2, cy = y0 + ch / 2;
        a.poly([[cx, cy - hy], [cx + hx, cy], [cx, cy + hy], [cx - hx, cy]]);
        if (g.style === 'harlequin' && g.outline) o.poly([[cx, cy - hy], [cx + hx, cy], [cx, cy + hy], [cx - hx, cy]]);
        if (g.style === 'argyle') {
          // Stitched lines run along the full lattice (u ± v = ½). Each cell edge is split
          // into 7 equal pieces and every other piece drawn, so dashes repeat per cell.
          const edges: [number, number, number, number][] = [
            [cx, y0, x0 + cw, cy], [x0 + cw, cy, cx, y0 + ch], [cx, y0 + ch, x0, cy], [x0, cy, cx, y0],
          ];
          for (const [ax, ay, bx2, by2] of edges) {
            for (let s = 0; s < 7; s += 2) {
              const t0 = (s + 0.15) / 7, t1 = (s + 0.85) / 7;
              st.line(ax + (bx2 - ax) * t0, ay + (by2 - ay) * t0, ax + (bx2 - ax) * t1, ay + (by2 - ay) * t1);
            }
          }
        }
        accents.push([cx, cy]);
      });
      fill(a, 1);
      if (!o.empty) stroke(o, 2, lw);
      if (!st.empty) stroke(st, 2, lw * 0.8);
      break;
    }
    case 'chevron': {
      const amp = Math.min(cw / 2, ch * 0.9);
      const th = ch * wt;
      const a = pb(), l = pb();
      const zig = (y0: number) => {
        const pts: [number, number][] = [];
        for (let t = I0 * 2; t <= I1 * 2 + 2; t++) pts.push([(t * cw) / 2, y0 + (mod(t, 2) ? amp : 0)]);
        return pts;
      };
      for (let j = J0 - 1; j <= J1 + 1; j++) {
        const y0 = j * ch;
        const t1 = zig(y0), b1 = zig(y0 + th).reverse();
        a.poly([...t1, ...b1]);
        if (g.outline) {
          const m = y0 + th + (ch - th) / 2;
          l.poly([...zig(m - lw / 2), ...zig(m + lw / 2).reverse()]);
        }
      }
      fill(a, 1); fill(l, 2);
      break;
    }
    case 'scallop': {
      const r = cw / 2;
      const sw = r * (0.03 + wt * 0.22);
      const accentShape = g.accent !== 'none' ? g.accent : null;
      for (let k = J0 * 2 - 2; k <= J1 * 2 + 2; k++) {
        const y = (k * ch) / 2, par = mod(k, 2);
        const f = pb(), ac = pb();
        for (let i = I0; i <= I1 + 1; i++) {
          const cx = i * cw + par * (cw / 2);
          f.circle(cx, y, r);
          if (accentShape) accentPath(ac, accentShape, cx, y + r * 0.5, Math.min(r, ch / 2) * 0.32);
        }
        fill(f, g.outline && par ? 4 : 1);
        stroke(f, 2, sw);
        fill(ac, 3);
      }
      break;
    }
    case 'dots': {
      const r = unit * 0.25 * wt;
      const a = pb();
      each((x0, y0) => { a.circle(x0 + cw / 4, y0 + ch / 4, r); a.circle(x0 + (3 * cw) / 4, y0 + (3 * ch) / 4, r); });
      fill(a, 1);
      if (g.outline) {
        const o = pb();
        each((x0, y0) => { o.circle(x0 + cw / 4, y0 + ch / 4, r * 1.45); o.circle(x0 + (3 * cw) / 4, y0 + (3 * ch) / 4, r * 1.45); });
        stroke(o, 2, lw);
      }
      break;
    }
    case 'ogee': {
      const k = 0.55;
      const lwO = Math.max(0.6, unit * (0.01 + wt * 0.07));
      // S-curves A: (0,0)→(cw,ch) and B: (cw,0)→(0,ch), relative to the cell origin.
      const A: Seg = [[0, 0], [0, k * ch], [cw, ch - k * ch], [cw, ch]];
      const B: Seg = [[cw, 0], [cw, k * ch], [0, ch - k * ch], [0, ch]];
      const [A1, A2] = split(A), [B1, B2] = split(B);
      const lines = pb(), on = pb();
      each((x0, y0) => {
        if (g.outline) {
          // onion centred on the cell's left edge: A1(i) → B2(i) → reverse A2(i-1) → reverse B1(i-1)
          on.closedCurves([off(A1, x0, y0), off(B2, x0, y0), rev(off(A2, x0 - cw, y0)), rev(off(B1, x0 - cw, y0))]);
        }
        accents.push([x0, y0 + ch / 2]);
      });
      // Lattice: chain the S-curves into continuous diagonals so no butt-capped joints sit at cell corners
      // (abutting caps leave a sub-pixel seam that changes with the tile offset).
      for (let d = I0 - J1; d <= I1 - J0; d++) {
        const pts: [number, number][] = [];
        for (let j = J0; j <= J1; j++) { const i = d + j; if (i >= I0 && i <= I1) pts.push(...flatten(off(A, i * cw, j * ch), pts.length === 0)); }
        if (pts.length > 1) lines.polyline(pts);
      }
      for (let t = I0 + J0; t <= I1 + J1; t++) {
        const pts: [number, number][] = [];
        for (let j = J0; j <= J1; j++) { const i = t - j; if (i >= I0 && i <= I1) pts.push(...flatten(off(B, i * cw, j * ch), pts.length === 0)); }
        if (pts.length > 1) lines.polyline(pts);
      }
      fill(on, 1);
      stroke(lines, 2, lwO);
      break;
    }
    case 'jali': {
      const st = pb(), cr = pb();
      const ro = unit * 0.46 * wt, ri = ro * 0.62;
      const cs = unit * 0.2 * wt;
      each((x0, y0) => {
        const cx = x0 + cw / 2, cy = y0 + ch / 2;
        const pts: [number, number][] = [];
        for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 8, r = i % 2 ? ri : ro; pts.push([cx + Math.cos(a) * r * (cw / unit), cy + Math.sin(a) * r * (ch / unit)]); }
        st.poly(pts);
        cr.poly([[x0, y0 - cs * (ch / unit)], [x0 + cs * (cw / unit), y0], [x0, y0 + cs * (ch / unit)], [x0 - cs * (cw / unit), y0]]);
        accents.push([cx, cy]);
      });
      fill(st, 1); fill(cr, 2);
      if (g.outline) stroke(st, 2, lw * 0.8);
      break;
    }
    case 'bandhani': {
      const dr = unit * 0.07 * (0.4 + wt);
      const dots = pb(), centres = pb();
      each((x0, y0) => {
        const cx = x0 + cw / 2, cy = y0 + ch / 2;
        const ringPts: [number, number][] = [];
        for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; ringPts.push([cx + Math.cos(a) * unit * 0.2, cy + Math.sin(a) * unit * 0.2]); }
        ringPts.push([cx, cy], [x0, y0]);
        for (const [x, y] of ringPts) { dots.circle(x, y, dr); if (g.outline) centres.circle(x, y, dr * 0.38); }
        accents.push([x0 + cw / 2, y0]);
      });
      fill(dots, 1); fill(centres, 2);
      break;
    }
    case 'ikat': {
      const dia = pb(), inner = pb();
      const S = 7;
      const jag = (pts: [number, number][], cx: number, cy: number, hx: number, hy: number, j: number) => {
        const corners: [number, number][] = [[cx, cy - hy], [cx + hx, cy], [cx, cy + hy], [cx - hx, cy]];
        for (let e = 0; e < 4; e++) {
          const [ax, ay] = corners[e], [bx2, by2] = corners[(e + 1) % 4];
          for (let t = 0; t < S; t++) {
            const u = t / S, x = ax + (bx2 - ax) * u, y = ay + (by2 - ay) * u;
            pts.push([x + (t % 2 ? j : -j) * Math.sign(x - cx || 1), y]);
          }
        }
      };
      each((x0, y0) => {
        const cx = x0 + cw / 2, cy = y0 + ch / 2;
        const hx = (cw / 2) * wt * 0.95, hy = (ch / 2) * 0.95;
        const p1: [number, number][] = [], p2: [number, number][] = [];
        jag(p1, cx, cy, hx, hy, hx * 0.09);
        jag(p2, cx, cy, hx * 0.5, hy * 0.5, hx * 0.06);
        dia.poly(p1); inner.poly(p2);
        accents.push([cx, cy]);
      });
      fill(dia, 1); fill(inner, 2);
      break;
    }
    case 'bands': {
      const b1 = pb(), tri = pb(), dm = pb();
      const k = 0.6 + wt * 0.4;
      for (let j = J0; j <= J1; j++) {
        const y0 = j * ch;
        b1.rect(left, y0, right - left, ch * 0.1 * k);
        b1.rect(left, y0 + ch * 0.44, right - left, ch * 0.025);
        b1.rect(left, y0 + ch * 0.76, right - left, ch * 0.025);
      }
      each((x0, y0) => {
        // temple row: 2 stepped triangles per cell
        for (let t = 0; t < 2; t++) {
          const bx0 = x0 + (t * cw) / 2, w2 = cw / 2, top2 = y0 + ch * 0.16, base2 = y0 + ch * 0.4;
          tri.poly([[bx0 + w2 * 0.08, base2], [bx0 + w2 * 0.08, base2 - (base2 - top2) * 0.35], [bx0 + w2 * 0.3, base2 - (base2 - top2) * 0.35], [bx0 + w2 * 0.5, top2], [bx0 + w2 * 0.7, base2 - (base2 - top2) * 0.35], [bx0 + w2 * 0.92, base2 - (base2 - top2) * 0.35], [bx0 + w2 * 0.92, base2]]);
        }
        // diamond row
        for (let t = 0; t < 3; t++) {
          const cx = x0 + ((t + 0.5) * cw) / 3, cy = y0 + ch * 0.6, hx = cw / 6 * 0.8, hy = ch * 0.1;
          dm.poly([[cx, cy - hy], [cx + hx, cy], [cx, cy + hy], [cx - hx, cy]]);
        }
        // check row
        for (let t = 0; t < 6; t++) if (t % 2 === 0) b1.rect(x0 + (t * cw) / 6, y0 + ch * 0.84, cw / 6, ch * 0.1);
      });
      fill(b1, 1); fill(tri, 2); fill(dm, 3);
      break;
    }
    case 'agor': {
      // Counted-thread dokhona border: 24 threads per repeat across, 25 rows of border, field below.
      const G = 24, ROWS = 25, ux = cw / G, uy = Math.min(ux, ch / (ROWS + 2));
      const band: Lit = (x, y) => {
        if (y <= 1 || y >= ROWS - 2) return '#';
        const zz = (row: number, flip: boolean) => ((x % 4 < 2) !== (flip ? row === 4 : row === 3) ? '+' : null);
        if (y === 3 || y === 4) return zz(y, false);
        if (y === 20 || y === 21) return zz(y === 20 ? 3 : 4, true);
        if (y >= 6 && y <= 18) {
          const d = dd(x - 12, y - 12);
          if (d === 6 || d === 5) return '#';
          if (d === 3) return '+';
          if (d === 1) return '#';
          if (d === 0) return '*';
          const e = dd(x < 12 ? x : x - G, y - 12);
          if (e <= 2) return e === 0 ? '*' : 'o';
        }
        return null;
      };
      const bandRuns = runs(band, 0, 0, G, ROWS);
      const buti: Lit = (x, y) => {
        const d = dd(x, y);
        if (d === 0) return '*';
        if ((x === 0 || y === 0) && d <= 3) return '#';
        if (Math.abs(x) === 2 && Math.abs(y) === 2 && wt > 0.35) return '#';
        return null;
      };
      const butiRuns = runs((x, y) => buti(x - 3, y - 3), 0, 0, 7, 7);
      const P1 = pb(), P2 = pb(), P3 = pb(), P4 = pb(), P5 = pb();
      const slot: Record<string, PathBuilder> = { '#': P1, '+': P2, o: P3, '*': P3 };
      const bl = 0.04;
      const fieldTop = ROWS * uy, fieldH = ch - fieldTop;
      each((x0, y0) => {
        for (const [k, list] of bandRuns) for (const [x, y, l] of list) slot[k].rect(x0 + x * ux, y0 + y * uy, l * ux + ux * bl, uy * (1 + bl));
        if (g.outline && fieldH >= 8 * uy) {
          const spots = wt > 0.65 ? [[0.5, 0.5], [0, 0.5]] : [[0.5, 0.5]];
          for (const [fx, fy] of spots) {
            const bx = x0 + fx * cw - 3.5 * ux, by = y0 + fieldTop + fy * fieldH - 3.5 * uy;
            for (const [k, list] of butiRuns) for (const [x, y, l] of list) (k === '*' ? P3 : P4).rect(bx + x * ux, by + y * uy, l * ux + ux * bl, uy * (1 + bl));
          }
        }
      });
      fill(P1, 1); fill(P2, 2); fill(P4, 4); fill(P3, 3); void P5;
      break;
    }
    case 'aronai': {
      // Printed aronai panel: fishbone teeth, diamond-flower chain and lines on both sides,
      // a sunburst medallion with four paisleys in the middle, star + arrow leaves between.
      const T1 = pb(), L2 = pb(), LR = pb(), F3 = pb(), P4 = pb(), PS = pb();
      const add = (b: PathBuilder, list: [number, number][][]) => { for (const p of list) b.poly(p); };
      const nT = Math.max(1, Math.round(ch / (cw * 0.12))), th = ch / nT;
      const k = wt > 0.7 ? 6 : wt > 0.35 ? 5 : 4, tf = 0.35 + wt * 0.35;
      const lw2 = Math.max(cw * 0.006, 0.6);
      each((x0, y0) => {
        const X = (u: number) => x0 + u * cw;
        for (const side of [0, 1]) {
          const S = (u: number) => X(side ? 1 - u : u);
          for (let t = 0; t < nT; t++) {
            const yc = y0 + (t + (side ? 0 : 0.5)) * th;
            add(T1, fishbone(S(0.012), S(0.15), yc, th * 0.49, k, tf));
            // diamond with a four-petal flower
            const dc = y0 + (t + 0.5) * th, hw = cw * 0.036, hh = th * 0.47;
            L2.polyline([[S(0.21), dc - hh], [S(0.21) + hw, dc], [S(0.21), dc + hh], [S(0.21) - hw, dc], [S(0.21), dc - hh]]);
            add(F3, starFlower(S(0.21), dc, Math.min(hw, hh) * 0.62, 4, Math.min(hw, hh) * 0.1, 0.55, 0));
            // herringbone strip
            const zx0 = S(0.268), zx1 = S(0.288);
            for (const q of [0.25, 0.75]) { const yq = y0 + (t + q) * th, h = Math.min(th * 0.16, Math.abs(zx1 - zx0) * 0.8); L2.polyline([[zx0, yq - h], [zx1, yq + h * 0.2], [zx0, yq + h]]); }
          }
          for (const u of [0.155, 0.26, 0.296]) { const a = S(u), w = cw * (u === 0.155 ? 0.008 : 0.005); LR.rect(Math.min(a, a + (side ? -w : w)), y0 - ch * 0.01, w, ch * 1.02); }
        }
        // centre column
        const cx = X(0.5), cy = y0 + ch / 2, R = Math.min(cw * 0.185, ch * 0.3);
        const sb = sunburst(cx, cy, R, wt);
        add(T1, sb.main); add(F3, sb.flower);
        if (g.outline) {
          const s = Math.min(cw * 0.062, ch * 0.09);
          for (const fx of [-1, 1]) for (const fy of [-1, 1]) {
            const p = paisley(cx + fx * cw * 0.118, cy + fy * (R + s * 0.85), s, -fx, -fy);
            PS.poly(p.body[0]); PS.poly(p.body[1]); F3.poly(p.eye);
          }
        }
        // between medallions: star flower with fishbone leaves pointing outwards
        const r = Math.min(cw * 0.048, ch * 0.07);
        add(F3, starFlower(cx, y0, r, 8, r * 0.2, 0.32, -Math.PI / 2 + Math.PI / 8));
        for (const fx of [-1, 1]) add(P4, fishbone(cx + fx * cw * 0.185, cx + fx * r * 1.4, y0, r * 1.15, 5, tf));
        // small chevrons above and below the star
        for (const fy of [-1, 1]) for (let q = 0; q < 2; q++) {
          const yy = y0 + fy * (r * (1.6 + q * 0.7)), w = r * 0.9;
          L2.polyline([[cx - w, yy + fy * w * 0.6], [cx, yy], [cx + w, yy + fy * w * 0.6]]);
        }
      });
      fill(T1, 1); fill(LR, 2); fill(P4, 4);
      { const c = col(4); if (c && !PS.empty) ops.push({ d: PS.d, fill: c, rule: 'evenodd' }); }
      stroke(L2, 2, lw2); fill(F3, 3);
      break;
    }
    case 'aronaiweave': {
      // Woven aronai (counted threads): serrated net-filled teeth, dotted lines and a chain of
      // diamonds holding flower rosettes. 61 threads across, 24-row repeat.
      const G = 61, C = 30, ux = cw / G;
      const reps = Math.max(1, Math.round(ch / (24 * ux))), R = 24 * reps, uy = ch / R;
      const net = wt > 0.75 ? 3 : 4;
      const tooth = (x: number, yy: number): string | null => {
        if (x < 1 || x > 12) return null;
        const dy = Math.abs(yy - 12), lim = ((x - 1) * 12) / 11;
        if (dy > lim + 0.01) return null;
        if (dy > lim - 1.1 || x === 12) return '#';
        if (wt < 0.25) return null;
        return (x + yy) % net === 0 || (x - yy + 48) % net === 0 ? '#' : null;
      };
      const lit: Lit = (x, y) => {
        const yy = y % 24;
        if (x <= 12) return tooth(x, yy);
        if (x >= G - 13) return tooth(G - 1 - x, (yy + 12) % 24);
        if (x === 13 || x === 17 || x === G - 14 || x === G - 18) return '+';
        if (x === 15 || x === G - 16) return yy % 2 === 0 ? '+' : null;
        if (x < 18 || x > G - 19) return null;
        const dx = x - C, dy = yy - 12, d = Math.abs(dx) + Math.abs(dy);
        if (d === 12 || d === 11) return 'o';
        if (d > 12) return dd(Math.abs(dx) - 12, Math.abs(dy) - 12) <= 3 ? '+' : null;
        if (g.outline) {
          if (d === 8) return '+';
          if (d === 0 || d === 4) return '*';
          if (d >= 2 && d <= 6 && (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) return '*';
          return null;
        }
        if (d === 6) return '+';
        return d <= 2 ? '*' : null;
      };
      const map = runs(lit, 0, 0, G, R);
      const B: Record<string, PathBuilder> = { '#': pb(), '+': pb(), o: pb(), '*': pb() };
      const bl = 0.04;
      each((x0, y0) => {
        // cull runs outside the tile: keeps SVG exports small
        for (const [kk, list] of map) for (const [x, y, l] of list) {
          const X0 = x0 + x * ux, Y0 = y0 + y * uy, w = l * ux + ux * bl, h = uy * (1 + bl);
          if (X0 + offx > BW || X0 + w + offx < 0 || Y0 + offy > BH || Y0 + h + offy < 0) continue;
          B[kk].rect(X0, Y0, w, h);
        }
      });
      fill(B['#'], 1); fill(B['+'], 2); fill(B.o, 3); fill(B['*'], 4);
      break;
    }
    case 'gubwi': case 'makhri': case 'hajw': case 'dingkhia': case 'khangkri': {
      // Woven dokhona / jwmbaigra layouts on a counted thread grid (G threads × R rows per cell).
      const A = Math.abs, heavy = wt > 0.4;
      let G = 16, R = 48, lit: Lit = () => null;
      if (g.style === 'gubwi') {
        // Agor gubwi dokhona: wide orange bands, green zigzag bands round a purple dash row, dotted lines
        G = 24; R = 60;
        const zig = (x: number, r: number) => { const ph = x % 12, v = ph < 6 ? ph : 11 - ph; return Math.abs(v - r) <= 1; };
        lit = (x, y) => {
          if (y <= 5) return heavy || (y >= 1 && y <= 4) ? '#' : null;
          if (y === 7 || y === 27) return x % 4 < 2 ? '*' : null;
          if (y >= 10 && y <= 15) return g.outline ? (zig(x, y - 10) ? '+' : '*') : (y === 13 ? '+' : null);
          if (y === 17 || y === 18) return x % 4 < 3 ? 'o' : null;
          if (y >= 20 && y <= 25) return g.outline ? (zig(x, 25 - y) ? '+' : '*') : (y === 22 ? '+' : null);
          if (y >= 29 && y <= 34) return heavy || (y >= 30 && y <= 33) ? '#' : null;
          if (y === 36) return x % 2 === 0 ? '*' : null;
          if (y === 45) return '+';
          if (y === 47 || y === 48) return '#';
          if (y === 50) return x % 3 === 0 ? 'o' : null;
          return null;
        };
      } else if (g.style === 'makhri') {
        // Makhri agor: bands of linked floral diamonds, each band in its own colour
        G = 10; R = 48;
        const ring: Key[] = ['o', '+', '#', '+'], fillK: Key[] = ['#', 'o', '+', '#'];
        lit = (x, y) => {
          const b = Math.floor(y / 12), r = y % 12;
          if (r === 0) return x % 2 === 0 ? '*' : null;
          if (r < 2 || r > 10) return null;
          const dx = x - 5, dy = r - 6, d = A(dx) + A(dy);
          if (d === 4) return ring[b];
          if (d <= 1) return heavy ? '*' : fillK[b];
          if (d === 2 && heavy) return fillK[b];
          if (dy === 0 && A(dx) === 5) return ring[b];
          if (dd(A(dx) - 5, A(dy) - 4) <= 1) return fillK[b];
          return null;
        };
      } else if (g.style === 'hajw') {
        // Hajw agor (jwmbaigra sadri): herringbone hills up, a chain of eye medallions, hills down
        G = 40; R = 100;
        const sp = wt < 0.35 ? 4 : 3;
        lit = (x, y) => hajwSadri(x, y, !!g.outline, sp);
      } else if (g.style === 'dingkhia') {
        // Dingkhia bijou, mirrored: rosette band (shared across the tile seam), dotted line, ferns hanging
        // down, a centred row of field rosettes, ferns rising up, dotted line, then the next tile's band.
        G = 24; R = 104;
        lit = (x, y) => {
          if (y <= 22) return rosette(x - 12, y - 11, 11);
          const m = y > 63 ? 126 - y : y; // mirror about the field centre (row 63)
          if (m === 24 || m === 26) return '+';
          if (m === 25) return x % 2 === 0 ? '+' : null;
          if (m >= 28 && m <= 41) {
            const f = fern(x < 12 ? x - 6 : x - 18, m - 28, 14, 4);
            return f ? 'o' : null;
          }
          if (g.outline) { const r = heavy ? 11 : 9; if (A(y - 63) <= r) return rosette(x - 12, y - 63, r); }
          return null;
        };
      } else {
        // Khangkrikhola: teasel-gourd flower chains (crossing waves, barred lenses) between dash and dot rows
        G = 36; R = 27;
        lit = (x, y) => {
          if (y <= 1) return x % 3 < 2 ? '+' : null;
          if (y === 3 || y === 19 || y === 25) return x % 2 === 0 ? '*' : null;
          if (y >= 5 && y <= 17) return gourdChain(x, y - 5, 36, 13);
          if (y >= 21 && y <= 23) return heavy && dd(((x + 6) % 12) - 6, y - 22) <= 1 ? 'o' : null;
          return null;
        };
      }
      // Hajw: one band per tile, its height set by Cell ratio (band height = cell width × ratio), rest plain.
      const ux = cw / G, uy = g.style === 'hajw' ? Math.min(ch, cw * clamp(g.aspect, 0.5, 10)) / R : ch / R, bl = 0.04;
      const map = runs(lit, 0, 0, G, R);
      // Hajw: upper hills at the top, divider stays under them, the medallion chain centred, the lower border at the bottom.
      const lowAt = g.style === 'hajw' ? 62 : 0;
      const B: Record<string, PathBuilder> = { '#': pb(), '+': pb(), o: pb(), '*': pb(), '~': pb() };
      each((x0, y0) => {
        for (const [kk, list] of map) for (const [x, y, l] of list) {
          const X0 = x0 + x * ux, Y0 = y0 + (lowAt && y >= lowAt ? ch - (R - y) * uy : lowAt && y >= 35 ? ch / 2 + (y - 49.5) * uy : y * uy), w = l * ux + ux * bl, h = uy * (1 + bl);
          if (X0 + offx > BW || X0 + w + offx < 0 || Y0 + offy > BH || Y0 + h + offy < 0) continue;
          B[kk].rect(X0, Y0, w, h);
        }
      });
      fill(B['#'], 1); fill(B['+'], 2); fill(B.o, 3);
      if (g.style === 'hajw') { fill(B['~'], 4); fill(B['*'], 5); } else fill(B['*'], 4);
      break;
    }
    case 'aztec': {
      const mn = pb(), ar = pb(), ac = pb(), cut = pb();
      const k = 0.55 + wt * 0.45;
      // horizontal rules (full width so they meet across cells)
      for (let j = J0; j <= J1; j++) {
        const y0 = j * ch;
        for (const [y, h] of [[0, 0.03], [0.255, 0.012], [0.733, 0.012], [0.97, 0.03]] as const) mn.rect(left, y0 + y * ch, right - left, h * ch);
      }
      each((x0, y0) => {
        const Y = (f: number, flip: boolean) => y0 + (flip ? 1 - f : f) * ch;
        for (const flip of [false, true]) {
          // small diamonds row
          for (let t = 0; t < 4; t++) {
            const cx = x0 + ((t + 0.5) * cw) / 4, cy = Y(0.075, flip), hx = cw / 16, hy = ch * 0.03;
            ac.poly([[cx, cy - hy], [cx + hx, cy], [cx, cy + hy], [cx - hx, cy]]);
          }
          // sawtooth pointing into the band
          for (let t = 0; t < 8; t++) {
            const xa = x0 + (t * cw) / 8, xb = xa + cw / 8;
            mn.poly([[xa, Y(0.115, flip)], [xb, Y(0.115, flip)], [(xa + xb) / 2, Y(0.16, flip)]]);
          }
          // arrow band: chevrons pointing right on top, left on the bottom
          for (let t = 0; t < 4; t++) {
            const cx = x0 + ((t + 0.5) * cw) / 4, cy = Y(0.205, flip), hx = cw / 22, hy = ch * 0.022, dir = flip ? -1 : 1;
            for (const o of [-1.1, 0.1]) {
              const bx = cx + o * hx * 2 * dir;
              ar.poly([[bx, cy - hy], [bx + hx * dir, cy - hy], [bx + hx * 2 * dir, cy], [bx + hx * dir, cy + hy], [bx, cy + hy], [bx + hx * dir, cy]]);
            }
          }
        }
        // central medallion: stepped diamonds
        const cx = x0 + cw / 2, cy = y0 + ch / 2, rx = cw * 0.44 * k, ry = ch * 0.2 * k;
        const step = (sx: number, sy: number, steps: number) => {
          const h = 1 / (2 * steps + 1), st = (1 - h) / steps;
          const q: [number, number][] = [[h, -1]];
          for (let t = 1; t <= steps; t++) { q.push([h + (t - 1) * st, -1 + t * st]); q.push([h + t * st, -1 + t * st]); }
          const pts: [number, number][] = [];
          for (let r = 0; r < 4; r++) for (const [x, y] of q) { let X = x, Yy = y; for (let u = 0; u < r; u++) [X, Yy] = [-Yy, X]; pts.push([cx + X * sx, cy + Yy * sy]); }
          return pts;
        };
        // outer ring (even-odd so the background shows through), then a solid core
        cut.poly(step(rx, ry, 5)); cut.poly(step(rx * 0.74, ry * 0.74, 4));
        mn.poly(step(rx * 0.5, ry * 0.5, 3));
        ac.poly(step(rx * 0.26, ry * 0.26, 2));
        // hourglass of big triangles between medallions (on the cell edge)
        const hw = cw * 0.17, top = y0 + ch * 0.27, bot = y0 + ch * 0.73, mid = y0 + ch / 2;
        mn.poly([[x0 - hw, top], [x0 + hw, top], [x0, mid - ch * 0.03]]);
        mn.poly([[x0 - hw, bot], [x0 + hw, bot], [x0, mid + ch * 0.03]]);
        ac.poly([[x0, mid - ch * 0.05], [x0 + cw * 0.04, mid], [x0, mid + ch * 0.05], [x0 - cw * 0.04, mid]]);
        // teeth along the main band edges
        for (let t = 0; t < 6; t++) {
          const xa = x0 + cw * 0.2 + (t * cw * 0.6) / 6, xb = xa + (cw * 0.6) / 6;
          if (t === 2 || t === 3) continue;
          ar.poly([[xa, top], [xb, top], [(xa + xb) / 2, top + ch * 0.05]]);
          ar.poly([[xa, bot], [xb, bot], [(xa + xb) / 2, bot - ch * 0.05]]);
        }
        accents.push([cx, cy]);
      });
      fill(mn, 1);
      { const c1 = col(1); if (c1 && !cut.empty) ops.push({ d: cut.d, fill: c1, rule: 'evenodd' }); }
      fill(ar, 2); fill(ac, 3);
      break;
    }
    case 'wave': {
      const amp = ch * 0.16, th = ch * wt;
      const a = pb(), l = pb();
      const curve = (y0: number) => {
        const pts: [number, number][] = [];
        const steps = 24;
        for (let i = I0 * steps; i <= (I1 + 1) * steps; i++) {
          const x = (i / steps) * cw;
          pts.push([x, y0 + amp * Math.sin((2 * Math.PI * i) / steps)]);
        }
        return pts;
      };
      for (let j = J0; j <= J1; j++) {
        const y0 = j * ch;
        a.poly([...curve(y0), ...curve(y0 + th).reverse()]);
        if (g.outline) { const m = y0 + th + (ch - th) / 2; l.poly([...curve(m - lw / 2), ...curve(m + lw / 2).reverse()]); }
      }
      fill(a, 1); fill(l, 2);
      break;
    }
  }

  if (meta.accent && g.accent !== 'none' && g.style !== 'scallop') {
    const ac = pb();
    const s = unit * 0.16;
    for (const [x, y] of accents) accentPath(ac, g.accent, x, y, s);
    fill(ac, 3);
  }
  return ops;
}

function accentPath(b: PathBuilder, kind: GeoAccent, x: number, y: number, s: number) {
  switch (kind) {
    case 'dot': b.circle(x, y, s * 0.5); break;
    case 'diamond': b.poly([[x, y - s * 0.8], [x + s * 0.55, y], [x, y + s * 0.8], [x - s * 0.55, y]]); break;
    case 'sparkle': {
      const k = s * 0.2;
      b.poly([[x, y - s], [x + k, y - k], [x + s, y], [x + k, y + k], [x, y + s], [x - k, y + k], [x - s, y], [x - k, y - k]]);
      break;
    }
    case 'star': {
      const pts: [number, number][] = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? s * 0.42 : s;
        pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
      }
      b.poly(pts);
      break;
    }
    case 'flower': {
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        b.circle(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5, s * 0.36);
      }
      break;
    }
    default: break;
  }
}

/**
 * Where motifs sit when the layout is "Fit to base": one point per cell, in tile space,
 * chosen per style (onion centres, diamond centres, the gaps between ikat diamonds…).
 */
export function geoAnchors(g: GeoSettings, W: number, H: number): { pts: [number, number][]; size: number } {
  const { mode, BW, cols, rows, cw, ch } = geoGrid(g, W, H);
  const wt = clamp(g.weight, 2, 100) / 100;
  const at: Record<string, [number, number][]> = {
    ogee: g.outline ? [[0.5, 0]] : [[0, 0.5]], ikat: [[0, 0]], check: [[wt / 2, wt / 2]], stripes: [[wt + (1 - wt) / 2, 0.5]],
    pinstripe: [[wt / 2, 0.5]], gingham: [[wt + (1 - wt) / 2, wt + (1 - wt) / 2]], plaid: [[wt * 0.3, wt * 0.3]],
    dots: [[0.75, 0.25], [0.25, 0.75]], bandhani: [[0.5, 0]], bands: [[0.5, 0.6]], aztec: [[0, 0.5]], aronai: [[0.5, 0.5]], gubwi: [[0.5, 0.72]], makhri: [[0.5, 0.5]], hajw: [[0, 0.12]], dingkhia: [[0.5, 0.62]], khangkri: [[0.5, 0.82]], aronaiweave: [[0.5, 0.5]], agor: [[0.5, Math.min(0.95, (25 * Math.min(cw / 24, ch / 27) + (ch - 25 * Math.min(cw / 24, ch / 27)) / 2) / ch)]], harlequin: [[0.5, 0.5]], argyle: [[0.5, 0.5]],
  };
  const fr = at[g.style] ?? [[0.5, 0.5]];
  const pts: [number, number][] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) for (const [fx, fy] of fr) {
    let x = (i + fx) * cw; const y = (j + fy) * ch;
    if (mode === 'mirror') x = BW - x;
    pts.push(mode === 'transpose' ? [mod(y, W), mod(x, H)] : [mod(x, W), mod(y, H)]);
  }
  const cellMin = Math.min(cw, ch);
  return { pts: pts.slice(0, 1600), size: cellMin * (g.style === 'ogee' ? 0.62 : g.style === 'dots' ? 0.4 : 0.7) };
}

/** Draw geo ops onto a 2D context already transformed into tile space. */
export function drawGeoOps(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, ops: GeoOp[]) {
  for (const op of ops) {
    const p = new Path2D(op.d);
    ctx.globalAlpha = op.alpha ?? 1;
    if (op.fill) { ctx.fillStyle = op.fill; ctx.fill(p, op.rule ?? 'nonzero'); }
    if (op.stroke) { ctx.strokeStyle = op.stroke; ctx.lineWidth = op.sw ?? 1; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt'; ctx.stroke(p); }
  }
  ctx.globalAlpha = 1;
}

export function geoOpsToSvg(ops: GeoOp[]): string {
  return ops.map((op) => {
    const a = [`d="${op.d}"`, `fill="${op.fill ?? 'none'}"`];
    if (op.rule) a.push(`fill-rule="${op.rule}"`);
    if (op.alpha != null && op.alpha < 1) a.push(`fill-opacity="${op.alpha}"`);
    if (op.stroke) a.push(`stroke="${op.stroke}"`, `stroke-width="${n(op.sw ?? 1)}"`, 'stroke-linejoin="miter"', 'stroke-linecap="butt"');
    return `<path ${a.join(' ')}/>`;
  }).join('');
}
