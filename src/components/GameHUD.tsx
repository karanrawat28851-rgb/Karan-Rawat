import React, { useState } from 'react';
import {
  Heart,
  Zap,
  Volume2,
  VolumeX,
  Compass,
  Award,
  ChevronDown,
  ChevronUp,
  Terminal,
  DollarSign,
  Globe2,
  Flame,
  Package,
  Radio,
  Sparkles
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { InteractiveStation, Language, PlayerStats } from '../types/game';

interface GameHUDProps {
  stats: PlayerStats;
  language: Language;
  onToggleLanguage: () => void;
  onOpenStation: (stationType: string) => void;
  onOpenHandbook: () => void;
  onTriggerScanner: () => void;
  nearestStation: InteractiveStation | null;
  onTeleportToStation: (type: string) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  language,
  onToggleLanguage,
  onOpenStation,
  onOpenHandbook,
  onTriggerScanner,
  nearestStation,
  onTeleportToStation,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-3 sm:p-5">
      
      {/* --- TOP CLUSTERS --- */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Player Stats Cluster */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/85 border border-cyan-500/30 rounded-2xl p-3 shadow-xl">
          {/* Avatar Icon */}
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center border-2 border-cyan-400/50 shadow-md">
            <span className="font-black text-white text-base">H1</span>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-slate-900">
              Lv.{stats.level}
            </div>
          </div>

          {/* Health & XP Meters */}
          <div className="space-y-1.5 w-36 sm:w-48">
            {/* HP */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1 text-rose-400">
                  <Heart className="w-3 h-3 fill-current" /> HP
                </span>
                <span className="text-slate-300 tabular-nums">{Math.round(stats.health)} / {stats.maxHealth}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-200"
                  style={{ width: `${Math.max(0, (stats.health / stats.maxHealth) * 100)}%` }}
                />
              </div>
            </div>

            {/* Score & Coins */}
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {stats.score} XP
              </span>
              <span className="text-cyan-300 font-semibold">
                {language === 'hi' ? 'सीखे कौशल:' : 'Skills:'} {stats.skillsLearnedCount}/5
              </span>
            </div>
          </div>
        </div>

        {/* Top-Center: Hazard Safe Zone Circle Info */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-slate-950/85 border border-blue-500/40 px-4 py-2 rounded-xl shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <div className="text-xs font-mono">
            <span className="text-slate-400">{language === 'hi' ? 'सेफ ज़ोन व्यास:' : 'Safe Zone Radius:'} </span>
            <span className="text-blue-400 font-bold tabular-nums">{Math.round(stats.activeZoneRadius)}m</span>
          </div>
        </div>

        {/* Top-Right: Quick Utilities (Handbook, Language, Audio) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Life Skill Handbook Button */}
          <button
            onClick={onOpenHandbook}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95"
          >
            <Award className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">
              {language === 'hi' ? 'सर्टिफिकेट व हैंडबुक' : 'Skill Certificate'}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 transition cursor-pointer active:scale-95"
            title="Switch Language"
          >
            {language === 'hi' ? 'ENGLISH' : 'हिंदी'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition cursor-pointer active:scale-95"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* --- FLOATING INTERACTION BANNER (Appears when near any station) --- */}
      {nearestStation && (
        <div className="pointer-events-auto mx-auto max-w-lg w-full animate-bounce">
          <button
            onClick={() => onOpenStation(nearestStation.type)}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-2xl shadow-orange-500/40 border-2 border-white/60 flex items-center justify-between transition cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-black text-white font-mono text-xs">
                [E]
              </span>
              <span>{language === 'hi' ? nearestStation.hintHi : nearestStation.hintEn}</span>
            </div>
            <span className="text-xs font-bold bg-white/30 px-2 py-1 rounded">
              {language === 'hi' ? 'शुरू करें' : 'ENTER'}
            </span>
          </button>
        </div>
      )}

      {/* --- BOTTOM CONTROL DOCK (Collapsible, Zero Viewport Occlusion) --- */}
      <div className="pointer-events-auto mx-auto w-full max-w-3xl flex flex-col items-center">
        {/* Collapse / Expand Tab */}
        <button
          onClick={() => setDockCollapsed(!dockCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1 rounded-t-xl bg-slate-950/90 border-t border-x border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'कंट्रोल डॉक खोलें' : 'Show Controls'}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'डॉक छुपाएं' : 'Hide Controls'}</span>
            </>
          )}
        </button>

        {/* Main Dock Body */}
        {!dockCollapsed && (
          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl space-y-3">
            {/* Quick Stations Row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { type: 'CODING_LAB', labelHi: 'कोडिंग', labelEn: 'Coding', icon: Terminal, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
                { type: 'FINANCE_VAULT', labelHi: 'फाइनेंस', labelEn: 'Finance', icon: DollarSign, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
                { type: 'LANGUAGE_TOWER', labelHi: 'भाषा', labelEn: 'Vocab', icon: Globe2, color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
                { type: 'CPR_STATION', labelHi: 'CPR रक्षा', labelEn: 'CPR First Aid', icon: Heart, color: 'text-rose-400 border-rose-500/40 bg-rose-950/40' },
                { type: 'FIRE_HAZARD', labelHi: 'आग सुरक्षा', labelEn: 'Fire PASS', icon: Flame, color: 'text-orange-400 border-orange-500/40 bg-orange-950/40' },
                { type: 'AIRDROP_CRATE', labelHi: 'एयरड्रॉप', labelEn: 'Go-Bag', icon: Package, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => onTeleportToStation(item.type)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer hover:scale-105 active:scale-95 ${item.color}`}
                  title={language === 'hi' ? 'इस स्टेशन पर जाएं' : 'Navigate to station'}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold">
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>
                </button>
              ))}
            </div>

            {/* Flat control-hints line */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-semibold">[WASD]</span> Move ·{' '}
                <span className="text-slate-300 font-semibold">[Shift]</span> Sprint ·{' '}
                <span className="text-slate-300 font-semibold">[E]</span> Action
              </div>

              <button
                onClick={onTriggerScanner}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'स्कैनर पल्स [E]' : 'Radar Ping [E]'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
