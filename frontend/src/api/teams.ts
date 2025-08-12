import api from '@/utils/api';

export async function getTeams() {
  const res = await api.get('/teams');
  return res.data.data ?? res.data;
}