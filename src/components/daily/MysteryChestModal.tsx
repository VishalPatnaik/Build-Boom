import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MysteryChestDefinition } from '../../game/dailyStore';
import { X, Sparkles, Shield, Zap, Snowflake, Coins, Gift, ChevronRight } from 'lucide-react';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';

interface MysteryChestModalProps {
  chest: MysteryChestDefinition | null;
  unlockDayLabel?: string;
  daysRemaining?: number;
  isOpen: boolean;
  onClose: () => void;
  onTestUnbox?: (chestId: string) => void;
}

export const MysteryChestModal: React.FC<MysteryChestModalProps> = ({
  chest,
  unlockDayLabel,
  daysRemaining,
  isOpen,
  onClose,
  onTestUnbox
}) => {
  if (!isOpen || !chest) return null;

  const handleTestUnbox = () => {
    audio.playBuildSound(1.3);
    haptics.blockPlaced('gold_ingot');
    if (onTestUnbox) {
      onTestUnbox(chest.id);
    }
  };

  const getPowerupIcon = (type?: 'stasis' | 'emp' | 'shield') => {
    switch (type) {
      case 'stasis':
        return <Snowflake className="w-4 h-4 text-cyan-400" />;
      case 'emp':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'shield':
        return <Shield className="w-4 h-4 text-amber-400" />;
      default:
        return <Gift className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`
            relative w-full max-w-md p-5 sm:p-6 rounded-3xl border-2 backdrop-blur-xl font-mono text-slate-100 shadow-2xl overflow-hidden z-10
            ${chest.borderClass}
            bg-gradient-to-b ${chest.bgGradient}
          `}
        >
          {/* Cyber Scanlines & Ambient Glow */}
          <div className="absolute inset-0 bg-cyber-scanlines opacity-20 pointer-events-none" />
          <div 
            className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: chest.glowColor }}
          />

          {/* Close Button */}
          <button
            onClick={() => {
              haptics.uiTap();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Chest Presentation Header */}
          <div className="flex flex-col items-center text-center pt-2 relative z-10">
            {/* Animated 3D Floating Chest Icon */}
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotateZ: [0, -2, 2, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3, 
                ease: 'easeInOut' 
              }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_35px_rgba(255,255,255,0.2)] border-2 border-white/30 bg-slate-900/90 mb-3"
              style={{
                boxShadow: `0 0 35px ${chest.glowColor}`
              }}
            >
              <span>{chest.icon}</span>
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-300 animate-spin" />
            </motion.div>

            {/* Rarity & Timing Tag */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border tracking-widest ${
                chest.rarity === 'legendary' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/60' 
                  : chest.rarity === 'epic' 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/60' 
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60'
              }`}>
                {chest.rarityLabel}
              </span>

              {daysRemaining !== undefined && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {daysRemaining === 0 ? '🟢 UNLOCKED TODAY' : daysRemaining === 1 ? '⚡ UNLOCKS TOMORROW' : `⏳ UNLOCKS IN ${daysRemaining} DAYS`}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white drop-shadow">
              {chest.name}
            </h3>

            <p className="text-xs text-slate-300 font-sans mt-1 max-w-xs leading-relaxed">
              {chest.description}
            </p>
          </div>

          {/* Guaranteed Contents & Loot Perks */}
          <div className="mt-5 space-y-2 relative z-10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span>GUARANTEED CHEST CARGO</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Guaranteed Cosmetic Skin */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-400/60 flex items-center gap-2.5 sm:col-span-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-amber-300 uppercase font-black tracking-wider flex items-center gap-1.5">
                    <span>GUARANTEED REWARD</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-[8px] text-amber-200">100% UNLOCK</span>
                  </div>
                  <div className="text-xs font-black text-white uppercase truncate">
                    Random Cosmetic Tower Skin
                  </div>
                </div>
              </div>

              {/* Coin Range */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">COIN JACKPOT</div>
                  <div className="text-xs font-black text-amber-300 truncate">
                    +{chest.minBonusCoins} - {chest.maxBonusCoins}
                  </div>
                </div>
              </div>

              {/* Powerup Charge */}
              {chest.guaranteedPowerup && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    {getPowerupIcon(chest.guaranteedPowerup)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">TACTICAL CHARGE</div>
                    <div className="text-xs font-black text-white uppercase truncate">
                      +{chest.powerupCount}x {chest.guaranteedPowerup.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Perks list */}
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 space-y-1 mt-2">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                CHEST SPECIFICATIONS
              </div>
              {chest.perks.map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-sans">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Lore Flavor */}
            <p className="text-[10px] text-slate-400 font-sans italic pt-1 px-1">
              "{chest.lore}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-3 relative z-10">
            {onTestUnbox && (
              <button
                onClick={handleTestUnbox}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Unbox Preview</span>
              </button>
            )}

            <button
              onClick={() => {
                haptics.uiTap();
                onClose();
              }}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-95"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
