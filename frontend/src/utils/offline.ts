import api from '@/utils/api';

export type QueuedRequest = {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: any;
  headers?: Record<string, string>;
  createdAt: number;
};

const STORAGE_KEY = 'syncboard:offlineQueue';

function loadQueue(): QueuedRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function queueRequest(req: Omit<QueuedRequest, 'id' | 'createdAt'>) {
  const queue = loadQueue();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  queue.push({ id, createdAt: Date.now(), ...req });
  saveQueue(queue);
}

export async function flushQueue(): Promise<void> {
  const queue = loadQueue();
  if (queue.length === 0) return;

  const remaining: QueuedRequest[] = [];
  for (const item of queue) {
    try {
      await api.request({
        method: item.method,
        url: item.url,
        data: item.body,
        headers: { ...(item.headers || {}), 'x-idempotency-key': item.id },
      });
    } catch (err) {
      // Keep it for later if still offline or request failed (e.g., server down)
      remaining.push(item);
    }
  }
  saveQueue(remaining);
}

export function setupOfflineSync() {
  // Attempt flush on start and when back online
  window.addEventListener('online', () => {
    void flushQueue();
  });
  void flushQueue();
}