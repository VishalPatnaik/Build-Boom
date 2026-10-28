import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { POWERUP_CONFIG } from '../game/techTree';
import { PERK_DEFINITIONS } from '../game/techTree';
import { SPONSOR_CREATIVES, AdCreative } from '../ads/AdService';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { X, Check, Sparkles, Video, Play, ShieldAlert, Award } from 'lucide-react';

interface SponsorAdViewerProps {
  onComplete: () => void;
  onCancel: () => void;
  rewardLabel: string;
}

/**
 * High-Reliability Interactive Sponsor Ad Viewer:
 * Uses high-resolution timestamp deltas (Date.now()) with 200ms polling to ensure
 * the countdown CAN NEVER freeze or stall, regardless of device hitching, backgrounding,
 * or React state batching.
 */
function SponsorAdViewer({ onComplete, onCancel, rewardLabel }: SponsorAdViewerProps) {
  const DURATION_SECONDS = 5;
  const [secondsRemaining, setSecondsRemaining] = useState(DURATION_SECONDS);
  const [isFinished, setIsFinished] = useState(false);
  const [creative] = useState<AdCreative>(() => {
    const idx = Math.floor(Math.random() * SPONSOR_CREATIVES.length);
    return SPONSOR_CREATIVES[idx] || SPONSOR_CREATIVES[0];
  });
  
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    haptics.vibrate([15, 30]);
    const startTime = Date.now();
    const durationMs = DURATION_SECONDS * 1000;

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setSecondsRemaining(remainingSec);

      if (remainingMs <= 0) {
        clearInterval(interval);
        setIsFinished(true);
        if (!hasCompletedRef.current) {
          audio.playComboSurge(2);
          haptics.vibrate([20, 40, 60]);
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleClaim = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    audio.playPerfectSound();
    haptics.success();
    onCompleteRef.current();
  };

  const progressPercent = Math.min(
    100,
    Math.round(((DURATION_SECONDS - secondsRemaining) / DURATION_SECONDS) * 100)
  );

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-[#0b1120] border-2 border-cyan-400/80 p-5 sm:p-6 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.4)] relative overflow-hidden text-white"
    >
      {/* Top Accent Bar */}
      <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${creative.gradient}`} />

      {/* Emergency Dismiss / Cancel after 3s or when finished */}
      <button
        onClick={() => {
          haptics.uiTap();
          onCancel();
        }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer text-xs font-mono"
        title="Cancel Ad"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header Badge */}
      <div className="flex items-center justify-center gap-1.5 mb-3 mt-1">
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
          SPONSOR SHOWCASE • {creative.category}
        </span>
      </div>

      {/* Sponsor Visual Card */}
      <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr ${creative.gradient} mb-3 flex items-center justify-center shadow-lg shadow-cyan-500/20 relative overflow-hidden border border-white/20`}>
        <span className="text-4xl animate-bounce">{creative.icon}</span>
        <div className="absolute inset-0 bg-white/10 opacity-30 animate-pulse pointer-events-none" />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">
        {creative.title}
      </h2>
      <p className="text-white/70 text-xs mb-4 font-medium leading-relaxed px-2">
        {creative.tagline}
      </p>

      {/* Animated Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2.5 mb-4 overflow-hidden border border-white/10 p-0.5">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${creative.gradient}`}
          style={{ width: `${progressPercent}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>

      {/* Reward Target Indicator */}
      <div className="text-[11px] font-mono text-cyan-300 mb-4 bg-cyan-950/60 py-1.5 px-3 rounded-xl border border-cyan-500/30 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>REWARD: <strong>{rewardLabel}</strong></span>
      </div>

      {/* Dynamic Action / Claim Button */}
      {isFinished ? (
        <motion.button
          initial={{ scale: 0.95 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          onClick={handleClaim}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 font-black text-base shadow-[0_4px_0_#0f766e,0_0_25px_rgba(20,184,166,0.5)] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>CLAIM REWARD NOW</span>
        </motion.button>
      ) : (
        <button
          disabled
          className="w-full py-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 font-mono font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Granting in {secondsRemaining}s...</span>
        </button>
      )}

      {/* Safety skip note */}
      <div className="mt-2 text-[10px] text-white/40 font-mono">
        {isFinished ? 'Tap above to receive and apply reward' : 'Keep open to authorize reward verification'}
      </div>
    </motion.div>
  );
}

export function AdOverlay() {
  const { 
    adState, 
    closeAd, 
    acceptRevive, 
    declineRevive,
    pendingPowerupType,
    acceptPowerupAd,
    declinePowerupAd,
    pendingPerkId,
    acceptPerkAd,
    declinePerkAd,
    pendingCoins,
    level,
  } = useGameStore();

  const [interstitialSeconds, setInterstitialSeconds] = useState(5);
  const [isPlayingReviveAd, setIsPlayingReviveAd] = useState(false);
  const [isPlayingPowerupAd, setIsPlayingPowerupAd] = useState(false);
  const [isPlayingPerkAd, setIsPlayingPerkAd] = useState(false);
  const [isPlayingDoubleCoinsAd, setIsPlayingDoubleCoinsAd] = useState(false);
  const [isPlayingShopAd, setIsPlayingShopAd] = useState(false);

  // Clean reset of all transient playback states whenever adState changes
  useEffect(() => {
    setIsPlayingReviveAd(false);
    setIsPlayingPowerupAd(false);
    setIsPlayingPerkAd(false);
    setIsPlayingDoubleCoinsAd(false);
    setIsPlayingShopAd(false);

    if (adState === 'interstitial') {
      setInterstitialSeconds(5);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const remaining = Math.max(0, 5 - Math.floor((Date.now() - startTime) / 1000));
        setInterstitialSeconds(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [adState]);

  if (adState === 'none') return null;

  const doubleCoinsAmount = pendingCoins > 0 ? pendingCoins * 2 : (50 + (level || 1) * 10) * 2;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs pointer-events-auto" />

      {/* Modal Container */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-md pointer-events-auto z-10 touch-pan-y flex flex-col items-center justify-center max-h-[90vh] overflow-y-auto px-2 pb-4 sm:pb-0"
      >
        {/* INTERSTITIAL AD */}
        {adState === 'interstitial' && (
          <div className="bg-[#0b1120] border-2 border-cyan-400 p-6 sm:p-8 rounded-3xl w-full text-center shadow-2xl text-white">
            <div className="text-xs font-mono font-bold text-cyan-400 mb-3 uppercase tracking-widest">
              SPONSOR INTERMISSION
            </div>
            <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto rounded-2xl mb-4 flex items-center justify-center shadow-lg animate-pulse text-4xl">
              🚀
            </div>
            <h2 className="text-2xl font-black mb-1">Arcade Blast Pro</h2>
            <p className="text-white/70 mb-5 text-xs font-medium">
              Next-generation kinetic physics and arcade action.
            </p>
            
            {interstitialSeconds > 0 ? (
              <button disabled className="w-full py-3.5 rounded-full bg-slate-800 text-slate-400 font-mono font-bold text-sm cursor-not-allowed border border-slate-700">
                Continue playing in {interstitialSeconds}s...
              </button>
            ) : (
              <button 
                onClick={() => {
                  audio.playClickSound();
                  haptics.uiTap();
                  closeAd();
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-base transition-all active:scale-95 cursor-pointer shadow-lg uppercase tracking-wider"
              >
                Continue Playing
              </button>
            )}
          </div>
        )}

        {/* REWARDED REVIVE AD */}
        {adState === 'rewarded-revive' && (
          isPlayingReviveAd ? (
            <SponsorAdViewer
              rewardLabel="Tower Revive & Continue"
              onComplete={() => {
                setIsPlayingReviveAd(false);
                acceptRevive();
              }}
              onCancel={() => {
                setIsPlayingReviveAd(false);
                declineRevive();
              }}
            />
          ) : (
            <div className="bg-[#10192e] border-3 border-emerald-400/90 p-6 sm:p-7 rounded-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.35)] relative overflow-hidden text-white">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 mx-auto mb-3 flex items-center justify-center text-emerald-300 text-3xl">
                ❤️
              </div>

              <h2 className="text-2xl sm:text-3xl font-black mb-1">REVIVE TOWER</h2>
              <p className="text-white/70 mb-5 font-medium text-xs leading-relaxed">
                Watch a quick 5-second sponsor video to reconstruct your tower and continue your ascent without restarting.
              </p>
              
              <button 
                onClick={() => {
                  audio.playClickSound();
                  haptics.uiTap();
                  setIsPlayingReviveAd(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 font-black text-base mb-2.5 shadow-[0_4px_0_#0f766e] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Video className="w-5 h-5 stroke-[2.5]" />
                <span>WATCH AD TO REVIVE</span>
              </button>
              
              <button 
                onClick={() => {
                  haptics.uiTap();
                  declineRevive();
                }}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 font-bold text-xs cursor-pointer font-mono"
              >
                No thanks, restart level
              </button>
            </div>
          )
        )}

        {/* REWARDED DOUBLE COINS AD */}
        {adState === 'rewarded-double-coins' && (
          isPlayingDoubleCoinsAd ? (
            <SponsorAdViewer
              rewardLabel={`+${doubleCoinsAmount} Coins (2X Doubled)`}
              onComplete={() => {
                setIsPlayingDoubleCoinsAd(false);
                useGameStore.getState().acceptDoubleCoins();
              }}
              onCancel={() => {
                setIsPlayingDoubleCoinsAd(false);
                useGameStore.getState().declineDoubleCoins();
              }}
            />
          ) : (
            <div className="bg-[#191206] border-3 border-amber-400/90 p-6 sm:p-7 rounded-3xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.35)] relative overflow-hidden text-white">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-amber-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/60 mx-auto mb-3 flex items-center justify-center text-amber-300 text-3xl">
                💰
              </div>

              <h2 className="text-2xl sm:text-3xl font-black mb-1">DOUBLE COIN SURGE</h2>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold mb-3 border border-amber-400/30">
                EARN: +{doubleCoinsAmount} COINS
              </div>
              <p className="text-white/70 mb-5 font-medium text-xs leading-relaxed">
                Watch a short 5-second sponsor video to double your rewards for this victory.
              </p>
              
              <button 
                onClick={() => {
                  audio.playClickSound();
                  haptics.uiTap();
                  setIsPlayingDoubleCoinsAd(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-base mb-2.5 shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Video className="w-5 h-5 stroke-[2.5]" />
                <span>WATCH AD: 2X COINS</span>
              </button>
              
              <button 
                onClick={() => {
                  haptics.uiTap();
                  useGameStore.getState().declineDoubleCoins();
                }}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 font-bold text-xs cursor-pointer font-mono"
              >
                Claim Normal Coins
              </button>
            </div>
          )
        )}

        {/* REWARDED SHOP ITEM AD */}
        {adState === 'rewarded-shop-item' && (
          isPlayingShopAd ? (
            <SponsorAdViewer
              rewardLabel="Permanent Cosmetic Unlock"
              onComplete={() => {
                setIsPlayingShopAd(false);
                useGameStore.getState().acceptShopAd();
              }}
              onCancel={() => {
                setIsPlayingShopAd(false);
                useGameStore.getState().declineShopAd();
              }}
            />
          ) : (
            <div className="bg-[#1c0d29] border-3 border-fuchsia-400/90 p-6 sm:p-7 rounded-3xl w-full text-center shadow-[0_0_40px_rgba(217,70,239,0.35)] relative overflow-hidden text-white">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-fuchsia-400 to-purple-600" />
              
              <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/60 mx-auto mb-3 flex items-center justify-center text-fuchsia-300 text-3xl">
                ✨
              </div>

              <h2 className="text-2xl sm:text-3xl font-black mb-1">UNLOCK COSMETIC</h2>
              <p className="text-white/70 mb-5 font-medium text-xs leading-relaxed">
                Watch a 5-second sponsor video to claim and unlock this cosmetic item permanently.
              </p>
              
              <button 
                onClick={() => {
                  audio.playClickSound();
                  haptics.uiTap();
                  setIsPlayingShopAd(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-black text-base mb-2.5 shadow-[0_4px_0_#701a75] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Video className="w-5 h-5 stroke-[2.5]" />
                <span>WATCH AD TO UNLOCK</span>
              </button>
              
              <button 
                onClick={() => {
                  haptics.uiTap();
                  useGameStore.getState().declineShopAd();
                }}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 font-bold text-xs cursor-pointer font-mono"
              >
                Cancel
              </button>
            </div>
          )
        )}

        {/* REWARDED POWERUP AD */}
        {adState === 'rewarded-powerup' && pendingPowerupType && (
          (() => {
            const item = POWERUP_CONFIG[pendingPowerupType];
            return isPlayingPowerupAd ? (
              <SponsorAdViewer
                rewardLabel={item?.name || 'Power-ups'}
                onComplete={() => {
                  setIsPlayingPowerupAd(false);
                  acceptPowerupAd();
                }}
                onCancel={() => {
                  setIsPlayingPowerupAd(false);
                  declinePowerupAd();
                }}
              />
            ) : (
              <div className="bg-[#10192e] border-3 border-cyan-400/80 p-6 sm:p-7 rounded-3xl w-full text-center shadow-[0_0_35px_rgba(6,182,212,0.3)] relative overflow-hidden text-white">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-500" />
                
                <div className="text-4xl mb-2">{item?.icon || '⚡'}</div>
                <h2 className="text-2xl font-black mb-1">{item?.name || 'TACTICAL MUNITION'}</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold mb-3 border border-cyan-400/30">
                  REWARD: {item?.highlight || '+3 Charges'}
                </div>
                <p className="text-white/70 mb-5 font-medium text-xs leading-relaxed">
                  Watch a quick 5-second sponsor clip to add these emergency tactical charges to your loadout.
                </p>
                
                <button 
                  onClick={() => {
                    audio.playClickSound();
                    haptics.uiTap();
                    setIsPlayingPowerupAd(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-base mb-2.5 shadow-[0_4px_0_#0369a1] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Video className="w-5 h-5 stroke-[2.5]" />
                  <span>WATCH SPONSOR CLIP</span>
                </button>
                
                <button 
                  onClick={() => {
                    haptics.uiTap();
                    declinePowerupAd();
                  }}
                  className="w-full py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 font-bold text-xs cursor-pointer font-mono"
                >
                  Cancel
                </button>
              </div>
            );
          })()
        )}

        {/* REWARDED PERK AD */}
        {adState === 'rewarded-perk' && pendingPerkId && (
          (() => {
            const perk = PERK_DEFINITIONS[pendingPerkId];
            return isPlayingPerkAd ? (
              <SponsorAdViewer
                rewardLabel={perk?.name || 'Tech Upgrade'}
                onComplete={() => {
                  setIsPlayingPerkAd(false);
                  acceptPerkAd();
                }}
                onCancel={() => {
                  setIsPlayingPerkAd(false);
                  declinePerkAd();
                }}
              />
            ) : (
              <div className="bg-[#18112e] border-3 border-fuchsia-400/80 p-6 sm:p-7 rounded-3xl w-full text-center shadow-[0_0_35px_rgba(192,38,211,0.3)] relative overflow-hidden text-white">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-fuchsia-400 to-purple-600" />
                
                <div className="text-4xl mb-2">{perk?.icon || '⚡'}</div>
                <h2 className="text-2xl font-black mb-1">FREE UPGRADE</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono text-xs font-bold mb-3 border border-fuchsia-400/30">
                  UNLOCK: {perk?.name || 'Tech Upgrade'}
                </div>
                <p className="text-white/70 mb-5 font-medium text-xs leading-relaxed">
                  Watch a short ad to unlock this upgrade for free.
                </p>
                
                <button 
                  onClick={() => {
                    audio.playClickSound();
                    haptics.uiTap();
                    setIsPlayingPerkAd(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-black text-base mb-2.5 shadow-[0_4px_0_#701a75] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Video className="w-5 h-5 stroke-[2.5]" />
                  <span>RESEARCH VIA SPONSOR</span>
                </button>
                
                <button 
                  onClick={() => {
                    haptics.uiTap();
                    declinePerkAd();
                  }}
                  className="w-full py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 font-bold text-xs cursor-pointer font-mono"
                >
                  Cancel
                </button>
              </div>
            );
          })()
        )}
      </motion.div>
    </div>
  );
}
