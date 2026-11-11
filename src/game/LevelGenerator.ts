export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type BlockArchetype = 'standard' | 'prism' | 'titan' | 'gold_ingot' | 'toxic';

export interface BlockDef {
  id: number;
  type: 'build' | 'boom';
  speed: number;
  delay: number;
  angle: number;
  modifier?: 'ghost' | 'fake-boom' | 'fake-build' | 'blink';
  archetype?: BlockArchetype;
  mass?: number;
}

/**
 * Campaign levels rotate through twists so 200 levels don't feel like the same run,
 * just faster. The core rules (stack critters, never tap a bomb) never change.
 */
export type LevelTwist = 'none' | 'boss' | 'gusty' | 'heavy' | 'tricksters' | 'calm' | 'ghost-night' | 'bomb-rush';

export const TWIST_INFO: Record<LevelTwist, { label: string; intro: string }> = {
  none: { label: '', intro: '' },
  boss: { label: 'BOSS', intro: 'BOSS LEVEL: THE BIG ONE. DEEP BREATHS!' },
  gusty: { label: 'GUSTY', intro: "GUSTY: HOLD ONTO YOUR TOWER, IT'S WINDY! 💨" },
  heavy: { label: 'HEAVY LOAD', intro: 'HEAVY LOAD: CHUNKY GOLD AND ANCHORS INCOMING 🏋️' },
  tricksters: { label: 'TRICKSTERS', intro: 'TRICKSTERS: COSTUMES EVERYWHERE! WATCH FOR THE GLITCH 🎭' },
  calm: { label: 'CALM SKIES', intro: 'CALM SKIES: NO BOMBS, JUST STACK IT SKY-HIGH ☁️' },
  'ghost-night': { label: 'GHOST NIGHT', intro: 'GHOST NIGHT: THINGS GO BUMP AND BLINK 👻' },
  'bomb-rush': { label: 'BOMB RUSH', intro: "BOMB RUSH: SO MANY BOMBS! DON'T TAP THEM 💣" },
};

const TWIST_CYCLE: LevelTwist[] = ['none', 'gusty', 'heavy', 'tricksters', 'calm', 'ghost-night', 'bomb-rush'];

export function levelTwist(levelIndex: number): LevelTwist {
  if (levelIndex <= 5) return 'none';
  if (levelIndex % 10 === 0) return 'boss';
  return TWIST_CYCLE[levelIndex % TWIST_CYCLE.length];
}

export function calculateBlockMass(archetype?: BlockArchetype, isBoom?: boolean, rng?: () => number): number {
  const r = rng ? rng() : 0.5;
  if (isBoom) {
    return Number((1.3 + r * 0.4).toFixed(2));
  }
  switch (archetype) {
    case 'titan':
      return Number((2.8 + r * 0.4).toFixed(2));
    case 'gold_ingot':
      return Number((2.0 + r * 0.4).toFixed(2));
    case 'prism':
      return Number((0.5 + r * 0.2).toFixed(2));
    case 'toxic':
      return Number((1.3 + r * 0.2).toFixed(2));
    case 'standard':
    default:
      return Number((0.85 + r * 0.35).toFixed(2));
  }
}

export function getBlockMass(block?: Partial<BlockDef> | null): number {
  if (!block) return 1.0;
  if (typeof block.mass === 'number' && block.mass > 0) {
    return block.mass;
  }
  return calculateBlockMass(block.archetype, block.type === 'boom');
}

export interface SandboxOptions {
  seed?: number;
  speedMultiplier: number;
  boomChance: number;
  blockCount: number;
  allowGhosts: boolean;
  allowBlinks: boolean;
  allowFakes: boolean;
  allowSpecialBlocks: boolean;
  /** Wind gust strength 0 (calm) to 1 (strong) */
  wind?: number;
}

const ANGLES = [0, Math.PI/4, Math.PI/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*3/2, Math.PI*7/4];

export function generateLevel(levelIndex: number): BlockDef[] {
  // Use a fixed seed for each level so they are deterministic
  const rng = mulberry32(levelIndex * 1337 ^ 0xabc123);
  
  // Start with fewer blocks, increase slowly
  // Level 1: 5 blocks
  // Level 200: 105 blocks
  const twist = levelTwist(levelIndex);
  let blocksCount = 5 + Math.floor(levelIndex * 0.5);
  if (twist === 'calm') blocksCount = Math.round(blocksCount * 0.8) + 3; // all pieces, a tall straight build
  if (twist === 'bomb-rush') blocksCount = Math.max(8, Math.round(blocksCount * 0.7));
  const blocks: BlockDef[] = [];
  
  // Slower initial speed, scales over 200 levels
  // Initial speed: 2.5 seconds
  // Minimum speed (max diff): 0.5 seconds
  const baseSpeed = Math.max(0.35, 1.8 - levelIndex * 0.015);
  
  let lastSpawn = 0;
  let lastArrival = 0;

  for (let i = 0; i < blocksCount; i++) {
    // Starts at 10% chance of BOOM, scales to 40% at level 200
    // Bombs top out at 40% so late levels are about building, not mostly waiting
    let boomChance = Math.min(0.4, 0.15 + (levelIndex * 0.02));
    if (twist === 'calm') boomChance = 0;
    if (twist === 'bomb-rush') boomChance = 0.6;
    const isBoom = rng() < boomChance;
    
    // Vary speed
    const speedVariation = 0.7 + rng() * 0.6; // 0.7x to 1.3x
    const speed = baseSpeed * speedVariation;
    
    // Time from spawn to center (distance 120 -> 0)
    const timeToCenter = speed * 1.2;
    
    // Calculate a safe delay to prevent overlap
    const delayVariation = 0.5 + rng() * 1.0;
    const gap = isBoom ? baseSpeed * 0.4 : baseSpeed * 0.7 * delayVariation;
    
    let desiredArrival = lastArrival + gap;
    if (i === 0) desiredArrival = timeToCenter; // first block arrives exactly when it naturally would
    
    let spawnTime = desiredArrival - timeToCenter;
    
    // Ensure we don't spawn before the previous block
    if (i > 0 && spawnTime < lastSpawn + 0.1) {
      spawnTime = lastSpawn + 0.1;
      desiredArrival = spawnTime + timeToCenter;
    }
    
    const delay = i === 0 ? 0 : spawnTime - lastSpawn;
    lastSpawn = spawnTime;
    lastArrival = desiredArrival;
    
    // Pick a random angle from the 8 cardinal/ordinal directions
    const angle = ANGLES[Math.floor(rng() * ANGLES.length)];

    // Assign deceptive modifiers on higher levels
    let modifier: BlockDef['modifier'];
    if (levelIndex > 3) { // Start modifiers much earlier (level 4+)
      const modRoll = rng();
      let modChance = Math.min(0.6, 0.1 + (levelIndex * 0.03)); // Scales up quickly to 60% chance
      if (twist === 'tricksters' || twist === 'ghost-night') modChance = Math.min(0.75, modChance + 0.25);
      if (modRoll < modChance) {
        const kind = modRoll / modChance;
        if (twist === 'tricksters') modifier = isBoom ? 'fake-build' : 'fake-boom';
        else if (twist === 'ghost-night') modifier = kind < 0.6 ? 'ghost' : 'blink';
        else if (kind < 0.33) modifier = 'ghost';
        else if (kind < 0.66) modifier = isBoom ? 'fake-build' : 'fake-boom';
        else modifier = 'blink';
      }
    }
    
    let archetype: BlockArchetype | undefined = isBoom ? undefined : (levelIndex > 2 ? rollArchetype(rng, levelIndex / 20) : 'standard');
    if (twist === 'heavy' && !isBoom && rng() < 0.45) archetype = rng() < 0.6 ? 'gold_ingot' : 'titan';
    const mass = calculateBlockMass(archetype, isBoom, rng);

    blocks.push({
      id: i,
      type: isBoom ? 'boom' : 'build',
      speed: speed,
      delay: delay,
      angle: angle,
      modifier,
      archetype,
      mass,
    });
  }
  

  // Guarantee first block is always BUILD and has no modifiers
  blocks[0].type = 'build';
  blocks[0].modifier = undefined;
  blocks[0].angle = -Math.PI / 2;
  blocks[0].archetype = 'standard';
  blocks[0].mass = 1.0;
  
  // Guarantee at least 1 bomb per level (from Level 2 onwards)
  if (levelIndex > 1 && twist !== 'calm' && !blocks.some(b => b.type === 'boom')) {
     blocks[blocks.length - 1].type = 'boom';
  }

  
  return blocks;
}

export function generateTutorialBlocks(): BlockDef[] {
  return [
    {
      id: 1,
      type: 'build',
      speed: 2.4, // Generous travel time
      delay: 0.6,
      angle: -Math.PI / 2, // Direct vertical approach from top
      archetype: 'standard',
      mass: 1.0,
    },
    {
      id: 2,
      type: 'build',
      speed: 2.2,
      delay: 1.8,
      angle: -Math.PI / 4, // Diagonal approach from top-right
      archetype: 'gold_ingot',
      mass: 1.2,
    },
    {
      id: 3,
      type: 'build',
      speed: 2.0,
      delay: 1.8,
      angle: -Math.PI * 3 / 4, // Diagonal approach from top-left
      archetype: 'prism',
      mass: 1.0,
    },
  ];
}

export function generateEndless(seed: number, count: number, startDifficulty: number = 1): BlockDef[] {
  const rng = mulberry32(seed);
  const blocks: BlockDef[] = [];
  
  let lastSpawn = 0;
  let lastArrival = 0;
  
  for (let i = 0; i < count; i++) {
    const diff = startDifficulty + Math.floor(i / 10);
    const boomChance = Math.min(0.45, 0.25 + (diff * 0.03)); // capped so runs stay about building
    const isBoom = rng() < boomChance;
    
    const baseSpeed = Math.max(0.3, 1.4 - diff * 0.05);
    const speedVariation = 0.6 + rng() * 0.8; 
    const speed = baseSpeed * speedVariation;
    
    const timeToCenter = speed * 1.2;
    const gap = baseSpeed * (0.6 + rng() * 0.8);
    
    let desiredArrival = lastArrival + gap;
    if (i === 0) desiredArrival = timeToCenter;
    
    let spawnTime = desiredArrival - timeToCenter;
    
    if (i > 0 && spawnTime < lastSpawn + 0.1) {
      spawnTime = lastSpawn + 0.1;
      desiredArrival = spawnTime + timeToCenter;
    }
    
    const delay = i === 0 ? 0 : spawnTime - lastSpawn;
    lastSpawn = spawnTime;
    lastArrival = desiredArrival;
    
    const angle = ANGLES[Math.floor(rng() * ANGLES.length)];
    
    let modifier: BlockDef['modifier'];
    if (diff > 1) { // Start modifiers earlier in endless
      const modRoll = rng();
      const modChance = Math.min(0.65, 0.15 + (diff * 0.05));
      if (modRoll < modChance) {
        if (modRoll < modChance * 0.33) modifier = 'ghost';
        else if (modRoll < modChance * 0.66) modifier = isBoom ? 'fake-build' : 'fake-boom';
        else modifier = 'blink';
      }
    }
    
    const archetype = isBoom ? undefined : rollArchetype(rng, diff / 10);
    const mass = calculateBlockMass(archetype, isBoom, rng);

    blocks.push({
      id: i,
      type: isBoom ? 'boom' : 'build',
      speed: speed,
      delay: delay,
      angle: angle,
      modifier,
      archetype,
      mass,
    });
  }
  
  blocks[0].type = 'build';
  blocks[0].modifier = undefined;
  blocks[0].angle = -Math.PI / 2;
  blocks[0].archetype = 'standard';
  blocks[0].mass = 1.0;
  
  return blocks;
}

export function generateTournament(
  seed: number,
  blockCount: number = 75,
  speedMultiplier: number = 1.0,
  boomChanceRatio: number = 0.3
): BlockDef[] {
  const rng = mulberry32(seed);
  const blocks: BlockDef[] = [];
  let lastSpawn = 0;
  let lastArrival = 0;

  for (let i = 0; i < blockCount; i++) {
    const progress = i / blockCount;
    // Difficulty escalates over the tournament run
    const boomChance = Math.min(0.60, boomChanceRatio + progress * 0.15);
    const isBoom = i > 0 && rng() < boomChance;

    const baseSpeed = Math.max(0.35, (1.5 - progress * 0.45) / speedMultiplier);
    const speedVariation = 0.85 + rng() * 0.3;
    const speed = baseSpeed * speedVariation;

    const timeToCenter = speed * 1.2;
    const gap = baseSpeed * (0.65 + rng() * 0.6);

    let desiredArrival = lastArrival + gap;
    if (i === 0) desiredArrival = timeToCenter;

    let spawnTime = desiredArrival - timeToCenter;
    if (i > 0 && spawnTime < lastSpawn + 0.1) {
      spawnTime = lastSpawn + 0.1;
      desiredArrival = spawnTime + timeToCenter;
    }

    const delay = i === 0 ? 0 : spawnTime - lastSpawn;
    lastSpawn = spawnTime;
    lastArrival = desiredArrival;

    const angle = ANGLES[Math.floor(rng() * ANGLES.length)];

    let modifier: BlockDef['modifier'];
    if (i > 8 && rng() < 0.35) {
      const roll = rng();
      if (roll < 0.33) modifier = 'ghost';
      else if (roll < 0.66) modifier = isBoom ? 'fake-build' : 'fake-boom';
      else modifier = 'blink';
    }

    const archetype = isBoom ? undefined : rollArchetype(rng, progress);
    const mass = calculateBlockMass(archetype, isBoom, rng);

    blocks.push({
      id: i,
      type: isBoom ? 'boom' : 'build',
      speed,
      delay,
      angle,
      modifier,
      archetype,
      mass,
    });
  }

  blocks[0].type = 'build';
  blocks[0].modifier = undefined;
  blocks[0].angle = -Math.PI / 2;
  blocks[0].archetype = 'standard';
  blocks[0].mass = 1.0;

  return blocks;
}

export function rollArchetype(rng: () => number, difficulty: number): BlockArchetype {
  const roll = rng();
  if (roll < 0.08) return 'prism';
  if (roll < 0.16) return 'titan';
  if (roll < 0.25) return 'gold_ingot';
  return 'standard';
}

export function generateSandboxLevel(options: SandboxOptions): BlockDef[] {
  const seed = options.seed || Math.floor(Math.random() * 999999);
  const rng = mulberry32(seed);
  const blocks: BlockDef[] = [];
  let lastSpawn = 0;
  let lastArrival = 0;

  for (let i = 0; i < options.blockCount; i++) {
    const isBoom = i > 0 && rng() < options.boomChance;
    const baseSpeed = Math.max(0.3, 1.2 / options.speedMultiplier);
    const speedVariation = 0.85 + rng() * 0.3;
    const speed = baseSpeed * speedVariation;

    const timeToCenter = speed * 1.2;
    const gap = baseSpeed * (0.6 + rng() * 0.7);

    let desiredArrival = lastArrival + gap;
    if (i === 0) desiredArrival = timeToCenter;

    let spawnTime = desiredArrival - timeToCenter;
    if (i > 0 && spawnTime < lastSpawn + 0.1) {
      spawnTime = lastSpawn + 0.1;
      desiredArrival = spawnTime + timeToCenter;
    }

    const delay = i === 0 ? 0 : spawnTime - lastSpawn;
    lastSpawn = spawnTime;
    lastArrival = desiredArrival;

    const angle = ANGLES[Math.floor(rng() * ANGLES.length)];

    let modifier: BlockDef['modifier'];
    if (i > 3) {
      const modRoll = rng();
      if (options.allowGhosts && modRoll < 0.2) modifier = 'ghost';
      else if (options.allowFakes && modRoll < 0.4) modifier = isBoom ? 'fake-build' : 'fake-boom';
      else if (options.allowBlinks && modRoll < 0.6) modifier = 'blink';
    }

    let archetype: BlockArchetype = 'standard';
    if (!isBoom && options.allowSpecialBlocks && i > 0) {
      archetype = rollArchetype(rng, i / options.blockCount);
    }
    const mass = calculateBlockMass(archetype, isBoom, rng);

    blocks.push({
      id: i,
      type: isBoom ? 'boom' : 'build',
      speed,
      delay,
      angle,
      modifier,
      archetype,
      mass,
    });
  }

  blocks[0].type = 'build';
  blocks[0].modifier = undefined;
  blocks[0].angle = -Math.PI / 2;
  blocks[0].archetype = 'standard';
  blocks[0].mass = 1.0;

  return blocks;
}


