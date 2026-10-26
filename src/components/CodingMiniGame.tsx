import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, CheckCircle2, Award, ArrowRight, Lightbulb, X } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { Language } from '../types/game';

interface CodingMiniGameProps {
  language: Language;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Puzzle {
  id: number;
  titleEn: string;
  titleHi: string;
  missionEn: string;
  missionHi: string;
  conceptEn: string;
  conceptHi: string;
  realWorldImpactEn: string;
  realWorldImpactHi: string;
  availableBlocks: string[];
  correctOrder: string[];
  explanationEn: string;
  explanationHi: string;
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    titleEn: 'Mission 1: Automated Drone Loop (लूप्स और सीक्वेंस)',
    titleHi: 'मिशन 1: स्वचालित ड्रोन लूप (Loops & Logic)',
    missionEn: 'Arrange the code blocks so the rescue drone flies 3 times forward and delivers aid.',
    missionHi: 'कोड ब्लॉक्स को सही क्रम में लगाएं ताकि ड्रोन 3 बार आगे जाकर मेडिकल किट गिरा सके।',
    conceptEn: 'LOOPS: Instead of writing the same line 100 times, programmers use a "repeat/for loop" to save time and computer memory.',
    conceptHi: 'लूप्स (Loops): एक ही काम को 100 बार लिखने के बजाय "repeat loop" का उपयोग किया जाता है ताकि काम ऑटोमैटिक हो सके।',
    realWorldImpactEn: 'Used in autonomous drones, self-driving cars (Tesla), and web applications!',
    realWorldImpactHi: 'यह लॉजिक ऑटोनोमस ड्रोन, डिलीवरी ऐप्स (Zomato/Swiggy) और सॉफ्टवेयर ऑटोमेशन में काम आता है!',
    availableBlocks: ['drone.deliverAid();', 'repeat (3) {', 'drone.moveForward();', '}'],
    correctOrder: ['repeat (3) {', 'drone.moveForward();', '}', 'drone.deliverAid();'],
    explanationEn: 'Correct! The repeat block runs moveForward() 3 times inside the brackets, then delivers aid.',
    explanationHi: 'शाबाश! लूप ने 3 बार आगे बढ़कर सुरक्षित स्थान पर मेडिकल सहायता पहुंचाई।'
  },
  {
    id: 2,
    titleEn: 'Mission 2: Smart Conditional Branching (इफ-एल्स शर्तें)',
    titleHi: 'मिशन 2: कंडीशन और डिसीजन मेकिंग (If-Else)',
    missionEn: 'Write the safety logic: If an obstacle is detected, turn left; otherwise keep moving.',
    missionHi: 'सेफ्टी लॉजिक बनाएं: अगर सामने रुकावट (Obstacle) आए तो बाईं ओर मुड़ें, वरना आगे बढ़ते रहें।',
    conceptEn: 'CONDITIONALS: Computers make smart choices using "if/else" logic based on live sensor data.',
    conceptHi: 'कंडीशनल्स (If/Else): कंप्यूटर और रोबोट सेंसर डेटा के आधार पर सही निर्णय (Decision) लेते हैं।',
    realWorldImpactEn: 'How automatic emergency brakes stop cars before an accident, and how UPI apps verify account balances!',
    realWorldImpactHi: 'यही तकनीक गाड़ियों में ऑटोमैटिक इमरजेंसी ब्रेक और UPI पेमेंट में बैलेंस चेक करने के काम आती है!',
    availableBlocks: ['drone.turnLeft();', 'if (radar.hasObstacle()) {', '} else {', 'drone.moveForward();', '}'],
    correctOrder: ['if (radar.hasObstacle()) {', 'drone.turnLeft();', '} else {', 'drone.moveForward();', '}'],
    explanationEn: 'Spot on! The robot evaluates the condition in real-time to avoid collisions.',
    explanationHi: 'बिल्कुल सही! रोबोट ने रुकावट देखकर तुरंत सुरक्षित रास्ता चुना।'
  },
  {
    id: 3,
    titleEn: 'Mission 3: Variable Calculation (वेरिएबल्स और मैथ)',
    titleHi: 'मिशन 3: वेरिएबल्स और पावर कैलकुलेशन (Variables)',
    missionEn: 'Calculate the drone battery power needed to safely return to base with rescued survivor.',
    missionHi: 'बेस तक सुरक्षित लौटने के लिए आवश्यक बैटरी पावर की गणना करने वाला कोड लिखें।',
    conceptEn: 'VARIABLES: Boxes in computer memory that hold numbers, names, or values that can change.',
    conceptHi: 'वेरिएबल्स (Variables): कंप्यूटर मेमोरी में ऐसे बक्से जो डेटा, स्कोर या पैसों की वैल्यू सुरक्षित रखते हैं।',
    realWorldImpactEn: 'Calculates bank balances, gaming health points, GPS ETA travel times, and rocket trajectories!',
    realWorldImpactHi: 'बैंक बैलेंस, गेम में हेल्थ, गूगल मैप्स में पहुंचने का समय सब वेरिएबल्स से तय होता है!',
    availableBlocks: ['return totalPower;', 'let returnDistance = 15;', 'let totalPower = returnDistance * 2;'],
    correctOrder: ['let returnDistance = 15;', 'let totalPower = returnDistance * 2;', 'return totalPower;'],
    explanationEn: 'Perfect! 15 km * 2 watts = 30 watts allocated. Drone returned safely!',
    explanationHi: 'अद्भुत! 15 किमी * 2 = 30 वाट बैटरी रिज़र्व की गई और ड्रोन सुरक्षित लौट आया!'
  }
];

export const CodingMiniGame: React.FC<CodingMiniGameProps> = ({ language, onComplete, onClose }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [totalScore, setTotalScore] = useState(0);

  const puzzle = PUZZLES[currentLevel];

  const handleAddBlock = (block: string) => {
    if (status === 'RUNNING' || status === 'SUCCESS') return;
    if (!selectedBlocks.includes(block)) {
      setSelectedBlocks([...selectedBlocks, block]);
      sound.playDash();
    }
  };

  const handleRemoveBlock = (index: number) => {
    if (status === 'RUNNING' || status === 'SUCCESS') return;
    const next = [...selectedBlocks];
    next.splice(index, 1);
    setSelectedBlocks(next);
  };

  const handleReset = () => {
    setSelectedBlocks([]);
    setStatus('IDLE');
    setTerminalOutput([]);
  };

  const handleRunCode = () => {
    if (selectedBlocks.length === 0) return;
    setStatus('RUNNING');
    setTerminalOutput(['[SYSTEM] Compiling instructions...', '[DRONE] Initializing navigation sensors...']);

    setTimeout(() => {
      const isCorrect =
        selectedBlocks.length === puzzle.correctOrder.length &&
        selectedBlocks.every((val, idx) => val === puzzle.correctOrder[idx]);

      if (isCorrect) {
        sound.playSuccess();
        setStatus('SUCCESS');
        setTotalScore((prev) => prev + 150);
        setTerminalOutput((prev) => [
          ...prev,
          '[EXECUTION SUCCESS] >> Output validated!',
          language === 'hi' ? puzzle.explanationHi : puzzle.explanationEn
        ]);
      } else {
        sound.playError();
        setStatus('ERROR');
        setTerminalOutput((prev) => [
          ...prev,
          '[SYNTAX ERROR] >> Sequence mismatch. Check block order and try again!',
          language === 'hi' ? 'क्रम सही नहीं है। कोड के क्रम को दोबारा जांचें।' : 'Wrong order. Inspect execution logic.'
        ]);
      }
    }, 800);
  };

  const handleNextLevel = () => {
    if (currentLevel < PUZZLES.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setSelectedBlocks([]);
      setStatus('IDLE');
      setTerminalOutput([]);
    } else {
      onComplete(totalScore + 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-cyan-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Lockup */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {language === 'hi' ? 'कोडिंग स्किल मॉड्यूल' : 'Coding Skill Module'}
                </span>
                <span className="text-xs text-slate-400">
                  Level {currentLevel + 1} / {PUZZLES.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white">
                {language === 'hi' ? puzzle.titleHi : puzzle.titleEn}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-400">{language === 'hi' ? 'कुल स्कोर' : 'Total Score'}</span>
              <span className="text-xl font-black text-amber-400 tabular-nums font-mono">{totalScore} XP</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Mission Objective */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <p className="text-sm sm:text-base font-semibold text-cyan-300">
              🎯 {language === 'hi' ? puzzle.missionHi : puzzle.missionEn}
            </p>
          </div>

          {/* Core Coding Concept Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>{language === 'hi' ? 'असली जिंदगी में काम आने वाला ज्ञान' : 'Real-Life Coding Concept'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'hi' ? puzzle.conceptHi : puzzle.conceptEn}
            </p>
            <div className="text-xs font-medium text-amber-300/90 pt-1">
              ✨ <strong>{language === 'hi' ? 'कहाँ काम आता है:' : 'Where it is used:'}</strong>{' '}
              {language === 'hi' ? puzzle.realWorldImpactHi : puzzle.realWorldImpactEn}
            </div>
          </div>

          {/* Interactive Workspace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Code Blocks Palette */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === 'hi' ? 'उपलब्ध कोड ब्लॉक्स (क्लिक करें)' : 'Available Code Blocks (Click to add)'}
              </span>
              <div className="space-y-2">
                {puzzle.availableBlocks.map((block) => {
                  const isUsed = selectedBlocks.includes(block);
                  return (
                    <button
                      key={block}
                      onClick={() => handleAddBlock(block)}
                      disabled={isUsed || status === 'SUCCESS'}
                      className={`w-full text-left font-mono text-sm px-4 py-2.5 rounded-lg border transition cursor-pointer ${
                        isUsed
                          ? 'bg-slate-950/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                          : 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border-slate-700 hover:border-cyan-400 active:scale-98 shadow-sm'
                      }`}
                    >
                      {block}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Execution Workspace */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {language === 'hi' ? 'आपका कोड सीक्वेंस' : 'Your Code Program'}
                </span>
                {selectedBlocks.length > 0 && status !== 'SUCCESS' && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {language === 'hi' ? 'रीसेट' : 'Clear'}
                  </button>
                )}
              </div>

              <div className="min-h-[140px] p-3 rounded-xl bg-slate-950 border-2 border-dashed border-slate-700 flex flex-col gap-1.5 font-mono text-sm">
                {selectedBlocks.length === 0 ? (
                  <div className="m-auto text-xs text-slate-500 italic text-center">
                    {language === 'hi'
                      ? 'बाईं तरफ से कोड ब्लॉक्स पर क्लिक करके जोड़ें...'
                      : 'Click blocks on the left to build your script...'}
                  </div>
                ) : (
                  selectedBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleRemoveBlock(idx)}
                      className="group flex items-center justify-between px-3 py-1.5 rounded bg-slate-800/90 border border-cyan-500/30 text-cyan-200 cursor-pointer hover:bg-rose-950/50 hover:border-rose-500/50 hover:text-rose-200 transition"
                      title={language === 'hi' ? 'हटाने के लिए क्लिक करें' : 'Click to remove'}
                    >
                      <span>
                        <span className="text-slate-500 text-xs mr-2">{idx + 1}</span>
                        {block}
                      </span>
                      <span className="text-xs text-slate-500 group-hover:text-rose-400">✕</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Terminal Output Console */}
          {terminalOutput.length > 0 && (
            <div className="p-3 rounded-lg bg-black/90 border border-slate-800 font-mono text-xs space-y-1">
              <div className="text-slate-500 flex items-center gap-1.5 text-[11px] pb-1 border-b border-slate-900">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>EXECUTION LOG</span>
              </div>
              {terminalOutput.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('SUCCESS')
                      ? 'text-emerald-400 font-semibold'
                      : log.includes('ERROR')
                      ? 'text-rose-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {language === 'hi'
              ? '💡 कोडिंग से समस्या निवारण (Problem Solving) की क्षमता बढ़ती है!'
              : '💡 Coding builds structured logical thinking & high-income skills!'}
          </div>

          <div className="flex items-center gap-3">
            {status !== 'SUCCESS' ? (
              <button
                onClick={handleRunCode}
                disabled={selectedBlocks.length === 0 || status === 'RUNNING'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                {status === 'RUNNING'
                  ? language === 'hi'
                    ? 'चल रहा है...'
                    : 'Running...'
                  : language === 'hi'
                  ? 'कोड चलाएं (Run Code)'
                  : 'Execute Code'}
              </button>
            ) : (
              <button
                onClick={handleNextLevel}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-98 transition cursor-pointer"
              >
                {currentLevel < PUZZLES.length - 1 ? (
                  <>
                    <span>{language === 'hi' ? 'अगला मिशन' : 'Next Mission'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>{language === 'hi' ? 'स्किल रिवॉर्ड क्लेम करें' : 'Claim Master Certificate'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
