import React from 'react';
import { Play, Sparkles, Terminal, DollarSign, Heart, Shield, Globe2, Award } from 'lucide-react';
import { Language } from '../types/game';

interface TitleScreenProps {
  language: Language;
  onStart: () => void;
  onToggleLanguage: () => void;
  onOpenHandbook: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  language,
  onStart,
  onToggleLanguage,
  onOpenHandbook,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 pointer-events-auto bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
      
      {/* Top Bar: Language & Cert preview */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider uppercase">
            ⚡ NEXT-GEN 3D ACTION & LIFE SKILLS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenHandbook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>{language === 'hi' ? 'स्किल हैंडबुक' : 'Skill Handbook'}</span>
          </button>

          <button
            onClick={onToggleLanguage}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
          >
            {language === 'hi' ? 'ENGLISH' : 'हिंदी'}
          </button>
        </div>
      </div>

      {/* Center: Bespoke SVG Title Lockup */}
      <div className="max-w-2xl space-y-4 my-auto">
        {/* Bespoke inline SVG Logo Lockup */}
        <div className="space-y-1">
          <svg className="w-full max-w-lg h-auto" viewBox="0 0 520 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <text x="0" y="42" fontFamily="sans-serif" fontWeight="900" fontSize="42" fill="url(#fireGrad)" letterSpacing="2">
              SURVIVAL HERO 3D
            </text>
            <text x="2" y="74" fontFamily="sans-serif" fontWeight="700" fontSize="18" fill="url(#glowGrad)" letterSpacing="5">
              REAL-WORLD LIFE SKILLS OPS
            </text>
          </svg>

          <div className="text-sm sm:text-base font-bold text-amber-300/95">
            {language === 'hi'
              ? 'फ्री फायर से बेहतर — जहां सिर्फ गोलियां नहीं, असली जिंदगी में काम आने वाले हुनर सीखते हैं!'
              : 'Beyond Battle Royale — Master real-world coding, money, CPR, and survival skills!'}
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { icon: Terminal, labelHi: 'कोडिंग लॉजिक व ड्रोन एल्गोरिदम', labelEn: 'Drone Coding & Logic' },
            { icon: DollarSign, labelHi: '50/30/20 धन प्रबंधन व कंपाउंड वेल्थ', labelEn: '50/30/20 Wealth & Budgeting' },
            { icon: Heart, labelHi: '100-120 BPM CPR जीवन रक्षा', labelEn: '100-120 BPM CPR First Aid' },
            { icon: Shield, labelHi: 'P.A.S.S. अग्नि सुरक्षा व 72h गो-बैग', labelEn: 'P.A.S.S. Fire & 72h Go-Bag' },
            { icon: Globe2, labelHi: 'करियर वोकैबुलरी व वार्तालाप', labelEn: 'Global Vocabulary & Career' },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-medium"
            >
              <f.icon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'hi' ? f.labelHi : f.labelEn}</span>
            </div>
          ))}
        </div>

        {/* Start CTA Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={onStart}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 shadow-2xl shadow-orange-500/40 active:scale-95 transition cursor-pointer tracking-wider"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{language === 'hi' ? 'मिशन शुरू करें (ENTER)' : 'START OPERATION (ENTER)'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Flat Control Hint Line */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-900">
        <div>
          WASD Move · Shift Sprint · E Interact / Radar · Esc Pause
        </div>
        <div className="text-amber-400/90 font-bold mt-2 sm:mt-0">
          {language === 'hi' ? '3D बैटलग्राउंड में घूमें और सभी 5 स्टेशन्स अनलॉक करें!' : 'Explore 3D crisis zones & unlock all 5 life skills!'}
        </div>
      </div>
    </div>
  );
};
