import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { Player, ActionTask, LeaderboardEntry, Notification, SubmissionResponse, ActivityLog } from '../types';
import { LEVEL_THRESHOLDS } from '../constants';

// --- MOCK DATA FOR OFFLINE MODE (Fallback) ---
const MOCK_PLAYER: Player = {
  id: 1, 
  email: 'operator@magna.com',
  username: 'CI Operator (Offline)',
  role: 'operator',
  tenantId: 'magna',
  level: 3,
  totalXp: 3250,
  currentXp: 3250,
  nextLevelXp: 4500,
  gamesCompleted: 12,
  totalScore: 8450,
  createdAt: new Date().toISOString(),
  achievements: [
    { id: 'first_steps', title: 'First Steps', description: 'Complete your first training module.', icon: 'Footprints', unlockedAt: '2023-01-01' }
  ],
  recentActivity: []
};

// --- Mappers ---

const mapUserToPlayer = (user: any): Player => {
  const { level, nextLevelXp } = calculateLevel(user.totalXp || 0);
  return {
    ...user,
    id: user.id || 0,
    level,
    currentXp: user.totalXp || 0,
    nextLevelXp,
    gamesCompleted: user.submissions?.length || user.gamesCompleted || 0,
    totalScore: user.totalScore || 0,
    achievements: user.achievements || [],
    recentActivity: (user.submissions || []).map((sub: any) => ({
      id: sub.id.toString(),
      game: sub.questId,
      score: sub.score,
      xp: sub.xpGain,
      date: sub.createdAt
    }))
  };
};

const calculateLevel = (totalXp: number) => {
  let level = 1;
  let nextLevelXp = LEVEL_THRESHOLDS[1];
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      nextLevelXp = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i] * 1.5;
    } else {
      break;
    }
  }
  return { level, nextLevelXp };
};

// --- Service ---

export const gameService = {
  // --- User & Profile ---
  fetchPlayerProfile: async (): Promise<Player> => {
    try {
      const userData = await apiClient.get<any>(ENDPOINTS.USERS.ME);
      return mapUserToPlayer(userData);
    } catch (e) {
      console.warn("Backend unavailable, using mock profile");
      return MOCK_PLAYER; 
    }
  },

  getMockPlayer: (): Player => {
    return MOCK_PLAYER;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      return await apiClient.get<LeaderboardEntry[]>(ENDPOINTS.GAMIFICATION.LEADERBOARD);
    } catch (e) {
      console.warn("Leaderboard fetch failed, using mock data");
      return [
        { id: 101, username: 'KaizenKing', level: 5, totalXp: 9500, totalScore: 25000, rank: 1 },
        { id: 102, username: '5S_Ninja', level: 4, totalXp: 6200, totalScore: 18000, rank: 2 },
      ];
    }
  },

  // --- Submissions (Real Game Logic) ---

  saveAuditResult: async (sceneId: string, score: number, xpEarned: number, auditData: any, userId: number): Promise<SubmissionResponse> => {
    const payload = {
      questId: 'audit-sim',
      userId,
      content: JSON.stringify({ sceneId, auditData }), // Stores detailed results
      aiScore5s: score.toString(), // Stores the main score for leaderboards
      status: 'evaluated'
    };
    try {
      return await apiClient.post<SubmissionResponse>(ENDPOINTS.SUBMISSIONS.BASE, payload);
    } catch (e) {
      console.warn("Offline submission", e);
      return { id: 0, xpGain: xpEarned, score, status: 'offline_saved' };
    }
  },

  saveLPAResult: async (auditId: string, score: number, xpEarned: number, answers: any, userId: number): Promise<SubmissionResponse> => {
    const payload = {
      questId: 'lpa-sim',
      userId,
      content: JSON.stringify({ auditId, answers }),
      status: 'evaluated'
    };
    try {
      return await apiClient.post<SubmissionResponse>(ENDPOINTS.SUBMISSIONS.BASE, payload);
    } catch (e) {
      console.warn("Offline submission", e);
      return { id: 0, xpGain: xpEarned, score, status: 'offline_saved' };
    }
  },

  saveIshikawaResult: async (problemId: string, score: number, xpEarned: number, causes: any[], solutions: any[], userId: number): Promise<SubmissionResponse> => {
    const payload = {
      questId: 'ishikawa-sim',
      userId,
      content: JSON.stringify({ problemId, causes, solutions }),
      status: 'evaluated'
    };
    try {
      return await apiClient.post<SubmissionResponse>(ENDPOINTS.SUBMISSIONS.BASE, payload);
    } catch (e) {
      console.warn("Offline submission", e);
      return { id: 0, xpGain: xpEarned, score, status: 'offline_saved' };
    }
  },

  // --- Task Management (Placeholder until /api/tasks is ready) ---
  
  getTasks: async (): Promise<ActionTask[]> => {
    // Ideally: return await apiClient.get<ActionTask[]>('/api/tasks');
    return new Promise((resolve) => {
        setTimeout(() => resolve([]), 300);
    });
  },

  createTask: async (task: Omit<ActionTask, 'id' | 'createdAt'>): Promise<ActionTask> => {
    // Ideally: return await apiClient.post<ActionTask>('/api/tasks', task);
    const newTask: ActionTask = {
        ...task,
        id: `t${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    return newTask;
  },

  updateTask: async (taskId: string, updates: Partial<ActionTask>): Promise<ActionTask> => {
    // Ideally: return await apiClient.put<ActionTask>(`/api/tasks/${taskId}`, updates);
    return { id: taskId, ...updates } as ActionTask;
  },

  // --- Notifications ---

  getNotifications: async (): Promise<Notification[]> => {
    try {
      return await apiClient.get<Notification[]>(ENDPOINTS.NOTIFICATIONS.BASE);
    } catch (e) {
      console.warn("Failed to fetch notifications", e);
      return [];
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    try {
      await apiClient.put(ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', id), {});
    } catch (e) {
      console.error("Failed to mark notification read", e);
    }
  },

  markAllNotificationsRead: async (): Promise<void> => {
    try {
      await apiClient.put(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {});
    } catch (e) {
      console.error("Failed to mark all notifications read", e);
    }
  }
};