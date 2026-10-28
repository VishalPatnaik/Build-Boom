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
  ShieldCheck,
  Snowflake, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  CheckCircle2, 
  Check, 
  AlertCircle, 
  Crown,
  Flame,
  ChevronRight,
  RotateCcw,
  CreditCard,
  Wallet,
  Lock
} from 'lucide-react';
import { PaymentScreenModal, PaymentRail } from './PaymentScreenModal';

export type PaymentMethod = 'card' | 'gpay' | 'paypal' | 'stripe';

interface BillingPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ProductType;
}

export function BillingPackageModal({ isOpen, onClose, initialTab = 'bundle' }: BillingPackageModalProps) {
  const { coins, powerups, ownedCosmetics, adsRemoved } = useGameStore();
  const [activeTab, setActiveTab] = useState<ProductType>(initialTab);
  const [selectedMethod, setSelectedMethod] = useState<PaymentRail>('gpay');
  const [activePaymentProduct, setActivePaymentProduct] = useState<ProductCatalogItem | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ title: string; items: string[] } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProducts = getProductsByType(activeTab);

  const handleRestore = async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    setRestoreMessage(null);
    audio.playClickSound();
    haptics.uiTap();
    try {
      const res = await billingService.restorePurchases();
      setIsRestoring(false);
      setRestoreMessage(res.message);
      if (res.restoredItems.length > 0) {
        audio.playPerfectSound();
      }
      setTimeout(() => setRestoreMessage(null), 3500);
    } catch {
      setIsRestoring(false);
      setRestoreMessage('Failed to query purchase history.');
      setTimeout(() => setRestoreMessage(null), 3500);
    }
  };

  const handlePurchase = (product: ProductCatalogItem) => {
    audio.playClickSound();
    haptics.vibrate([15]);
    setActivePaymentProduct(product);
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
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
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
          className="relative w-full max-w-2xl bg-[#0f071e] border-2 border-yellow-500/50 rounded-3xl shadow-[0_0_60px_rgba(234,179,8,0.25)] flex flex-col max-h-[94vh] overflow-hidden z-10"
        >
          {/* Top Decorative Header */}
          <div className="relative px-5 pt-5 pb-3 border-b border-white/10 bg-gradient-to-r from-[#1c0c38] via-[#2d1254] to-[#1c0c38] shrink-0">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
              title="Close Store"
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
                      TOWER//SHIFT STORE
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                      OFFICIAL VAULT
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    Credit/Debit, Google Pay, PayPal, Apple Pay & Stripe
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

            {/* Payment Method Selector Bar */}
            <div className="mt-3.5 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-white/70">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Select Payment Method:</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('gpay'); audio.playClickSound(); }}
                  className={`py-1 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                    selectedMethod === 'gpay'
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span>⚡</span>
                  <span>Google Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('card'); audio.playClickSound(); }}
                  className={`py-1 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                    selectedMethod === 'card'
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <CreditCard className="w-3 h-3 text-cyan-400" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('paypal'); audio.playClickSound(); }}
                  className={`py-1 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                    selectedMethod === 'paypal'
                      ? 'bg-blue-500/30 border-blue-400 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                      : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="font-black">🅿️</span>
                  <span>PayPal</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('stripe'); audio.playClickSound(); }}
                  className={`py-1 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                    selectedMethod === 'stripe'
                      ? 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="font-black">S</span>
                  <span>Stripe</span>
                </button>
              </div>
            </div>

            {/* Category Navigation Tabs */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setActiveTab('bundle'); audio.playClickSound(); }}
                className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeTab === 'bundle'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-300 shadow-md shadow-yellow-500/20 font-black'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Bundles</span>
              </button>

              <button
                onClick={() => { setActiveTab('coin_pack'); audio.playClickSound(); }}
                className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeTab === 'coin_pack'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-300 shadow-md shadow-yellow-500/20 font-black'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Coin Packs</span>
              </button>

              <button
                onClick={() => { setActiveTab('powerup_pack'); audio.playClickSound(); }}
                className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeTab === 'powerup_pack'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-300 shadow-md shadow-yellow-500/20 font-black'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Power-ups</span>
              </button>

              <button
                onClick={() => { setActiveTab('utility'); audio.playClickSound(); }}
                className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeTab === 'utility'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-300 shadow-md shadow-yellow-500/20 font-black'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>VIP Pass</span>
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

            {/* Restore Status Notification */}
            {restoreMessage && (
              <div className="p-3 bg-cyan-500/20 border border-cyan-400/40 rounded-2xl flex items-center gap-2 text-cyan-200 text-xs font-mono">
                <RotateCcw className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>{restoreMessage}</span>
              </div>
            )}

            {currentProducts.map((product) => {
              const isBuying = purchasingId === product.id;
              const isAlreadyActiveVIP = product.rewards.removeAds && adsRemoved;

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
                      {product.iconType === 'shield' && product.id === 'remove_ads' && (
                        <ShieldCheck className="w-8 h-8 text-emerald-400 fill-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      )}
                      {product.iconType === 'shield' && product.id !== 'remove_ads' && (
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
                        {product.rewards.removeAds && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-bold">
                            <ShieldCheck className="w-3 h-3" />PERMANENT AD-FREE VIP
                          </span>
                        )}
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
                      <div className="text-[10px] text-white/50 font-mono flex items-center sm:justify-end gap-1">
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                        <span>PRICE</span>
                      </div>
                      <div className="text-lg font-black text-white font-mono">
                        {product.defaultPricePlaceholder}
                      </div>
                    </div>

                    {isAlreadyActiveVIP ? (
                      <div className="px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center gap-1.5 shadow-sm font-mono">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>VIP ACTIVE</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(product)}
                        disabled={isBuying}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-mono ${
                          selectedMethod === 'gpay'
                            ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/30'
                            : selectedMethod === 'paypal'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:brightness-110 shadow-blue-500/30'
                            : selectedMethod === 'stripe'
                            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white hover:brightness-110 shadow-purple-500/30'
                            : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-cyan-500/30'
                        }`}
                      >
                        {isBuying ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>
                              {selectedMethod === 'gpay' ? '⚡' : selectedMethod === 'paypal' ? '🅿️' : selectedMethod === 'stripe' ? 'S' : '💳'}
                            </span>
                            <span>
                              {selectedMethod === 'gpay'
                                ? `PAY ${product.defaultPricePlaceholder} WITH GPAY`
                                : selectedMethod === 'paypal'
                                ? `PAY ${product.defaultPricePlaceholder} WITH PAYPAL`
                                : selectedMethod === 'stripe'
                                ? `PAY ${product.defaultPricePlaceholder} WITH STRIPE`
                                : `PAY ${product.defaultPricePlaceholder} WITH CARD`}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Note & Restore Purchases */}
          <div className="p-3 sm:p-3.5 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-[10px]">
            <div className="text-white/60 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
              <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified:</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono">Credit/Debit</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono">Google Pay</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono">PayPal</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono">Stripe</span>
            </div>
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-mono text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 border border-white/15 shrink-0"
            >
              {isRestoring ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <RotateCcw className="w-3 h-3 text-cyan-400" />
              )}
              <span>RESTORE PURCHASES</span>
            </button>
          </div>
        </motion.div>

        {/* Success Modal Overlay */}
        <AnimatePresence>
          {successResult && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <div className="relative w-full max-w-sm bg-[#160a2b] border-2 border-yellow-400 p-6 rounded-3xl text-center shadow-[0_0_50px_rgba(250,204,21,0.4)]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-yellow-500/40">
                  <Check className="w-8 h-8 text-black stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-mono mb-1">
                  TRANSACTION VERIFIED
                </h3>
                <p className="text-sm font-bold text-yellow-300 mb-4">
                  {successResult.title}
                </p>

                <div className="bg-black/50 border border-white/10 rounded-2xl p-3 text-left space-y-1.5 mb-5 max-h-48 overflow-y-auto">
                  {successResult.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-mono text-white/90">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSuccessResult(null);
                    audio.playClickSound();
                    haptics.uiTap();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider text-xs font-mono shadow-md cursor-pointer hover:brightness-110 active:scale-95"
                >
                  CLAIM & CONTINUE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Screen Modal */}
        <PaymentScreenModal
          isOpen={!!activePaymentProduct}
          onClose={() => setActivePaymentProduct(null)}
          product={activePaymentProduct}
          initialRail={selectedMethod}
          onSuccess={(result) => {
            setActivePaymentProduct(null);
            setSuccessResult(result);
          }}
        />
      </div>
    </AnimatePresence>
  );
}
