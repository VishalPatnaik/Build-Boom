import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDailyStore } from '../../game/dailyStore';
import { useGameStore } from '../../game/store';
import { ArrowLeft, CheckCircle2, Coins, Gift } from 'lucide-react';

export function DailyMissions() {
  const { setMode } = useGameStore();
  const { tasks, bonusClaimed, initDaily, claimReward, claimBonus } = useDailyStore();

  useEffect(() => {
    initDaily();
  }, [initDaily]);

  const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col w-full h-full max-w-2xl p-6 py-12 relative z-10 mx-auto"
    >
      <div className="flex items-center mb-8">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, y: 4 }}
          onClick={() => setMode('menu')}
          className="p-3 bg-[#FF9A8B] border-4 border-white rounded-full mr-6 shadow-[0_6px_0_#d97566] text-white"
        >
          <ArrowLeft className="w-8 h-8" strokeWidth={3} />
        </motion.button>
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider" style={{ WebkitTextStroke: '2px #c2410c', textShadow: '0 6px 0 #9a3412' }}>
            DAILY
          </h2>
          <div className="text-xl font-black text-[#FFD700] uppercase tracking-wide drop-shadow-md">
            MISSIONS
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-12 space-y-4" style={{ scrollbarWidth: 'none' }}>
        {tasks.map((task) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              relative p-4 rounded-3xl border-4 shadow-[0_6px_0_#00000030] flex flex-col md:flex-row items-start md:items-center justify-between gap-4
              ${task.completed ? 'bg-[#7CFC00] border-[#228B22]' : 'bg-white border-gray-200'}
            `}
          >
            <div className="flex-1">
              <h3 className={`text-xl font-black uppercase ${task.completed ? 'text-[#228B22]' : 'text-gray-800'}`}>
                {task.title}
              </h3>
              <p className={`text-sm font-bold ${task.completed ? 'text-[#1e7a1e]' : 'text-gray-500'}`}>
                {task.description}
              </p>
              
              {!task.completed && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
                    <div 
                      className="h-full bg-[#4facfe]"
                      style={{ width: `${(task.progress / task.target) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-black text-gray-400 tabular-nums">
                    {task.progress} / {task.target}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {task.completed ? (
                task.rewardClaimed ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/10 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-[#228B22]" />
                    <span className="font-black text-[#228B22]">CLAIMED</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      claimReward(task.id);
                      useGameStore.getState().addCoins(task.reward);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-[#FFD700] border-4 border-white shadow-[0_4px_0_#B8860B] rounded-full active:translate-y-1 active:shadow-none"
                  >
                    <span className="font-black text-[#B8860B]">CLAIM</span>
                    <div className="flex items-center gap-1 font-black text-[#B8860B]">
                      +{task.reward} <Coins className="w-5 h-5 fill-[#B8860B]" />
                    </div>
                  </motion.button>
                )
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-gray-200 rounded-full">
                  <div className="flex items-center gap-1 font-black text-gray-400">
                    +{task.reward} <Coins className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Completion Bonus */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            relative p-5 mt-8 rounded-3xl border-4 shadow-[0_6px_0_#00000030] flex flex-col items-center justify-center text-center gap-3
            ${allCompleted ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-white' : 'bg-gray-100 border-gray-300 opacity-70'}
          `}
        >
          <Gift className={`w-12 h-12 ${allCompleted ? 'text-white drop-shadow-md' : 'text-gray-400'}`} />
          <div>
            <h3 className={`text-2xl font-black uppercase tracking-wide ${allCompleted ? 'text-white drop-shadow-sm' : 'text-gray-500'}`}>
              ALL MISSIONS COMPLETE
            </h3>
            <p className={`font-bold ${allCompleted ? 'text-white/90' : 'text-gray-400'}`}>
              Complete all daily missions for a bonus!
            </p>
          </div>
          
          {allCompleted && !bonusClaimed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                claimBonus();
                useGameStore.getState().addCoins(10);
              }}
              className="mt-2 flex items-center gap-2 px-8 py-3 bg-white border-4 border-white shadow-[0_4px_0_#d1d5db] text-[#B8860B] rounded-full font-black uppercase text-xl active:translate-y-1 active:shadow-none"
            >
              CLAIM BONUS +10 <Coins className="w-6 h-6 fill-[#B8860B]" />
            </motion.button>
          )}
          {allCompleted && bonusClaimed && (
             <div className="mt-2 flex items-center gap-2 px-6 py-2 bg-black/10 rounded-full font-black text-white/90 uppercase">
                <CheckCircle2 className="w-6 h-6" /> BONUS CLAIMED
             </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
