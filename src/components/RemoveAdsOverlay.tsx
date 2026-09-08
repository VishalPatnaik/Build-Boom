import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { X, ShieldCheck } from 'lucide-react';

export function RemoveAdsOverlay() {
  const { showRemoveAds, setShowRemoveAds, removeAds } = useGameStore();

  const handlePurchase = () => {
    // Simulate real money purchase
    removeAds();
    setShowRemoveAds(false);
  };

  if (!showRemoveAds) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-[100] p-4 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-[#190E2D] p-6 rounded-3xl max-w-sm w-full border-4 border-red-500 shadow-[0_10px_25px_rgba(239,68,68,0.3)] relative"
        >
          {/* Close Button */}
          <button 
            onClick={() => setShowRemoveAds(false)}
            className="absolute -top-4 -right-4 p-2 bg-gray-500 rounded-full border-2 border-white shadow-md text-white hover:bg-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-red-500 p-3 rounded-full border-2 border-white mb-2 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wider" style={{ WebkitTextStroke: '1px black' }}>
              REMOVE ADS
            </h2>
            <p className="text-white/80 font-bold text-sm mt-1">Enjoy an uninterrupted experience.</p>
          </div>

          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePurchase}
              className="w-full relative flex items-center justify-center gap-4 p-4 rounded-2xl border-4 bg-gradient-to-r from-orange-400 to-red-500 border-white shadow-[0_4px_0_#8B0000] transition-all"
            >
              <span className="text-2xl font-black text-white">
                $4.99
              </span>
            </motion.button>
            <p className="text-center text-xs text-white/60 font-medium">
              Permanent removal of all random interstitial ads. 
              <br />
              (Rewarded ads will still be available for optional bonuses).
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
