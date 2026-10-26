import React, { useState } from 'react';
import { Package, Check, Award, X, Sparkles, AlertCircle } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { Language } from '../types/game';

interface AirdropLootModalProps {
  language: Language;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const AirdropLootModal: React.FC<AirdropLootModalProps> = ({ language, onComplete, onClose }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [claimed, setClaimed] = useState(false);

  const ITEMS = [
    {
      id: 'water',
      titleEn: 'Drinking Water (3 Liters / Person / Day)',
      titleHi: 'पीने का पानी (3 लीटर / व्यक्ति / दिन)',
      isEssential: true,
      descEn: 'Prevents dehydration during search and rescue.',
      descHi: 'आपदा में डिहाइड्रेशन और प्यास से बचाता है।'
    },
    {
      id: 'firstaid',
      titleEn: 'First-Aid Medical Kit & Essential Meds',
      titleHi: 'प्राथमिक चिकित्सा किट और जरूरी दवाएं',
      isEssential: true,
      descEn: 'Bandages, antiseptic, painkillers, personal prescription.',
      descHi: 'बैंडेज, एंटीसेप्टिक, ओआरएस व नियमित दवाएं।'
    },
    {
      id: 'torch',
      titleEn: 'LED Flashlight & Power Bank with Cables',
      titleHi: 'टॉर्च, सीटी और पावर बैंक',
      isEssential: true,
      descEn: 'Whistle allows rescue teams to locate you under rubble.',
      descHi: 'सीटी की आवाज रेस्क्यू टीम को मलबे में भी सुनाई देती है।'
    },
    {
      id: 'luxury',
      titleEn: 'Heavy Video Game Console & Television',
      titleHi: 'भारी वीडियो गेम कंसोल या टीवी',
      isEssential: false,
      descEn: 'Dead weight! Slows down evacuation speed.',
      descHi: 'अनावश्यक भारी वजन! निकासी में देरी कराता है।'
    },
    {
      id: 'docs',
      titleEn: 'Waterproof Pouch with IDs & Emergency Cash',
      titleHi: 'वाटरप्रूफ पाउच में आधार कार्ड व कैश',
      isEssential: true,
      descEn: 'Digital systems fail during power outages.',
      descHi: 'आपदा में ऑनलाइन पेमेंट बंद होने पर नकद काम आता है।'
    }
  ];

  const handleToggle = (id: string) => {
    sound.playDash();
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleClaim = () => {
    sound.playSuccess();
    setClaimed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-emerald-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  {language === 'hi' ? 'महा-एयरड्रॉप क्रेट' : 'Legendary Airdrop Crate'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white">
                {language === 'hi' ? '72-घंटे का इमरजेंसी गो-बैग' : '72-Hour Survival Go-Bag'}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-emerald-300">
              {language === 'hi' ? '🎒 हर घर में गो-बैग क्यों होना चाहिए?' : '🎒 Why every home needs a Go-Bag:'}
            </span>{' '}
            {language === 'hi'
              ? 'भूकंप, बाढ़, तूफान या आग जैसी आपदा में सोचने का समय नहीं मिलता। 1 बैग ऐसा होना चाहिए जिसे उठाकर 10 सेकंड में घर से बाहर निकला जा सके।'
              : 'In natural disasters (floods, earthquakes), you have seconds to evacuate. A ready 72-hour Go-Bag keeps your family alive until help arrives.'}
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'hi' ? 'गो-बैग में रखने के लिए आवश्यक वस्तुएं चुनें:' : 'Select essential items for the Go-Bag:'}
            </span>

            {ITEMS.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold">{language === 'hi' ? item.titleHi : item.titleEn}</div>
                    <div className="text-xs text-slate-400">{language === 'hi' ? item.descHi : item.descEn}</div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {language === 'hi' ? 'परिवार की सुरक्षा सबसे पहला कर्तव्य है।' : 'Family preparedness is top priority.'}
          </div>

          <button
            onClick={() => {
              handleClaim();
              onComplete(200);
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-98 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'hi' ? 'एयरड्रॉप लूटें (+200 XP)' : 'Loot Airdrop (+200 XP)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
