import { useState } from 'react';
import { Copy, Download, Pencil, Plus, Trash2 } from 'lucide-react';
import type { SavedPattern } from '../types/pattern';
import { Button, IconButton } from './ui';

interface Props {
  items: SavedPattern[];
  currentId: string | null;
  onOpen: (p: SavedPattern) => void;
  onExport: (p: SavedPattern) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const fmt = (t: number) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

function Card({ p, current, onOpen, onExport, onRename, onDuplicate, onDelete }: { p: SavedPattern; current: boolean } & Omit<Props, 'items' | 'currentId' | 'onNew'>) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p.name);
  const [confirm, setConfirm] = useState(false);
  const commit = () => { setEditing(false); const n = name.trim(); if (n && n !== p.name) onRename(p.id, n); else setName(p.name); };
  return (
    <div className="group overflow-hidden rounded-xl border border-ink-200/80 bg-white transition-all duration-200 hover:shadow-float dark:border-ink-800 dark:bg-ink-900">
      <button type="button" className="relative block aspect-square w-full overflow-hidden" onClick={() => onOpen(p)} aria-label={`Edit ${p.name}`}>
        <img src={p.thumbnail} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        {current && <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">Open</span>}
      </button>
      <div className="px-3 pb-2 pt-2.5">
        {editing ? (
          <input autoFocus className="input h-7" aria-label="Pattern name" value={name} onChange={(e) => setName(e.target.value)} onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setName(p.name); setEditing(false); } }} />
        ) : (
          <button type="button" onDoubleClick={() => setEditing(true)} onClick={() => setEditing(true)} title="Rename" className="block w-full truncate text-left text-[13px] font-semibold text-ink-900 dark:text-white">{p.name}</button>
        )}
        <div className="mt-0.5 text-[11px] text-ink-500">Edited {fmt(p.updatedAt)}</div>
        <div className="mt-2 flex items-center gap-0.5">
          {confirm ? (
            <div className="flex w-full items-center justify-between gap-1 animate-fade-in">
              <span className="text-[11px] text-ink-600 dark:text-ink-300">Delete pattern?</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(p.id)}>Delete</Button>
              </div>
            </div>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => onOpen(p)}><Pencil className="h-3 w-3" /> Edit</Button>
              <div className="ml-auto flex">
                <IconButton size="sm" label="Duplicate" tooltipSide="top" onClick={() => onDuplicate(p.id)}><Copy className="h-3.5 w-3.5" /></IconButton>
                <IconButton size="sm" label="Export" tooltipSide="top" onClick={() => onExport(p)}><Download className="h-3.5 w-3.5" /></IconButton>
                <IconButton size="sm" label="Delete" tooltipSide="top" onClick={() => setConfirm(true)}><Trash2 className="h-3.5 w-3.5" /></IconButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SavedPatterns(props: Props) {
  const { items, currentId, onNew } = props;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-white">My Patterns</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{items.length ? `${items.length} saved in this browser` : 'Patterns you save appear here. They’re stored privately in this browser.'}</p>
        </div>
        <Button variant="primary" onClick={onNew}><Plus className="h-4 w-4" /> New Pattern</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <button type="button" onClick={onNew} className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 text-ink-500 transition hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-700 dark:border-ink-800 dark:hover:border-brand-700 dark:hover:bg-brand-900/20 dark:hover:text-brand-200">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800"><Plus className="h-5 w-5" /></span>
          <span className="text-[13px] font-medium">New Pattern</span>
        </button>
        {items.map((p) => <Card key={p.id} p={p} current={p.id === currentId} {...props} />)}
      </div>
    </div>
  );
}
