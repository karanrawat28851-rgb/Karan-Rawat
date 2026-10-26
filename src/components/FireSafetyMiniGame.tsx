import React, { useState } from 'react';
import { Flame, Shield, CheckCircle2, Award, AlertTriangle, X } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { Language } from '../types/game';

interface FireSafetyMiniGameProps {
  language: Language;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const FireSafetyMiniGame: React.FC<FireSafetyMiniGameProps> = ({ language, onComplete, onClose }) => {
  const [extinguisherType, setExtinguisherType] = useState<'WATER' | 'CO2' | null>(null);
  const [passStep, setPassStep] = useState<number>(0); // 0: Pull, 1: Aim, 2: Squeeze, 3: Sweep
  const [fireExtinguished, setFireExtinguished] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectExtinguisher = (type: 'WATER' | 'CO2') => {
    sound.playDash();
    if (type === 'WATER') {
      sound.playError();
      setErrorMsg(
        language === 'hi'
          ? 'खतरा! बिजली या रासायनिक आग पर पानी डालने से करंट लग सकता है! CO2 या ड्राई पाउडर चुनें।'
          : 'DANGER! Water conducts electricity! Never use water on electrical/chemical fires. Select CO2 or Dry Powder.'
      );
      setExtinguisherType(null);
    } else {
      setErrorMsg('');
      setExtinguisherType('CO2');
      sound.playScannerPing();
    }
  };

  const handlePassAction = (stepIndex: number) => {
    if (stepIndex === passStep) {
      sound.playExtinguisherSpray();
      if (stepIndex === 3) {
        sound.playSuccess();
        setFireExtinguished(true);
      } else {
        setPassStep(stepIndex + 1);
      }
    } else {
      sound.playError();
      setErrorMsg(
        language === 'hi'
          ? 'P.A.S.S. का सही क्रम अपनाएं: P (Pull) -> A (Aim) -> S (Squeeze) -> S (Sweep)'
          : 'Follow the P.A.S.S. order: Pull pin, Aim low, Squeeze trigger, Sweep side-to-side!'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-orange-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-950 border border-orange-800">
                  {language === 'hi' ? 'अग्नि सुरक्षा एवं रेस्क्यू' : 'Fire Rescue & Survival'}
                </span>
                <span className="text-xs text-slate-400">P.A.S.S. Protocol</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white">
                {language === 'hi' ? 'अग्निशामक और धुआं सुरक्षा ड्रिल' : 'Fire Extinguisher & Smoke Drill'}
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
          <div className="p-4 rounded-xl bg-orange-950/40 border border-orange-500/30 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-orange-300">
              {language === 'hi' ? '🔥 जीवन बचाने वाला नियम:' : '🔥 Critical Life-Saving Rule:'}
            </span>{' '}
            {language === 'hi'
              ? 'आग लगने पर कभी लिफ्ट का उपयोग न करें। धुआं जहरीला और गर्म होता है, इसलिए हमेशा फर्श के करीब झुककर रेंगें (Crawl Low)!'
              : 'Never use elevators in a fire. Stay low to the ground to crawl under toxic smoke (Stay Low & Go)!'}
          </div>

          {/* STEP 1: SELECT CORRECT EXTINGUISHER */}
          {!extinguisherType ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">
                {language === 'hi'
                  ? 'इलेक्ट्रिकल और केमिकल आग के लिए सही अग्निशामक चुनें:'
                  : 'Select the correct extinguisher for electrical & chemical fires:'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelectExtinguisher('WATER')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left space-y-1 transition cursor-pointer"
                >
                  <div className="font-bold text-blue-400">💧 Water Extinguisher (पानी)</div>
                  <div className="text-xs text-slate-400">Class A (Wood, Paper) only</div>
                </button>

                <button
                  onClick={() => handleSelectExtinguisher('CO2')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-orange-500/50 text-left space-y-1 transition cursor-pointer"
                >
                  <div className="font-bold text-orange-400">🧯 CO2 / Dry Chemical Powder (कार्बन डाईऑक्साइड)</div>
                  <div className="text-xs text-slate-400">Class B & C (Electrical & Flammable liquids)</div>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : !fireExtinguished ? (
            /* STEP 2: P.A.S.S. SEQUENCE */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-orange-400">
                <span>{language === 'hi' ? 'P.A.S.S. तकनीक अपनाएं:' : 'Execute P.A.S.S. Sequence:'}</span>
                <span>Step {passStep + 1} / 4</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    step: 0,
                    letter: 'P',
                    en: 'PULL the pin',
                    hi: 'पिन खींचें (PULL)',
                  },
                  {
                    step: 1,
                    letter: 'A',
                    en: 'AIM at fire base',
                    hi: 'बेस पर निशाना (AIM)',
                  },
                  {
                    step: 2,
                    letter: 'S',
                    en: 'SQUEEZE the lever',
                    hi: 'लीवर दबाएं (SQUEEZE)',
                  },
                  {
                    step: 3,
                    letter: 'S',
                    en: 'SWEEP side to side',
                    hi: 'दाएं-बाएं घुमाएं (SWEEP)',
                  },
                ].map((item) => {
                  const isDone = passStep > item.step;
                  const isCurrent = passStep === item.step;
                  return (
                    <button
                      key={item.step}
                      onClick={() => handlePassAction(item.step)}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isDone
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                          : isCurrent
                          ? 'bg-orange-950/70 border-orange-500 text-orange-200 animate-pulse'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="text-xl font-black">{item.letter}</span>
                      <span className="text-xs font-bold mt-2">
                        {language === 'hi' ? item.hi : item.en}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-emerald-300">
                {language === 'hi' ? 'आग पूरी तरह बुझ गई! क्षेत्र सुरक्षित है!' : 'Fire Extinguished! Area Secured!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {language === 'hi'
                  ? 'आपने P.A.S.S. प्रोटोकॉल सही क्रम में पूरा किया। वास्तविक आपातकाल में यह तकनीक आपको और आपके परिवार को सुरक्षित रखेगी!'
                  : 'You successfully practiced the P.A.S.S. protocol. These steps prevent smoke inhalation and put out residential/office fires safely!'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {language === 'hi' ? 'अग्निशामक नंबर: 101 / 112' : 'Fire Emergency: 101 / 112'}
          </div>

          {fireExtinguished && (
            <button
              onClick={() => onComplete(250)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-orange-500/20 active:scale-98 transition cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{language === 'hi' ? 'अग्नि रक्षक बैज प्राप्त करें (+250 XP)' : 'Claim Fire Guard Badge (+250 XP)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
