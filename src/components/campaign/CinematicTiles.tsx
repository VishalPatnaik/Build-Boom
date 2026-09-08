import React from 'react';
import { motion } from 'framer-motion';
import { ZONE_CONFIGS, ZONE_NAMES } from './WorldDefinitions';

export function CinematicTile({ zoneIdx, state }: { zoneIdx: number, state: 'locked' | 'unlocked' | 'current' }) {
  const config = ZONE_CONFIGS[zoneIdx];
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const filterStyle = isLocked ? { filter: 'grayscale(100%) brightness(50%)' } : {};

  // Particle generator specific to realm
  const renderParticles = (color: string, count: number, speed: number, pattern: 'rise' | 'fall' | 'orbit' | 'float') => {
    if (!isCurrent) return null;
    return Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: Math.random() * 4 + 2 + 'px',
          height: Math.random() * 4 + 2 + 'px',
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
          left: `${10 + Math.random() * 80}%`,
          top: '50%',
          zIndex: 0
        }}
        animate={{
          y: pattern === 'rise' ? [0, -60] : pattern === 'fall' ? [-60, 0] : pattern === 'float' ? [-20, 20, -20] : 0,
          x: pattern === 'orbit' ? [-30, 30, -30] : (Math.random() - 0.5) * 30,
          opacity: [0, 1, 0],
          scale: [0.5, 1.5, 0.5]
        }}
        transition={{
          duration: speed + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeInOut"
        }}
      />
    ));
  };

  const getTileGraphic = () => {
    switch (zoneIdx) {
      // 0: Spring Meadow (Grass, flowers, bouncy)
      case 0: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-6, 6, -6], rotateZ: [-2, 2, -2] } : {}} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <path d="M20,45 Q50,90 80,45 Z" fill="#8B4513" />
            <ellipse cx="50" cy="45" rx="35" ry="15" fill="#3CB371" />
            {/* Flowers */}
            <circle cx="35" cy="40" r="3" fill="#FF69B4" />
            <circle cx="65" cy="48" r="4" fill="#FFFF00" />
            <circle cx="50" cy="38" r="2.5" fill="#FF4500" />
          </svg>
        </motion.div>
      );
      // 1: Autumn Falls (Orange leaves, waterfall)
      case 1: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-4, 4, -4] } : {}} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <path d="M15,45 Q50,100 85,45 Z" fill="#5C4033" />
            <ellipse cx="50" cy="45" rx="38" ry="14" fill="#DAA520" />
            {/* Waterfall */}
            <motion.path d="M50,55 Q55,75 50,95" stroke="#4169E1" strokeWidth="6" fill="none" 
              animate={isCurrent ? { strokeDasharray: ["5,5", "10,10"] } : {}} transition={{ duration: 1, repeat: Infinity }} />
          </svg>
        </motion.div>
      );
      // 2: Frost Peaks (Ice spikes, snow)
      case 2: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 3, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <polygon points="20,50 50,90 80,50" fill="#B0E0E6" />
            <ellipse cx="50" cy="50" rx="35" ry="12" fill="#E0FFFF" />
            {/* Ice Spikes */}
            <polygon points="30,50 35,20 40,50" fill="#FFFFFF" opacity="0.8" />
            <polygon points="45,52 50,15 55,52" fill="#FFFFFF" opacity="0.9" />
            <polygon points="60,48 65,25 70,48" fill="#FFFFFF" opacity="0.7" />
          </svg>
        </motion.div>
      );
      // 3: Sunset Valley (Mesa plateaus, cactus)
      case 3: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-2, 2, -2] } : {}} transition={{ duration: 5, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <path d="M10,50 L20,85 L80,85 L90,50 Z" fill="#8B4513" />
            <ellipse cx="50" cy="50" rx="42" ry="16" fill="#CD853F" />
            {/* Plateau */}
            <path d="M30,45 L40,25 L60,25 L70,45 Z" fill="#D2691E" />
            <ellipse cx="50" cy="25" rx="10" ry="4" fill="#CD853F" />
            {/* Cactus */}
            <path d="M75,45 L75,30 M70,35 L75,35 M80,40 L75,40" stroke="#228B22" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
      // 4: Lunar Crater (Grey moon surface, craters)
      case 4: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-15, 15, -15], rotateZ: [-5, 5, -5] } : {}} transition={{ duration: 6, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <ellipse cx="50" cy="50" rx="40" ry="40" fill="#696969" />
            <ellipse cx="50" cy="50" rx="36" ry="36" fill="#808080" />
            <ellipse cx="30" cy="40" rx="8" ry="6" fill="#505050" />
            <ellipse cx="65" cy="65" rx="12" ry="8" fill="#505050" />
            <ellipse cx="70" cy="30" rx="5" ry="4" fill="#505050" />
          </svg>
        </motion.div>
      );
      // 5: Martian Dunes (Red sand dunes)
      case 5: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { rotateX: [-10, 10, -10] } : {}} transition={{ duration: 4, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <path d="M15,50 Q50,90 85,50 Z" fill="#800000" />
            <ellipse cx="50" cy="50" rx="38" ry="14" fill="#B22222" />
            <path d="M20,50 Q40,30 60,50 Q75,35 90,50" fill="none" stroke="#CD5C5C" strokeWidth="2" />
          </svg>
        </motion.div>
      );
      // 6: Crystal Cove (Purple/blue crystals reflecting)
      case 6: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-8, 8, -8] } : {}} transition={{ duration: 3, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <polygon points="30,55 50,95 70,55" fill="#4B0082" />
            <polygon points="20,55 50,45 80,55 50,65" fill="#8A2BE2" />
            <motion.polygon points="45,55 50,20 55,55" fill="#E0B0FF" animate={isCurrent ? { opacity: [0.5, 1, 0.5] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.polygon points="30,60 25,35 35,55" fill="#9370DB" animate={isCurrent ? { opacity: [0.3, 0.8, 0.3] } : {}} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            <motion.polygon points="70,60 75,40 65,55" fill="#9370DB" animate={isCurrent ? { opacity: [0.3, 0.8, 0.3] } : {}} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
          </svg>
        </motion.div>
      );
      // 7: Magma Caldera (Volcano cone, lava erupting)
      case 7: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <path d="M10,60 L35,20 L65,20 L90,60 Z" fill="#1A0000" />
            <ellipse cx="50" cy="20" rx="15" ry="6" fill="#FF4500" />
            <motion.path d="M50,20 Q40,40 30,60 M50,20 Q50,45 50,60 M50,20 Q60,40 70,60" stroke="#FF0000" strokeWidth="3" fill="none"
              animate={isCurrent ? { stroke: ['#FF0000', '#FFFF00', '#FF0000'] } : {}} transition={{ duration: 1, repeat: Infinity }} />
          </svg>
        </motion.div>
      );
      // 8: Royal Castle (Stone castle towers, flags)
      case 8: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-3, 3, -3] } : {}} transition={{ duration: 4, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <rect x="25" y="40" width="50" height="40" fill="#A9A9A9" />
            {/* Crenellations */}
            <rect x="25" y="30" width="10" height="10" fill="#A9A9A9" />
            <rect x="45" y="30" width="10" height="10" fill="#A9A9A9" />
            <rect x="65" y="30" width="10" height="10" fill="#A9A9A9" />
            {/* Gate */}
            <path d="M40,80 L40,60 A10,10 0 0,1 60,60 L60,80 Z" fill="#333" />
            {/* Flag */}
            <motion.path d="M25,30 L25,10 L40,15 L25,20" fill="#FFD700"
              animate={isCurrent ? { d: ["M25,30 L25,10 L40,15 L25,20", "M25,30 L25,10 L35,20 L25,20", "M25,30 L25,10 L40,15 L25,20"] } : {}} transition={{ duration: 1, repeat: Infinity }} />
          </svg>
        </motion.div>
      );
      // 9: Nebula Core (Swirling dark matter, stars)
      case 9: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { rotate: [0, 360], scale: [0.9, 1.1, 0.9] } : {}} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <circle cx="50" cy="50" r="35" fill="url(#nebulaGrad)" />
            <defs>
              <radialGradient id="nebulaGrad">
                <stop offset="0%" stopColor="#00FFFF" />
                <stop offset="50%" stopColor="#4B0082" />
                <stop offset="100%" stopColor="#000033" />
              </radialGradient>
            </defs>
            <path d="M20,50 Q50,20 80,50 Q50,80 20,50" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
            <path d="M50,20 Q80,50 50,80 Q20,50 50,20" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
          </svg>
        </motion.div>
      );
      // 10: Fairy Forest (Giant mushrooms)
      case 10: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-5, 5, -5] } : {}} transition={{ duration: 3, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <ellipse cx="50" cy="70" rx="40" ry="15" fill="#2E8B57" />
            {/* Mushroom Stalk */}
            <rect x="42" y="40" width="16" height="30" fill="#F5DEB3" rx="5" />
            {/* Mushroom Cap */}
            <path d="M20,45 Q50,10 80,45 Z" fill="#FF0000" />
            <circle cx="40" cy="35" r="4" fill="#FFFFFF" />
            <circle cx="60" cy="38" r="3" fill="#FFFFFF" />
            <circle cx="50" cy="25" r="5" fill="#FFFFFF" />
            <motion.circle cx="50" cy="45" r="15" fill="#32CD32" opacity="0.4" style={{ filter: 'blur(5px)' }}
              animate={isCurrent ? { scale: [1, 1.5, 1], opacity: [0.2, 0.6, 0.2] } : {}} transition={{ duration: 2, repeat: Infinity }} />
          </svg>
        </motion.div>
      );
      // 11: Pirate's Bay (Ship wheel, sand, water waves)
      case 11: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { rotateZ: [-5, 5, -5] } : {}} transition={{ duration: 4, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Sand Island */}
            <ellipse cx="50" cy="65" rx="35" ry="12" fill="#F4A460" />
            {/* Water */}
            <motion.path d="M10,75 Q30,65 50,75 T90,75" stroke="#00CED1" strokeWidth="4" fill="none"
              animate={isCurrent ? { d: ["M10,75 Q30,65 50,75 T90,75", "M10,75 Q30,85 50,75 T90,75", "M10,75 Q30,65 50,75 T90,75"] } : {}} transition={{ duration: 2, repeat: Infinity }} />
            {/* Ship Wheel */}
            <circle cx="50" cy="40" r="15" fill="none" stroke="#8B4513" strokeWidth="4" />
            <line x1="30" y1="40" x2="70" y2="40" stroke="#8B4513" strokeWidth="3" />
            <line x1="50" y1="20" x2="50" y2="60" stroke="#8B4513" strokeWidth="3" />
            <line x1="35" y1="25" x2="65" y2="55" stroke="#8B4513" strokeWidth="3" />
            <line x1="65" y1="25" x2="35" y2="55" stroke="#8B4513" strokeWidth="3" />
          </svg>
        </motion.div>
      );
      // 12: Sugar Hills (Candy canes, pink icing)
      case 12: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <ellipse cx="50" cy="60" rx="40" ry="20" fill="#FFB6C1" />
            {/* Candy Cane */}
            <path d="M40,65 L40,30 A10,10 0 0,1 60,30 L60,35" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
            <path d="M40,65 L40,30 A10,10 0 0,1 60,30 L60,35" fill="none" stroke="#FF0000" strokeWidth="6" strokeLinecap="round" strokeDasharray="5 5" />
            {/* Gumdrops */}
            <path d="M25,60 Q30,45 35,60 Z" fill="#00FF00" />
            <path d="M65,55 Q70,40 75,55 Z" fill="#0000FF" />
          </svg>
        </motion.div>
      );
      // 13: Golden Realm (Gold pillars, coins)
      case 13: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-4, 4, -4] } : {}} transition={{ duration: 3, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <ellipse cx="50" cy="70" rx="45" ry="15" fill="#B8860B" />
            {/* Gold Pillar */}
            <rect x="35" y="25" width="30" height="45" fill="#FFD700" />
            <rect x="30" y="20" width="40" height="5" fill="#DAA520" />
            <rect x="30" y="70" width="40" height="5" fill="#DAA520" />
            <motion.circle cx="50" cy="50" r="10" fill="#FFFF00" style={{ filter: 'blur(4px)' }}
              animate={isCurrent ? { opacity: [0.5, 1, 0.5] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
          </svg>
        </motion.div>
      );
      // 14: Neon City (Cyber grid, neon buildings)
      case 14: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 0.5, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <ellipse cx="50" cy="75" rx="45" ry="15" fill="#000000" stroke="#FF00FF" strokeWidth="2" />
            {/* Grid */}
            <path d="M20,65 L80,65 M30,70 L70,70 M40,75 L60,75" stroke="#00FFFF" strokeWidth="1" />
            <path d="M50,60 L50,90 M40,62 L30,85 M60,62 L70,85" stroke="#00FFFF" strokeWidth="1" />
            {/* Buildings */}
            <rect x="25" y="30" width="15" height="40" fill="#191970" stroke="#00FFFF" strokeWidth="1.5" />
            <rect x="45" y="15" width="20" height="55" fill="#191970" stroke="#FF00FF" strokeWidth="1.5" />
            <rect x="70" y="40" width="10" height="30" fill="#191970" stroke="#FFFF00" strokeWidth="1.5" />
          </svg>
        </motion.div>
      );
      // 15: Toxic Waste (Green acid barrels, bubbles)
      case 15: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-2, 2, -2], rotateZ: [-1, 1, -1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <ellipse cx="50" cy="70" rx="40" ry="15" fill="#2F4F4F" />
            {/* Acid Pool */}
            <motion.ellipse cx="50" cy="70" rx="30" ry="10" fill="#7FFF00"
              animate={isCurrent ? { rx: [30, 32, 30], ry: [10, 11, 10] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            {/* Barrel */}
            <rect x="40" y="35" width="20" height="25" fill="#006400" rx="2" />
            <line x1="40" y1="42" x2="60" y2="42" stroke="#2F4F4F" strokeWidth="2" />
            <line x1="40" y1="52" x2="60" y2="52" stroke="#2F4F4F" strokeWidth="2" />
            {/* Biohazard symbol abstract */}
            <circle cx="50" cy="47" r="3" fill="#7FFF00" />
          </svg>
        </motion.div>
      );
      // 16: Abyssal Depths (Deep sea vents, coral)
      case 16: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-8, 8, -8] } : {}} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <path d="M10,75 Q50,90 90,75 L80,95 L20,95 Z" fill="#00008B" />
            {/* Trench Rock */}
            <path d="M20,75 L30,40 L45,75 Z" fill="#0000CD" />
            <path d="M60,75 L75,30 L85,75 Z" fill="#0000CD" />
            {/* Bioluminescence */}
            <motion.circle cx="50" cy="50" r="8" fill="#00FFFF" style={{ filter: 'blur(3px)' }}
              animate={isCurrent ? { opacity: [0.2, 0.8, 0.2], r: [8, 12, 8] } : {}} transition={{ duration: 3, repeat: Infinity }} />
          </svg>
        </motion.div>
      );
      // 17: Sky Islands (Clouds, floating rocks, windmills)
      case 17: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { y: [-20, 20, -20] } : {}} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Cloud Base */}
            <path d="M20,60 Q30,40 50,45 Q70,30 85,55 Q95,70 80,75 Q50,85 25,75 Q10,65 20,60 Z" fill="#FFFFFF" />
            {/* Floating Land */}
            <path d="M30,55 Q50,70 70,55 L65,80 Q50,95 35,80 Z" fill="#87CEEB" />
            {/* Windmill */}
            <rect x="47" y="30" width="6" height="25" fill="#D3D3D3" />
            <motion.g style={{ transformOrigin: '50px 30px' }} animate={isCurrent ? { rotateZ: 360 } : {}} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
              <line x1="50" y1="15" x2="50" y2="45" stroke="#A9A9A9" strokeWidth="2" />
              <line x1="35" y1="30" x2="65" y2="30" stroke="#A9A9A9" strokeWidth="2" />
            </motion.g>
          </svg>
        </motion.div>
      );
      // 18: Clockwork (Bronze gears, steam)
      case 18: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { rotate: [-5, 5, -5] } : {}} transition={{ duration: 3, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <ellipse cx="50" cy="50" rx="40" ry="40" fill="#8B4513" />
            {/* Giant Gear */}
            <motion.g style={{ transformOrigin: '50px 50px' }} animate={isCurrent ? { rotateZ: 360 } : {}} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
              <circle cx="50" cy="50" r="30" fill="none" stroke="#D2691E" strokeWidth="8" strokeDasharray="10 5" />
              <circle cx="50" cy="50" r="22" fill="none" stroke="#CD853F" strokeWidth="4" />
              <line x1="50" y1="20" x2="50" y2="80" stroke="#CD853F" strokeWidth="4" />
              <line x1="20" y1="50" x2="80" y2="50" stroke="#CD853F" strokeWidth="4" />
              <line x1="28.7" y1="28.7" x2="71.3" y2="71.3" stroke="#CD853F" strokeWidth="4" />
              <line x1="28.7" y1="71.3" x2="71.3" y2="28.7" stroke="#CD853F" strokeWidth="4" />
              <circle cx="50" cy="50" r="8" fill="#D2691E" />
            </motion.g>
          </svg>
        </motion.div>
      );
      // 19: The Core (Eye of Sauron/energy core, intense plasma)
      case 19: return (
        <motion.div className="w-full h-full" animate={isCurrent ? { scale: [0.95, 1.1, 0.95] } : {}} transition={{ duration: 0.8, repeat: Infinity }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <path d="M10,50 Q50,10 90,50 Q50,90 10,50 Z" fill="#300000" />
            {/* Plasma Ring */}
            <motion.ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="#FF4500" strokeWidth="3"
              animate={isCurrent ? { rotateX: [0, 360] } : {}} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '50px 50px' }} />
            {/* Core */}
            <motion.circle cx="50" cy="50" r="15" fill="#FFA500" style={{ filter: 'blur(2px)' }}
              animate={isCurrent ? { fill: ['#FFA500', '#FFFFFF', '#FFA500'], r: [15, 18, 15] } : {}} transition={{ duration: 1, repeat: Infinity }} />
          </svg>
        </motion.div>
      );
      default: return (
        <div className="w-full h-full rounded-full bg-gray-500" />
      );
    }
  };

  // Assign specific particle systems to realms
  const particleColor = config.ambient;
  let particleType: 'rise' | 'fall' | 'orbit' | 'float' = 'rise';
  let particleCount = 0;
  
  if (isCurrent) {
    if ([7, 15, 19].includes(zoneIdx)) { particleType = 'rise'; particleCount = 15; } // Fire/Toxic
    else if ([2, 17].includes(zoneIdx)) { particleType = 'fall'; particleCount = 20; } // Snow/Sky
    else if ([4, 9, 14, 18].includes(zoneIdx)) { particleType = 'orbit'; particleCount = 10; } // Tech/Space
    else { particleType = 'float'; particleCount = 8; } // Nature/Water
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full" style={filterStyle}>
      <div className="absolute w-[180%] h-[180%]">
        {getTileGraphic()}
      </div>
      {renderParticles(particleColor, particleCount, 2, particleType)}
    </div>
  );
}

// Generates uniquely themed cinematic banner text animations
export function CinematicBanner({ item }: { item: any }) {
  const config = ZONE_CONFIGS[item.zone];
  const zIdx = item.zone;

  // Cinematic movement depending on realm type
  let floatAnim = [-3, 3, -3];
  let animDuration = 4;
  let spacingAnim = ['0.1em', '0.15em', '0.1em'];
  let glowStates = [
    `0 0 10px ${config.ambient}, 0 4px 4px rgba(0,0,0,1)`, 
    `0 0 20px ${config.ambient}, 0 0 40px ${config.path}, 0 4px 4px rgba(0,0,0,1)`, 
    `0 0 10px ${config.ambient}, 0 4px 4px rgba(0,0,0,1)`
  ];

  if ([7, 15, 19].includes(zIdx)) { // Fiery / Intense
    animDuration = 1.5;
    floatAnim = [-2, 2, -2];
    spacingAnim = ['0.1em', '0.2em', '0.1em'];
    glowStates = [
      `0 0 20px ${config.ambient}, 0 4px 4px rgba(0,0,0,1)`, 
      `0 0 50px ${config.ambient}, 0 0 80px ${config.path}, 0 4px 4px rgba(0,0,0,1)`, 
      `0 0 20px ${config.ambient}, 0 4px 4px rgba(0,0,0,1)`
    ];
  } else if ([4, 9, 10, 17].includes(zIdx)) { // Airy / Magic
    animDuration = 6;
    floatAnim = [-12, 12, -12];
    spacingAnim = ['0.2em', '0.5em', '0.2em'];
  } else if ([6, 11, 16].includes(zIdx)) { // Watery / Abyssal
    animDuration = 4;
    floatAnim = [-6, 6, -6];
  }

  return (
    <div 
      className="absolute flex justify-center pointer-events-none" 
      style={{ top: item.y, left: `${item.left}%`, transform: 'translate(-50%, -50%)', zIndex: 30 }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ margin: "-100px" }}
        className="px-6 py-2 flex flex-col items-center whitespace-nowrap"
      >
        <motion.span 
          animate={{ 
            y: floatAnim,
            letterSpacing: spacingAnim,
            textShadow: glowStates
          }}
          transition={{ duration: animDuration, repeat: Infinity, ease: 'easeInOut' }}
          className="font-black text-2xl uppercase text-center" 
          style={{ 
            color: '#fff',
            WebkitTextStroke: `1px ${config.path}` 
          }}
        >
          {item.name}
        </motion.span>
      </motion.div>
    </div>
  );
}
