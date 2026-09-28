import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { POWERUP_CONFIG } from '../game/techTree';
import { PERK_DEFINITIONS } from '../game/techTree';

function MultiAdViewer({ onComplete }: { onComplete: () => void }) {
  const [adSequence, setAdSequence] = useState<{current: number, total: number, duration: number, timeLeft: number, done?: boolean} | null>(null);
  const hasCompletedRef = React.useRef(false);

  useEffect(() => {
    // Quick sponsor ad viewer (~5 seconds for prototype smoothness)
    setAdSequence({ current: 1, total: 1, duration: 5, timeLeft: 5 });
  }, []);

  useEffect(() => {
    if (!adSequence || adSequence.done) return;
    
    const timer = setInterval(() => {
      setAdSequence(s => {
        if (!s || s.done) return s;
        if (s.timeLeft <= 1) {
          if (s.current < s.total) { 
             return { ...s, current: s.current + 1, timeLeft: s.duration };
          } else { 
             return { ...s, done: true };
          }
        }
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [adSequence?.done]);

  useEffect(() => {
    if (adSequence?.done && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [adSequence?.done, onComplete]);

  if (!adSequence) return null;

  return (
    <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
      <div className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">
        Sponsor Advertisement {adSequence.current} of {adSequence.total}
      </div>
      <div className="w-28 h-28 bg-gradient-to-tr from-cyan-400 to-blue-600 mx-auto rounded-2xl mb-4 flex items-center justify-center animate-pulse shadow-lg text-white">
        <span className="text-4xl">🚀</span>
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">Arcade Blast Pro</h2>
      <p className="text-gray-500 mb-6 font-medium text-sm">Official Sponsor Video. Granting power-up reward in seconds.</p>
      
      <button disabled className="w-full py-4 rounded-full bg-cyan-100 text-cyan-700 font-bold text-lg cursor-not-allowed">
        Claim Reward in {adSequence.timeLeft}s
      </button>
    </div>
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
  } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPlayingReviveAd, setIsPlayingReviveAd] = useState(false);
  const [isPlayingPowerupAd, setIsPlayingPowerupAd] = useState(false);
  const [isPlayingPerkAd, setIsPlayingPerkAd] = useState(false);
  const [isPlayingDoubleCoinsAd, setIsPlayingDoubleCoinsAd] = useState(false);
  const [isPlayingShopAd, setIsPlayingShopAd] = useState(false);

  useEffect(() => {
    if (adState === 'interstitial') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [adState]);

  if (adState === 'none') return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs pointer-events-auto" />

      {/* Bottom Center Modal Container */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-md pointer-events-auto z-10 touch-pan-y flex flex-col justify-between max-h-[85vh] overflow-y-auto"
      >
        {adState === 'interstitial' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full text-center shadow-2xl border-4 border-cyan-400">
            <div className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Advertisement</div>
            <div className="w-28 h-28 bg-gray-200 mx-auto rounded-2xl mb-4 flex items-center justify-center animate-pulse">
              <span className="text-gray-400 text-3xl font-black">Ad</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Cool Mobile Game</h2>
            <p className="text-gray-500 mb-6 font-medium text-sm">Download now for free!</p>
            
            {timeLeft > 0 ? (
              <button disabled className="w-full py-3.5 rounded-full bg-gray-200 text-gray-400 font-bold text-base cursor-not-allowed">
                Wait {timeLeft}s
              </button>
            ) : (
              <button 
                onClick={closeAd}
                className="w-full py-3.5 rounded-full bg-[#59C1FF] hover:bg-[#3FA1DF] text-white font-bold text-base transition-colors active:scale-95 cursor-pointer shadow-md"
              >
                Continue Playing
              </button>
            )}
          </div>
        )}

        {adState === 'rewarded-revive' && (
          isPlayingReviveAd ? (
            <MultiAdViewer onComplete={() => {
              setIsPlayingReviveAd(false);
              acceptRevive();
            }} />
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-3xl w-full text-center shadow-2xl relative overflow-hidden border-4 border-amber-400">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
              
              <h2 className="text-3xl font-black text-gray-800 mb-2 mt-1">BOOM!</h2>
              <p className="text-gray-600 mb-6 font-medium text-sm">Watch a short video to revive and continue building.</p>
              
              <button 
                onClick={() => setIsPlayingReviveAd(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-yellow-400 to-orange-500 text-white font-black text-lg mb-3 transform hover:scale-102 transition-transform shadow-[0_4px_12px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>▶</span> WATCH AD
              </button>
              
              <button 
                onClick={declineRevive}
                className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold text-sm transition-colors active:scale-95 cursor-pointer"
              >
                No thanks, I'll restart
              </button>
            </div>
          )
        )}

        {adState === 'rewarded-double-coins' && (
          isPlayingDoubleCoinsAd ? (
            <MultiAdViewer onComplete={() => {
              setIsPlayingDoubleCoinsAd(false);
              useGameStore.getState().acceptDoubleCoins();
            }} />
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-3xl w-full text-center shadow-2xl relative overflow-hidden border-4 border-amber-400">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
              
              <h2 className="text-3xl font-black text-gray-800 mb-2 mt-1">DOUBLE COINS!</h2>
              <p className="text-gray-600 mb-6 font-medium text-sm">Watch a short video to double your coins.</p>
              
              <button 
                onClick={() => setIsPlayingDoubleCoinsAd(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-yellow-400 to-orange-500 text-white font-black text-lg mb-3 transform hover:scale-102 transition-transform shadow-[0_4px_12px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>▶</span> WATCH AD
              </button>
              
              <button 
                onClick={useGameStore.getState().declineDoubleCoins}
                className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold text-sm transition-colors active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )
        )}

        {adState === 'rewarded-shop-item' && (
          isPlayingShopAd ? (
            <MultiAdViewer onComplete={() => {
              setIsPlayingShopAd(false);
              useGameStore.getState().acceptShopAd();
            }} />
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-3xl w-full text-center shadow-2xl relative overflow-hidden border-4 border-rose-400">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF9A8B] to-[#FF6A88]" />
              
              <h2 className="text-3xl font-black text-gray-800 mb-2 mt-1">UNLOCK ITEM</h2>
              <p className="text-gray-600 mb-6 font-medium text-sm">Watch a short video to unlock this cosmetic item permanently.</p>
              
              <button 
                onClick={() => setIsPlayingShopAd(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-[#FF9A8B] to-[#FF6A88] text-white font-black text-lg mb-3 transform hover:scale-102 transition-transform shadow-[0_4px_12px_rgba(255,106,136,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>▶</span> WATCH AD
              </button>
              
              <button 
                onClick={useGameStore.getState().declineShopAd}
                className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold text-sm transition-colors active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )
        )}

        {adState === 'rewarded-powerup' && pendingPowerupType && (
          (() => {
            const item = POWERUP_CONFIG[pendingPowerupType];
            return isPlayingPowerupAd ? (
              <MultiAdViewer onComplete={() => {
                setIsPlayingPowerupAd(false);
                acceptPowerupAd();
              }} />
            ) : (
              <div className="bg-[#10192e] border-3 border-cyan-400/80 p-6 sm:p-8 rounded-3xl w-full text-center shadow-[0_0_35px_rgba(6,182,212,0.3)] relative overflow-hidden text-white">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-500" />
                
                <div className="text-4xl mb-2">{item.icon}</div>
                <h2 className="text-2xl font-black mb-1">{item.name}</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold mb-3">
                  REWARD: {item.highlight}
                </div>
                <p className="text-white/70 mb-5 font-medium text-xs leading-relaxed">
                  Watch a quick 5-second sponsor clip to add these emergency tactical charges to your loadout.
                </p>
                
                <button 
                  onClick={() => setIsPlayingPowerupAd(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-base mb-2.5 shadow-[0_4px_0_#0369a1] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>▶</span> WATCH SPONSOR CLIP
                </button>
                
                <button 
                  onClick={declinePowerupAd}
                  className="w-full py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            );
          })()
        )}

        {adState === 'rewarded-perk' && pendingPerkId && (
          (() => {
            const perk = PERK_DEFINITIONS[pendingPerkId];
            return isPlayingPerkAd ? (
              <MultiAdViewer onComplete={() => {
                setIsPlayingPerkAd(false);
                acceptPerkAd();
              }} />
            ) : (
              <div className="bg-[#18112e] border-3 border-fuchsia-400/80 p-6 sm:p-8 rounded-3xl w-full text-center shadow-[0_0_35px_rgba(192,38,211,0.3)] relative overflow-hidden text-white">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-fuchsia-400 to-purple-600" />
                
                <div className="text-4xl mb-2">{perk?.icon || '⚡'}</div>
                <h2 className="text-2xl font-black mb-1">R&D SPONSORSHIP</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono text-xs font-bold mb-3">
                  UNLOCK: {perk?.name || 'Tech Upgrade'}
                </div>
                <p className="text-white/70 mb-5 font-medium text-xs leading-relaxed">
                  Watch a quick sponsor video to grant immediate R&D funding and authorize this tech tier upgrade.
                </p>
                
                <button 
                  onClick={() => setIsPlayingPerkAd(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-black text-base mb-2.5 shadow-[0_4px_0_#701a75] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>▶</span> RESEARCH VIA SPONSOR
                </button>
                
                <button 
                  onClick={declinePerkAd}
                  className="w-full py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 font-bold text-xs cursor-pointer"
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

  return null;
}
