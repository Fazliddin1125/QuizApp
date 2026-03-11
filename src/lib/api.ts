const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken(): string | null {
  return localStorage.getItem('adminToken');
}

export const api = {
  async request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = { 'Content-Type': 'application/json', ...opts.headers };
    const token = getToken();
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || res.statusText || 'Xato');
    return data as T;
  },
  get: <T>(path: string) => api.request<T>(path),
  post: <T>(path: string, body: unknown) =>
    api.request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    api.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => api.request<T>(path, { method: 'DELETE' }),
};

export const uploadImage = async (file: File): Promise<{ url: string }> => {
  const token = getToken();
  if (!token) throw new Error('Kirish kerak');
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${BASE}/api/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Yuklash xato');
  return data;
};
