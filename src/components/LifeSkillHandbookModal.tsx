import React from 'react';
import { Award, BookOpen, CheckCircle, Shield, Sparkles, X, Share2, Copy } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { Language, MasteredSkillCard } from '../types/game';

interface LifeSkillHandbookModalProps {
  language: Language;
  skills: MasteredSkillCard[];
  playerScore: number;
  onClose: () => void;
}

export const LifeSkillHandbookModal: React.FC<LifeSkillHandbookModalProps> = ({
  language,
  skills,
  playerScore,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    sound.playSuccess();
    const text =
      language === 'hi'
        ? `🔥 मैंने Survival Hero 3D में कोडिंग, वित्तीय साक्षरता (50/30/20 नियम), CPR और अग्नि सुरक्षा सीखी! मेरा स्कोर: ${playerScore} XP`
        : `🔥 Mastered Coding, Financial Literacy (50/30/20 rule), CPR, and Fire Safety in Survival Hero 3D! Score: ${playerScore} XP`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-emerald-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Certificate Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  {language === 'hi' ? 'प्रमाणपत्र एवं हैंडबुक' : 'Official Dossier & Handbook'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white">
                {language === 'hi' ? 'लाइफ स्किल सर्वाइवल प्रमाण-पत्र' : 'Life Skills Mastery Certificate'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? (language === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : language === 'hi' ? 'कॉपी करें' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Hero Certificate Badge Box */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/50 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'hi' ? 'वेरीफाइड रियल-वर्ल्ड रेस्क्यू ऑपरेटर' : 'VERIFIED REAL-WORLD OPERATIVE'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {language === 'hi' ? 'अल्टीमेट लाइफ स्किल सर्वाइवर' : 'ULTIMATE LIFE-SKILLS HERO'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {language === 'hi'
                ? 'यह प्रमाणित करता है कि आपने कोडिंग लॉजिक, 50/30/20 बजट नियम, चक्रवृद्धि ब्याज, उच्च-प्रभाव वोकैबुलरी, 100-120 BPM CPR एवं P.A.S.S. अग्नि सुरक्षा में सफलता प्राप्त की है।'
                : 'Certified proficiency in Algorithmic Coding, 50/30/20 Wealth Budgeting, Compound Growth, Global Vocabulary, CPR Resuscitation, and P.A.S.S. Fire Protocol.'}
            </p>

            <div className="pt-2 flex items-center justify-center gap-6 font-mono text-xs text-slate-400">
              <div>
                {language === 'hi' ? 'कुल अर्जित अनुभव:' : 'Total Experience:'}{' '}
                <span className="text-amber-400 font-bold">{playerScore} XP</span>
              </div>
              <div>
                {language === 'hi' ? 'स्थिति:' : 'Status:'}{' '}
                <span className="text-emerald-400 font-bold">{language === 'hi' ? 'सक्रिय हीरो' : 'Active Hero'}</span>
              </div>
            </div>
          </div>

          {/* Real-World Quick Reference Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'जीवन में हमेशा याद रखने योग्य 6 नियम:' : '6 Rules to Remember for Real Life:'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: CPR */}
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <span>❤️ 1. Hands-Only CPR (हृदय रक्षा)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• {language === 'hi' ? 'छाती के बीच में 100-120 BPM की तेज गति से दबाएं।' : 'Compress center of chest at 100-120 BPM.'}</li>
                  <li>• {language === 'hi' ? '2 इंच गहरा दबाएं और छाती को पूरी तरह वापस आने दें।' : 'Push 2 inches deep and allow full chest recoil.'}</li>
                  <li>• {language === 'hi' ? 'तुरंत 112 / 108 डायल करें।' : 'Call 112 / 108 immediately.'}</li>
                </ul>
              </div>

              {/* Card 2: 50-30-20 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <span>💰 2. 50/30/20 Money Rule (धन प्रबंधन)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• {language === 'hi' ? '50% जरूरतें (मकान, राशन, जरूरी बिल)' : '50% Needs (Rent, Food, Healthcare)'}</li>
                  <li>• {language === 'hi' ? '30% इच्छाएं व मनोरंजन (घूमना, शौक)' : '30% Wants (Dining, Gadgets, Leisure)'}</li>
                  <li>• {language === 'hi' ? '20% बचत व निवेश (SIP, इंडेक्स फंड)' : '20% Savings (Emergency Fund, SIP, Gold)'}</li>
                </ul>
              </div>

              {/* Card 3: Coding */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <span>💻 3. Coding & Logic (कोडिंग सोच)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• {language === 'hi' ? 'लूप्स (Loops): एक काम बार-बार ऑटोमैटिक करना।' : 'Loops: Automating repetitive tasks efficiently.'}</li>
                  <li>• {language === 'hi' ? 'इफ/एल्स (If/Else): शर्तों के आधार पर सही निर्णय लेना।' : 'Conditionals: Decision-making based on live data.'}</li>
                  <li>• {language === 'hi' ? 'वेरिएबल्स (Variables): डेटा व वैल्यू सुरक्षित रखना।' : 'Variables: Storing values that evolve.'}</li>
                </ul>
              </div>

              {/* Card 4: PASS Fire */}
              <div className="p-4 rounded-xl bg-slate-950 border border-orange-500/30 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <span>🔥 4. P.A.S.S. Fire Protocol (अग्नि सुरक्षा)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• <strong>P</strong> - Pull safety pin (पिन खींचें)</li>
                  <li>• <strong>A</strong> - Aim at base of fire (आग की जड़ पर निशाना)</li>
                  <li>• <strong>S</strong> - Squeeze handle lever (लीवर दबाएं)</li>
                  <li>• <strong>S</strong> - Sweep side-to-side (दाएं-बाएं घुमाएं)</li>
                </ul>
              </div>

              {/* Card 5: Anti-Scam */}
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <span>🛡️ 5. Cyber & UPI Shield (ऑनलाइन सुरक्षा)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• {language === 'hi' ? 'पैसे पाने के लिए कभी UPI PIN या OTP न दें।' : 'NEVER enter UPI PIN to receive money.'}</li>
                  <li>• {language === 'hi' ? 'QR कोड स्कैन करने से सिर्फ पैसे कटते हैं।' : 'Scanning QR codes pays out; never receives.'}</li>
                  <li>• {language === 'hi' ? 'साइबर फ्रॉड हेल्पलाइन: 1930' : 'National Cyber Fraud Helpline: 1930'}</li>
                </ul>
              </div>

              {/* Card 6: Go-Bag */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span>🎒 6. 72-Hour Go-Bag (इमरजेंसी बैग)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• {language === 'hi' ? 'प्रति व्यक्ति 3 लीटर पानी + ORS पैकेट।' : '3L water per person + ORS electrolyte packs.'}</li>
                  <li>• {language === 'hi' ? 'टॉर्च, सीटी (मलबे में आवाज देने के लिए), पावर बैंक।' : 'Flashlight, signaling whistle, power bank.'}</li>
                  <li>• {language === 'hi' ? 'वाटरप्रूफ पाउच में आधार व जरूरी कैश।' : 'Waterproof pouch with IDs and emergency cash.'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {language === 'hi'
              ? '🎮 गेम खेलो, लेकिन ऐसा जिससे खुद का और समाज का भला हो!'
              : '🎮 Play games that empower your real-world mind and capability!'}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            {language === 'hi' ? 'गेम पर वापस जाएं' : 'Return to Game'}
          </button>
        </div>
      </div>
    </div>
  );
};
