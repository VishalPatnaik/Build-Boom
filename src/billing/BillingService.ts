// Production Purchase / Billing Architecture
// Separates:
// 1. PRODUCT CATALOG (catalog.ts)
// 2. PURCHASE UI (BillingPackageModal.tsx)
// 3. PURCHASE VALIDATION (PurchaseValidator)
// 4. ENTITLEMENT GRANTING (EntitlementGranter)
// 5. PAYMENT PROVIDER (MockBillingProvider / GooglePlayBillingProvider)

import { 
  IBillingProvider, 
  ProductCatalogItem, 
  PurchaseResult, 
  PurchaseTransaction, 
  ProductReward 
} from './types';
import { BILLING_CATALOG, getProductById } from './catalog';
import { useGameStore } from '../game/store';
import { autoSaveProgression } from '../utils/progressionStorage';

// ----------------------------------------------------
// 1. PURCHASE VALIDATION
// ----------------------------------------------------
export class PurchaseValidator {
  private static processedTransactions: Set<string> = new Set();
  private static isInitialized = false;

  private static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('towerShiftProcessedTxns') || localStorage.getItem('buildOrBoomProcessedTxns');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            arr.forEach((id: string) => this.processedTransactions.add(id));
          }
        }
      }
    } catch (e) {
      // Safe fallback
    }
  }

  static validateReceipt(transaction: PurchaseTransaction): { valid: boolean; reason?: string } {
    this.init();
    if (!transaction.transactionId || !transaction.productId) {
      return { valid: false, reason: 'Malformed transaction receipt.' };
    }

    if (this.processedTransactions.has(transaction.transactionId)) {
      return { valid: false, reason: 'Duplicate transaction detected.' };
    }

    const product = getProductById(transaction.productId);
    if (!product) {
      return { valid: false, reason: 'Unknown catalog product ID.' };
    }

    // Verify rewards match product definition
    if (product.rewards.coins && transaction.rewardsGranted.coins !== product.rewards.coins) {
      return { valid: false, reason: 'Coin reward discrepancy detected.' };
    }

    return { valid: true };
  }

  static markProcessed(transactionId: string) {
    this.init();
    this.processedTransactions.add(transactionId);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          'towerShiftProcessedTxns',
          JSON.stringify(Array.from(this.processedTransactions).slice(-500))
        );
      }
    } catch (e) {
      // Safe fallback
    }
  }
}

// ----------------------------------------------------
// 2. ENTITLEMENT GRANTING
// ----------------------------------------------------
export class EntitlementGranter {
  static grantEntitlements(rewards: ProductReward): { summary: string[] } {
    const store = useGameStore.getState();
    const grantedSummary: string[] = [];

    // 1. Grant Coins
    if (rewards.coins && rewards.coins > 0) {
      store.addCoins(rewards.coins);
      grantedSummary.push(`+${rewards.coins.toLocaleString()} Coins`);
    }

    // 2. Grant Powerup Charges
    if (rewards.powerups) {
      if (rewards.powerups.stasis && rewards.powerups.stasis > 0) {
        store.addPowerupCharges('stasis', rewards.powerups.stasis);
        grantedSummary.push(`+${rewards.powerups.stasis} Stasis Charges`);
      }
      if (rewards.powerups.emp && rewards.powerups.emp > 0) {
        store.addPowerupCharges('emp', rewards.powerups.emp);
        grantedSummary.push(`+${rewards.powerups.emp} EMP Charges`);
      }
      if (rewards.powerups.shield && rewards.powerups.shield > 0) {
        store.addPowerupCharges('shield', rewards.powerups.shield);
        grantedSummary.push(`+${rewards.powerups.shield} Shield Charges`);
      }
    }

    // 3. Grant Cosmetics
    if (rewards.cosmeticIds && rewards.cosmeticIds.length > 0) {
      rewards.cosmeticIds.forEach(id => {
        store.unlockCosmetic(id);
      });
      if (rewards.cosmeticNames && rewards.cosmeticNames.length > 0) {
        rewards.cosmeticNames.forEach(name => grantedSummary.push(`Unlocked ${name}`));
      } else {
        grantedSummary.push(`Unlocked ${rewards.cosmeticIds.length} Premium Cosmetic(s)`);
      }
    }

    // 4. Grant Remove Ads / Ad Blocker VIP
    if (rewards.removeAds) {
      store.removeAds();
      grantedSummary.push('Ad Blocker VIP Activated (Ad-Free & VIP Instant Unlocks)');
    }

    // Automatically persist updated coin balance & progression to local storage
    autoSaveProgression('purchase_finalized');

    return { summary: grantedSummary };
  }
}

// ----------------------------------------------------
// 3. MOCK DEVELOPMENT BILLING PROVIDER
// ----------------------------------------------------
export class MockBillingProvider implements IBillingProvider {
  readonly providerName = 'Official Web Billing Engine';
  readonly isConnected = true;

  async initialize(): Promise<boolean> {
    return true;
  }

  async getLocalizedPrice(productId: string): Promise<string | null> {
    const item = getProductById(productId);
    return item ? item.defaultPricePlaceholder : null;
  }

  async executePurchase(product: ProductCatalogItem): Promise<PurchaseResult> {
    // Simulated purchases grant real rewards, so they are only available in development builds
    if (!import.meta.env.DEV) {
      return {
        success: false,
        productId: product.id,
        errorMessage: 'Purchases must go through secure checkout.',
      };
    }
    // Simulate real billing provider roundtrip delay (400ms - 900ms)
    await new Promise(resolve => setTimeout(resolve, 600));

    const transaction: PurchaseTransaction = {
      transactionId: `txn_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      productId: product.id,
      timestamp: Date.now(),
      status: 'completed',
      provider: 'mock_development',
      signature: `sig_sandbox_${product.id}_verified`,
      rewardsGranted: { ...product.rewards },
    };

    // Run validation pipeline
    const validation = PurchaseValidator.validateReceipt(transaction);
    if (!validation.valid) {
      return {
        success: false,
        productId: product.id,
        errorMessage: validation.reason || 'Transaction validation failed.',
      };
    }

    PurchaseValidator.markProcessed(transaction.transactionId);
    return {
      success: true,
      productId: product.id,
      transaction,
    };
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    return [];
  }
}

// ----------------------------------------------------
// 4. GOOGLE PLAY BILLING PROVIDER (ANDROID PRODUCTION)
// ----------------------------------------------------
export class GooglePlayBillingProvider implements IBillingProvider {
  readonly providerName = 'Google Play Billing';
  private _connected = false;
  private initPromise: Promise<boolean> | null = null;
  // Purchases waiting for Google Play to approve them, keyed by product id
  private pending = new Map<string, (r: PurchaseResult) => void>();

  get isConnected(): boolean {
    return this._connected;
  }

  private get api(): any {
    return typeof window !== 'undefined' ? (window as any).CdvPurchase : undefined;
  }

  /**
   * Registers every catalog product with Google Play (Remove Ads is a one-time
   * purchase, everything else can be bought again) and wires up approval handling.
   */
  async initialize(): Promise<boolean> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      // The plugin attaches itself to window after the device is ready
      for (let i = 0; i < 50 && !this.api; i++) await new Promise((r) => setTimeout(r, 100));
      const api = this.api;
      if (!api?.store) return false;
      const { store, ProductType, Platform } = api;

      store.register(
        BILLING_CATALOG.map((p) => ({
          id: p.id,
          type: p.id === 'remove_ads' ? ProductType.NON_CONSUMABLE : ProductType.CONSUMABLE,
          platform: Platform.GOOGLE_PLAY,
        }))
      );

      store
        .when()
        .approved((transaction: any) => this.onApproved(transaction))
        .productUpdated(() => undefined);

      const errors = await store.initialize([Platform.GOOGLE_PLAY]);
      this._connected = !errors || errors.length === 0 || !!store.get(BILLING_CATALOG[0]?.id, Platform.GOOGLE_PLAY);
      return this._connected;
    })();
    return this.initPromise;
  }

  /**
   * Called by Google Play for new purchases, purchases that finish later (pending
   * payment methods) and owned purchases found at startup. Grants and then finishes
   * (consumes) the purchase so it is never granted twice.
   */
  private onApproved(transaction: any) {
    const productId: string | undefined = transaction?.products?.[0]?.id;
    const product = productId ? getProductById(productId) : undefined;
    if (!product) {
      transaction?.finish?.();
      return;
    }
    const record: PurchaseTransaction = {
      transactionId: transaction.transactionId || `gplay_${Date.now()}`,
      productId: product.id,
      timestamp: Date.now(),
      status: 'completed',
      provider: 'google_play',
      signature: transaction.nativePurchase?.signature || 'google_play',
      rewardsGranted: { ...product.rewards },
    };

    const waiting = this.pending.get(product.id);
    if (waiting) {
      // The buyer is on the purchase screen: the facade grants the rewards
      this.pending.delete(product.id);
      waiting({ success: true, productId: product.id, transaction: record });
    } else if (product.id === 'remove_ads') {
      // One-time purchase restored at startup (reinstall or new phone)
      if (!useGameStore.getState().adsRemoved) EntitlementGranter.grantEntitlements(product.rewards);
    } else {
      // A purchase that completed while the app was closed (e.g. a pending payment)
      EntitlementGranter.grantEntitlements(product.rewards);
    }
    transaction.finish();
  }

  async getLocalizedPrice(productId: string): Promise<string | null> {
    const api = this.api;
    if (!this._connected || !api?.store) {
      const item = getProductById(productId);
      return item ? item.defaultPricePlaceholder : null;
    }
    try {
      const prod = api.store.get(productId, api.Platform.GOOGLE_PLAY);
      return prod?.pricing?.price || getProductById(productId)?.defaultPricePlaceholder || null;
    } catch {
      return null;
    }
  }

  async executePurchase(product: ProductCatalogItem): Promise<PurchaseResult> {
    await this.initialize();
    const api = this.api;
    if (!this._connected || !api?.store) {
      return {
        success: false,
        productId: product.id,
        errorMessage: 'Google Play is not available right now. Check your connection and try again.',
      };
    }
    const offer = api.store.get(product.id, api.Platform.GOOGLE_PLAY)?.getOffer();
    if (!offer) {
      return {
        success: false,
        productId: product.id,
        errorMessage: 'This item is not available in the Play Store yet.',
      };
    }

    const approved = new Promise<PurchaseResult>((resolve) => this.pending.set(product.id, resolve));
    const error = await api.store.order(offer);
    if (error) {
      this.pending.delete(product.id);
      const cancelled = error.code === api.ErrorCode?.PAYMENT_CANCELLED;
      return {
        success: false,
        productId: product.id,
        userCancelled: cancelled,
        errorMessage: cancelled ? 'Purchase cancelled.' : error.message || 'Google Play purchase failed.',
      };
    }
    // Wait for Google Play's approval (a pending payment may take longer: rewards arrive later)
    const timeout = new Promise<PurchaseResult>((resolve) =>
      setTimeout(() => {
        if (this.pending.has(product.id)) {
          this.pending.delete(product.id);
          resolve({
            success: false,
            productId: product.id,
            errorMessage: 'Payment is pending. Your items will arrive as soon as Google Play confirms it.',
          });
        }
      }, 120000)
    );
    return Promise.race([approved, timeout]);
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    await this.initialize();
    const api = this.api;
    if (!api?.store) return [];
    await api.store.restorePurchases();
    // Owned one-time purchases come back through onApproved
    return [];
  }
}

// ----------------------------------------------------
// 5. BILLING SERVICE FACADE & SINGLETON
// ----------------------------------------------------
class BillingServiceCoordinator {
  private activeProvider: IBillingProvider;
  private isDevelopmentMode: boolean = true;
  private purchaseHistory: PurchaseTransaction[] = [];

  constructor() {
    // Default to mock development provider in browser/preview; Google Play in native Android builds
    const isNativeAndroid = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNativeAndroid) {
      this.activeProvider = new GooglePlayBillingProvider();
      this.isDevelopmentMode = false;
    } else {
      this.activeProvider = new MockBillingProvider();
      this.isDevelopmentMode = true;
    }
    this.activeProvider.initialize();
  }

  getProvider(): IBillingProvider {
    return this.activeProvider;
  }

  isDevMode(): boolean {
    return this.isDevelopmentMode;
  }

  setProvider(provider: IBillingProvider, devMode: boolean = false) {
    this.activeProvider = provider;
    this.isDevelopmentMode = devMode;
    this.activeProvider.initialize();
  }

  getCatalog(): ProductCatalogItem[] {
    return BILLING_CATALOG;
  }

  async purchaseProduct(productId: string): Promise<{ success: boolean; grantedItems?: string[]; message?: string }> {
    const product = getProductById(productId);
    if (!product) {
      return { success: false, message: `Product '${productId}' not found in catalog.` };
    }

    try {
      const result = await this.activeProvider.executePurchase(product);

      if (!result.success || !result.transaction) {
        return {
          success: false,
          message: result.errorMessage || (result.userCancelled ? 'Purchase cancelled.' : 'Purchase failed.'),
        };
      }

      // Grant entitlements via separate entitlement manager
      const { summary } = EntitlementGranter.grantEntitlements(product.rewards);
      this.purchaseHistory.push(result.transaction);

      return {
        success: true,
        grantedItems: summary,
        message: `Successfully received: ${summary.join(', ')}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Unexpected payment gateway error.',
      };
    }
  }

  getPurchaseHistory(): PurchaseTransaction[] {
    return [...this.purchaseHistory];
  }

  async restorePurchases(): Promise<{ success: boolean; restoredItems: string[]; message: string }> {
    try {
      const results = await this.activeProvider.restorePurchases();
      const store = useGameStore.getState();
      const restoredItems: string[] = [];

      if (results && results.length > 0) {
        for (const res of results) {
          if (res.success && res.transaction) {
            const prod = getProductById(res.transaction.productId);
            if (prod) {
              const { summary } = EntitlementGranter.grantEntitlements(prod.rewards);
              restoredItems.push(...summary);
            }
          }
        }
      } else {
        // Check persistent non-consumables (like Ad Blocker VIP)
        if (store.adsRemoved) {
          restoredItems.push('Ad Blocker VIP Pass');
        }
      }

      return {
        success: true,
        restoredItems,
        message: restoredItems.length > 0 
          ? `Restored: ${restoredItems.join(', ')}`
          : 'No prior purchases found to restore for this Google Play account.',
      };
    } catch (err: any) {
      return {
        success: false,
        restoredItems: [],
        message: err?.message || 'Restore purchases failed.',
      };
    }
  }
}

export const billingService = new BillingServiceCoordinator();
