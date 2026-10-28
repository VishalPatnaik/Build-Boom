import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, X, Check, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { haptics } from '../utils/haptics';
import { audio } from '../audio/AudioEngine';

export function MobileAppInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // When already running in standalone native mode, hide install triggers
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    haptics.uiTap();
    audio.playBuildSound(1.2);
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Direct Chrome / Android fallback guidance
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(6,182,212,0.5)] border-2 border-cyan-200 cursor-pointer active:scale-95 transition-all"
        title="Install TOWER//SHIFT Mobile App"
        aria-label="Install TOWER//SHIFT Mobile App"
      >
        <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>GET APP</span>
      </motion.button>

      {/* Mobile App Installation Guidance Dialog */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black p-5 sm:p-6 text-slate-100 border-2 border-cyan-400/80 shadow-[0_0_40px_rgba(6,182,212,0.4)] font-mono"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <Smartphone className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                      NATIVE MOBILE APP
                    </span>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      INSTALL TOWER//SHIFT
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 mb-5 leading-relaxed font-sans">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono font-black text-xs shrink-0">
                    1
                  </div>
                  <div>
                    {isIOS ? (
                      <>Tap the <strong className="text-white">Share</strong> button in your Safari navigation bar.</>
                    ) : (
                      <>Tap your browser menu (<strong className="text-white">⋮</strong> or <strong className="text-white">Share</strong>).</>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono font-black text-xs shrink-0">
                    2
                  </div>
                  <div>
                    Select <strong className="text-cyan-300">"Add to Home Screen"</strong> or <strong className="text-cyan-300">"Install App"</strong>.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-mono font-black text-xs shrink-0">
                    3
                  </div>
                  <div>
                    Launch directly from your mobile home screen with full screen graphics, offline audio, and zero browser address bars!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl font-mono cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                GOT IT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
