import type { CategoryId, LayoutMode } from '../types/pattern';

export interface CategoryDef {
  id: CategoryId;
  name: string;
  motifs: string[];
  layout: LayoutMode;
  palette: string;   // palette preset id used for thumbnails / randomize everything
  background: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'floral', name: 'Floral', motifs: ['flower', 'daisy', 'rose', 'tulip', 'leaf', 'smallFlower'], layout: 'random', palette: 'meadow', background: '#FBF4E6' },
  { id: 'botanical', name: 'Botanical', motifs: ['leaf', 'branch', 'stem', 'smallFlower'], layout: 'random', palette: 'meadow', background: '#F3EFE4' },
  { id: 'geometric', name: 'Geometric', motifs: ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'], layout: 'grid', palette: 'vintage', background: '#F6F1EA' },
  { id: 'abstract', name: 'Abstract', motifs: ['blob', 'squiggle', 'semicircle', 'dot', 'arc', 'wave'], layout: 'tossed', palette: 'earth', background: '#F4ECE1' },
  { id: 'minimal', name: 'Minimal', motifs: ['dot', 'line', 'plus', 'ringShape'], layout: 'hex', palette: 'monochrome', background: '#FFFFFF' },
  { id: 'vintage', name: 'Vintage', motifs: ['rose', 'smallFlower', 'leaf', 'bow'], layout: 'halfdrop', palette: 'vintage', background: '#EFE2CF' },
  { id: 'boho', name: 'Boho', motifs: ['arch', 'bohoSun', 'cactus', 'feather', 'blob'], layout: 'random', palette: 'earth', background: '#F2E6D6' },
  { id: 'kids', name: 'Kids', motifs: ['heart', 'cloud', 'sun', 'rainbow', 'star', 'mushroom'], layout: 'tossed', palette: 'candy', background: '#FFF8F0' },
  { id: 'animal', name: 'Animal', motifs: ['bear', 'bunny', 'bird', 'fish', 'cat', 'paw'], layout: 'brick', palette: 'pastel', background: '#FFFBF5' },
  { id: 'food', name: 'Food', motifs: ['strawberry', 'cherry', 'lemon', 'donut', 'icecream', 'avocado'], layout: 'tossed', palette: 'candy', background: '#FFF6EC' },
  { id: 'travel', name: 'Travel', motifs: ['airplane', 'suitcase', 'camera', 'passport', 'palm', 'map', 'umbrella'], layout: 'random', palette: 'tropical', background: '#F3EEE4' },
  { id: 'wedding', name: 'Wedding', motifs: ['ring', 'rose', 'heart', 'ribbon', 'champagne', 'bow', 'floralBranch'], layout: 'random', palette: 'wedding', background: '#FCF8F3' },
  { id: 'christmas', name: 'Christmas', motifs: ['snowflake', 'tree', 'gift', 'ornament', 'candycane', 'star'], layout: 'tossed', palette: 'christmas', background: '#F7F1E6' },
  { id: 'halloween', name: 'Halloween', motifs: ['pumpkin', 'ghost', 'bat', 'spider', 'moon', 'witchHat'], layout: 'tossed', palette: 'halloween', background: '#26203A' },
  { id: 'tropical', name: 'Tropical', motifs: ['monstera', 'hibiscus', 'palm', 'pineapple', 'leaf'], layout: 'random', palette: 'tropical', background: '#FFF4E3' },
  { id: 'retro', name: 'Retro', motifs: ['starburst', 'flowerPower', 'sparkle', 'cherry', 'semicircle'], layout: 'halfdrop', palette: 'autumn', background: '#F6E8CF' },
  { id: 'scandinavian', name: 'Scandinavian', motifs: ['scandiFlower', 'tulip', 'heart', 'leaf', 'triangle', 'dot'], layout: 'brick', palette: 'neutral', background: '#F7F4EF' },
  { id: 'islamic', name: 'Islamic', motifs: ['eightStar', 'quatrefoil', 'rosette', 'lattice'], layout: 'checker', palette: 'tropical', background: '#F4EEDF' },
  { id: 'indian', name: 'Indian Heritage', motifs: ['buta', 'mughalFlower', 'lotusBloom', 'marigold', 'peacock', 'royalElephant', 'rangoli', 'mihrab', 'paisley'], layout: 'halfdrop', palette: 'mughal', background: '#F3E9D2' },
  { id: 'handdrawn', name: 'Hand-drawn', motifs: ['squiggle', 'scribble', 'sparkle', 'triDots', 'brush', 'leaf'], layout: 'tossed', palette: 'earth', background: '#FAF6EF' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryDef>;
