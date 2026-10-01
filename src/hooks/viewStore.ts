import { useSyncExternalStore } from 'react';

/**
 * Canvas view state (zoom/pan) lives outside React so wheel/drag interactions never
 * re-render the editor. Only small subscribers (e.g. the zoom readout) re-render.
 */
type Listener = () => void;

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

const state: ViewState = { zoom: 0.25, panX: 0, panY: 0 };
const listeners = new Set<Listener>();
let snapshotZoom = state.zoom;
let commands: { fit: () => void; zoomBy: (f: number) => void; setZoom: (z: number) => void } | null = null;

export const viewStore = {
  get: () => state,
  set(patch: Partial<ViewState>) {
    Object.assign(state, patch);
    if (state.zoom !== snapshotZoom) snapshotZoom = state.zoom;
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
  register(c: typeof commands) { commands = c; },
  fit: () => commands?.fit(),
  zoomBy: (f: number) => commands?.zoomBy(f),
  setZoom: (z: number) => commands?.setZoom(z),
};

export function useZoom(): number {
  return useSyncExternalStore(viewStore.subscribe, () => snapshotZoom);
}
