import { Component, type ReactNode } from 'react';

interface State { failed: boolean }

/** Never show stack traces to users; offer a recovery path instead. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error('[PatternForge]', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="panel max-w-sm rounded-2xl p-6 text-center shadow-float">
          <h1 className="text-base font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink-500">PatternForge hit an unexpected problem. Your saved patterns are safe in this browser.</p>
          <div className="mt-5 flex justify-center gap-2">
            <button className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700" onClick={() => location.reload()}>Reload app</button>
            <button className="h-9 rounded-lg border border-ink-200 px-4 text-sm font-medium hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800" onClick={() => { try { localStorage.removeItem('patternforge.draft'); } catch { /* ignore */ } location.reload(); }}>Start fresh</button>
          </div>
        </div>
      </div>
    );
  }
}
