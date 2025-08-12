import api from '@/utils/api';

export async function getWorkspaceBoards(workspaceId: string) {
  const res = await api.get(`/boards/workspace/${workspaceId}`);
  return res.data.data ?? res.data;
}

export async function createBoard(workspaceId: string, payload: { name: string; description?: string }) {
  const res = await api.post(`/boards/workspace/${workspaceId}`, payload);
  return res.data.data ?? res.data;
}

export async function getBoard(boardId: string) {
  const res = await api.get(`/boards/${boardId}`);
  return res.data.data ?? res.data;
}

export async function updateBoard(boardId: string, payload: { name?: string; description?: string }) {
  const res = await api.put(`/boards/${boardId}`, payload);
  return res.data.data ?? res.data;
}

export async function deleteBoard(boardId: string) {
  const res = await api.delete(`/boards/${boardId}`);
  return res.data.data ?? res.data;
}

export async function createColumn(boardId: string, payload: { name: string; order: number }) {
  const res = await api.post(`/boards/${boardId}/columns`, payload);
  return res.data.data ?? res.data;
}

export async function updateColumn(columnId: string, payload: { name?: string; order?: number }) {
  const res = await api.put(`/boards/columns/${columnId}`, payload);
  return res.data.data ?? res.data;
}

export async function deleteColumn(columnId: string) {
  const res = await api.delete(`/boards/columns/${columnId}`);
  return res.data.data ?? res.data;
}

export async function createItem(payload: { columnId: string; title: string; description?: string; type?: string; assigneeId?: string; priority?: string; dueDate?: string | null; tags?: string[]; }) {
  const res = await api.post(`/boards/items`, payload);
  return res.data.data ?? res.data;
}

export async function updateItem(itemId: string, payload: Partial<{ title: string; description: string | null; type: string; assigneeId: string | null; priority: string; dueDate: string | null; tags: string[]; }>) {
  const res = await api.put(`/boards/items/${itemId}`, payload);
  return res.data.data ?? res.data;
}

export async function deleteItem(itemId: string) {
  const res = await api.delete(`/boards/items/${itemId}`);
  return res.data.data ?? res.data;
}

export async function moveItem(itemId: string, newColumnId: string) {
  const res = await api.post(`/boards/items/${itemId}/move`, { newColumnId });
  return res.data.data ?? res.data;
}