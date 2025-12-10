import type { Submission } from '@/types/api';

export type SubmissionStatus = Submission['status'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export async function createSubmission(data: {
  questId: number;
  content: string;
  imageUrl?: string;
}): Promise<Response> {
  return fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });
}

export async function fetchSubmission(submissionId: number): Promise<Submission> {
  const response = await fetch(`${API_BASE}/submissions/${submissionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch submission: ${response.statusText}`);
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<{
  id: string;
  state: string;
  progress: number;
  attempts: number;
  maxAttempts: number;
  data: any;
  result: any;
  error: string | null;
  createdAt: string;
}> {
  const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch job status: ${response.statusText}`);
  }

  return response.json();
}
