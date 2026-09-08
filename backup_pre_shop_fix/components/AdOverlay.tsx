import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';

export function AdOverlay() {
  const { adState, closeAd, acceptRevive, declineRevive } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(5);

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

  if (adState === 'interstitial') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-6"
      >
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
          <div className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Advertisement</div>
          <div className="w-32 h-32 bg-gray-200 mx-auto rounded-2xl mb-6 flex items-center justify-center animate-pulse">
            <span className="text-gray-400 text-4xl">Ad</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-4">Cool Mobile Game</h2>
          <p className="text-gray-500 mb-8 font-medium">Download now for free!</p>
          
          {timeLeft > 0 ? (
            <button disabled className="w-full py-4 rounded-full bg-gray-200 text-gray-400 font-bold text-lg cursor-not-allowed">
              Wait {timeLeft}s
            </button>
          ) : (
            <button 
              onClick={closeAd}
              className="w-full py-4 rounded-full bg-[#59C1FF] hover:bg-[#3FA1DF] text-white font-bold text-lg transition-colors active:scale-95"
            >
              Continue Playing
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (adState === 'rewarded-revive') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-6"
      >
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
          
          <h2 className="text-3xl font-black text-gray-800 mb-2 mt-2">BOOM!</h2>
          <p className="text-gray-600 mb-8 font-medium">Watch a short video to revive and continue building.</p>
          
          <button 
            onClick={acceptRevive}
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-yellow-400 to-orange-500 text-white font-black text-xl mb-4 transform hover:scale-105 transition-transform shadow-[0_5px_15px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-2"
          >
            <span>▶</span> WATCH AD
          </button>
          
          <button 
            onClick={declineRevive}
            className="w-full py-3 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold text-lg transition-colors active:scale-95"
          >
            No thanks, I'll restart
          </button>
        </div>
      </motion.div>
    );
  }

  if (adState === 'rewarded-double-coins') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-6"
      >
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
          
          <h2 className="text-3xl font-black text-gray-800 mb-2 mt-2">DOUBLE COINS!</h2>
          <p className="text-gray-600 mb-8 font-medium">Watch a short video to double your coins.</p>
          
          <button 
            onClick={useGameStore.getState().acceptDoubleCoins}
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-yellow-400 to-orange-500 text-white font-black text-xl mb-4 transform hover:scale-105 transition-transform shadow-[0_5px_15px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-2"
          >
            <span>▶</span> WATCH AD
          </button>
          
          <button 
            onClick={useGameStore.getState().declineDoubleCoins}
            className="w-full py-3 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold text-lg transition-colors active:scale-95"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
