// CINEMATIC TILES & BANNERS - AUTHENTIC 20 WORLD BIOMES
import React from 'react';
import { motion } from 'framer-motion';
import { ZONE_CONFIGS } from './WorldDefinitions';
import { COLLECTIONS } from '../../game/collections';
import { THEME_PALETTES } from '../../game/themeRenderer';
import { CampaignNodePlate } from './CampaignNodePlate';

export function CinematicTile({ zoneIdx, state, level }: { zoneIdx: number; state: 'locked' | 'unlocked' | 'current'; level?: number }) {
  return (
    <CampaignNodePlate 
      zoneIdx={zoneIdx} 
      state={state} 
      level={level || (zoneIdx * 10 + 1)} 
    />
  );
}

// Generates uniquely themed cinematic banner showcasing each world's authentic theme, materials, and palette
export function CinematicBanner({ item }: { item: any; key?: React.Key }) {
  const zoneIndex = Math.abs(item.zone) % 20;
  const config = ZONE_CONFIGS[zoneIndex] || ZONE_CONFIGS[0];
  const collection = COLLECTIONS[zoneIndex] || COLLECTIONS[0];
  const palette = THEME_PALETTES[zoneIndex] || THEME_PALETTES[0];

  const primaryCol = palette.primary || '#22c55e';
  const accentCol = palette.accent || '#fbbf24';
  const glowCol = palette.glow || 'rgba(34, 197, 94, 0.4)';

  return (
    <div
      className="absolute flex justify-center pointer-events-none w-full"
      style={{ top: item.y, left: `${item.left}%`, transform: 'translate(-50%, -50%)', zIndex: 30 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ margin: "-80px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="px-6 py-3 flex flex-col items-center whitespace-nowrap bg-slate-950/92 border-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md max-w-[90vw]"
        style={{
          borderColor: accentCol,
          boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${glowCol}`,
        }}
      >
        {/* World Header Line */}
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-300">
          <span 
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
            style={{ backgroundColor: primaryCol, color: primaryCol }} 
          />
          <span className="text-white/90">WORLD {String(zoneIndex + 1).padStart(2, '0')}</span>
          <span className="text-white/40">•</span>
          <span style={{ color: accentCol }}>LEVELS {zoneIndex * 10 + 1}–{(zoneIndex + 1) * 10}</span>
        </div>

        {/* World Name */}
        <motion.span
          className="font-black text-base sm:text-xl uppercase text-center font-mono mt-0.5 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          style={{
            color: '#ffffff',
            textShadow: `0 0 16px ${primaryCol}, 0 2px 4px rgba(0,0,0,0.8)`,
          }}
        >
          {collection.name}
        </motion.span>

        {/* Thematic Materials Archetype Badge */}
        <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono font-semibold text-slate-400">
          <span className="flex items-center gap-1 text-slate-200 bg-slate-900/90 px-2 py-0.5 rounded-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: accentCol }} />
            {collection.block.name}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-slate-300">
            {collection.plate.name}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
