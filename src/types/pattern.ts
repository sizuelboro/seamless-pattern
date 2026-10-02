import type { HajwCentre, HajwHills } from '../engine/agorPatterns';
export type LayoutMode =
  | 'random' | 'grid' | 'brick' | 'hex' | 'halfdrop'
  | 'mirror' | 'radial' | 'tossed' | 'stripe' | 'checker' | 'cells' | 'vine' | 'damask';

export type RotationMode = 'random' | '0' | '45' | '90' | '180' | 'custom';
export type BackgroundType = 'solid' | 'linear' | 'radial' | 'transparent';
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal';
export type StripeDirection = 'horizontal' | 'vertical';

export type CategoryId =
  | 'floral' | 'botanical' | 'geometric' | 'abstract' | 'minimal' | 'vintage' | 'boho'
  | 'kids' | 'animal' | 'food' | 'travel' | 'wedding' | 'christmas' | 'halloween'
  | 'tropical' | 'retro' | 'scandinavian' | 'islamic' | 'indian' | 'handdrawn' | 'chintz' | 'tribal' | 'bodo';

/** One motif instance. Coordinates are in tile pixels; (x, y) is the motif centre. */
export interface PatternObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;
  colorIndex: number;
  flipX: boolean;
  locked: boolean;
  manual?: boolean;
}

export interface GenerationSettings {
  category: CategoryId;
  motifs: string[];
  layout: LayoutMode;
  density: number;      // 10 – 100
  scale: number;        // 10 – 300
  rotationMode: RotationMode;
  rotationMin: number;  // used by custom range
  rotationMax: number;
  spacing: number;      // 0 – 300
  variation: number;    // 0 – 100
  opacity: number;      // 20 – 100
  seed: number;
  stripeDirection: StripeDirection;
  /** mixed = random palette colour per motif; byMotif = consistent colour per motif type */
  colorMode: 'mixed' | 'byMotif';
  /** Optional palette indices per motif type (byMotif mode). */
  motifColors?: Record<string, number[]>;
  tileWidth: number;
  tileHeight: number;
  /** Vine layout: stem thickness 0 – 100 (0 hides the stems). */
  vineWidth?: number;
  /** Vine layout: how much the stems bow and curl, 0 – 100. */
  vineCurl?: number;
  /** Vine layout: palette index for stems (-1 = auto dark ink). */
  vineColor?: number;
}

export interface Background {
  type: BackgroundType;
  color: string;
  color2: string;
  direction: GradientDirection;
}

export type GeoStyle =
  | 'stripes' | 'pinstripe' | 'diagonal' | 'check' | 'gingham' | 'plaid'
  | 'harlequin' | 'argyle' | 'chevron' | 'scallop' | 'dots' | 'wave'
  | 'ogee' | 'jali' | 'bandhani' | 'ikat' | 'bands' | 'aztec' | 'agor' | 'aronai' | 'aronaiweave' | 'gubwi' | 'makhri' | 'hajw' | 'dingkhia' | 'khangkri' | 'aronaileaf';
export type GeoAccent = 'none' | 'dot' | 'sparkle' | 'star' | 'diamond' | 'flower';

/** Geometric base layer, drawn between the background and the motifs. */
export interface GeoSettings {
  /** Internal: force the row count (used when rendering a 3×3 super-tile). */
  rowsOverride?: number;
  enabled: boolean;
  style: GeoStyle;
  /** Cells across the tile (integer, so the layer always repeats with the tile). */
  repeat: number;
  /** Cell height ÷ cell width. */
  aspect: number;
  /** Band / shape weight, 2 – 100. */
  weight: number;
  /** Palette index per colour slot: base (-1 = background), main, line, accent, alt. */
  colors: number[];
  accent: GeoAccent;
  rotate: boolean;
  outline: boolean;
  /** Hajw agor: design of the middle chain and of the hills. */
  centre?: HajwCentre;
  hills?: HajwHills;
}

export interface PatternState {
  name: string;
  presetId: string | null;
  settings: GenerationSettings;
  palette: string[];
  background: Background;
  objects: PatternObject[];
  hiddenTypes: string[];
  edited: boolean;
  /** Optional geometric base layer (absent in older saves). */
  geo?: GeoSettings;
  /** Draw the motif layer (default true). */
  showMotifs?: boolean;
  /** Optional print texture drawn over everything (absent in older saves). */
  texture?: TextureSettings;
}

export type TextureType = 'none' | 'distressed' | 'grain' | 'linen' | 'canvas';
export interface TextureSettings {
  type: TextureType;
  /** Strength 0 – 100. */
  amount: number;
  /** Grain size 25 – 300 %. */
  scale: number;
  seed: number;
}

export interface SavedPattern {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnail: string;
  state: PatternState;
}

export type RepeatMode = 1 | 2 | 3 | 4 | 'infinite';
export type ExportFormat = 'png' | 'jpg' | 'webp' | 'svg';
export type AppView = 'generator' | 'frames' | 'patterns' | 'presets';
export type Backdrop = 'light' | 'dark' | 'checker';

export interface SeamReport {
  ok: boolean;
  checkedAt: number;
  wrapMismatchPixels: number;
  backgroundBreaks: number;
  /** Normalised positions (0–1) along the left/right seam (y) that differ. */
  rowsFlagged: number[];
  /** Normalised positions (0–1) along the top/bottom seam (x) that differ. */
  colsFlagged: number[];
  totalPixels: number;
}
