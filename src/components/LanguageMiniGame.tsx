import React, { useState } from 'react';
import { Globe2, Volume2, CheckCircle2, Award, ArrowRight, Sparkles, X, BookOpen } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { Language } from '../types/game';

interface LanguageMiniGameProps {
  language: Language;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface VocabWord {
  id: number;
  word: string;
  phonetic: string;
  meaningHi: string;
  meaningEn: string;
  realWorldSentenceEn: string;
  realWorldSentenceHi: string;
  optionsHi: string[];
  optionsEn: string[];
  correctAnswerIdx: number;
}

const VOCAB_LIST: VocabWord[] = [
  {
    id: 1,
    word: 'Resilience',
    phonetic: '/rɪˈzɪl.jəns/',
    meaningHi: 'मुसीबतों और हार के बाद भी फिर से खड़े होने की मानसिक शक्ति (उत्साह)',
    meaningEn: 'The capacity to recover quickly from difficulties; toughness and bounce-back power.',
    realWorldSentenceEn: '"Her resilience helped her overcome poverty and build a thriving software company."',
    realWorldSentenceHi: '"उसकी रेज़ीलियंस (दृढ़ता) ने उसे गरीबी से निकालकर एक सफल सॉफ्टवेयर कंपनी बनाने में मदद की।"',
    optionsHi: ['कठिनाइयों के बाद भी उठ खड़े होने की शक्ति', 'आलस करना और काम टालना', 'जल्दी गुस्सा हो जाना'],
    optionsEn: ['The power to bounce back from hardship', 'Giving up on failure', 'Procrastinating tasks'],
    correctAnswerIdx: 0,
  },
  {
    id: 2,
    word: 'Negotiation',
    phonetic: '/nəˌɡoʊ.ʃiˈeɪ.ʃən/',
    meaningHi: 'दोनों पक्षों के फायदे के लिए समझदारी से बातचीत व सौदा तय करना',
    meaningEn: 'Discussion aimed at reaching an agreement, mutual compromise, or business deal.',
    realWorldSentenceEn: '"Good negotiation skills can increase your salary and lower your shopping costs."',
    realWorldSentenceHi: '"अच्छी नेगोसिएशन स्किल आपकी नौकरी में सैलरी बढ़ा सकती है और व्यापार में फायदा कराती है।"',
    optionsHi: ['झगड़ा और बहस करना', 'समझदारी से आपसी सहमति बनाना (सौदा)', 'बिना बात किए मान लेना'],
    optionsEn: ['Violent arguing', 'Reaching a mutually beneficial agreement', 'Blindly accepting terms'],
    correctAnswerIdx: 1,
  },
  {
    id: 3,
    word: 'Consistency',
    phonetic: '/kənˈsɪs.tən.si/',
    meaningHi: 'हर दिन बिना रुके नियम से लगातार प्रयास करना (निरंतरता)',
    meaningEn: 'Steadfast adherence to the same principles or actions day after day.',
    realWorldSentenceEn: '"Consistency is what transforms average talent into world-class genius."',
    realWorldSentenceHi: '"निरंतरता (कंसिस्टेंसी) ही एक साधारण व्यक्ति को दुनिया का सबसे सफल इंसान बनाती है।"',
    optionsHi: ['एक दिन जोश दिखाना फिर छोड़ देना', 'रोजाना लगातार नियम से मेहनत करना', 'दूसरों की नकल करना'],
    optionsEn: ['Giving burst effort once then stopping', 'Regular and steadfast daily effort', 'Copying others'],
    correctAnswerIdx: 1,
  },
  {
    id: 4,
    word: 'Empathy',
    phonetic: '/ˈem.pə.θi/',
    meaningHi: 'दूसरों के दर्द और भावनाओं को उनके नजरिए से गहराई से महसूस करना',
    meaningEn: 'The ability to understand and share the feelings of another person.',
    realWorldSentenceEn: '"True leaders listen with empathy before giving commands."',
    realWorldSentenceHi: '"सच्चा लीडर हुक्म चलाने से पहले दूसरों की तकलीफ को सहानुभूति (एम्पथी) से समझता है।"',
    optionsHi: ['दूसरों के दुख और भावना को दिल से समझना', 'दूसरों का मजाक उड़ाना', 'सिर्फ अपना फायदा देखना'],
    optionsEn: ['Deeply feeling and understanding others', 'Mocking other people', 'Thinking only of oneself'],
    correctAnswerIdx: 0,
  }
];

export const LanguageMiniGame: React.FC<LanguageMiniGameProps> = ({ language, onComplete, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const current = VOCAB_LIST[currentIdx];

  const handleSpeak = (text: string) => {
    sound.playScannerPing();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === current.correctAnswerIdx) {
      sound.playSuccess();
      setScore((prev) => prev + 100);
    } else {
      sound.playError();
    }
  };

  const handleNext = () => {
    if (currentIdx < VOCAB_LIST.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete(score + 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-purple-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
                  {language === 'hi' ? 'वैश्विक भाषा एवं वोकैबुलरी' : 'Global Vocabulary Mastery'}
                </span>
                <span className="text-xs text-slate-400">
                  Word {currentIdx + 1} / {VOCAB_LIST.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white">
                {language === 'hi' ? 'हाई-इम्पैक्ट अंग्रेजी शब्द' : 'High-Impact Career Words'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400">{language === 'hi' ? 'स्कोर' : 'Score'}</span>
              <span className="text-lg font-black text-purple-400 font-mono">{score} XP</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Word Card */}
          <div className="bg-gradient-to-r from-purple-950/70 to-slate-950 p-6 rounded-2xl border border-purple-500/40 text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-purple-300 tracking-wider">
                {current.word}
              </h1>
              <button
                onClick={() => handleSpeak(current.word)}
                className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 transition cursor-pointer"
                title={language === 'hi' ? 'उच्चारण सुनें' : 'Listen pronunciation'}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="font-mono text-sm text-purple-400/80">{current.phonetic}</p>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'नीचे दिए गए विकल्पों में से इसका सही अर्थ चुनें:'
                : 'Choose the correct meaning below:'}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {(language === 'hi' ? current.optionsHi : current.optionsEn).map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === current.correctAnswerIdx;
              let style = 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200';

              if (isAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-rose-950/80 border-rose-500 text-rose-200';
                } else {
                  style = 'bg-slate-900 border-slate-800 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left text-sm sm:text-base transition cursor-pointer flex items-center justify-between ${style}`}
                >
                  <span>
                    <span className="font-mono text-slate-400 mr-3">{idx + 1}.</span>
                    {opt}
                  </span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Real-World Usage Example Box */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>{language === 'hi' ? 'असली जिंदगी में वाक्य प्रयोग:' : 'Real-Life Sentence Usage:'}</span>
              </div>
              <p className="text-sm text-slate-200 italic font-serif">
                {current.realWorldSentenceEn}
              </p>
              {language === 'hi' && (
                <p className="text-xs text-slate-400">
                  {current.realWorldSentenceHi}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {language === 'hi'
              ? '💡 नई भाषा के शब्द सीखने से आत्मविश्वास और करियर के अवसर खुलते हैं!'
              : '💡 Expanding global vocabulary unlocks higher career & social opportunities!'}
          </div>

          {isAnswered && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 active:scale-98 transition cursor-pointer"
            >
              {currentIdx < VOCAB_LIST.length - 1 ? (
                <>
                  <span>{language === 'hi' ? 'अगला शब्द' : 'Next Word'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>{language === 'hi' ? 'रिवॉर्ड प्राप्त करें' : 'Complete Module'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
