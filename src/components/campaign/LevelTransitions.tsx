import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZONE_NAMES } from './WorldDefinitions';
import { COLLECTIONS } from '../../game/collections';
import { THEME_PALETTES } from '../../game/themeRenderer';
import { Sparkles, ArrowRight, CheckCircle2, Compass, Layers } from 'lucide-react';
import { audio } from '../../audio/AudioEngine';

interface LevelIntroBannerProps {
  level: number;
  mode: string;
  totalBlocks: number;
}

/**
 * Smooth, non-blocking holographic banner that slides down at the start of a level,
 * presenting the world name, level objectives, and featured materials.
 */
export function LevelIntroBanner({ level, mode, totalBlocks }: LevelIntroBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const zoneIndex = Math.floor(Math.max(0, level - 1) / 10) % 20;
  const worldNumber = zoneIndex + 1;
  const levelInZone = ((level - 1) % 10) + 1;
  const biomeName = ZONE_NAMES[zoneIndex] || 'The Frontier';
  const collection = COLLECTIONS[zoneIndex] || COLLECTIONS[0];
  const palette = THEME_PALETTES[zoneIndex] || THEME_PALETTES[0];

  const primaryCol = palette.primary || '#22c55e';
  const accentCol = palette.accent || '#fbbf24';
  const glowCol = palette.glow || 'rgba(34, 197, 94, 0.4)';

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [level, mode]);

  if (mode !== 'campaign') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          className="fixed top-2 sm:top-3 left-0 right-0 z-30 flex justify-center pointer-events-none px-4 select-none"
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative px-3.5 py-1 rounded-full bg-slate-950/85 border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-2 max-w-sm overflow-hidden"
            style={{
              borderColor: `${accentCol}66`,
              boxShadow: `0 4px 16px rgba(0,0,0,0.8), 0 0 12px ${glowCol}`,
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full animate-ping shrink-0" 
              style={{ backgroundColor: primaryCol }} 
            />
            <span className="text-[10px] font-mono font-black text-white/90 uppercase tracking-wider">
              LVL {level}
            </span>
            <span className="text-white/30">•</span>
            <span 
              className="text-[10px] font-mono font-black uppercase tracking-wider truncate"
              style={{ color: accentCol }}
            >
              {biomeName}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[9px] font-mono text-cyan-300 font-bold shrink-0">
              {totalBlocks} BLKS
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface LevelWarpCurtainProps {
  isActive: boolean;
  fromLevel: number;
  toLevel: number;
  onTransitionComplete: () => void;
}

/**
 * Cinematic sci-fi level transition curtain that sweeps across the screen
 * when warping between campaign levels, providing tactile progression feedback.
 */
export function LevelWarpCurtain({
  isActive,
  fromLevel,
  toLevel,
  onTransitionComplete,
}: LevelWarpCurtainProps) {
  const destZoneIdx = Math.floor(Math.max(0, toLevel - 1) / 10) % 20;
  const destWorldNum = destZoneIdx + 1;
  const destBiomeName = ZONE_NAMES[destZoneIdx] || 'The Frontier';
  const destCollection = COLLECTIONS[destZoneIdx] || COLLECTIONS[0];
  const destPalette = THEME_PALETTES[destZoneIdx] || THEME_PALETTES[0];

  const primaryCol = destPalette.primary || '#22c55e';
  const accentCol = destPalette.accent || '#fbbf24';
  const glowCol = destPalette.glow || 'rgba(34, 197, 94, 0.5)';

  const onCompleteRef = useRef(onTransitionComplete);
  onCompleteRef.current = onTransitionComplete;
  const completedRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      completedRef.current = false;
      audio.playComboSurge(3);
      const timer = setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
      }, 450);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isActive]);

  const handleSkipTransition = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="warp-curtain-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none', filter: 'blur(8px)' }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          onClick={handleSkipTransition}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md overflow-hidden select-none pointer-events-auto cursor-pointer"
        >
          {/* Radiant Speed-Warp Light Conduits */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <motion.div
              initial={{ scale: 0.2, opacity: 0.2, rotate: 0 }}
              animate={{ scale: [0.2, 2.2], opacity: [0.6, 0], rotate: 180 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${glowCol} 0%, transparent 70%)`,
              }}
            />
            {/* Speed Lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1.4, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.4, delay: i * 0.02, ease: 'easeInOut' }}
                className="absolute h-[2px] w-full"
                style={{
                  top: `${12 + i * 10}%`,
                  background: `linear-gradient(90deg, transparent 0%, ${primaryCol} 50%, transparent 100%)`,
                }}
              />
            ))}
          </div>

          {/* Central Warp Card */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.08, opacity: 0, y: -15, filter: 'blur(6px)' }}
            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
            className="relative z-10 px-8 py-6 rounded-3xl bg-[#090d16]/95 border-2 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-w-sm sm:max-w-md w-full mx-4 flex flex-col items-center text-center"
            style={{
              borderColor: accentCol,
              boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 35px ${glowCol}`,
            }}
          >
            {/* Previous Level Cleared Tag */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LEVEL {fromLevel} CLEARED</span>
            </div>

            {/* Warping Headline */}
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">
              EXPEDITION WARP INITIATED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 font-mono mt-1">
              WARPING TO LEVEL {toLevel}
            </h2>

            {/* Destination Realm Details */}
            <div className="w-full mt-4 p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                  DESTINATION BIOME // WORLD {String(destWorldNum).padStart(2, '0')}
                </span>
                <span 
                  className="text-base sm:text-lg font-black font-mono uppercase"
                  style={{ color: primaryCol }}
                >
                  {destBiomeName}
                </span>
                <span className="text-[10px] font-mono text-slate-300 mt-0.5">
                  {destCollection.block.name}
                </span>
              </div>
              <Compass className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            {/* Warp Energy Progress Bar */}
            <div className="w-full mt-5">
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${primaryCol}, ${accentCol})`,
                    boxShadow: `0 0 12px ${accentCol}`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1.5 px-0.5">
                <span>CONDUIT ENGAGED</span>
                <span className="text-white font-bold">ENTERING ARENA</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Stage entry shutter - non-intrusive safe component
 */
export function LevelStageShutter() {
  return null;
}
