import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { Coins, X, ShoppingCart } from 'lucide-react';

const COIN_PACKS = [
  { id: 'pack1', coins: 500, price: '$0.99', popular: false },
  { id: 'pack2', coins: 1200, price: '$1.99', popular: true },
  { id: 'pack3', coins: 5000, price: '$4.99', popular: false },
];

export function IAPOverlay() {
  const { showIAP, setShowIAP, addCoins } = useGameStore();

  const handlePurchase = (coins: number) => {
    // Simulate real money purchase
    addCoins(coins);
    setShowIAP(false);
  };

  if (!showIAP) return null;

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
          className="bg-[#190E2D] p-6 rounded-3xl max-w-sm w-full border-4 border-[#FFD700] shadow-[0_10px_25px_rgba(255,215,0,0.3)] relative"
        >
          {/* Close Button */}
          <button 
            onClick={() => setShowIAP(false)}
            className="absolute -top-4 -right-4 p-2 bg-red-500 rounded-full border-2 border-white shadow-md text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-[#FFD700] p-3 rounded-full border-2 border-white mb-2 shadow-lg">
              <ShoppingCart className="w-8 h-8 text-[#B8860B]" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wider" style={{ WebkitTextStroke: '1px black' }}>
              GET COINS
            </h2>
            <p className="text-white/80 font-bold text-sm mt-1">Unlock premium cosmetics faster!</p>
          </div>

          {/* Coin Packs */}
          <div className="flex flex-col gap-4">
            {COIN_PACKS.map(pack => (
              <motion.button
                key={pack.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePurchase(pack.coins)}
                className={`w-full relative flex items-center justify-between p-4 rounded-2xl border-4 transition-all ${
                  pack.popular 
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 border-white shadow-[0_4px_0_#8B0000]' 
                    : 'bg-white/10 border-white/20 hover:border-white/50 hover:bg-white/20'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border-2 border-white z-10 shadow-sm">
                    Most Popular
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="bg-[#FFD700] p-2 rounded-full border-2 border-white/50 shadow-inner">
                    <Coins className="w-6 h-6 text-[#B8860B] fill-current" />
                  </div>
                  <span className={`text-2xl font-black ${pack.popular ? 'text-white' : 'text-[#FFD700]'}`}>
                    {pack.coins.toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-black/30 px-4 py-2 rounded-xl border border-white/20">
                  <span className="text-white font-black">{pack.price}</span>
                </div>
              </motion.button>
            ))}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
