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
  
  // Start with fewer blocks, increase slowly
  // Level 1: 5 blocks
  // Level 200: 105 blocks
  const blocksCount = 5 + Math.floor(levelIndex * 0.5);
  const blocks: BlockDef[] = [];
  
  // Slower initial speed, scales over 200 levels
  // Initial speed: 2.5 seconds
  // Minimum speed (max diff): 0.5 seconds
  const baseSpeed = Math.max(0.35, 1.8 - levelIndex * 0.015);
  
  let lastSpawn = 0;
  let lastArrival = 0;

  for (let i = 0; i < blocksCount; i++) {
    // Starts at 10% chance of BOOM, scales to 40% at level 200
    const boomChance = Math.min(0.60, 0.15 + (levelIndex * 0.02)); // Increased bomb scaling
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
      const modChance = Math.min(0.6, 0.1 + (levelIndex * 0.03)); // Scales up quickly to 60% chance
      if (modRoll < modChance) {
        if (modRoll < modChance * 0.33) modifier = 'ghost';
        else if (modRoll < modChance * 0.66) modifier = isBoom ? 'fake-build' : 'fake-boom';
        else modifier = 'blink';
      }
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
  
  // Guarantee at least 1 bomb per level (from Level 2 onwards)
  if (levelIndex > 1 && !blocks.some(b => b.type === 'boom')) {
     blocks[blocks.length - 1].type = 'boom';
  }

  
  return blocks;
}

export function generateEndless(seed: number, count: number, startDifficulty: number = 1): BlockDef[] {
  const rng = mulberry32(seed);
  const blocks: BlockDef[] = [];
  
  let lastSpawn = 0;
  let lastArrival = 0;
  
  for (let i = 0; i < count; i++) {
    const diff = startDifficulty + Math.floor(i / 10);
    const boomChance = Math.min(0.65, 0.25 + (diff * 0.03)); // Higher base endless chance
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


