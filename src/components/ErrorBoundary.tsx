import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (Component as any) {
  public state: State;
  public props: Props;
  public setState: any;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught runtime exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.reload();
    } catch {
      // fallback
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-slate-100 font-mono select-none">
          <div className="max-w-md w-full bg-slate-900/90 border-2 border-amber-400/60 p-6 rounded-3xl shadow-2xl text-center backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-4 text-amber-300">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-black uppercase text-amber-300 tracking-wide mb-2">
              System Recovered
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans">
              An unexpected render state was safely contained. Your saved progress, unlocked biomes, and coin balance remain intact.
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              <span>Resume TOWER//SHIFT</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
