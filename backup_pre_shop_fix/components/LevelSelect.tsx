import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { ArrowLeft, Lock } from 'lucide-react';
import { GameBoard } from './GameBoard';

export function LevelSelect() {
  const { setMode, setLevel, level: currentLevel, unlockedLevels, state, setState } = useGameStore();

  if (state === 'playing' || state === 'won' || state === 'lost') {
    return <GameBoard />;
  }

  const levels = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col w-full h-full max-w-2xl p-6 py-12 relative z-10"
    >
      <div className="flex items-center mb-10">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, y: 4 }}
          onClick={() => setMode('menu')}
          className="p-3 bg-[#FF9A8B] border-4 border-white rounded-full mr-6 shadow-[0_6px_0_#d97566] text-white"
        >
          <ArrowLeft className="w-8 h-8" strokeWidth={3} />
        </motion.button>
        <h2 className="text-5xl font-black text-white uppercase tracking-wider" style={{ WebkitTextStroke: '2px #4facfe', textShadow: '0 6px 0 #2a82c9' }}>
          CAMPAIGN
        </h2>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 flex-1 content-start overflow-y-auto pr-4 pb-12" style={{ scrollbarWidth: 'none' }}>
        {levels.map((lvl) => {
          const isUnlocked = lvl <= unlockedLevels;
          return (
            <motion.button
              key={lvl}
              whileHover={isUnlocked ? { scale: 1.05 } : {}}
              whileTap={isUnlocked ? { scale: 0.95, y: 4, boxShadow: '0 0px 0 transparent' } : {}}
              onClick={() => {
                if (isUnlocked) {
                  setLevel(lvl);
                  setState('playing');
                }
              }}
              disabled={!isUnlocked}
              className={`
                relative aspect-square rounded-3xl flex items-center justify-center text-4xl font-black transition-all border-4
                ${isUnlocked 
                  ? 'bg-[#4facfe] border-white text-white shadow-[0_6px_0_#2a82c9] cursor-pointer' 
                  : 'bg-[#d1d5db] border-[#9ca3af] text-[#9ca3af] shadow-[0_6px_0_#9ca3af] cursor-not-allowed'}
              `}
            >
              {isUnlocked ? (
                 <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{lvl}</span>
              ) : (
                 <Lock className="w-10 h-10" strokeWidth={3} />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
