import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { X, ShieldCheck, CheckCircle2, RotateCcw, CreditCard } from 'lucide-react';
import { billingService } from '../billing/BillingService';
import { getProductById } from '../billing/catalog';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { PaymentScreenModal, PaymentRail } from './shop/PaymentScreenModal';

export function RemoveAdsOverlay() {
  const { showRemoveAds, setShowRemoveAds, adsRemoved } = useGameStore();
  const [selectedRail, setSelectedRail] = useState<PaymentRail>('gpay');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const removeAdsProduct = getProductById('remove_ads') || {
    id: 'remove_ads',
    name: 'Ad Blocker VIP Pass',
    subtitle: 'Permanent Interstitial Removal',
    description: 'Permanently removes all interstitial ads & grants instant VIP rewards.',
    type: 'utility',
    rarity: 'epic',
    rewards: { removeAds: true },
    defaultPricePlaceholder: '$4.99',
    iconType: 'shield',
  };

  const handleOpenPayment = (rail?: PaymentRail) => {
    if (adsRemoved) return;
    if (rail) setSelectedRail(rail);
    audio.playClickSound();
    haptics.vibrate([15]);
    setShowPaymentModal(true);
  };

  const handleRestore = async () => {
    audio.playClickSound();
    setStatusMessage('Checking purchase history on Google Play / App Store...');
    const history = billingService.getPurchaseHistory();
    const hasPriorRemoveAds = history.some(t => t.productId === 'remove_ads' && t.status === 'completed');
    if (hasPriorRemoveAds || adsRemoved) {
      useGameStore.getState().removeAds();
      setStatusMessage('✓ Ad Blocker VIP restored successfully!');
      audio.playBuildSound(1.2);
    } else {
      setStatusMessage('No prior Ad Blocker purchase found for this account.');
    }
  };

  return (
    <AnimatePresence>
      {showRemoveAds && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setShowRemoveAds(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto cursor-pointer"
          />

          {/* Bottom Center Modal Sheet */}
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#190E2D] p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-red-500 shadow-[0_-12px_45px_rgba(239,68,68,0.35)] pointer-events-auto z-10 touch-pan-y flex flex-col justify-between max-h-[85vh] overflow-y-auto"
          >
            {/* Top Grab Handle */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-2 shrink-0 cursor-pointer" onClick={() => setShowRemoveAds(false)} />
            {/* Close Button */}
            <button 
              onClick={() => setShowRemoveAds(false)}
              className="absolute top-3.5 right-3.5 sm:-top-3 sm:-right-3 p-2 bg-gray-500 rounded-full border-2 border-white shadow-md text-white hover:bg-gray-600 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center bg-red-500 p-3 rounded-full border-2 border-white mb-2 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-wider font-mono" style={{ WebkitTextStroke: '1px black' }}>
                AD BLOCKER VIP
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">Enjoy pure uninterrupted tower building.</p>
            </div>

            {statusMessage && (
              <div className="mb-4 p-3 bg-black/40 rounded-xl border border-white/20 text-center font-mono text-xs text-yellow-300">
                {statusMessage}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Payment Method Selector */}
              {!adsRemoved && (
                <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-xl border border-white/10 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-white/60">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
                    </span>
                    <span>Select Payment:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedRail('gpay'); audio.playClickSound(); }}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                        selectedRail === 'gpay'
                          ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      ⚡ GPay
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedRail('card'); audio.playClickSound(); }}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                        selectedRail === 'card'
                          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      💳 Card
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedRail('paypal'); audio.playClickSound(); }}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                        selectedRail === 'paypal'
                          ? 'bg-blue-500/30 border-blue-400 text-blue-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      🅿️ PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedRail('stripe'); audio.playClickSound(); }}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                        selectedRail === 'stripe'
                          ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      S Stripe
                    </button>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenPayment(selectedRail)}
                disabled={adsRemoved}
                className={`w-full relative flex items-center justify-center gap-3 p-4 rounded-2xl border-4 transition-all font-mono ${
                  adsRemoved 
                    ? 'bg-emerald-600 border-white text-white cursor-default'
                    : selectedRail === 'gpay'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-white text-slate-950 shadow-[0_4px_0_#b45309] cursor-pointer'
                    : selectedRail === 'paypal'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-white text-white shadow-[0_4px_0_#1e3a8a] cursor-pointer'
                    : selectedRail === 'stripe'
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 border-white text-white shadow-[0_4px_0_#581c87] cursor-pointer'
                    : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 border-white shadow-[0_4px_0_#0369a1] cursor-pointer text-slate-950'
                }`}
              >
                {adsRemoved ? (
                  <span className="text-xl font-black text-white flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-white" /> ALREADY ACTIVATED
                  </span>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl font-black tracking-wide">
                      {selectedRail === 'gpay'
                        ? '⚡ PAY $4.99 WITH GPAY'
                        : selectedRail === 'paypal'
                        ? '🅿️ PAY $4.99 WITH PAYPAL'
                        : selectedRail === 'stripe'
                        ? 'S PAY $4.99 WITH STRIPE'
                        : '💳 PAY $4.99 WITH CARD'}
                    </span>
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                      One-Time Permanent VIP Unlock
                    </span>
                  </div>
                )}
              </motion.button>
              <p className="text-center text-xs text-white/70 font-medium leading-relaxed">
                Permanent removal of all random interstitial ads. 
                <br />
                <span className="text-emerald-300 font-bold">Bonus: VIP instant ad-free unlocks on shop & munition rewards!</span>
              </p>

              <button
                onClick={handleRestore}
                className="text-xs font-mono text-white/60 hover:text-white underline self-center flex items-center gap-1.5 cursor-pointer pt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Purchases</span>
              </button>
            </div>
          </motion.div>

          {/* Payment Checkout Screen Modal */}
          <PaymentScreenModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            product={removeAdsProduct}
            initialRail={selectedRail}
            onSuccess={() => {
              setShowPaymentModal(false);
              setShowRemoveAds(false);
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
