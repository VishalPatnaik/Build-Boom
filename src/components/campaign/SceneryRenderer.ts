// SCENERY RENDERER - REALISTIC HIGH-FIDELITY SCENIC ASSETS
// High detail rendering with realistic gradients, lighting, depth, and specular highlights.

export function drawScenery(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  scale: number,
  time: number
) {
  if (!ctx || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(scale) || scale <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  switch (type) {
    // 0: Meadow
    case 'oak_tree':
      drawOakTree(ctx);
      break;
    case 'wild_flower':
      drawWildFlower(ctx, time);
      break;
    case 'stone_boulder':
      drawStoneBoulder(ctx);
      break;

    // 1: Lunar
    case 'lunar_crater':
      drawLunarCrater(ctx);
      break;
    case 'lunar_beacon':
      drawLunarBeacon(ctx, time);
      break;

    // 2: Mars
    case 'redstone_cliff':
    case 'canyon_arch':
      drawRedstoneCliff(ctx);
      break;

    // 4: Ocean
    case 'coral_reef':
      drawCoralReef(ctx, time);
      break;
    case 'sea_anemone':
      drawSeaAnemone(ctx, time);
      break;

    // 5: Beach
    case 'palm_tree':
    case 'desert_palm':
      drawPalmTree(ctx, time);
      break;

    // 6: Volcano
    case 'volcano_vent':
    case 'lava_crag':
      drawVolcanoVent(ctx, time);
      break;

    // 7: Castle
    case 'castle_tower':
    case 'stone_obelisk':
      drawCastleTower(ctx, time);
      break;

    // 8: Enchanted Redwood
    case 'redwood_tree':
      drawRedwoodTree(ctx);
      break;
    case 'glowing_mushroom':
      drawGlowingMushroom(ctx, time);
      break;

    // 9: Desert
    case 'sandstone_pyramid':
    case 'sandstone_pillar':
      drawSandstonePyramid(ctx);
      break;

    // 10: Tundra
    case 'ice_spire':
    case 'glacier_boulder':
      drawIceSpire(ctx);
      break;
    case 'snowy_pine':
      drawSnowyPine(ctx);
      break;

    // 12: Candyland
    case 'sugar_crystal':
      drawSugarCrystal(ctx);
      break;
    case 'glazed_lollipop':
      drawGlazedLollipop(ctx, time);
      break;

    // 13: El Dorado
    case 'golden_monolith':
    case 'sun_temple_block':
      drawGoldenMonolith(ctx);
      break;

    // 14: Cyberpunk
    case 'cyber_billboard':
    case 'neon_spire':
      drawCyberBillboard(ctx, time);
      break;

    // 15: Toxic
    case 'cooling_pipe':
    case 'hazard_cask':
      drawHazardCask(ctx, time);
      break;

    // 16: Sky Islands
    case 'sky_island':
      drawSkyIsland(ctx, time);
      break;

    // 17: Clockwork
    case 'brass_gear':
    case 'steam_pipe':
      drawBrassGear(ctx, time);
      break;

    // 18: Sakura
    case 'sakura_tree':
      drawSakuraTree(ctx, time);
      break;
    case 'torii_gate':
      drawToriiGate(ctx);
      break;

    // 19: The Core
    case 'amethyst_cluster':
    case 'quartz_pillar':
    default:
      drawAmethystCluster(ctx, time);
      break;
  }

  ctx.restore();
}

// 1. Realistic Oak Tree (Layered canopy, textured bark)
function drawOakTree(ctx: CanvasRenderingContext2D) {
  // Trunk
  const trunkGrad = ctx.createLinearGradient(-8, 0, 8, 0);
  trunkGrad.addColorStop(0, '#291404');
  trunkGrad.addColorStop(0.5, '#5c2d12');
  trunkGrad.addColorStop(1, '#1c0a02');
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(-6, 20);
  ctx.lineTo(-4, -10);
  ctx.lineTo(4, -10);
  ctx.lineTo(8, 20);
  ctx.closePath();
  ctx.fill();

  // Layered foliage clusters
  const clusters = [
    { x: -14, y: -22, r: 16, c: '#15803d' },
    { x: 14, y: -20, r: 17, c: '#166534' },
    { x: 0, y: -34, r: 18, c: '#16a34a' },
    { x: -2, y: -26, r: 15, c: '#22c55e' },
  ];
  clusters.forEach(cl => {
    ctx.fillStyle = cl.c;
    ctx.beginPath();
    ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
    ctx.fill();
    // Sunlit highlight rim
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cl.x - 2, cl.y - 2, cl.r - 2, Math.PI * 0.8, Math.PI * 1.8);
    ctx.stroke();
  });
}

// 2. Realistic Wild Flower
function drawWildFlower(ctx: CanvasRenderingContext2D, time: number) {
  const sway = Math.sin(time * 0.003) * 2;
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.quadraticCurveTo(sway, 0, sway * 1.5, -10);
  ctx.stroke();

  // Blossom
  ctx.save();
  ctx.translate(sway * 1.5, -10);
  ctx.fillStyle = '#fbbf24';
  for (let i = 0; i < 5; i++) {
    const ang = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.ellipse(Math.cos(ang) * 4, Math.sin(ang) * 4, 3, 2, ang, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 3. Realistic Stone Boulder
function drawStoneBoulder(ctx: CanvasRenderingContext2D) {
  const rockGrad = ctx.createLinearGradient(-12, -10, 12, 12);
  rockGrad.addColorStop(0, '#94a3b8');
  rockGrad.addColorStop(0.5, '#475569');
  rockGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = rockGrad;
  ctx.beginPath();
  ctx.moveTo(-16, 10);
  ctx.lineTo(-12, -6);
  ctx.lineTo(2, -14);
  ctx.lineTo(14, -2);
  ctx.lineTo(16, 10);
  ctx.closePath();
  ctx.fill();

  // Moss patch on top
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(0, -10, 6, 0, Math.PI);
  ctx.fill();
}

// 4. Lunar Crater
function drawLunarCrater(ctx: CanvasRenderingContext2D) {
  // Outer rim
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Inner dark pit
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(2, 1, 15, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rim specular highlight
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(-2, -1, 18, 8, 0, Math.PI * 0.9, Math.PI * 2);
  ctx.stroke();
}

// 5. Lunar Apollo Beacon
function drawLunarBeacon(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#eab308'; // Gold foil box
  ctx.fillRect(-6, 2, 12, 8);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, -18);
  ctx.stroke();

  // Pulsing antenna beacon
  const flash = Math.sin(time * 0.008) > 0.3;
  ctx.fillStyle = flash ? '#38bdf8' : '#0369a1';
  ctx.beginPath();
  ctx.arc(0, -19, flash ? 3.5 : 2, 0, Math.PI * 2);
  ctx.fill();
}

// 6. Redstone Canyon Cliff
function drawRedstoneCliff(ctx: CanvasRenderingContext2D) {
  const cliffGrad = ctx.createLinearGradient(-14, -20, 14, 15);
  cliffGrad.addColorStop(0, '#f97316');
  cliffGrad.addColorStop(0.5, '#c2410c');
  cliffGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = cliffGrad;
  ctx.beginPath();
  ctx.moveTo(-15, 15);
  ctx.lineTo(-12, -22);
  ctx.lineTo(8, -25);
  ctx.lineTo(15, 15);
  ctx.closePath();
  ctx.fill();
  // Sediment lines
  ctx.strokeStyle = '#fdba74';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-13, -10);
  ctx.lineTo(13, -10);
  ctx.moveTo(-14, 2);
  ctx.lineTo(14, 2);
  ctx.stroke();
}

// 7. Coral Reef & Sea Fan
function drawCoralReef(ctx: CanvasRenderingContext2D, time: number) {
  const sway = Math.sin(time * 0.002) * 2;
  const coralGrad = ctx.createLinearGradient(-15, 10, 15, -25);
  coralGrad.addColorStop(0, '#0e7490');
  coralGrad.addColorStop(0.5, '#06b6d4');
  coralGrad.addColorStop(1, '#f43f5e');
  ctx.fillStyle = coralGrad;

  [-10, -2, 6, 12].forEach((bx, idx) => {
    ctx.beginPath();
    ctx.moveTo(bx, 12);
    ctx.quadraticCurveTo(bx + sway, -8, bx + (idx % 2 === 0 ? -4 : 4) + sway * 1.5, -22 - idx * 3);
    ctx.lineWidth = 4;
    ctx.strokeStyle = coralGrad;
    ctx.lineCap = 'round';
    ctx.stroke();
  });
}

// 8. Sea Anemone
function drawSeaAnemone(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.ellipse(0, 8, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI + Math.PI;
    const sway = Math.sin(time * 0.003 + i) * 3;
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * 8, 8);
    ctx.quadraticCurveTo(Math.cos(ang) * 12 + sway, -4, Math.cos(ang) * 10 + sway * 1.5, -14);
    ctx.stroke();
  }
}

// 9. Tropical Palm Tree
function drawPalmTree(ctx: CanvasRenderingContext2D, time: number) {
  const sway = Math.sin(time * 0.002) * 4;
  // Curved trunk
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(-10, 0, -4 + sway, -25);
  ctx.stroke();

  // Palm fronds
  ctx.save();
  ctx.translate(-4 + sway, -25);
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 2.2;
  const angles = [-0.9, -0.4, 0.1, 0.7, 1.2, -1.3];
  angles.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * 18, Math.sin(a) * 14 - 3, Math.cos(a) * 26, Math.sin(a) * 18);
    ctx.stroke();
  });
  ctx.restore();
}

// 10. Volcano Vent
function drawVolcanoVent(ctx: CanvasRenderingContext2D, time: number) {
  // Basalt cone
  ctx.fillStyle = '#270808';
  ctx.beginPath();
  ctx.moveTo(-18, 16);
  ctx.lineTo(-7, -10);
  ctx.lineTo(7, -10);
  ctx.lineTo(18, 16);
  ctx.closePath();
  ctx.fill();

  // Magma crater
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(0, -10, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floating flame ember
  const sparkY = -12 - ((time * 0.03) % 18);
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(Math.sin(time * 0.005) * 3, sparkY, 2, 0, Math.PI * 2);
  ctx.fill();
}

// 11. Castle Fortress Tower
function drawCastleTower(ctx: CanvasRenderingContext2D, time: number) {
  // Stone masonry tower
  const stoneGrad = ctx.createLinearGradient(-10, 0, 10, 0);
  stoneGrad.addColorStop(0, '#334155');
  stoneGrad.addColorStop(0.5, '#64748b');
  stoneGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = stoneGrad;
  ctx.fillRect(-10, -22, 20, 36);

  // Parapets
  ctx.fillRect(-12, -28, 24, 6);
  ctx.clearRect(-5, -28, 10, 3);

  // Torchlight window
  ctx.fillStyle = Math.sin(time * 0.01) > 0 ? '#f59e0b' : '#fbbf24';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 6;
  ctx.fillRect(-3, -12, 6, 10);
}

// 12. Giant Redwood Tree Trunk
function drawRedwoodTree(ctx: CanvasRenderingContext2D) {
  const woodGrad = ctx.createLinearGradient(-14, 0, 14, 0);
  woodGrad.addColorStop(0, '#14532d');
  woodGrad.addColorStop(0.4, '#451a03');
  woodGrad.addColorStop(0.7, '#78350f');
  woodGrad.addColorStop(1, '#1c0a02');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(-12, -35, 24, 52);

  // Bioluminescent moss line
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -15);
  ctx.lineTo(-4, 5);
  ctx.stroke();
}

// 13. Glowing Forest Mushroom
function drawGlowingMushroom(ctx: CanvasRenderingContext2D, time: number) {
  // Stalk
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-3, -5, 6, 15);

  // Cap
  const pulse = Math.sin(time * 0.004) * 0.2 + 0.8;
  ctx.fillStyle = '#10b981';
  ctx.shadowColor = '#34d399';
  ctx.shadowBlur = 10 * pulse;
  ctx.beginPath();
  ctx.ellipse(0, -6, 14, 8, 0, Math.PI, 0);
  ctx.fill();

  // Spore spots
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-5, -8, 1.8, 0, Math.PI * 2);
  ctx.arc(3, -9, 2, 0, Math.PI * 2);
  ctx.fill();
}

// 14. Desert Sandstone Pyramid
function drawSandstonePyramid(ctx: CanvasRenderingContext2D) {
  // Sunlit face
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(-18, 14);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.fill();

  // Shadow face
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, 16);
  ctx.lineTo(18, 14);
  ctx.closePath();
  ctx.fill();
}

// 15. Glacial Ice Spire
function drawIceSpire(ctx: CanvasRenderingContext2D) {
  const iceGrad = ctx.createLinearGradient(-12, -25, 12, 15);
  iceGrad.addColorStop(0, '#ffffff');
  iceGrad.addColorStop(0.4, '#7dd3fc');
  iceGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = iceGrad;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(-12, 14);
  ctx.lineTo(12, 14);
  ctx.closePath();
  ctx.fill();

  // Specular facet
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(2, 14);
  ctx.stroke();
}

// 16. Snowy Pine Tree
function drawSnowyPine(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-3, 6, 6, 10);

  // 3 Pine tiers
  [-12, -2, 8].forEach((py, idx) => {
    const pw = 18 - idx * 4;
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(0, py - 10);
    ctx.lineTo(-pw, py);
    ctx.lineTo(pw, py);
    ctx.closePath();
    ctx.fill();

    // Snow cap
    ctx.fillStyle = '#f0f9ff';
    ctx.beginPath();
    ctx.moveTo(0, py - 10);
    ctx.lineTo(-pw * 0.6, py - 4);
    ctx.lineTo(pw * 0.6, py - 4);
    ctx.closePath();
    ctx.fill();
  });
}

// 17. Artisan Sugar Crystal
function drawSugarCrystal(ctx: CanvasRenderingContext2D) {
  const sugarGrad = ctx.createRadialGradient(-3, -8, 2, 0, 0, 18);
  sugarGrad.addColorStop(0, '#fbcfe8');
  sugarGrad.addColorStop(0.5, '#f43f5e');
  sugarGrad.addColorStop(1, '#9d174d');
  ctx.fillStyle = sugarGrad;
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(11, -8);
  ctx.lineTo(8, 12);
  ctx.lineTo(-8, 12);
  ctx.lineTo(-11, -8);
  ctx.closePath();
  ctx.fill();

  // Glossy highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(-4, -16, 3, 7);
}

// 18. Glazed Confection Swirl Lollipop
function drawGlazedLollipop(ctx: CanvasRenderingContext2D, time: number) {
  // Paper stick
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-2, -4, 4, 22);

  // Swirl disc
  const rot = time * 0.001;
  ctx.save();
  ctx.translate(0, -12);
  ctx.rotate(rot);
  const candyGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
  candyGrad.addColorStop(0, '#fef08a');
  candyGrad.addColorStop(0.5, '#ec4899');
  candyGrad.addColorStop(1, '#be185d');
  ctx.fillStyle = candyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();

  // Spiral swirl
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

// 19. Solid Gold Monolith
function drawGoldenMonolith(ctx: CanvasRenderingContext2D) {
  const goldGrad = ctx.createLinearGradient(-10, -20, 10, 15);
  goldGrad.addColorStop(0, '#fef9c3');
  goldGrad.addColorStop(0.4, '#eab308');
  goldGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = goldGrad;
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 8;
  ctx.fillRect(-8, -24, 16, 38);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1;
  ctx.strokeRect(-8, -24, 16, 38);
}

// 20. Cyberpunk Billboard
function drawCyberBillboard(ctx: CanvasRenderingContext2D, time: number) {
  // Support pylon
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-3, -6, 6, 20);

  // Billboard neon frame
  ctx.fillStyle = '#030712';
  ctx.fillRect(-18, -26, 36, 20);
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 8;
  ctx.strokeRect(-18, -26, 36, 20);

  // Flickering hologram glyph
  const flash = Math.sin(time * 0.01) > 0;
  ctx.fillStyle = flash ? '#f43f5e' : '#a855f7';
  ctx.fillRect(-12, -20, 24, 8);
}

// 21. Toxic Hazard Cask
function drawHazardCask(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-10, -14, 20, 26);
  // Hazard stripe
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-10, -6, 20, 4);

  // Glowing isotope port
  const glow = Math.sin(time * 0.006) * 0.2 + 0.8;
  ctx.fillStyle = '#84cc16';
  ctx.shadowColor = '#84cc16';
  ctx.shadowBlur = 8 * glow;
  ctx.beginPath();
  ctx.arc(0, 4, 4, 0, Math.PI * 2);
  ctx.fill();
}

// 22. Sky Island
function drawSkyIsland(ctx: CanvasRenderingContext2D, time: number) {
  const bob = Math.sin(time * 0.002) * 3;
  ctx.save();
  ctx.translate(0, bob);
  // Floating rock cone
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(16, 0);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.fill();

  // Green grass cap
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 23. Precision Brass Clockwork Gear
function drawBrassGear(ctx: CanvasRenderingContext2D, time: number) {
  const rot = time * 0.001;
  ctx.save();
  ctx.rotate(rot);
  const gearGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
  gearGrad.addColorStop(0, '#fef08a');
  gearGrad.addColorStop(0.5, '#b45309');
  gearGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = gearGrad;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.lineTo(Math.cos(a - 0.15) * 12, Math.sin(a - 0.15) * 12);
    ctx.lineTo(Math.cos(a - 0.1) * 16, Math.sin(a - 0.1) * 16);
    ctx.lineTo(Math.cos(a + 0.1) * 16, Math.sin(a + 0.1) * 16);
    ctx.lineTo(Math.cos(a + 0.15) * 12, Math.sin(a + 0.15) * 12);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 24. Japanese Sakura Tree
function drawSakuraTree(ctx: CanvasRenderingContext2D, time: number) {
  // Dark twisted trunk
  ctx.strokeStyle = '#4c0519';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(-3, 0);
  ctx.lineTo(5, -16);
  ctx.stroke();

  // Pink cherry blossom clusters
  const clusters = [
    { x: -12, y: -18, r: 14 },
    { x: 12, y: -20, r: 15 },
    { x: 0, y: -30, r: 16 },
  ];
  clusters.forEach(cl => {
    ctx.fillStyle = '#f472b6';
    ctx.shadowColor = '#fbcfe8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 25. Vermilion Torii Gate
function drawToriiGate(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#e11d48';
  // 2 Pillars
  ctx.fillRect(-12, -18, 3.5, 32);
  ctx.fillRect(8.5, -18, 3.5, 32);
  // Crossbeams
  ctx.fillRect(-16, -24, 32, 4);
  ctx.fillRect(-13, -16, 26, 3);
}

// 26. Prismatic Amethyst Cluster
function drawAmethystCluster(ctx: CanvasRenderingContext2D, time: number) {
  const pulse = Math.sin(time * 0.003) * 0.2 + 0.8;
  const crystals = [
    { x: -6, h: 22, ang: -0.15, c: '#c084fc' },
    { x: 0, h: 28, ang: 0, c: '#a855f7' },
    { x: 6, h: 20, ang: 0.18, c: '#7e22ce' },
  ];
  crystals.forEach(cr => {
    ctx.save();
    ctx.translate(cr.x, 10);
    ctx.rotate(cr.ang);
    const crGrad = ctx.createLinearGradient(-4, 0, 4, -cr.h);
    crGrad.addColorStop(0, '#581c87');
    crGrad.addColorStop(0.6, cr.c);
    crGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = crGrad;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8 * pulse;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(0, -cr.h);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}
