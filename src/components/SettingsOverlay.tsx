import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { ENVIRONMENT_THEMES } from '../game/environmentThemes';
import { COLLECTIONS } from '../game/collections';
import { audio, SoundPackTheme } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { 
  Settings, 
  X, 
  Volume2, 
  VolumeX, 
  Music, 
  Sliders, 
  Eye, 
  Sparkles, 
  Check, 
  Vibrate, 
  User, 
  RotateCcw, 
  Sun, 
  Moon, 
  Layers, 
  Radio, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Flame,
  CheckCircle2,
  Gamepad2,
  Activity,
  Cpu,
  TreePine,
  Disc,
  Smartphone,
  Maximize2,
  Minimize2,
  Download,
  Video
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useFullscreen } from '../hooks/useFullscreen';
import { AdService } from '../ads/AdService';

const SOUND_PACK_THEMES: {
  id: SoundPackTheme;
  title: string;
  tagline: string;
  badge: string;
  gradientText: string;
  activeBorder: string;
  iconBg: string;
  icon: any;
  description: string;
}[] = [
  {
    id: 'retro',
    title: 'Retro Arcade',
    tagline: '8-Bit Chiptune Synth',
    badge: 'CHIPTUNE',
    gradientText: 'from-amber-400 to-yellow-300 text-yellow-300',
    activeBorder: 'border-yellow-400/80 bg-gradient-to-br from-yellow-950/40 via-slate-900/90 to-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.25)]',
    iconBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/60',
    icon: Gamepad2,
    description: 'Nostalgic 8-bit square waves, rapid arpeggiated blips, and arcade victory chimes',
  },
  {
    id: 'scifi',
    title: 'Sci-Fi Quantum',
    tagline: 'Cyber FM Hologram',
    badge: 'FM SYNTH',
    gradientText: 'from-cyan-400 to-sky-300 text-cyan-300',
    activeBorder: 'border-cyan-400/80 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60',
    icon: Cpu,
    description: 'Metallic frequency-modulated pulses, resonant filter sweeps, and quantum tractor locks',
  },
  {
    id: 'organic',
    title: 'Organic Acoustic',
    tagline: 'Marimba & Kalimba Strike',
    badge: 'ACOUSTIC',
    gradientText: 'from-emerald-400 to-green-300 text-emerald-300',
    activeBorder: 'border-emerald-400/80 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60',
    icon: TreePine,
    description: 'Warm natural wooden bar resonance, soft bamboo transients, and rich acoustic damping',
  },
  {
    id: 'default',
    title: 'Kinetic Modern',
    tagline: 'Crisp Mechanical Snap',
    badge: 'DEFAULT',
    gradientText: 'from-purple-400 to-indigo-300 text-purple-300',
    activeBorder: 'border-purple-400/80 bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-950 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/60',
    icon: Disc,
    description: 'Clean mechanical impact click, mass-weighted foundation resonance, and sub-bass thud',
  },
];

export function SettingsOverlay() {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    musicEnabled,
    sfxEnabled,
    musicVolume,
    sfxVolume,
    soundPack,
    setSoundPack,
    visualTheme,
    highContrastMode,
    toggleMusic,
    toggleSfx,
    setMusicVolume,
    setSfxVolume,
    setVisualTheme,
    toggleHighContrast,
    hapticsEnabled,
    toggleHaptics,
    showFpsMonitor,
    toggleFpsMonitor,
    playerName,
    setPlayerName,
    playerAvatar,
    setPlayerAvatar,
    resetCampaignTutorial,
    equipThemeSet,
    equippedBackground,
    adsRemoved,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'audio' | 'visuals' | 'mobile' | 'profile'>('audio');
  const [editingName, setEditingName] = useState(playerName);
  const [nameSavedFeedback, setNameSavedFeedback] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [hapticTestFeedback, setHapticTestFeedback] = useState<string | null>(null);

  useEffect(() => {
    setEditingName(playerName);
  }, [playerName]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settingsModalOpen) {
        setSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsModalOpen, setSettingsModalOpen]);

  const handlePreviewSfx = () => {
    audio.playComboSurge(3);
    haptics.blockPlaced('gold_ingot');
  };

  const handlePreviewSoundPack = (packId: SoundPackTheme) => {
    setSoundPack(packId);
    haptics.uiTap();
    audio.playStackSound(1.0, { combo: 2, isPerfect: true });
  };

  const handlePreviewVibration = () => {
    haptics.vibrate([25, 40, 30, 20]);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      setPlayerName(editingName.trim().slice(0, 16));
      setNameSavedFeedback(true);
      haptics.uiTap();
      audio.playBuildSound(1.2);
      setTimeout(() => setNameSavedFeedback(false), 2000);
    }
  };

  const avatarOptions = ['🧑‍🚀', '🤖', '⚡', '👑', '🛡️', '💎', '🚀', '👾', '🦊', '🔮'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSettingsModalOpen(false)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-cyan-500/60 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden font-mono text-slate-100 z-10"
        >
          {/* Cyber scanline texture */}
          <div className="absolute inset-0 bg-cyber-scanlines opacity-10 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/30 bg-slate-950/60 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Settings className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-cyan-400 tracking-[0.25em] uppercase flex items-center gap-1.5">
                  <span>SYSTEM MATRIX</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  SETTINGS & THEMES
                </h2>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                haptics.uiTap();
                setSettingsModalOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/60 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Tabs Navigation */}
          <div className="grid grid-cols-4 gap-1 p-2 sm:p-2.5 bg-slate-950/90 border-b border-slate-800/80 relative z-10">
            <button
              onClick={() => {
                haptics.uiTap();
                setActiveTab('audio');
              }}
              className={`
                py-2 px-1.5 sm:px-2 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all
                ${activeTab === 'audio'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>Audio</span>
            </button>

            <button
              onClick={() => {
                haptics.uiTap();
                setActiveTab('visuals');
              }}
              className={`
                py-2 px-1.5 sm:px-2 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all
                ${activeTab === 'visuals'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>Themes</span>
            </button>

            <button
              onClick={() => {
                haptics.uiTap();
                setActiveTab('mobile');
              }}
              className={`
                py-2 px-1.5 sm:px-2 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all
                ${activeTab === 'mobile'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>Mobile</span>
            </button>

            <button
              onClick={() => {
                haptics.uiTap();
                setActiveTab('profile');
              }}
              className={`
                py-2 px-1.5 sm:px-2 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all
                ${activeTab === 'profile'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Profile</span>
            </button>
          </div>

          {/* Modal Body / Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10 touch-pan-y" style={{ scrollbarWidth: 'thin' }}>
            
            {/* ======================================================== */}
            {/* TAB 1: AUDIO CONFIGURATION                               */}
            {/* ======================================================== */}
            {activeTab === 'audio' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* GAME MUSIC CONTROL CARD */}
                <div className={`p-4 sm:p-4.5 rounded-2xl border-2 backdrop-blur-md transition-all ${
                  musicEnabled 
                    ? 'bg-gradient-to-br from-cyan-950/70 via-slate-900/90 to-slate-950 border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.25)]' 
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        musicEnabled
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <span>Game Music</span>
                          {musicEnabled && (
                            <span className="flex gap-0.5 items-end h-3">
                              <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
                              <span className="w-0.5 h-3 bg-cyan-300 animate-bounce" />
                              <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          Atmospheric cyber ambient synth soundtrack
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        haptics.uiTap();
                        toggleMusic();
                      }}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                        musicEnabled ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 border-slate-700'
                      }`}
                      aria-label="Toggle game music"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          musicEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Volume Slider & readout */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Music Volume</span>
                      <span className="font-bold text-cyan-300 font-mono">{Math.round(musicVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={musicVolume}
                      disabled={!musicEnabled}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* SOUND EFFECTS (SFX) CONTROL CARD */}
                <div className={`p-4 sm:p-4.5 rounded-2xl border-2 backdrop-blur-md transition-all ${
                  sfxEnabled 
                    ? 'bg-gradient-to-br from-amber-950/70 via-slate-900/90 to-slate-950 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        sfxEnabled
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                        {sfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white uppercase tracking-wider">
                          Sound Effects
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          Collisions, stacking resonance, deflections & combos
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        haptics.uiTap();
                        toggleSfx();
                      }}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                        sfxEnabled ? 'bg-amber-400 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 border-slate-700'
                      }`}
                      aria-label="Toggle sound effects"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          sfxEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Volume Slider & Preview Button */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">SFX Volume</span>
                      <span className="font-bold text-amber-300 font-mono">{Math.round(sfxVolume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={sfxVolume}
                        disabled={!sfxEnabled}
                        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handlePreviewSfx}
                        disabled={!sfxEnabled}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 rounded-xl text-[10px] font-bold text-amber-300 uppercase tracking-wider shrink-0 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      >
                        Preview SFX
                      </button>
                    </div>
                  </div>
                </div>

                {/* SOUND PACK THEME SELECTOR CARD */}
                <div className="p-4 sm:p-4.5 rounded-2xl border-2 backdrop-blur-md bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <span>Stacking Sound Pack</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-mono">
                            THEME
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          Select the acoustic timbre for block placements and tower impacts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sound Pack Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {SOUND_PACK_THEMES.map((pack) => {
                      const isSelected = soundPack === pack.id;
                      const IconComponent = pack.icon;

                      return (
                        <div
                          key={pack.id}
                          onClick={() => handlePreviewSoundPack(pack.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                            isSelected
                              ? pack.activeBorder
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${pack.iconBg}`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                    {pack.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {pack.tagline}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isSelected ? (
                                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-[9px] font-bold flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5" />
                                    ACTIVE
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 text-[9px] font-mono">
                                    {pack.badge}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-[10.5px] text-slate-400/90 leading-relaxed font-sans line-clamp-2 mb-2">
                              {pack.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                            <span className="text-[9.5px] text-slate-500 font-mono">
                              Synthesizer: 48kHz WebAudio
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewSoundPack(pack.id);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                              Preview
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* HAPTIC FEEDBACK CARD */}
                <div className={`p-4 sm:p-4.5 rounded-2xl border-2 backdrop-blur-md transition-all ${
                  hapticsEnabled 
                    ? 'bg-gradient-to-br from-purple-950/70 via-slate-900/90 to-slate-950 border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        hapticsEnabled
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                        <Vibrate className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white uppercase tracking-wider">
                          Haptic Vibrations
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          Physical tactile feedback for blocks, stacks, and explosions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hapticsEnabled && (
                        <button
                          onClick={handlePreviewVibration}
                          className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/60 rounded-xl text-[10px] font-bold text-purple-300 uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                        >
                          Pulse
                        </button>
                      )}
                      <button
                        onClick={() => {
                          toggleHaptics();
                          if (!hapticsEnabled) {
                            haptics.vibrate([20, 30, 25]);
                          }
                        }}
                        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                          hapticsEnabled ? 'bg-purple-500 border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-slate-800 border-slate-700'
                        }`}
                        aria-label="Toggle haptic vibration"
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5 ${
                            hapticsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: VISUAL THEMES & ACCESSIBILITY                     */}
            {/* ======================================================== */}
            {activeTab === 'visuals' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* HIGH-CONTRAST ACCESSIBILITY SPOTLIGHT BANNER */}
                <div className={`p-4 rounded-2xl border-2 backdrop-blur-md transition-all ${
                  highContrastMode
                    ? 'bg-gradient-to-r from-yellow-950/80 via-black to-yellow-950/80 border-yellow-300 shadow-[0_0_25px_rgba(255,255,0,0.35)]'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-300 shrink-0">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-white uppercase tracking-wider">
                            High-Contrast Mode
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400 text-yellow-300 text-[9px] font-black uppercase tracking-widest">
                            ACCESSIBILITY
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                          Pitch-black void with fluorescent guidelines. Delivers stark contrast for maximum shape separation and visual accessibility.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        haptics.uiTap();
                        toggleHighContrast();
                      }}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                        highContrastMode ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_12px_rgba(255,255,0,0.6)]' : 'bg-slate-800 border-slate-700'
                      }`}
                      aria-label="Toggle high contrast mode"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          highContrastMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* PERFORMANCE & FPS MONITOR CARD */}
                <div className={`p-4 rounded-2xl border-2 backdrop-blur-md transition-all ${
                  showFpsMonitor
                    ? 'bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-slate-950 border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shrink-0 ${
                        showFpsMonitor
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-white uppercase tracking-wider">
                            Frame-Rate & Telemetry Monitor
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[9px] font-black uppercase tracking-widest font-mono">
                            60 FPS • MEM BUDGET
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                          Displays real-time FPS, frame latency, memory heap consumption, and jitter graphs in the top corner during high-intensity sequences.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        haptics.uiTap();
                        toggleFpsMonitor();
                      }}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                        showFpsMonitor ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]' : 'bg-slate-800 border-slate-700'
                      }`}
                      aria-label="Toggle frame-rate monitor"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          showFpsMonitor ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* THEME SELECTION HEADER */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Game Environment Visual Themes
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    Select Preferred Environment
                  </span>
                </div>

                {/* THEMES GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ENVIRONMENT_THEMES.map((theme) => {
                    const isSelected = visualTheme === theme.id;
                    return (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          haptics.uiTap();
                          audio.playBuildSound(1.2);
                          useGameStore.getState().triggerAssetTransition(`Recompiling ${theme.name} Shaders...`, 450);
                          setVisualTheme(theme.id);
                        }}
                        className={`
                          p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between
                          ${isSelected
                            ? `bg-gradient-to-br ${theme.gradientBg} ${theme.borderColor} shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-2 ring-white/30`
                            : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'}
                        `}
                      >
                        {/* Top Row: Title & Badge */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-black text-white uppercase tracking-wider">
                              {theme.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                isSelected 
                                  ? 'bg-white/20 border-white text-white' 
                                  : 'bg-slate-900 border-slate-700 text-slate-400'
                              }`}>
                                {theme.badge}
                              </span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {theme.tagline}
                          </div>

                          <p className="text-[10.5px] text-slate-300 font-sans mt-1 line-clamp-2">
                            {theme.description}
                          </p>
                        </div>

                        {/* Palette Swatches */}
                        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-white/10">
                          <span className="text-[9px] text-slate-400 uppercase font-bold mr-1">Palette:</span>
                          {theme.previewColors.map((col, idx) => (
                            <span
                              key={idx}
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 20 WORLD BIOMES QUICK-SWITCHER */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Master World Biomes (20 Cinematic Worlds)
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono uppercase">
                      Changes World, Block, Boom & Plate
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                    {COLLECTIONS.map((col, idx) => {
                      const isCurrent = (equippedBackground || 'bg-0') === col.world.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            haptics.uiTap();
                            audio.playBuildSound(1.1);
                            equipThemeSet(idx);
                          }}
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)] ring-1 ring-emerald-300'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                            {isCurrent && <Check className="w-3 h-3 text-emerald-400 shrink-0 stroke-[3]" />}
                          </div>
                          <span className="text-[11px] font-black text-white truncate mt-1">
                            {col.name}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate font-mono">
                            {col.block.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB: MOBILE APP, PWA & IMMERSIVE HARDWARE                */}
            {/* ======================================================== */}
            {activeTab === 'mobile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* 1. NATIVE APP INSTALLATION STATUS / ACTION */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/50 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
                        <Smartphone className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                            PWA Mobile App Experience
                          </span>
                          {isInstalled ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3 h-3" /> Standalone
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[9px] font-black uppercase tracking-wider font-mono">
                              Installable
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {isInstalled 
                            ? 'Running in full-screen standalone mode with zero browser address bars and offline caching.' 
                            : 'Install directly to your mobile home screen for a distraction-free native app experience.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isInstalled && (
                    <div className="mt-3 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          haptics.uiTap();
                          if (isInstallable) {
                            await install();
                          } else {
                            setShowIOSModal(true);
                          }
                        }}
                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl font-mono flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Install Mobile App</span>
                      </motion.button>

                      <button
                        onClick={() => setShowIOSModal(true)}
                        className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 rounded-xl text-xs font-bold text-cyan-300 uppercase tracking-wider cursor-pointer font-mono"
                      >
                        iOS / Android Guide
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. FULLSCREEN & IMMERSIVE DISPLAY */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shrink-0">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider font-mono">
                          Full-Screen Immersive Canvas
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {isFullscreen ? 'Displaying in 100% full-screen immersive viewport' : 'Collapse mobile browser toolbars and hide URL bars'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        haptics.uiTap();
                        toggleFullscreen();
                      }}
                      className="px-3.5 py-2 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-400/60 text-purple-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 font-mono"
                    >
                      {isFullscreen ? 'Exit Full' : 'Go Fullscreen'}
                    </button>
                  </div>
                </div>

                {/* 3. SCREEN WAKE LOCK INDICATOR */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                        <span>Screen Wake Lock</span>
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          Auto Active In-Game
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Prevents phone display from sleeping while balancing blocks
                      </div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                </div>

                {/* 4. TACTILE HAPTICS MATRIX & CALIBRATION */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
                        <Vibrate className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider font-mono">
                          Tactile Vibration Engine
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          Physical haptic feedback for block placement, streaks & hazards
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        toggleHaptics();
                        if (!hapticsEnabled) {
                          haptics.vibrate([20, 30, 20]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                        hapticsEnabled
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {hapticsEnabled ? 'ENABLED' : 'MUTED'}
                    </button>
                  </div>

                  {/* Haptic Calibration Test Pad */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        haptics.uiTap();
                        setHapticTestFeedback('Light Snap');
                        setTimeout(() => setHapticTestFeedback(null), 1200);
                      }}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase cursor-pointer"
                    >
                      Test Tap
                    </button>
                    <button
                      onClick={() => {
                        haptics.blockPlaced('standard', true, 4, 3);
                        setHapticTestFeedback('Harmonic Snap');
                        setTimeout(() => setHapticTestFeedback(null), 1200);
                      }}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase cursor-pointer"
                    >
                      Test Harmonic
                    </button>
                    <button
                      onClick={() => {
                        haptics.blockPlaced('titan');
                        setHapticTestFeedback('Titan Anchor');
                        setTimeout(() => setHapticTestFeedback(null), 1200);
                      }}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase cursor-pointer"
                    >
                      Test Titan
                    </button>
                  </div>
                  {hapticTestFeedback && (
                    <div className="text-[10px] text-cyan-400 font-mono text-center mt-2 animate-pulse">
                      Haptic Triggered: {hapticTestFeedback}
                    </div>
                  )}
                </div>

                {/* 5. OFFLINE SERVICE WORKER HEALTH */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300 font-mono uppercase">
                        100% Offline Game Engine
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        Audio synthesizers, shaders, physics & progression operate without internet
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                    VERIFIED
                  </span>
                </div>

                {/* 6. AD SYSTEM STATUS & LIVE DIAGNOSTICS */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                          <span>Ad Delivery Engine</span>
                          <span className="text-[9px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono">
                            {AdService.getStatus().providerLabel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {adsRemoved 
                            ? 'VIP Ad-Free Active: Rewarded bonuses unlock instantly with zero ads.' 
                            : 'Watch short 5-second sponsor clips to revive towers, double rewards, or acquire charges.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => {
                        audio.playClickSound();
                        haptics.uiTap();
                        useGameStore.getState().showReviveAd();
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Test Revive Ad</span>
                    </button>

                    <button
                      onClick={() => {
                        audio.playClickSound();
                        haptics.uiTap();
                        useGameStore.getState().setPendingCoins(100);
                        useGameStore.getState().showDoubleCoinsAd();
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Test 2X Coins</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: OPERATIVE PROFILE & GAMEPLAY                      */}
            {/* ======================================================== */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* CALLSIGN / NICKNAME FORM */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Architect Operative Callsign
                    </span>
                  </div>

                  <form onSubmit={handleSaveName} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={16}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Enter callsign..."
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-sm text-white font-mono outline-none transition-all placeholder:text-slate-600"
                    />
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                    >
                      {nameSavedFeedback ? 'Saved!' : 'Save'}
                    </motion.button>
                  </form>
                </div>

                {/* AVATAR SELECTOR */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800">
                  <span className="text-xs font-black text-white uppercase tracking-wider block mb-3">
                    Insignia Avatar
                  </span>

                  <div className="grid grid-cols-5 gap-2">
                    {avatarOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          haptics.uiTap();
                          setPlayerAvatar(emoji);
                        }}
                        className={`text-2xl p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                          playerAvatar === emoji
                            ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ONBOARDING TUTORIAL RESET */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-wider font-mono">
                      Shift Odyssey Quick-Start Guide
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Reset onboarding prompts to experience block timing fundamentals
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      haptics.uiTap();
                      resetCampaignTutorial();
                      setResetConfirmOpen(true);
                      setTimeout(() => setResetConfirmOpen(false), 2200);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 rounded-xl text-xs font-bold text-cyan-300 uppercase tracking-wider cursor-pointer transition-all shrink-0"
                  >
                    {resetConfirmOpen ? 'Reset Complete!' : 'Re-run Guide'}
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase tracking-widest font-mono text-[9px]">Settings Synchronized</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                haptics.uiTap();
                setSettingsModalOpen(false);
              }}
              className="px-5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Done
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile App Installation Guidance Dialog */}
        <AnimatePresence>
          {showIOSModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
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
                        <>Tap the <strong className="text-white">Share</strong> icon in your Safari navigation bar.</>
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
      </div>
    </AnimatePresence>
  );
}
