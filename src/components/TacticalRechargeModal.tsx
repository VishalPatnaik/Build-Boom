import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { POWERUP_CONFIG, PowerupType } from '../game/techTree';
import { X, Coins, Video, Check, ShieldAlert, Sparkles, Gift, Zap, ChevronRight, Plus } from 'lucide-react';
import { audio } from '../audio/AudioEngine';

interface TacticalRechargeModalProps {
  initialType?: PowerupType;
  isOpen: boolean;
  onClose: () => void;
  onPurchased?: (type: PowerupType) => void;
}

export function TacticalRechargeModal({
  initialType = 'stasis',
  isOpen,
  onClose,
  onPurchased,
}: TacticalRechargeModalProps) {
  const [selectedType, setSelectedType] = useState<PowerupType>(initialType);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const { coins, powerups, buyPowerupWithCoins, showPowerupAd, setShowIAP, addCoins } = useGameStore();

  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType);
      setPurchaseNotice(null);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const currentItem = POWERUP_CONFIG[selectedType] || POWERUP_CONFIG['stasis'];
  const canAfford = coins >= currentItem.coinPrice;

  const handleBuyWithCoins = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!canAfford) return;

    audio.playComboSurge(2);
    const success = buyPowerupWithCoins(selectedType);
    if (success) {
      setPurchaseNotice(`✓ Added ${currentItem.name} (${currentItem.highlight})!`);
      if (onPurchased) {
        setTimeout(() => {
          onPurchased(selectedType);
        }, 600);
      } else {
        setTimeout(() => setPurchaseNotice(null), 2500);
      }
    }
  };

  const handleWatchAd = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    audio.playBuildSound(1.1);
    showPowerupAd(selectedType);
  };

  const handleClaimGiftCoins = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    audio.playComboSurge(1.5);
    addCoins(100);
    setPurchaseNotice('🎁 Airdrop received! +100 Coins added!');
    setTimeout(() => setPurchaseNotice(null), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4"
      >
        {/* Backdrop Overlay */}
        <div 
          onClick={onClose}
          onTouchStart={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto cursor-pointer"
        />

        {/* Bottom Center Drawer Card - Leaves top & middle playfield clearly visible */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#101b33] to-[#090d19] border-t-2 sm:border-2 border-cyan-400/60 rounded-t-3xl sm:rounded-3xl shadow-[0_-12px_45px_rgba(0,0,0,0.85)] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto overscroll-contain text-white select-none pointer-events-auto z-50 touch-pan-y max-h-[85vh]"
        >
          {/* Top Grab Handle */}
          <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-2 shrink-0 cursor-pointer" onClick={onClose} />
          {/* Top subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            onTouchStart={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-3.5 sm:top-4 right-3.5 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-3 pr-8 sm:pr-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-black uppercase tracking-widest mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>TACTICAL ARSENAL RE-ARM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white drop-shadow">
              Field Power-Ups
            </h2>
            <p className="text-xs text-white/70 mt-0.5">
              Acquire emergency tactical charges using your Coins or Sponsor Ads.
            </p>
          </div>

          {/* Current Balance & Inventory Bar */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-2.5 sm:p-3 mb-3 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/60 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">YOUR COIN BALANCE:</span>
              <button
                type="button"
                onClick={() => setShowIAP(true)}
                onTouchStart={(e) => { e.stopPropagation(); setShowIAP(true); }}
                className="flex items-center gap-1.5 bg-[#FFD700]/20 hover:bg-[#FFD700]/30 border border-[#FFD700]/50 px-2.5 py-1 rounded-full text-amber-300 font-black text-xs sm:text-sm cursor-pointer transition-all active:scale-95"
                title="Get More Coins (Coin Purchase Vault)"
              >
                <Coins className="w-4 h-4 fill-current text-amber-400 shrink-0" />
                <span>{coins.toLocaleString()} Coins</span>
                <div className="bg-[#FFD700] text-amber-950 rounded-md p-0.5 ml-0.5 border border-yellow-200">
                  <Plus className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </button>
            </div>

            <div className="flex items-center justify-around pt-1 border-t border-white/10 text-[10px] sm:text-[11px]">
              <div className="flex items-center gap-1">
                <span>⏳ Stasis:</span>
                <span className="font-bold text-cyan-300 tabular-nums">{powerups.stasis}</span>
              </div>
              <div className="w-[1px] h-3 bg-white/20" />
              <div className="flex items-center gap-1">
                <span>⚡ EMP:</span>
                <span className="font-bold text-amber-300 tabular-nums">{powerups.emp}</span>
              </div>
              <div className="w-[1px] h-3 bg-white/20" />
              <div className="flex items-center gap-1">
                <span>🛡️ Shield:</span>
                <span className="font-bold text-sky-300 tabular-nums">{powerups.shield}</span>
              </div>
            </div>
          </div>

          {/* Purchase Notice Banner */}
          {purchaseNotice && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/20 border-2 border-emerald-400/80 rounded-xl p-2 mb-3 flex items-center justify-center gap-2 text-emerald-300 font-mono text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
            >
              <Check className="w-4 h-4 text-emerald-300 shrink-0" strokeWidth={3} />
              <span className="truncate">{purchaseNotice}</span>
            </motion.div>
          )}

          {/* Power-up Selector Tabs */}
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-3 min-w-0">
            {(['stasis', 'emp', 'shield', 'bundle'] as PowerupType[]).map((type) => {
              const item = POWERUP_CONFIG[type];
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  onTouchStart={(e) => { e.stopPropagation(); setSelectedType(type); }}
                  className={`p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer min-w-0 ${
                    isSelected
                      ? 'bg-cyan-500/30 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-102'
                      : 'bg-black/30 hover:bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{item.icon}</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase truncate max-w-full">
                    {type === 'bundle' ? 'CRATE' : type}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono text-amber-300 font-bold truncate">
                    {item.coinPrice}🪙
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Item Detail Card */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 mb-3.5">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xl shrink-0">
                  {currentItem.icon}
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    {currentItem.badge}
                  </div>
                  <h3 className="font-black text-base text-white leading-tight">
                    {currentItem.name}
                  </h3>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-mono font-bold shrink-0">
                {currentItem.highlight}
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">{currentItem.desc}</p>
          </div>

          {/* Action Buttons: 1. Pay with Coins | 2. Watch Ad */}
          <div className="space-y-2.5">
            {/* Purchase with Coins */}
            <button
              onClick={handleBuyWithCoins}
              onTouchStart={handleBuyWithCoins}
              disabled={!canAfford}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none'
                  : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-950 fill-amber-950" />
                <span>{canAfford ? 'Buy With Coins' : 'Need More Coins'}</span>
              </div>
              <span className="font-mono text-base font-black flex items-center gap-1">
                {currentItem.coinPrice} 🪙
              </span>
            </button>

            {/* Watch Ad (Free Option) */}
            <button
              onClick={handleWatchAd}
              onTouchStart={handleWatchAd}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between shadow-[0_4px_0_#0369a1] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-200" />
                <span>Watch Sponsor Ad</span>
              </div>
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold">
                FREE {currentItem.highlight}
              </span>
            </button>

            {/* If low on coins, give direct airdrop boost button */}
            {!canAfford && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={handleClaimGiftCoins}
                  onTouchStart={handleClaimGiftCoins}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 border border-pink-400/50 text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-pink-200" />
                  <span>Claim +100 Coins Airdrop</span>
                </button>
                <button
                  onClick={() => setShowIAP(true)}
                  onTouchStart={() => setShowIAP(true)}
                  className="text-xs text-amber-300 hover:underline font-mono cursor-pointer px-2 py-1"
                >
                  Vault &rarr;
                </button>
              </div>
            )}

            {/* Direct Navigation to Architect Academy */}
            <button
              type="button"
              onClick={() => {
                audio.playBuildSound(1.2);
                onClose();
                useGameStore.getState().setState('idle');
                useGameStore.getState().setMode('academy');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-bold flex items-center justify-between cursor-pointer transition-all shadow-sm active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Upgrade Perks in Tech Academy</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
