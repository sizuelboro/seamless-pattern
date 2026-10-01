export function normalizeHex(input: string): string | null {
  let v = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(v)) v = v.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(v)) return null;
  return `#${v.toUpperCase()}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = normalizeHex(hex) ?? '#000000';
  const v = parseInt(n.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (x: number) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((x) => {
    const s = x / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

/** Harmonious random palette (analogous/complementary mix in HSL). */
export function randomPalette(rand: () => number = Math.random, size = 4): string[] {
  const baseHue = rand() * 360;
  const scheme = Math.floor(rand() * 3);
  const sat = 35 + rand() * 35;
  return Array.from({ length: size }, (_, i) => {
    const hue = scheme === 0 ? baseHue + i * 28 : scheme === 1 ? baseHue + (i % 2) * 180 + i * 12 : baseHue + i * 90;
    const light = [58, 72, 42, 30, 82][i % 5];
    return hslToHex(((hue % 360) + 360) % 360, sat + (i % 2) * 10, light);
  });
}

export function contrastText(bg: string): string {
  return luminance(bg) > 0.45 ? '#111111' : '#FFFFFF';
}
