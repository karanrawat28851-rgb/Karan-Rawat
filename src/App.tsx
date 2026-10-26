import React, { useEffect, useRef, useState } from 'react';
import { SurvivalGameWorld } from './game/threeScene';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { CodingMiniGame } from './components/CodingMiniGame';
import { FinanceMiniGame } from './components/FinanceMiniGame';
import { LanguageMiniGame } from './components/LanguageMiniGame';
import { CprMiniGame } from './components/CprMiniGame';
import { FireSafetyMiniGame } from './components/FireSafetyMiniGame';
import { AirdropLootModal } from './components/AirdropLootModal';
import { LifeSkillHandbookModal } from './components/LifeSkillHandbookModal';
import { sound } from './audio/soundEngine';
import { GameStatus, InteractiveStation, Language, MasteredSkillCard, PlayerStats } from './types/game';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<SurvivalGameWorld | null>(null);

  const [language, setLanguage] = useState<Language>('hi');
  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [nearestStation, setNearestStation] = useState<InteractiveStation | null>(null);
  const [activeModalStation, setActiveModalStation] = useState<string | null>(null);

  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    score: 0,
    coins: 50,
    level: 1,
    skillsLearnedCount: 0,
    activeZoneRadius: 88,
  });

  const [masteredSkills, setMasteredSkills] = useState<MasteredSkillCard[]>([
    {
      id: 'cpr',
      category: 'FIRST_AID',
      titleEn: 'Hands-Only CPR & AED Defibrillation',
      titleHi: 'हैंड्स-ओनली CPR एवं हृदय सुरक्षा',
      takeawayEn: '100-120 BPM compressions in center of chest, 2 inches deep.',
      takeawayHi: 'छाती के केंद्र में 100-120 BPM गति से 2 इंच गहरा दबाव डालें।',
      realWorldActionEn: ['Call 112/108 immediately', 'Push hard & fast to rhythm', 'Apply AED pads'],
      realWorldActionHi: ['तुरंत 112/108 डायल करें', 'बिना रुके तेज गति से दबाएं', 'AED पैड्स लगाएं'],
      icon: 'Heart',
      masteryPercent: 0,
    },
    {
      id: 'finance',
      category: 'FINANCE',
      titleEn: '50/30/20 Wealth & Compound Growth',
      titleHi: '50/30/20 वित्तीय नियम एवं चक्रवृद्धि ब्याज',
      takeawayEn: '50% Needs, 30% Wants, 20% Investments & Emergency Fund.',
      takeawayHi: '50% जरूरतें, 30% इच्छाएं, 20% बचत व निवेश।',
      realWorldActionEn: ['Never enter UPI PIN to receive money', 'Invest in SIP early', 'Keep 6 mo emergency fund'],
      realWorldActionHi: ['पैसे प्राप्त करने के लिए कभी UPI पिन न डालें', 'जल्दी SIP शुरू करें', 'इमरजेंसी फंड रखें'],
      icon: 'DollarSign',
      masteryPercent: 0,
    },
    {
      id: 'coding',
      category: 'CODING',
      titleEn: 'Algorithmic Thinking & Automation Logic',
      titleHi: 'कोडिंग लॉजिक, लूप्स और कंडीशनल्स',
      takeawayEn: 'Loops automate repetitive tasks; Conditionals enable smart decisions.',
      takeawayHi: 'लूप्स से काम ऑटोमैटिक होता है और If/Else से सही फैसले लिए जाते हैं।',
      realWorldActionEn: ['Break big problems into steps', 'Test edge conditions', 'Automate workflows'],
      realWorldActionHi: ['समस्याओं को छोटे चरणों में बांटें', 'लॉजिक टेस्ट करें', 'ऑटोमेशन सीखें'],
      icon: 'Terminal',
      masteryPercent: 0,
    },
    {
      id: 'fire',
      category: 'FIRE_SAFETY',
      titleEn: 'P.A.S.S. Extinguisher & Smoke Survival',
      titleHi: 'P.A.S.S. अग्निशामक एवं धुआं बचाव',
      takeawayEn: 'Pull pin, Aim low, Squeeze lever, Sweep side to side. Crawl under smoke.',
      takeawayHi: 'पिन खींचें, बेस पर निशाना, लीवर दबाएं, दाएं-बाएं घुमाएं। फर्श पर झुककर रेंगें।',
      realWorldActionEn: ['Never throw water on electrical fires', 'Use CO2 extinguisher', 'Avoid elevators'],
      realWorldActionHi: ['बिजली की आग पर पानी न डालें', 'CO2 का उपयोग करें', 'लिफ्ट से बचें'],
      icon: 'Flame',
      masteryPercent: 0,
    },
  ]);

  // Mount Three.js World
  useEffect(() => {
    if (!mountRef.current) return;

    const world = new SurvivalGameWorld(mountRef.current, {
      onNearStation: (station) => {
        setNearestStation(station);
      },
      onUpdateStats: (healthDelta, zoneRadius) => {
        setStats((prev) => {
          let newHp = prev.health + healthDelta;
          if (newHp < 10) newHp = 10; // Prevent instant death so player can explore
          return {
            ...prev,
            health: newHp,
            activeZoneRadius: zoneRadius,
          };
        });
      },
    });

    worldRef.current = world;

    return () => {
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (gameStatus === 'TITLE') {
          handleStartGame();
        }
      }
      if (e.key.toLowerCase() === 'e') {
        if (gameStatus === 'PLAYING' && nearestStation) {
          handleOpenStation(nearestStation.type);
        }
      }
      if (e.key === 'Escape') {
        if (gameStatus.startsWith('MINI_') || gameStatus === 'HANDBOOK') {
          setGameStatus('PLAYING');
          setActiveModalStation(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, nearestStation]);

  const handleStartGame = () => {
    sound.playSuccess();
    setGameStatus('PLAYING');
    if (worldRef.current) {
      worldRef.current.isTitleScreen = false;
      worldRef.current.isPaused = false;
    }
  };

  const handleToggleLanguage = () => {
    sound.playScannerPing();
    setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const handleTriggerScanner = () => {
    sound.playScannerPing();
    if (worldRef.current) {
      worldRef.current.triggerScannerPulse();
    }
  };

  const handleTeleportToStation = (type: string) => {
    sound.playDash();
    if (worldRef.current) {
      worldRef.current.teleportToStation(type);
    }
  };

  const handleOpenStation = (stationType: string) => {
    sound.playCrateOpen();
    setActiveModalStation(stationType);

    switch (stationType) {
      case 'CODING_LAB':
        setGameStatus('MINI_CODING');
        break;
      case 'FINANCE_VAULT':
        setGameStatus('MINI_FINANCE');
        break;
      case 'LANGUAGE_TOWER':
        setGameStatus('MINI_LANGUAGE');
        break;
      case 'CPR_STATION':
        setGameStatus('MINI_CPR');
        break;
      case 'FIRE_HAZARD':
        setGameStatus('MINI_FIRE');
        break;
      case 'AIRDROP_CRATE':
        setGameStatus('MINI_CODING'); // Or airdrop modal
        break;
      default:
        setGameStatus('PLAYING');
    }

    if (worldRef.current) {
      worldRef.current.isPaused = true;
    }
  };

  const handleCloseModal = () => {
    setGameStatus('PLAYING');
    setActiveModalStation(null);
    if (worldRef.current) {
      worldRef.current.isPaused = false;
    }
  };

  const handleSkillCompleted = (skillType: string, pointsGained: number) => {
    sound.playVictory();
    setStats((prev) => ({
      ...prev,
      score: prev.score + pointsGained,
      level: Math.floor((prev.score + pointsGained) / 200) + 1,
      skillsLearnedCount: Math.min(5, prev.skillsLearnedCount + 1),
      health: prev.maxHealth, // Restores full health on skill completion!
    }));

    if (worldRef.current && nearestStation) {
      worldRef.current.markStationCompleted(nearestStation.id, pointsGained);
    }

    handleCloseModal();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Title Screen Overlay */}
      {gameStatus === 'TITLE' && (
        <TitleScreen
          language={language}
          onStart={handleStartGame}
          onToggleLanguage={handleToggleLanguage}
          onOpenHandbook={() => setGameStatus('HANDBOOK')}
        />
      )}

      {/* Main In-Game Tactical HUD */}
      {gameStatus === 'PLAYING' && (
        <GameHUD
          stats={stats}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onOpenStation={handleOpenStation}
          onOpenHandbook={() => setGameStatus('HANDBOOK')}
          onTriggerScanner={handleTriggerScanner}
          nearestStation={nearestStation}
          onTeleportToStation={handleTeleportToStation}
        />
      )}

      {/* Mini-Games & Modals */}
      {gameStatus === 'MINI_CODING' && activeModalStation === 'CODING_LAB' && (
        <CodingMiniGame
          language={language}
          onComplete={(score) => handleSkillCompleted('CODING', score)}
          onClose={handleCloseModal}
        />
      )}

      {gameStatus === 'MINI_FINANCE' && (
        <FinanceMiniGame
          language={language}
          onComplete={(score) => handleSkillCompleted('FINANCE', score)}
          onClose={handleCloseModal}
        />
      )}

      {gameStatus === 'MINI_LANGUAGE' && (
        <LanguageMiniGame
          language={language}
          onComplete={(score) => handleSkillCompleted('LANGUAGE', score)}
          onClose={handleCloseModal}
        />
      )}

      {gameStatus === 'MINI_CPR' && (
        <CprMiniGame
          language={language}
          onComplete={(score) => handleSkillCompleted('CPR', score)}
          onClose={handleCloseModal}
        />
      )}

      {gameStatus === 'MINI_FIRE' && (
        <FireSafetyMiniGame
          language={language}
          onComplete={(score) => handleSkillCompleted('FIRE', score)}
          onClose={handleCloseModal}
        />
      )}

      {activeModalStation === 'AIRDROP_CRATE' && (
        <AirdropLootModal
          language={language}
          onComplete={(score) => handleSkillCompleted('AIRDROP', score)}
          onClose={handleCloseModal}
        />
      )}

      {gameStatus === 'HANDBOOK' && (
        <LifeSkillHandbookModal
          language={language}
          skills={masteredSkills}
          playerScore={stats.score}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
