import { useCallback, useState } from 'react';

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns an error message on failure (e.g. quota exceeded) instead of throwing. */
export function writeStorage(key: string, value: unknown): string | null {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return null;
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
    return quota
      ? 'Browser storage is full. Delete a few saved patterns and try again.'
      : 'Your browser blocked local storage, so patterns can’t be saved here.';
  }
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback));
  const set = useCallback((next: T | ((p: T) => T)) => {
    let error: string | null = null;
    setValue((prev) => {
      const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      error = writeStorage(key, v);
      return error ? prev : v;
    });
    return error;
  }, [key]);
  return [value, set] as const;
}
