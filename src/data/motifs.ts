import {
  arc, circle, circles, crescent, ellipse, leaf, line, petals, poly, rays, rect, regular, snowArms, spiral, sprig, star, wedge,
} from '../engine/geometry';

/** Colour roles resolved against the active palette at render time. */
export type ColorRole = 'main' | 'alt' | 'accent' | 'ink' | 'light';

export interface MotifPart {
  d: string;
  fill?: ColorRole;
  stroke?: ColorRole;
  sw?: number;
  cap?: 'round' | 'butt' | 'square';
  dash?: number[];
  rule?: 'evenodd';
  o?: number;
}

/**
 * A motif is a list of SVG path parts in a 100×100 view box, centred at (50,50).
 * To add a new motif asset, append an entry here (path data can be pasted from any
 * SVG editor exported at 100×100) and reference its id in MOTIF_GROUPS / categories.
 */
export interface MotifDef {
  id: string;
  name: string;
  parts: MotifPart[];
}

const m = (id: string, name: string, parts: MotifPart[]): MotifDef => ({ id, name, parts });

export const MOTIFS: MotifDef[] = [
  // ───────── Floral ─────────
  m('flower', 'Flower', [
    { d: petals(50, 50, 5, 19, 17, 12.5), fill: 'main' },
    { d: circle(50, 50, 10), fill: 'accent' },
    { d: circle(50, 50, 4.5), fill: 'ink', o: 0.3 },
  ]),
  m('daisy', 'Daisy', [
    { d: petals(50, 50, 12, 23, 15, 5.4), fill: 'main' },
    { d: circle(50, 50, 11), fill: 'accent' },
  ]),
  m('rose', 'Rose', [
    { d: leaf(40, 70, 16, 88, 9) + leaf(60, 70, 84, 88, 9), fill: 'alt' },
    { d: circle(50, 46, 27), fill: 'main' },
    { d: spiral(50, 46, 2, 23, 2.6), stroke: 'ink', sw: 3, o: 0.3 },
  ]),
  m('tulip', 'Tulip', [
    { d: line(50, 62, 50, 92), stroke: 'alt', sw: 4 },
    { d: leaf(50, 90, 28, 64, 8) + leaf(50, 92, 72, 70, 7), fill: 'alt' },
    { d: 'M31 24L40 38L50 22L60 38L69 24C76 50 67 66 50 66C33 66 24 50 31 24Z', fill: 'main' },
    { d: 'M50 22C44 34 44 54 50 66C56 54 56 34 50 22Z', fill: 'ink', o: 0.12 },
  ]),
  m('leaf', 'Leaf', [
    { d: leaf(22, 80, 80, 18, 20), fill: 'main' },
    { d: 'M24 78Q48 54 77 22', stroke: 'ink', sw: 2.2, o: 0.28 },
  ]),
  m('branch', 'Branch', [
    { d: 'M24 90Q42 58 76 12', stroke: 'main', sw: 3 },
    { d: sprig([24, 90], [42, 58], [76, 12], [0.18, 0.36, 0.54, 0.72], 20, 6.5, 52), fill: 'main' },
  ]),
  m('smallFlower', 'Small flower', [
    { d: petals(50, 50, 5, 12, 11, 9), fill: 'main' },
    { d: circle(50, 50, 6), fill: 'accent' },
  ]),
  m('stem', 'Botanical stem', [
    { d: 'M50 92C47 66 53 40 50 10', stroke: 'main', sw: 3 },
    { d: ellipse(39, 74, 10, 5.5, -30) + ellipse(61, 62, 10, 5.5, 30) + ellipse(39, 48, 9, 5, -30) + ellipse(61, 36, 9, 5, 30) + ellipse(50, 16, 5, 8), fill: 'main' },
  ]),
  m('floralBranch', 'Floral branch', [
    { d: 'M20 88Q40 56 78 20', stroke: 'alt', sw: 2.5 },
    { d: sprig([20, 88], [40, 56], [78, 20], [0.2, 0.42, 0.66], 16, 5.5, 55, false), fill: 'alt' },
    { d: petals(78, 20, 5, 7, 7, 5.5) + petals(36, 66, 5, 5.5, 5.5, 4.2), fill: 'main' },
    { d: circle(78, 20, 3.4) + circle(36, 66, 2.6), fill: 'accent' },
  ]),

  // ───────── Geometric ─────────
  m('circle', 'Circle', [{ d: circle(50, 50, 30), fill: 'main' }]),
  m('square', 'Square', [{ d: rect(22, 22, 56, 56, 6), fill: 'main' }]),
  m('triangle', 'Triangle', [{ d: regular(50, 56, 3, 34), fill: 'main' }]),
  m('diamond', 'Diamond', [{ d: poly([[50, 14], [78, 50], [50, 86], [22, 50]]), fill: 'main' }]),
  m('hexagon', 'Hexagon', [{ d: regular(50, 50, 6, 32, 0), fill: 'main' }]),
  m('star', 'Star', [{ d: star(50, 53, 5, 34, 15), fill: 'main' }]),
  m('arc', 'Arc', [{ d: arc(50, 64, 26, 180, 360), stroke: 'main', sw: 11 }]),
  m('line', 'Line', [{ d: line(26, 74, 74, 26), stroke: 'main', sw: 8 }]),
  m('dot', 'Dot', [{ d: circle(50, 50, 14), fill: 'main' }]),
  m('plus', 'Plus', [{ d: rect(42, 22, 16, 56, 4) + rect(22, 42, 56, 16, 4), fill: 'main' }]),
  m('ringShape', 'Ring', [{ d: circle(50, 50, 26), stroke: 'main', sw: 10 }]),
  m('wave', 'Wave', [{ d: 'M14 50Q26 32 38 50T62 50T86 50', stroke: 'main', sw: 7 }]),
  m('semicircle', 'Half circle', [{ d: 'M20 64A30 30 0 0 1 80 64Z', fill: 'main' }]),
  m('tile', 'Gingham tile', [{ d: rect(0, 0, 100, 100), fill: 'main', o: 0.35 }]),

  // ───────── Cute ─────────
  m('heart', 'Heart', [{ d: 'M50 82C20 62 12 44 22 30C32 17 47 22 50 34C53 22 68 17 78 30C88 44 80 62 50 82Z', fill: 'main' }]),
  m('cloud', 'Cloud', [{ d: circles([[34, 56, 14], [52, 46, 19], [69, 57, 13]]) + rect(22, 54, 60, 17, 8.5), fill: 'main' }]),
  m('sun', 'Sun', [
    { d: rays(50, 50, 10, 25, 36), stroke: 'main', sw: 5 },
    { d: circle(50, 50, 17), fill: 'main' },
  ]),
  m('moon', 'Moon', [{ d: crescent(50, 50, 30, 64, 40, 25), fill: 'main' }]),
  m('rainbow', 'Rainbow', [
    { d: arc(50, 70, 32, 180, 360), stroke: 'main', sw: 8, cap: 'butt' },
    { d: arc(50, 70, 23, 180, 360), stroke: 'alt', sw: 8, cap: 'butt' },
    { d: arc(50, 70, 14, 180, 360), stroke: 'accent', sw: 8, cap: 'butt' },
  ]),
  m('mushroom', 'Mushroom', [
    { d: 'M40 54L37 82Q50 88 63 82L60 54Z', fill: 'light' },
    { d: 'M16 56C16 30 32 18 50 18C68 18 84 30 84 56Z', fill: 'main' },
    { d: circles([[34, 40, 5], [54, 30, 4], [66, 44, 5], [47, 47, 3.5]]), fill: 'light' },
  ]),
  m('strawberry', 'Strawberry', [
    { d: 'M50 88C28 80 18 55 24 40C30 30 42 32 50 34C58 32 70 30 76 40C82 55 72 80 50 88Z', fill: 'main' },
    { d: [[38, 48], [52, 46], [64, 50], [44, 60], [58, 62], [50, 74], [34, 62], [66, 64]].map(([x, y]) => ellipse(x, y, 1.6, 2.6)).join(''), fill: 'light' },
    { d: star(50, 33, 5, 15, 5), fill: 'alt' },
    { d: line(50, 30, 53, 17), stroke: 'alt', sw: 3 },
  ]),

  // ───────── Travel ─────────
  m('airplane', 'Airplane', [
    { d: ellipse(50, 50, 7, 36) + poly([[50, 38], [88, 58], [88, 64], [50, 56], [12, 64], [12, 58]]) + poly([[50, 74], [66, 84], [66, 88], [50, 84], [34, 88], [34, 84]]), fill: 'main' },
    { d: ellipse(50, 24, 3.5, 5.5), fill: 'light' },
  ]),
  m('suitcase', 'Suitcase', [
    { d: 'M40 30V22Q40 18 44 18H56Q60 18 60 22V30', stroke: 'ink', sw: 4 },
    { d: rect(20, 30, 60, 46, 7), fill: 'main' },
    { d: rect(31, 30, 7, 46) + rect(62, 30, 7, 46), fill: 'alt' },
    { d: circle(30, 80, 3.5) + circle(70, 80, 3.5), fill: 'ink' },
  ]),
  m('camera', 'Camera', [
    { d: rect(16, 32, 68, 44, 8) + rect(30, 24, 18, 12, 3), fill: 'main' },
    { d: circle(50, 54, 16), fill: 'ink' },
    { d: circle(50, 54, 10), fill: 'light' },
    { d: circle(50, 54, 4.5), fill: 'ink' },
    { d: rect(66, 38, 10, 6, 2), fill: 'light' },
  ]),
  m('passport', 'Passport', [
    { d: rect(26, 14, 48, 72, 5), fill: 'main' },
    { d: circle(50, 44, 13) + ellipse(50, 44, 6, 13) + line(37, 44, 63, 44), stroke: 'light', sw: 2.2 },
    { d: line(38, 70, 62, 70), stroke: 'light', sw: 3 },
  ]),
  m('palm', 'Palm tree', [
    { d: 'M54 92Q44 66 52 40', stroke: 'accent', sw: 6 },
    { d: leaf(52, 38, 18, 32, 7) + leaf(52, 38, 86, 32, 7) + leaf(52, 38, 26, 58, 6.5) + leaf(52, 38, 78, 58, 6.5) + leaf(52, 38, 38, 12, 6.5) + leaf(52, 38, 68, 12, 6.5), fill: 'main' },
    { d: circle(47, 43, 4) + circle(56, 44, 4), fill: 'alt' },
  ]),
  m('map', 'Map', [
    { d: poly([[16, 28], [38, 20], [38, 76], [16, 84]]) + poly([[62, 30], [84, 22], [84, 78], [62, 86]]), fill: 'main' },
    { d: poly([[38, 20], [62, 30], [62, 86], [38, 76]]), fill: 'alt' },
    { d: 'M24 70Q36 50 50 56T76 36', stroke: 'ink', sw: 2.5, dash: [4, 4] },
    { d: circle(76, 36, 3.2), fill: 'ink' },
  ]),
  m('umbrella', 'Beach umbrella', [
    { d: 'M50 50V84Q50 90 44 90Q39 90 39 85', stroke: 'ink', sw: 3.5 },
    { d: 'M14 50A36 36 0 0 1 86 50Q77 44 68 50Q59 44 50 50Q41 44 32 50Q23 44 14 50Z', fill: 'main' },
    { d: 'M50 14Q40 30 32 50Q41 44 50 50Q59 44 68 50Q60 30 50 14Z', fill: 'alt' },
    { d: circle(50, 13, 2.6), fill: 'ink' },
  ]),

  // ───────── Wedding ─────────
  m('ring', 'Ring', [
    { d: circle(46, 60, 22), stroke: 'main', sw: 6 },
    { d: poly([[46, 40], [58, 27], [54, 18], [38, 18], [34, 27]]), fill: 'alt' },
    { d: 'M34 27H58M42 18L46 40M50 18L46 40', stroke: 'light', sw: 1.4 },
  ]),
  m('ribbon', 'Ribbon', [{ d: 'M34 88L58 46C66 32 58 18 50 18C42 18 34 32 42 46L66 88', stroke: 'main', sw: 8 }]),
  m('champagne', 'Champagne glass', [
    { d: 'M36 14H64L62 38Q60 52 50 54Q40 52 38 38Z', fill: 'light' },
    { d: 'M38.6 28H61.4L60.6 38Q59 50 50 52Q41 50 39.4 38Z', fill: 'main' },
    { d: line(50, 54, 50, 80) + 'M38 84Q50 78 62 84', stroke: 'ink', sw: 3 },
    { d: circle(47, 42, 1.8) + circle(53, 36, 1.5) + circle(50, 46, 1.2), fill: 'light' },
  ]),
  m('bow', 'Bow', [
    { d: 'M50 50C40 34 18 30 18 44C18 58 38 58 50 50ZM50 50C62 58 82 58 82 44C82 30 60 34 50 50ZM47 52L36 82L44 78L48 86ZM53 52L64 82L56 78L52 86Z', fill: 'main' },
    { d: circle(50, 50, 7), fill: 'alt' },
  ]),

  // ───────── Christmas ─────────
  m('snowflake', 'Snowflake', [
    { d: rays(50, 50, 6, 0, 36) + snowArms(50, 50, 6, 20, 10) + snowArms(50, 50, 6, 30, 6), stroke: 'main', sw: 4 },
    { d: regular(50, 50, 6, 6, 0), fill: 'main' },
  ]),
  m('tree', 'Christmas tree', [
    { d: rect(44, 76, 12, 14, 2), fill: 'accent' },
    { d: poly([[50, 14], [66, 36], [58, 36], [74, 58], [64, 58], [80, 78], [20, 78], [36, 58], [26, 58], [42, 36], [34, 36]]), fill: 'main' },
    { d: circle(45, 48, 2.8) + circle(58, 64, 2.8) + circle(40, 70, 2.8) + circle(55, 32, 2.4), fill: 'alt' },
    { d: star(50, 13, 5, 8, 3.4), fill: 'alt' },
  ]),
  m('gift', 'Gift', [
    { d: rect(20, 40, 60, 46, 4) + rect(16, 30, 68, 14, 4), fill: 'main' },
    { d: rect(45, 30, 10, 56) + 'M50 30C40 14 26 20 34 28C38 32 46 31 50 30ZM50 30C54 31 62 32 66 28C74 20 60 14 50 30Z', fill: 'alt' },
  ]),
  m('ornament', 'Ornament', [
    { d: 'M50 16Q50 8 56 10', stroke: 'ink', sw: 2 },
    { d: rect(43, 16, 14, 9, 2), fill: 'accent' },
    { d: circle(50, 56, 30), fill: 'main' },
    { d: 'M22 52L29 46L36 52L43 46L50 52L57 46L64 52L71 46L78 52', stroke: 'alt', sw: 3.5 },
    { d: ellipse(38, 42, 4.5, 7.5, 30), fill: 'light', o: 0.5 },
  ]),
  m('candycane', 'Candy cane', [
    { d: 'M58 88V36A12 12 0 0 0 34 36V42', stroke: 'light', sw: 10 },
    { d: 'M58 88V36A12 12 0 0 0 34 36V42', stroke: 'main', sw: 10, cap: 'butt', dash: [7, 7] },
  ]),

  // ───────── Halloween ─────────
  m('pumpkin', 'Pumpkin', [
    { d: 'M50 36Q48 26 54 18', stroke: 'alt', sw: 5 },
    { d: ellipse(36, 58, 18, 24) + ellipse(64, 58, 18, 24) + ellipse(50, 58, 15, 26), fill: 'main' },
    { d: 'M50 34Q43 58 50 84M50 34Q57 58 50 84', stroke: 'ink', sw: 1.6, o: 0.25 },
    { d: poly([[35, 53], [45, 53], [40, 45]]) + poly([[55, 53], [65, 53], [60, 45]]) + 'M34 63L40 67L45 63L50 68L55 63L60 67L66 63Q60 76 50 76Q40 76 34 63Z', fill: 'ink' },
  ]),
  m('ghost', 'Ghost', [
    { d: 'M26 84V46C26 28 38 18 50 18C62 18 74 28 74 46V84L66 77L58 84L50 77L42 84L34 77Z', fill: 'light', stroke: 'ink', sw: 2, o: 1 },
    { d: ellipse(42, 44, 3.5, 5) + ellipse(58, 44, 3.5, 5) + ellipse(50, 57, 3, 4), fill: 'ink' },
  ]),
  m('bat', 'Bat', [{ d: 'M50 38L46 30L45 40C38 36 28 34 12 40C20 44 22 50 20 56C26 52 32 52 36 58C40 52 44 50 50 54C56 50 60 52 64 58C68 52 74 52 80 56C78 50 80 44 88 40C72 34 62 36 55 40L54 30Z', fill: 'main' }]),
  m('spider', 'Spider', [
    { d: line(50, 6, 50, 42), stroke: 'ink', sw: 1.4 },
    { d: 'M45 50Q30 36 22 44M44 54Q28 48 18 56M44 58Q28 60 20 70M46 62Q34 70 30 82M55 50Q70 36 78 44M56 54Q72 48 82 56M56 58Q72 60 80 70M54 62Q66 70 70 82', stroke: 'ink', sw: 2.6 },
    { d: circle(50, 60, 10) + circle(50, 47, 6.5), fill: 'ink' },
    { d: circle(47.6, 46, 1.5) + circle(52.4, 46, 1.5), fill: 'light' },
  ]),
  m('witchHat', 'Witch hat', [
    { d: ellipse(50, 74, 36, 8), fill: 'main' },
    { d: 'M30 72C40 50 44 28 56 14C58 12 61 13 60 17C58 30 64 50 70 72Z', fill: 'main' },
    { d: 'M32 64L68 64L70 72L30 72Z', fill: 'alt' },
    { d: rect(45, 63, 10, 10, 1.5), stroke: 'accent', sw: 2 },
  ]),

  // ───────── Animals ─────────
  m('bear', 'Bear', [
    { d: circle(30, 30, 10) + circle(70, 30, 10) + circle(50, 54, 28), fill: 'main' },
    { d: circle(30, 30, 5) + circle(70, 30, 5), fill: 'alt' },
    { d: ellipse(50, 64, 12, 9), fill: 'light' },
    { d: ellipse(50, 60, 4.5, 3.2) + circle(40, 50, 2.8) + circle(60, 50, 2.8), fill: 'ink' },
  ]),
  m('bunny', 'Bunny', [
    { d: ellipse(40, 30, 7, 18, -10) + ellipse(60, 30, 7, 18, 10) + circle(50, 62, 22), fill: 'main' },
    { d: ellipse(40, 31, 3, 12, -10) + ellipse(60, 31, 3, 12, 10) + poly([[47, 67], [53, 67], [50, 70.5]]), fill: 'alt' },
    { d: circle(42, 60, 2.5) + circle(58, 60, 2.5), fill: 'ink' },
  ]),
  m('bird', 'Bird', [
    { d: poly([[76, 37], [91, 44], [76, 50]]), fill: 'accent' },
    { d: 'M18 56C18 40 34 32 50 36C58 28 74 30 78 42C78 64 60 76 40 72C28 70 18 66 18 56Z', fill: 'main' },
    { d: 'M34 52C44 46 58 50 62 58C52 64 40 62 34 52Z', fill: 'alt' },
    { d: circle(68, 42, 2.6), fill: 'ink' },
  ]),
  m('fish', 'Fish', [
    { d: 'M30 50L10 34Q15 50 10 66Z' + 'M46 34Q54 20 64 34Z', fill: 'alt' },
    { d: ellipse(52, 50, 30, 18), fill: 'main' },
    { d: 'M44 36Q38 50 44 64', stroke: 'light', sw: 2.4, o: 0.6 },
    { d: circle(70, 46, 3), fill: 'ink' },
  ]),
  m('cat', 'Cat', [
    { d: 'M24 42L22 16L40 28Q50 25 60 28L78 16L76 42C82 56 76 80 50 80C24 80 18 56 24 42Z', fill: 'main' },
    { d: ellipse(40, 50, 3, 4.5) + ellipse(60, 50, 3, 4.5), fill: 'ink' },
    { d: poly([[47, 60], [53, 60], [50, 63.5]]), fill: 'alt' },
    { d: 'M30 62L14 60M30 66L14 68M70 62L86 60M70 66L86 68', stroke: 'ink', sw: 1.2, o: 0.6 },
  ]),
  m('paw', 'Paw', [{ d: 'M50 50C62 50 72 62 70 72C68 82 58 78 50 78C42 78 32 82 30 72C28 62 38 50 50 50Z' + ellipse(30, 46, 6, 8, -20) + ellipse(43, 34, 6, 8.5, -5) + ellipse(57, 34, 6, 8.5, 5) + ellipse(70, 46, 6, 8, 20), fill: 'main' }]),
  m('elephant', 'Elephant', [
    { d: 'M20 50Q14 64 22 72', stroke: 'main', sw: 7 },
    { d: 'M80 52Q86 56 84 62', stroke: 'main', sw: 2 },
    { d: ellipse(54, 54, 27, 19) + circle(30, 46, 14) + rect(36, 60, 9, 22, 3) + rect(62, 60, 9, 22, 3), fill: 'main' },
    { d: ellipse(37, 46, 9, 12), fill: 'alt' },
    { d: circle(25, 42, 2), fill: 'ink' },
  ]),
  m('lion', 'Lion', [
    { d: petals(50, 50, 12, 22, 10, 9, -90), fill: 'alt' },
    { d: circle(50, 52, 21) + circle(34, 34, 6) + circle(66, 34, 6), fill: 'main' },
    { d: ellipse(50, 60, 9, 7), fill: 'light' },
    { d: circle(42, 48, 2.5) + circle(58, 48, 2.5) + poly([[46, 56], [54, 56], [50, 60]]), fill: 'ink' },
  ]),

  // ───────── Food ─────────
  m('cherry', 'Cherry', [
    { d: 'M36 64Q42 36 60 18M64 62Q62 40 60 18', stroke: 'alt', sw: 3 },
    { d: leaf(60, 18, 82, 26, 6), fill: 'alt' },
    { d: circle(34, 68, 14) + circle(66, 66, 14), fill: 'main' },
    { d: circle(29, 63, 3) + circle(61, 61, 3), fill: 'light', o: 0.7 },
  ]),
  m('lemon', 'Lemon slice', [
    { d: circle(50, 50, 32), fill: 'main' },
    { d: circle(50, 50, 27), fill: 'light' },
    { d: Array.from({ length: 8 }, (_, i) => wedge(50, 50, 24, i * 45 + 4, i * 45 + 41)).join(''), fill: 'main', o: 0.75 },
    { d: circle(50, 50, 3), fill: 'light' },
  ]),
  m('donut', 'Donut', [
    { d: circle(50, 50, 32) + circle(50, 50, 10), fill: 'accent', rule: 'evenodd' },
    { d: 'M50 22C60 20 72 24 76 34C80 42 78 52 76 58C72 68 64 74 56 76C46 78 34 76 28 68C22 60 21 48 24 40C28 30 40 23 50 22Z' + circle(50, 50, 12.5), fill: 'main', rule: 'evenodd' },
    { d: line(32, 34, 36, 30) + line(60, 26, 65, 28) + line(68, 44, 70, 49) + line(38, 52, 34, 55) + line(48, 26, 52, 24) + line(62, 58, 58, 60), stroke: 'light', sw: 2.6 },
  ]),
  m('icecream', 'Ice cream', [
    { d: poly([[33, 50], [67, 50], [50, 92]]), fill: 'accent' },
    { d: 'M40 56L56 76M48 52L61 66M60 56L45 78M52 52L38 62', stroke: 'ink', sw: 1.4, o: 0.25 },
    { d: circle(50, 40, 20) + 'M30 42Q31 56 37 52Q41 58 45 52Q50 60 54 52Q58 58 62 52Q69 56 70 42Z', fill: 'main' },
    { d: circle(50, 17, 5), fill: 'alt' },
  ]),
  m('avocado', 'Avocado', [
    { d: 'M50 12C64 12 70 30 74 50C80 74 66 90 50 90C34 90 20 74 26 50C30 30 36 12 50 12Z', fill: 'main' },
    { d: 'M50 19C61 19 66 33 69 51C74 72 63 84 50 84C37 84 26 72 31 51C34 33 39 19 50 19Z', fill: 'light' },
    { d: circle(50, 62, 12), fill: 'alt' },
  ]),

  // ───────── Tropical ─────────
  m('monstera', 'Monstera', [
    { d: 'M50 88C20 80 10 50 18 32C26 16 42 12 50 22C58 12 74 16 82 32C90 50 80 80 50 88Z' + ellipse(30, 40, 7, 2.6, 35) + ellipse(28, 57, 7, 2.6, -8) + ellipse(37, 72, 6, 2.4, -35) + ellipse(70, 40, 7, 2.6, -35) + ellipse(72, 57, 7, 2.6, 8) + ellipse(63, 72, 6, 2.4, 35), fill: 'main', rule: 'evenodd' },
    { d: 'M50 86L50 26', stroke: 'ink', sw: 1.8, o: 0.25 },
  ]),
  m('hibiscus', 'Hibiscus', [
    { d: petals(50, 50, 5, 20, 19, 15), fill: 'main' },
    { d: circle(50, 50, 7), fill: 'alt' },
    { d: 'M50 50L65 30', stroke: 'accent', sw: 3 },
    { d: circle(65, 29, 3) + circle(61, 27, 2) + circle(68, 33, 2), fill: 'accent' },
  ]),
  m('pineapple', 'Pineapple', [
    { d: leaf(50, 36, 50, 8, 5) + leaf(50, 36, 36, 12, 5) + leaf(50, 36, 64, 12, 5) + leaf(50, 36, 28, 22, 4) + leaf(50, 36, 72, 22, 4), fill: 'alt' },
    { d: ellipse(50, 62, 20, 27), fill: 'main' },
    { d: 'M35 50L57 85M39 41L65 79M47 37L69 69M65 50L43 85M61 41L35 79M53 37L31 69', stroke: 'ink', sw: 1.4, o: 0.22 },
  ]),

  // ───────── Boho ─────────
  m('arch', 'Arch', [
    { d: 'M18 84V54A32 32 0 0 1 82 54V84Z', fill: 'main' },
    { d: 'M28 84V56A22 22 0 0 1 72 56V84Z', fill: 'alt' },
    { d: 'M38 84V58A12 12 0 0 1 62 58V84Z', fill: 'accent' },
  ]),
  m('bohoSun', 'Boho sun', [
    { d: rays(50, 66, 9, 28, 38, 180, 180), stroke: 'main', sw: 3.5 },
    { d: 'M28 66A22 22 0 0 1 72 66Z', fill: 'main' },
    { d: line(14, 66, 86, 66), stroke: 'main', sw: 3 },
  ]),
  m('cactus', 'Cactus', [
    { d: 'M42 88V30Q42 20 50 20Q58 20 58 30V88ZM42 62H32Q26 62 26 54V42Q26 38 30 38Q34 38 34 42V54H42ZM58 52H66Q72 52 72 44V34Q72 30 68 30Q64 30 64 34V44H58Z', fill: 'main' },
    { d: line(30, 88, 70, 88), stroke: 'alt', sw: 3 },
  ]),
  m('feather', 'Feather', [
    { d: leaf(34, 76, 74, 14, 13), fill: 'main' },
    { d: 'M44 64L36 60M50 54L40 48M56 44L48 36M50 62L60 62M56 52L66 50M62 42L70 38', stroke: 'light', sw: 1.6, o: 0.7 },
    { d: 'M26 88Q48 52 74 14', stroke: 'ink', sw: 2 },
  ]),
  m('blob', 'Organic blob', [{ d: 'M30 30C42 16 66 20 74 34C84 50 78 72 60 78C44 84 22 76 20 58C18 46 22 38 30 30Z', fill: 'main' }]),

  // ───────── Ornamental ─────────
  m('eightStar', 'Eight-point star', [
    { d: regular(50, 50, 4, 36, 0) + regular(50, 50, 4, 36, 45), fill: 'main' },
    { d: circle(50, 50, 18), stroke: 'light', sw: 2 },
    { d: circle(50, 50, 9), fill: 'alt' },
  ]),
  m('quatrefoil', 'Quatrefoil', [
    { d: circles([[50, 34, 16], [66, 50, 16], [50, 66, 16], [34, 50, 16]]), fill: 'main' },
    { d: circle(50, 50, 6), fill: 'alt' },
  ]),
  m('rosette', 'Rosette', [
    { d: star(50, 50, 12, 36, 25), fill: 'main' },
    { d: circle(50, 50, 17), fill: 'alt' },
    { d: star(50, 50, 6, 12, 6), fill: 'light' },
  ]),
  m('lattice', 'Lattice star', [
    { d: star(50, 50, 8, 34, 22), stroke: 'main', sw: 3 },
    { d: circle(50, 50, 6), fill: 'main' },
  ]),
  m('paisley', 'Paisley', [
    { d: 'M38 86C20 84 14 64 22 50C30 36 50 34 58 22C62 16 70 14 74 20C78 26 72 30 68 28C78 44 72 70 58 80C52 84 44 87 38 86Z', fill: 'main' },
    { d: 'M40 78C28 76 24 64 30 54C36 44 52 42 60 34C64 48 62 64 54 72C50 76 45 79 40 78Z', fill: 'alt' },
    { d: circle(42, 64, 4.5), fill: 'accent' },
  ]),
  m('lotus', 'Lotus', [
    { d: leaf(50, 78, 12, 56, 9) + leaf(50, 78, 88, 56, 9), fill: 'alt' },
    { d: leaf(50, 78, 26, 34, 11) + leaf(50, 78, 74, 34, 11), fill: 'main' },
    { d: leaf(50, 78, 50, 20, 12), fill: 'accent' },
    { d: 'M28 80Q50 90 72 80', stroke: 'alt', sw: 3 },
  ]),
  m('mandala', 'Mandala', [
    { d: circle(50, 50, 38), stroke: 'main', sw: 1.8 },
    { d: petals(50, 50, 12, 26, 8, 4.5) + Array.from({ length: 12 }, (_, i) => circle(50 + 38 * Math.cos(((i * 30 + 15) * Math.PI) / 180), 50 + 38 * Math.sin(((i * 30 + 15) * Math.PI) / 180), 2.4)).join(''), fill: 'main' },
    { d: petals(50, 50, 8, 13, 7, 4), fill: 'alt' },
    { d: circle(50, 50, 5.5), fill: 'accent' },
  ]),
  m('scandiFlower', 'Folk flower', [
    { d: line(50, 56, 50, 92), stroke: 'alt', sw: 3 },
    { d: leaf(50, 82, 28, 66, 6) + leaf(50, 82, 72, 66, 6), fill: 'alt' },
    { d: petals(50, 36, 6, 13, 9, 7), fill: 'main' },
    { d: circle(50, 36, 7), fill: 'light' },
    { d: circle(50, 36, 3), fill: 'accent' },
  ]),

  // ───────── Retro / hand-drawn ─────────
  m('starburst', 'Starburst', [
    { d: star(50, 50, 16, 36, 25), fill: 'main' },
    { d: circle(50, 50, 13), fill: 'alt' },
  ]),
  m('flowerPower', 'Flower power', [
    { d: petals(50, 50, 6, 20, 15, 12), fill: 'main' },
    { d: circle(50, 50, 12), fill: 'alt' },
  ]),
  m('sparkle', 'Sparkle', [{ d: 'M50 12C53 38 62 47 88 50C62 53 53 62 50 88C47 62 38 53 12 50C38 47 47 38 50 12Z', fill: 'main' }]),
  m('squiggle', 'Squiggle', [{ d: 'M14 56C22 36 30 36 34 52C38 68 46 68 50 50C54 32 62 32 66 50C70 68 78 68 86 44', stroke: 'main', sw: 5 }]),
  m('scribble', 'Scribble loop', [{ d: 'M18 62C18 30 50 28 52 46C54 62 32 64 34 48C36 32 62 28 68 44C72 56 56 62 56 50C56 36 80 32 84 54', stroke: 'main', sw: 4 }]),
  m('triDots', 'Dot cluster', [{ d: circles([[34, 40, 7], [64, 36, 6], [50, 64, 8]]), fill: 'main' }]),
  m('brush', 'Brush marks', [{ d: 'M22 38L46 34M30 54L70 48M48 70L78 64', stroke: 'main', sw: 7 }]),
];

import { INDIAN_MOTIFS } from './indianMotifs';
import { CHINTZ_MOTIFS } from './chintzMotifs';
import { BODO_MOTIFS } from './bodoMotifs';
MOTIFS.push(...INDIAN_MOTIFS, ...CHINTZ_MOTIFS, ...BODO_MOTIFS);

export const MOTIF_MAP: Record<string, MotifDef> = Object.fromEntries(MOTIFS.map((x) => [x.id, x]));

export const MOTIF_GROUPS: { id: string; label: string; motifs: string[] }[] = [
  { id: 'floral', label: 'Floral', motifs: ['flower', 'daisy', 'rose', 'tulip', 'leaf', 'branch', 'smallFlower', 'stem', 'floralBranch'] },
  { id: 'geometric', label: 'Geometric', motifs: ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'arc', 'line', 'dot', 'plus', 'ringShape', 'wave', 'semicircle', 'tile'] },
  { id: 'cute', label: 'Cute', motifs: ['heart', 'cloud', 'sun', 'moon', 'rainbow', 'mushroom', 'strawberry'] },
  { id: 'travel', label: 'Travel', motifs: ['airplane', 'suitcase', 'camera', 'passport', 'sun', 'palm', 'map', 'umbrella'] },
  { id: 'wedding', label: 'Wedding', motifs: ['ring', 'rose', 'heart', 'ribbon', 'champagne', 'bow', 'floralBranch'] },
  { id: 'christmas', label: 'Christmas', motifs: ['snowflake', 'tree', 'gift', 'ornament', 'candycane', 'star'] },
  { id: 'halloween', label: 'Halloween', motifs: ['pumpkin', 'ghost', 'bat', 'spider', 'moon', 'witchHat', 'star'] },
  { id: 'animals', label: 'Animals', motifs: ['bear', 'bunny', 'bird', 'fish', 'cat', 'paw', 'elephant', 'lion'] },
  { id: 'food', label: 'Food', motifs: ['strawberry', 'cherry', 'lemon', 'donut', 'icecream', 'avocado'] },
  { id: 'tropical', label: 'Tropical', motifs: ['monstera', 'hibiscus', 'palm', 'pineapple', 'leaf'] },
  { id: 'boho', label: 'Boho', motifs: ['arch', 'bohoSun', 'cactus', 'feather', 'blob', 'rainbow'] },
  { id: 'ornamental', label: 'Ornamental', motifs: ['eightStar', 'quatrefoil', 'rosette', 'lattice', 'paisley', 'lotus', 'mandala', 'scandiFlower'] },
  { id: 'chintz', label: 'Chintz & damask', motifs: ['chintzFan', 'chintzPeony', 'chintzRosette', 'pomegranate', 'carnation', 'chintzLeaf', 'curlLeaf', 'berrySprig', 'chintzBud', 'fernSprig', 'damaskPaisley', 'damaskLotus'] },
  { id: 'bodo', label: 'Bodo Agor', motifs: ['pharwoMegon', 'hajwAgor', 'bwigriBibar', 'daoraiAgor', 'agorStar', 'agorButi', 'agorChain'] },
  { id: 'tribal', label: 'Tribal', motifs: ['aztecDiamond', 'aztecArrow', 'aztecCross'] },
  { id: 'indian', label: 'Indian', motifs: ['buta', 'kairi', 'mughalFlower', 'lotusBloom', 'lotusTop', 'marigold', 'rangoli', 'mihrab', 'royalElephant', 'peacock', 'parrot', 'diya', 'kalash', 'ajrakhStar', 'kolam', 'bandhani', 'templeBell', 'paisley', 'lotus', 'mandala'] },
  { id: 'retro', label: 'Retro & hand-drawn', motifs: ['starburst', 'flowerPower', 'sparkle', 'squiggle', 'scribble', 'triDots', 'brush'] },
];
