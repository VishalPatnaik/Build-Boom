import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { useWorldTheme } from '../hooks/useWorldTheme';
import { Activity, Cpu, Layers, ChevronDown, ChevronUp, Eye, EyeOff, Zap } from 'lucide-react';

export interface PerformanceStats {
  fps: number;
  avgFrameTimeMs: number;
  onePercentLowFps: number;
  memoryUsedMb: number | null;
  memoryTotalMb: number | null;
  memoryLimitMb: number | null;
  budgetStatus: 'optimal' | 'stable' | 'strained';
  memoryBudgetStatus: 'healthy' | 'nominal' | 'high';
  history: number[]; // Last 24 frame times for sparkline
}

export function PerformanceMonitor({ className = '' }: { className?: string }) {
  const showFpsMonitor = useGameStore((s) => s.showFpsMonitor);
  const toggleFpsMonitor = useGameStore((s) => s.toggleFpsMonitor);
  const worldTheme = useWorldTheme();

  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    avgFrameTimeMs: 16.6,
    onePercentLowFps: 55,
    memoryUsedMb: null,
    memoryTotalMb: null,
    memoryLimitMb: null,
    budgetStatus: 'optimal',
    memoryBudgetStatus: 'healthy',
    history: Array(24).fill(16.6),
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // High-performance Raf loop only active when monitor is visible
  useEffect(() => {
    if (!showFpsMonitor) return;

    let animId: number;
    let lastTime = performance.now();
    let frameTimes: number[] = [];
    let lastUiUpdate = performance.now();

    const sampleFrame = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Filter out anomaly frames (e.g. background tab switch)
      if (delta > 0 && delta < 500) {
        frameTimes.push(delta);
        if (frameTimes.length > 45) {
          frameTimes.shift();
        }
      }

      // Throttle React UI state updates to every 280ms to avoid DOM rendering overhead
      if (now - lastUiUpdate > 280 && frameTimes.length > 0) {
        lastUiUpdate = now;

        const sum = frameTimes.reduce((acc, val) => acc + val, 0);
        const avgDelta = sum / frameTimes.length;
        const currentFps = Math.min(120, Math.round(1000 / Math.max(1, avgDelta)));

        // Compute 1% lows
        const sorted = [...frameTimes].sort((a, b) => b - a);
        const worstIndex = Math.floor(sorted.length * 0.1);
        const onePercentLow = Math.round(1000 / Math.max(1, sorted[worstIndex] || avgDelta));

        // Read Memory API if available in browser
        let usedMb: number | null = null;
        let totalMb: number | null = null;
        let limitMb: number | null = null;

        const perfMem = (performance as any)?.memory;
        if (perfMem) {
          usedMb = Math.round(perfMem.usedJSHeapSize / 1048576);
          totalMb = Math.round(perfMem.totalJSHeapSize / 1048576);
          limitMb = Math.round(perfMem.jsHeapSizeLimit / 1048576);
        }

        // Determine budget health
        const budgetStatus: 'optimal' | 'stable' | 'strained' =
          currentFps >= 55 ? 'optimal' : currentFps >= 38 ? 'stable' : 'strained';

        const memoryBudgetStatus: 'healthy' | 'nominal' | 'high' =
          usedMb === null ? 'healthy' : usedMb < 120 ? 'healthy' : usedMb < 250 ? 'nominal' : 'high';

        setStats({
          fps: currentFps,
          avgFrameTimeMs: parseFloat(avgDelta.toFixed(1)),
          onePercentLowFps: onePercentLow,
          memoryUsedMb: usedMb,
          memoryTotalMb: totalMb,
          memoryLimitMb: limitMb,
          budgetStatus,
          memoryBudgetStatus,
          history: frameTimes.slice(-20),
        });
      }

      animId = requestAnimationFrame(sampleFrame);
    };

    animId = requestAnimationFrame(sampleFrame);
    return () => cancelAnimationFrame(animId);
  }, [showFpsMonitor]);

  if (!showFpsMonitor) return null;

  const palette = worldTheme.palette;
  const accentColor = palette.accent || '#06b6d4';
  const glowColor = palette.glow || '#22d3ee';

  const statusColor =
    stats.budgetStatus === 'optimal'
      ? '#10b981' // Emerald
      : stats.budgetStatus === 'stable'
      ? '#f59e0b' // Amber
      : '#f43f5e'; // Rose

  const statusBg =
    stats.budgetStatus === 'optimal'
      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
      : stats.budgetStatus === 'stable'
      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
      : 'bg-rose-950/80 border-rose-500/40 text-rose-300';

  // SVG sparkline path for frame-time stability
  const sparklinePoints = useMemo(() => {
    if (!stats.history || stats.history.length === 0) return '';
    const max = 33.3; // 30fps target baseline
    const min = 8.3;  // 120fps baseline
    const width = 80;
    const height = 18;

    return stats.history
      .map((val, idx) => {
        const x = (idx / (stats.history.length - 1 || 1)) * width;
        const normalized = Math.max(0, Math.min(1, (val - min) / (max - min)));
        const y = height - normalized * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [stats.history]);

  if (!showFpsMonitor) {
    return null;
  }

  return (
    <div
      className={`pointer-events-auto select-none font-mono text-[11px] ${className || 'fixed top-2.5 right-2.5 sm:top-3 sm:right-3 z-50'}`}
      style={worldTheme.cssVariables}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`backdrop-blur-md rounded-2xl border transition-all shadow-xl overflow-hidden ${
          isExpanded ? 'bg-slate-950/92 w-56 border-slate-700/80' : 'bg-black/60 hover:bg-black/80'
        }`}
        style={{
          borderColor: isExpanded ? `${accentColor}70` : `${statusColor}50`,
          boxShadow: `0 0 16px ${isExpanded ? glowColor + '30' : statusColor + '20'}`,
        }}
      >
        {/* Compact Header Pill Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-2 px-3 py-1.5 cursor-pointer"
        >
          {/* FPS Core Display */}
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
            />
            <span className="tabular-nums font-black text-white text-[12px]">
              {stats.fps}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400">FPS</span>
          </div>

          {/* Quick Memory Footprint */}
          <div className="flex items-center gap-1 text-[10px] text-slate-300">
            {stats.memoryUsedMb !== null ? (
              <>
                <Cpu className="w-3 h-3 text-slate-400" />
                <span className="tabular-nums">{stats.memoryUsedMb}MB</span>
              </>
            ) : (
              <span className="text-[9px] text-slate-400 tabular-nums">
                {stats.avgFrameTimeMs}ms
              </span>
            )}
          </div>

          {/* Expand / Collapse Chevron */}
          <button
            className="text-slate-400 hover:text-white transition-colors p-0.5"
            aria-label="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Detailed Telemetry Dropdown */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="px-3 pb-3 pt-1 border-t border-white/10 flex flex-col gap-2"
            >
              {/* Performance Budget Health Badge */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  Frame Budget
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusBg}`}>
                  {stats.budgetStatus === 'optimal'
                    ? 'Target 60+ Met'
                    : stats.budgetStatus === 'stable'
                    ? 'Stable Load'
                    : 'Budget Exceeded'}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-2 rounded-xl border border-white/5 text-[10px]">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Frame Latency</div>
                  <div className="text-white font-bold tabular-nums">
                    {stats.avgFrameTimeMs} ms
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">1% Low FPS</div>
                  <div className="text-white font-bold tabular-nums">
                    {stats.onePercentLowFps} FPS
                  </div>
                </div>
                {stats.memoryUsedMb !== null && (
                  <>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Heap Used</div>
                      <div className="text-white font-bold tabular-nums">
                        {stats.memoryUsedMb} MB
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Heap Limit</div>
                      <div className="text-slate-300 font-bold tabular-nums text-[9px]">
                        {stats.memoryLimitMb ? `${stats.memoryLimitMb} MB` : 'Dynamic'}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Real-time Frame Latency Sparkline */}
              <div>
                <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase mb-0.5">
                  <span>Frame Jitter Graph</span>
                  <span>16.6ms Target</span>
                </div>
                <div className="w-full h-5 bg-black/60 rounded-lg p-0.5 relative overflow-hidden border border-white/10 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 80 18" preserveAspectRatio="none">
                    {/* Target 60fps guide line */}
                    <line
                      x1="0"
                      y1="9"
                      x2="80"
                      y2="9"
                      stroke="rgba(255,255,255,0.18)"
                      strokeDasharray="2 2"
                      strokeWidth="0.8"
                    />
                    <polyline
                      fill="none"
                      stroke={accentColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sparklinePoints}
                    />
                  </svg>
                </div>
              </div>

              {/* Active Environment Shader Profile */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/5">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" style={{ color: accentColor }} />
                  <span className="truncate max-w-[120px] text-slate-300">{worldTheme.worldName}</span>
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">
                  Active World
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
