import { useEffect, useRef, useState } from 'react';
import type { PatternState } from '../types/pattern';
import { renderThumbnail } from '../utils/canvas';

const cache = new Map<string, string>();
const queue: (() => void)[] = [];
let pumping = false;

function pump() {
  if (pumping) return;
  pumping = true;
  const step = () => {
    const job = queue.shift();
    if (!job) { pumping = false; return; }
    job();
    setTimeout(step, 0); // yield between thumbnails so the UI stays responsive
  };
  setTimeout(step, 0);
}

/** Lazily renders and caches a tiled thumbnail for a pattern state. */
export function useThumbnail(key: string, build: () => PatternState, size = 240, repeat = 2): string | null {
  const cacheKey = `${key}@${size}x${repeat}`;
  const [url, setUrl] = useState<string | null>(() => cache.get(cacheKey) ?? null);
  const buildRef = useRef(build);
  buildRef.current = build;
  useEffect(() => {
    const hit = cache.get(cacheKey);
    if (hit) { setUrl(hit); return; }
    let alive = true;
    queue.push(() => {
      if (!alive) return;
      try {
        const u = renderThumbnail(buildRef.current(), size, repeat);
        cache.set(cacheKey, u);
        if (alive) setUrl(u);
      } catch { /* thumbnail failures are non-fatal */ }
    });
    pump();
    return () => { alive = false; };
  }, [cacheKey, size, repeat]);
  return url;
}
