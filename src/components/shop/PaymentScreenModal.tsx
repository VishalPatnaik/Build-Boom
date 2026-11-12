import React, { useState } from 'react';
import { ProductCatalogItem } from '../../billing/types';
import { isNativeApp } from '../../native/platform';
import { billingService } from '../../billing/BillingService';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';
import { AlertCircle } from 'lucide-react';

interface PaymentScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductCatalogItem | null;
  onSuccess: (result: { title: string; items: string[] }) => void;
}

// TOWER//SHIFT is a mobile app: every real-money purchase goes through Google Play Billing.
// Outside the Android app (developer preview only) the billing service uses its test provider.
export function PaymentScreenModal({ isOpen, onClose, product, onSuccess }: PaymentScreenModalProps) {
  if (!isOpen || !product) return null;
  return <GooglePlayCheckout key={product.id} product={product} onClose={onClose} onSuccess={onSuccess} />;
}

function GooglePlayCheckout({
  product,
  onClose,
  onSuccess,
}: {
  key?: React.Key;
  product: ProductCatalogItem;
  onClose: () => void;
  onSuccess: (result: { title: string; items: string[] }) => void;
}) {
  const [price, setPrice] = useState<string>(product.defaultPricePlaceholder);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    billingService
      .getProvider()
      .getLocalizedPrice(product.id)
      .then((p) => {
        if (alive && p) setPrice(p);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [product.id]);

  const buy = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    audio.playClickSound();
    const res = await billingService.purchaseProduct(product.id);
    setBusy(false);
    if (res.success) {
      audio.playPerfectSound();
      haptics.vibrate([25, 45, 25]);
      onClose();
      onSuccess({ title: `${product.name} Purchased!`, items: res.grantedItems || [] });
    } else if (res.message && res.message !== 'Purchase cancelled.') {
      audio.playErrorSound();
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div onClick={() => { if (!busy) onClose(); }} className="absolute inset-0" />
      <div className="relative z-10 w-full max-w-md rounded-3xl border-2 border-cyan-400/70 bg-[#0e071e] p-5 text-white shadow-[0_0_60px_rgba(6,182,212,0.3)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              {isNativeApp() ? 'Google Play' : 'Google Play · test purchase (dev preview)'}
            </div>
            <h2 className="text-xl font-black font-mono truncate">{product.name}</h2>
            <p className="mt-1 text-xs text-white/70 leading-relaxed">{product.description}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-white/50 font-mono">PRICE</div>
            <div className="text-xl font-black text-yellow-400 font-mono">{price}</div>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        <button
          onClick={buy}
          disabled={busy}
          className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black uppercase tracking-wider disabled:opacity-60"
        >
          {busy ? 'Waiting for Google Play…' : `Buy for ${price}`}
        </button>
        <button onClick={onClose} disabled={busy} className="mt-2 w-full py-2 text-xs text-white/60 font-mono">
          Not now
        </button>
      </div>
    </div>
  );
}
