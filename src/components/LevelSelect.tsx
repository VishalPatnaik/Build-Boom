import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { renderCampaignMap } from './campaign/MapRenderer';
import { drawPlatform } from './campaign/PlatformRenderer';
import { ZONE_NAMES, ZONE_CONFIGS } from './campaign/WorldDefinitions';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { CinematicTile, CinematicBanner } from './campaign/CinematicTiles';

const TOTAL_LEVELS = 30;
const LEVELS_PER_ZONE = 2;
const SPACING = 60;
const ZONE_HEIGHT = 11 * SPACING;
const TOTAL_HEIGHT = ZONE_NAMES.length * ZONE_HEIGHT + 500;

function CampaignBackground({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const handleResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number = 0;
    let startTime = performance.now();

    const render = (now: number) => {
      const time = now - startTime;
      const currentScroll = scrollRef.current ? (scrollRef.current.scrollTop || 0) : 0;
      renderCampaignMap(ctx, size.w || window.innerWidth, size.h || window.innerHeight, currentScroll, time);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => { if (animationId) cancelAnimationFrame(animationId); };
  }, [size, scrollRef]);

  return (
    <canvas 
      ref={canvasRef}
      width={size.w}
      height={size.h}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

export function LevelSelect() {
  const { setMode, setLevel, unlockedLevels, setState } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [winWidth, setWinWidth] = useState(window.innerWidth > 0 ? window.innerWidth : 400);
  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pathData = useMemo(() => {
    let currentY = 150;
    const getX = (y: number) => {
       const amplitude = winWidth * 0.35;
       const frequency = 0.4;
       return (winWidth / 2) + Math.sin((y / SPACING) * frequency) * amplitude;
    };
    
    let d = `M ${getX(currentY)} ${currentY} `;
    while (currentY < TOTAL_HEIGHT) {
      currentY += SPACING;
      d += `L ${getX(currentY)} ${currentY} `;
    }
    return d;
  }, [winWidth]);


  // Generate Map Nodes
  const mapItems = useMemo(() => {
    const items = [];
    let currentY = 150;
    
    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const lvl = i + 1;
      const zoneIndex = Math.floor(i / LEVELS_PER_ZONE);
      
      if (i % LEVELS_PER_ZONE === 0) {
        const amplitude = 35; // %
        const frequency = 0.4;
        const offset = Math.sin((currentY / SPACING) * frequency) * amplitude;
        const left = 50 + offset; 

        items.push({ type: 'banner', zone: zoneIndex, name: ZONE_NAMES[zoneIndex], y: currentY, left, lvl });
        currentY += SPACING; // Banner spacing
      }

      // Match path generation math from MapRenderer.ts
      const width = window.innerWidth > 0 ? window.innerWidth : 400; 
      // Wait, we need to base the X off the center 50% rather than absolute pixels so it scales correctly with the DOM.
      // In MapRenderer, x = width / 2 + Math.sin(...) * width * 0.35
      const amplitude = 35; // %
      const frequency = 0.4;
      const offset = Math.sin((currentY / SPACING) * frequency) * amplitude;
      const left = 50 + offset; 

      items.push({ type: 'level', lvl, left, y: currentY, zoneIndex });
      currentY += SPACING;
    }
    return items;
  }, []);

  // Scroll to current level on mount
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        const el = document.getElementById(`level-node-${unlockedLevels}`);
        if (el && scrollRef.current) {
          const top = el.offsetTop;
          scrollRef.current.scrollTo({ top: top - window.innerHeight / 2, behavior: 'auto' });
        }
      }, 100);
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full h-full relative z-10 overflow-hidden bg-black"
    >
      <CampaignBackground scrollRef={scrollRef} />

      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 fixed top-0 w-full z-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMode('menu')}
          className="p-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white shadow-lg pointer-events-auto"
        >
          <ArrowLeft className="w-8 h-8" />
        </motion.button>
        <h2 className="text-4xl font-black text-white uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>
          CAMPAIGN
        </h2>
      </div>

      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden touch-pan-y relative w-full z-20"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="relative w-full h-full">
          <div className="relative w-full mx-auto" style={{ height: TOTAL_HEIGHT }}>

            {/* SVG Path */}
            <svg 
              className="absolute top-0 left-0 pointer-events-none z-10" 
              width={winWidth} 
              height={TOTAL_HEIGHT}
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="path-gradient" x1="0" y1="0" x2="0" y2={TOTAL_HEIGHT} gradientUnits="userSpaceOnUse">
                  {ZONE_CONFIGS.map((config, i) => {
                     const y = i * ZONE_HEIGHT;
                     const offset = y / TOTAL_HEIGHT;
                     return <stop key={i} offset={offset} stopColor={config.path} />;
                  })}
                  <stop offset={1} stopColor={ZONE_CONFIGS[ZONE_CONFIGS.length - 1].path} />
                </linearGradient>
              </defs>
              <path 
                d={pathData} 
                fill="none" 
                stroke="url(#path-gradient)" 
                strokeWidth="40" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))' }}
              />
              <path 
                d={pathData} 
                fill="none" 
                stroke="rgba(255,255,255,0.15)" 
                strokeWidth="20" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>

            
            {/* Map Items */}
            {mapItems.map((item, idx) => {
              if (item.type === 'banner') {
                return <CinematicBanner key={`banner-${item.lvl}`} item={item} />;
              }

              // Level Node
              const lvl = item.lvl;
              const isUnlocked = lvl <= unlockedLevels;
              const isCurrent = lvl === unlockedLevels;
              const isPlayed = lvl < unlockedLevels;
              const state = isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked';

              return (
                <div 
                  key={`level-${lvl}`}
                  id={`level-node-${lvl}`}
                  className="absolute"
                  style={{ top: item.y, left: `${item.left}%`, transform: 'translate(-50%, -50%)', zIndex: isCurrent ? 40 : 25 }}
                >
                  <motion.button
                    whileHover={isCurrent ? { scale: 1.1 } : {}}
                    whileTap={isCurrent ? { scale: 0.9 } : {}}
                    onClick={() => {
                      if (isCurrent) {
                        setLevel(lvl);
                        setState('playing');
                      }
                    }}
                    disabled={!isCurrent}
                    className={`
                      relative flex items-center justify-center font-black transition-all
                      ${isCurrent ? 'w-24 h-24' : 'w-16 h-16'}
                    `}
                  >
                    
                    {/* Integrated 3D Cinematic SVG Platform */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <CinematicTile zoneIdx={item.zoneIndex} state={state} />
                    </div>

                    {/* Level Number */}
                    <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none mt-1">
                      <span 
                        className={`text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)] ${isCurrent ? 'text-4xl' : 'text-2xl'}`}
                        style={{ WebkitTextStroke: '2px rgba(0,0,0,0.8)' }}
                      >
                        {lvl}
                      </span>
                      
                      {/* Status Icons */}
                      {isPlayed && (
                        <div className="absolute -bottom-3 -right-3 bg-green-500 rounded-full p-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.8)] border border-white">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                        </div>
                      )}
                      {!isPlayed && !isCurrent && (
                        <div className="absolute -bottom-3 -right-3 bg-gray-800 rounded-full p-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.8)] border border-white">
                          <Lock className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </motion.button>
                </div>
              );
            })}

            {/* End of Content */}
            <div className="absolute w-full flex justify-center pb-32 pointer-events-none" style={{ top: TOTAL_HEIGHT - 250 }}>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative px-12 py-8 flex flex-col items-center"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[#FFD700] font-black text-5xl uppercase tracking-[0.2em] text-center drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '3px rgba(0,0,0,1)' }}>
                    Coming Soon
                  </span>
                  <span className="text-white font-black text-lg uppercase tracking-[0.4em] mt-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1px rgba(0,0,0,1)' }}>
                    More worlds await
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
