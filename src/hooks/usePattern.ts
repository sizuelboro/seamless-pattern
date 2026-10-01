import { useMemo } from 'react';
import type { Background, GenerationSettings, GeoSettings, GeoStyle, PatternObject, PatternState } from '../types/pattern';
import { DEFAULT_GEO, GEO_STYLES, GEO_MAP, GEO_ACCENTS, geoWithStyle, geoAnchors } from '../engine/geoPattern';
import { useHistory } from './useHistory';
import { generatePattern } from '../engine/patternGenerator';
import { createRng, mod, randomSeed } from '../engine/random';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { PALETTES, BACKGROUND_PRESETS } from '../data/palettes';
import { stateFromPreset, type PresetDef } from '../data/presets';
import type { LayoutMode, RotationMode } from '../types/pattern';
import { randomPalette } from '../utils/colors';

const GEN_KEYS: (keyof GenerationSettings)[] = [
  'category', 'motifs', 'layout', 'density', 'scale', 'rotationMode', 'rotationMin', 'rotationMax',
  'spacing', 'variation', 'opacity', 'seed', 'stripeDirection', 'colorMode', 'motifColors', 'tileWidth', 'tileHeight',
];

/** Motif anchors from the geometric base, used by the "Fit base" layout. */
export function anchorsFor(state: Pick<PatternState, 'geo'>, settings: GenerationSettings) {
  if (settings.layout !== 'cells' || !state.geo?.enabled) return undefined;
  return geoAnchors(state.geo, settings.tileWidth, settings.tileHeight);
}

/** Regenerate after a geo change when motifs are fitted to the base. */
function regenIfFitted(s: PatternState): PatternState {
  if (s.settings.layout !== 'cells') return s;
  return { ...s, objects: generatePattern(s.settings, s.objects, anchorsFor(s, s.settings)), edited: false };
}

/** Apply settings and deterministically regenerate motifs (locked motifs survive). */
export function withSettings(state: PatternState, patch: Partial<GenerationSettings>): PatternState {
  const settings = { ...state.settings, ...patch };
  const changed = GEN_KEYS.some((k) => settings[k] !== state.settings[k]);
  if (!changed) return state;
  let keep = state.objects;
  // Changing tile size rescales locked motifs proportionally so they stay in place.
  if (patch.tileWidth || patch.tileHeight) {
    const sx = settings.tileWidth / state.settings.tileWidth, sy = settings.tileHeight / state.settings.tileHeight;
    const k = Math.sqrt(sx * sy);
    keep = keep.map((o) => (o.locked ? { ...o, x: o.x * sx, y: o.y * sy, width: o.width * k, height: o.height * k } : o));
  }
  return { ...state, settings, objects: generatePattern(settings, keep, anchorsFor(state, settings)), edited: false };
}

const LAYOUTS: LayoutMode[] = ['random', 'grid', 'brick', 'hex', 'halfdrop', 'mirror', 'radial', 'tossed', 'stripe', 'checker', 'cells'];
const ROTATIONS: RotationMode[] = ['random', '0', '45', '90', '180', 'custom'];

export function randomGeo(paletteSize: number, avoid?: GeoStyle): GeoSettings {
  const rng = createRng(randomSeed());
  const styles = GEO_STYLES.filter((g) => g.id !== avoid);
  const meta = rng.pick(styles);
  const idx = rng.shuffle(Array.from({ length: Math.max(2, paletteSize) }, (_, i) => i));
  const base = rng.chance(0.5) ? -1 : idx[idx.length - 1];
  const d = meta.defaults;
  return {
    ...DEFAULT_GEO, enabled: true, style: meta.id,
    repeat: Math.max(2, Math.round((d.repeat ?? 6) * rng.range(0.6, 1.5))),
    aspect: Math.round((d.aspect ?? 1) * (rng.chance(0.3) ? rng.pick([0.5, 1.5, 2]) : 1) * 100) / 100,
    weight: meta.id === 'harlequin' || meta.id === 'argyle' ? rng.pick([100, 100, 80]) : rng.int(25, 65),
    colors: [base, idx[0], idx[1 % idx.length], idx[2 % idx.length], idx[3 % idx.length]],
    accent: meta.accent && rng.chance(0.45) ? rng.pick(GEO_ACCENTS.filter((a) => a.id !== 'none')).id : 'none',
    rotate: !!meta.rotate && rng.chance(0.3),
    outline: !!GEO_MAP[meta.id].outline && rng.chance(0.45),
  };
}

export function usePattern(initial: () => PatternState) {
  const history = useHistory<PatternState>(initial, 50);
  const { set } = history;

  const actions = useMemo(() => ({
    updateSettings: (patch: Partial<GenerationSettings>, coalesce?: string) =>
      set((s) => withSettings(s, patch), { coalesce }),

    setName: (name: string) => set((s) => ({ ...s, name }), { coalesce: 'name' }),

    setPalette: (palette: string[], coalesce?: string) => set((s) => ({ ...s, palette }), { coalesce }),

    setBackground: (patch: Partial<Background>, coalesce?: string) =>
      set((s) => ({ ...s, background: { ...s.background, ...patch } }), { coalesce }),

    /** Same motifs, different colour assignment: permute the palette order. */
    shuffleColors: () => set((s) => {
      if (s.palette.length < 2) return s;
      const rng = createRng(randomSeed());
      let next = s.palette;
      for (let tries = 0; tries < 8 && next.join() === s.palette.join(); tries++) next = rng.shuffle([...s.palette]);
      return { ...s, palette: next };
    }),

    selectCategory: (id: GenerationSettings['category']) => set((s) => {
      const cat = CATEGORY_MAP[id];
      return withSettings({ ...s, presetId: null }, { category: id, motifs: [...cat.motifs], motifColors: undefined, colorMode: 'mixed' });
    }),

    toggleMotif: (type: string) => set((s) => {
      const has = s.settings.motifs.includes(type);
      const motifs = has ? s.settings.motifs.filter((m) => m !== type) : [...s.settings.motifs, type];
      return withSettings(s, { motifs });
    }),

    setMotifs: (motifs: string[]) => set((s) => withSettings(s, { motifs })),

    /** Randomize arrangement only — keeps pattern type, palette and canvas size. */
    randomize: () => set((s) => {
      const rng = createRng(randomSeed());
      return withSettings(s, {
        seed: randomSeed(),
        layout: rng.pick(LAYOUTS.filter((l) => (l !== 'checker' || s.settings.motifs.length > 1) && (l !== 'cells' || !!s.geo?.enabled))),
        rotationMode: rng.pick(ROTATIONS),
        rotationMin: -rng.int(5, 45), rotationMax: rng.int(5, 45),
        variation: rng.int(10, 70),
        density: rng.int(40, 90),
        scale: rng.int(70, 140),
      });
    }),

    randomizeEverything: () => set((s) => {
      const rng = createRng(randomSeed());
      const cat = rng.pick(CATEGORIES);
      const palette = rng.chance(0.6) ? [...rng.pick(PALETTES).colors] : randomPalette(rng, rng.int(3, 5));
      const bgPick = rng.chance(0.75) ? rng.pick(BACKGROUND_PRESETS.filter((b) => b.name !== 'Black' && b.name !== 'Navy')).color : rng.pick(BACKGROUND_PRESETS).color;
      const motifs = rng.shuffle([...cat.motifs]).slice(0, rng.int(Math.min(3, cat.motifs.length), cat.motifs.length));
      const geoOn = rng.chance(0.35);
      const next = withSettings({ ...s, presetId: null, name: 'Untitled pattern', palette, geo: geoOn ? randomGeo(palette.length) : { ...(s.geo ?? DEFAULT_GEO), enabled: false }, showMotifs: geoOn ? rng.chance(0.4) : true, background: { ...s.background, type: 'solid', color: bgPick } }, {
        category: cat.id, motifs, colorMode: 'mixed', motifColors: undefined,
        seed: randomSeed(), layout: rng.pick(LAYOUTS.filter((l) => l !== 'cells' || geoOn)), rotationMode: rng.pick(ROTATIONS),
        rotationMin: -rng.int(5, 45), rotationMax: rng.int(5, 45),
        variation: rng.int(10, 70), density: rng.int(45, 90), scale: rng.int(70, 140), spacing: rng.int(0, 80),
      });
      return next;
    }),

    setGeo: (patch: Partial<GeoSettings>, coalesce?: string) =>
      set((s) => regenIfFitted({ ...s, geo: { ...(s.geo ?? DEFAULT_GEO), ...patch } }), { coalesce }),

    setGeoStyle: (style: GeoStyle) => set((s) => regenIfFitted({ ...s, geo: geoWithStyle({ ...(s.geo ?? DEFAULT_GEO), enabled: true }, style) })),

    setShowMotifs: (on: boolean) => set((s) => ({ ...s, showMotifs: on })),

    /** New random geometric look: style, proportions, accent and colour slots. */
    randomizeGeo: () => set((s) => regenIfFitted({ ...s, geo: randomGeo(s.palette.length, s.geo?.style) })),

    regenerate: () => set((s) => ({ ...s, objects: generatePattern(s.settings, s.objects, anchorsFor(s, s.settings)), edited: false })),

    loadPreset: (p: PresetDef) => set((s) => {
      const fresh = stateFromPreset(p, { tileWidth: s.settings.tileWidth, tileHeight: s.settings.tileHeight });
      return fresh;
    }),

    updateObject: (id: string, patch: Partial<PatternObject>, coalesce?: string) => set((s) => {
      const W = s.settings.tileWidth, H = s.settings.tileHeight;
      return {
        ...s, edited: true,
        objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch, x: mod(patch.x ?? o.x, W), y: mod(patch.y ?? o.y, H), manual: true } : o)),
      };
    }, { coalesce }),

    deleteObject: (id: string) => set((s) => ({ ...s, edited: true, objects: s.objects.filter((o) => o.id !== id || o.locked) })),

    duplicateObject: (id: string): string => {
      const newId = `m${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
      set((s) => {
        const o = s.objects.find((x) => x.id === id);
        if (!o) return s;
        const W = s.settings.tileWidth, H = s.settings.tileHeight;
        const off = o.width * o.scale * 0.6;
        return { ...s, edited: true, objects: [...s.objects, { ...o, id: newId, x: mod(o.x + off, W), y: mod(o.y + off, H), locked: false, manual: true }] };
      });
      return newId;
    },

    toggleHidden: (type: string) => set((s) => ({
      ...s, hiddenTypes: s.hiddenTypes.includes(type) ? s.hiddenTypes.filter((t) => t !== type) : [...s.hiddenTypes, type],
    })),
  }), [set]);

  return { ...history, actions };
}

export type PatternActions = ReturnType<typeof usePattern>['actions'];
