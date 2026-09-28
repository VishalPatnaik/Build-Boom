export interface TournamentEntry {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  blocksBuilt: number;
  maxCombo: number;
  cosmeticId?: string;
  avatar: string;
  country: string;
  timestamp: number;
  isCurrentPlayer?: boolean;
}

export interface TournamentPrize {
  coins: number;
  trophy?: 'gold' | 'silver' | 'bronze';
  title?: string;
}

export interface Tournament {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  gradient: string;
  bannerBorder: string;
  bgZoneId: string;
  worldNumber: number; // 1-20 corresponding to World/Zone
  worldName: string;   // e.g. "Spring Meadow", "Volcano", "Cyberpunk"
  requiredLevel: number; // Level required to unlock this world (e.g. 1, 41, 71, 131, 141)
  seed: number;
  blockCount: number;
  speedMultiplier: number;
  boomChance: number;
  modifierDesc: string;
  startTime: number;
  endTime: number;
  prizes: {
    first: TournamentPrize;
    second: TournamentPrize;
    third: TournamentPrize;
    top10: TournamentPrize;
    top50: TournamentPrize;
  };
  totalParticipants: number;
  entries: TournamentEntry[];
  myEntry?: TournamentEntry;
  myRank?: number;
}

export interface GlobalLeaderboardEntry {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  secondaryStat?: string; // e.g. "Level 142" or "Combo x28"
  avatar: string;
  country: string;
  timestamp: number;
  isCurrentPlayer?: boolean;
}
