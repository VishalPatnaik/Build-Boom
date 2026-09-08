export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BlockDef {
  id: number;
  type: 'build' | 'boom';
  speed: number;
  delay: number;
  angle: number;
  modifier?: 'ghost' | 'fake-boom' | 'fake-build' | 'blink';
}

const ANGLES = [0, Math.PI/4, Math.PI/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*3/2, Math.PI*7/4];

export function generateLevel(levelIndex: number): BlockDef[] {
  // Use a fixed seed for each level so they are deterministic
  const rng = mulberry32(levelIndex * 1337 ^ 0xabc123);
  
  const blocksCount = 10 + Math.floor(levelIndex * 1.5);
  const blocks: BlockDef[] = [];
  
  // Base difficulty scaling
  const baseSpeed = Math.max(0.5, 2.0 - levelIndex * 0.05); // time in seconds to cross radius
  
  for (let i = 0; i < blocksCount; i++) {
    // 20% chance of BOOM initially, scales up to 40%
    const boomChance = Math.min(0.4, 0.15 + (levelIndex * 0.01));
    const isBoom = rng() < boomChance;
    
    // Vary speed
    const speedVariation = 0.7 + rng() * 0.6; // 0.7x to 1.3x
    const speed = baseSpeed * speedVariation;
    
    // Delay before this block spawns after the previous one was handled
    const delayVariation = 0.5 + rng() * 1.0;
    const delay = isBoom ? speed * 0.5 : speed * 0.8 * delayVariation;
    
    // Pick a random angle from the 8 cardinal/ordinal directions
    const angle = ANGLES[Math.floor(rng() * ANGLES.length)];

    // Assign deceptive modifiers on higher levels
    let modifier: BlockDef['modifier'];
    if (levelIndex > 2) {
      const modRoll = rng();
      if (modRoll < 0.1) modifier = 'ghost';
      else if (modRoll < 0.2) modifier = isBoom ? 'fake-build' : 'fake-boom';
      else if (modRoll < 0.3) modifier = 'blink';
    }
    
    blocks.push({
      id: i,
      type: isBoom ? 'boom' : 'build',
      speed: speed,
      delay: delay,
      angle: angle,
      modifier
    });
  }
  
  // Guarantee first block is always BUILD and has no modifiers
  blocks[0].type = 'build';
  blocks[0].modifier = undefined;
  blocks[0].angle = -Math.PI / 2;
  
  return blocks;
}

export function generateEndless(seed: number, count: number, startDifficulty: number = 1): BlockDef[] {
  const rng = mulberry32(seed);
  const blocks: BlockDef[] = [];
  
  for (let i = 0; i < count; i++) {
    const diff = startDifficulty + Math.floor(i / 10);
    const boomChance = Math.min(0.5, 0.15 + (diff * 0.015));
    const isBoom = rng() < boomChance;
    
    const baseSpeed = Math.max(0.4, 1.8 - diff * 0.04);
    const speedVariation = 0.6 + rng() * 0.8; 
    const speed = baseSpeed * speedVariation;
    const delay = speed * (0.6 + rng() * 0.8);
    const angle = ANGLES[Math.floor(rng() * ANGLES.length)];
    
    let modifier: BlockDef['modifier'];
    if (diff > 2) {
      const modRoll = rng();
      if (modRoll < 0.1) modifier = 'ghost';
      else if (modRoll < 0.2) modifier = isBoom ? 'fake-build' : 'fake-boom';
      else if (modRoll < 0.3) modifier = 'blink';
    }
    
    blocks.push({
      id: i,
      type: isBoom ? 'boom' : 'build',
      speed: speed,
      delay: delay,
      angle: angle,
      modifier
    });
  }
  
  blocks[0].type = 'build';
  blocks[0].modifier = undefined;
  blocks[0].angle = -Math.PI / 2;
  return blocks;
}
