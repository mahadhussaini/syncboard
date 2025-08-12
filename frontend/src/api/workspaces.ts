import api from '@/utils/api';

export async function getUserWorkspaces() {
  const res = await api.get('/workspaces');
  return res.data.data ?? res.data;
}

export async function getWorkspace(id: string) {
  const res = await api.get(`/workspaces/${id}`);
  return res.data.data ?? res.data;
}

export async function createWorkspace(payload: { name: string; description?: string; type: string; teamId: string; template?: string }) {
  const res = await api.post('/workspaces', payload);
  return res.data.data ?? res.data;
}