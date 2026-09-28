import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/store';
import { Tournament, GlobalLeaderboardEntry } from '../../game/tournamentTypes';
import { DEFAULT_FALLBACK_TOURNAMENTS, DEFAULT_FALLBACK_LEADERBOARD, DEFAULT_FALLBACK_TOURNAMENT_LEADERBOARD } from '../../game/tournamentFallbacks';
import { ZONE_NAMES } from '../campaign/WorldDefinitions';
import { 
  Trophy, 
  Flame, 
  Timer, 
  Crown, 
  Medal, 
  Users, 
  Play, 
  ArrowLeft, 
  Edit3, 
  Check, 
  Sparkles, 
  Coins, 
  Globe, 
  Award,
  Zap,
  Info,
  Lock,
  Compass,
  RefreshCw,
  Search,
  X,
  Database,
  Shield
} from 'lucide-react';

const AVATAR_OPTIONS = ['🧑‍🚀', '🤖', '🤺', '🦊', '🐧', '🌋', '💎', '👑', '🦁', '🍄', '🛸', '🦀'];
const COUNTRY_OPTIONS = ['🌍', '🇺🇸', '🇯🇵', '🇩🇪', '🇧🇷', '🇬🇧', '🇰🇷', '🇨🇦', '🇦🇺', '🇮🇳', '🇫🇷', '🇪🇸', '🇮🇹', '🇲🇽'];

export function TournamentHub() {
  const { 
    setMode, 
    playerId, 
    playerName, 
    setPlayerName, 
    playerAvatar, 
    setPlayerAvatar, 
    playerCountry, 
    setPlayerCountry,
    trophies, 
    coins, 
    startTournament,
    highScores,
    unlockedLevels
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'tournaments' | 'leaderboard' | 'prizes'>('tournaments');
  const [tournamentFilter, setTournamentFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [leaderboardCategory, setLeaderboardCategory] = useState<'endless' | 'tournament' | 'campaign'>('endless');
  const [leaderboardScope, setLeaderboardScope] = useState<'global' | 'country'>('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContender, setSelectedContender] = useState<GlobalLeaderboardEntry | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [globalEntries, setGlobalEntries] = useState<GlobalLeaderboardEntry[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [tempAvatar, setTempAvatar] = useState(playerAvatar);
  const [tempCountry, setTempCountry] = useState(playerCountry);

  const currentWorldNumber = Math.min(20, Math.floor((Math.max(1, unlockedLevels) - 1) / 10) + 1);
  const currentWorldName = ZONE_NAMES[currentWorldNumber - 1] || 'Spring Meadow';

  // Fetch Tournaments on mount
  useEffect(() => {
    fetchTournaments();
    // Also submit player's current scores to global boards so they appear in rankings!
    submitInitialPlayerScores();
  }, []);

  // Fetch Leaderboard when switching category
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchGlobalLeaderboard(leaderboardCategory);
    }
  }, [activeTab, leaderboardCategory]);

  const submitInitialPlayerScores = async () => {
    try {
      const endlessBest = highScores['endless'] || 0;
      if (endlessBest > 0) {
        await fetch('/api/leaderboard/endless/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            playerName,
            avatar: playerAvatar,
            country: playerCountry,
            score: endlessBest,
            secondaryStat: `Endless Record`,
          }),
        });
      }

      const tournamentBest = highScores['tournament'] || 0;
      if (tournamentBest > 0) {
        await fetch('/api/leaderboard/tournament/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            playerName,
            avatar: playerAvatar,
            country: playerCountry,
            score: tournamentBest,
            secondaryStat: `Tournament Arena Record`,
          }),
        });
      }

      if (unlockedLevels > 1) {
        await fetch('/api/leaderboard/campaign/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            playerName,
            avatar: playerAvatar,
            country: playerCountry,
            score: unlockedLevels,
            secondaryStat: `Level ${unlockedLevels}/200`,
          }),
        });
      }
    } catch (err) {
      console.warn('Silent score sync:', err);
    }
  };

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tournaments?playerId=${playerId}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTournaments(data);
          return;
        }
      }
      // If endpoint returned non-JSON (e.g. HTML fallback) or empty array, use local fallback
      setTournaments(DEFAULT_FALLBACK_TOURNAMENTS);
    } catch (err) {
      console.warn('Network issue fetching tournaments, loading offline events:', err);
      setTournaments(DEFAULT_FALLBACK_TOURNAMENTS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGlobalLeaderboard = async (category: 'endless' | 'tournament' | 'campaign') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leaderboard/${category}?playerId=${playerId}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setGlobalEntries(data);
          return;
        }
      }
      setGlobalEntries(
        category === 'tournament' 
          ? DEFAULT_FALLBACK_TOURNAMENT_LEADERBOARD 
          : DEFAULT_FALLBACK_LEADERBOARD
      );
    } catch (err) {
      console.warn('Network issue fetching leaderboard, loading cached standings:', err);
      setGlobalEntries(
        category === 'tournament' 
          ? DEFAULT_FALLBACK_TOURNAMENT_LEADERBOARD 
          : DEFAULT_FALLBACK_LEADERBOARD
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = () => {
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
    }
    setPlayerAvatar(tempAvatar);
    setPlayerCountry(tempCountry);
    setIsEditingProfile(false);

    // Re-sync with server
    submitInitialPlayerScores();
  };

  const formatRemainingTime = (endTime: number) => {
    const diff = Math.max(0, endTime - Date.now());
    const days = Math.floor(diff / (24 * 3600 * 1000));
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="relative flex flex-col w-full h-full max-w-2xl mx-auto p-4 z-10 text-white font-display overflow-hidden rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-slate-950/95 via-[#0c1228]/95 to-slate-950/95 border-2 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl"
    >
      {/* Decorative Blueprint Grid Underlay */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-15 pointer-events-none rounded-[36px]" />
      
      {/* Ambient Top Golden Specular Streak */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-amber-400/90 to-transparent pointer-events-none" />

      {/* Industrial Frame Corner Rivets */}
      <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-white/25 border border-black/60 shadow-xs pointer-events-none" />
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/25 border border-black/60 shadow-xs pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-white/25 border border-black/60 shadow-xs pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-white/25 border border-black/60 shadow-xs pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex items-center justify-between gap-2 shrink-0 mb-3 pt-1 relative z-20">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setMode('menu')}
          className="w-11 h-11 rounded-2xl bg-gradient-to-b from-white/20 to-black/40 hover:from-white/30 hover:to-black/50 border-2 border-white/30 hover:border-amber-400/80 flex items-center justify-center text-white backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          title="Return to Menu"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
        </motion.button>

        {/* Player Profile Contender Card */}
        <div 
          onClick={() => {
            setTempName(playerName);
            setTempAvatar(playerAvatar);
            setTempCountry(playerCountry);
            setIsEditingProfile(true);
          }}
          className="flex items-center gap-2.5 bg-gradient-to-r from-slate-900/90 via-black/80 to-slate-900/90 px-3.5 py-1.5 rounded-2xl border-2 border-amber-400/40 hover:border-amber-400 backdrop-blur-md cursor-pointer transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-lg border-2 border-white/60 shadow-md group-hover:scale-105 transition-transform">
            {playerAvatar}
          </div>
          <div className="flex flex-col items-start leading-none pr-1">
            <div className="flex items-center gap-1">
              <span className="font-black text-sm tracking-wide text-white group-hover:text-amber-300 transition-colors">{playerName}</span>
              <span className="text-xs">{playerCountry}</span>
              <Edit3 className="w-3 h-3 text-white/50 group-hover:text-amber-300 ml-0.5" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-bold text-yellow-300">
              <span>🥇 {trophies.gold}</span>
              <span>🥈 {trophies.silver}</span>
              <span>🥉 {trophies.bronze}</span>
            </div>
          </div>
        </div>

        {/* Coins Treasury Cylinder */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-950/70 via-black/80 to-amber-950/70 px-3 py-1.5 rounded-2xl border-2 border-yellow-400/50 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]">
          <Coins className="w-4 h-4 text-[#FFD700] fill-[#FFD700] drop-shadow-sm" />
          <span className="font-black text-sm text-[#FFD700] tabular-nums">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* TITLE & TACTICAL SWITCHBOARD TABS */}
      <div className="text-center shrink-0 mb-3 relative z-20">
        <h1 
          className="text-4xl md:text-5xl font-black uppercase text-[#FFD700] drop-shadow-[0_4px_0_#B8860B] leading-none tracking-wide"
          style={{ WebkitTextStroke: '1.5px #8B4513' }}
        >
          TOURNAMENTS
        </h1>
        <p className="text-white/80 font-bold text-xs uppercase tracking-wider mt-0.5">
          Compete Globally • Win Exclusive Trophies & Coin Prizes
        </p>

        {/* Tab Navigation Console */}
        <div className="relative flex items-center justify-center gap-1.5 mt-2.5 bg-black/60 p-1.5 rounded-2xl border-2 border-white/15 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_4px_15px_rgba(0,0,0,0.4)] max-w-md mx-auto backdrop-blur-md">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs md:text-sm uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tournaments'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_3px_0_#b45309,inset_0_1px_0_rgba(255,255,255,0.3)] border-t border-t-white/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tournaments</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs md:text-sm uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_3px_0_#0369a1,inset_0_1px_0_rgba(255,255,255,0.3)] border-t border-t-white/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('prizes')}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs md:text-sm uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'prizes'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_3px_0_#7e22ce,inset_0_1px_0_rgba(255,255,255,0.3)] border-t border-t-white/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Rewards</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-3 custom-scrollbar touch-pan-y relative z-20">
        {/* TAB 1: TOURNAMENTS */}
        {activeTab === 'tournaments' && (
          <div className="space-y-4">
            {/* World Frontier & Filter Banner */}
            <div className="relative bg-gradient-to-r from-[#0a162e] via-[#0f244c] to-[#0a162e] border-2 border-cyan-400/50 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_8px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden">
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />
              
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-cyan-300/60 flex items-center justify-center text-xl shadow-md shrink-0">
                  🗺️
                </div>
                <div>
                  <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider font-mono">
                    YOUR CAMPAIGN FRONTIER
                  </div>
                  <div className="text-sm font-black text-white flex items-center gap-1.5">
                    <span className="text-yellow-300">World {currentWorldNumber}:</span>
                    <span>{currentWorldName}</span>
                    <span className="text-xs text-white/70 font-semibold">(Level {unlockedLevels}/200)</span>
                  </div>
                </div>
              </div>

              {/* Filter Pills Console */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/15 self-start sm:self-auto relative z-10 shadow-inner">
                <button
                  onClick={() => setTournamentFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                    tournamentFilter === 'all'
                      ? 'bg-yellow-400 text-black shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  All ({tournaments.length})
                </button>
                <button
                  onClick={() => setTournamentFilter('unlocked')}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                    tournamentFilter === 'unlocked'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Unlocked ({tournaments.filter(t => unlockedLevels >= (t.requiredLevel || (((t.worldNumber || 1) - 1) * 10 + 1))).length})
                </button>
                <button
                  onClick={() => setTournamentFilter('locked')}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                    tournamentFilter === 'locked'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Locked ({tournaments.filter(t => unlockedLevels < (t.requiredLevel || (((t.worldNumber || 1) - 1) * 10 + 1))).length})
                </button>
              </div>
            </div>

            {tournaments
              .filter(t => {
                const reqLevel = t.requiredLevel || (((t.worldNumber || 1) - 1) * 10 + 1);
                const isUnlocked = unlockedLevels >= reqLevel;
                if (tournamentFilter === 'unlocked') return isUnlocked;
                if (tournamentFilter === 'locked') return !isUnlocked;
                return true;
              })
              .map((t) => {
                const hasPlayed = !!t.myEntry;
                const reqLevel = t.requiredLevel || (((t.worldNumber || 1) - 1) * 10 + 1);
                const isUnlocked = unlockedLevels >= reqLevel;
                const worldName = t.worldName || ZONE_NAMES[(t.worldNumber || 1) - 1] || `World ${t.worldNumber || 1}`;
                const progressPct = Math.min(100, Math.max(0, Math.round((unlockedLevels / reqLevel) * 100)));

                return (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: isUnlocked ? 1.01 : 1.0 }}
                    className={`bg-gradient-to-br ${t.gradient} p-4 rounded-3xl border-3 ${
                      isUnlocked ? t.bannerBorder : 'border-slate-500/60'
                    } shadow-[0_12px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] relative overflow-hidden text-white transition-all`}
                  >
                    {/* Industrial Corner Rivets */}
                    <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-white/40 border border-black/50 shadow-xs pointer-events-none" />
                    <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white/40 border border-black/50 shadow-xs pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-white/40 border border-black/50 shadow-xs pointer-events-none" />
                    <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white/40 border border-black/50 shadow-xs pointer-events-none" />

                    {/* Subtle Tactical Dot Grid Overlay */}
                    <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />

                    {/* Dark overlay for locked tournaments */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] pointer-events-none z-10" />
                    )}

                    {/* Background Silhouette Icon */}
                    <div className="absolute -right-8 -bottom-8 text-white/10 text-9xl font-black select-none pointer-events-none">
                      {t.icon}
                    </div>

                    {/* Top Badges Console */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 relative z-20">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* World Unlock Badge */}
                        {isUnlocked ? (
                          <span className="bg-emerald-600/90 text-emerald-100 px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-300/40 flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> World {t.worldNumber}: {worldName}
                          </span>
                        ) : (
                          <span className="bg-black/80 text-amber-300 px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-400/50 flex items-center gap-1 shadow-sm">
                            <Lock className="w-3 h-3 text-amber-400 stroke-[2.5]" /> World {t.worldNumber}: {worldName} Required
                          </span>
                        )}

                        <span className="bg-black/50 text-yellow-300 px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/20">
                          {t.badge}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] font-bold bg-black/40 px-2.5 py-0.5 rounded-xl border border-white/15 text-white/90">
                          <Timer className="w-3.5 h-3.5 text-yellow-300" />
                          <span>{formatRemainingTime(t.endTime)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold bg-black/40 px-2.5 py-0.5 rounded-xl border border-white/15">
                        <Users className="w-3.5 h-3.5 text-white/70" />
                        <span>{t.totalParticipants} competitors</span>
                      </div>
                    </div>

                    {/* Title & Tactical Modifier Chamber */}
                    <div className="mb-3 relative z-20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                          {t.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black uppercase tracking-wide drop-shadow-md leading-none text-white">
                              {t.title}
                            </h2>
                            {!isUnlocked && (
                              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.2 rounded-lg text-[10px] font-black uppercase">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-white/90 font-bold text-xs mt-0.5">{t.subtitle}</p>
                        </div>
                      </div>

                      {/* Recessed Modifier Chamber */}
                      <div className="mt-2.5 text-xs bg-black/40 p-2.5 rounded-2xl border border-white/20 font-semibold text-white/90 flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                        <div className="w-6 h-6 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center shrink-0">
                          <Zap className="w-3.5 h-3.5 text-yellow-300" />
                        </div>
                        <span className="leading-snug">{t.modifierDesc}</span>
                      </div>

                      {/* Locked Progress Callout */}
                      {!isUnlocked && (
                        <div className="mt-2.5 bg-black/70 border-2 border-amber-400/50 p-3 rounded-2xl flex flex-col gap-1.5 shadow-lg">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                              Unlocks with World {t.worldNumber} ({worldName})
                            </span>
                            <span className="font-black text-white/90 tabular-nums text-[11px]">
                              Campaign Level {unlockedLevels} / {reqLevel}
                            </span>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden border border-white/20 p-0.5">
                            <div 
                              className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-sm" 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-white/70 font-semibold pt-0.5">
                            <span>Beat Campaign Level {reqLevel - 1} to enter!</span>
                            <span className="font-bold text-amber-300">{reqLevel - unlockedLevels} levels to go</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Top 3 Podium Preview Container */}
                    <div className="grid grid-cols-3 gap-2 bg-black/45 p-2.5 rounded-2xl border border-white/20 mb-3 text-center relative z-20 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]">
                      {t.entries.slice(0, 3).map((entry, idx) => (
                        <div 
                          key={entry.id} 
                          className={`flex flex-col items-center py-1.5 px-1 rounded-xl border ${
                            idx === 0 
                              ? 'bg-amber-500/15 border-amber-400/40 shadow-xs' 
                              : idx === 1 
                                ? 'bg-slate-400/10 border-slate-300/30' 
                                : 'bg-amber-900/15 border-amber-700/30'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            {idx === 0 && <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />}
                            {idx === 1 && <Medal className="w-3.5 h-3.5 text-slate-300 fill-slate-300" />}
                            {idx === 2 && <Medal className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />}
                            <span className={`text-[11px] font-black ${
                              idx === 0 ? 'text-yellow-300' : idx === 1 ? 'text-slate-200' : 'text-amber-400'
                            }`}>#{idx + 1}</span>
                          </div>
                          <div className="text-base my-0.5">{entry.avatar}</div>
                          <span className="font-bold text-[11px] truncate w-full px-1 text-white/90">
                            {entry.playerName}
                          </span>
                          <span className="font-black text-xs text-yellow-300 tabular-nums">
                            {entry.score.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Player Placement & Action Chamber */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/20 relative z-20">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/70 uppercase font-mono">YOUR PLACEMENT</span>
                        {hasPlayed ? (
                          <div className="flex items-center gap-1.5 font-black text-base text-yellow-300 drop-shadow">
                            <span>Rank #{t.myRank}</span>
                            <span className="text-xs text-white/90">({t.myEntry?.score} pts)</span>
                          </div>
                        ) : isUnlocked ? (
                          <span className="text-xs font-black text-white/70 italic">Not Ranked Yet</span>
                        ) : (
                          <span className="text-xs font-black text-amber-300/80 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTournament(t)}
                          className="px-3.5 py-2 bg-black/50 hover:bg-black/70 border-2 border-white/30 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:translate-y-0.5"
                        >
                          Standings
                        </button>

                        {isUnlocked ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startTournament(t)}
                            className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 border-2 border-white text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#b45309,0_6px_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5 cursor-pointer active:translate-y-1 active:shadow-none"
                          >
                            <Play className="w-4 h-4 fill-slate-950" />
                            <span>{hasPlayed ? 'Play Again' : 'Compete'}</span>
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setMode('campaign')}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-2 border-white text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#1e3a8a] flex items-center gap-1.5 cursor-pointer active:translate-y-1 active:shadow-none"
                          >
                            <Lock className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Unlock in Campaign</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}

        {/* TAB 2: GLOBAL LEADERBOARD INTERFACE */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            {/* Cloud Sync & Network Telemetry Status Bar */}
            <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 px-3 py-1.5 rounded-xl flex items-center justify-between text-[11px] backdrop-blur-md shadow-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-white/80 font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Global Leaderboard Cloud</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-300/80 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyan-400" />
                  <span>Edge Sync (Firebase Offline)</span>
                </span>
                <button
                  onClick={() => fetchGlobalLeaderboard(leaderboardCategory)}
                  disabled={isLoading}
                  title="Synchronize Leaderboard Standings"
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-yellow-300' : ''}`} />
                </button>
              </div>
            </div>

            {/* Sub Tabs: Endless vs Tournament vs Campaign */}
            <div className="relative flex items-center justify-between gap-1.5 bg-black/60 p-1.5 rounded-2xl border-2 border-white/15 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] backdrop-blur-md">
              <button
                onClick={() => {
                  setLeaderboardCategory('endless');
                  setSearchQuery('');
                }}
                className={`flex-1 py-2 px-2 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  leaderboardCategory === 'endless'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_2px_0_#4338ca,inset_0_1px_0_rgba(255,255,255,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>♾️</span>
                <span className="truncate">Endless Tower</span>
              </button>

              <button
                onClick={() => {
                  setLeaderboardCategory('tournament');
                  setSearchQuery('');
                }}
                className={`flex-1 py-2 px-2 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  leaderboardCategory === 'tournament'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_0_#b45309,inset_0_1px_0_rgba(255,255,255,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🏆</span>
                <span className="truncate">Championship</span>
              </button>

              <button
                onClick={() => {
                  setLeaderboardCategory('campaign');
                  setSearchQuery('');
                }}
                className={`flex-1 py-2 px-2 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  leaderboardCategory === 'campaign'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_2px_0_#0284c7,inset_0_1px_0_rgba(255,255,255,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🗺️</span>
                <span className="truncate">Campaign Realms</span>
              </button>
            </div>

            {/* Scope Filter & Search Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white/5 p-2 rounded-xl border border-white/10 text-xs">
              {/* Scope Toggles */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/10 shrink-0">
                <button
                  onClick={() => setLeaderboardScope('global')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    leaderboardScope === 'global'
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 shadow-xs'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  🌍 Global Top 25
                </button>
                <button
                  onClick={() => setLeaderboardScope('country')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    leaderboardScope === 'country'
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 shadow-xs'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {playerCountry} My Region
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search contender..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg pl-8 pr-7 py-1 text-white text-[11px] focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* TOP LEADERBOARD CONTAINER */}
            {(() => {
              // Apply scope and search filter
              let filtered = [...globalEntries];
              if (leaderboardScope === 'country') {
                filtered = filtered.filter(e => e.country === playerCountry || e.isCurrentPlayer || e.playerId === playerId);
              }
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(e => e.playerName.toLowerCase().includes(q));
              }

              const top3 = filtered.slice(0, 3);
              const rank1 = top3[0];
              const rank2 = top3[1];
              const rank3 = top3[2];
              const rosterRanks = filtered.slice(3, 25);

              const myIdx = globalEntries.findIndex(e => e.isCurrentPlayer || e.playerId === playerId);
              const myRank = myIdx !== -1 ? (globalEntries[myIdx].rank || myIdx + 1) : null;
              const myScore = myIdx !== -1 
                ? globalEntries[myIdx].score 
                : leaderboardCategory === 'endless' 
                  ? (highScores['endless'] || 0)
                  : leaderboardCategory === 'tournament'
                    ? (highScores['tournament'] || 0)
                    : unlockedLevels;
              const isInTop10 = myRank !== null && myRank <= 10;
              const tenthScore = globalEntries.length >= 10 ? globalEntries[9].score : 0;

              return (
                <div className="space-y-3">
                  {/* TOP 3 PODIUM - 3D PERSPECTIVE STEPS */}
                  {top3.length >= 1 && (
                    <div className="grid grid-cols-3 gap-2.5 items-end pt-3 pb-1">
                      {/* #2 SILVER (Left) */}
                      {rank2 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          onClick={() => setSelectedContender(rank2)}
                          className={`flex flex-col items-center bg-gradient-to-t from-slate-950 via-slate-800 to-slate-700/80 p-3 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                            rank2.isCurrentPlayer ? 'border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.5)]' : 'border-slate-300/70'
                          } shadow-[0_12px_25px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] text-center relative`}
                        >
                          <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-gradient-to-tr from-slate-200 to-white border-2 border-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                            🥈
                          </div>
                          <div className="text-2xl mt-1.5 mb-0.5">{rank2.avatar}</div>
                          <div className="flex items-center gap-1 max-w-full px-1">
                            <span className="font-black text-xs truncate text-white">{rank2.playerName}</span>
                            <span className="text-[10px] shrink-0">{rank2.country}</span>
                          </div>
                          {rank2.isCurrentPlayer && (
                            <span className="bg-yellow-400 text-slate-950 text-[8px] font-black px-1.5 rounded-full uppercase my-0.5">
                              YOU
                            </span>
                          )}
                          <div className="font-black text-sm text-yellow-300 mt-1 tabular-nums">
                            {rank2.score.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-white/60 font-semibold truncate max-w-full px-1">
                            {rank2.secondaryStat || (leaderboardCategory === 'endless' ? 'Blocks' : 'Pts')}
                          </div>
                          <div className="w-full h-1 bg-slate-500/40 rounded-full mt-2" />
                        </motion.div>
                      ) : <div />}

                      {/* #1 GOLD (Center, Taller with Championship Laurel Aura) */}
                      {rank1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setSelectedContender(rank1)}
                          className={`flex flex-col items-center bg-gradient-to-t from-amber-950 via-yellow-950 to-amber-600/80 p-3.5 rounded-2xl border-3 cursor-pointer transition-all hover:scale-[1.02] ${
                            rank1.isCurrentPlayer ? 'border-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.7)]' : 'border-yellow-400 shadow-[0_0_25px_rgba(255,215,0,0.4),0_15px_30px_rgba(0,0,0,0.7)]'
                          } text-center relative -translate-y-2.5`}
                        >
                          <div className="absolute -top-4 w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 border-2 border-white text-amber-950 font-black text-base flex items-center justify-center shadow-lg">
                            <Crown className="w-4 h-4 fill-amber-950 text-amber-950" />
                          </div>
                          <div className="text-3xl mt-2 mb-0.5 animate-pulse">{rank1.avatar}</div>
                          <div className="flex items-center gap-1 max-w-full px-1">
                            <span className="font-black text-sm truncate text-white">{rank1.playerName}</span>
                            <span className="text-xs shrink-0">{rank1.country}</span>
                          </div>
                          <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase my-0.5 shadow-sm">
                            {rank1.isCurrentPlayer ? '👑 YOU • WORLD #1' : 'WORLD #1'}
                          </span>
                          <div className="font-black text-base text-yellow-300 mt-0.5 tabular-nums drop-shadow-md">
                            {rank1.score.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-yellow-200/90 font-bold truncate max-w-full px-1">
                            {rank1.secondaryStat || (leaderboardCategory === 'endless' ? 'Blocks' : 'Pts')}
                          </div>
                          <div className="w-full h-1.5 bg-yellow-400/60 rounded-full mt-2" />
                        </motion.div>
                      )}

                      {/* #3 BRONZE (Right) */}
                      {rank3 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          onClick={() => setSelectedContender(rank3)}
                          className={`flex flex-col items-center bg-gradient-to-t from-stone-950 via-amber-950 to-amber-800/80 p-3 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                            rank3.isCurrentPlayer ? 'border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.5)]' : 'border-amber-600/80'
                          } shadow-[0_12px_25px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] text-center relative`}
                        >
                          <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 border-2 border-amber-300 text-amber-950 font-black text-xs flex items-center justify-center shadow-md">
                            🥉
                          </div>
                          <div className="text-2xl mt-1.5 mb-0.5">{rank3.avatar}</div>
                          <div className="flex items-center gap-1 max-w-full px-1">
                            <span className="font-black text-xs truncate text-white">{rank3.playerName}</span>
                            <span className="text-[10px] shrink-0">{rank3.country}</span>
                          </div>
                          {rank3.isCurrentPlayer && (
                            <span className="bg-yellow-400 text-slate-950 text-[8px] font-black px-1.5 rounded-full uppercase my-0.5">
                              YOU
                            </span>
                          )}
                          <div className="font-black text-sm text-yellow-300 mt-1 tabular-nums">
                            {rank3.score.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-white/60 font-semibold truncate max-w-full px-1">
                            {rank3.secondaryStat || (leaderboardCategory === 'endless' ? 'Blocks' : 'Pts')}
                          </div>
                          <div className="w-full h-1 bg-amber-600/40 rounded-full mt-2" />
                        </motion.div>
                      ) : <div />}
                    </div>
                  )}

                  {/* RANKS #4 THROUGH #25 TELEMETRY LIST */}
                  <div className="relative bg-gradient-to-b from-black/70 via-slate-950/80 to-black/80 rounded-3xl border-2 border-white/20 p-3 space-y-1.5 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden">
                    <div className="absolute inset-0 bg-cyber-scanlines opacity-20 pointer-events-none" />

                    <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-white/60 uppercase tracking-wider border-b border-white/10 pb-1.5 mb-1 relative z-10 font-mono">
                      <span>CONTENDER ROSTER ({rosterRanks.length} RANKED)</span>
                      <span>RECORD</span>
                    </div>

                    {rosterRanks.map((item, i) => {
                      const rankNum = item.rank || (i + 4);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.03 * Math.min(i, 8) }}
                          onClick={() => setSelectedContender(item)}
                          className={`relative z-10 flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                            item.isCurrentPlayer
                              ? 'bg-gradient-to-r from-yellow-500/25 to-amber-500/20 border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.35)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Rank Chip */}
                            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 font-mono shadow-inner ${
                              rankNum <= 10 ? 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300' : 'bg-black/60 border-white/20 text-white/90'
                            }`}>
                              #{rankNum}
                            </div>
                            <div className="text-xl shrink-0">{item.avatar}</div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 leading-tight">
                                <span className="font-black text-xs md:text-sm text-white truncate">
                                  {item.playerName}
                                </span>
                                <span className="text-xs shrink-0">{item.country}</span>
                                {item.isCurrentPlayer && (
                                  <span className="bg-yellow-400 text-black font-black text-[9px] px-1.5 py-0.2 rounded-full uppercase shrink-0">
                                    YOU
                                  </span>
                                )}
                              </div>
                              {item.secondaryStat && (
                                <div className="text-[10px] text-white/60 font-semibold truncate">
                                  {item.secondaryStat}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <span className="font-black text-sm md:text-base text-yellow-300 tabular-nums">
                              {item.score.toLocaleString()}
                            </span>
                            <div className="text-[9px] text-white/50 font-bold uppercase">
                              {leaderboardCategory === 'endless' ? 'Blocks' : 'Pts'}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {filtered.length === 0 && (
                      <div className="text-center py-6 text-white/60 text-xs font-semibold relative z-10">
                        No contenders found matching your filter. Try adjusting your query or scope!
                      </div>
                    )}
                  </div>

                  {/* CURRENT PLAYER'S GLOBAL STATUS & CALL TO ACTION */}
                  <div className={`relative p-3.5 rounded-2xl border-2 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_8px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden ${
                    isInTop10 
                      ? 'bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-emerald-950/80 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                      : 'bg-gradient-to-r from-slate-900/90 via-black/90 to-slate-900/90 border-yellow-400/60'
                  }`}>
                    <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />

                    <div className="flex items-center gap-2.5 relative z-10">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 border-2 border-white/50 flex items-center justify-center text-2xl shrink-0 shadow-md">
                        {playerAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-white">{playerName}</span>
                          <span className="text-xs">{playerCountry}</span>
                          {isInTop10 ? (
                            <span className="bg-emerald-400 text-black font-black text-[9px] px-2 py-0.5 rounded-full uppercase shadow-xs">
                              TOP 10 ARCHITECT 👑
                            </span>
                          ) : (
                            <span className="bg-white/10 text-yellow-300 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase border border-yellow-400/30">
                              {myRank ? `Global Rank #${myRank}` : 'Unranked'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold mt-0.5">
                          {isInTop10 ? (
                            <span className="text-emerald-300 font-bold">
                              Ranked #{myRank} with {myScore.toLocaleString()} {leaderboardCategory === 'endless' ? 'blocks' : 'pts'}! Outstanding!
                            </span>
                          ) : myScore > 0 && tenthScore > myScore ? (
                            <span className="text-yellow-300 font-bold">
                              Your Best: {myScore.toLocaleString()} • Needs +{(tenthScore - myScore + 1).toLocaleString()} pts to beat #{10}!
                            </span>
                          ) : myScore > 0 ? (
                            <span className="text-white/80">Your Best: {myScore.toLocaleString()} points</span>
                          ) : (
                            <span className="text-white/70">Play a match to establish your global standing!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Launch CTA Button */}
                    <div className="self-end sm:self-auto shrink-0 relative z-10">
                      {leaderboardCategory === 'endless' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setMode('endless')}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 border-2 border-white text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_3px_0_#4338ca] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Play Endless</span>
                        </motion.button>
                      ) : leaderboardCategory === 'tournament' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab('tournaments')}
                          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 border-2 border-white text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_3px_0_#b45309] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                        >
                          <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Compete in Arena</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setMode('campaign')}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 border-2 border-white text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_3px_0_#0284c7] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Play Campaign</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* CONTENDER PROFILE MODAL */}
        <AnimatePresence>
          {selectedContender && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedContender(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-slate-900 border-2 border-cyan-400/60 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedContender(null)}
                  className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white flex items-center justify-center text-4xl shadow-xl mb-3">
                    {selectedContender.avatar}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white">{selectedContender.playerName}</span>
                    <span className="text-base">{selectedContender.country}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      Rank #{selectedContender.rank || 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                      Verified Contender
                    </span>
                  </div>

                  <div className="w-full mt-4 p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-left text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Record Score:</span>
                      <span className="font-bold text-yellow-300 text-sm">{selectedContender.score.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Category:</span>
                      <span className="font-bold capitalize text-cyan-300">{leaderboardCategory}</span>
                    </div>
                    {selectedContender.secondaryStat && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/50">Achievement:</span>
                        <span className="font-semibold text-white/90">{selectedContender.secondaryStat}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Global Division:</span>
                      <span className="font-bold text-emerald-400">Master League Tier I</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedContender(null)}
                    className="w-full mt-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs uppercase cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 3: RULES & REWARDS */}
        {activeTab === 'prizes' && (
          <div className="relative space-y-3 bg-gradient-to-b from-black/70 via-slate-950/80 to-black/80 rounded-3xl border-2 border-white/20 p-4 backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden">
            {/* Blueprint Grid background */}
            <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-2 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black uppercase text-yellow-400 tracking-wide">Tournament Rules & Payouts</h2>
            </div>

            <p className="text-xs text-white/80 font-medium leading-relaxed">
              Every tournament runs on a synchronized seed so all players face identical blocks, speeds, and modifiers. 
              Higher combo streaks yield massive bonus score multipliers!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
              <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 p-3 rounded-2xl border border-yellow-400/40 text-center">
                <Crown className="w-7 h-7 text-yellow-400 mx-auto mb-1" />
                <div className="font-black text-sm text-yellow-300">1st Place (Gold)</div>
                <div className="text-xs text-white/80 mt-1 font-bold">Up to 5,000 Coins</div>
                <div className="text-[10px] text-yellow-400/90 font-bold uppercase mt-0.5">🥇 Gold Trophy + Title</div>
              </div>

              <div className="bg-gradient-to-b from-slate-400/20 to-slate-500/10 p-3 rounded-2xl border border-slate-300/40 text-center">
                <Medal className="w-7 h-7 text-slate-300 mx-auto mb-1" />
                <div className="font-black text-sm text-slate-200">2nd Place (Silver)</div>
                <div className="text-xs text-white/80 mt-1 font-bold">Up to 2,500 Coins</div>
                <div className="text-[10px] text-slate-300/90 font-bold uppercase mt-0.5">🥈 Silver Trophy</div>
              </div>

              <div className="bg-gradient-to-b from-amber-700/20 to-amber-800/10 p-3 rounded-2xl border border-amber-600/40 text-center">
                <Medal className="w-7 h-7 text-amber-500 mx-auto mb-1" />
                <div className="font-black text-sm text-amber-400">3rd Place (Bronze)</div>
                <div className="text-xs text-white/80 mt-1 font-bold">Up to 1,200 Coins</div>
                <div className="text-[10px] text-amber-400/90 font-bold uppercase mt-0.5">🥉 Bronze Trophy</div>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-xs space-y-1.5 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-white/80">Top 10 Finishers:</span>
                <span className="text-yellow-300">200 - 500 Coins</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-white/80">Top 50 Finishers:</span>
                <span className="text-yellow-300">75 - 200 Coins</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-white/80">Attempts Allowed:</span>
                <span className="text-green-400">Unlimited (Best Score Counts)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOURNAMENT STANDINGS MODAL */}
      <AnimatePresence>
        {selectedTournament && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-end items-center p-0 sm:pb-4 sm:px-4"
          >
            {/* Backdrop */}
            <div 
              onClick={() => setSelectedTournament(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto cursor-pointer"
            />

            {/* Bottom Center Modal Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-b from-[#180e2b] via-[#100a20] to-[#180e2b] border-t-3 sm:border-3 border-amber-400/80 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-[0_-12px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-auto z-10"
            >
              {/* Top Grab Handle */}
              <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mt-2.5 mb-1 shrink-0 cursor-pointer" onClick={() => setSelectedTournament(null)} />
              {/* Subtle blueprint grid underlay */}
              <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />

              {/* Modal Header */}
              {(() => {
                const reqLvl = selectedTournament.requiredLevel || (((selectedTournament.worldNumber || 1) - 1) * 10 + 1);
                const isModalUnlocked = unlockedLevels >= reqLvl;
                const worldName = selectedTournament.worldName || ZONE_NAMES[(selectedTournament.worldNumber || 1) - 1] || `World ${selectedTournament.worldNumber || 1}`;

                return (
                  <>
                    <div className="p-4 border-b border-white/20 flex items-center justify-between bg-black/60 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                          {selectedTournament.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-xl uppercase text-yellow-400 leading-none drop-shadow">
                              {selectedTournament.title}
                            </h3>
                            {isModalUnlocked ? (
                              <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Unlocked
                              </span>
                            ) : (
                              <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> World {selectedTournament.worldNumber} Locked
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/70 font-semibold mt-0.5">
                            <span>World {selectedTournament.worldNumber}: {worldName}</span>
                            {!isModalUnlocked && (
                              <span className="text-amber-300 font-bold">• Reach Campaign Level {reqLvl}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedTournament(null)}
                        className="w-9 h-9 rounded-xl bg-red-500/80 hover:bg-red-600 border border-white flex items-center justify-center text-white font-black cursor-pointer shadow-md"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Entries List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
                      {selectedTournament.entries.map((entry, idx) => {
                        const isCurrent = entry.playerId === playerId;
                        return (
                          <div
                            key={entry.id}
                            className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                              isCurrent
                                ? 'bg-gradient-to-r from-yellow-500/25 to-amber-500/20 border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.4)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 font-black text-sm text-center">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                              </span>
                              <span className="text-xl">{entry.avatar}</span>
                              <div>
                                <div className="flex items-center gap-1.5 leading-tight">
                                  <span className="font-black text-sm text-white">{entry.playerName}</span>
                                  <span className="text-xs">{entry.country}</span>
                                  {isCurrent && (
                                    <span className="bg-yellow-400 text-black font-black text-[9px] px-1.5 py-0.2 rounded-full uppercase">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-white/60 font-semibold">
                                  {entry.blocksBuilt} blocks • max combo x{entry.maxCombo}
                                </div>
                              </div>
                            </div>

                            <div className="text-right font-black text-base text-yellow-300 tabular-nums">
                              {entry.score.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Modal Footer Play Button */}
                    <div className="p-4 border-t border-white/20 bg-black/60 flex items-center justify-between gap-3 relative z-10">
                      <div className="text-xs font-bold text-white/80">
                        {isModalUnlocked ? (
                          selectedTournament.myRank ? (
                            <span>Your Standing: <strong className="text-yellow-300">#{selectedTournament.myRank}</strong></span>
                          ) : (
                            <span>Take a run to earn your spot!</span>
                          )
                        ) : (
                          <span className="text-amber-300 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Complete Campaign Level {reqLvl - 1} to enter
                          </span>
                        )}
                      </div>

                      {isModalUnlocked ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const t = selectedTournament;
                            setSelectedTournament(null);
                            startTournament(t);
                          }}
                          className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 border-2 border-white text-black font-black uppercase text-sm rounded-2xl shadow-[0_4px_0_#b45309] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                        >
                          <Play className="w-4 h-4 fill-black" />
                          <span>Start Run</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedTournament(null);
                            setMode('campaign');
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-white text-white font-black uppercase text-xs rounded-2xl shadow-[0_4px_0_#1e3a8a] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-yellow-300" />
                          <span>Unlock in Campaign</span>
                        </motion.button>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-end items-center p-0 sm:pb-4 sm:px-4"
          >
            {/* Backdrop */}
            <div 
              onClick={() => setIsEditingProfile(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto cursor-pointer"
            />

            {/* Bottom Center Modal Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#190E2D] border-t-4 sm:border-4 border-yellow-400 p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl max-w-sm w-full shadow-[0_-12px_50px_rgba(0,0,0,0.9)] text-white pointer-events-auto z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Top Grab Handle */}
              <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3 shrink-0 cursor-pointer" onClick={() => setIsEditingProfile(false)} />
              <h3 className="font-black text-2xl text-yellow-400 uppercase tracking-wide mb-1">
                Player Profile
              </h3>
              <p className="text-xs text-white/70 font-semibold mb-4">
                Customize your name and avatar on global leaderboards.
              </p>

              {/* Player Name Input */}
              <div className="mb-4">
                <label className="block text-xs font-black text-white/80 uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  maxLength={16}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border-2 border-white/30 rounded-2xl font-black text-lg text-yellow-300 focus:outline-none focus:border-yellow-400"
                  placeholder="Enter your name"
                />
              </div>

              {/* Avatar Picker */}
              <div className="mb-4">
                <label className="block text-xs font-black text-white/80 uppercase mb-1.5">Avatar Emoji</label>
                <div className="grid grid-cols-6 gap-2 bg-black/40 p-2 rounded-2xl border border-white/20">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setTempAvatar(emoji)}
                      className={`text-2xl p-1.5 rounded-xl transition-all ${
                        tempAvatar === emoji ? 'bg-yellow-400/40 scale-110 border-2 border-yellow-300' : 'hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Picker */}
              <div className="mb-5">
                <label className="block text-xs font-black text-white/80 uppercase mb-1.5">Region / Flag</label>
                <div className="grid grid-cols-7 gap-1.5 bg-black/40 p-2 rounded-2xl border border-white/20">
                  {COUNTRY_OPTIONS.map((flag) => (
                    <button
                      key={flag}
                      onClick={() => setTempCountry(flag)}
                      className={`text-xl p-1 rounded-xl transition-all ${
                        tempCountry === flag ? 'bg-yellow-400/40 scale-110 border-2 border-yellow-300' : 'hover:bg-white/10'
                      }`}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 font-black text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-white text-black font-black text-xs uppercase shadow-[0_3px_0_#b45309]"
                >
                  Save Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
