import React, { useEffect } from 'react';
import { Coins, Zap, Shield, Snowflake, Sparkles, CheckCircle2, Gift, Flame, Crown, Award, X } from 'lucide-react';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';

export interface DailyRewardPayload {
  title: string;
  subtitle?: string;
  coins: number;
  multiplier?: number;
  powerup?: {
    type: 'stasis' | 'emp' | 'shield';
    name: string;
    count: number;
  };
  bonusTag?: string;
  type?: 'checkin' | 'mission' | 'all_complete' | 'streak_vault';
}

interface DailyRewardRevealModalProps {
  reward: DailyRewardPayload | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DailyRewardRevealModal({
  reward,
  isOpen,
  onClose
}: DailyRewardRevealModalProps) {
  useEffect(() => {
    if (isOpen && reward) {
      audio.playPerfectSound();
      haptics.vibrate([25, 40, 25]);
    }
  }, [isOpen, reward]);

  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden select-none">
      
      {/* 1. CSS Rotating Multi-Ray Sunburst Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div 
          className="w-[180vw] h-[180vw] max-w-[900px] max-h-[900px] rounded-full pointer-events-none animate-reward-sunburst opacity-25"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg 15deg, rgba(245, 158, 11, 0.45) 15deg 30deg, transparent 30deg 45deg, rgba(234, 179, 8, 0.5) 45deg 60deg, transparent 60deg 75deg, rgba(245, 158, 11, 0.45) 75deg 90deg, transparent 90deg 105deg, rgba(234, 179, 8, 0.5) 105deg 120deg, transparent 120deg 135deg, rgba(245, 158, 11, 0.45) 135deg 150deg, transparent 150deg 165deg, rgba(234, 179, 8, 0.5) 165deg 180deg, transparent 180deg 195deg, rgba(245, 158, 11, 0.45) 195deg 210deg, transparent 210deg 225deg, rgba(234, 179, 8, 0.5) 225deg 240deg, transparent 240deg 255deg, rgba(245, 158, 11, 0.45) 255deg 270deg, transparent 270deg 285deg, rgba(234, 179, 8, 0.5) 285deg 300deg, transparent 300deg 315deg, rgba(245, 158, 11, 0.45) 315deg 330deg, transparent 330deg 345deg, rgba(234, 179, 8, 0.5) 345deg 360deg)'
          }}
        />
      </div>

      {/* 2. Expanding CSS Golden Shockwave Pulse */}
      <div className="absolute w-44 h-44 rounded-full border-2 border-amber-300 pointer-events-none animate-reward-shockwave" />

      {/* 3. Glowing Ambient Breath Circle */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none animate-reward-glow" />

      {/* 4. Main Reveal Card with CSS Spring Pop */}
      <div className="relative z-10 w-full max-w-sm bg-[#130b24]/95 border-2 border-amber-400/80 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] p-6 text-center overflow-hidden animate-reward-pop">
        
        {/* CSS Diagonal Gloss Shimmer moving across card */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-24 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-reward-shimmer" />
        </div>

        {/* Top Eyebrow Tag */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{reward.bonusTag || 'DIRECTIVE REWARD UNLOCKED'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Central Reward Emblem with CSS Floating Bob */}
        <div className="relative my-3 flex flex-col items-center justify-center">
          <div className="animate-reward-bob">
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center border-2 border-white/60">
              <div className="w-full h-full rounded-[22px] bg-[#22103a] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-tactical-dots opacity-20" />
                {reward.coins > 0 ? (
                  <Coins className="w-12 h-12 text-amber-300 fill-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                ) : reward.powerup ? (
                  reward.powerup.type === 'shield' ? (
                    <Shield className="w-12 h-12 text-emerald-400 fill-emerald-400/40" />
                  ) : reward.powerup.type === 'stasis' ? (
                    <Snowflake className="w-12 h-12 text-cyan-400" />
                  ) : (
                    <Zap className="w-12 h-12 text-purple-400 fill-purple-400/40" />
                  )
                ) : (
                  <Gift className="w-12 h-12 text-amber-300" />
                )}
              </div>
            </div>
          </div>

          {/* Secondary Coin Geyser Badge */}
          {reward.coins > 0 && (
            <div className="animate-reward-coin mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 shadow-md">
                <Coins className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span className="font-mono font-black text-amber-300 text-sm">
                  +{reward.coins.toLocaleString()}
                </span>
                {reward.multiplier && reward.multiplier > 1 && (
                  <span className="text-[10px] font-mono font-bold text-amber-200 bg-amber-500/30 px-1.5 py-0.2 rounded">
                    {reward.multiplier.toFixed(1)}x
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Title and Subtitle */}
        <h3 className="text-xl font-black text-white uppercase tracking-tight font-mono mt-1 drop-shadow-md">
          {reward.title}
        </h3>
        {reward.subtitle && (
          <p className="text-xs text-white/70 mt-1 px-2 leading-relaxed">
            {reward.subtitle}
          </p>
        )}

        {/* Bonus Powerup Item Loot Card if present */}
        {reward.powerup && (
          <div className="mt-3 p-2.5 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                {reward.powerup.type === 'shield' ? <Shield className="w-4 h-4" /> : reward.powerup.type === 'stasis' ? <Snowflake className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{reward.powerup.name}</div>
                <div className="text-[10px] font-mono text-cyan-300">TACTICAL CHARGE GRANTED</div>
              </div>
            </div>
            <span className="font-mono font-black text-sm text-cyan-300">
              +{reward.powerup.count}
            </span>
          </div>
        )}

        {/* Collect Action Button */}
        <button
          onClick={() => {
            audio.playClickSound();
            haptics.uiTap();
            onClose();
          }}
          className="w-full mt-5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_0_#b45309,0_0_20px_rgba(245,158,11,0.5)] active:translate-y-1 active:shadow-none transition-all"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>Collect Reward</span>
        </button>
      </div>
    </div>
  );
}
