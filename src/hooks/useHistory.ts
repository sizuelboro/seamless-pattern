import { useCallback, useMemo, useState } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
  lastKey: string | null;
  lastTime: number;
}

export interface SetOptions {
  /** Consecutive updates with the same key within a short window merge into one undo step (slider drags). */
  coalesce?: string;
  /** Apply without recording an undo step. */
  silent?: boolean;
}

const COALESCE_MS = 900;

/** Lightweight undo/redo over plain state objects (no bitmaps). */
export function useHistory<T>(initial: () => T, limit = 50) {
  const [h, setH] = useState<HistoryState<T>>(() => ({ past: [], present: initial(), future: [], lastKey: null, lastTime: 0 }));

  const set = useCallback((updater: T | ((prev: T) => T), opts: SetOptions = {}) => {
    setH((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev.present) : updater;
      if (next === prev.present) return prev;
      const now = Date.now();
      if (opts.silent) return { ...prev, present: next };
      if (opts.coalesce && prev.lastKey === opts.coalesce && now - prev.lastTime < COALESCE_MS) {
        return { ...prev, present: next, future: [], lastTime: now };
      }
      const past = [...prev.past, prev.present];
      if (past.length > limit) past.splice(0, past.length - limit);
      return { past, present: next, future: [], lastKey: opts.coalesce ?? null, lastTime: now };
    });
  }, [limit]);

  const undo = useCallback(() => setH((prev) => {
    if (!prev.past.length) return prev;
    const present = prev.past[prev.past.length - 1];
    return { past: prev.past.slice(0, -1), present, future: [prev.present, ...prev.future], lastKey: null, lastTime: 0 };
  }), []);

  const redo = useCallback(() => setH((prev) => {
    if (!prev.future.length) return prev;
    const [present, ...future] = prev.future;
    return { past: [...prev.past, prev.present], present, future, lastKey: null, lastTime: 0 };
  }), []);

  /** Replace the document and clear history (opening a pattern). */
  const reset = useCallback((next: T) => setH({ past: [], present: next, future: [], lastKey: null, lastTime: 0 }), []);

  return useMemo(() => ({
    state: h.present, set, undo, redo, reset,
    canUndo: h.past.length > 0, canRedo: h.future.length > 0,
  }), [h, set, undo, redo, reset]);
}
