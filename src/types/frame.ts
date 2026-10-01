export type FrameShape =
  | 'victorian' | 'wavy' | 'scallop' | 'ticket' | 'bracket' | 'octagon'
  | 'stepped' | 'stamp' | 'arch' | 'rounded' | 'oval' | 'cloud';
export type BorderStyle = 'checks' | 'blocks' | 'diamonds' | 'dots' | 'scallop' | 'bunting' | 'stripes';
export type FrameFont = 'serif' | 'condensed' | 'script' | 'italic' | 'sans';
export type Ornament = 'none' | 'sparkle' | 'star' | 'dot' | 'rule';

export interface FrameColors {
  fill: string; outline: string; inner: string; text: string; shadow: string; accent: string;
  /** Border mode */
  page: string; band: string; band2: string;
}

export interface FrameSettings {
  mode: 'label' | 'border';
  shape: FrameShape;
  width: number; height: number;   // label size (label mode) or page size (border mode)
  depth: number;                   // edge detail depth 0 – 100
  count: number;                   // bumps / waves along the long side
  corner: number;                  // corner size 0 – 100
  stroke: number;                  // outline width px
  doubleLine: boolean; gap: number;
  shadow: boolean;
  title: string; subtitle: string; font: FrameFont; textSize: number; uppercase: boolean;
  ornament: Ornament;
  border: { style: BorderStyle; band: number; innerLine: boolean; corners: boolean; label: boolean };
  colors: FrameColors;
}
