import type { FrameColors, FrameSettings } from '../types/frame';
import { FRAME_SHAPES } from '../engine/frameEngine';

const NOSTALGIA: FrameColors = { fill: '#F1E4CE', outline: '#6E2B33', inner: '#6E2B33', text: '#6E2B33', shadow: '#E3A7B4', accent: '#E3A7B4', page: '#A8C0D2', band: '#6E2B33', band2: '#E3A7B4' };

export const DEFAULT_FRAME: FrameSettings = {
  mode: 'label', shape: 'victorian', width: 1200, height: 800,
  depth: 30, count: 5, corner: 45, stroke: 14, doubleLine: true, gap: 16, shadow: true,
  title: 'Sweet Shoppe', subtitle: 'Est. 2026 · Handmade', font: 'serif', textSize: 70, uppercase: false,
  ornament: 'sparkle',
  border: { style: 'checks', band: 70, innerLine: true, corners: false, label: true },
  colors: NOSTALGIA,
};

export interface FramePreset { id: string; name: string; settings: Partial<FrameSettings> }

export const FRAME_PRESETS: FramePreset[] = [
  { id: 'parlour', name: 'Parlour plaque', settings: { mode: 'label', shape: 'victorian', ...FRAME_SHAPES.victorian.defaults, font: 'serif', title: 'Sweet Shoppe', subtitle: 'Est. 2026 · Handmade', ornament: 'sparkle', shadow: true, doubleLine: true, colors: NOSTALGIA } },
  { id: 'wavy-tag', name: 'Wavy tag', settings: { mode: 'label', shape: 'wavy', ...FRAME_SHAPES.wavy.defaults, font: 'script', title: 'Crafted with love', subtitle: '', ornament: 'none', shadow: false, doubleLine: true, colors: { ...NOSTALGIA, fill: '#F7EEDC', outline: '#6E2B33', inner: '#E3A7B4', text: '#C9707F' } } },
  { id: 'stamp', name: 'Bakery stamp', settings: { mode: 'label', shape: 'stamp', ...FRAME_SHAPES.stamp.defaults, font: 'condensed', uppercase: true, title: 'Fresh daily', subtitle: 'Small batch bakery', ornament: 'rule', shadow: false, doubleLine: true, colors: { ...NOSTALGIA, fill: '#E3A7B4', outline: '#E3A7B4', inner: '#6E2B33', text: '#6E2B33', accent: '#6E2B33' } } },
  { id: 'ticket', name: 'Cinema ticket', settings: { mode: 'label', shape: 'ticket', ...FRAME_SHAPES.ticket.defaults, font: 'condensed', uppercase: true, title: 'Admit one', subtitle: 'Row C · Seat 12', ornament: 'star', shadow: true, doubleLine: true, colors: { ...NOSTALGIA, fill: '#A8C0D2', shadow: '#6E2B33', accent: '#F1E4CE' } } },
  { id: 'scallop', name: 'Scallop badge', settings: { mode: 'label', shape: 'scallop', ...FRAME_SHAPES.scallop.defaults, font: 'italic', title: 'Bloom Studio', subtitle: 'Skincare', ornament: 'dot', shadow: false, doubleLine: true, colors: { ...NOSTALGIA, fill: '#F1E4CE', outline: '#6F7D4C', inner: '#6F7D4C', text: '#6F7D4C', accent: '#E3A7B4' } } },
  { id: 'arch', name: 'Arch window', settings: { mode: 'label', shape: 'arch', ...FRAME_SHAPES.arch.defaults, width: 800, height: 1100, font: 'serif', title: 'Daily\nFocus', subtitle: 'Notes', ornament: 'sparkle', shadow: true, doubleLine: true, colors: { ...NOSTALGIA, fill: '#F7EEDC', outline: '#6E2B33', shadow: '#A8C0D2' } } },
  { id: 'cloud', name: 'Cloud bubble', settings: { mode: 'label', shape: 'cloud', ...FRAME_SHAPES.cloud.defaults, font: 'script', title: 'Hello!', subtitle: '', ornament: 'none', shadow: true, doubleLine: false, colors: { ...NOSTALGIA, fill: '#FFFFFF', outline: '#8FA9C4', text: '#8FA9C4', shadow: '#DCE6F0' } } },
  { id: 'checker-card', name: 'Checkered card', settings: { mode: 'border', width: 1500, height: 2100, font: 'italic', title: 'Frames and\nbackgrounds', subtitle: '', ornament: 'sparkle', shape: 'rounded', corner: 20, shadow: false, doubleLine: false, stroke: 0, border: { style: 'checks', band: 90, innerLine: false, corners: false, label: true }, colors: { ...NOSTALGIA, page: '#A8C0D2', fill: '#A8C0D2', text: '#6E2B33', accent: '#F1E4CE' } } },
  { id: 'diamond-menu', name: 'Diamond menu', settings: { mode: 'border', width: 1500, height: 2100, font: 'condensed', uppercase: true, title: 'Layers\n& lines', subtitle: 'Menu', ornament: 'rule', shape: 'victorian', depth: 25, corner: 40, shadow: false, doubleLine: true, stroke: 10, border: { style: 'diamonds', band: 110, innerLine: true, corners: true, label: true }, colors: { ...NOSTALGIA, page: '#F1E4CE', band: '#E3A7B4', band2: '#6E2B33', inner: '#6E2B33', accent: '#6E2B33', fill: '#F7EEDC' } } },
  { id: 'scallop-invite', name: 'Scallop invite', settings: { mode: 'border', width: 1500, height: 2100, font: 'script', title: 'You’re invited', subtitle: 'Saturday · 7pm', ornament: 'dot', shape: 'oval', shadow: false, doubleLine: true, stroke: 8, border: { style: 'scallop', band: 100, innerLine: true, corners: false, label: true }, colors: { ...NOSTALGIA, page: '#F7EEDC', band: '#6F7D4C', inner: '#6F7D4C', outline: '#6F7D4C', text: '#6F7D4C', fill: '#F7EEDC', accent: '#E3A7B4' } } },
  { id: 'bunting', name: 'Party bunting', settings: { mode: 'border', width: 2000, height: 2000, font: 'serif', title: 'Party time', subtitle: '', ornament: 'star', shape: 'wavy', depth: 20, count: 5, corner: 40, shadow: true, doubleLine: false, stroke: 10, border: { style: 'bunting', band: 120, innerLine: false, corners: true, label: true }, colors: { ...NOSTALGIA, page: '#FFF8EE', band: '#C2473B', band2: '#F3C969', accent: '#5E7A45', fill: '#FFFFFF', outline: '#C2473B', text: '#C2473B', shadow: '#F3C969' } } },
];

export const FRAME_SIZES: { label: string; w: number; h: number; mode: 'label' | 'border' | 'any' }[] = [
  { label: 'Label 3:2', w: 1200, h: 800, mode: 'label' },
  { label: 'Label wide', w: 1600, h: 700, mode: 'label' },
  { label: 'Square', w: 1000, h: 1000, mode: 'any' },
  { label: 'Tall tag', w: 800, h: 1100, mode: 'label' },
  { label: '5×7 card', w: 1500, h: 2100, mode: 'border' },
  { label: 'A4 @150dpi', w: 1240, h: 1754, mode: 'border' },
  { label: 'Instagram', w: 1080, h: 1350, mode: 'border' },
  { label: 'Story', w: 1080, h: 1920, mode: 'border' },
];

const lum = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Map any palette onto frame roles: lightest fills, darkest draws, mids decorate. */
export function colorsFromPalette(palette: string[]): FrameColors {
  const p = [...palette].sort((a, b) => lum(a) - lum(b));
  const dark = p[0], light = p[p.length - 1], mid = p[Math.floor(p.length / 2)] ?? dark, mid2 = p[1] ?? mid, light2 = p[p.length - 2] ?? light;
  return { fill: light, outline: dark, inner: dark, text: dark, shadow: mid, accent: mid2 === dark ? mid : mid2, page: light2, band: dark, band2: mid };
}
