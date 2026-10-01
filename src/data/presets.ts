import { generatePattern } from '../engine/patternGenerator';
import type { Background, GenerationSettings, PatternState } from '../types/pattern';

export interface PresetDef {
  id: string;
  name: string;
  description: string;
  palette: string[];
  background: Background;
  settings: Partial<GenerationSettings> & Pick<GenerationSettings, 'category' | 'motifs' | 'layout'>;
}

export const DEFAULT_SETTINGS: GenerationSettings = {
  category: 'botanical',
  motifs: ['leaf', 'smallFlower', 'branch', 'stem'],
  layout: 'random',
  density: 70,
  scale: 100,
  rotationMode: 'random',
  rotationMin: -30,
  rotationMax: 30,
  spacing: 20,
  variation: 45,
  opacity: 100,
  seed: 839421,
  stripeDirection: 'horizontal',
  colorMode: 'mixed',
  tileWidth: 2048,
  tileHeight: 2048,
};

const solid = (color: string): Background => ({ type: 'solid', color, color2: '#FFFFFF', direction: 'diagonal' });

export const PRESETS: PresetDef[] = [
  {
    id: 'botanical-meadow', name: 'Botanical Meadow', description: 'Leaves, sprigs and tiny blooms on cream.',
    palette: ['#6B8E72', '#E8A598', '#3F5B47', '#F2C66D', '#A9C2A0'], background: solid('#FBF4E6'),
    settings: { category: 'botanical', motifs: ['leaf', 'smallFlower', 'branch', 'stem'], layout: 'random', colorMode: 'byMotif', motifColors: { leaf: [0, 2, 4], smallFlower: [1, 3], branch: [0, 4], stem: [2, 0] }, density: 72, scale: 95, variation: 45, seed: 839421 },
  },
  {
    id: 'floral-meadow', name: 'Floral Meadow', description: 'Soft botanical floral pattern.',
    palette: ['#E8A0A8', '#8DB596', '#F6D186', '#5C8D6F', '#F3B3A6'], background: solid('#FFF9F1'),
    settings: { category: 'floral', motifs: ['flower', 'daisy', 'smallFlower', 'leaf', 'tulip'], layout: 'random', colorMode: 'byMotif', motifColors: { flower: [0, 4], daisy: [2, 0], smallFlower: [4, 2], leaf: [1, 3], tulip: [0, 4] }, density: 78, scale: 90, variation: 50, seed: 204816 },
  },
  {
    id: 'scandinavian-shapes', name: 'Scandinavian Shapes', description: 'Minimal geometric pattern.',
    palette: ['#2F4858', '#D9A47C', '#9CB4A6', '#E7C9B1'], background: solid('#F7F4EF'),
    settings: { category: 'scandinavian', motifs: ['semicircle', 'triangle', 'dot', 'line', 'ringShape'], layout: 'brick', rotationMode: '0', density: 55, scale: 80, variation: 0, spacing: 40, seed: 553201 },
  },
  {
    id: 'retro-picnic', name: 'Retro Picnic', description: 'Vintage gingham-inspired pattern.',
    palette: ['#D94B3D', '#C8352B', '#4E8A3E', '#F7D8C8'], background: solid('#FFFDF8'),
    settings: { category: 'retro', motifs: ['tile', 'cherry'], layout: 'checker', colorMode: 'byMotif', motifColors: { tile: [0], cherry: [1] }, rotationMode: '0', density: 60, scale: 70, variation: 20, spacing: 0, seed: 771234 },
  },
  {
    id: 'cute-strawberry', name: 'Cute Strawberry', description: 'Playful strawberry pattern.',
    palette: ['#E8505B', '#6DAE6B', '#F7B2B7', '#FFE3D3'], background: solid('#FFF5EE'),
    settings: { category: 'food', motifs: ['strawberry', 'dot', 'smallFlower'], layout: 'tossed', colorMode: 'byMotif', motifColors: { strawberry: [0], dot: [2, 1], smallFlower: [2] }, density: 70, scale: 85, variation: 40, seed: 318822 },
  },
  {
    id: 'tropical-paradise', name: 'Tropical Paradise', description: 'Palm leaves and flowers.',
    palette: ['#1F8A70', '#FF6F59', '#FFC145', '#00596B', '#7BD389'], background: solid('#FFF4E3'),
    settings: { category: 'tropical', motifs: ['monstera', 'hibiscus', 'smallFlower', 'leaf', 'palm'], layout: 'random', colorMode: 'byMotif', motifColors: { monstera: [0, 3], hibiscus: [1], smallFlower: [2], leaf: [4, 0], palm: [0] }, density: 82, scale: 130, variation: 45, seed: 660917 },
  },
  {
    id: 'wedding-botanicals', name: 'Wedding Botanicals', description: 'Elegant floral wedding pattern.',
    palette: ['#E8C4C0', '#9DB4A0', '#D9A5A0', '#B8C9B4', '#C9A66B'], background: solid('#FCF8F3'),
    settings: { category: 'wedding', motifs: ['floralBranch', 'leaf', 'rose', 'smallFlower'], layout: 'random', colorMode: 'byMotif', density: 62, scale: 100, variation: 35, seed: 142857 },
  },
  {
    id: 'halloween-night', name: 'Halloween Night', description: 'Pumpkins, bats and stars.',
    palette: ['#F28C28', '#5C9E48', '#9B6DD6', '#F6D365', '#F6E7C1'], background: solid('#1E1B2E'),
    settings: { category: 'halloween', motifs: ['pumpkin', 'ghost', 'bat', 'star', 'moon'], layout: 'tossed', colorMode: 'byMotif', density: 68, scale: 95, variation: 40, seed: 313131 },
  },
  {
    id: 'christmas-joy', name: 'Christmas Joy', description: 'Trees, ornaments and snowflakes.',
    palette: ['#1E6F50', '#C0392B', '#E5B94E', '#8FB8C9', '#E5B94E'], background: solid('#F7F1E6'),
    settings: { category: 'christmas', motifs: ['tree', 'ornament', 'gift', 'snowflake', 'star'], layout: 'tossed', colorMode: 'byMotif', rotationMode: 'custom', rotationMin: -20, rotationMax: 20, density: 72, scale: 95, variation: 35, seed: 251225 },
  },
  {
    id: 'baby-safari', name: 'Baby Safari', description: 'Cute animals and leaves.',
    palette: ['#F4C97A', '#E59F6B', '#B7C4CF', '#F3C1C6', '#9CC5A1', '#6B5B4E'], background: solid('#FFFBF4'),
    settings: { category: 'animal', motifs: ['lion', 'elephant', 'bear', 'leaf'], layout: 'random', colorMode: 'byMotif', motifColors: { lion: [0], elephant: [2], bear: [5], leaf: [4] }, rotationMode: 'custom', rotationMin: -15, rotationMax: 15, density: 70, scale: 110, variation: 30, seed: 908172 },
  },
  {
    id: 'boho-desert', name: 'Boho Desert', description: 'Sun, arches and organic shapes.',
    palette: ['#B5643C', '#D9A066', '#6E7B4F', '#E8D3B0', '#3E3328'], background: solid('#F2E6D6'),
    settings: { category: 'boho', motifs: ['arch', 'bohoSun', 'cactus', 'blob'], layout: 'random', colorMode: 'byMotif', motifColors: { arch: [0, 1], bohoSun: [1, 0], cactus: [2], blob: [3, 1] }, rotationMode: 'custom', rotationMin: -10, rotationMax: 10, density: 66, scale: 105, variation: 30, seed: 482910 },
  },
];

export const GALLERY_PRESETS = PRESETS.filter((p) => p.id !== 'botanical-meadow');
export const PRESET_MAP = Object.fromEntries(PRESETS.map((p) => [p.id, p]));

export function stateFromPreset(p: PresetDef, overrides: Partial<GenerationSettings> = {}): PatternState {
  const settings: GenerationSettings = { ...DEFAULT_SETTINGS, motifColors: undefined, ...p.settings, ...overrides };
  return {
    name: p.name,
    presetId: p.id,
    settings,
    palette: [...p.palette],
    background: { ...p.background },
    objects: generatePattern(settings),
    hiddenTypes: [],
    edited: false,
  };
}

export const DEMO_PRESET = PRESETS[0];
export function createDemoState(): PatternState {
  return stateFromPreset(DEMO_PRESET);
}
