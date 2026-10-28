import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCatalogItem } from '../../billing/types';
import { billingService } from '../../billing/BillingService';
import { useGameStore } from '../../game/store';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';
import { 
  X, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Zap,
  Building,
  ExternalLink,
  Smartphone,
  Fingerprint,
  RefreshCw
} from 'lucide-react';

export type PaymentRail = 'card' | 'gpay' | 'paypal' | 'stripe';

interface PaymentScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductCatalogItem | null;
  initialRail?: PaymentRail;
  onSuccess: (result: { title: string; items: string[] }) => void;
}

export function PaymentScreenModal({
  isOpen,
  onClose,
  product,
  initialRail = 'gpay',
  onSuccess,
}: PaymentScreenModalProps) {
  if (!isOpen || !product) return null;

  return (
    <PaymentScreenModalContent
      key={`${product.id}_${initialRail}`}
      onClose={onClose}
      product={product}
      initialRail={initialRail}
      onSuccess={onSuccess}
    />
  );
}

function PaymentScreenModalContent({
  onClose,
  product,
  initialRail = 'gpay',
  onSuccess,
}: {
  key?: React.Key;
  onClose: () => void;
  product: ProductCatalogItem;
  initialRail: PaymentRail;
  onSuccess: (result: { title: string; items: string[] }) => void;
}) {
  const [activeRail, setActiveRail] = useState<PaymentRail>(initialRail);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 3D Secure Modal State for Cards
  const [show3DSChallenge, setShow3DSChallenge] = useState(false);
  const [otpCode, setOtpCode] = useState('849204');

  // External Redirect Simulator
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState<string | null>(null);

  // Card Form State
  const [cardName, setCardName] = useState('Alex Rivers');
  const [cardNumber, setCardNumber] = useState('4242 8888 1234 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // PayPal State
  const [paypalEmail, setPaypalEmail] = useState('operative@towershift.io');
  const [paypalUseBalance, setPaypalUseBalance] = useState(true);

  const handleFormatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleFormatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const handleExternalRedirect = async () => {
    if (isProcessing || isRedirecting) return;
    setIsRedirecting(true);
    setErrorMessage(null);
    audio.playClickSound();
    haptics.vibrate([15]);

    try {
      // Call backend checkout endpoint to generate redirect URL
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          paymentMethod: activeRail,
        }),
      });

      const data = await response.json();
      if (data?.url) {
        setGatewayUrl(data.url);
        // Attempt top-level frame escape (critical for Cloud Run / iframe environments)
        try {
          if (window.top && window.top !== window) {
            window.top.location.href = data.url;
            return;
          }
        } catch {
          // If cross-origin restrictions block window.top, fallback to window.location
        }
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'Failed to initialize payment gateway.');
      }
    } catch (err: any) {
      setIsRedirecting(false);
      audio.playErrorSound();
      setErrorMessage(err?.message || 'Payment gateway connection error. Please try again.');
    }
  };

  const executePayment = async () => {
    if (isProcessing) return;
    if (!import.meta.env.DEV) {
      // Real money only goes through the verified Stripe checkout
      return handleExternalRedirect();
    }
    setIsProcessing(true);
    setErrorMessage(null);
    audio.playClickSound();
    haptics.vibrate([15]);

    try {
      // Step 1: Gateway Handshake
      setProcessingStep(
        activeRail === 'gpay'
          ? 'Contacting Google Pay Secure Enclave...'
          : activeRail === 'paypal'
          ? 'Verifying PayPal Wallet & Buyer Protection...'
          : activeRail === 'stripe'
          ? 'Connecting to Stripe Merchant Gateway...'
          : 'Encrypting Card with 256-Bit SSL...'
      );
      await new Promise(r => setTimeout(r, 650));

      // Step 2: 3D Secure / Biometric authorization
      if (activeRail === 'card') {
        setShow3DSChallenge(true);
        setIsProcessing(false);
        return;
      }

      setProcessingStep(
        activeRail === 'gpay'
          ? 'Biometric Fingerprint Verified'
          : activeRail === 'paypal'
          ? 'PayPal One-Touch Authorized'
          : 'Stripe 3DS2 Token Approved'
      );
      haptics.vibrate([20, 20]);
      await new Promise(r => setTimeout(r, 650));

      // Step 3: Entitlement Granting & Persistence
      await finalizePurchase();
    } catch (err: any) {
      setIsProcessing(false);
      audio.playErrorSound();
      setErrorMessage(err?.message || 'Payment gateway connection error.');
    }
  };

  const finalizePurchase = async () => {
    setProcessingStep('Granting Entitlements & Saving Profile...');
    const purchaseRes = await billingService.purchaseProduct(product.id);

    if (purchaseRes.success && purchaseRes.grantedItems) {
      audio.playPerfectSound();
      haptics.vibrate([25, 45, 25]);
      setIsProcessing(false);
      setShow3DSChallenge(false);
      onClose();
      onSuccess({
        title: `${product.name} Authorized!`,
        items: [
          ...purchaseRes.grantedItems,
          `Payment method: ${
            activeRail === 'gpay'
              ? 'Google Pay (Instant)'
              : activeRail === 'paypal'
              ? 'PayPal Wallet'
              : activeRail === 'stripe'
              ? 'Stripe Direct'
              : 'Credit/Debit Card (3D Secure)'
          }`,
        ],
      });
    } else {
      setIsProcessing(false);
      audio.playErrorSound();
      setErrorMessage(purchaseRes.message || 'Payment gateway could not verify transaction.');
    }
  };

  const handleApprove3DS = async () => {
    setIsProcessing(true);
    setProcessingStep('3D Secure Bank Verification Confirmed...');
    audio.playClickSound();
    haptics.vibrate([20, 20]);
    await new Promise(r => setTimeout(r, 600));
    await finalizePurchase();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg">
        {/* Backdrop Dismiss */}
        <div 
          onClick={() => { if (!isProcessing && !isRedirecting) onClose(); }} 
          className="absolute inset-0 cursor-pointer"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#0e071e] border-2 border-cyan-400/80 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.35)] flex flex-col max-h-[95vh] overflow-hidden z-10 text-white font-sans"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#170a2e] via-[#240e46] to-[#170a2e] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing || isRedirecting}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>SECURE PAYMENT CHECKOUT</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide font-mono">
                  {product.name}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-white/50 font-mono">TOTAL DUE</div>
              <div className="text-xl font-black text-yellow-400 font-mono">
                {product.defaultPricePlaceholder}
              </div>
            </div>
          </div>

          {/* Active Payment Rail Status & Instant Switcher */}
          <div className="px-4 py-2.5 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Method:</span>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 border shadow-sm ${
                activeRail === 'gpay'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : activeRail === 'card'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : activeRail === 'paypal'
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              }`}>
                {activeRail === 'gpay' && <><span>⚡</span><span>Google Pay</span></>}
                {activeRail === 'card' && <><CreditCard className="w-3.5 h-3.5" /><span>Credit / Debit Card</span></>}
                {activeRail === 'paypal' && <><span>🅿️</span><span>PayPal</span></>}
                {activeRail === 'stripe' && <><span>S</span><span>Stripe</span></>}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-white/40 mr-1 hidden sm:inline">Change:</span>
              {(['gpay', 'card', 'paypal', 'stripe'] as PaymentRail[]).map((rail) => {
                if (rail === activeRail) return null;
                const labels: Record<PaymentRail, { icon: string; name: string }> = {
                  gpay: { icon: '⚡', name: 'GPay' },
                  card: { icon: '💳', name: 'Card' },
                  paypal: { icon: '🅿️', name: 'PayPal' },
                  stripe: { icon: 'S', name: 'Stripe' },
                };
                return (
                  <button
                    key={rail}
                    type="button"
                    onClick={() => { setActiveRail(rail); audio.playClickSound(); }}
                    disabled={isProcessing}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-mono text-[10px] cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <span>{labels[rail].icon}</span>
                    <span>{labels[rail].name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* RAIL 1: CREDIT / DEBIT CARD */}
            {activeRail === 'card' && (
              <div className="space-y-4">
                {/* Visual Card Preview */}
                <div className="relative w-full h-44 rounded-2xl p-5 bg-gradient-to-tr from-cyan-900 via-slate-900 to-indigo-950 border border-cyan-400/40 shadow-xl flex flex-col justify-between overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5" />
                      <span>CARD</span>
                    </div>
                    <span className="font-mono font-black text-sm text-white/80">VISA / MASTERCARD</span>
                  </div>

                  {/* EMV Chip & Contactless */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 to-yellow-500 border border-amber-600/60 shadow-inner flex items-center justify-center">
                      <div className="w-7 h-5 border border-amber-700/40 rounded-xs" />
                    </div>
                    <span className="text-cyan-300 text-base">📶</span>
                  </div>

                  <div>
                    <div className="font-mono text-lg sm:text-xl tracking-widest text-white font-bold drop-shadow">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-white/70 mt-1 uppercase">
                      <span>{cardName || 'CARDHOLDER NAME'}</span>
                      <span>EXP: {cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Input Form */}
                <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10">
                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase">
                      Cardholder Full Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Alex Rivers"
                      className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => handleFormatCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono outline-none tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase">
                        Expiration (MM/YY)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => handleFormatExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono outline-none text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase">
                        Security Code (CVC)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        placeholder="CVC"
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono outline-none text-center tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RAIL 2: GOOGLE PAY */}
            {activeRail === 'gpay' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#111927] border-2 border-amber-400/50 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 mx-auto flex items-center justify-center text-3xl">
                    ⚡
                  </div>
                  <h3 className="text-xl font-black font-mono text-white">Google Pay Express</h3>
                  <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
                    Instant 1-Tap checkout authenticated via Google Play Services and biometric touch verification.
                  </p>

                  <div className="p-3 bg-black/50 rounded-xl border border-white/10 text-left font-mono text-xs space-y-2">
                    <div className="flex justify-between items-center text-white/80">
                      <span>Google Account:</span>
                      <span className="text-cyan-300 font-bold">architect@google.com</span>
                    </div>
                    <div className="flex justify-between items-center text-white/80">
                      <span>Default Card:</span>
                      <span className="text-amber-300 font-bold">Visa •••• 4242</span>
                    </div>
                    <div className="flex justify-between items-center text-white/80">
                      <span>Biometric Security:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Fingerprint className="w-3.5 h-3.5" /> Fingerprint Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RAIL 3: PAYPAL */}
            {activeRail === 'paypal' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#09152e] border-2 border-blue-500/50 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/40 mx-auto flex items-center justify-center text-3xl font-black text-blue-400">
                    🅿️
                  </div>
                  <h3 className="text-xl font-black font-mono text-white">PayPal Checkout Portal</h3>
                  <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
                    Protected by PayPal Buyer Protection and encrypted authorization.
                  </p>

                  <div className="p-3.5 bg-black/50 rounded-xl border border-white/10 space-y-3 text-left">
                    <div>
                      <label className="block text-[11px] font-mono text-white/70 mb-1 uppercase">
                        PayPal Account Email
                      </label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs text-white/80">
                      <input
                        type="checkbox"
                        id="ppBalance"
                        checked={paypalUseBalance}
                        onChange={(e) => setPaypalUseBalance(e.target.checked)}
                        className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                      />
                      <label htmlFor="ppBalance" className="cursor-pointer font-mono text-[11px]">
                        Apply PayPal Balance ($150.00 available)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RAIL 4: STRIPE DIRECT */}
            {activeRail === 'stripe' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#1a0f2e] border-2 border-purple-500/50 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/40 mx-auto flex items-center justify-center text-3xl font-black text-purple-300">
                    S
                  </div>
                  <h3 className="text-xl font-black font-mono text-white">Stripe Unified Checkout</h3>
                  <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
                    Direct merchant checkout powered by Stripe's global payments infrastructure.
                  </p>

                  <div className="p-3 bg-black/50 rounded-xl border border-white/10 text-left font-mono text-xs space-y-2">
                    <div className="flex justify-between items-center text-white/80">
                      <span>Merchant:</span>
                      <span className="text-purple-300 font-bold">TOWER//SHIFT Game Studios</span>
                    </div>
                    <div className="flex justify-between items-center text-white/80">
                      <span>Security:</span>
                      <span className="text-emerald-400 font-bold">Level 1 PCI DSS Certified</span>
                    </div>
                    <div className="flex justify-between items-center text-white/80">
                      <span>Accepted Methods:</span>
                      <span className="text-cyan-300 font-bold">Card, Apple Pay, Google Pay, Link</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gateway Direct Launch (if popup blocked or taking time) */}
            {gatewayUrl && (
              <div className="pt-2">
                <a
                  href={gatewayUrl}
                  target="_top"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-mono text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all font-bold animate-pulse text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Tap here to open official checkout window</span>
                </a>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-black/70 border-t border-white/10 space-y-2 shrink-0">
            {isRedirecting ? (
              <div className="py-3.5 px-4 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center gap-3 text-cyan-300 font-mono text-xs font-bold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Redirecting to Official Payment Gateway...</span>
              </div>
            ) : isProcessing ? (
              <div className="py-3.5 px-4 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center gap-3 text-cyan-300 font-mono text-xs font-bold animate-pulse">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{processingStep}</span>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExternalRedirect}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  activeRail === 'gpay'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/25'
                    : activeRail === 'paypal'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/25'
                    : activeRail === 'stripe'
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-purple-500/25'
                    : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 shadow-cyan-500/30'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {activeRail === 'gpay'
                    ? `PAY WITH GOOGLE PAY • ${product.defaultPricePlaceholder}`
                    : activeRail === 'paypal'
                    ? `PAY WITH PAYPAL • ${product.defaultPricePlaceholder}`
                    : activeRail === 'stripe'
                    ? `PAY WITH STRIPE • ${product.defaultPricePlaceholder}`
                    : `CHECKOUT WITH CARD • ${product.defaultPricePlaceholder}`}
                </span>
              </motion.button>
            )}

            {import.meta.env.DEV && (
            <button
              type="button"
              onClick={executePayment}
              disabled={isProcessing || isRedirecting}
              className="w-full py-1.5 text-[10px] text-white/40 hover:text-white/80 font-mono underline text-center cursor-pointer transition-colors"
            >
              Or simulate in-game purchase (Test Mode)
            </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-white/50 font-mono text-center pt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Instant Entitlement Delivery • 100% Guaranteed</span>
            </div>
          </div>
        </motion.div>

        {/* 3D Secure / Bank Authorization Modal Challenge */}
        <AnimatePresence>
          {show3DSChallenge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <div className="relative w-full max-w-sm bg-[#130924] border-2 border-cyan-400 p-6 rounded-3xl text-center shadow-[0_0_60px_rgba(6,182,212,0.4)]">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 mx-auto mb-3 flex items-center justify-center text-cyan-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
                  VERIFIED BY VISA / MASTERCARD ID CHECK
                </div>
                <h3 className="text-lg font-black text-white font-mono mb-2">
                  Bank 3D Secure Authorization
                </h3>
                <p className="text-xs text-white/70 mb-4 leading-relaxed font-sans">
                  Your issuing bank requires identity verification for <span className="font-bold text-yellow-300">{product.defaultPricePlaceholder}</span>.
                </p>

                <div className="p-3 bg-black/60 rounded-xl border border-white/10 mb-4 text-left font-mono text-xs space-y-1.5">
                  <div className="flex justify-between text-white/70">
                    <span>Card:</span>
                    <span className="text-white font-bold">{cardNumber.slice(-4) ? `•••• ${cardNumber.slice(-4)}` : '•••• 4242'}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Merchant:</span>
                    <span className="text-white font-bold">TOWER//SHIFT Studios</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>One-Time Passcode:</span>
                    <span className="text-emerald-400 font-bold">{otpCode}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleApprove3DS}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black uppercase tracking-wider text-xs font-mono shadow-md cursor-pointer hover:brightness-110 active:scale-95"
                  >
                    {isProcessing ? 'AUTHORIZING TRANSACTION...' : 'CONFIRM & AUTHORIZE PAYMENT'}
                  </button>

                  <button
                    onClick={() => setShow3DSChallenge(false)}
                    disabled={isProcessing}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 font-mono text-xs cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
