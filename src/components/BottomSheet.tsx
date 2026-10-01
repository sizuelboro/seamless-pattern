import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Mobile bottom sheet. Leaves the top of the canvas visible so changes are seen live. */
export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-40 md:hidden" role="dialog" aria-modal="false" aria-label={title}>
      <div className="absolute inset-0 bg-black/10" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-[56px] flex max-h-[62vh] animate-sheet-up flex-col rounded-t-2xl border-t border-ink-200 bg-white shadow-float dark:border-ink-800 dark:bg-ink-900">
        <div className="flex items-center justify-between px-4 pb-1 pt-2">
          <span className="absolute left-1/2 top-1.5 h-1 w-9 -translate-x-1/2 rounded-full bg-ink-200 dark:bg-ink-700" />
          <h2 className="pt-2 text-sm font-semibold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="mt-1 rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"><X className="h-4 w-4" /></button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
