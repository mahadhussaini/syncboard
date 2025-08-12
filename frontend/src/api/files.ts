import api from '@/utils/api';

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export async function getItemAttachments(itemId: string): Promise<Attachment[]> {
  const res = await api.get(`/files/items/${itemId}`);
  return res.data.data ?? res.data;
}

export async function uploadAttachment(itemId: string, file: File): Promise<Attachment> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/files/items/${itemId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data ?? res.data;
}

export async function deleteAttachment(attachmentId: string): Promise<{ success: boolean }> {
  const res = await api.delete(`/files/attachments/${attachmentId}`);
  return res.data.data ?? res.data;
}