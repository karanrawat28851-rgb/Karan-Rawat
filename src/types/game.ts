export type Language = 'hi' | 'en';

export type SkillCategory = 'MEDICAL_CPR' | 'FIRE_SAFETY' | 'CYBER_DEFENSE' | 'SURVIVAL_ENGINEERING' | 'DISASTER_PREPAREDNESS';

export interface SkillProgress {
  id: SkillCategory;
  titleEn: string;
  titleHi: string;
  unlocked: boolean;
  score: number;
  realWorldTipEn: string;
  realWorldTipHi: string;
  actionableStepsEn: string[];
  actionableStepsHi: string[];
}

export type GameStatus =
  | 'TITLE'
  | 'PLAYING'
  | 'MINI_CODING'
  | 'MINI_FINANCE'
  | 'MINI_LANGUAGE'
  | 'MINI_CPR'
  | 'MINI_FIRE'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAMEOVER'
  | 'HANDBOOK';

export type StationType =
  | 'CODING_LAB'
  | 'FINANCE_VAULT'
  | 'LANGUAGE_TOWER'
  | 'CPR_STATION'
  | 'FIRE_HAZARD'
  | 'AIRDROP_CRATE';

export interface InteractiveStation {
  id: string;
  type: StationType;
  position: [number, number, number];
  titleEn: string;
  titleHi: string;
  badgeEn: string;
  badgeHi: string;
  completed: boolean;
  score: number;
  hintEn: string;
  hintHi: string;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  score: number;
  coins: number;
  level: number;
  skillsLearnedCount: number;
  activeZoneRadius: number;
}

export interface MasteredSkillCard {
  id: string;
  category: 'CODING' | 'FINANCE' | 'LANGUAGE' | 'FIRST_AID' | 'FIRE_SAFETY';
  titleEn: string;
  titleHi: string;
  takeawayEn: string;
  takeawayHi: string;
  realWorldActionEn: string[];
  realWorldActionHi: string[];
  icon: string;
  masteryPercent: number;
}
