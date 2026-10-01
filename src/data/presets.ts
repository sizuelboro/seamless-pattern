import { generatePattern } from '../engine/patternGenerator';
import type { Background, GenerationSettings, GeoSettings, PatternState, TextureSettings } from '../types/pattern';
import { DEFAULT_GEO, geoAnchors } from '../engine/geoPattern';
import { DEFAULT_TEXTURE } from '../engine/textureEngine';

export interface PresetDef {
  id: string;
  name: string;
  description: string;
  palette: string[];
  background: Background;
  settings: Partial<GenerationSettings> & Pick<GenerationSettings, 'category' | 'motifs' | 'layout'>;
  geo?: Partial<GeoSettings>;
  showMotifs?: boolean;
  tag?: 'geometric' | 'indian' | 'chintz' | 'bodo';
  texture?: Partial<TextureSettings>;
}

const NOSTALGIA = ['#6E2B33', '#E3A7B4', '#A8C0D2', '#6F7D4C', '#F1E4CE'];
const geoOnly: PresetDef['settings'] = { category: 'geometric', motifs: ['dot'], layout: 'grid' };

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

PRESETS.push(
  {
    id: 'geo-harlequin', name: 'Harlequin Parlour', description: 'Powder-blue diamonds with tiny sparkles.', tag: 'geometric',
    palette: ['#6E2B33', '#A8C0D2', '#F1E4CE', '#E3A7B4'], background: solid('#6E2B33'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'harlequin', repeat: 6, aspect: 1.5, weight: 100, colors: [-1, 1, 0, 2, 3], accent: 'sparkle' },
  },
  {
    id: 'geo-bistro-gingham', name: 'Bistro Gingham', description: 'Sage and blush picnic weave.', tag: 'geometric',
    palette: ['#C9D3B4', '#6F7D4C', '#F3D3D3', '#6E2B33'], background: solid('#F3D3D3'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'gingham', repeat: 10, aspect: 1, weight: 50, colors: [-1, 0, 1, 3, 2] },
  },
  {
    id: 'geo-candy-stripe', name: 'Candy Pinstripe', description: 'Dusty pink bands with maroon pinlines.', tag: 'geometric',
    palette: NOSTALGIA, background: solid('#F1E4CE'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'pinstripe', repeat: 7, aspect: 1, weight: 42, colors: [-1, 1, 0, 0, 2] },
  },
  {
    id: 'geo-tartan', name: 'Fireside Tartan', description: 'Burgundy plaid with blush double lines.', tag: 'geometric',
    palette: ['#5A2229', '#8E3F48', '#E3A7B4', '#F1E4CE'], background: solid('#5A2229'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'plaid', repeat: 4, aspect: 1, weight: 34, colors: [-1, 1, 2, 3, 0], outline: true },
  },
  {
    id: 'geo-stretched-check', name: 'Stretched Check', description: 'Tall blue and maroon checks.', tag: 'geometric',
    palette: NOSTALGIA, background: solid('#A8C0D2'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'check', repeat: 8, aspect: 2.2, weight: 50, colors: [-1, 0, 4, 4, 2] },
  },
  {
    id: 'geo-argyle', name: 'Argyle Club', description: 'Lilac argyle with cream stitching.', tag: 'geometric',
    palette: ['#5A2229', '#9C8BC4', '#F1E4CE', '#E3A7B4'], background: solid('#5A2229'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'argyle', repeat: 4, aspect: 1.4, weight: 100, colors: [-1, 1, 2, 3, 0] },
  },
  {
    id: 'geo-chevron', name: 'Retro Chevron', description: 'Rust and pink zig-zags.', tag: 'geometric',
    palette: ['#C8664B', '#E9B2B8', '#6E2B33', '#F1E4CE'], background: solid('#E9B2B8'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'chevron', repeat: 6, aspect: 0.6, weight: 50, colors: [-1, 0, 2, 3, 1], outline: true },
  },
  {
    id: 'geo-scallop', name: 'Mermaid Scales', description: 'Two-tone scallops with cream edges.', tag: 'geometric',
    palette: ['#A8C0D2', '#F1E4CE', '#6E2B33', '#E3A7B4'], background: solid('#F1E4CE'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'scallop', repeat: 8, aspect: 1, weight: 25, colors: [-1, 0, 2, 1, 3], outline: true },
  },
  {
    id: 'geo-starry-check', name: 'Starry Checks', description: 'Checks with tossed stars on top.', tag: 'geometric',
    palette: ['#1C2A44', '#F3C969', '#2A3C5E', '#F1E4CE'], background: solid('#1C2A44'), showMotifs: true,
    settings: { category: 'minimal', motifs: ['star', 'sparkle'], layout: 'tossed', colorMode: 'byMotif', motifColors: { star: [1], sparkle: [3] }, density: 35, scale: 55, variation: 35, seed: 424242 },
    geo: { style: 'check', repeat: 6, aspect: 1, weight: 50, colors: [-1, 2, 3, 3, 1] },
  },
  {
    id: 'geo-polka', name: 'Cherry Polka', description: 'Half-drop polka with rings.', tag: 'geometric',
    palette: ['#C2473B', '#F7EEDC', '#6E2B33', '#5E7A45'], background: solid('#F7EEDC'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'dots', repeat: 7, aspect: 1, weight: 55, colors: [-1, 0, 2, 3, 3], outline: true },
  },
);

const INDIAN = (p: Omit<PresetDef, 'tag'>): PresetDef => ({ ...p, tag: 'indian' });
PRESETS.push(
  INDIAN({
    id: 'in-mughal-garden', name: 'Mughal Garden', description: 'Onion-arch trellis with a flower in every arch.',
    palette: ['#B5532F', '#1F5E4A', '#E3A33B', '#2B3A67', '#F3E9D2'], background: solid('#F3E9D2'), showMotifs: true,
    settings: { category: 'indian', motifs: ['mughalFlower'], layout: 'cells', colorMode: 'byMotif', motifColors: { mughalFlower: [0, 3, 1] }, rotationMode: '0', variation: 0, scale: 120, seed: 1601 },
    geo: { style: 'ogee', repeat: 5, aspect: 1.35, weight: 40, colors: [-1, 1, 2, 0, 3], outline: true },
  }),
  INDIAN({
    id: 'in-royal-elephants', name: 'Royal Elephants', description: 'Caparisoned elephants with marigolds on crimson.',
    palette: ['#8E1B1B', '#D4A23A', '#1E3F5A', '#C8553D', '#F4E3C1'], background: solid('#8E1B1B'), showMotifs: true,
    settings: { category: 'indian', motifs: ['royalElephant', 'marigold', 'smallFlower'], layout: 'halfdrop', colorMode: 'byMotif', motifColors: { royalElephant: [1, 4], marigold: [3, 1], smallFlower: [4] }, rotationMode: '0', density: 45, scale: 160, variation: 15, seed: 1602 },
  }),
  INDIAN({
    id: 'in-paisley-buta', name: 'Paisley Buta', description: 'Classic tossed paisley butas on ivory.',
    palette: ['#7A2E1F', '#2F3B5C', '#C99A3B', '#E9DCC0', '#4F6B3A'], background: solid('#F6EEDC'), showMotifs: true,
    settings: { category: 'indian', motifs: ['buta', 'kairi', 'smallFlower'], layout: 'tossed', colorMode: 'byMotif', motifColors: { buta: [0, 1, 4], kairi: [1, 2, 0], smallFlower: [2, 0] }, rotationMode: 'random', rotationMin: -30, rotationMax: 30, density: 60, scale: 135, variation: 30, seed: 1603 },
  }),
  INDIAN({
    id: 'in-peacock-court', name: 'Peacock Court', description: 'Peacocks and lotus blooms in teal and gold.',
    palette: ['#0F6E73', '#1B3B6F', '#D9A441', '#F5EBDD', '#7FB069'], background: solid('#F5EBDD'), showMotifs: true,
    settings: { category: 'indian', motifs: ['peacock', 'lotusBloom', 'buta'], layout: 'brick', colorMode: 'byMotif', motifColors: { peacock: [0, 1], lotusBloom: [1, 0, 4], buta: [2, 0] }, rotationMode: '0', density: 50, scale: 150, variation: 15, seed: 1604 },
  }),
  INDIAN({
    id: 'in-jaipur-block', name: 'Jaipur Block Print', description: 'Hand-block mihrab arches in rows.',
    palette: ['#A3242C', '#2F3B5C', '#C99A3B', '#F2EBDD', '#4F6B3A'], background: solid('#F2EBDD'), showMotifs: true,
    settings: { category: 'indian', motifs: ['mihrab', 'smallFlower'], layout: 'halfdrop', colorMode: 'byMotif', motifColors: { mihrab: [0, 1], smallFlower: [2] }, rotationMode: '0', density: 50, scale: 150, variation: 10, seed: 1605 },
  }),
  INDIAN({
    id: 'in-ajrakh-star', name: 'Ajrakh Star', description: 'Indigo jali screen with crimson Ajrakh stars.',
    palette: ['#1E2A4A', '#A3242C', '#111111', '#F2EBDD', '#C9A227'], background: solid('#1E2A4A'), showMotifs: true,
    settings: { category: 'indian', motifs: ['ajrakhStar'], layout: 'cells', colorMode: 'byMotif', motifColors: { ajrakhStar: [3, 4] }, rotationMode: '0', variation: 0, scale: 70, seed: 1606 },
    geo: { style: 'jali', repeat: 6, aspect: 1, weight: 80, colors: [-1, 1, 4, 3, 2] },
  }),
  INDIAN({
    id: 'in-bandhani-red', name: 'Bandhani Red', description: 'Tie-dye dot clusters on festive red.',
    palette: ['#B3122E', '#F4E3C1', '#F2B705', '#2F6B3A', '#111111'], background: solid('#B3122E'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'bandhani', repeat: 7, aspect: 1, weight: 55, colors: [-1, 1, 2, 3, 3], outline: true },
  }),
  INDIAN({
    id: 'in-ikat-indigo', name: 'Ikat Indigo', description: 'Feathered ikat diamonds in indigo and ivory.',
    palette: ['#1E2A4A', '#F2EBDD', '#A3242C', '#C9A227', '#4F6B3A'], background: solid('#1E2A4A'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'ikat', repeat: 5, aspect: 1.6, weight: 85, colors: [-1, 1, 2, 3, 3] },
  }),
  INDIAN({
    id: 'in-festive-diya', name: 'Festive Diya', description: 'Diyas, rangoli and marigolds for Diwali.',
    palette: ['#F2B705', '#E86A33', '#FFF4D6', '#4C7A34', '#8C2F39'], background: solid('#5A1420'), showMotifs: true,
    settings: { category: 'indian', motifs: ['diya', 'rangoli', 'marigold'], layout: 'random', colorMode: 'mixed', rotationMode: '0', density: 55, scale: 125, variation: 25, seed: 1609 },
  }),
  INDIAN({
    id: 'in-ethnic-bands', name: 'Ethnic Bands', description: 'Temple, diamond and check borders in rows.',
    palette: ['#7A2E1F', '#C99A3B', '#2F3B5C', '#E9DCC0', '#4F6B3A'], background: solid('#E9DCC0'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'bands', repeat: 6, aspect: 1.2, weight: 60, colors: [-1, 0, 1, 2, 3] },
  }),
  INDIAN({
    id: 'in-kolam', name: 'Kolam', description: 'South-Indian kolam and rangoli on ivory.',
    palette: ['#8C2F39', '#F2B705', '#1B3B6F', '#FFF4D6', '#4C7A34'], background: solid('#FFF4D6'), showMotifs: true,
    settings: { category: 'indian', motifs: ['kolam', 'rangoli', 'lotusTop'], layout: 'grid', colorMode: 'byMotif', motifColors: { kolam: [0, 2], rangoli: [0, 1, 2], lotusTop: [4, 1, 0] }, rotationMode: '0', density: 55, scale: 130, variation: 10, seed: 1611 },
  }),
);

const CH = (p: Omit<PresetDef, 'tag'>): PresetDef => ({ ...p, tag: 'chintz' });
PRESETS.push(
  CH({
    id: 'ch-chintz-garden', name: 'Chintz Garden', description: 'Fan flowers and exotic blooms on a winding vine.',
    palette: ['#D9483B', '#3E6E8E', '#6E8B4E', '#E8A65D', '#6B4A3A'], background: solid('#FBF3E6'), showMotifs: true,
    settings: { category: 'chintz', motifs: ['chintzFan', 'chintzRosette', 'chintzPeony', 'chintzLeaf', 'berrySprig', 'chintzBud'], layout: 'vine', colorMode: 'byMotif', motifColors: { chintzFan: [0], chintzRosette: [1], chintzPeony: [3, 0], chintzLeaf: [2], berrySprig: [0, 1], chintzBud: [0, 3] }, rotationMode: '0', density: 65, scale: 100, variation: 35, vineWidth: 35, vineCurl: 60, vineColor: 4, seed: 7101 },
  }),
  CH({
    id: 'ch-jacobean', name: 'Jacobean Vine', description: 'Carnations, pomegranates and curling leaves.',
    palette: ['#E25B5B', '#E9C46A', '#7FA88E', '#3D6E7A', '#F1E6D2'], background: solid('#F6EEDF'), showMotifs: true,
    settings: { category: 'chintz', motifs: ['carnation', 'pomegranate', 'chintzRosette', 'curlLeaf', 'chintzLeaf', 'chintzBud'], layout: 'vine', colorMode: 'byMotif', motifColors: { carnation: [0], pomegranate: [0, 3], chintzRosette: [3], curlLeaf: [2, 3], chintzLeaf: [2], chintzBud: [1, 0] }, rotationMode: '0', density: 60, scale: 105, variation: 30, vineWidth: 30, vineCurl: 75, vineColor: 3, seed: 7102 },
  }),
  CH({
    id: 'ch-indigo-linen', name: 'Indigo Linen Chintz', description: 'Ivory vine flowers on indigo, linen texture.',
    palette: ['#F3E9D8', '#E2A55B', '#9DB6A1', '#C9634B', '#D9CBB3'], background: solid('#22324F'), showMotifs: true,
    settings: { category: 'chintz', motifs: ['chintzPeony', 'chintzFan', 'chintzLeaf', 'berrySprig'], layout: 'vine', colorMode: 'byMotif', motifColors: { chintzPeony: [0, 3], chintzFan: [3], chintzLeaf: [2], berrySprig: [1] }, rotationMode: '0', density: 55, scale: 95, variation: 30, vineWidth: 30, vineCurl: 50, vineColor: 4, seed: 7103 },
    texture: { type: 'linen', amount: 45 },
  }),
  CH({
    id: 'ch-mulberry-block', name: 'Mulberry Block Print', description: 'One-colour florals and paisley, worn print.',
    palette: ['#8E2F55', '#E9DFC6'], background: solid('#E9DFC6'), showMotifs: true,
    settings: { category: 'chintz', motifs: ['damaskPaisley', 'chintzPeony', 'carnation', 'chintzBud', 'berrySprig', 'fernSprig'], layout: 'random', colorMode: 'byMotif', motifColors: { damaskPaisley: [0], chintzPeony: [0], carnation: [0], chintzBud: [0], berrySprig: [0], fernSprig: [0] }, rotationMode: 'custom', rotationMin: -35, rotationMax: 35, density: 92, scale: 135, variation: 45, seed: 7104 },
    texture: { type: 'distressed', amount: 60 },
  }),
  CH({
    id: 'ch-damask-paisley', name: 'Damask Paisley', description: 'Mirror-symmetric lotus and paisley in half-drop.',
    palette: ['#E8566C', '#7FA392', '#F2B33D', '#3E5C5A', '#F5F0E1'], background: solid('#ECEBDD'), showMotifs: true,
    settings: { category: 'chintz', motifs: ['damaskLotus', 'damaskPaisley', 'chintzBud', 'carnation', 'berrySprig'], layout: 'damask', colorMode: 'byMotif', motifColors: { damaskLotus: [0], damaskPaisley: [1], chintzBud: [0], carnation: [2], berrySprig: [0] }, density: 60, scale: 100, variation: 0, seed: 7105 },
  }),
  CH({
    id: 'ch-damask-mono', name: 'Mulberry Damask', description: 'Two-tone damask with fine paper grain.',
    palette: ['#5A1E36', '#E9DFC6'], background: solid('#E9DFC6'), showMotifs: true,
    settings: { category: 'chintz', motifs: ['damaskLotus', 'damaskPaisley', 'carnation', 'chintzBud', 'fernSprig'], layout: 'damask', colorMode: 'byMotif', motifColors: { damaskLotus: [0], damaskPaisley: [0], carnation: [0], chintzBud: [0], fernSprig: [0] }, density: 70, scale: 100, variation: 0, seed: 7106 },
    texture: { type: 'grain', amount: 50 },
  }),
  CH({
    id: 'ch-aztec-mono', name: 'Aztec Mono', description: 'Black and white tribal medallion bands.',
    palette: ['#111111', '#FFFFFF'], background: solid('#FFFFFF'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'aztec', repeat: 4, aspect: 1.7, weight: 70, colors: [-1, 0, 0, 0, 0] },
  }),
  CH({
    id: 'ch-aztec-mesa', name: 'Aztec Mesa', description: 'Terracotta, ochre and teal tribal bands on canvas.',
    palette: ['#1A1A1A', '#C2562F', '#E2B254', '#2F5D62', '#F4EBDD'], background: solid('#F4EBDD'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'aztec', repeat: 4, aspect: 1.7, weight: 70, colors: [-1, 1, 0, 2, 3] },
    texture: { type: 'canvas', amount: 40 },
  }),
  CH({
    id: 'ch-tribal-tossed', name: 'Tribal Motifs', description: 'Aztec diamonds, crosses and arrows.',
    palette: ['#C2562F', '#2F5D62', '#E2B254', '#1A1A1A', '#F4EBDD'], background: solid('#F4EBDD'), showMotifs: true,
    settings: { category: 'tribal', motifs: ['aztecDiamond', 'aztecCross', 'aztecArrow'], layout: 'halfdrop', colorMode: 'byMotif', motifColors: { aztecDiamond: [0, 1], aztecCross: [3], aztecArrow: [3, 0] }, rotationMode: '0', density: 55, scale: 110, variation: 0, seed: 7109 },
  }),
);

const BD = (p: Omit<PresetDef, 'tag'>): PresetDef => ({ ...p, tag: 'bodo' });
const DOKHONA = ['#F2B705', '#0F6B3A', '#C1121F', '#1B1B1B', '#FFF3D6'];
const ARONAI = ['#B3121F', '#F2C230', '#0F5132', '#111111', '#FFFFFF'];
PRESETS.push(
  BD({
    id: 'bd-agor-gubwi', name: 'Agor Gubwi Dokhona', description: 'The oldest dokhona agor: orange bands, green zigzags and purple dashes on yellow.',
    palette: ['#F2C21B', '#EE7A1A', '#2BA35A', '#5B3FA6', '#7FD3E6'], background: solid('#F2C21B'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'gubwi', repeat: 8, aspect: 2.5, weight: 60, colors: [-1, 1, 2, 3, 4], outline: true },
    texture: { type: 'linen', amount: 18 },
  }),
  BD({
    id: 'bd-makhri', name: 'Makhri Dokhona', description: 'Spider agor — linked floral diamonds in purple, green and red bands on orange.',
    palette: ['#F39A1E', '#6A2C91', '#1E9E6A', '#C2262E', '#FFE08A'], background: solid('#F39A1E'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'makhri', repeat: 16, aspect: 4.8, weight: 60, colors: [-1, 3, 2, 1, 4], outline: false },
  }),
  BD({
    id: 'bd-hajw-jwmbaigra', name: 'Hajw Jwmbaigra', description: 'Gold herringbone hills and eye medallions on royal blue, red butis in the field.',
    palette: ['#2B2FA8', '#E8C21A', '#D6204E', '#F06292', '#FFFFFF'], background: solid('#2B2FA8'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'hajw', repeat: 10, aspect: 4.8, weight: 60, colors: [-1, 1, 1, 1, 2], outline: true },
  }),
  BD({
    id: 'bd-dingkhia-bijou', name: 'Dingkhia Bijou', description: 'Gold fern fronds and round rosettes on jwmbaigra pink.',
    palette: ['#D3195A', '#E9C23A', '#F4D35E', '#7A0C2E', '#FFFFFF'], background: solid('#D3195A'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'dingkhia', repeat: 6, aspect: 4.33, weight: 30, colors: [-1, 1, 1, 1, 2], outline: true },
  }),
  BD({
    id: 'bd-khangkrikhola', name: 'Khangkrikhola', description: 'Navy teasel-gourd flower chains on natural cotton.',
    palette: ['#E9DDC8', '#1F3A4D', '#FFFFFF', '#8A9AA5', '#C9B79C'], background: solid('#E9DDC8'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'khangkri', repeat: 6, aspect: 0.75, weight: 60, colors: [-1, 1, 1, 2, 2] },
    texture: { type: 'linen', amount: 35 },
  }),
  BD({
    id: 'bd-agor-sampler', name: 'Agor Sampler', description: 'Fern, butterfly, tortoise back, spearhead and spider agors on dokhona yellow.',
    palette: DOKHONA, background: solid('#F2B705'), showMotifs: true,
    settings: { category: 'bodo', motifs: ['dingkhiaAgor', 'sikhriAgor', 'khaseoBikha', 'jongAgor', 'makhriAgor'], layout: 'halfdrop', colorMode: 'byMotif', motifColors: { dingkhiaAgor: [1, 2], sikhriAgor: [2, 1], khaseoBikha: [1, 2], jongAgor: [2, 1], makhriAgor: [3, 2] }, rotationMode: '0', density: 55, scale: 95, variation: 0, seed: 8131 },
  }),
  BD({
    id: 'bd-dao-birds', name: 'Dao Agor Birds', description: 'Woven birds with starfruit and sun agors on pink.',
    palette: ['#E0245E', '#3B2FC9', '#F2C230', '#FFFFFF', '#1B1B1B'], background: solid('#E0245E'), showMotifs: true,
    settings: { category: 'bodo', motifs: ['daoAgor', 'khamrenga', 'sanAgor'], layout: 'halfdrop', colorMode: 'byMotif', motifColors: { daoAgor: [1, 2], khamrenga: [3, 2], sanAgor: [2, 1] }, rotationMode: '0', density: 50, scale: 90, variation: 0, seed: 8132 },
  }),
);
const AR_ORANGE = ['#F07A12', '#0B5D2A', '#111111', '#C1121F', '#F2C230'];
const AR_YELLOW = ['#F6E31A', '#D62012', '#E8590C', '#111111', '#FFFFFF'];
PRESETS.push(
  BD({
    id: 'ar-aronai-print', name: 'Aronai Print', description: 'White aronai panel — fishbone teeth, sunburst medallions and paisleys on red.',
    palette: ARONAI, background: solid('#C8161D'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'aronai', repeat: 2, aspect: 1.1, weight: 60, colors: [-1, 4, 4, 4, 4], outline: true },
  }),
  BD({
    id: 'ar-aronai-gold', name: 'Aronai Gold', description: 'Gold and green aronai print on red.',
    palette: ARONAI, background: solid('#B3121F'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'aronai', repeat: 2, aspect: 1.1, weight: 70, colors: [-1, 1, 1, 4, 2], outline: true },
  }),
  BD({
    id: 'ar-weave-orange', name: 'Aronai Weave Orange', description: 'Green and black woven teeth and rosette chain on orange.',
    palette: AR_ORANGE, background: solid('#F07A12'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'aronaiweave', repeat: 2, aspect: 1, weight: 60, colors: [-1, 1, 2, 1, 2], outline: true },
    texture: { type: 'linen', amount: 30 },
  }),
  BD({
    id: 'ar-weave-yellow', name: 'Aronai Weave Yellow', description: 'Red woven aronai on bright yellow.',
    palette: AR_YELLOW, background: solid('#F6E31A'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'aronaiweave', repeat: 2, aspect: 1, weight: 80, colors: [-1, 1, 2, 1, 1], outline: true },
  }),
  BD({
    id: 'ar-motifs', name: 'Aronai Motifs', description: 'Sunbursts, paisleys and arrow stars tossed on red.',
    palette: ARONAI, background: solid('#B3121F'), showMotifs: true,
    settings: { category: 'bodo', motifs: ['aronaiSun', 'aronaiPaisley', 'aronaiArrow'], layout: 'halfdrop', colorMode: 'byMotif', motifColors: { aronaiSun: [1, 4], aronaiPaisley: [4, 1], aronaiArrow: [1, 4] }, rotationMode: '0', density: 55, scale: 100, variation: 0, seed: 8121 },
  }),
  BD({
    id: 'ar-weave-bands', name: 'Aronai Bands', description: 'Horizontal woven aronai bands, green on yellow.',
    palette: DOKHONA, background: solid('#F2B705'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'aronaiweave', repeat: 3, aspect: 1, weight: 50, colors: [-1, 1, 2, 2, 1], outline: true, rotate: true },
  }),
);
PRESETS.push(
  BD({
    id: 'bd-dokhona-yellow', name: 'Dokhona Yellow', description: 'Green and red agor border on festive yellow.',
    palette: DOKHONA, background: solid('#F2B705'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'agor', repeat: 6, aspect: 1.8, weight: 60, colors: [-1, 1, 2, 4, 1], outline: true },
  }),
  BD({
    id: 'bd-aronai-red', name: 'Aronai Red', description: 'Gold pigeon-eye border on aronai red.',
    palette: ARONAI, background: solid('#B3121F'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'agor', repeat: 5, aspect: 1.6, weight: 80, colors: [-1, 1, 2, 4, 1], outline: true },
  }),
  BD({
    id: 'bd-gamsa-white', name: 'Gamsa White', description: 'White gamsa with green and red border, woven texture.',
    palette: ['#FFFFFF', '#0F6B3A', '#C1121F', '#F2B705', '#1B1B1B'], background: solid('#FBFAF5'), showMotifs: false,
    settings: { ...geoOnly }, geo: { style: 'agor', repeat: 6, aspect: 2.2, weight: 40, colors: [-1, 1, 2, 3, 2], outline: true },
    texture: { type: 'linen', amount: 35 },
  }),
  BD({
    id: 'bd-green-dokhona', name: 'Bodo Green', description: 'Yellow agor on deep green with stars in the field.',
    palette: ['#0F6B3A', '#F5C518', '#D62828', '#F7F3E8', '#1B1B1B'], background: solid('#0F6B3A'), showMotifs: true,
    settings: { category: 'bodo', motifs: ['agorStar'], layout: 'cells', colorMode: 'byMotif', motifColors: { agorStar: [1] }, rotationMode: '0', variation: 0, scale: 70, seed: 8104 },
    geo: { style: 'agor', repeat: 5, aspect: 1.9, weight: 60, colors: [-1, 1, 2, 3, 1], outline: false },
  }),
  BD({
    id: 'bd-pharwo-megon', name: 'Pharwo Megon', description: 'Pigeon-eye diamonds and buti on yellow.',
    palette: DOKHONA, background: solid('#F2B705'), showMotifs: true,
    settings: { category: 'bodo', motifs: ['pharwoMegon', 'agorButi'], layout: 'halfdrop', colorMode: 'byMotif', motifColors: { pharwoMegon: [1], agorButi: [2] }, rotationMode: '0', density: 55, scale: 110, variation: 0, seed: 8105 },
  }),
  BD({
    id: 'bd-hajw-bwigri', name: 'Hajw & Bwigri', description: 'Hills, plum flowers and peacocks on cream.',
    palette: ARONAI, background: solid('#FFF3D6'), showMotifs: true,
    settings: { category: 'bodo', motifs: ['hajwAgor', 'bwigriBibar', 'daoraiAgor'], layout: 'brick', colorMode: 'byMotif', motifColors: { hajwAgor: [2], bwigriBibar: [0], daoraiAgor: [0, 2] }, rotationMode: '0', density: 55, scale: 110, variation: 0, seed: 8106 },
  }),
  BD({
    id: 'bd-woven-stripe', name: 'Agor Stripe', description: 'Diamond chains in woven rows, linen texture.',
    palette: ['#0F6B3A', '#F5C518', '#D62828', '#F7F3E8', '#1B1B1B'], background: solid('#F7F3E8'), showMotifs: true,
    settings: { category: 'bodo', motifs: ['agorChain', 'pharwoMegon'], layout: 'stripe', colorMode: 'byMotif', motifColors: { agorChain: [2], pharwoMegon: [0] }, rotationMode: '0', density: 60, scale: 100, variation: 0, seed: 8107 },
    texture: { type: 'linen', amount: 40 },
  }),
);

export const GALLERY_PRESETS = PRESETS.filter((p) => p.id !== 'botanical-meadow');
export const PRESET_MAP = Object.fromEntries(PRESETS.map((p) => [p.id, p]));

export function stateFromPreset(p: PresetDef, overrides: Partial<GenerationSettings> = {}): PatternState {
  const settings: GenerationSettings = { ...DEFAULT_SETTINGS, motifColors: undefined, ...p.settings, ...overrides };
  const geo = { ...DEFAULT_GEO, ...(p.geo ?? {}), enabled: !!p.geo };
  const anchors = settings.layout === 'cells' && geo.enabled ? geoAnchors(geo, settings.tileWidth, settings.tileHeight) : undefined;
  return {
    name: p.name,
    presetId: p.id,
    settings,
    palette: [...p.palette],
    background: { ...p.background },
    objects: generatePattern(settings, [], anchors),
    hiddenTypes: [],
    edited: false,
    geo,
    showMotifs: p.showMotifs ?? true,
    texture: { ...DEFAULT_TEXTURE, ...(p.texture ?? {}) },
  };
}

export const DEMO_PRESET = PRESETS[0];
export function createDemoState(): PatternState {
  return stateFromPreset(DEMO_PRESET);
}
