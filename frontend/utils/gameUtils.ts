import { LEVEL_THRESHOLDS, AVAILABLE_ACHIEVEMENTS } from '../constants';
import { Player, Achievement } from '../types';

export const calculateLevel = (totalXp: number): { level: number; nextLevelXp: number } => {
  let level = 1;
  let nextLevelXp = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      nextLevelXp = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i] * 1.5; // Fallback for high levels
    } else {
      break;
    }
  }
  return { level, nextLevelXp };
};

export const checkForNewAchievements = (
  updatedPlayer: Player,
  lastGameScore: number,
  lastGameType: string
): Achievement[] => {
  const newAchievements: Achievement[] = [];
  const existingIds = new Set(updatedPlayer.achievements.map(a => a.id));

  // Helper to add achievement
  const unlock = (id: string) => {
    if (!existingIds.has(id)) {
      const template = AVAILABLE_ACHIEVEMENTS.find(a => a.id === id);
      if (template) {
        newAchievements.push({ ...template, unlockedAt: new Date().toISOString() });
        existingIds.add(id);
      }
    }
  };

  // 1. Check: First Steps (1 game completed)
  if (updatedPlayer.gamesCompleted >= 1) {
    unlock('first_steps');
  }

  // 2. Check: Consistency (5 games)
  if (updatedPlayer.gamesCompleted >= 5) {
    unlock('consistency');
  }

  // 3. Check: Level 2
  if (updatedPlayer.level >= 2) {
    unlock('lean_enthusiast');
  }

  // 4. Check: Level 5
  if (updatedPlayer.level >= 5) {
    unlock('master_mind');
  }

  // 5. Check: Junior Auditor (Perfect Audit)
  if (lastGameType.includes('Audit') && lastGameScore === 100) {
    unlock('junior_auditor');
  }

  // 6. Check: Problem Solver (Ishikawa)
  if (lastGameType.includes('Ishikawa')) {
    unlock('problem_solver');
  }

  return newAchievements;
};