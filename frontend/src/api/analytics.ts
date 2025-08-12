import api from '@/utils/api';

export async function getWorkspaceStats(workspaceId: string, days = 30) {
  const res = await api.get(`/analytics/workspace/${workspaceId}/stats`, { params: { days } });
  return res.data.data ?? res.data;
}

export async function getWorkspaceTrends(workspaceId: string, days = 30) {
  const res = await api.get(`/analytics/workspace/${workspaceId}/trends`, { params: { days } });
  return res.data.data ?? res.data;
}

export async function getUserStats(days = 30) {
  const res = await api.get(`/analytics/user/stats`, { params: { days } });
  return res.data.data ?? res.data;
}

export async function getTeamStats(teamId: string, days = 30) {
  const res = await api.get(`/analytics/team/${teamId}/stats`, { params: { days } });
  return res.data.data ?? res.data;
}

export async function trackEvent(payload: { type: string; workspaceId?: string; boardId?: string; itemId?: string; metadata?: any }) {
  const res = await api.post(`/analytics/events`, payload);
  return res.data.data ?? res.data;
}