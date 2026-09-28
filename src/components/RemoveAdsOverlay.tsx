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
      <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4">
        {/* Backdrop Overlay */}
        <div 
          onClick={() => setShowRemoveAds(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto cursor-pointer"
        />

        {/* Bottom Center Modal Sheet */}
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-[#190E2D] p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-red-500 shadow-[0_-12px_45px_rgba(239,68,68,0.35)] pointer-events-auto z-10 touch-pan-y flex flex-col justify-between max-h-[85vh] overflow-y-auto"
        >
          {/* Top Grab Handle */}
          <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-2 shrink-0 cursor-pointer" onClick={() => setShowRemoveAds(false)} />
          {/* Close Button */}
          <button 
            onClick={() => setShowRemoveAds(false)}
            className="absolute top-3.5 right-3.5 sm:-top-3 sm:-right-3 p-2 bg-gray-500 rounded-full border-2 border-white shadow-md text-white hover:bg-gray-600 transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
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
      </div>
    </AnimatePresence>
  );
}
