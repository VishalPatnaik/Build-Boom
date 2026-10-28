import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { useWorldTheme } from '../hooks/useWorldTheme';
import { Sparkles, Layers, RefreshCw, Cpu } from 'lucide-react';

export interface UnifiedLoadingOverlayProps {
  /**
   * Optional manual override for active state.
   * If not provided, binds automatically to store.isAssetTransitioning
   */
  active?: boolean;
  /**
   * Optional manual message override.
   * If not provided, binds to store.transitionMessage
   */
  message?: string | null;
  /**
   * Optional secondary subtitle / detail text
   */
  subtext?: string;
  /**
   * Visual style variant:
   * - 'pulse': Subtle tactical pulse badge (default)
   * - 'fullscreen': Full backdrop with central energy ring
   * - 'minimal': Compact floating indicator
   */
  variant?: 'pulse' | 'fullscreen' | 'minimal';
}

/**
 * UnifiedLoadingOverlay:
 * Uses Framer Motion to display an animated pulse during asset transitions
 * and shop transactions, providing real-time visual feedback while the engine
 * updates world-specific shaders, textures, or cosmetic items.
 */
export function UnifiedLoadingOverlay({
  active,
  message,
  subtext,
  variant = 'pulse',
}: UnifiedLoadingOverlayProps) {
  const storeIsTransitioning = useGameStore((s) => s.isAssetTransitioning);
  const storeMessage = useGameStore((s) => s.transitionMessage);
  const worldTheme = useWorldTheme();

  // Resolve whether active and which message to display
  const isVisible = active !== undefined ? active : storeIsTransitioning;
  const displayMessage = message !== undefined && message !== null
    ? message
    : (storeMessage || 'Updating World Shaders & Textures...');

  const palette = worldTheme.palette;
  const accentColor = palette.accent || '#06b6d4';
  const glowColor = palette.glow || '#22d3ee';
  const primaryColor = palette.primary || '#3b82f6';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="unified-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[999] pointer-events-none flex items-center justify-center overflow-hidden"
          style={worldTheme.cssVariables}
          aria-live="polite"
          aria-busy="true"
        >
          {/* Subtle Ambient Radial Vignette Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2.5px]"
            style={{
              background: `radial-gradient(circle at center, transparent 35%, rgba(3, 7, 18, 0.65) 100%)`,
            }}
          />

          {/* Central Animated Pulse Container */}
          <div className="relative flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto">
            {/* Concentric Expanding Ripple Ring 1 */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{
                scale: [0.75, 1.45, 2.1],
                opacity: [0.7, 0.35, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute w-36 h-36 rounded-full border-2 border-dashed pointer-events-none"
              style={{
                borderColor: accentColor,
                boxShadow: `0 0 28px ${glowColor}`,
              }}
            />

            {/* Concentric Expanding Ripple Ring 2 (Staggered offset) */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{
                scale: [0.75, 1.35, 1.95],
                opacity: [0.65, 0.25, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: 0.6,
                ease: 'easeOut',
              }}
              className="absolute w-36 h-36 rounded-full border pointer-events-none"
              style={{
                borderColor: primaryColor,
                boxShadow: `0 0 20px ${glowColor}`,
              }}
            />

            {/* Tactical Hexagonal / Circular Core Card */}
            <motion.div
              initial={{ scale: 0.85, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: -6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative z-10 flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border-2 backdrop-blur-xl shadow-2xl bg-slate-950/85 overflow-hidden min-w-[240px] max-w-sm"
              style={{
                borderColor: `${accentColor}80`,
                boxShadow: `0 0 35px ${glowColor}40, inset 0 0 20px ${primaryColor}15`,
              }}
            >
              {/* Top Dynamic Scanline Energy Beam */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: 'easeInOut',
                }}
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                }}
              />

              {/* Pulsing Tactical Core Icon */}
              <div className="relative flex items-center justify-center">
                {/* Glowing Core Halo */}
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0.85, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-12 h-12 rounded-full blur-md"
                  style={{ backgroundColor: glowColor }}
                />

                {/* Rotating Outer Gyro Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: 'linear',
                  }}
                  className="w-11 h-11 rounded-full border-2 border-t-transparent flex items-center justify-center relative z-10"
                  style={{
                    borderColor: `${accentColor}70`,
                    borderTopColor: 'transparent',
                  }}
                >
                  {/* Counter-rotating Inner Icon */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: 'linear',
                    }}
                  >
                    <Layers className="w-5 h-5 stroke-[2.2]" style={{ color: accentColor }} />
                  </motion.div>
                </motion.div>
              </div>

              {/* Feedback Status Typography */}
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[12px] font-mono font-black uppercase tracking-wider text-slate-100 flex items-center gap-1"
                  >
                    <span>{displayMessage}</span>
                  </span>
                  {/* Subtle 3-dot Animated Progress Pulse */}
                  <div className="flex items-center gap-1 ml-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{
                          opacity: [0.2, 1, 0.2],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.9,
                          delay: i * 0.2,
                          ease: 'easeInOut',
                        }}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                    ))}
                  </div>
                </div>

                {/* Environment / World Identifier Tag */}
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
                  <span className="text-slate-300 font-bold tracking-wide">
                    {worldTheme.worldName}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 uppercase text-[9px] tracking-widest">
                    {subtext || 'Engine Sync'}
                  </span>
                </div>
              </div>

              {/* Bottom Subtle Shimmer Bar */}
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/10 mt-1">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: ['0%', '70%', '100%'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: 'easeInOut',
                  }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                    boxShadow: `0 0 10px ${glowColor}`,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
