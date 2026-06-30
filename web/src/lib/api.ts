import type { DataResponse, MetaResponse } from '@/types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const api = {
  getData: () => request<DataResponse>('/data'),
  getMeta: () => request<MetaResponse>('/meta'),
  startScan: () =>
    request<{ jobId: string; status: string; reused?: boolean }>('/scan', { method: 'POST' }),
};
