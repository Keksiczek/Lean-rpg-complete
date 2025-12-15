const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export async function uploadFile(
  file: File,
  options?: {
    folder?: string;
    maxSize?: number;
  }
): Promise<string> {
  if (options?.maxSize && file.size > options.maxSize) {
    throw new Error(
      `File size exceeds limit: ${file.size} > ${options.maxSize}`
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  if (options?.folder) {
    formData.append('folder', options.folder);
  }

  const response = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}
