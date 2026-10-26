import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, CheckCircle2, Award, Zap, X } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { Language } from '../types/game';

interface CprMiniGameProps {
  language: Language;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const CprMiniGame: React.FC<CprMiniGameProps> = ({ language, onComplete, onClose }) => {
  const [phase, setPhase] = useState<'RHYTHM' | 'AED' | 'SUCCESS'>('RHYTHM');
  const [compressions, setCompressions] = useState(0);
  const [bpm, setBpm] = useState(110);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [aedPadsPlaced, setAedPadsPlaced] = useState<{ pad1: boolean; pad2: boolean }>({ pad1: false, pad2: false });
  const [heartScale, setHeartScale] = useState(1);
  const pulseIntervalRef = useRef<number | null>(null);

  // Play periodic heartbeat metronome (105-115 BPM)
  useEffect(() => {
    if (phase === 'RHYTHM') {
      const intervalMs = Math.round(60000 / bpm);
      pulseIntervalRef.current = window.setInterval(() => {
        setHeartScale(1.25);
        sound.playHeartbeat(1);
        setTimeout(() => setHeartScale(1), 120);
      }, intervalMs);
    }
    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    };
  }, [phase, bpm]);

  const handleCompress = () => {
    const now = performance.now();
    sound.playDash();

    if (lastTapTime > 0) {
      const diffMs = now - lastTapTime;
      const calculatedBpm = Math.round(60000 / diffMs);
      if (calculatedBpm >= 95 && calculatedBpm <= 135) {
        setFeedback(language === 'hi' ? 'शानदार रिदम! (100-120 BPM)' : 'Perfect Rhythm! (100-120 BPM)');
        setCompressions((prev) => {
          const next = prev + 1;
          if (next >= 15) {
            sound.playSuccess();
            setPhase('AED');
          }
          return next;
        });
      } else if (calculatedBpm < 95) {
        setFeedback(language === 'hi' ? 'थोड़ा तेज़ दबाएं!' : 'Push Faster! (Aim for 100-120 BPM)');
      } else {
        setFeedback(language === 'hi' ? 'बहुत तेज़! स्थिर गति रखें।' : 'Too fast! Maintain steady rhythm.');
      }
    } else {
      setCompressions(1);
    }
    setLastTapTime(now);
  };

  const handlePlacePad = (padNumber: 1 | 2) => {
    sound.playScannerPing();
    const next = { ...aedPadsPlaced, [`pad${padNumber}`]: true };
    setAedPadsPlaced(next);
    if (next.pad1 && next.pad2) {
      sound.playSuccess();
      setTimeout(() => {
        setPhase('SUCCESS');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-rose-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <Heart className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
                  {language === 'hi' ? 'आपातकालीन जीवन रक्षा' : 'Emergency Life Support'}
                </span>
                <span className="text-xs text-slate-400">112 / 108 Protocol</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white">
                {language === 'hi' ? 'हैंड्स-ओनली CPR एवं AED ड्रिल' : 'Hands-Only CPR & AED Defibrillation'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {phase === 'RHYTHM' && (
            <div className="space-y-5 text-center">
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs sm:text-sm text-slate-300 leading-relaxed text-left">
                <span className="font-bold text-rose-300">
                  {language === 'hi' ? '❤️ जीवन बचाने वाला नियम:' : '❤️ Life Saving Golden Rule:'}
                </span>{' '}
                {language === 'hi'
                  ? 'हृदय गति रुकने पर हर मिनट महत्वपूर्ण है। छाती के बीच में 100-120 बार प्रति मिनट की गति से 2 इंच गहरा दबाएं (गाने "Stayin Alive" या "दम मारो दम" की बीट पर)।'
                  : 'Compress the center of the chest hard & fast at 100-120 BPM, 2 inches deep. Do not stop until help or an AED arrives.'}
              </div>

              {/* Beating Heart Visualizer */}
              <div className="py-4 flex flex-col items-center justify-center">
                <div
                  style={{ transform: `scale(${heartScale})` }}
                  className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-600/40 transition-transform duration-100"
                >
                  <Heart className="w-16 h-16 text-white fill-current" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-rose-400 font-mono text-sm font-bold">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span>TARGET METRONOME: 110 BPM</span>
                </div>
                {feedback && (
                  <div className="mt-2 text-xs font-bold text-amber-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    {feedback}
                  </div>
                )}
              </div>

              {/* Progress counter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{language === 'hi' ? 'कंप्रेशन्स' : 'Compressions Done'}</span>
                  <span className="text-rose-400 font-bold">{compressions} / 15</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 transition-all duration-150"
                    style={{ width: `${Math.min(100, (compressions / 15) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Massive Interactive Chest Compression Button */}
              <button
                onClick={handleCompress}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-black text-lg tracking-wider shadow-xl shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-3"
              >
                <Heart className="w-6 h-6 fill-current" />
                <span>{language === 'hi' ? 'छाती पर दबाव डालें (PUSH HERE)' : 'PUSH CHEST (PUSH HERE)'}</span>
              </button>
            </div>
          )}

          {phase === 'AED' && (
            <div className="space-y-5 text-center">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs sm:text-sm text-slate-300 leading-relaxed text-left">
                <span className="font-bold text-amber-300">
                  {language === 'hi' ? '⚡ AED (ऑटोमेटेड एक्सटर्नल डिफिब्रिलेटर) आ गया है!' : '⚡ AED Has Arrived!'}
                </span>{' '}
                {language === 'hi'
                  ? 'AED पैड्स को मरीज के शरीर पर सही 2 स्थानों पर चिपकाएं: दायां ऊपरी सीना (कॉलरबोन के नीचे) और बायां निचला सीना (पसलियों पर)।'
                  : 'Place the two adhesive AED pads: Pad 1 on Upper Right Chest, Pad 2 on Lower Left Ribcage.'}
              </div>

              {/* Human Torso Diagram for Pad Placement */}
              <div className="relative mx-auto w-64 h-72 bg-slate-950 border-2 border-slate-700 rounded-3xl p-4 flex flex-col items-center justify-center">
                {/* Pad 1: Upper Right */}
                <button
                  onClick={() => handlePlacePad(1)}
                  disabled={aedPadsPlaced.pad1}
                  className={`absolute top-10 right-8 px-3 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    aedPadsPlaced.pad1
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-rose-900/60 border-rose-500 text-rose-200 hover:bg-rose-800 animate-bounce'
                  }`}
                >
                  {aedPadsPlaced.pad1 ? '✓ Pad 1 Placed' : '⚡ Click to Place Pad 1 (Upper Right)'}
                </button>

                {/* Pad 2: Lower Left */}
                <button
                  onClick={() => handlePlacePad(2)}
                  disabled={aedPadsPlaced.pad2}
                  className={`absolute bottom-12 left-6 px-3 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    aedPadsPlaced.pad2
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-rose-900/60 border-rose-500 text-rose-200 hover:bg-rose-800 animate-bounce'
                  }`}
                >
                  {aedPadsPlaced.pad2 ? '✓ Pad 2 Placed' : '⚡ Click to Place Pad 2 (Lower Left)'}
                </button>

                <div className="text-slate-600 font-mono text-xs text-center pointer-events-none">
                  PATIENT TORSO DIAGRAM
                </div>
              </div>
            </div>
          )}

          {phase === 'SUCCESS' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-emerald-300">
                {language === 'hi' ? 'हार्टबीट रीस्टोर हो गई! मरीज बच गया!' : 'Normal Heart Rhythm Restored! Patient Saved!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {language === 'hi'
                  ? 'आपने सही 100-120 BPM CPR और AED प्लेसमेंट पूरा किया। वास्तविक जीवन में आपकी यह सीख किसी की जान बचा सकती है!'
                  : 'You mastered high-quality Hands-Only CPR and AED pad positioning. You are now prepared to save a life in the real world!'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {language === 'hi' ? 'आपातकाल में तुरंत 112 / 108 डायल करें।' : 'Always dial 112 / 108 first in emergency.'}
          </div>

          {phase === 'SUCCESS' && (
            <button
              onClick={() => onComplete(300)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-98 transition cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{language === 'hi' ? 'जीवन रक्षक बैज प्राप्त करें (+300 XP)' : 'Claim Life Saver Badge (+300 XP)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
