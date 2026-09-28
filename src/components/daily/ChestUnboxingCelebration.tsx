import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MysteryChestDefinition, CosmeticSkinReward } from '../../game/dailyStore';
import { useGameStore } from '../../game/store';
import { renderBlock } from '../../game/themeRenderer';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';
import { Sparkles, Coins, Zap, Shield, Snowflake, CheckCircle2, Check, Award, Crown } from 'lucide-react';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';

interface ChestUnboxingCelebrationProps {
  chest: MysteryChestDefinition;
  bonusCoins: number;
  powerup?: {
    type: 'stasis' | 'emp' | 'shield';
    count: number;
  };
  cosmeticSkin?: CosmeticSkinReward;
  isOpen: boolean;
  onClose: () => void;
}

// Live Canvas renderer for the unlocked cosmetic block skin
function CosmeticBlockCanvas({ skinId }: { skinId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number = 0;
    let startTime = performance.now();

    const render = (now: number) => {
      const time = now - startTime;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw subtle holographic dais underneath
      ctx.save();
      const centerX = w / 2;
      const centerY = h / 2 + 35;
      const daisGrad = safeCreateRadialGradient(ctx, centerX, centerY, 5, centerX, centerY, 45);
      if (daisGrad) {
        daisGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
        daisGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.25)');
        daisGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = daisGrad;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 45, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Holographic ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Render the actual animated block skin
      renderBlock(ctx, w / 2 - 32, h / 2 - 38, 64, 64, skinId, false, time);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skinId]);

  return (
    <canvas 
      ref={canvasRef} 
      width={120} 
      height={120} 
      className="w-28 h-28 mx-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" 
    />
  );
}

export const ChestUnboxingCelebration: React.FC<ChestUnboxingCelebrationProps> = ({
  chest,
  bonusCoins,
  powerup,
  cosmeticSkin,
  isOpen,
  onClose
}) => {
  const [opened, setOpened] = useState(false);
  const [isEquipped, setIsEquipped] = useState(false);
  const { equipCosmetic, equippedCosmetic } = useGameStore();

  useEffect(() => {
    if (cosmeticSkin && equippedCosmetic === cosmeticSkin.id) {
      setIsEquipped(true);
    } else {
      setIsEquipped(false);
    }
  }, [cosmeticSkin, equippedCosmetic]);

  useEffect(() => {
    if (isOpen) {
      setOpened(false);
      // Auto open chest after short suspense pause
      const timer = setTimeout(() => {
        setOpened(true);
        audio.playPerfectSound();
        audio.playComboSurge(3);
        haptics.blockPlaced('prism');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEquipSkin = () => {
    if (!cosmeticSkin) return;
    equipCosmetic(cosmeticSkin.id, 'skin');
    setIsEquipped(true);
    audio.playBuildSound(1.4);
    haptics.blockPlaced('gold_ingot');
  };

  const getPowerupDetails = (type: 'stasis' | 'emp' | 'shield') => {
    switch (type) {
      case 'stasis':
        return {
          title: 'Stasis Coolant',
          icon: <Snowflake className="w-5 h-5 text-cyan-400" />,
          desc: 'Freezes tower block oscillation for 8 seconds'
        };
      case 'emp':
        return {
          title: 'EMP Disruptor',
          icon: <Zap className="w-5 h-5 text-purple-400" />,
          desc: 'Instantly resets explosive kinetic hazards'
        };
      case 'shield':
        return {
          title: 'Kinetic Shield',
          icon: <Shield className="w-5 h-5 text-amber-400" />,
          desc: 'Absorbs 1 catastrophic structural collapse'
        };
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/92 backdrop-blur-xl"
        />

        {/* Floating Celebration Confetti Particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: `${(i * 4.2) % 100}vw`, 
                y: -20, 
                opacity: 0,
                rotate: 0,
                scale: 0.6 + (i % 4) * 0.2
              }}
              animate={{ 
                y: '105vh', 
                opacity: [0, 1, 1, 0],
                rotate: 360 * (i % 2 === 0 ? 1 : -1)
              }}
              transition={{ 
                duration: 2.8 + (i % 5) * 0.4, 
                repeat: Infinity, 
                delay: (i * 0.15),
                ease: 'easeInOut' 
              }}
              className={`absolute w-3 h-3 rounded-sm ${
                i % 3 === 0 
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' 
                  : i % 3 === 1 
                  ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' 
                  : 'bg-purple-400 shadow-[0_0_8px_#c084fc]'
              }`}
            />
          ))}
        </div>

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`
            relative w-full max-w-lg p-5 sm:p-6 rounded-3xl border-3 backdrop-blur-2xl font-mono text-slate-100 shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden z-20 flex flex-col items-center text-center my-auto
            ${chest.borderClass}
            bg-gradient-to-b ${chest.bgGradient}
          `}
        >
          {/* Light Rays Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="w-96 h-96 rounded-full opacity-35 blur-2xl"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${chest.glowColor} 45deg, transparent 90deg, ${chest.glowColor} 135deg, transparent 180deg, ${chest.glowColor} 225deg, transparent 270deg, ${chest.glowColor} 315deg, transparent 360deg)`
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center w-full">
            {/* Top Celebration Badge */}
            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border tracking-widest mb-2 flex items-center gap-1.5 ${
              chest.rarity === 'legendary' 
                ? 'bg-amber-500/25 text-amber-300 border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                : 'bg-cyan-500/25 text-cyan-300 border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
            }`}>
              {opened ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span>CELEBRATION: CHEST UNLOCKED!</span>
                </>
              ) : (
                <span>PREPARING CHEST UNBOXING...</span>
              )}
            </span>

            {/* Chest Animation Container */}
            <div className="relative my-2 flex items-center justify-center">
              {!opened ? (
                <motion.div
                  animate={{ 
                    rotate: [-4, 4, -4],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.22,
                    ease: 'easeInOut'
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-900 border-2 border-white/40 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl"
                  style={{ boxShadow: `0 0 45px ${chest.glowColor}` }}
                >
                  {chest.icon}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 220 }}
                  className="relative"
                >
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl"
                    style={{ boxShadow: `0 0 45px ${chest.glowColor}` }}
                  >
                    {chest.icon}
                  </div>
                  <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-300 animate-spin" />
                </motion.div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white drop-shadow">
              {chest.name}
            </h2>

            {/* Revealed Loot Container */}
            <AnimatePresence>
              {opened && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full mt-3 space-y-3"
                >
                  {/* ======================================================== */}
                  {/* CELEBRATORY COSMETIC SKIN REWARD CARD (PRIMARY SPOTLIGHT) */}
                  {/* ======================================================== */}
                  {cosmeticSkin && (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, type: 'spring', damping: 12 }}
                      className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/95 via-amber-950/40 to-slate-900/95 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] relative overflow-hidden"
                    >
                      {/* Aura rays and scanline */}
                      <div className="absolute inset-0 bg-cyber-scanlines opacity-15 pointer-events-none" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

                      {/* Header Pill */}
                      <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/60 text-[9px] font-black uppercase tracking-widest animate-pulse">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>NEW COSMETIC SKIN UNLOCKED!</span>
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          cosmeticSkin.rarity === 'legendary'
                            ? 'bg-amber-500/30 text-amber-200 border-amber-400/80'
                            : cosmeticSkin.rarity === 'epic'
                            ? 'bg-purple-500/30 text-purple-200 border-purple-400/80'
                            : 'bg-cyan-500/30 text-cyan-200 border-cyan-400/80'
                        }`}>
                          {cosmeticSkin.rarity.toUpperCase()} SKIN
                        </span>
                      </div>

                      {/* Animated Block Skin Canvas Preview */}
                      <div className="relative z-10 my-1 flex justify-center">
                        <CosmeticBlockCanvas skinId={cosmeticSkin.id} />
                      </div>

                      {/* Skin Name & Lore */}
                      <div className="relative z-10 mt-1">
                        <h4 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase tracking-wide">
                          {cosmeticSkin.name}
                        </h4>
                        <p className="text-xs text-slate-300 font-sans mt-0.5 line-clamp-2 max-w-sm mx-auto">
                          {cosmeticSkin.desc}
                        </p>
                      </div>

                      {/* Action to Equip Skin Immediately */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-center gap-2 relative z-10">
                        {!isEquipped ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEquipSkin}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.6)] cursor-pointer flex items-center gap-1.5"
                          >
                            <Award className="w-4 h-4 fill-slate-950" />
                            <span>EQUIP SKIN NOW</span>
                          </motion.button>
                        ) : (
                          <div className="px-4 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                            <span>EQUIPPED AS ACTIVE SKIN</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ======================================================== */}
                  {/* COIN JACKPOT & POWERUP LOOT GRID                         */}
                  {/* ======================================================== */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Coin Loot */}
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-400/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shadow font-black text-base shrink-0">
                          <Coins className="w-4 h-4 fill-slate-950" />
                        </div>
                        <div>
                          <div className="text-[9px] text-amber-300/80 uppercase font-black">BONUS COINS</div>
                          <div className="text-sm font-black text-amber-300 leading-tight">
                            +{bonusCoins} COINS
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50">
                        BANKED
                      </span>
                    </motion.div>

                    {/* Powerup Loot */}
                    {powerup && (() => {
                      const p = getPowerupDetails(powerup.type);
                      return (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-400/60 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 text-left">
                            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                              {p.icon}
                            </div>
                            <div>
                              <div className="text-[9px] text-cyan-300 uppercase font-black">POWERUP</div>
                              <div className="text-xs font-black text-white leading-tight">
                                +{powerup.count}x {p.title}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50">
                            READY
                          </span>
                        </motion.div>
                      );
                    })()}
                  </div>

                  {/* Dismiss Button */}
                  <motion.button
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      haptics.blockPlaced('gold_ingot');
                      onClose();
                    }}
                    className="w-full mt-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-slate-950 fill-current" />
                    <span>COLLECT ALL REWARDS</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
