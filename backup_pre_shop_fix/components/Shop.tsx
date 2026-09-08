import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { ArrowLeft, Coins, Check, Lock } from 'lucide-react';

const COSMETICS = [
  { id: 'skin-default', name: 'Classic Blocks', type: 'skin', price: 0, requirement: 0 },
  { id: 'skin-neon', name: 'Neon Outlines', type: 'skin', price: 50, requirement: 0 },
  { id: 'skin-gold', name: 'Solid Gold', type: 'skin', price: 100, requirement: 5 },
  { id: 'skin-crystal', name: 'Crystal Prism', type: 'skin', price: 0, requirement: 10 }, // Level 10 unlock
];

export function Shop() {
  const { setMode, coins, ownedCosmetics, equippedCosmetic, unlockedLevels, buyCosmetic, equipCosmetic } = useGameStore();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col w-full h-full max-w-2xl p-6 py-12 relative z-10"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, y: 4 }}
            onClick={() => setMode('menu')}
            className="p-3 bg-[#FF9A8B] border-4 border-white rounded-full mr-6 shadow-[0_6px_0_#d97566] text-white"
          >
            <ArrowLeft className="w-8 h-8" strokeWidth={3} />
          </motion.button>
          <h2 className="text-5xl font-black text-white uppercase tracking-wider" style={{ WebkitTextStroke: '2px #FFD700', textShadow: '0 6px 0 #B8860B' }}>
            SHOP
          </h2>
        </div>
        
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border-2 border-white/20 backdrop-blur-sm">
          <Coins className="w-6 h-6 text-[#FFD700]" />
          <span className="text-white font-black text-xl tabular-nums">{coins}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-6" style={{ scrollbarWidth: 'none' }}>
        <h3 className="text-2xl font-black text-white mb-4" style={{ WebkitTextStroke: '1px #333' }}>BLOCK SKINS</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COSMETICS.map(item => {
            const isOwned = ownedCosmetics.includes(item.id) || item.id === 'skin-default' || (item.requirement > 0 && unlockedLevels >= item.requirement);
            const isEquipped = equippedCosmetic === item.id || (!equippedCosmetic && item.id === 'skin-default');
            const canAfford = coins >= item.price;
            const isLockedByLevel = item.requirement > 0 && unlockedLevels < item.requirement;

            return (
              <motion.div 
                key={item.id}
                whileHover={!isLockedByLevel ? { scale: 1.02 } : {}}
                className={`p-4 rounded-3xl border-4 ${isEquipped ? 'border-[#00ffcc] bg-[#00aa88]/80' : 'border-white/20 bg-black/40'} flex flex-col justify-between`}
              >
                <div>
                  <h4 className="text-xl font-black text-white mb-1">{item.name}</h4>
                  {item.requirement > 0 && (
                    <p className="text-sm text-gray-300 font-bold mb-4">
                      {isLockedByLevel ? (
                        <span className="text-[#FF4500]">Unlocks at Level {item.requirement}</span>
                      ) : (
                        <span className="text-[#00ffcc]">Unlocked (Level {item.requirement})</span>
                      )}
                    </p>
                  )}
                  {item.requirement === 0 && (
                    <p className="text-sm text-gray-300 font-bold mb-4 opacity-0">Spacer</p>
                  )}
                </div>

                {isEquipped ? (
                  <button className="w-full py-3 rounded-2xl bg-[#00ffcc] text-gray-900 font-black text-lg flex items-center justify-center gap-2 shadow-[0_4px_0_#00aa88]">
                    <Check className="w-6 h-6" strokeWidth={3} /> EQUIPPED
                  </button>
                ) : isOwned ? (
                  <button 
                    onClick={() => equipCosmetic(item.id)}
                    className="w-full py-3 rounded-2xl bg-white text-gray-800 hover:bg-gray-100 font-black text-lg transition-colors shadow-[0_4px_0_#d1d5db] active:translate-y-1 active:shadow-[0_0px_0_#d1d5db]"
                  >
                    EQUIP
                  </button>
                ) : isLockedByLevel ? (
                  <button disabled className="w-full py-3 rounded-2xl bg-gray-600 text-gray-400 font-black text-lg flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock className="w-5 h-5" /> LOCKED
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (canAfford) {
                        buyCosmetic(item.id, item.price);
                        equipCosmetic(item.id);
                      }
                    }}
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-colors ${
                      canAfford 
                        ? 'bg-[#FFD700] hover:bg-[#FFE066] text-[#B8860B] shadow-[0_4px_0_#B8860B] active:translate-y-1 active:shadow-[0_0px_0_#B8860B]' 
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-5 h-5" /> {item.price}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
