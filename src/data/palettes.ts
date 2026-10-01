export interface PalettePreset { id: string; name: string; colors: string[] }

export const PALETTES: PalettePreset[] = [
  { id: 'meadow', name: 'Meadow', colors: ['#6B8E72', '#E8A598', '#F2C66D', '#3F5B47', '#A9C2A0'] },
  { id: 'pastel', name: 'Pastel', colors: ['#F4B6C2', '#B8D8E8', '#F9E0A8', '#C5B4E3', '#B5E0C9'] },
  { id: 'earth', name: 'Earth', colors: ['#B5643C', '#D9A066', '#6E7B4F', '#3E3328', '#E8D3B0'] },
  { id: 'neutral', name: 'Neutral', colors: ['#C8B6A6', '#8D7B68', '#E7DCCF', '#4B4237'] },
  { id: 'vintage', name: 'Vintage', colors: ['#C9705B', '#E3B778', '#7E9A8B', '#4A5A63', '#EED9C4'] },
  { id: 'tropical', name: 'Tropical', colors: ['#1F8A70', '#FF6F59', '#FFC145', '#00596B', '#7BD389'] },
  { id: 'monochrome', name: 'Monochrome', colors: ['#2B2B2B', '#5E5E5E', '#9A9A9A', '#D0D0D0'] },
  { id: 'candy', name: 'Candy', colors: ['#FF7AA2', '#FFC75F', '#7DD3FC', '#C084FC', '#FF9671'] },
  { id: 'autumn', name: 'Autumn', colors: ['#C2502E', '#E8963F', '#8C5E3C', '#5B3A29', '#D9B26F'] },
  { id: 'christmas', name: 'Christmas', colors: ['#C0392B', '#1E6F50', '#E5B94E', '#F4EFE6', '#0F3D2E'] },
  { id: 'wedding', name: 'Wedding', colors: ['#E8C4C0', '#C9A66B', '#9DB4A0', '#F6EEE6', '#7A6A5A'] },
  { id: 'halloween', name: 'Halloween', colors: ['#F28C28', '#7B4AA3', '#F6E7C1', '#1A1423', '#4E8A3E'] },
];

export const BACKGROUND_PRESETS: { name: string; color: string }[] = [
  { name: 'White', color: '#FFFFFF' },
  { name: 'Cream', color: '#FBF4E6' },
  { name: 'Beige', color: '#EADBC8' },
  { name: 'Black', color: '#151515' },
  { name: 'Navy', color: '#1C2A44' },
  { name: 'Pink', color: '#F8DCE0' },
  { name: 'Sage', color: '#C9D6C1' },
  { name: 'Terracotta', color: '#C8664B' },
  { name: 'Lavender', color: '#DCD3EE' },
  { name: 'Blue', color: '#CFE1F2' },
];
