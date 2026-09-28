// CINEMATIC TILES - REALISTIC THEMED BIOME NODES & BANNERS
import React from 'react';
import { motion } from 'framer-motion';
import { ZONE_CONFIGS, ZONE_NAMES } from './WorldDefinitions';

export function CinematicTile({ zoneIdx, state }: { zoneIdx: number; state: 'locked' | 'unlocked' | 'current' }) {
  const config = ZONE_CONFIGS[zoneIdx] || ZONE_CONFIGS[0];
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const filterStyle = isLocked ? { filter: 'grayscale(100%) brightness(35%)' } : {};

  // Atmospheric particle generator specific to realm
  const renderParticles = (color: string, count: number, speed: number) => {
    if (!isCurrent) return null;
    return Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: Math.random() * 3 + 2 + 'px',
          height: Math.random() * 3 + 2 + 'px',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
          left: `${15 + Math.random() * 70}%`,
          top: '50%',
          zIndex: 0
        }}
        animate={{
          y: [-20, -55],
          x: (Math.random() - 0.5) * 25,
          opacity: [0, 1, 0],
          scale: [0.6, 1.3, 0.6]
        }}
        transition={{
          duration: speed + Math.random() * 1.5,
          repeat: Infinity,
          delay: Math.random() * 1.5,
          ease: 'easeOut'
        }}
      />
    ));
  };

  const getTileGraphic = () => {
    const accent = config.ambient || '#22c55e';
    const pathCol = config.path || '#16a34a';

    switch (zoneIdx) {
      // 0: Spring Meadow (Vibrant verdant flora & leaf)
      case 0:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.97, 1.03, 0.97] } : {}} transition={{ duration: 2.5, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(34,197,94,0.6)] overflow-visible">
              <path d="M50,15 C70,25 80,45 80,65 C80,80 65,85 50,85 C35,85 20,80 20,65 C20,45 30,25 50,15 Z" fill="#15803d" stroke="#22c55e" strokeWidth="2.5" />
              <path d="M50,20 Q65,40 50,80" stroke="#86efac" strokeWidth="2" fill="none" />
              <circle cx="50" cy="48" r="8" fill="#fbbf24" />
              <circle cx="50" cy="48" r="4" fill="#ffffff" />
            </svg>
          </motion.div>
        );

      // 1: Lunar Surface (Stark craters & Apollo landing beacon)
      case 1:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { rotate: [-2, 2, -2] } : {}} transition={{ duration: 3, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(148,163,184,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="32" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
              <circle cx="40" cy="42" r="7" fill="#1e293b" />
              <circle cx="62" cy="58" r="9" fill="#1e293b" />
              <circle cx="44" cy="66" r="4" fill="#1e293b" />
              <line x1="50" y1="20" x2="50" y2="8" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="50" cy="7" r="3" fill="#38bdf8" />
            </svg>
          </motion.div>
        );

      // 2: Martian Canyon (Red planet rust canyon & moons)
      case 2:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.97, 1.03, 0.97] } : {}} transition={{ duration: 2, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(234,88,12,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="32" fill="#7c2d12" stroke="#ea580c" strokeWidth="2.5" />
              <path d="M22,50 Q50,40 78,50 Q50,60 22,50 Z" fill="#9a3412" />
              <circle cx="50" cy="50" r="8" fill="#f97316" />
            </svg>
          </motion.div>
        );

      // 3: Deep Space Nebula (Swirling stellar clouds & star)
      case 3:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { rotate: [0, 360] } : {}} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_14px_rgba(168,85,247,0.7)] overflow-visible">
              <circle cx="50" cy="50" r="30" fill="#1e0b36" stroke="#a855f7" strokeWidth="2" />
              <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#38bdf8" strokeWidth="2" transform="rotate(-25 50 50)" />
              <circle cx="50" cy="50" r="9" fill="#ffffff" />
            </svg>
          </motion.div>
        );

      // 4: Abyssal Coral Reef (Ocean shell & pearl)
      case 4:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { y: [-3, 3, -3] } : {}} transition={{ duration: 3, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="30" fill="#032b4f" stroke="#06b6d4" strokeWidth="2.5" />
              <path d="M30,68 Q50,30 70,68 Z" fill="#0891b2" />
              <circle cx="50" cy="50" r="9" fill="#ffffff" stroke="#22d3ee" strokeWidth="2" />
            </svg>
          </motion.div>
        );

      // 5: Tropical Sunset Beach (Sunset sun & palm fronds)
      case 5:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.97, 1.03, 0.97] } : {}} transition={{ duration: 2.5, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="30" fill="#701a75" stroke="#f59e0b" strokeWidth="2.5" />
              <circle cx="50" cy="48" r="16" fill="#f59e0b" />
              <path d="M22,65 Q50,60 78,65 L78,78 L22,78 Z" fill="#0f766e" />
            </svg>
          </motion.div>
        );

      // 6: Volcanic Caldera (Molten magma fissure)
      case 6:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { rotate: [-2, 2, -2] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_14px_rgba(239,68,68,0.7)] overflow-visible">
              <polygon points="50,18 82,78 18,78" fill="#270808" stroke="#ef4444" strokeWidth="2.5" />
              <circle cx="50" cy="56" r="14" fill="#ea580c" />
              <circle cx="50" cy="56" r="7" fill="#fbbf24" />
            </svg>
          </motion.div>
        );

      // 7: Ancient Citadel (Stone fortress battlement)
      case 7:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { y: [-2, 2, -2] } : {}} transition={{ duration: 3, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(100,116,139,0.5)] overflow-visible">
              <rect x="25" y="32" width="50" height="46" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
              <rect x="25" y="24" width="12" height="12" fill="#334155" />
              <rect x="44" y="24" width="12" height="12" fill="#334155" />
              <rect x="63" y="24" width="12" height="12" fill="#334155" />
              <path d="M44,78 L44,62 Q50,56 56,62 L56,78 Z" fill="#f59e0b" />
            </svg>
          </motion.div>
        );

      // 8: Enchanted Redwood Forest (Towering heartwood & spore)
      case 8:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.96, 1.04, 0.96] } : {}} transition={{ duration: 2.8, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(16,185,129,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="30" fill="#022c22" stroke="#10b981" strokeWidth="2.5" />
              <path d="M42,75 L46,30 L54,30 L58,75 Z" fill="#451a03" />
              <circle cx="50" cy="30" r="16" fill="#10b981" />
              <circle cx="50" cy="30" r="6" fill="#a7f3d0" />
            </svg>
          </motion.div>
        );

      // 9: Golden Desert Oasis (Pyramid & golden sun)
      case 9:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.97, 1.03, 0.97] } : {}} transition={{ duration: 2.5, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(234,179,8,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="30" fill="#451a03" stroke="#eab308" strokeWidth="2.5" />
              <polygon points="50,25 30,68 70,68" fill="#ca8a04" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="50" cy="38" r="6" fill="#fef08a" />
            </svg>
          </motion.div>
        );

      // 10: Frozen Arctic Tundra (Glacial iceberg & aurora)
      case 10:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.96, 1.04, 0.96] } : {}} transition={{ duration: 3, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] overflow-visible">
              <polygon points="50,15 82,75 18,75" fill="#034575" stroke="#38bdf8" strokeWidth="2.5" />
              <polygon points="50,15 65,75 50,75" fill="#7dd3fc" />
              <circle cx="50" cy="52" r="6" fill="#ffffff" />
            </svg>
          </motion.div>
        );

      // 11: Pirate Corsair Cove (Galleon anchor & lantern)
      case 11:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { rotate: [-3, 3, -3] } : {}} transition={{ duration: 3, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(217,119,6,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="30" fill="#091b33" stroke="#d97706" strokeWidth="2.5" />
              <circle cx="50" cy="32" r="6" fill="none" stroke="#fef08a" strokeWidth="2.5" />
              <line x1="50" y1="38" x2="50" y2="70" stroke="#fef08a" strokeWidth="3" />
              <path d="M30,55 Q50,72 70,55" fill="none" stroke="#fef08a" strokeWidth="3" />
            </svg>
          </motion.div>
        );

      // 12: Candyland Confection (Artisan ruby sugar crystal)
      case 12:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.96, 1.04, 0.96] } : {}} transition={{ duration: 2, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_14px_rgba(236,72,153,0.7)] overflow-visible">
              <polygon points="50,18 78,38 68,78 32,78 22,38" fill="#831843" stroke="#ec4899" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="10" fill="#fbcfe8" />
            </svg>
          </motion.div>
        );

      // 13: Golden El Dorado (Royal 24K Ingot Bullion)
      case 13:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.97, 1.03, 0.97] } : {}} transition={{ duration: 2.2, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_14px_rgba(245,158,11,0.7)] overflow-visible">
              <rect x="22" y="32" width="56" height="36" rx="6" fill="#78350f" stroke="#f59e0b" strokeWidth="2.5" />
              <rect x="26" y="36" width="48" height="28" rx="4" fill="#eab308" />
              <circle cx="50" cy="50" r="7" fill="#fef08a" />
            </svg>
          </motion.div>
        );

      // 14: Cyberpunk Megacity (Neon skyline & grid)
      case 14:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.96, 1.04, 0.96] } : {}} transition={{ duration: 2, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_14px_rgba(0,240,255,0.7)] overflow-visible">
              <rect x="24" y="24" width="52" height="52" rx="6" fill="#090514" stroke="#00f0ff" strokeWidth="2.5" />
              <rect x="34" y="40" width="12" height="30" fill="#f43f5e" />
              <rect x="52" y="32" width="14" height="38" fill="#a855f7" />
            </svg>
          </motion.div>
        );

      // 15: Toxic Wasteland (Industrial hazard cask)
      case 15:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.96, 1.04, 0.96] } : {}} transition={{ duration: 2.5, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(132,204,22,0.6)] overflow-visible">
              <rect x="26" y="24" width="48" height="52" rx="8" fill="#142a07" stroke="#84cc16" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="10" fill="#bef264" />
            </svg>
          </motion.div>
        );

      // 16: Floating Sky Islands (Aether floating rock)
      case 16:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { y: [-3, 3, -3] } : {}} transition={{ duration: 3, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] overflow-visible">
              <polygon points="50,20 80,45 68,78 32,78 20,45" fill="#034575" stroke="#38bdf8" strokeWidth="2" />
              <ellipse cx="50" cy="45" rx="25" ry="8" fill="#22c55e" />
            </svg>
          </motion.div>
        );

      // 17: Chrono Clockwork (Interlocking brass gear)
      case 17:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { rotate: [0, 360] } : {}} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(217,119,6,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="28" fill="#451a03" stroke="#d97706" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="12" fill="#b45309" />
              <circle cx="50" cy="50" r="5" fill="#fef08a" />
            </svg>
          </motion.div>
        );

      // 18: Sakura Shrine (Vermilion torii gate & blossom)
      case 18:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.97, 1.03, 0.97] } : {}} transition={{ duration: 2.5, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(244,114,182,0.6)] overflow-visible">
              <circle cx="50" cy="50" r="30" fill="#4c0519" stroke="#f472b6" strokeWidth="2.5" />
              <rect x="30" y="35" width="40" height="5" fill="#e11d48" />
              <rect x="36" y="40" width="5" height="32" fill="#e11d48" />
              <rect x="59" y="40" width="5" height="32" fill="#e11d48" />
              <circle cx="50" cy="48" r="6" fill="#fbcfe8" />
            </svg>
          </motion.div>
        );

      // 19: The Crystalline Core (Amethyst geode crystal cluster)
      case 19:
      default:
        return (
          <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.95, 1.05, 0.95] } : {}} transition={{ duration: 2, repeat: Infinity }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_16px_rgba(192,132,252,0.7)] overflow-visible">
              <polygon points="50,15 78,35 70,80 30,80 22,35" fill="#2e0854" stroke="#c084fc" strokeWidth="2.5" />
              <polygon points="50,15 62,80 50,80" fill="#a855f7" />
              <circle cx="50" cy="48" r="6" fill="#ffffff" />
            </svg>
          </motion.div>
        );
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full" style={filterStyle}>
      <div className="absolute w-[180%] h-[180%]">
        {getTileGraphic()}
      </div>
      {renderParticles(config.ambient || '#22c55e', 8, 2)}
    </div>
  );
}

// Generates uniquely themed cinematic banner text with sleek HUD frames
export function CinematicBanner({ item }: { item: any; key?: React.Key }) {
  const config = ZONE_CONFIGS[item.zone] || ZONE_CONFIGS[0];

  return (
    <div
      className="absolute flex justify-center pointer-events-none"
      style={{ top: item.y, left: `${item.left}%`, transform: 'translate(-50%, -50%)', zIndex: 30 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ margin: "-100px" }}
        className="px-5 py-2 flex flex-col items-center whitespace-nowrap bg-slate-950/90 border border-slate-700/60 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-md"
        style={{ borderColor: config.path || '#38bdf8' }}
      >
        {/* Realm Coordinates / Badge */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.ambient || '#22c55e' }} />
          <span>WORLD {String(item.zone + 1).padStart(2, '0')} // REALM</span>
        </div>

        <motion.span
          animate={{
            letterSpacing: ['0.08em', '0.12em', '0.08em'],
            textShadow: [
              `0 0 10px ${config.ambient}, 0 2px 4px rgba(0,0,0,0.8)`,
              `0 0 20px ${config.ambient}, 0 2px 4px rgba(0,0,0,0.8)`,
              `0 0 10px ${config.ambient}, 0 2px 4px rgba(0,0,0,0.8)`
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="font-black text-sm sm:text-base uppercase text-center font-mono mt-0.5 text-white"
        >
          {item.name}
        </motion.span>
      </motion.div>
    </div>
  );
}
