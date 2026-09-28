import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { ReplayData, ReplayFrame, ReplayEventMarker } from '../game/replayEngine';
import { renderBlock, renderPlate, renderBoomParticle, getBoomColor } from '../game/themeRenderer';
import { safeCreateRadialGradient } from '../utils/canvasUtils';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  X,
  Volume2,
  VolumeX,
  Repeat,
  Compass,
  Activity,
  Layers,
  Sparkles,
  Flame,
  ShieldCheck,
  Trophy,
  Zap,
} from 'lucide-react';

interface ReplayViewerProps {
  isOpen: boolean;
  onClose: () => void;
  replayData?: ReplayData | null;
}

export function ReplayViewer({ isOpen, onClose, replayData }: ReplayViewerProps) {
  const storeReplay = useGameStore((s) => s.lastReplay);
  const replay = replayData || storeReplay;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>();

  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeEventBadge, setActiveEventBadge] = useState<ReplayEventMarker | null>(null);

  const lastFrameIndexRef = useRef(0);
  const lastRealTimeRef = useRef<number>(0);
  const lastTriggeredEventIdRef = useRef<string | null>(null);

  const durationMs = replay?.durationMs || 10000;
  const frames = replay?.frames || [];

  // Reset playback to start whenever opened
  useEffect(() => {
    if (isOpen) {
      setCurrentTimeMs(0);
      setIsPlaying(true);
      lastRealTimeRef.current = performance.now();
      lastFrameIndexRef.current = 0;
      lastTriggeredEventIdRef.current = null;
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [isOpen, replay?.id]);

  // Find nearest frame for a given timeMs using binary search
  const getFrameAtTime = useCallback(
    (targetMs: number): ReplayFrame | null => {
      if (!frames || frames.length === 0) return null;
      if (targetMs <= frames[0].timeMs) return frames[0];
      if (targetMs >= frames[frames.length - 1].timeMs) return frames[frames.length - 1];

      let low = 0;
      let high = frames.length - 1;

      while (low <= high) {
        const mid = (low + high) >> 1;
        const midVal = frames[mid].timeMs;

        if (midVal < targetMs) {
          low = mid + 1;
        } else if (midVal > targetMs) {
          high = mid - 1;
        } else {
          return frames[mid];
        }
      }

      // Return closest frame
      const prev = frames[Math.max(0, high)];
      const next = frames[Math.min(frames.length - 1, low)];
      return Math.abs(targetMs - prev.timeMs) < Math.abs(targetMs - next.timeMs) ? prev : next;
    },
    [frames]
  );

  // Playback loop
  useEffect(() => {
    if (!isOpen || !isPlaying || frames.length === 0) return;

    let localTime = currentTimeMs;
    lastRealTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastRealTimeRef.current) * playbackSpeed;
      lastRealTimeRef.current = now;

      localTime += dt;

      if (localTime >= durationMs) {
        if (isLooping) {
          localTime = 0;
          lastTriggeredEventIdRef.current = null;
        } else {
          localTime = durationMs;
          setIsPlaying(false);
        }
      }

      setCurrentTimeMs(localTime);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, playbackSpeed, isLooping, durationMs, frames.length]);

  // Current active frame
  const currentFrame = getFrameAtTime(currentTimeMs);

  // Audio & Haptic event syncing during playback
  useEffect(() => {
    if (!currentFrame || !isPlaying || !soundEnabled) return;

    if (currentFrame.event && currentFrame.event.id !== lastTriggeredEventIdRef.current) {
      lastTriggeredEventIdRef.current = currentFrame.event.id;
      setActiveEventBadge(currentFrame.event);

      const evt = currentFrame.event;
      if (evt.type === 'stack' || evt.type === 'perfect') {
        const mass = evt.mass || 1.0;
        audio.playCollisionSound(mass, { type: 'impact' });
        audio.playStackSound(mass, {
          archetype: evt.archetype,
          isPerfect: evt.type === 'perfect',
          combo: currentFrame.combo,
        });
      } else if (evt.type === 'boom' || evt.type === 'collapse') {
        audio.playBoomSound();
        audio.playCollisionSound(3.0, { type: 'crash' });
      } else if (evt.type === 'shield') {
        audio.playShieldBreak();
      }

      const timer = setTimeout(() => setActiveEventBadge(null), 900);
      return () => clearTimeout(timer);
    }
  }, [currentFrame?.event?.id, isPlaying, soundEnabled, currentFrame?.combo]);

  // Canvas render pass for current frame
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current || !currentFrame || !replay) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas if needed
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const w = width;
    const h = height;
    const cx = w / 2;
    const cy = h * 0.65;
    const gameRadius = Math.min(w, h) * 0.45;
    const time = currentFrame.rawTime || currentTimeMs;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // Subtle background tint & scanline grid
    ctx.fillStyle = 'rgba(8, 14, 26, 0.4)';
    ctx.fillRect(0, 0, w, h);

    // Screen Shake simulation
    if (currentFrame.shake > 0) {
      const shakeMag = Math.min(currentFrame.shake, 14);
      const dx = (Math.sin(time * 0.5) - 0.5) * shakeMag;
      const dy = (Math.cos(time * 0.5) - 0.5) * shakeMag;
      ctx.translate(dx, dy);
    }

    // Chrono Stasis overlay if active in frame
    if (currentFrame.physics.stasisActive && gameRadius > 5 && Number.isFinite(cx) && Number.isFinite(cy)) {
      const r0 = Math.max(0, gameRadius * 0.2);
      const r1 = Math.max(r0 + 5, gameRadius * 1.4);
      const stasisGrad = safeCreateRadialGradient(ctx, cx, cy, r0, cx, cy, r1);
      if (stasisGrad) {
        stasisGrad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
        stasisGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
        ctx.fillStyle = stasisGrad;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // Dynamic Combo Streak Energy Vignette
    if (currentFrame.combo >= 3 && gameRadius > 5 && Number.isFinite(cx) && Number.isFinite(cy)) {
      const comboPulseAlpha = Math.min(0.25, (currentFrame.combo - 2) * 0.04);
      const r0 = Math.max(0, gameRadius * 0.6);
      const r1 = Math.max(r0 + 5, gameRadius * 1.4);
      const vignetteGrad = safeCreateRadialGradient(ctx, cx, cy, r0, cx, cy, r1);
      if (vignetteGrad) {
        vignetteGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        vignetteGrad.addColorStop(1, `rgba(6, 182, 212, ${comboPulseAlpha})`);
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // Trajectory guide lines for incoming blocks
    currentFrame.blocks.forEach((b) => {
      if (!b.handled && b.distance > 0) {
        ctx.save();
        ctx.strokeStyle = b.type === 'boom' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const px = cx + Math.cos(b.angle) * (b.distance / 100) * gameRadius;
        const py = cy + Math.sin(b.angle) * (b.distance / 100) * gameRadius;
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Center Floating Platform
    const bounce = Math.sin(time / 200) * 3;
    renderPlate(ctx, cx - 50, cy + bounce - 5, 100, 30, replay.equippedPlate || 'plate-0', time);

    // Tower Stack with Structural Physics Flexion
    const towerLayers = Math.min(currentFrame.builtCount, 30);
    const tiltRad = (currentFrame.physics.tiltAngle * Math.PI) / 180;

    for (let i = 0; i < towerLayers; i++) {
      const progress = (i + 1) / Math.max(1, towerLayers);
      const layerTilt = tiltRad * progress;
      const layerOffsetX = Math.sin(layerTilt) * (i * 20);
      const layerOffsetY = -i * 20 * Math.cos(layerTilt);

      ctx.save();
      ctx.translate(cx + layerOffsetX, cy + bounce + layerOffsetY - 10);
      ctx.rotate(layerTilt);

      renderBlock(ctx, -30, -15, 60, 30, replay.equippedCosmetic || 'skin-0', true, time, undefined);
      ctx.restore();
    }

    // Aegis Kinetic Shield Bubble
    if (currentFrame.physics.shieldActive) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy + bounce - towerLayers * 10, 74, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Incoming Flight Projectiles
    currentFrame.blocks.forEach((b) => {
      if (b.handled && b.type === 'build') return;

      const px = cx + Math.cos(b.angle) * (b.distance / 100) * gameRadius;
      const py = cy + Math.sin(b.angle) * (b.distance / 100) * gameRadius;

      ctx.save();
      ctx.translate(px, py);

      const stretch = 1 + b.speed * 0.1;
      ctx.rotate(b.angle);
      ctx.scale(stretch, 1 / stretch);

      if (b.type === 'build') {
        renderBlock(ctx, -15, -15, 30, 30, replay.equippedCosmetic || 'skin-0', false, time, b.archetype);
      } else {
        renderBoomParticle(
          ctx,
          { x: 0, y: 0, rotation: 0, life: 1, size: 18, type: 'projectile' },
          time,
          replay.activeBoom || 'boom-0'
        );
      }
      ctx.restore();
    });

    // Highlight target impact zone circle
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy + bounce, 45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }, [isOpen, currentFrame, currentTimeMs, replay]);

  if (!isOpen || !replay) return null;

  const currentSec = (currentTimeMs / 1000).toFixed(1);
  const totalSec = (durationMs / 1000).toFixed(1);
  const progressRatio = Math.max(0, Math.min(1, currentTimeMs / durationMs));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none flex flex-col justify-end items-center sm:p-3">
        {/* Backdrop Overlay */}
        <div 
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto cursor-pointer"
        />

        {/* Bottom Center Replay Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#0b1329] via-[#080d1a] to-[#04060d] border-t-2 sm:border-2 border-cyan-400/60 rounded-t-3xl sm:rounded-3xl shadow-[0_-12px_50px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden pointer-events-auto z-10 max-h-[88vh]"
        >
          {/* Top Grab Handle */}
          <div className="w-12 h-1 bg-white/25 rounded-full mx-auto mt-2 mb-1 shrink-0 cursor-pointer" onClick={onClose} />
          {/* TOP HEADER BAR */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-black/50 border-b border-cyan-500/30 shrink-0 z-20 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center shadow-inner shrink-0">
                <span className="text-sm sm:text-base animate-pulse">📼</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  <span className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider font-mono truncate">
                    PHYSICS REPLAY
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase font-mono bg-cyan-950 border border-cyan-400 text-cyan-300 shrink-0">
                    LAST 10s
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase font-mono border shrink-0 ${
                      replay.finalOutcome === 'won'
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                        : 'bg-red-950/80 border-red-500 text-red-300'
                    }`}
                  >
                    {replay.finalOutcome === 'won' ? 'CLEARED' : 'BOOM'}
                  </span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-white/60 font-mono truncate">
                  {replay.mode.toUpperCase()} • LVL {replay.level} • {new Date(replay.recordedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-cyan-950/60 border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/60'
                    : 'bg-black/40 border-white/20 text-white/40'
                }`}
                title={soundEnabled ? 'Mute Replay Sound' : 'Enable Replay Sound'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/60 text-white transition-all cursor-pointer active:scale-95"
                title="Exit Replay"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* MAIN VIEWPORT WITH CANVAS & TELEMETRY OVERLAYS */}
          <div ref={containerRef} className="relative flex-1 w-full overflow-hidden bg-black/40">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* LIVE TELEMETRY OVERLAY */}
            {currentFrame && (
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10 gap-2">
                {/* TOWER GYRO INCLINOMETER */}
                <div className="bg-black/70 backdrop-blur-md border border-cyan-400/40 rounded-2xl p-2.5 shadow-lg flex flex-col gap-1 min-w-[140px] sm:min-w-[160px]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      TILT GYRO
                    </span>
                    <span
                      className={`font-black ${
                        Math.abs(currentFrame.physics.tiltAngle) > 20
                          ? 'text-red-400 animate-pulse'
                          : Math.abs(currentFrame.physics.tiltAngle) > 12
                          ? 'text-amber-300'
                          : 'text-cyan-300'
                      }`}
                    >
                      {currentFrame.physics.tiltAngle > 0 ? '+' : ''}
                      {currentFrame.physics.tiltAngle.toFixed(1)}°
                    </span>
                  </div>

                  {/* Tilt Angle Balance Bar */}
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/20 relative">
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 -translate-x-1/2" />
                    <div
                      className={`h-full transition-all duration-75 ${
                        Math.abs(currentFrame.physics.tiltAngle) > 20
                          ? 'bg-red-500'
                          : Math.abs(currentFrame.physics.tiltAngle) > 12
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                      }`}
                      style={{
                        width: `${Math.min(50, (Math.abs(currentFrame.physics.tiltAngle) / 25) * 50)}%`,
                        marginLeft: currentFrame.physics.tiltAngle >= 0 ? '50%' : undefined,
                        marginRight: currentFrame.physics.tiltAngle < 0 ? '50%' : undefined,
                        float: currentFrame.physics.tiltAngle < 0 ? 'right' : 'left',
                      }}
                    />
                  </div>

                  {/* Tower Stress Meter */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/70 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-amber-400" />
                      STRESS
                    </span>
                    <span className="font-bold text-white">{currentFrame.physics.stressLevel}%</span>
                  </div>
                </div>

                {/* SCORE & COMBO METERS */}
                <div className="bg-black/70 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 shadow-lg flex flex-col items-end text-right min-w-[110px]">
                  <div className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                    REPLAY SCORE
                  </div>
                  <div className="text-base sm:text-lg font-black text-white font-mono leading-none drop-shadow">
                    {currentFrame.score.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px]">
                    <span className="text-cyan-300 font-bold">🧱 {currentFrame.builtCount} BLOCKS</span>
                    {currentFrame.combo >= 2 && (
                      <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-black rounded-md">
                        {currentFrame.combo}x STREAK
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* EVENT NOTIFICATION POPUP */}
            <AnimatePresence>
              {activeEventBadge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -15 }}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                >
                  <div
                    className="px-4 py-1.5 rounded-2xl border-2 backdrop-blur-md shadow-2xl flex items-center gap-2 font-mono font-black text-xs uppercase tracking-wider text-white"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.85)',
                      borderColor: activeEventBadge.color || '#00f2fe',
                    }}
                  >
                    <span>⚡ {activeEventBadge.label}</span>
                    {activeEventBadge.archetype && (
                      <span className="text-[10px] text-cyan-300">({activeEventBadge.archetype})</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM TIMELINE & REPLAY CONTROLS */}
          <div className="px-4 py-3 bg-black/80 border-t border-cyan-500/30 flex flex-col gap-2 shrink-0 z-20">
            {/* TIMELINE SLIDER WITH EVENT BOOKMARKS */}
            <div className="relative w-full flex flex-col gap-1">
              <div className="relative w-full h-3 flex items-center group">
                {/* Background track */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 transition-all duration-75"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </div>

                {/* Event Markers along the timeline */}
                {replay.events.map((evt) => {
                  const markerPos = Math.max(0, Math.min(100, (evt.timeMs / durationMs) * 100));
                  return (
                    <div
                      key={evt.id}
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-black shadow-sm pointer-events-none"
                      style={{
                        left: `${markerPos}%`,
                        backgroundColor: evt.color || '#f59e0b',
                      }}
                      title={`${evt.label} @ ${(evt.timeMs / 1000).toFixed(1)}s`}
                    />
                  );
                })}

                {/* Native range input slider for smooth tactile scrubbing */}
                <input
                  type="range"
                  min="0"
                  max={durationMs}
                  step="25"
                  value={currentTimeMs}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCurrentTimeMs(val);
                    haptics.vibrate(8);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {/* Scrubber Thumb Indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-cyan-400 shadow-md pointer-events-none transform -translate-x-1/2"
                  style={{ left: `${progressRatio * 100}%` }}
                />
              </div>

              {/* Time Readout */}
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 font-bold px-0.5">
                <span>00:{currentSec.padStart(4, '0')}s</span>
                <span className="text-white/50 text-[10px]">SCRUB TIMELINE</span>
                <span>00:{totalSec.padStart(4, '0')}s</span>
              </div>
            </div>

            {/* BUTTON CONTROLS ROW */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {/* Left: Step Back & Reset */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCurrentTimeMs(0);
                    lastTriggeredEventIdRef.current = null;
                    haptics.uiTap();
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
                  title="Restart (0s)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setCurrentTimeMs((t) => Math.max(0, t - 1000));
                    haptics.uiTap();
                  }}
                  className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
                  title="Step Back 1s"
                >
                  -1s
                </button>
              </div>

              {/* Center: Play / Pause Button */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    haptics.uiTap();
                  }}
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_3px_0_#0284c7] flex items-center gap-2 cursor-pointer border border-white/50 active:translate-y-0.5 active:shadow-none"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current stroke-current" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />
                      <span>PLAY</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Right: Speed & Loop Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCurrentTimeMs((t) => Math.min(durationMs, t + 1000));
                    haptics.uiTap();
                  }}
                  className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
                  title="Step Forward 1s"
                >
                  +1s
                </button>

                {/* Speed Toggle (0.5x, 1x, 2x) */}
                <button
                  onClick={() => {
                    const next = playbackSpeed === 0.5 ? 1 : playbackSpeed === 1 ? 2 : 0.5;
                    setPlaybackSpeed(next);
                    haptics.uiTap();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-black transition-all cursor-pointer active:scale-95"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>

                {/* Loop Toggle */}
                <button
                  onClick={() => {
                    setIsLooping(!isLooping);
                    haptics.uiTap();
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                    isLooping
                      ? 'bg-amber-950/70 border-amber-400/70 text-amber-300'
                      : 'bg-white/5 border-white/20 text-white/40'
                  }`}
                  title={isLooping ? 'Looping: ON' : 'Looping: OFF'}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
