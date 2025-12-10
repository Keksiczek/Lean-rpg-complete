/**
 * API type definitions
 */

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'operator' | 'ci' | 'admin';
  totalXp: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  type: string;
  baseXp: number;
  briefText?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  leanConcept?: string;
  isActive: boolean;
  areaId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Submission {
  id: number;
  userId: number;
  questId: number;
  content: string;
  status: 'pending_review' | 'queued' | 'analyzing' | 'evaluated' | 'failed';
  textInput?: string;
  imageUrl?: string;
  aiFeedback?: string;
  aiScore5s?: string; // JSON string of 5S scores
  aiRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  xpGain?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Area {
  id: number;
  name: string;
  description?: string;
}

export interface UserQuest {
  id: number;
  userId: number;
  questId: number;
  status: string;
  assignedAt: string;
  completedAt?: string;
  quest?: Quest;
  user?: User;
}
