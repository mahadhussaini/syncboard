import api from '@/utils/api';

export interface AIRequestPayload {
  prompt: string;
}

export interface TaskSuggestionPayload {
  context: string;
}

export interface MeetingSummaryPayload {
  transcript: string;
}

export interface TimelinePayload {
  goals: string;
}

export interface CodeReviewPayload {
  code: string;
}

export async function aiRequest(workspaceId: string, payload: AIRequestPayload) {
  const res = await api.post(`/ai/workspace/${workspaceId}/request`, payload);
  return res.data.data ?? res.data;
}

export async function suggestTasks(workspaceId: string, payload: TaskSuggestionPayload) {
  const res = await api.post(`/ai/workspace/${workspaceId}/suggest-tasks`, payload);
  return res.data.data ?? res.data;
}

export async function summarizeMeeting(workspaceId: string, payload: MeetingSummaryPayload) {
  const res = await api.post(`/ai/workspace/${workspaceId}/summarize-meeting`, payload);
  return res.data.data ?? res.data;
}

export async function generateTimeline(workspaceId: string, payload: TimelinePayload) {
  const res = await api.post(`/ai/workspace/${workspaceId}/generate-timeline`, payload);
  return res.data.data ?? res.data;
}

export async function reviewCode(workspaceId: string, payload: CodeReviewPayload) {
  const res = await api.post(`/ai/workspace/${workspaceId}/review-code`, payload);
  return res.data.data ?? res.data;
}

export async function getAIHistory(workspaceId: string) {
  const res = await api.get(`/ai/workspace/${workspaceId}/history`);
  return res.data.data ?? res.data;
}