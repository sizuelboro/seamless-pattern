import { Modal } from './Modal';
import { Kbd, MOD } from './ui';

const ROWS: [string, string[]][] = [
  ['Undo', [MOD, 'Z']], ['Redo', [MOD, '⇧', 'Z']], ['Save', [MOD, 'S']], ['Export', [MOD, 'E']],
  ['Randomize arrangement', ['R']], ['Zoom in / out', ['+', '−']], ['Fit to screen', ['0']], ['Pan', ['Space', 'drag']],
  ['Toggle tile boundary', ['B']], ['Duplicate motif', [MOD, 'D']], ['Delete motif', ['Del']], ['Nudge motif', ['←↑→↓']],
  ['Rotate motif', ['[', ']']], ['Lock motif', ['L']], ['Deselect', ['Esc']],
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts" className="sm:max-w-md">
      <ul className="divide-y divide-ink-100 px-5 py-2 dark:divide-ink-800">
        {ROWS.map(([label, keys]) => (
          <li key={label} className="flex items-center justify-between py-2 text-[13px]">
            <span className="text-ink-700 dark:text-ink-200">{label}</span>
            <span className="flex gap-1">{keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
