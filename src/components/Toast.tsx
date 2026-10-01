import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type Kind = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; kind: Kind; detail?: string }
interface ToastApi { show: (message: string, kind?: Kind, detail?: string) => void }

const Ctx = createContext<ToastApi>({ show: () => undefined });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const show = useCallback((message: string, kind: Kind = 'success', detail?: string) => {
    const id = ++idRef.current;
    setItems((l) => [...l.filter((t) => t.message !== message).slice(-3), { id, message, kind, detail }]);
    setTimeout(() => dismiss(id), kind === 'error' ? 5200 : 2400);
  }, [dismiss]);
  const api = useMemo(() => ({ show }), [show]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-14 md:right-4 md:items-end">
        {items.map((t) => (
          <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex max-w-md animate-toast-in items-start gap-2.5 rounded-xl bg-ink-900 px-3.5 py-2.5 text-[13px] text-white shadow-float dark:bg-white dark:text-ink-900">
            {t.kind === 'success' && <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-400 dark:text-emerald-600" />}
            {t.kind === 'error' && <AlertCircle className="mt-px h-4 w-4 shrink-0 text-rose-400 dark:text-rose-600" />}
            {t.kind === 'info' && <Info className="mt-px h-4 w-4 shrink-0 text-sky-300 dark:text-sky-600" />}
            <div className="min-w-0">
              <div className="font-medium">{t.message}</div>
              {t.detail && <div className="mt-0.5 text-xs opacity-70">{t.detail}</div>}
            </div>
            <button aria-label="Dismiss notification" onClick={() => dismiss(t.id)} className="-mr-1 ml-1 rounded p-0.5 opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
