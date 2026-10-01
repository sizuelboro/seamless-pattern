import { useCallback } from 'react';
import type { PatternState, SavedPattern } from '../types/pattern';
import { useLocalStorage } from './useLocalStorage';
import { renderThumbnail } from '../utils/canvas';

const KEY = 'patternforge.saved.v1';
const uid = () => `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Saved patterns persisted in localStorage. Each mutation returns an error message or null. */
export function useSavedPatterns() {
  const [items, setItems] = useLocalStorage<SavedPattern[]>(KEY, []);

  const save = useCallback((state: PatternState, id: string | null): { id: string; error: string | null } => {
    const thumbnail = renderThumbnail(state, 320, 2, 'image/jpeg');
    const now = Date.now();
    const finalId = id ?? uid();
    const error = setItems((list) => {
      const existing = list.find((p) => p.id === finalId);
      if (existing) return list.map((p) => (p.id === finalId ? { ...p, name: state.name, state, thumbnail, updatedAt: now } : p));
      return [{ id: finalId, name: state.name, state, thumbnail, createdAt: now, updatedAt: now }, ...list];
    });
    return { id: finalId, error };
  }, [setItems]);

  const rename = useCallback((id: string, name: string) =>
    setItems((list) => list.map((p) => (p.id === id ? { ...p, name, state: { ...p.state, name }, updatedAt: Date.now() } : p))), [setItems]);

  const duplicate = useCallback((id: string) => setItems((list) => {
    const src = list.find((p) => p.id === id);
    if (!src) return list;
    const now = Date.now();
    const name = `${src.name} copy`;
    const idx = list.indexOf(src);
    const copy: SavedPattern = { ...src, id: uid(), name, state: { ...src.state, name }, createdAt: now, updatedAt: now };
    return [...list.slice(0, idx), copy, ...list.slice(idx)];
  }), [setItems]);

  const remove = useCallback((id: string) => setItems((list) => list.filter((p) => p.id !== id)), [setItems]);

  return { items, save, rename, duplicate, remove };
}
