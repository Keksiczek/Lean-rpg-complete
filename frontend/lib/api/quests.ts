import type { Quest } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export async function fetchQuest(questId: number): Promise<Quest | null> {
  const response = await fetch(`${API_BASE}/quests/${questId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch quest: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchQuests(filters?: {
  isActive?: boolean;
  areaId?: number;
}): Promise<Quest[]> {
  const params = new URLSearchParams();
  if (filters?.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }
  if (filters?.areaId) {
    params.append('areaId', String(filters.areaId));
  }

  const response = await fetch(`${API_BASE}/quests?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch quests: ${response.statusText}`);
  }

  return response.json();
}
