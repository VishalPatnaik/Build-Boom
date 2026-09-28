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

// ----------------------------------------------------
// 1. PURCHASE VALIDATION
// ----------------------------------------------------
export class PurchaseValidator {
  private static processedTransactions: Set<string> = new Set();

  static validateReceipt(transaction: PurchaseTransaction): { valid: boolean; reason?: string } {
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
    this.processedTransactions.add(transactionId);
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

    return { summary: grantedSummary };
  }
}

// ----------------------------------------------------
// 3. MOCK DEVELOPMENT BILLING PROVIDER
// ----------------------------------------------------
export class MockBillingProvider implements IBillingProvider {
  readonly providerName = 'Mock Sandbox Billing (Dev Mode)';
  readonly isConnected = true;

  async initialize(): Promise<boolean> {
    return true;
  }

  async getLocalizedPrice(productId: string): Promise<string | null> {
    const item = getProductById(productId);
    return item ? `${item.defaultPricePlaceholder} (TEST)` : null;
  }

  async executePurchase(product: ProductCatalogItem): Promise<PurchaseResult> {
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

  get isConnected(): boolean {
    return this._connected;
  }

  async initialize(): Promise<boolean> {
    // Checks for Android runtime or Capacitor/Cordova Google Play Billing plugin
    const win = typeof window !== 'undefined' ? (window as any) : {};
    if (win.CdvPurchase || win.Capacitor?.isPluginAvailable?.('Purchases')) {
      this._connected = true;
      return true;
    }
    this._connected = false;
    return false;
  }

  async getLocalizedPrice(productId: string): Promise<string | null> {
    const win = typeof window !== 'undefined' ? (window as any) : {};
    if (!this._connected || !win.CdvPurchase) {
      const item = getProductById(productId);
      return item ? item.defaultPricePlaceholder : null;
    }
    try {
      const prod = win.CdvPurchase.store.get(productId);
      return prod?.pricing?.price || null;
    } catch {
      return null;
    }
  }

  async executePurchase(product: ProductCatalogItem): Promise<PurchaseResult> {
    const win = typeof window !== 'undefined' ? (window as any) : {};
    if (!this._connected || !win.CdvPurchase) {
      return {
        success: false,
        productId: product.id,
        errorMessage: 'Billing not connected. Google Play Store is only available on native Android releases.',
      };
    }

    try {
      const order = await win.CdvPurchase.store.order(product.id);
      if (order && order.isApproved) {
        const transaction: PurchaseTransaction = {
          transactionId: order.transactionId || `gplay_${Date.now()}`,
          productId: product.id,
          timestamp: Date.now(),
          status: 'completed',
          provider: 'google_play',
          signature: order.signature,
          rewardsGranted: { ...product.rewards },
        };
        return { success: true, productId: product.id, transaction };
      }
      return {
        success: false,
        productId: product.id,
        errorMessage: 'Google Play transaction was cancelled or declined.',
        userCancelled: true,
      };
    } catch (err: any) {
      return {
        success: false,
        productId: product.id,
        errorMessage: err?.message || 'Google Play purchase error occurred.',
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
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
}

export const billingService = new BillingServiceCoordinator();
