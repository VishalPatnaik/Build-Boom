import fs from 'fs';
import path from 'path';
import { Tournament, TournamentEntry, GlobalLeaderboardEntry } from './src/game/tournamentTypes';

const STORE_PATH = path.join(process.cwd(), 'tournaments_store.json');

const BOT_NAMES = [
  { name: 'VortexBuilder', country: '🇺🇸', avatar: '🧑‍🚀' },
  { name: 'NeonSamurai', country: '🇯🇵', avatar: '🤖' },
  { name: 'KaiserStack', country: '🇩🇪', avatar: '🤺' },
  { name: 'SambaStriker', country: '🇧🇷', avatar: '🦀' },
  { name: 'LondonEye', country: '🇬🇧', avatar: '🦊' },
  { name: 'SeoulSurfer', country: '🇰🇷', avatar: '🐧' },
  { name: 'NordicRune', country: '🇸🇪', avatar: '🌋' },
  { name: 'MapleDrop', country: '🇨🇦', avatar: '🍂' },
  { name: 'AussieBoomer', country: '🇦🇺', avatar: '🛻' },
  { name: 'TajMaster', country: '🇮🇳', avatar: '🗿' },
  { name: 'AlpineClimber', country: '🇨🇭', avatar: '🐝' },
  { name: 'SakuraPetal', country: '🇯🇵', avatar: '🌸' },
  { name: 'PixelGhost', country: '🇫🇷', avatar: '🛸' },
  { name: 'CosmicBuilder', country: '🇪🇸', avatar: '🍄' },
  { name: 'ThunderBlink', country: '🇳🇴', avatar: '⚡' },
  { name: 'GoldenCrown', country: '🇮🇹', avatar: '🪙' },
  { name: 'ShadowPanda', country: '🇨🇳', avatar: '🐼' },
  { name: 'SpeedyFox', country: '🇲🇽', avatar: '🦊' },
  { name: 'DiamondHands', country: '🇸🇬', avatar: '💎' },
  { name: 'AstroNova', country: '🇳🇱', avatar: '🚀' },
];

function generateBotScores(baseMax: number, count: number): TournamentEntry[] {
  const entries: TournamentEntry[] = [];
  for (let i = 0; i < count; i++) {
    const bot = BOT_NAMES[i % BOT_NAMES.length];
    // Realistic score curve with exponential falloff
    const curve = Math.pow((count - i) / count, 1.4);
    const score = Math.max(120, Math.floor(baseMax * (0.35 + 0.65 * curve) + (Math.random() * 80 - 40)));
    const blocksBuilt = Math.floor(score / 35) + 5;
    const maxCombo = Math.min(blocksBuilt, Math.floor(8 + curve * 22));

    entries.push({
      id: `bot-${i}-${bot.name}`,
      playerId: `bot-player-${i}`,
      playerName: bot.name,
      country: bot.country,
      avatar: bot.avatar,
      score,
      blocksBuilt,
      maxCombo,
      timestamp: Date.now() - Math.floor(Math.random() * 3600000 * 24),
    });
  }

  // Sort descending
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

interface ServerData {
  tournaments: Tournament[];
  globalLeaderboards: {
    endless: GlobalLeaderboardEntry[];
    tournament: GlobalLeaderboardEntry[];
    campaign: GlobalLeaderboardEntry[];
  };
}

let store: ServerData | null = null;

function getInitialData(): ServerData {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const weeklyEnd = now + 4 * ONE_DAY + 6 * 3600 * 1000;
  const dailyEnd = now + 14 * 3600 * 1000 + 35 * 60 * 1000;
  const weekendEnd = now + 2 * ONE_DAY + 8 * 3600 * 1000;

  const tournaments: Tournament[] = [
    {
      id: 'spring-meadow-cup',
      title: 'Spring Meadow Cup',
      subtitle: 'Novice Championship Arena',
      badge: 'ROOKIE OPEN',
      icon: '🌱',
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      bannerBorder: 'border-emerald-300',
      bgZoneId: 'bg-0', // Spring Meadow
      worldNumber: 1,
      worldName: 'Spring Meadow',
      requiredLevel: 1,
      seed: 104291,
      blockCount: 40,
      speedMultiplier: 1.0,
      boomChance: 0.2,
      modifierDesc: 'Open to all builders! Standard speed and gentle drops.',
      startTime: now - ONE_DAY,
      endTime: dailyEnd,
      prizes: {
        first: { coins: 2000, trophy: 'gold', title: 'Meadow Master' },
        second: { coins: 1000, trophy: 'silver', title: 'Meadow Runner-Up' },
        third: { coins: 500, trophy: 'bronze', title: 'Meadow Ace' },
        top10: { coins: 250 },
        top50: { coins: 100 },
      },
      totalParticipants: 245,
      entries: generateBotScores(2450, 18),
    },
    {
      id: 'lunar-trials',
      title: 'Lunar Gravity Trials',
      subtitle: 'Low-Gravity Orbital Gauntlet',
      badge: 'WORLD 5 EXCLUSIVE',
      icon: '🧑‍🚀',
      gradient: 'from-slate-700 via-indigo-800 to-blue-900',
      bannerBorder: 'border-indigo-300',
      bgZoneId: 'bg-4', // Moon
      worldNumber: 5,
      worldName: 'Moon',
      requiredLevel: 41,
      seed: 554312,
      blockCount: 60,
      speedMultiplier: 1.15,
      boomChance: 0.25,
      modifierDesc: 'Floaty swinging crane with slippery timing. World 5 required.',
      startTime: now - 2 * ONE_DAY,
      endTime: weekendEnd,
      prizes: {
        first: { coins: 3500, trophy: 'gold', title: 'Lunar Pioneer' },
        second: { coins: 1800, trophy: 'silver', title: 'Cosmic Pilot' },
        third: { coins: 900, trophy: 'bronze', title: 'Astral Walker' },
        top10: { coins: 400 },
        top50: { coins: 150 },
      },
      totalParticipants: 354,
      entries: generateBotScores(3400, 20),
    },
    {
      id: 'daily-blitz',
      title: 'Meteor Blitz Cup',
      subtitle: 'Fast 24-Hour Reflex Duel',
      badge: 'WORLD 8 EXCLUSIVE',
      icon: '⚡',
      gradient: 'from-rose-500 via-red-500 to-amber-500',
      bannerBorder: 'border-red-300',
      bgZoneId: 'bg-7', // Volcano / Meteor
      worldNumber: 8,
      worldName: 'Volcano',
      requiredLevel: 71,
      seed: 142091,
      blockCount: 50,
      speedMultiplier: 1.35,
      boomChance: 0.35,
      modifierDesc: 'Hyper speed with dense bomb hazards! World 8 required.',
      startTime: now - 10 * 3600 * 1000,
      endTime: dailyEnd,
      prizes: {
        first: { coins: 4000, trophy: 'gold', title: 'Blitz King' },
        second: { coins: 2000, trophy: 'silver', title: 'Blitz Ace' },
        third: { coins: 1000, trophy: 'bronze', title: 'Blitz Runner-Up' },
        top10: { coins: 400 },
        top50: { coins: 150 },
      },
      totalParticipants: 312,
      entries: generateBotScores(2920, 20),
    },
    {
      id: 'weekly-grand-prix',
      title: 'Skyline Grand Prix',
      subtitle: 'Week 38 Championship Arena',
      badge: 'WORLD 14 MAJOR',
      icon: '🏆',
      gradient: 'from-amber-500 via-yellow-500 to-orange-500',
      bannerBorder: 'border-yellow-300',
      bgZoneId: 'bg-13', // Golden Legend
      worldNumber: 14,
      worldName: 'Golden Legend',
      requiredLevel: 131,
      seed: 884920,
      blockCount: 100,
      speedMultiplier: 1.15,
      boomChance: 0.28,
      modifierDesc: 'High stakes 100-block gauntlet! 2x Combo Multiplier. World 14 required.',
      startTime: now - 3 * ONE_DAY,
      endTime: weeklyEnd,
      prizes: {
        first: { coins: 5000, trophy: 'gold', title: 'Grand Champion' },
        second: { coins: 2500, trophy: 'silver', title: 'Grand Finalist' },
        third: { coins: 1200, trophy: 'bronze', title: 'Podium Master' },
        top10: { coins: 500 },
        top50: { coins: 200 },
      },
      totalParticipants: 428,
      entries: generateBotScores(4850, 25),
    },
    {
      id: 'cyber-overdrive',
      title: 'Cyber Circuit Rush',
      subtitle: 'Neon Mirage Gauntlet',
      badge: 'WORLD 15 MASTER',
      icon: '🤖',
      gradient: 'from-cyan-500 via-blue-600 to-purple-600',
      bannerBorder: 'border-cyan-300',
      bgZoneId: 'bg-14', // Cyberpunk
      worldNumber: 15,
      worldName: 'Cyberpunk',
      requiredLevel: 141,
      seed: 991244,
      blockCount: 75,
      speedMultiplier: 1.25,
      boomChance: 0.30,
      modifierDesc: 'Deceptive ghost & blinking blocks! World 15 required.',
      startTime: now - ONE_DAY,
      endTime: weekendEnd,
      prizes: {
        first: { coins: 4500, trophy: 'gold', title: 'Neon Legend' },
        second: { coins: 2200, trophy: 'silver', title: 'Cyber Master' },
        third: { coins: 1100, trophy: 'bronze', title: 'Glitch Hunter' },
        top10: { coins: 450 },
        top50: { coins: 180 },
      },
      totalParticipants: 279,
      entries: generateBotScores(3650, 22),
    },
  ];

  const endlessLeaders: GlobalLeaderboardEntry[] = BOT_NAMES.slice(0, 18).map((bot, i) => ({
    id: `endless-${i}`,
    playerId: `bot-${i}`,
    playerName: bot.name,
    avatar: bot.avatar,
    country: bot.country,
    score: Math.floor(1850 * Math.pow((20 - i) / 20, 1.3) + 300),
    secondaryStat: `Streak x${Math.floor(25 - i * 0.9)}`,
    timestamp: now - i * 14000000,
  })).sort((a, b) => b.score - a.score);

  const campaignLeaders: GlobalLeaderboardEntry[] = BOT_NAMES.slice(0, 18).map((bot, i) => ({
    id: `campaign-${i}`,
    playerId: `bot-${i}`,
    playerName: bot.name,
    avatar: bot.avatar,
    country: bot.country,
    score: 200 - i * 8 - Math.floor(Math.random() * 4),
    secondaryStat: `Realm ${Math.max(1, 20 - Math.floor(i * 0.9))}/20`,
    timestamp: now - i * 16000000,
  })).sort((a, b) => b.score - a.score);

  const tournamentLeaders: GlobalLeaderboardEntry[] = BOT_NAMES.slice(0, 18).map((bot, i) => ({
    id: `tournament-${i}`,
    playerId: `bot-tourney-${i}`,
    playerName: bot.name,
    avatar: bot.avatar,
    country: bot.country,
    score: Math.floor(5200 * Math.pow((20 - i) / 20, 1.25) + 650),
    secondaryStat: i % 2 === 0 ? `Grand Prix • Combo x${32 - i}` : `Orbital Trials • Combo x${28 - i}`,
    timestamp: now - i * 11000000,
  })).sort((a, b) => b.score - a.score);

  return {
    tournaments,
    globalLeaderboards: {
      endless: endlessLeaders,
      tournament: tournamentLeaders,
      campaign: campaignLeaders,
    },
  };
}

function loadStore(): ServerData {
  if (store) return store;
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      store = JSON.parse(raw);
      if (store && Array.isArray(store.tournaments)) {
        const initial = getInitialData();
        let changed = false;
        // Ensure all initial tournaments are present
        for (const initT of initial.tournaments) {
          const found = store.tournaments.find(t => t.id === initT.id);
          if (!found) {
            store.tournaments.push(initT);
            changed = true;
          } else {
            if (!found.worldNumber || !found.worldName || !found.requiredLevel) {
              found.worldNumber = initT.worldNumber;
              found.worldName = initT.worldName;
              found.requiredLevel = initT.requiredLevel;
              found.badge = initT.badge;
              found.modifierDesc = initT.modifierDesc;
              changed = true;
            }
          }
        }
        // Ensure globalLeaderboards and tournament leaderboard exist
        if (!store.globalLeaderboards) {
          store.globalLeaderboards = initial.globalLeaderboards;
          changed = true;
        } else if (!store.globalLeaderboards.tournament) {
          store.globalLeaderboards.tournament = initial.globalLeaderboards.tournament;
          changed = true;
        }

        if (changed) {
          saveStore();
        }
      }
      return store!;
    }
  } catch (err) {
    console.error('Error loading tournaments store:', err);
  }
  store = getInitialData();
  saveStore();
  return store!;
}

function saveStore() {
  if (!store) return;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving tournaments store:', err);
  }
}

export const serverTournamentManager = {
  getTournaments(playerId?: string): Tournament[] {
    const data = loadStore();
    return data.tournaments.map(t => {
      let myEntry: TournamentEntry | undefined = undefined;
      let myRank: number | undefined = undefined;

      if (playerId) {
        const foundIdx = t.entries.findIndex(e => e.playerId === playerId);
        if (foundIdx !== -1) {
          myEntry = t.entries[foundIdx];
          myRank = foundIdx + 1;
        }
      }

      return {
        ...t,
        entries: t.entries.slice(0, 20), // Return top 20 for list view
        myEntry,
        myRank,
      };
    });
  },

  getTournament(tournamentId: string, playerId?: string): Tournament | null {
    const data = loadStore();
    const tournament = data.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return null;

    let myEntry: TournamentEntry | undefined = undefined;
    let myRank: number | undefined = undefined;

    if (playerId) {
      const foundIdx = tournament.entries.findIndex(e => e.playerId === playerId);
      if (foundIdx !== -1) {
        myEntry = tournament.entries[foundIdx];
        myRank = foundIdx + 1;
      }
    }

    return {
      ...tournament,
      myEntry,
      myRank,
    };
  },

  submitScore(tournamentId: string, submission: {
    playerId: string;
    playerName: string;
    score: number;
    blocksBuilt: number;
    maxCombo: number;
    cosmeticId?: string;
    avatar?: string;
    country?: string;
  }) {
    const data = loadStore();
    const tournament = data.tournaments.find(t => t.id === tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    const existingIndex = tournament.entries.findIndex(e => e.playerId === submission.playerId);
    let isNewBest = true;
    let previousRank = existingIndex !== -1 ? existingIndex + 1 : undefined;

    if (existingIndex !== -1) {
      if (tournament.entries[existingIndex].score >= submission.score) {
        // Did not beat previous best
        isNewBest = false;
      } else {
        // Update previous entry
        tournament.entries[existingIndex] = {
          ...tournament.entries[existingIndex],
          playerName: submission.playerName,
          score: submission.score,
          blocksBuilt: Math.max(tournament.entries[existingIndex].blocksBuilt, submission.blocksBuilt),
          maxCombo: Math.max(tournament.entries[existingIndex].maxCombo, submission.maxCombo),
          timestamp: Date.now(),
          cosmeticId: submission.cosmeticId,
          avatar: submission.avatar || tournament.entries[existingIndex].avatar,
          country: submission.country || tournament.entries[existingIndex].country,
        };
      }
    } else {
      // New entrant
      tournament.entries.push({
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        playerId: submission.playerId,
        playerName: submission.playerName,
        score: submission.score,
        blocksBuilt: submission.blocksBuilt,
        maxCombo: submission.maxCombo,
        avatar: submission.avatar || '👑',
        country: submission.country || '🌍',
        cosmeticId: submission.cosmeticId,
        timestamp: Date.now(),
      });
      tournament.totalParticipants += 1;
    }

    // Re-sort leaderboard descending
    tournament.entries.sort((a, b) => b.score - a.score);

    const newRank = tournament.entries.findIndex(e => e.playerId === submission.playerId) + 1;
    saveStore();

    // Also automatically register or update the player's best score in the Global Tournament Leaderboard
    try {
      this.submitGlobalScore('tournament', {
        playerId: submission.playerId,
        playerName: submission.playerName,
        score: submission.score,
        secondaryStat: `${tournament.title} • Combo x${submission.maxCombo}`,
        avatar: submission.avatar,
        country: submission.country,
      });
    } catch (err) {
      console.warn('Silent sync to global tournament leaderboard:', err);
    }

    return {
      success: true,
      rank: newRank,
      previousRank,
      isNewBest,
      score: submission.score,
      totalParticipants: tournament.totalParticipants,
      tournament: {
        ...tournament,
        myRank: newRank,
        myEntry: tournament.entries[newRank - 1],
      },
    };
  },

  getGlobalLeaderboard(type: 'endless' | 'tournament' | 'campaign', playerId?: string) {
    const data = loadStore();
    const list = data.globalLeaderboards[type] || [];
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      isCurrentPlayer: playerId ? item.playerId === playerId : false,
    }));
  },

  submitGlobalScore(type: 'endless' | 'tournament' | 'campaign', submission: {
    playerId: string;
    playerName: string;
    score: number;
    secondaryStat?: string;
    avatar?: string;
    country?: string;
  }) {
    const data = loadStore();
    const list = data.globalLeaderboards[type];
    if (!list) throw new Error('Invalid leaderboard type');

    const existingIdx = list.findIndex(e => e.playerId === submission.playerId);
    let isNewBest = true;

    if (existingIdx !== -1) {
      if (list[existingIdx].score >= submission.score) {
        isNewBest = false;
      } else {
        list[existingIdx] = {
          ...list[existingIdx],
          playerName: submission.playerName,
          score: submission.score,
          secondaryStat: submission.secondaryStat || list[existingIdx].secondaryStat,
          avatar: submission.avatar || list[existingIdx].avatar,
          country: submission.country || list[existingIdx].country,
          timestamp: Date.now(),
        };
      }
    } else {
      list.push({
        id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        playerId: submission.playerId,
        playerName: submission.playerName,
        score: submission.score,
        secondaryStat: submission.secondaryStat,
        avatar: submission.avatar || '⭐',
        country: submission.country || '🌍',
        timestamp: Date.now(),
      });
    }

    list.sort((a, b) => b.score - a.score);
    saveStore();

    const rank = list.findIndex(e => e.playerId === submission.playerId) + 1;
    return {
      success: true,
      rank,
      isNewBest,
      score: submission.score,
    };
  },
};
