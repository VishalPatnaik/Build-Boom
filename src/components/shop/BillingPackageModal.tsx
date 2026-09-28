import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/store';
import { billingService } from '../../billing/BillingService';
import { BILLING_CATALOG, getProductsByType } from '../../billing/catalog';
import { ProductCatalogItem, ProductType } from '../../billing/types';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';
import { 
  X, 
  Coins, 
  Zap, 
  Shield, 
  Snowflake, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  CheckCircle2, 
  Check, 
  AlertCircle, 
  Crown,
  Flame,
  Layers,
  ChevronRight
} from 'lucide-react';

interface BillingPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ProductType;
}

export function BillingPackageModal({ isOpen, onClose, initialTab = 'bundle' }: BillingPackageModalProps) {
  const { coins, powerups, ownedCosmetics } = useGameStore();
  const [activeTab, setActiveTab] = useState<ProductType>(initialTab);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ title: string; items: string[] } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProducts = getProductsByType(activeTab);
  const isDevMode = billingService.isDevMode();

  const handlePurchase = async (product: ProductCatalogItem) => {
    if (purchasingId) return;
    setPurchasingId(product.id);
    setErrorMessage(null);
    audio.playClickSound();
    haptics.vibrate([15]);

    try {
      const result = await billingService.purchaseProduct(product.id);
      setPurchasingId(null);

      if (result.success && result.grantedItems) {
        audio.playPerfectSound();
        haptics.vibrate([25, 40, 25]);
        setSuccessResult({
          title: `${product.name} Acquired!`,
          items: result.grantedItems,
        });
      } else {
        audio.playErrorSound();
        setErrorMessage(result.message || 'Purchase could not be completed.');
      }
    } catch (err: any) {
      setPurchasingId(null);
      audio.playErrorSound();
      setErrorMessage(err?.message || 'Transaction error.');
    }
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-amber-400 via-orange-500 to-yellow-300 border-yellow-300 text-yellow-950 shadow-amber-500/50';
      case 'epic':
        return 'from-purple-500 via-fuchsia-600 to-pink-500 border-purple-300 text-white shadow-purple-500/50';
      case 'rare':
        return 'from-cyan-400 to-blue-600 border-cyan-300 text-white shadow-cyan-500/50';
      default:
        return 'from-slate-600 to-slate-800 border-slate-400 text-slate-200 shadow-slate-500/30';
    }
  };

  const getCardBorder = (rarity: string, isFeatured?: boolean) => {
    if (isFeatured || rarity === 'legendary') {
      return 'border-yellow-400/80 bg-gradient-to-b from-[#24133d] to-[#120722] shadow-[0_8px_32px_rgba(234,179,8,0.25)]';
    }
    if (rarity === 'epic') {
      return 'border-purple-500/60 bg-gradient-to-b from-[#1f1035] to-[#0e061a] shadow-[0_8px_24px_rgba(168,85,247,0.2)]';
    }
    if (rarity === 'rare') {
      return 'border-cyan-500/60 bg-gradient-to-b from-[#0c1a2f] to-[#050d1a] shadow-[0_8px_24px_rgba(6,182,212,0.2)]';
    }
    return 'border-white/15 bg-[#140b24] hover:border-white/30';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop Dismiss */}
        <div 
          onClick={onClose} 
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#0f071e] border-2 border-yellow-500/50 rounded-3xl shadow-[0_0_60px_rgba(234,179,8,0.25)] flex flex-col max-h-[92vh] overflow-hidden z-10"
        >
          {/* Top Decorative Header */}
          <div className="relative px-5 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-[#1c0c38] via-[#2d1254] to-[#1c0c38] shrink-0">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Title & Balances */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-yellow-500/30 flex items-center justify-center">
                  <div className="w-full h-full bg-[#120722] rounded-[14px] flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase font-mono">
                      ARCHITECT STORE
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                      {isDevMode ? 'SANDBOX TEST' : 'OFFICIAL'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    Official In-App Purchases & Tactical Arsenal Bundles
                  </p>
                </div>
              </div>

              {/* Player Current Balances */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm font-mono">
                  <Coins className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{coins.toLocaleString()}</span>
                </div>
                <div className="w-px h-3.5 bg-white/20" />
                <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                  <span className="flex items-center gap-0.5 text-cyan-400"><Snowflake className="w-3 h-3" />{powerups.stasis}</span>
                  <span className="flex items-center gap-0.5 text-yellow-400"><Zap className="w-3 h-3" />{powerups.emp}</span>
                  <span className="flex items-center gap-0.5 text-emerald-400"><Shield className="w-3 h-3" />{powerups.shield}</span>
                </div>
              </div>
            </div>

            {/* Category Navigation Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setActiveTab('bundle'); audio.playClickSound(); }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeTab === 'bundle'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-300 shadow-md shadow-yellow-500/20 font-black'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Bundles</span>
              </button>

              <button
                onClick={() => { setActiveTab('coin_pack'); audio.playClickSound(); }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeTab === 'coin_pack'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-300 shadow-md shadow-yellow-500/20 font-black'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Coin Packs</span>
              </button>

              <button
                onClick={() => { setActiveTab('powerup_pack'); audio.playClickSound(); }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeTab === 'powerup_pack'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-300 shadow-md shadow-yellow-500/20 font-black'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Tactical Packs</span>
              </button>
            </div>
          </div>

          {/* Product Cards List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center gap-2 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {currentProducts.map((product) => {
              const isBuying = purchasingId === product.id;

              return (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.01 }}
                  className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${getCardBorder(
                    product.rarity,
                    product.featured
                  )}`}
                >
                  {/* Badge */}
                  {product.badge && (
                    <div
                      className={`absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r border shadow-sm ${getRarityBadgeStyle(
                        product.rarity
                      )}`}
                    >
                      {product.badge}
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="flex items-start gap-3.5">
                    {/* Product Icon Box */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                      {product.iconType === 'coin' && (
                        <Coins className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                      )}
                      {product.iconType === 'stasis' && (
                        <Snowflake className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                      )}
                      {product.iconType === 'emp' && (
                        <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                      )}
                      {product.iconType === 'shield' && (
                        <Shield className="w-8 h-8 text-emerald-400 fill-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      )}
                      {product.iconType === 'tactical' && (
                        <div className="relative">
                          <Shield className="w-8 h-8 text-emerald-400" />
                          <Zap className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                        </div>
                      )}
                      {product.iconType === 'bundle_starter' && (
                        <Package className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                      )}
                      {product.iconType === 'bundle_tactical' && (
                        <Flame className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                      )}
                      {product.iconType === 'bundle_legend' && (
                        <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
                      )}
                    </div>

                    {/* Texts & Rewards breakdown */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                          {product.name}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                          {product.rarity}
                        </span>
                      </div>
                      <p className="text-xs text-yellow-300 font-medium">
                        {product.subtitle}
                      </p>
                      <p className="text-[11px] text-white/60 line-clamp-2 max-w-md">
                        {product.description}
                      </p>

                      {/* Content Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {product.rewards.coins && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-[10px] font-mono font-bold">
                            <Coins className="w-3 h-3" />+{product.rewards.coins.toLocaleString()}
                          </span>
                        )}
                        {product.rewards.powerups?.stasis && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono font-bold">
                            <Snowflake className="w-3 h-3" />+{product.rewards.powerups.stasis}
                          </span>
                        )}
                        {product.rewards.powerups?.emp && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold">
                            <Zap className="w-3 h-3" />+{product.rewards.powerups.emp}
                          </span>
                        )}
                        {product.rewards.powerups?.shield && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-bold">
                            <Shield className="w-3 h-3" />+{product.rewards.powerups.shield}
                          </span>
                        )}
                        {product.rewards.cosmeticNames && product.rewards.cosmeticNames.map((name, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-400/10 border border-purple-400/30 text-purple-300 text-[10px] font-mono font-bold">
                            <Sparkles className="w-3 h-3" />{name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-white/50 font-mono">
                        {isDevMode ? 'TEST PRICE' : 'PRICE'}
                      </div>
                      <div className="text-lg font-black text-white font-mono">
                        {product.defaultPricePlaceholder}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(product)}
                      disabled={isBuying}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        product.featured || product.rarity === 'legendary'
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:brightness-110 shadow-yellow-500/25'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:brightness-110 shadow-purple-500/25'
                      }`}
                    >
                      {isBuying ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{isDevMode ? 'TEST BUY' : 'PURCHASE'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="p-3.5 bg-black/40 border-t border-white/10 text-center text-[10px] text-white/50 flex items-center justify-center gap-2 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Entitlement Delivery • Google Play Billing Architecture • Instant Account Sync</span>
          </div>
        </motion.div>

        {/* Success Modal Overlay */}
        <AnimatePresence>
          {successResult && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            >
              <div className="relative w-full max-w-sm bg-[#160a2b] border-2 border-yellow-400 p-6 rounded-3xl text-center shadow-[0_0_50px_rgba(250,204,21,0.4)]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-yellow-500/40">
                  <Check className="w-8 h-8 text-black stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-mono mb-1">
                  {successResult.title}
                </h3>
                <p className="text-xs text-yellow-300 font-medium mb-4">
                  All package entitlements have been verified and granted to your architect account.
                </p>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10 mb-5 space-y-1.5 text-left text-xs font-mono">
                  {successResult.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/90">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSuccessResult(null)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider text-sm hover:brightness-110 shadow-lg shadow-yellow-500/25 cursor-pointer"
                >
                  CLAIM & CONTINUE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
