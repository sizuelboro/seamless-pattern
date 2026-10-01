import { memo } from 'react';
import { Copy, Lock, Minus, Move, Plus, RotateCcw, RotateCw, Trash2, Unlock, X } from 'lucide-react';
import type { PatternObject } from '../types/pattern';
import { MOTIF_MAP } from '../data/motifs';
import { MotifIcon } from './MotifIcon';
import { IconButton } from './ui';

interface Props {
  obj: PatternObject;
  palette: string[];
  onDuplicate: () => void;
  onDelete: () => void;
  onRotate: (delta: number) => void;
  onScale: (factor: number) => void;
  onMoveHint: () => void;
  onLock: () => void;
  onClose: () => void;
}

const Divider = () => <span className="mx-0.5 h-5 w-px bg-ink-200 dark:bg-ink-700" />;

export const SelectionToolbar = memo(function SelectionToolbar({ obj, palette, onDuplicate, onDelete, onRotate, onScale, onMoveHint, onLock, onClose }: Props) {
  const locked = obj.locked;
  return (
    <div role="toolbar" aria-label="Selected motif" className="panel pointer-events-auto flex animate-pop-in items-center gap-0.5 rounded-xl p-1 shadow-float">
      <div className="flex items-center gap-1.5 pl-1 pr-1.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-100 dark:bg-ink-800"><MotifIcon type={obj.type} palette={palette} colorIndex={obj.colorIndex} className="h-5 w-5" /></span>
        <div className="hidden leading-tight sm:block">
          <div className="text-[10px] font-medium uppercase tracking-wide text-ink-400">Selected motif</div>
          <div className="text-xs font-semibold text-ink-800 dark:text-ink-100">{MOTIF_MAP[obj.type]?.name ?? obj.type}</div>
        </div>
      </div>
      <Divider />
      <IconButton label="Duplicate" shortcut="⌘D" onClick={onDuplicate}><Copy className="h-4 w-4" /></IconButton>
      <IconButton label="Delete" shortcut="Del" onClick={onDelete} disabled={locked}><Trash2 className="h-4 w-4" /></IconButton>
      <Divider />
      <IconButton label="Rotate −15°" shortcut="[" onClick={() => onRotate(-15)} disabled={locked}><RotateCcw className="h-4 w-4" /></IconButton>
      <span className="w-9 text-center font-mono text-[11px] tabular-nums text-ink-500">{Math.round(((obj.rotation % 360) + 360) % 360)}°</span>
      <IconButton label="Rotate +15°" shortcut="]" onClick={() => onRotate(15)} disabled={locked}><RotateCw className="h-4 w-4" /></IconButton>
      <Divider />
      <IconButton label="Scale down" shortcut="−" onClick={() => onScale(1 / 1.15)} disabled={locked}><Minus className="h-4 w-4" /></IconButton>
      <span className="w-10 text-center font-mono text-[11px] tabular-nums text-ink-500">{Math.round(obj.scale * 100)}%</span>
      <IconButton label="Scale up" shortcut="+" onClick={() => onScale(1.15)} disabled={locked}><Plus className="h-4 w-4" /></IconButton>
      <Divider />
      <IconButton label="Move (drag or arrow keys)" onClick={onMoveHint} disabled={locked}><Move className="h-4 w-4" /></IconButton>
      <IconButton label={locked ? 'Unlock' : 'Lock (keeps it when regenerating)'} shortcut="L" onClick={onLock} active={locked}>
        {locked ? <Lock className="h-4 w-4 text-amber-500" /> : <Unlock className="h-4 w-4" />}
      </IconButton>
      <Divider />
      <IconButton label="Deselect" shortcut="Esc" onClick={onClose}><X className="h-4 w-4" /></IconButton>
    </div>
  );
});
