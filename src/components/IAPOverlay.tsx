import React from 'react';
import { useGameStore } from '../game/store';
import { BillingPackageModal } from './shop/BillingPackageModal';

export function IAPOverlay() {
  const { showIAP, setShowIAP } = useGameStore();

  return (
    <BillingPackageModal
      isOpen={showIAP}
      onClose={() => setShowIAP(false)}
      initialTab="coin_pack"
    />
  );
}
