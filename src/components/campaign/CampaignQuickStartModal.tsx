import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/store';
import { Play, Sparkles, CheckCircle2, ShieldAlert, Award, X } from 'lucide-react';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';

interface CampaignQuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function CampaignQuickStartModal({ isOpen, onClose, onStart }: CampaignQuickStartModalProps) {
  const { completeCampaignTutorial } = useGameStore();

  if (!isOpen) return null;

  const handleStart = () => {
    audio.playBuildSound(1.2);
    haptics.vibrate(20);
    onStart();
  };

  const handleSkip = () => {
    audio.playBuildSound(0.9);
    completeCampaignTutorial();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto cursor-pointer"
        />

        {/* Bottom Sheet Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-md bg-[#180E29] p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-400 shadow-[0_-12px_45px_rgba(0,0,0,0.95)] flex flex-col pointer-events-auto z-10 touch-pan-y max-h-[90vh] overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Top Grab Handle */}
          <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3 shrink-0" />

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 border border-amber-200 flex items-center justify-center text-xl shadow-lg shrink-0">
                🏗️
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  ARCHITECT ONBOARDING
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wide leading-tight drop-shadow">
                  Quick-Start Guide
                </h3>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition-all cursor-pointer"
              title="Skip Guide"
              aria-label="Skip Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Briefing */}
          <p className="text-xs text-white/80 leading-relaxed mb-3.5">
            Stack your <strong className="text-amber-300">first 3 blocks</strong> with active safety dampeners. Learn the timing sweet spot before facing full gravity collapse!
          </p>

          {/* 3 Step Interactive Visual Cards */}
          <div className="space-y-2 mb-4">
            {/* Step 1 */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-emerald-500/40 shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="flex-1 text-left leading-snug">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Timing Sweet Spot</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    Green Ring
                  </span>
                </div>
                <div className="text-[11px] text-white/70 mt-0.5">
                  Tap <span className="text-emerald-300 font-bold">only</span> when incoming blocks enter the glowing target reticle.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-cyan-500/40 shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="flex-1 text-left leading-snug">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Laser Trajectory Tracking</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    Angles
                  </span>
                </div>
                <div className="text-[11px] text-white/70 mt-0.5">
                  Blocks arrive from different angles. Follow the trajectory line into the center platform.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-amber-500/40 shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="flex-1 text-left leading-snug">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Zero-Collapse Safety Net</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-white/70 mt-0.5">
                  Early misclicks are absorbed! Emergency stasis triggers if you miss the window.
                </div>
              </div>
            </div>
          </div>

          {/* Reward Callout */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/40 mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-300 fill-amber-300/30" />
              <span className="text-xs font-bold text-amber-200">Completion Certification:</span>
            </div>
            <span className="font-mono font-black text-xs text-amber-300 tracking-wide">
              +150 GOLD COINS
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_6px_0_#b45309,0_8px_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 border-2 border-amber-200 cursor-pointer active:translate-y-1 active:shadow-none transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START QUICK-START GUIDE</span>
            </motion.button>

            <button
              onClick={handleSkip}
              className="w-full py-2 text-center text-xs font-bold text-white/50 hover:text-white/80 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Skip to Campaign Map
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
