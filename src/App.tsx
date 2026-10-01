import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dices, Layers3, Shuffle, Sparkles, Wand2 } from 'lucide-react';
import type { AppView, Backdrop, ExportFormat, PatternState, RepeatMode, SavedPattern, SeamReport } from './types/pattern';
import { usePattern } from './hooks/usePattern';
import { useSavedPatterns } from './hooks/useSavedPatterns';
import { readStorage, writeStorage } from './hooks/useLocalStorage';
import { viewStore } from './hooks/viewStore';
import { createDemoState, PRESET_MAP, stateFromPreset, DEMO_PRESET, type PresetDef } from './data/presets';
import { runSeamCheck } from './engine/seamCheck';
import { randomSeed } from './engine/random';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SettingsPanel, SeamStatus } from './components/SettingsPanel';
import { PatternCanvas } from './components/PatternCanvas';
import { CanvasFooter, REPEATS, ZoomControls } from './components/CanvasFooter';
import { SelectionToolbar } from './components/SelectionToolbar';
import { ExportModal } from './components/ExportModal';
import { PresetGallery } from './components/PresetGallery';
import { SavedPatterns } from './components/SavedPatterns';
import { FramesView } from './components/FramesView';
import { EmptyState } from './components/EmptyState';
import { Mockups } from './components/Mockups';
import { MobileNav, type MobileTab } from './components/MobileNav';
import { BottomSheet } from './components/BottomSheet';
import { ShortcutsDialog } from './components/ShortcutsDialog';
import { ColorPalette } from './components/ColorPalette';
import { BackgroundControls } from './components/BackgroundControls';
import { useToast } from './components/Toast';
import { Section, Segmented, Toggle, cx } from './components/ui';

const DRAFT_KEY = 'patternforge.draft';
const WELCOME_KEY = 'patternforge.welcomed';
const THEME_KEY = 'patternforge.theme';
const PREFS_KEY = 'patternforge.prefs';

interface Draft { state: PatternState; savedId: string | null }
interface Prefs { repeat: RepeatMode; showBoundary: boolean; backdrop: Backdrop }

function loadInitial(): Draft {
  const d = readStorage<Draft | null>(DRAFT_KEY, null);
  if (d && d.state && Array.isArray(d.state.objects) && d.state.settings) return d;
  return { state: createDemoState(), savedId: null };
}

const backdropClass: Record<Backdrop, string> = {
  light: 'bg-[#E9E9EC] dark:bg-[#1B1B1F]',
  dark: 'bg-[#141416]',
  checker: 'checker-bg',
};

export default function App() {
  const toast = useToast();
  const initial = useMemo(loadInitial, []);
  const { state, actions, undo, redo, canUndo, canRedo, reset, set } = usePattern(() => initial.state);
  const saved = useSavedPatterns();

  const [view, setView] = useState<AppView>('generator');
  const [savedId, setSavedId] = useState<string | null>(initial.savedId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const prefs = useMemo(() => readStorage<Prefs>(PREFS_KEY, { repeat: 'infinite', showBoundary: true, backdrop: 'light' }), []);
  const [repeat, setRepeat] = useState<RepeatMode>(prefs.repeat);
  const [showBoundary, setShowBoundary] = useState(prefs.showBoundary);
  const [backdrop, setBackdrop] = useState<Backdrop>(prefs.backdrop);
  const [seamCheck, setSeamCheck] = useState(false);
  const [seam, setSeam] = useState<SeamReport | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat | undefined>();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsDrawer, setSettingsDrawer] = useState(false);
  const [canvasMode, setCanvasMode] = useState<'editor' | 'mockups'>('editor');
  const [mobileTab, setMobileTab] = useState<MobileTab | null>(null);
  const [welcome, setWelcome] = useState(() => !readStorage<boolean>(WELCOME_KEY, false));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  const lastSaved = useRef<PatternState | null>(initial.savedId ? initial.state : null);

  // theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    writeStorage(THEME_KEY, theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => { writeStorage(PREFS_KEY, { repeat, showBoundary, backdrop }); }, [repeat, showBoundary, backdrop]);

  // autosave working draft (debounced)
  useEffect(() => {
    const t = setTimeout(() => writeStorage(DRAFT_KEY, { state, savedId }), 600);
    return () => clearTimeout(t);
  }, [state, savedId]);

  // seam check (debounced, honest re-render comparison)
  useEffect(() => {
    if (!seamCheck) { setSeam(null); return; }
    const t = setTimeout(() => {
      const brokenForTesting = new URLSearchParams(location.search).get('debugWrap') === 'off';
      try { setSeam(runSeamCheck(state, { wrap: !brokenForTesting })); } catch { toast.show('Seam check could not run', 'error', 'Your browser could not allocate the check canvas.'); }
    }, 250);
    return () => clearTimeout(t);
  }, [seamCheck, state, toast]);

  // drop selection if the object disappears
  const selected = selectedId ? state.objects.find((o) => o.id === selectedId) ?? null : null;
  useEffect(() => { if (selectedId && !selected) setSelectedId(null); }, [selectedId, selected]);

  const dirty = lastSaved.current !== state;
  const transitionKey = `${state.presetId}|${state.settings.seed}|${state.settings.layout}|${state.settings.category}`;

  // ───── commands ─────
  const openExport = useCallback((f?: ExportFormat) => { setExportFormat(f); setExportOpen(true); }, []);

  const save = useCallback(() => {
    const res = saved.save(state, savedId);
    if (res.error) { toast.show('Couldn’t save pattern', 'error', res.error); return; }
    setSavedId(res.id);
    lastSaved.current = state;
    toast.show('Pattern saved', 'success', state.name);
  }, [saved, state, savedId, toast]);

  const newPattern = useCallback(() => {
    const fresh = stateFromPreset(DEMO_PRESET, { seed: randomSeed() });
    reset({ ...fresh, name: 'Untitled pattern', presetId: null });
    setSavedId(null); lastSaved.current = null; setSelectedId(null);
    setView('generator'); setCanvasMode('editor'); setWelcome(true);
    requestAnimationFrame(() => viewStore.fit());
  }, [reset]);

  const resetPattern = useCallback(() => {
    const p = (state.presetId && PRESET_MAP[state.presetId]) || DEMO_PRESET;
    const fresh = stateFromPreset(p, { tileWidth: state.settings.tileWidth, tileHeight: state.settings.tileHeight, ...(state.presetId ? {} : { seed: state.settings.seed }) });
    set({ ...fresh, name: state.name, presetId: state.presetId });
    setSelectedId(null);
    toast.show('Pattern reset', 'info', 'Undo to bring your changes back.');
  }, [set, state, toast]);

  const applyPreset = useCallback((p: PresetDef) => {
    actions.loadPreset(p);
    setSelectedId(null); setView('generator'); setCanvasMode('editor'); setWelcome(false); setMobileTab(null);
    writeStorage(WELCOME_KEY, true);
    setSavedId(null); lastSaved.current = null;
    toast.show(`${p.name} loaded`);
  }, [actions, toast]);

  const openSaved = useCallback((p: SavedPattern) => {
    reset(p.state); setSavedId(p.id); lastSaved.current = p.state; setSelectedId(null);
    setView('generator'); setWelcome(false); setMobileTab(null);
    requestAnimationFrame(() => viewStore.fit());
  }, [reset]);

  const randomize = useCallback(() => { actions.randomize(); setSelectedId(null); toast.show('Pattern generated'); }, [actions, toast]);
  const randomizeAll = useCallback(() => { actions.randomizeEverything(); setSelectedId(null); toast.show('New design generated'); }, [actions, toast]);

  const dismissWelcome = useCallback(() => { setWelcome(false); writeStorage(WELCOME_KEY, true); }, []);

  const onMove = useCallback((id: string, x: number, y: number) => actions.updateObject(id, { x, y }), [actions]);

  const sel = useMemo(() => {
    if (!selected) return null;
    return {
      duplicate: () => { const id = actions.duplicateObject(selected.id); setSelectedId(id); },
      remove: () => { if (selected.locked) { toast.show('Motif is locked', 'info', 'Unlock it before deleting.'); return; } actions.deleteObject(selected.id); setSelectedId(null); },
      rotate: (d: number) => !selected.locked && actions.updateObject(selected.id, { rotation: selected.rotation + d }, 'rotate'),
      scale: (f: number) => !selected.locked && actions.updateObject(selected.id, { scale: Math.max(0.1, Math.min(6, selected.scale * f)) }, 'scale'),
      nudge: (dx: number, dy: number) => !selected.locked && actions.updateObject(selected.id, { x: selected.x + dx, y: selected.y + dy }, 'nudge'),
      lock: () => { actions.updateObject(selected.id, { locked: !selected.locked }); toast.show(selected.locked ? 'Motif unlocked' : 'Motif locked', 'info', selected.locked ? undefined : 'Locked motifs survive regeneration.'); },
    };
  }, [selected, actions, toast]);

  // ───── keyboard shortcuts ─────
  const keyRef = useRef({ undo, redo, save, openExport, randomize, sel, view, setShowBoundary, selectedId, exportOpen, shortcutsOpen });
  keyRef.current = { undo, redo, save, openExport, randomize, sel, view, setShowBoundary, selectedId, exportOpen, shortcutsOpen };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keyRef.current;
      const mod = e.metaKey || e.ctrlKey;
      const typing = e.target instanceof HTMLElement && !!e.target.closest('input, textarea, select, [contenteditable="true"]');
      const key = e.key.toLowerCase();
      if (mod && key === 's') { e.preventDefault(); k.save(); return; }
      if (k.exportOpen || k.shortcutsOpen) return;
      if (mod && key === 'e') { e.preventDefault(); k.openExport(); return; }
      if (typing) return;
      if (mod && key === 'z') { e.preventDefault(); if (e.shiftKey) k.redo(); else k.undo(); return; }
      if (mod && key === 'y') { e.preventDefault(); k.redo(); return; }
      if (mod && key === 'd' && k.sel) { e.preventDefault(); k.sel.duplicate(); return; }
      if (mod || e.altKey || k.view !== 'generator') return;
      const step = e.shiftKey ? 40 : 8;
      switch (e.key) {
        case 'Escape': setSelectedId(null); break;
        case 'Delete': case 'Backspace': if (k.sel) { e.preventDefault(); k.sel.remove(); } break;
        case 'ArrowLeft': if (k.sel) { e.preventDefault(); k.sel.nudge(-step, 0); } break;
        case 'ArrowRight': if (k.sel) { e.preventDefault(); k.sel.nudge(step, 0); } break;
        case 'ArrowUp': if (k.sel) { e.preventDefault(); k.sel.nudge(0, -step); } break;
        case 'ArrowDown': if (k.sel) { e.preventDefault(); k.sel.nudge(0, step); } break;
        case '[': k.sel?.rotate(-15); break;
        case ']': k.sel?.rotate(15); break;
        case 'l': case 'L': k.sel?.lock(); break;
        case 'r': case 'R': k.randomize(); break;
        case 'b': case 'B': k.setShowBoundary((v) => !v); break;
        case '+': case '=': if (k.sel) k.sel.scale(1.15); else viewStore.zoomBy(1.25); break;
        case '-': case '_': if (k.sel) k.sel.scale(1 / 1.15); else viewStore.zoomBy(1 / 1.25); break;
        case '0': viewStore.fit(); break;
        case '?': setShortcutsOpen(true); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onMobileTab = (t: MobileTab) => {
    if (t === 'patterns') { setView('patterns'); setMobileTab(null); return; }
    if (t === 'frames') { setView('frames'); setMobileTab(null); return; }
    if (t === 'export') { openExport(); setMobileTab(null); return; }
    setView('generator');
    setMobileTab((cur) => (cur === t ? null : t));
  };

  const settingsPanel = (
    <SettingsPanel state={state} actions={actions} onSelect={setSelectedId} onExport={openExport} seamCheck={seamCheck} setSeamCheck={setSeamCheck} seam={seam} />
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header view={view} setView={(v) => { setView(v); setMobileTab(null); }} canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo}
        onReset={resetPattern} onSave={save} onNew={newPattern} onExport={() => openExport()} theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} onShortcuts={() => setShortcutsOpen(true)}
        onToggleSettings={() => setSettingsDrawer((v) => !v)} savedCount={saved.items.length} />

      <main className="relative flex min-h-0 flex-1">
        {view === 'generator' && (
          <>
            <aside aria-label="Pattern controls" className="scroll-thin hidden w-[292px] shrink-0 overflow-y-auto border-r border-ink-200/80 bg-white dark:border-ink-800 dark:bg-ink-900 md:block">
              <Sidebar state={state} actions={actions} />
            </aside>

            <section aria-label="Canvas" className="relative flex min-w-0 flex-1 flex-col">
              <div className={cx('relative min-h-0 flex-1 overflow-hidden transition-colors', canvasMode === 'mockups' ? 'bg-ink-100 dark:bg-ink-950' : backdropClass[backdrop])}>
                {canvasMode === 'editor' ? (
                  <PatternCanvas state={state} selectedId={selectedId} onSelect={setSelectedId} onMove={onMove} repeat={repeat}
                    showBoundary={showBoundary} seam={seamCheck ? seam : null} backdrop={backdrop} transitionKey={transitionKey} />
                ) : (
                  <Mockups state={state} />
                )}

                {/* top-left: name + mode */}
                <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-2">
                  <div className="panel pointer-events-auto flex min-w-0 items-center gap-1 rounded-xl p-1 pl-2.5 shadow-panel">
                    <input value={state.name} onChange={(e) => actions.setName(e.target.value)} aria-label="Pattern name" spellCheck={false}
                      className="w-[9rem] min-w-0 bg-transparent text-[13px] font-semibold text-ink-900 outline-none placeholder:text-ink-400 focus:underline dark:text-white sm:w-[13rem]" placeholder="Untitled pattern" />
                    <span className={cx('hidden whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline', dirty ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300')}>
                      {dirty ? (savedId ? 'Unsaved changes' : 'Not saved') : 'Saved'}
                    </span>
                    <div className="ml-1 w-[150px]">
                      <Segmented size="sm" label="Canvas mode" value={canvasMode} onChange={(v) => { setCanvasMode(v); setSelectedId(null); }}
                        options={[{ value: 'editor', label: 'Editor' }, { value: 'mockups', label: 'Mockups' }]} />
                    </div>
                  </div>
                  {canvasMode === 'editor' && selected && sel && (
                    <div className="absolute left-1/2 top-12 -translate-x-1/2 lg:top-0">
                      <SelectionToolbar obj={selected} palette={state.palette} onDuplicate={sel.duplicate} onDelete={sel.remove} onRotate={sel.rotate}
                        onScale={sel.scale} onLock={sel.lock} onClose={() => setSelectedId(null)}
                        onMoveHint={() => toast.show('Drag the selected motif to move it', 'info', 'Or use the arrow keys (Shift for bigger steps).')} />
                    </div>
                  )}
                </div>

                {/* bottom-center: randomize actions */}
                {canvasMode === 'editor' && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-3">
                    <div className="panel pointer-events-auto flex items-center gap-1 rounded-2xl p-1 shadow-float">
                      <button type="button" onClick={randomize} title="Randomize arrangement (R)"
                        className="flex h-9 items-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-3.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-900/20 transition hover:from-brand-600 hover:to-brand-700 active:scale-[0.97]">
                        <Sparkles className="h-4 w-4" /> Randomize
                      </button>
                      <button type="button" onClick={randomizeAll} title="Randomize everything"
                        className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-ink-700 transition hover:bg-ink-100 active:scale-[0.97] dark:text-ink-200 dark:hover:bg-ink-800">
                        <Wand2 className="h-4 w-4" /><span className="hidden sm:inline">Randomize Everything</span>
                      </button>
                      <button type="button" onClick={() => { actions.shuffleColors(); toast.show('Colors shuffled'); }} title="Shuffle colors" disabled={state.palette.length < 2}
                        className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-ink-700 transition hover:bg-ink-100 active:scale-[0.97] disabled:opacity-40 dark:text-ink-200 dark:hover:bg-ink-800">
                        <Shuffle className="h-4 w-4" /><span className="hidden sm:inline">Shuffle Colors</span>
                      </button>
                      <button type="button" onClick={() => actions.updateSettings({ seed: randomSeed() })} title="New seed only"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-700 transition hover:bg-ink-100 active:scale-[0.97] dark:text-ink-200 dark:hover:bg-ink-800 sm:hidden" aria-label="New seed">
                        <Dices className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* mobile zoom */}
                {canvasMode === 'editor' && (
                  <div className="panel absolute bottom-20 right-3 z-10 rounded-xl p-0.5 shadow-panel md:hidden"><ZoomControls compact /></div>
                )}

                {/* seam badge */}
                {canvasMode === 'editor' && seamCheck && seam && (
                  <div className={cx('absolute right-3 top-16 z-10 animate-pop-in rounded-full px-3 py-1 text-xs font-semibold shadow-panel lg:top-3', seam.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>
                    {seam.ok ? '✓ Seamless' : `⚠ ${seam.rowsFlagged.length + seam.colsFlagged.length} seam regions differ`}
                  </div>
                )}

                {welcome && <EmptyState onStart={dismissWelcome} onExplore={() => { dismissWelcome(); setView('presets'); }} onUse={applyPreset} />}
              </div>
              <div className="hidden md:block">
                <CanvasFooter repeat={repeat} setRepeat={setRepeat} showBoundary={showBoundary} setShowBoundary={setShowBoundary}
                  seamCheck={seamCheck} setSeamCheck={setSeamCheck} seam={seam} backdrop={backdrop} setBackdrop={setBackdrop}
                  tileW={state.settings.tileWidth} tileH={state.settings.tileHeight} />
              </div>
            </section>

            <aside aria-label="Pattern settings" className="scroll-thin hidden w-[300px] shrink-0 overflow-y-auto border-l border-ink-200/80 bg-white dark:border-ink-800 dark:bg-ink-900 xl:block">
              {settingsPanel}
            </aside>

            {settingsDrawer && (
              <div className="fixed inset-0 z-40 hidden md:block xl:hidden">
                <div className="absolute inset-0 bg-black/10 animate-fade-in" onClick={() => setSettingsDrawer(false)} aria-hidden="true" />
                <aside aria-label="Pattern settings" className="scroll-thin absolute bottom-0 right-0 top-12 w-[320px] animate-slide-left overflow-y-auto border-l border-ink-200 bg-white shadow-float dark:border-ink-800 dark:bg-ink-900">
                  {settingsPanel}
                </aside>
              </div>
            )}
          </>
        )}

        {view === 'patterns' && (
          <div className="scroll-thin flex-1 overflow-y-auto">
            <SavedPatterns items={saved.items} currentId={savedId} onOpen={openSaved} onExport={(p) => { openSaved(p); openExport(); }}
              onRename={(id, name) => { const err = saved.rename(id, name); if (err) toast.show('Rename failed', 'error', err); else if (id === savedId) actions.setName(name); }}
              onDuplicate={(id) => { const err = saved.duplicate(id); toast.show(err ? 'Couldn’t duplicate' : 'Pattern duplicated', err ? 'error' : 'success', err ?? undefined); }}
              onDelete={(id) => { saved.remove(id); if (id === savedId) { setSavedId(null); lastSaved.current = null; } toast.show('Pattern deleted', 'info'); }}
              onNew={newPattern} />
          </div>
        )}

        {view === 'frames' && <FramesView patternPalette={state.palette} />}
        {view === 'presets' && (
          <div className="scroll-thin flex-1 overflow-y-auto"><PresetGallery onUse={applyPreset} /></div>
        )}
      </main>

      <MobileNav active={view === 'patterns' ? 'patterns' : view === 'frames' ? 'frames' : mobileTab} onSelect={onMobileTab} />

      <BottomSheet open={mobileTab === 'generate'} title="Generate" onClose={() => setMobileTab(null)}>
        <Sidebar state={state} actions={actions} />
      </BottomSheet>
      <BottomSheet open={mobileTab === 'colors'} title="Colors" onClose={() => setMobileTab(null)}>
        <Section title="Palette"><ColorPalette state={state} actions={actions} /></Section>
        <Section title="Background"><BackgroundControls state={state} actions={actions} /></Section>
      </BottomSheet>
      <BottomSheet open={mobileTab === 'preview'} title="Preview" onClose={() => setMobileTab(null)}>
        <div className="space-y-4 p-4">
          <div>
            <div className="label mb-2">Repeat</div>
            <Segmented label="Preview repeat" value={repeat} onChange={setRepeat} options={REPEATS.map((r) => ({ value: r.value, label: r.label }))} />
          </div>
          <div className="flex items-center justify-between text-[13px]"><span className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-ink-400" /> Show tile boundary</span><Toggle checked={showBoundary} onChange={setShowBoundary} label="Show tile boundary" /></div>
          <SeamStatus seamCheck={seamCheck} setSeamCheck={setSeamCheck} seam={seam} />
          <div>
            <div className="label mb-2">View</div>
            <Segmented label="Canvas mode" value={canvasMode} onChange={(v) => { setCanvasMode(v); setMobileTab(null); }} options={[{ value: 'editor', label: 'Pattern' }, { value: 'mockups', label: 'Mockups' }]} />
          </div>
        </div>
      </BottomSheet>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} state={state} initialFormat={exportFormat} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
