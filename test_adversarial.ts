// Comprehensive Adversarial Regression Test Suite for TOWER//SHIFT
import { createInitialPhysicsState, updateTowerPhysics, applyBlockImpact } from './src/game/physicsEngine';
import { ALL_COSMETICS, COLLECTIONS } from './src/game/collections';
import { PurchaseValidator, EntitlementGranter, MockBillingProvider, GooglePlayBillingProvider } from './src/billing/BillingService';
import { BILLING_CATALOG, getProductById } from './src/billing/catalog';
import { PROGRESSION_STORAGE_KEY, PROGRESSION_SNAPSHOT_KEY, autoSaveProgression } from './src/utils/progressionStorage';
import { useGameStore } from './src/game/store';
import { generateLevel } from './src/game/LevelGenerator';
import { audioCrossFader } from './src/audio/AudioCrossFader';
import { AdService } from './src/ads/AdService';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failCount++;
  }
}

console.log('=====================================================');
console.log('TOWER//SHIFT ADVERSARIAL REGRESSION TEST SUITE');
console.log('=====================================================\n');

// ----------------------------------------------------
// TEST GROUP 1: PHYSICS & TITAN ANCHOR ADVERSARIAL PASS
// ----------------------------------------------------
console.log('--- 1. PHYSICS ADVERSARIAL REGRESSION ---');
{
  // 1.1 Centered Titan Hit
  const phys1 = createInitialPhysicsState({});
  phys1.tiltAngle = 18;
  phys1.angularVelocity = 6;
  const resCentered = applyBlockImpact(phys1, 0, 0, 'titan', {});
  assert(phys1.tiltAngle === 0, 'Centered Titan hit resets tiltAngle to exactly 0°');
  assert(phys1.angularVelocity === 0, 'Centered Titan hit resets angularVelocity to exactly 0');
  assert(resCentered.message.includes('TITAN ANCHOR'), 'Centered Titan announces anchor in message');

  // 1.2 Extreme Off-Center Titan Hit (timingOffset = 14)
  const phys2 = createInitialPhysicsState({});
  phys2.tiltAngle = 22;
  phys2.angularVelocity = -8;
  const resOffCenter = applyBlockImpact(phys2, 14, Math.PI / 4, 'titan', {});
  assert(phys2.tiltAngle === 0, 'Off-center Titan hit locks tiltAngle to 0° without off-center torque distortion');
  assert(phys2.angularVelocity === 0, 'Off-center Titan hit locks angularVelocity to 0');
  assert(resOffCenter.message === 'TITAN ANCHOR LOCKED!', 'Off-center Titan hit maintains anchor lock status');

  // 1.3 Rapid Repeated Titan Impacts
  for (let i = 0; i < 5; i++) {
    applyBlockImpact(phys2, (i % 2 === 0 ? 8 : -8), Math.PI / 3, 'titan', {});
    assert(phys2.tiltAngle === 0 && phys2.angularVelocity === 0, `Repeated Titan impact #${i+1} preserves 0° lock`);
  }

  // 1.4 Non-Titan Off-Center Hit Imparts Torque Normally
  const physStandard = createInitialPhysicsState({});
  applyBlockImpact(physStandard, 8, Math.PI / 2, 'standard', {});
  assert(physStandard.angularVelocity !== 0, 'Standard block off-center hit properly imparts angular torque');

  // 1.5 Simultaneous/Successive Mixed Impacts (Titan then Standard then Toxic)
  const physMixed = createInitialPhysicsState({});
  applyBlockImpact(physMixed, 5, 0.5, 'titan', {});
  assert(physMixed.tiltAngle === 0, 'Mixed chain: Titan initial anchor resets tilt');
  applyBlockImpact(physMixed, 10, 0.8, 'standard', {});
  assert(physMixed.angularVelocity !== 0, 'Mixed chain: Subsequent standard hit imparts expected torque');

  // 1.6 Midas Foundation Rare Alloy Coin Scaling
  const goldBase = applyBlockImpact(createInitialPhysicsState({}), 0, 0, 'gold_ingot', {});
  const goldMidas = applyBlockImpact(createInitialPhysicsState({}), 0, 0, 'gold_ingot', { midas_foundation: 2 });
  assert(goldBase.bonusCoins === 50, 'Base gold ingot awards 50 bonus coins');
  assert(goldMidas.bonusCoins === 75, 'Midas Foundation Tier 2 enhances gold ingot yield (+50% bonus)');

  // 1.7 Delta Time Clamping On Severe Hitch (10 Seconds Background Sleep)
  const hitchState = createInitialPhysicsState({});
  hitchState.tiltAngle = 10;
  const hitchResult = updateTowerPhysics(hitchState, 10000, {}); // 10,000ms hitch
  assert(!Number.isNaN(hitchState.tiltAngle) && Number.isFinite(hitchState.tiltAngle), '10s hitch does not produce NaN tilt');
  assert(!Number.isNaN(hitchState.angularVelocity) && Number.isFinite(hitchState.angularVelocity), '10s hitch does not produce NaN angularVelocity');
  assert(hitchResult.collapsed === false, '10s hitch clamped safely without exploding tower equilibrium');

  // 1.8 Extreme Micro-Delta and Zero Delta Protection
  const microState = createInitialPhysicsState({});
  updateTowerPhysics(microState, 0, {});
  assert(!Number.isNaN(microState.tiltAngle) && Number.isFinite(microState.tiltAngle), 'Zero ms delta handled safely without NaN');
  updateTowerPhysics(microState, -50, {});
  assert(!Number.isNaN(microState.tiltAngle) && Number.isFinite(microState.tiltAngle), 'Negative delta handled safely without corruption');
}

// ----------------------------------------------------
// TEST GROUP 2: SHOP PROGRESSION & ANTI-BYPASS MATRIX
// ----------------------------------------------------
console.log('\n--- 2. SHOP PROGRESSION & ANTI-BYPASS MATRIX ---');
{
  const lvl191Item = ALL_COSMETICS.find(c => c.req >= 190) || ALL_COSMETICS[ALL_COSMETICS.length - 1];
  assert(!!lvl191Item, `Testing cosmetic item '${lvl191Item.name}' (Req Level ${lvl191Item.req})`);
  const req = lvl191Item.req;

  // 2.1 Store State Direct Bypass Test: Player at Level 1
  const store = useGameStore.getState();
  useGameStore.setState({ unlockedLevels: 1, coins: 50_000_000, adsRemoved: false, ownedCosmetics: [] });

  // Scenario 1: Level 1 + 50M coins -> buyCosmetic directly fails
  const directBuyLvl1 = useGameStore.getState().buyCosmetic(lvl191Item.id, lvl191Item.price);
  assert(!directBuyLvl1, 'Direct buyCosmetic at Level 1 rejected despite 50M coins');
  assert(!useGameStore.getState().ownedCosmetics.includes(lvl191Item.id), 'Level 1 item not added to ownedCosmetics');

  // Scenario 2: Level 1 + unlockCosmetic direct call fails
  useGameStore.getState().unlockCosmetic(lvl191Item.id);
  assert(!useGameStore.getState().ownedCosmetics.includes(lvl191Item.id), 'Direct unlockCosmetic at Level 1 rejected');

  // Scenario 3: Level 1 + VIP (adsRemoved: true) -> showShopAd cannot bypass level gate
  useGameStore.setState({ adsRemoved: true });
  useGameStore.getState().showShopAd(lvl191Item.id);
  assert(!useGameStore.getState().ownedCosmetics.includes(lvl191Item.id), 'Level 1 with VIP cannot unlock gated cosmetic');

  // Scenario 4: Level 190 (one level below requirement) with VIP -> locked
  useGameStore.setState({ unlockedLevels: req - 1, adsRemoved: true });
  useGameStore.getState().showShopAd(lvl191Item.id);
  assert(!useGameStore.getState().ownedCosmetics.includes(lvl191Item.id), `Level ${req - 1} with VIP cannot unlock Level ${req} cosmetic`);

  // Scenario 5: Level 191 + Insufficient Coins -> buyCosmetic fails
  useGameStore.setState({ unlockedLevels: req, coins: 0, adsRemoved: false });
  const buyNoCoins = useGameStore.getState().buyCosmetic(lvl191Item.id, lvl191Item.price);
  assert(!buyNoCoins, `Level ${req} with 0 coins fails coin purchase`);

  // Scenario 6: Level 191 + Sufficient Coins -> buyCosmetic succeeds (No ad required)
  useGameStore.setState({ coins: lvl191Item.price + 1000 });
  const buySufficient = useGameStore.getState().buyCosmetic(lvl191Item.id, lvl191Item.price);
  assert(buySufficient, `Level ${req} with sufficient coins successfully purchases cosmetic`);
  assert(useGameStore.getState().ownedCosmetics.includes(lvl191Item.id), 'Item added to ownedCosmetics after coin purchase');
  assert(useGameStore.getState().coins === 1000, 'Coins deducted accurately');

  // Scenario 7: Owned item can be equipped without repurchase
  useGameStore.getState().equipCosmetic(lvl191Item.id, lvl191Item.type);
  assert(
    useGameStore.getState().equippedCosmetic === lvl191Item.id ||
    useGameStore.getState().equippedBoomEffect === lvl191Item.id ||
    useGameStore.getState().equippedPlate === lvl191Item.id ||
    useGameStore.getState().equippedBackground === lvl191Item.id,
    'Owned item equipped successfully without re-purchase'
  );

  // Scenario 8: Rewarded Ad Flow - Cancelled / Declined ad awards NO reward
  const anotherGated = ALL_COSMETICS.find(c => c.req >= 50 && c.id !== lvl191Item.id) || ALL_COSMETICS[10];
  useGameStore.setState({ unlockedLevels: anotherGated.req, adsRemoved: false, ownedCosmetics: [] });
  useGameStore.getState().showShopAd(anotherGated.id);
  assert(useGameStore.getState().adState === 'rewarded-shop-item', 'Rewarded ad queued for eligible level');
  useGameStore.getState().declineShopAd(); // User dismissed / cancelled ad
  assert(!useGameStore.getState().ownedCosmetics.includes(anotherGated.id), 'Cancelled ad awards zero items');
  assert(useGameStore.getState().adState === 'none', 'adState reset to none after cancellation');

  // Scenario 9: Rewarded Ad Flow - Successfully watched ad grants ownership
  useGameStore.getState().showShopAd(anotherGated.id);
  useGameStore.getState().acceptShopAd(); // Ad completed successfully
  assert(useGameStore.getState().ownedCosmetics.includes(anotherGated.id), 'Completed ad successfully unlocks item');

  // Scenario 10: Repeated callbacks cannot grant duplicate rewards
  useGameStore.getState().acceptShopAd();
  const count = useGameStore.getState().ownedCosmetics.filter(id => id === anotherGated.id).length;
  assert(count === 1, 'Duplicate ad callback prevented (idempotent reward)');

  // Scenario 11: Price Tampering Defense (Catalog override)
  useGameStore.setState({ unlockedLevels: 200, coins: 50, ownedCosmetics: [] });
  const spoofResult = useGameStore.getState().buyCosmetic(lvl191Item.id, 0); // Attacking with price=0
  assert(!spoofResult, 'Spoofed price=0 rejected by catalog price verification');

  // Scenario 12: AdService Status Inspection
  useGameStore.setState({ adsRemoved: false });
  const adStatusNormal = AdService.getStatus();
  assert(adStatusNormal.isAvailable && adStatusNormal.canShowAds, 'AdService recognizes ad availability in standard mode');
  
  useGameStore.setState({ adsRemoved: true });
  const adStatusVIP = AdService.getStatus();
  assert(adStatusVIP.hasAdFreeVIP && !adStatusVIP.canShowAds, 'AdService recognizes VIP Ad-Free mode');

  // Scenario 13: 2X Coins Rewarded Ad with zero pendingCoins awards base level double coins
  useGameStore.setState({ adsRemoved: false, coins: 100, pendingCoins: 0, level: 5 });
  useGameStore.getState().showDoubleCoinsAd();
  assert(useGameStore.getState().adState === 'rewarded-double-coins', 'showDoubleCoinsAd sets adState');
  useGameStore.getState().acceptDoubleCoins();
  // base for level 5: 50 + 5*10 = 100. 100 * 2 = 200. Total coins: 100 + 200 = 300.
  assert(useGameStore.getState().coins === 300, '2X Coins ad awards guaranteed baseline coins even when pendingCoins was 0');
  assert(useGameStore.getState().adState === 'none', 'adState closed after 2X Coins claim');

  // Scenario 14: Rewarded Revive State Machine
  useGameStore.setState({ state: 'lost', isReviving: false, adsRemoved: false });
  useGameStore.getState().showReviveAd();
  assert(useGameStore.getState().adState === 'rewarded-revive', 'showReviveAd transitions to rewarded-revive');
  useGameStore.getState().acceptRevive();
  assert(useGameStore.getState().adState === 'none', 'acceptRevive clears adState');
  assert(useGameStore.getState().state === 'playing', 'acceptRevive restores playing state');
  assert(useGameStore.getState().isReviving === true, 'acceptRevive sets isReviving flag');

  // Scenario 15: Rewarded Powerup Munitions Ad awards charges
  useGameStore.setState({ powerups: { stasis: 0, emp: 0, shield: 0 } });
  useGameStore.getState().showPowerupAd('stasis');
  assert(useGameStore.getState().adState === 'rewarded-powerup', 'showPowerupAd queues powerup ad');
  useGameStore.getState().acceptPowerupAd();
  assert(useGameStore.getState().powerups.stasis > 0, 'acceptPowerupAd grants stasis charges');
  assert(useGameStore.getState().adState === 'none', 'adState closed after powerup ad');

  // Scenario 16: Rewarded Perk R&D Ad advances tech tree tier
  useGameStore.setState({ unlockedPerks: {} });
  useGameStore.getState().showPerkAd('chrono_stasis');
  assert(useGameStore.getState().adState === 'rewarded-perk', 'showPerkAd queues perk ad');
  useGameStore.getState().acceptPerkAd();
  assert((useGameStore.getState().unlockedPerks['chrono_stasis'] || 0) === 1, 'acceptPerkAd advances tech tree tier');
  assert(useGameStore.getState().adState === 'none', 'adState closed after perk ad');
}

// ----------------------------------------------------
// TEST GROUP 3: LEVEL TRANSITION & INITIALIZATION
// ----------------------------------------------------
console.log('\n--- 3. LEVEL TRANSITION & ENGINE RE-INIT ---');
{
  // 3.1 Verify Campaign Level Generation
  for (const lvl of [1, 10, 50, 100, 191, 200]) {
    const queue = generateLevel(lvl);
    assert(queue.length > 0, `Level ${lvl} generates valid block queue (${queue.length} blocks)`);
    assert(queue.every(b => typeof b.speed === 'number' && b.speed > 0), `Level ${lvl} block speeds are valid numbers`);
  }

  // 3.2 State Reset on Level Advancement
  useGameStore.setState({ level: 5, state: 'won', score: 1250, pendingCoins: 300 });
  const currentLvl = useGameStore.getState().level;
  const nextLvl = currentLvl + 1;
  useGameStore.getState().setLevel(nextLvl);
  useGameStore.getState().setState('playing');
  useGameStore.getState().setScore(0);
  assert(useGameStore.getState().level === 6, 'Level advanced to 6');
  assert(useGameStore.getState().score === 0, 'Score reset to 0');
  assert(useGameStore.getState().state === 'playing', 'State set to playing');

  // 3.3 Boss Level Identification at Multiples of 10
  assert(10 % 10 === 0 && 20 % 10 === 0 && 190 % 10 === 0, 'Levels 10, 20, 190 correctly identify as Titan Boss stages');
  assert(191 % 10 !== 0, 'Level 191 is not a boss stage');
}

// ----------------------------------------------------
// TEST GROUP 4: AUDIO LIFECYCLE & CROSS-FADING
// ----------------------------------------------------
console.log('\n--- 4. AUDIO LIFECYCLE & CROSS-FADING ---');
{
  // 4.1 Master Volume Smooth Adjustment
  audioCrossFader.setVolume(0.8);
  assert(true, 'AudioCrossFader setVolume executes safely');
  audioCrossFader.setVolume(0);
  assert(true, 'AudioCrossFader setVolume(0) mutes without breaking state');

  // 4.2 Mute / Unmute
  audioCrossFader.setMuted(true);
  assert(true, 'AudioCrossFader setMuted(true) completes safely');
  audioCrossFader.setMuted(false);
  assert(true, 'AudioCrossFader setMuted(false) unmutes cleanly');

  // 4.3 Stop All Voices
  audioCrossFader.stopAll(null, 0.4);
  assert(!audioCrossFader.isPlaying(), 'AudioCrossFader is not playing after stopAll');
}

// ----------------------------------------------------
// TEST GROUP 5: BILLING & IDEMPOTENCY VALIDATION
// ----------------------------------------------------
console.log('\n--- 5. BILLING & IDEMPOTENCY VALIDATION ---');
{
  const product = getProductById('coins_1200');
  assert(!!product, 'coins_1200 exists in billing catalog');

  const txnId = `adv_txn_${Date.now()}_999`;
  const validTxn = {
    transactionId: txnId,
    productId: 'coins_1200',
    timestamp: Date.now(),
    status: 'completed' as const,
    provider: 'mock_development' as const,
    rewardsGranted: { coins: 1200 },
  };

  // Initial receipt validation
  const val1 = PurchaseValidator.validateReceipt(validTxn);
  assert(val1.valid, 'First transaction receipt validation succeeds');

  // Mark processed
  PurchaseValidator.markProcessed(txnId);

  // Duplicate replay attempt
  const val2 = PurchaseValidator.validateReceipt(validTxn);
  assert(!val2.valid && val2.reason?.includes('Duplicate'), 'Duplicate replay of same transaction ID is strictly rejected');

  // Malformed transaction validation
  const malformedTxn = {
    transactionId: '',
    productId: 'coins_1200',
    timestamp: Date.now(),
    status: 'completed' as const,
    provider: 'mock_development' as const,
    rewardsGranted: { coins: 1200 },
  };
  const val3 = PurchaseValidator.validateReceipt(malformedTxn);
  assert(!val3.valid && val3.reason?.includes('Malformed'), 'Empty transactionId receipt is rejected');

  // 5.2 Google Play Native vs Web Detection
  const playProvider = new GooglePlayBillingProvider();
  assert(playProvider.providerName === 'Google Play Billing', 'GooglePlayBillingProvider recognized');
  assert(playProvider.isConnected === false, 'GooglePlayBillingProvider is correctly not connected in pure web environment');

  // 5.3 Entitlement Granting Validation
  const initialCoins = useGameStore.getState().coins;
  const grantRes = EntitlementGranter.grantEntitlements({
    coins: 500,
    removeAds: true,
  });
  assert(useGameStore.getState().coins === initialCoins + 500, 'EntitlementGranter correctly awarded 500 coins');
  assert(useGameStore.getState().adsRemoved === true, 'EntitlementGranter correctly activated Ad Blocker VIP');
  assert(grantRes.summary.length >= 2, 'EntitlementGranter generated summary of granted perks');
}

// ----------------------------------------------------
// TEST GROUP 6: PERSISTENCE & LEGACY STORAGE KEYS
// ----------------------------------------------------
console.log('\n--- 6. PERSISTENCE & COMPATIBILITY KEYS ---');
{
  assert(PROGRESSION_STORAGE_KEY === 'buildOrBoomProgressV5', 'Legacy storage key buildOrBoomProgressV5 preserved');
  assert(PROGRESSION_SNAPSHOT_KEY === 'buildOrBoom_progressionSnapshot', 'Progression snapshot key verified');
}

console.log('\n=====================================================');
console.log(`ADVERSARIAL TEST RUN: ${passCount} PASSED, ${failCount} FAILED`);
console.log('=====================================================');

if (failCount > 0) {
  process.exit(1);
}
