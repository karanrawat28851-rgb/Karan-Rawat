import React, { useState } from 'react';
import { DollarSign, ShieldAlert, TrendingUp, CheckCircle, AlertTriangle, ArrowRight, Award, X, Sparkles } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { Language } from '../types/game';

interface FinanceMiniGameProps {
  language: Language;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const FinanceMiniGame: React.FC<FinanceMiniGameProps> = ({ language, onComplete, onClose }) => {
  const [activeTab, setActiveTab] = useState<'BUDGET' | 'COMPOUND' | 'SCAM'>('BUDGET');

  // Budget Module State
  const [needs, setNeeds] = useState(50);
  const [wants, setWants] = useState(30);
  const [savings, setSavings] = useState(20);
  const [budgetSuccess, setBudgetSuccess] = useState(false);

  // Compound Interest Module State
  const [monthlySIP, setMonthlySIP] = useState(2000);
  const [years, setYears] = useState(15);
  const rate = 12; // 12% historical mutual fund index rate

  // Scam Detector State
  const [scamScore, setScamScore] = useState(0);
  const [currentScamIdx, setCurrentScamIdx] = useState(0);
  const [answeredScams, setAnsweredScams] = useState<Record<number, boolean>>({});

  const SCAM_QUESTIONS = [
    {
      id: 1,
      senderEn: 'SMS: Win ₹25,000 Lottery!',
      senderHi: 'मैसेज: आपने ₹25,000 की लॉटरी जीती!',
      msgEn: 'Click here and enter your UPI PIN to receive money in your bank account.',
      msgHi: 'अपने बैंक खाते में पैसे पाने के लिए इस लिंक पर क्लिक करें और अपना UPI PIN डालें।',
      isScam: true,
      explanationEn: 'SCAM! You NEVER enter a UPI PIN to receive money. UPI PIN is ONLY entered when you SEND money.',
      explanationHi: 'फ्रॉड है! पैसे प्राप्त करने (Receive) के लिए कभी UPI पिन नहीं डाला जाता। पिन सिर्फ पैसे भेजने (Send) के लिए होता है।'
    },
    {
      id: 2,
      senderEn: 'Buyer on OLX/Marketplace',
      senderHi: 'OLX पर सामान खरीदने वाला ग्राहक',
      msgEn: 'I am sending a QR code on WhatsApp. Scan it to receive advance payment.',
      msgHi: 'मैं व्हाट्सएप पर QR कोड भेज रहा हूँ। एडवांस पेमेंट पाने के लिए इसे स्कैन करें।',
      isScam: true,
      explanationEn: 'SCAM! Scanning a QR code always DEDUCTS money from your account, it never deposits money into it.',
      explanationHi: 'फ्रॉड है! QR कोड स्कैन करने से आपके खाते से पैसे कटते हैं, पैसे कभी आते नहीं हैं।'
    },
    {
      id: 3,
      senderEn: 'Official Bank Alert',
      senderHi: 'आधिकारिक बैंक संदेश',
      msgEn: 'Your monthly statement is ready on our verified official app netbanking portal.',
      msgHi: 'आपका मासिक बैंक स्टेटमेंट वेरीफाइड बैंक ऐप पर उपलब्ध है।',
      isScam: false,
      explanationEn: 'SAFE: Official updates directing you to the genuine official app without asking for OTP or passwords.',
      explanationHi: 'सुरक्षित: बिना OTP या पासवर्ड मांगे आधिकारिक ऐप पर स्टेटमेंट देखने का सामान्य अलर्ट।'
    }
  ];

  // Compound Interest Calculation
  // FV = P * [((1 + r/n)^(nt) - 1) / (r/n)] * (1 + r/n)
  const calculateSIP = (p: number, y: number, r: number) => {
    const monthlyRate = r / 12 / 100;
    const months = y * 12;
    const totalInvested = p * months;
    const futureValue = p * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const wealthGain = futureValue - totalInvested;
    return {
      invested: Math.round(totalInvested),
      futureValue: Math.round(futureValue),
      wealthGain: Math.round(wealthGain),
    };
  };

  const sipResult = calculateSIP(monthlySIP, years, rate);

  const handleBudgetCheck = () => {
    if (needs === 50 && wants === 30 && savings === 20) {
      sound.playSuccess();
      setBudgetSuccess(true);
    } else {
      sound.playError();
    }
  };

  const handleScamAnswer = (guessedScam: boolean) => {
    const current = SCAM_QUESTIONS[currentScamIdx];
    const isCorrect = guessedScam === current.isScam;
    if (isCorrect) {
      sound.playSuccess();
      setScamScore((prev) => prev + 100);
    } else {
      sound.playError();
    }
    setAnsweredScams({ ...answeredScams, [currentScamIdx]: isCorrect });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                  {language === 'hi' ? 'वित्तीय साक्षरता एवं धन प्रबंधन' : 'Financial Literacy & Wealth Skills'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white">
                {language === 'hi' ? 'स्मार्ट मनी मास्टरक्लास' : 'Smart Money & Wealth Masterclass'}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 gap-2 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('BUDGET')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'BUDGET'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{language === 'hi' ? '1. 50/30/20 बजट नियम' : '1. 50/30/20 Budget Rule'}</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPOUND')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'COMPOUND'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'hi' ? '2. चक्रवृद्धि ब्याज की शक्ति' : '2. Compound Interest'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SCAM')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'SCAM'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{language === 'hi' ? '3. फ्रॉड और स्कैम शील्ड' : '3. Anti-Scam Shield'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: 50-30-20 RULE */}
          {activeTab === 'BUDGET' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="font-bold text-amber-300">
                  {language === 'hi' ? '💡 विश्वप्रसिद्ध 50-30-20 बजट नियम क्या है?' : '💡 The Universal 50-30-20 Rule:'}
                </span>{' '}
                {language === 'hi'
                  ? 'अपनी कमाई का 50% बुनियादी जरूरतों (Needs) पर, 30% शौक या इच्छाओं (Wants) पर, और कम से कम 20% भविष्य की बचत और निवेश (Savings/Investment) में लगाना चाहिए ताकि कभी कर्ज के जाल में न फंसें।'
                  : 'Allocate 50% to Needs (Rent, Food, Bills), 30% to Wants (Entertainment, Outings), and 20% to Savings & Investments (Emergency Fund, SIP).'}
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-amber-400">
                  {language === 'hi' ? 'स्लाइडर्स को सही 50/30/20 अनुपात में सेट करें:' : 'Align sliders to the 50/30/20 ratio:'}
                </h3>

                {/* Needs Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-blue-400">
                      {language === 'hi' ? 'जरूरतें (Needs - मकान, राशन, बिल):' : 'Needs (Rent, Groceries, Bills):'}
                    </span>
                    <span className="font-mono text-blue-300">{needs}% (Target: 50%)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={needs}
                    onChange={(e) => {
                      setNeeds(Number(e.target.value));
                      setBudgetSuccess(false);
                    }}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Wants Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-purple-400">
                      {language === 'hi' ? 'शौक व लाइफस्टाइल (Wants - घूमना, पार्टी):' : 'Wants (Entertainment, Dining):'}
                    </span>
                    <span className="font-mono text-purple-300">{wants}% (Target: 30%)</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={wants}
                    onChange={(e) => {
                      setWants(Number(e.target.value));
                      setBudgetSuccess(false);
                    }}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Savings Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400">
                      {language === 'hi' ? 'बचत व निवेश (Savings - SIP, इमरजेंसी फंड):' : 'Savings & SIP (Wealth building):'}
                    </span>
                    <span className="font-mono text-emerald-300">{savings}% (Target: 20%)</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={savings}
                    onChange={(e) => {
                      setSavings(Number(e.target.value));
                      setBudgetSuccess(false);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {language === 'hi' ? 'कुल योग:' : 'Total Sum:'}{' '}
                    <span className={`font-mono font-bold ${needs + wants + savings === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {needs + wants + savings}%
                    </span>
                  </div>

                  <button
                    onClick={handleBudgetCheck}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer transition"
                  >
                    {language === 'hi' ? 'बजट चेक करें' : 'Verify Allocation'}
                  </button>
                </div>

                {budgetSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      {language === 'hi'
                        ? 'शानदार! आपने 50-30-20 का परफेक्ट बैलेंस बना लिया। आप जीवन में कभी आर्थिक संकट में नहीं फंसेंगे!'
                        : 'Perfect! 50% Needs, 30% Wants, 20% Investments ensures lifelong financial freedom!'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMPOUND INTEREST */}
          {activeTab === 'COMPOUND' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="font-bold text-emerald-300">
                  {language === 'hi' ? '✨ अल्बर्ट आइंस्टीन ने कहा था:' : '✨ The 8th Wonder of the World:'}
                </span>{' '}
                {language === 'hi'
                  ? '"चक्रवृद्धि ब्याज (Compound Interest) दुनिया का आठवां अजूबा है।" छोटी बचत समय के साथ करोड़ों में कैसे बदलती है, खुद देखकर अनुभव करें!'
                  : '"Compound interest is the eighth wonder of the world. He who understands it, earns it; he who does not, pays it."'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">
                        {language === 'hi' ? 'प्रति माह निवेश (Monthly SIP):' : 'Monthly SIP Deposit:'}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">₹{monthlySIP.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="20000"
                      step="500"
                      value={monthlySIP}
                      onChange={(e) => setMonthlySIP(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{language === 'hi' ? 'समय अवधि (Years):' : 'Duration (Years):'}</span>
                      <span className="font-mono text-emerald-400 font-bold">{years} {language === 'hi' ? 'वर्ष' : 'Years'}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="text-xs text-slate-400 italic">
                    {language === 'hi'
                      ? '* अनुमानित वार्षिक रिटर्न 12% (Nifty 50 इंडेक्स फंड का औसत रिटर्न)'
                      : '* Estimated at 12% annual long-term market index return'}
                  </div>
                </div>

                {/* Wealth Outcome Card */}
                <div className="bg-gradient-to-br from-slate-950 to-emerald-950/60 p-5 rounded-xl border border-emerald-500/40 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      {language === 'hi' ? 'भविष्य का कुल धन (Total Wealth)' : 'Estimated Portfolio Value'}
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono">
                      ₹{sipResult.futureValue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span>{language === 'hi' ? 'आपकी कुल जमा पूंजी:' : 'Total Money Deposited:'}</span>
                        <span className="font-mono font-semibold">₹{sipResult.invested.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-amber-300 font-semibold">
                        <span>{language === 'hi' ? 'चक्रवृद्धि ब्याज से कमाया:' : 'Wealth Gained from Compounding:'}</span>
                        <span className="font-mono">₹{sipResult.wealthGain.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-900/30 border border-emerald-600/30 text-xs text-emerald-200 mt-4">
                    🎯{' '}
                    {language === 'hi'
                      ? 'जितनी जल्दी आप 18-20 साल की उम्र में ₹1000/महीना भी शुरू करेंगे, 35-40 की उम्र तक आप करोड़पति बन सकते हैं!'
                      : 'Starting early with even ₹1,000/mo lets compounding work for decades, building massive financial security!'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCAM SHIELD */}
          {activeTab === 'SCAM' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="font-bold text-rose-300">
                  {language === 'hi' ? '🛡️ भारत में हर दिन हजारों लोग ऑनलाइन ठगी के शिकार होते हैं!' : '🛡️ Daily Online Financial Scams:'}
                </span>{' '}
                {language === 'hi'
                  ? 'नीचे दिए गए मैसेजेस को देखें और बताएं कि यह फ्रॉड (SCAM) है या असली सुरक्षित संदेश!'
                  : 'Inspect incoming alerts and detect fraudulent scams to protect your bank account!'}
              </div>

              {/* Current Scam Card */}
              {SCAM_QUESTIONS.map((scam, idx) => {
                const isAnswered = answeredScams[idx] !== undefined;
                return (
                  <div
                    key={scam.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">
                        {language === 'hi' ? scam.senderHi : scam.senderEn}
                      </span>
                      {isAnswered && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-bold ${
                            answeredScams[idx]
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                              : 'bg-rose-950 text-rose-300 border border-rose-600'
                          }`}
                        >
                          {answeredScams[idx]
                            ? language === 'hi'
                              ? 'सही पहचान!'
                              : 'Correct!'
                            : language === 'hi'
                            ? 'गलत उत्तर'
                            : 'Wrong'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      "{language === 'hi' ? scam.msgHi : scam.msgEn}"
                    </p>

                    {!isAnswered ? (
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => {
                            setCurrentScamIdx(idx);
                            handleScamAnswer(true);
                          }}
                          className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>{language === 'hi' ? 'यह फ्रॉड (SCAM) है!' : 'This is a SCAM!'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentScamIdx(idx);
                            handleScamAnswer(false);
                          }}
                          className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{language === 'hi' ? 'यह सुरक्षित है' : 'Safe message'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300">
                        📌 {language === 'hi' ? scam.explanationHi : scam.explanationEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {language === 'hi'
              ? '💡 वित्तीय समझदारी ही आपको असली जीवन में सफल बनाती है!'
              : '💡 Financial wisdom is the ultimate real-life superpower!'}
          </div>

          <button
            onClick={() => onComplete(300)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-98 transition cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>{language === 'hi' ? 'स्किल पूरी करें (+300 XP)' : 'Claim Mastery (+300 XP)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
