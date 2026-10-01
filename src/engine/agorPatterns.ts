/**
 * Bodo agor units on a counted thread grid, shared by the motif library and the woven
 * geometric bases. Names and meanings follow "An Introduction to the Bodo Agor" (Narzary &
 * Boro, 2024) and the Balipara Foundation textile notes; the drawings are original
 * interpretations. Every function returns a colour key ('#', '+', 'o', '*') or null for
 * a thread offset from the unit centre (or top, where noted).
 */
import { dd } from './pixelGrid';

export type Key = '#' | '+' | 'o' | '*' | null;
const A = Math.abs;

/** Hajw agor — a hill (tip up) of height h, half-width w at the base, herringbone filled. ty = 0 at the tip. */
export function hill(dx: number, ty: number, h: number, w: number): Key {
  if (ty < 0 || ty >= h) return null;
  const lim = (ty * w) / (h - 1);
  if (A(dx) > lim + 0.01) return null;
  if (A(dx) > lim - 1 || ty === h - 1) return '#';
  if (dx === 0) return '#';
  // nested "^" chevrons parallel to the sides
  return ((ty - A(dx)) % 3 + 3) % 3 === 0 ? '#' : null;
}

/** Dingkhia — fern frond: pointed teardrop (tip up), dotted inside, solid rim and spine. ty from the tip, length h. */
export function fern(dx: number, ty: number, h: number, w: number): Key {
  if (ty < 0 || ty >= h) return null;
  const t = ty / (h - 1), belly = 0.72;
  const hw = t < belly ? w * Math.pow(t / belly, 1.1) : w * Math.sqrt(Math.max(0, 1 - ((t - belly) / (1 - belly)) ** 2));
  const r = Math.round(hw);
  if (A(dx) > r) return null;
  if (A(dx) === r || dx === 0) return '#';
  return (dx + ty) % 2 === 0 ? '+' : null;
}

/** Round woven rosette (gabsab / dingkhia bijou flower): octagon eye, ring and 12 dotted petals. */
export function rosette(dx: number, dy: number, R: number): Key {
  const r = Math.hypot(dx, dy);
  if (r > R + 0.3) return null;
  const oct = Math.max(A(dx), A(dy), (A(dx) + A(dy)) * 0.72);
  if (oct <= 0.8) return '*';
  if (oct >= R * 0.27 && oct <= R * 0.38) return '#';
  if (oct > R * 0.38 && oct < R * 0.47) return null;
  if (r >= R * 0.48) {
    const f = ((Math.atan2(dy, dx) / (Math.PI * 2)) * 12 + 12.5) % 1;
    if (f < 0.2 || f > 0.8) return null;
    if (r > R - 1.2) return '#';
    return (dx + dy) % 2 === 0 ? '#' : (A(f - 0.5) < 0.12 ? '+' : null);
  }
  return dd(dx, dy) === 2 ? 'o' : null;
}

/** Farwo megon — pigeon eye: concentric diamonds with a bright eye. */
export function pigeonEye(dx: number, dy: number, R: number): Key {
  const d = dd(dx, dy);
  if (d > R) return null;
  if (d >= R - 1) return '#';
  if (d === R - 3) return '+';
  if (d === 3 || d === 2) return '#';
  return d === 0 ? '*' : null;
}

/** Makhri / bema — spider: a diamond body with stepped legs. */
export function spider(dx: number, dy: number): Key {
  const d = dd(dx, dy), ax = A(dx), ay = A(dy);
  if (d <= 1) return '*';
  if (d <= 3) return '#';
  if (d === 4) return null;
  if (ax === ay && ax <= 6) return '+';
  if ((ay === 0 || ax === 0) && d <= 6) return '#';
  if (ax + ay === 8 && (ax === 7 || ay === 7)) return '+';
  return null;
}

/** Sikhri — butterfly: four wing triangles round a body with antennae. */
export function butterfly(dx: number, dy: number): Key {
  const ax = A(dx);
  if (dx === 0 && dy >= -3 && dy <= 4) return '*';
  if (ax === 1 || ax === 2) { if (dy === -5 + (ax === 2 ? -1 : 0) && ax <= 2) return '+'; }
  if (ax >= 1 && ax <= 6 && dy <= 0 && dy >= -6 && -dy >= ax - 1 && -dy <= ax + 1) return '#';
  if (ax >= 2 && ax <= 6 && dy <= 0 && dy >= -6 && -dy < ax - 1) return ((ax + dy) % 2 === 0 ? 'o' : null);
  if (ax >= 1 && ax <= 4 && dy >= 1 && dy <= 5 && dy >= ax - 1 && dy <= ax + 1) return '#';
  if (ax >= 2 && ax <= 4 && dy >= 1 && dy < ax - 1) return 'o';
  return null;
}

/** Khaseo bikha — tortoise back: octagonal shell with a lattice of plates. */
export function tortoise(dx: number, dy: number, R: number): Key {
  const ax = A(dx), ay = A(dy), oct = Math.max(ax, ay, (ax + ay) * 0.75);
  if (oct > R) return null;
  if (oct > R - 1) return '#';
  if (dd(dx, dy) === 0) return '*';
  if ((dx + dy + 64) % 4 === 0 || (dx - dy + 64) % 4 === 0) return '+';
  return dd((dx + 66) % 4 - 2, (dy + 64) % 4) === 0 ? 'o' : null;
}

/** Jong agor — spearhead on a short shaft (tip up), dy from -R to R. */
export function spear(dx: number, dy: number, R: number): Key {
  const ty = dy + R; // 0 at the tip
  const head = Math.round(R * 1.1);
  if (ty < 0 || ty > 2 * R) return null;
  if (ty <= head) {
    const hw = ty <= head * 0.6 ? Math.round((ty / (head * 0.6)) * (R * 0.5)) : Math.round(((head - ty) / (head * 0.4)) * (R * 0.5));
    if (A(dx) > hw) return null;
    if (A(dx) === hw || dx === 0) return '#';
    return 'o';
  }
  if (ty === head + 1 && A(dx) <= 2) return '+';
  return dx === 0 ? '#' : null;
}

/** San agor — sun: eye, ring and eight rays of alternating length. */
export function sun(dx: number, dy: number, R: number): Key {
  const d = dd(dx, dy), ax = A(dx), ay = A(dy);
  if (d <= 1) return '*';
  if (d === 3) return '#';
  if (d === 4) return null;
  if ((ax === 0 || ay === 0) && d <= R) return d === R ? '+' : '#';
  if (ax === ay && ax <= Math.round(R * 0.6)) return '#';
  if (d === 6 && (ax === 1 || ay === 1)) return 'o';
  return null;
}

/** Khamrenga — starfruit: a dotted five-point star section. */
export function starfruit(dx: number, dy: number, R: number): Key {
  const r = Math.hypot(dx, dy); if (r > R + 0.4) return null;
  if (r < 1.1) return '*';
  const a = Math.atan2(dx, -dy), f = ((a / (Math.PI * 2)) * 5 + 5) % 1, lobe = 1 - A(f - 0.5) * 2; // 1 on a point
  const edge = R * (0.45 + 0.55 * lobe);
  if (r > edge + 0.4) return null;
  if (r > edge - 1.1) return '#';
  return (dx + dy) % 2 === 0 ? '+' : null;
}

/** Mauji apha — cat's paw: a pad and four toes. */
export function catPaw(dx: number, dy: number): Key {
  if (dd(dx, (dy - 2) * 1.2) <= 3.2) return dd(dx, dy - 2) === 0 ? '*' : '#';
  for (const [x, y] of [[-4, -2], [-1.5, -5], [1.5, -5], [4, -2]] as const) if (dd(dx - Math.round(x), dy - y) <= 1) return '+';
  return null;
}

/** Dao agor — a bird: stepped diagonal body, crest, beak and a long tail line. */
export function bird(dx: number, dy: number): Key {
  // body rises from bottom-left to the head at top-right
  const bx = dx + dy; // constant along the diagonal
  if (dy >= -3 && dy <= 3 && bx >= -1 && bx <= 1 && dx >= -3) return '#';
  if (dy >= -1 && dy <= 4 && bx >= 2 && bx <= 3 && dx <= 1) return '+'; // wing
  if (dy === -4 && dx >= 4 && dx <= 5) return '#'; // head
  if (dy === -5 && dx === 5) return 'o'; // crest
  if (dy === -4 && dx === 6) return 'o'; // beak
  if (dy === 4 && dx >= -7 && dx <= -4) return '#'; // tail
  if (dy === 5 && (dx === -3 || dx === -1)) return '*'; // feet
  return null;
}

/** Khangkrikhola — teasel-gourd flower chain: two crossing waves forming lenses with a cross inside. period p, height h (odd). */
export function gourdChain(x: number, ty: number, p: number, h: number): Key {
  const c = (h - 1) / 2, ph = ((x % p) + p) % p;
  const amp = c - 0.5, yy = c + amp * Math.cos((ph / p) * Math.PI * 2), y2 = 2 * c - yy;
  if (A(ty - yy) <= 0.9 || A(ty - y2) <= 0.9) return '#';
  if (A(ty - c) < A(yy - c) - 1.6) return ph % 2 === 0 ? '+' : null;
  return null;
}

/** Thakhamala — chain of coins: octagon rings linked by a thread. */
export function coin(dx: number, dy: number, R: number): Key {
  const ax = A(dx), ay = A(dy), oct = Math.max(ax, ay, (ax + ay) * 0.72);
  if (oct > R) return null;
  if (oct > R - 1.2) return '#';
  return dd(dx, dy) <= 1 ? '*' : null;
}
