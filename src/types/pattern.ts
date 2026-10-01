export type LayoutMode =
  | 'random' | 'grid' | 'brick' | 'hex' | 'halfdrop'
  | 'mirror' | 'radial' | 'tossed' | 'stripe' | 'checker';

export type RotationMode = 'random' | '0' | '45' | '90' | '180' | 'custom';
export type BackgroundType = 'solid' | 'linear' | 'radial' | 'transparent';
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal';
export type StripeDirection = 'horizontal' | 'vertical';

export type CategoryId =
  | 'floral' | 'botanical' | 'geometric' | 'abstract' | 'minimal' | 'vintage' | 'boho'
  | 'kids' | 'animal' | 'food' | 'travel' | 'wedding' | 'christmas' | 'halloween'
  | 'tropical' | 'retro' | 'scandinavian' | 'islamic' | 'indian' | 'handdrawn';

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
}

export interface Background {
  type: BackgroundType;
  color: string;
  color2: string;
  direction: GradientDirection;
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
export type AppView = 'generator' | 'patterns' | 'presets';
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
